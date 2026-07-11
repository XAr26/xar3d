<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Asset;
use App\Models\Favorite;

class FavoriteController extends Controller
{
    /**
     * Get user's favorites
     */
    public function index(Request $request)
    {
        $favorites = Favorite::with(['asset.category', 'asset.user'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(12);

        return response()->json($favorites);
    }

    /**
     * Toggle favorite status
     */
    public function toggle(Request $request, Asset $asset)
    {
        $user = $request->user();
        $favorite = Favorite::where('user_id', $user->id)
            ->where('asset_id', $asset->id)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return response()->json(['message' => 'Asset removed from favorites', 'is_favorite' => false]);
        }

        Favorite::create([
            'user_id' => $user->id,
            'asset_id' => $asset->id,
        ]);

        return response()->json(['message' => 'Asset added to favorites', 'is_favorite' => true]);
    }
}
