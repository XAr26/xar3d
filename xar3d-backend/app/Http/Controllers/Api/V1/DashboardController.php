<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Asset;
use App\Models\CreatorFollower;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();

        $assets = Asset::where('user_id', $user->id);

        $totalAssets = (clone $assets)->count();
        $totalDownloads = (clone $assets)->sum('download_count');
        
        $avgRating = (clone $assets)->where('average_rating', '>', 0)->avg('average_rating') ?? 0;
        
        // Simulating total views for now (e.g. 5 views per download + some random baseline)
        $totalViews = $totalDownloads * 5 + ($totalAssets > 0 ? 124 : 0);

        $totalFollowers = CreatorFollower::where('creator_id', $user->id)->count();

        return response()->json([
            'data' => [
                'total_assets' => $totalAssets,
                'total_downloads' => $totalDownloads,
                'average_rating' => round($avgRating, 1),
                'total_views' => $totalViews,
                'total_followers' => $totalFollowers
            ]
        ]);
    }
}
