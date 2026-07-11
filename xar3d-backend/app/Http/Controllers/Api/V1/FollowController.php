<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\CreatorFollower;

class FollowController extends Controller
{
    public function toggle(Request $request, $creatorId)
    {
        $creator = User::findOrFail($creatorId);

        if ($creator->role !== 'creator') {
            return response()->json(['message' => 'User is not a creator'], 400);
        }

        $user = $request->user();
        if ($user->id === $creator->id) {
            return response()->json(['message' => 'Cannot follow yourself'], 400);
        }

        $follow = CreatorFollower::where('follower_id', $user->id)
            ->where('creator_id', $creator->id)
            ->first();

        if ($follow) {
            $follow->delete();
            $isFollowing = false;
        } else {
            CreatorFollower::create([
                'follower_id' => $user->id,
                'creator_id' => $creator->id
            ]);
            $isFollowing = true;
        }

        $followerCount = CreatorFollower::where('creator_id', $creator->id)->count();

        return response()->json([
            'is_following' => $isFollowing,
            'follower_count' => $followerCount
        ]);
    }
}
