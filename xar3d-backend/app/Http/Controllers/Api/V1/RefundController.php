<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RefundRequest;
use App\Models\Download;
use Illuminate\Support\Facades\Storage;

class RefundController extends Controller
{
    /**
     * Submit a new refund request
     */
    public function store(Request $request)
    {
        $request->validate([
            'download_id' => 'required|exists:downloads,id',
            'reason' => 'required|string|max:2000',
            'proof_image' => 'required|image|max:5120' // 5MB max
        ]);

        $download = Download::where('id', $request->download_id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Check if already requested
        $existing = RefundRequest::where('download_id', $download->id)->first();
        if ($existing) {
            return response()->json(['message' => 'Anda sudah mengajukan refund untuk aset ini.'], 400);
        }

        // Check 7 days limit
        if ($download->created_at->diffInDays(now()) > 7) {
            return response()->json(['message' => 'Batas waktu refund (7 hari) sudah kedaluwarsa.'], 400);
        }

        $path = $request->file('proof_image')->store('refund_proofs', 'public');

        $refund = RefundRequest::create([
            'user_id' => $request->user()->id,
            'asset_id' => $download->asset_id,
            'download_id' => $download->id,
            'reason' => $request->reason,
            'proof_image' => $path,
            'status' => 'pending'
        ]);

        \App\Models\Notification::refundSubmitted($request->user()->id, $download->asset->title);

        return response()->json([
            'message' => 'Pengajuan refund berhasil dikirim. Menunggu tinjauan Admin.',
            'data' => $refund
        ], 201);
    }

    /**
     * Admin: List all refunds
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $refunds = RefundRequest::with(['user', 'asset'])->latest()->get();
        return response()->json($refunds);
    }

    /**
     * Admin: Approve refund
     */
    public function approve(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $refund = RefundRequest::with(['download', 'user', 'asset.user'])->findOrFail($id);
        if ($refund->status !== 'pending') {
            return response()->json(['message' => 'Refund sudah diproses.'], 400);
        }

        $price = $refund->asset->price;
        $buyer = $refund->user;
        $creator = $refund->asset->user;

        // Refund buyer balance
        $buyer->balance += $price;
        $buyer->save();

        // Deduct creator balance (simplification: assume we just deduct the price back)
        if ($creator) {
            $creator->balance -= $price;
            $creator->save();
        }

        // Delete the download record so buyer can't access it anymore
        if ($refund->download) {
            $refund->download->delete();
        }

        $refund->update([
            'status' => 'approved',
            'admin_note' => $request->admin_note
        ]);

        \App\Models\Notification::refundApproved($buyer->id, $refund->asset->title, $price);

        return response()->json(['message' => 'Refund disetujui. Saldo dikembalikan dan akses dicabut.']);
    }

    /**
     * Admin: Reject refund
     */
    public function reject(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $refund = RefundRequest::findOrFail($id);
        if ($refund->status !== 'pending') {
            return response()->json(['message' => 'Refund sudah diproses.'], 400);
        }

        $request->validate(['admin_note' => 'required|string']);

        $refund->update([
            'status' => 'rejected',
            'admin_note' => $request->admin_note
        ]);

        \App\Models\Notification::refundRejected($refund->user_id, $refund->asset->title, $request->admin_note);

        return response()->json(['message' => 'Refund ditolak.']);
    }
}
