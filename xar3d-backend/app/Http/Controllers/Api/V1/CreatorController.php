<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class CreatorController extends Controller
{
    /**
     * List all creators (users with role = creator).
     */
    public function index()
    {
        $creators = User::where('role', 'creator')
            ->where('is_banned', false)
            ->with('creatorProfile')
            ->withCount(['assets' => fn($q) => $q->where('is_published', true)])
            ->orderByDesc('assets_count')
            ->paginate(12);

        return response()->json($creators);
    }

    /**
     * Show a single creator's public profile.
     */
    public function show(Request $request, User $user)
    {
        if (!in_array($user->role, ['creator', 'admin']) || $user->is_banned) {
            return response()->json(['message' => 'Creator not found'], 404);
        }

        $user->load('creatorProfile');
        $user->loadCount(['assets' => fn($q) => $q->where('is_published', true)]);

        $followerCount = \App\Models\CreatorFollower::where('creator_id', $user->id)->count();
        $isFollowing = false;

        if ($request->user()) {
            $isFollowing = \App\Models\CreatorFollower::where('creator_id', $user->id)
                ->where('follower_id', $request->user()->id)
                ->exists();
        }

        $user->setAttribute('follower_count', $followerCount);
        $user->setAttribute('is_following', $isFollowing);

        $assets = $user->assets()
            ->where('is_published', true)
            ->with('category:id,name,slug')
            ->latest()
            ->paginate(9);

        $totalDownloads = $user->assets()->where('is_published', true)->sum('download_count');
        $avgRating = $user->assets()->where('is_published', true)->where('average_rating', '>', 0)->avg('average_rating') ?? 0;

        return response()->json([
            'data' => [
                'creator' => $user,
                'stats'   => [
                    'total_downloads' => $totalDownloads,
                    'average_rating'  => round($avgRating, 1),
                ],
                'assets'  => $assets,
            ]
        ]);
    }
}
