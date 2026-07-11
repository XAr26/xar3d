<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CreatorProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'date_of_birth' => 'required|date|before:today',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'username' => 'required|string|max:50|unique:users,username',
            'avatar' => 'nullable|image|max:2048',
            'is_creator' => 'boolean',
            'preferences' => 'nullable', // for onboarding, might be JSON string
            'portfolio_url' => 'nullable|url',
            'bio' => 'nullable|string|max:1000',
        ]);

        // Handle Avatar Upload
        $avatarUrl = null;
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $avatarUrl = '/storage/' . $path;
        }

        // SECURITY: role is always set server-side, never from user input
        $role = $request->boolean('is_creator') ? 'creator' : 'user';
        $fullName = trim($request->first_name . ' ' . $request->last_name);

        // Parse preferences if it's sent as JSON string from FormData
        $preferences = $request->preferences;
        if (is_string($preferences)) {
            $preferences = json_decode($preferences, true);
        }

        $user = User::create([
            'name'                => strip_tags($fullName),
            'first_name'          => strip_tags($request->first_name),
            'last_name'           => strip_tags($request->last_name),
            'username'            => strip_tags($request->username),
            'date_of_birth'       => $request->date_of_birth,
            'email'               => $request->email,
            'password'            => Hash::make($request->password),
            'avatar_url'          => $avatarUrl,
            'role'                => $role,
            'preferences'         => $preferences ?? [],
            'free_downloads_count'=> 1, // Welcome bonus!
            'balance'             => 100000,
        ]);

        if ($role === 'creator') {
            CreatorProfile::create([
                'user_id' => $user->id,
                'portfolio_url' => $request->portfolio_url,
                'bio' => $request->bio,
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan salah.'],
            ]);
        }

        if ($user->is_banned) {
            throw ValidationException::withMessages([
                'email' => ['Akun Anda telah ditangguhkan (Banned). Hubungi admin.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function user(Request $request)
    {
        return response()->json([
            'data' => $request->user()
        ]);
    }

    /**
     * Simulasi Lupa Password (Tanpa OTP Email untuk kepraktisan)
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'email.exists' => 'Email tidak terdaftar di sistem kami.'
        ]);

        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Revoke all tokens so the user has to login again
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password berhasil direset! Silakan login dengan password baru Anda.'
        ]);
    }
}
