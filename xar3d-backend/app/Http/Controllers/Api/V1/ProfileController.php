<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function show(Request $request)
    {
        $user = $request->user();
        $profile = $user->creatorProfile;

        return response()->json([
            'data' => [
                'id'            => $user->id,
                'name'          => $user->name,
                'username'      => $user->username,
                'username_changes_count' => $user->username_changes_count,
                'last_username_change_at' => $user->last_username_change_at,
                'email'         => $user->email,
                'role'          => $user->role,
                'is_verified'   => (bool) $user->is_verified,
                'balance'       => (float) $user->balance,
                'avatar_url'    => $user->avatar_url ?? $profile?->avatar_url,
                'bio'           => $profile?->bio,
                'portfolio_url' => $profile?->portfolio_url,
                'created_at'    => $user->created_at,
            ]
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        $request->validate([
            'username' => 'sometimes|string|max:50|unique:users,username,' . $request->user()->id,
            'bio' => 'sometimes|nullable|string|max:1000',
            'portfolio_url' => 'sometimes|nullable|url|max:255',
            'avatar' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        // Update username with limit and cooldown
        if ($request->has('username') && $request->username !== $user->username) {
            if ($user->username_changes_count >= 2) {
                return response()->json(['message' => 'Batas perubahan nama unik maksimal 2 kali telah tercapai.'], 422);
            }
            if ($user->last_username_change_at && now()->diffInDays($user->last_username_change_at) < 7) {
                return response()->json(['message' => 'Anda harus menunggu 7 hari sebelum bisa mengubah nama unik lagi.'], 422);
            }

            $user->username = strip_tags($request->username);
            $user->username_changes_count += 1;
            $user->last_username_change_at = now();
            $user->save();
        }

        // Handle avatar upload
        $avatarUrl = null;
        if ($request->hasFile('avatar')) {
            if ($user->avatar_url) {
                $oldPath = str_replace('/storage/', '', $user->avatar_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $avatarUrl = Storage::url($path);
            $user->update(['avatar_url' => $avatarUrl]);
        }

        // Update or create creator profile
        $profileData = array_filter([
            'bio' => $request->bio,
            'portfolio_url' => $request->portfolio_url,
        ], fn($v) => $v !== null);

        if (!empty($profileData)) {
            $user->creatorProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );
        }

        $user->refresh();
        $profile = $user->creatorProfile;

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'avatar_url' => $user->avatar_url ?? $profile?->avatar_url,
                'bio' => $profile?->bio,
                'portfolio_url' => $profile?->portfolio_url,
            ]
        ]);
    }
    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }
    /**
     * Upgrade user to creator role.
     */
    public function upgradeToCreator(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'creator' || $user->role === 'admin') {
            return response()->json(['message' => 'Already a creator'], 400);
        }

        $request->validate([
            'bio' => 'nullable|string|max:1000',
            'portfolio_url' => 'nullable|url|max:255',
            'software_skills' => 'nullable|array',
            'specializations' => 'nullable|array',
            'social_links' => 'nullable|array',
        ]);

        $user->update(['role' => 'creator']);

        $user->creatorProfile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'bio' => $request->bio,
                'portfolio_url' => $request->portfolio_url,
                'software_skills' => $request->software_skills,
                'specializations' => $request->specializations,
                'social_links' => $request->social_links,
            ]
        );

        return response()->json([
            'message' => 'Successfully upgraded to creator',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * Get user's downloaded/purchased assets.
     */
    public function myDownloads(Request $request)
    {
        $downloads = \App\Models\Download::with(['asset.category', 'asset.user', 'refundRequest'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(12);

        return response()->json($downloads);
    }

    /**
     * Simulasikan Top-Up Saldo untuk User
     */
    public function topup(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10000|max:10000000',
        ]);

        $user = $request->user();
        $user->increment('balance', $request->amount);

        \App\Models\Notification::topupReceived($user->id, $request->amount);

        return response()->json([
            'message' => 'Top-Up berhasil! Saldo telah ditambahkan.',
            'balance' => $user->fresh()->balance
        ]);
    }
}
