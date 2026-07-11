<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Asset;
use App\Models\Notification;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function __construct()
    {
        // Auth check must be done after Sanctum resolves the user, not in constructor
        // which runs before middleware. Use middleware registration on routes instead.
        // The role check is still done here as a second guard layer.
    }

    /**
     * Enforce admin-only access (called at start of each method).
     */
    private function ensureAdmin(): void
    {
        $user = request()->user();
        if (!$user || $user->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
    }

    /**
     * Get system statistics for admin dashboard overview.
     */
    public function getStats()
    {
        $this->ensureAdmin();
        $totalUsers    = \App\Models\User::count();
        $bannedUsers = \App\Models\User::where('is_banned', true)->count();
        
        $totalAssets = Asset::where('is_published', true)->count();
        $pendingAssets = Asset::where('is_published', false)->count();

        $totalDownloads = Asset::sum('download_count');

        return response()->json([
            'total_users' => $totalUsers,
            'banned_users' => $bannedUsers,
            'total_assets' => $totalAssets,
            'pending_assets' => $pendingAssets,
            'total_downloads' => (int) $totalDownloads
        ]);
    }

    /**
     * Get pending assets that need approval.
     */
    public function pendingAssets()
    {
        $this->ensureAdmin();
        $assets = Asset::with(['category:id,name,slug', 'user:id,name,email'])
            ->where('is_published', false)
            ->latest()
            ->paginate(20);

        return response()->json($assets);
    }

    /**
     * Approve an asset (publish it).
     */
    public function approveAsset(Asset $asset)
    {
        $this->ensureAdmin();
        $asset->update(['is_published' => true]);

        // Notify creator
        Notification::assetApproved($asset->user_id, $asset->title);

        return response()->json(['message' => 'Asset successfully approved and published.']);
    }

    /**
     * Reject an asset (delete it or mark as rejected).
     * For now, we'll just delete it.
     */
    public function rejectAsset(Asset $asset)
    {
        $title = $asset->title; // Save title before delete
        $userId = $asset->user_id;

        if ($asset->thumbnail_url) {
            $path = str_replace('/storage/', '', $asset->thumbnail_url);
            Storage::disk('public')->delete($path);
        }
        if ($asset->file_url) {
            Storage::disk('local')->delete($asset->file_url);
        }

        $asset->delete();

        // Notify creator
        Notification::assetRejected($userId, $title);

        return response()->json(['message' => 'Asset rejected and deleted.']);
    }

    /**
     * Get all users.
     */
    public function getUsers()
    {
        $this->ensureAdmin();
        // SECURITY: Select only needed fields — never expose password hashes
        $users = \App\Models\User::select('id','name','email','role','is_banned','is_verified','balance','created_at')
            ->latest()->paginate(20);
        return response()->json($users);
    }

    /**
     * Toggle ban status of a user.
     */
    public function toggleBan(\App\Models\User $user)
    {
        $this->ensureAdmin();
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot ban an admin.'], 403);
        }

        $user->update(['is_banned' => !$user->is_banned]);
        
        return response()->json([
            'message' => $user->is_banned ? 'User banned successfully.' : 'User unbanned successfully.',
            'user' => $user
        ]);
    }

    /**
     * Toggle verified status of a user.
     */
    public function toggleVerify(\App\Models\User $user)
    {
        $this->ensureAdmin();
        $user->update(['is_verified' => !$user->is_verified]);

        // Notify user
        if ($user->is_verified) {
            Notification::userVerified($user->id);
        } else {
            Notification::userUnverified($user->id);
        }
        
        return response()->json([
            'message' => $user->is_verified ? 'User verified successfully.' : 'User unverified successfully.',
            'user' => $user
        ]);
    }

    /**
     * Admin manually top-up a user's balance.
     */
    public function topupUser(Request $request, \App\Models\User $user)
    {
        $this->ensureAdmin();
        $request->validate([
            'amount' => 'required|numeric|min:1000|max:10000000',
        ]);

        $user->increment('balance', $request->amount);

        Notification::topupReceived($user->id, $request->amount);

        return response()->json([
            'message' => 'Saldo berhasil ditambahkan.',
            'user'    => $user->fresh(),
        ]);
    }
}
