<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Asset;
use App\Models\Review;

class ReviewController extends Controller
{
    public function store(Request $request, Asset $asset)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        $user = $request->user();

        // Check if user has downloaded the asset before reviewing
        $hasDownloaded = \App\Models\Download::where('user_id', $user->id)
            ->where('asset_id', $asset->id)
            ->exists();

        if (!$hasDownloaded && $asset->user_id !== $user->id) {
            return response()->json([
                'message' => 'Anda harus mendownload aset ini terlebih dahulu sebelum memberikan ulasan.'
            ], 403);
        }

        // Create or update review
        $review = Review::updateOrCreate(
            ['user_id' => $user->id, 'asset_id' => $asset->id],
            ['rating' => $request->rating, 'comment' => $request->comment]
        );

        // Update average rating on asset
        $avgRating = Review::where('asset_id', $asset->id)->avg('rating');
        $asset->update(['average_rating' => $avgRating]);

        return response()->json([
            'message' => 'Ulasan berhasil disimpan',
            'data' => $review
        ]);
    }
}
