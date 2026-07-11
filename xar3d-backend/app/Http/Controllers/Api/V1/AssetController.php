<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Category;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AssetController extends Controller
{
    /**
     * List all published assets (for explore page).
     */
    public function index(Request $request)
    {
        $assets = Asset::with(['user:id,name', 'category:id,name,slug'])
            ->where('is_published', true)
            ->whereHas('user', fn($q) => $q->where('is_banned', false))
            ->when($request->category, fn($q) =>
                $q->whereHas('category', fn($q) => $q->where('slug', $request->category))
            )
            ->when($request->q, fn($q) =>
                $q->where('title', 'like', "%{$request->q}%")
                  ->orWhere('description', 'like', "%{$request->q}%")
            )
            ->when($request->sort === 'price_asc',  fn($q) => $q->orderBy('price', 'asc'))
            ->when($request->sort === 'price_desc', fn($q) => $q->orderBy('price', 'desc'))
            ->when($request->sort === 'popular',    fn($q) => $q->orderBy('download_count', 'desc'))
            ->when(!$request->sort,                 fn($q) => $q->latest())
            ->paginate(12);

        return response()->json($assets);
    }

    /**
     * Show a single published asset.
     */
    public function show(Asset $asset)
    {
        // Load user first to avoid null pointer on is_banned check
        $asset->load(['user:id,name,is_banned', 'category:id,name,slug']);

        if (!$asset->is_published || $asset->user?->is_banned) {
            return response()->json(['message' => 'Asset not found'], 404);
        }

        // Calculate followers for the creator (unique buyers + unique favorites)
        $creatorId = $asset->user_id;
        $followerCount = \App\Models\CreatorFollower::where('creator_id', $creatorId)->count();
        $isFollowing = false;

        if (request()->user()) {
            $isFollowing = \App\Models\CreatorFollower::where('creator_id', $creatorId)
                ->where('follower_id', request()->user()->id)
                ->exists();
        }

        if ($asset->user) {
            $asset->user->setAttribute('follower_count', $followerCount);
            $asset->user->setAttribute('is_following', $isFollowing);
        }

        return response()->json(['data' => $asset]);
    }

    /**
     * List assets belonging to the authenticated creator.
     */
    public function myAssets(Request $request)
    {
        $assets = Asset::with('category:id,name,slug')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(12);

        return response()->json($assets);
    }

    /**
     * Store a newly uploaded asset.
     */
    public function store(Request $request)
    {
        // SECURITY: Only creators (or admin) can upload
        if (!in_array($request->user()->role, ['creator', 'admin'])) {
            return response()->json(['message' => 'Only creators can upload assets.'], 403);
        }

        $request->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'required|string|max:5000',
            'category_id'     => 'required|uuid|exists:categories,id',
            'price'           => 'required|numeric|min:0',
            'blender_version' => 'sometimes|string|max:20',
            'poly_count'      => 'sometimes|integer|min:0',
            'license_type'    => 'required|in:free,standard,extended',
            'thumbnail'       => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'file'            => 'required|file|extensions:zip,blend|max:102400',
        ]);

        $user = $request->user();

        $thumbnailPath = $request->file('thumbnail')->store('thumbnails', 'public');
        $thumbnailUrl  = Storage::url($thumbnailPath);
        $filePath      = $request->file('file')->store('assets/' . $user->id, 'local');
        $slug          = Str::slug($request->title) . '-' . Str::random(6);

        $asset = Asset::create([
            'user_id'         => $user->id,
            'category_id'     => $request->category_id,
            'title'           => $request->title,
            'slug'            => $slug,
            'description'     => $request->description,
            'price'           => $request->price,
            'thumbnail_url'   => $thumbnailUrl,
            'file_url'        => $filePath,
            'blender_version' => $request->blender_version,
            'poly_count'      => $request->poly_count,
            'license_type'    => $request->license_type,
            'is_published'    => true, // Automatically published
        ]);

        // Notify followers/previous buyers
        // 1. Get users who downloaded any asset from this creator
        $buyerIds = \App\Models\Download::whereHas('asset', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->pluck('user_id')->toArray();

        // 2. Get users who favorited any asset from this creator
        $favoriteUserIds = \App\Models\Favorite::whereHas('asset', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->pluck('user_id')->toArray();

        $notifyUserIds = array_unique(array_merge($buyerIds, $favoriteUserIds));
        $notifyUserIds = array_filter($notifyUserIds, fn($id) => $id !== $user->id);

        foreach ($notifyUserIds as $notifyUserId) {
            Notification::creatorNewAsset($notifyUserId, $user->name, $asset->title, $asset->id);
        }

        return response()->json([
            'message' => 'Asset uploaded successfully',
            'data'    => $asset->load('category:id,name')
        ], 201);
    }

    /**
     * Toggle publish/unpublish.
     */
    public function togglePublish(Request $request, Asset $asset)
    {
        if ($asset->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $asset->update(['is_published' => !$asset->is_published]);

        return response()->json([
            'message' => $asset->is_published ? 'Asset published' : 'Asset unpublished',
            'data'    => $asset
        ]);
    }

    /**
     * Delete an asset.
     */
    public function destroy(Request $request, Asset $asset)
    {
        if ($asset->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Clean up files
        if ($asset->thumbnail_url) {
            $path = str_replace('/storage/', '', $asset->thumbnail_url);
            Storage::disk('public')->delete($path);
        }
        if ($asset->file_url) {
            Storage::disk('local')->delete($asset->file_url);
        }

        $asset->delete();

        return response()->json(['message' => 'Asset deleted']);
    }

    /**
     * Get all categories.
     */
    public function categories()
    {
        return response()->json([
            'data' => Category::orderBy('name')->get(['id', 'name', 'slug'])
        ]);
    }
    /**
     * Download the asset file.
     */
    public function download(Request $request, Asset $asset)
    {
        // Only allow if published or if the user is the owner
        if (!$asset->is_published && $asset->user_id !== $request->user()?->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (!$asset->file_url || !Storage::disk('local')->exists($asset->file_url)) {
            return response()->json(['message' => 'File not found on server'], 404);
        }

        $user = $request->user();
        
        // Record the download if it's not the owner downloading their own asset
        // and if they haven't downloaded it yet (or just record every download)
        if ($user && $asset->user_id !== $user->id) {
            $alreadyDownloaded = \App\Models\Download::where('user_id', $user->id)
                ->where('asset_id', $asset->id)
                ->exists();

            if (!$alreadyDownloaded) {
                if ($asset->price > 0) {
                    if ($user->balance < $asset->price) {
                        return response()->json(['message' => 'Saldo Anda tidak mencukupi untuk membeli aset ini.'], 402);
                    }

                    // SECURITY: Use DB transaction to prevent race conditions / double-charge
                    DB::transaction(function () use ($user, $asset) {
                        $user->decrement('balance', $asset->price);
                        $creator = \App\Models\User::find($asset->user_id);
                        $creator?->increment('balance', $asset->price);
                        \App\Models\Download::create([
                            'user_id'    => $user->id,
                            'asset_id'   => $asset->id,
                            'price_paid' => $asset->price,
                        ]);
                        $asset->increment('download_count');

                        // Send notifications
                        if ($creator) {
                            Notification::assetSold($creator->id, $asset->title, $asset->price, $user->name);
                        }
                        Notification::assetPurchased($user->id, $asset->title, $asset->price);
                    });
                } else {
                    \App\Models\Download::create([
                        'user_id'    => $user->id,
                        'asset_id'   => $asset->id,
                        'price_paid' => 0,
                    ]);
                    $asset->increment('download_count');
                }
            }
        }

        $path = (string) $asset->file_url;
        return Storage::download($path, basename($path));
    }
}
