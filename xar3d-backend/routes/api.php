<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\AssetController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\CreatorController;
use App\Http\Controllers\Api\V1\RefundController;

Route::prefix('v1')->group(function () {

    // --- Auth (Public) ---
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login',    [AuthController::class, 'login']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

    // --- Public Assets ---
    Route::get('/assets',             [AssetController::class, 'index']);
    Route::get('/assets/categories',  [AssetController::class, 'categories']);
    Route::get('/assets/{asset}',     [AssetController::class, 'show']);

    // --- Public Creators ---
    Route::get('/creators',        [CreatorController::class, 'index']);
    Route::get('/creators/{user}', [CreatorController::class, 'show']);

    // --- Protected Routes ---
    Route::middleware(['auth:sanctum', \App\Http\Middleware\CheckBanned::class])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/user',    [AuthController::class, 'user']);

        Route::get('/profile',  [ProfileController::class, 'show']);
        Route::post('/profile', [ProfileController::class, 'update']);
        Route::patch('/profile/password', [ProfileController::class, 'updatePassword']);
        Route::post('/profile/topup',     [ProfileController::class, 'topup']);
        Route::post('/profile/upgrade-creator', [ProfileController::class, 'upgradeToCreator']);

        Route::get('/user/downloads', [ProfileController::class, 'myDownloads']);
        Route::get('/user/favorites', [App\Http\Controllers\Api\V1\FavoriteController::class, 'index']);
        Route::post('/user/favorites/{asset}', [App\Http\Controllers\Api\V1\FavoriteController::class, 'toggle']);
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        Route::get('/my-assets',              [AssetController::class, 'myAssets']);
        Route::post('/assets',                [AssetController::class, 'store']);
        Route::get('/assets/{asset}/download', [AssetController::class, 'download']);
        Route::post('/assets/{asset}/reviews', [ReviewController::class, 'store']);
        Route::patch('/assets/{asset}/toggle',[AssetController::class, 'togglePublish']);
        Route::delete('/assets/{asset}',      [AssetController::class, 'destroy']);

        // Refunds
        Route::post('/refunds', [RefundController::class, 'store']);

        // Follow Creator
        Route::post('/creators/{creator}/follow', [App\Http\Controllers\Api\V1\FollowController::class, 'toggle']);

        // Notifications
        Route::get('/notifications',               [App\Http\Controllers\Api\V1\NotificationController::class, 'index']);
        Route::get('/notifications/unread-count',  [App\Http\Controllers\Api\V1\NotificationController::class, 'unreadCount']);
        Route::post('/notifications/read-all',     [App\Http\Controllers\Api\V1\NotificationController::class, 'markAllRead']);
        Route::post('/notifications/{notification}/read', [App\Http\Controllers\Api\V1\NotificationController::class, 'markRead']);
        Route::delete('/notifications/delete-all', [App\Http\Controllers\Api\V1\NotificationController::class, 'destroyAll']);
        Route::delete('/notifications/{notification}', [App\Http\Controllers\Api\V1\NotificationController::class, 'destroy']);
    });

    // Admin specific routes
    Route::middleware(['auth:sanctum', \App\Http\Middleware\CheckBanned::class])->group(function () {
        Route::get('/admin/stats', [App\Http\Controllers\Api\V1\AdminController::class, 'getStats']);
        Route::get('/admin/assets/pending', [App\Http\Controllers\Api\V1\AdminController::class, 'pendingAssets']);
        Route::post('/admin/assets/{asset}/approve', [App\Http\Controllers\Api\V1\AdminController::class, 'approveAsset']);
        Route::delete('/admin/assets/{asset}/reject', [App\Http\Controllers\Api\V1\AdminController::class, 'rejectAsset']);

        Route::get('/admin/users', [App\Http\Controllers\Api\V1\AdminController::class, 'getUsers']);
        Route::patch('/admin/users/{user}/ban',    [App\Http\Controllers\Api\V1\AdminController::class, 'toggleBan']);
        Route::patch('/admin/users/{user}/verify', [App\Http\Controllers\Api\V1\AdminController::class, 'toggleVerify']);
        Route::post('/admin/users/{user}/topup',   [App\Http\Controllers\Api\V1\AdminController::class, 'topupUser']);

        // Admin Refunds
        Route::get('/admin/refunds', [RefundController::class, 'index']);
        Route::post('/admin/refunds/{id}/approve', [RefundController::class, 'approve']);
        Route::post('/admin/refunds/{id}/reject', [RefundController::class, 'reject']);
    });
});
