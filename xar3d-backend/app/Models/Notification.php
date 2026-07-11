<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id', 'type', 'title', 'message', 'data', 'read_at',
    ];

    protected $casts = [
        'data'    => 'array',
        'read_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    // ─── Static helpers to create typed notifications ───────────────────────────

    public static function send(string $userId, string $type, string $title, string $message, array $data = []): self
    {
        return self::create([
            'user_id' => $userId,
            'type'    => $type,
            'title'   => $title,
            'message' => $message,
            'data'    => $data,
        ]);
    }

    public static function assetApproved(string $userId, string $assetTitle): self
    {
        return self::send($userId, 'asset_approved',
            '✅ Aset Disetujui',
            "Aset \"{$assetTitle}\" kamu telah disetujui oleh admin dan sekarang sudah tayang!"
        );
    }

    public static function assetRejected(string $userId, string $assetTitle): self
    {
        return self::send($userId, 'asset_rejected',
            '❌ Aset Ditolak',
            "Aset \"{$assetTitle}\" ditolak oleh admin. Silakan periksa panduan upload kami."
        );
    }

    public static function assetSold(string $sellerId, string $assetTitle, float $amount, string $buyerName): self
    {
        return self::send($sellerId, 'asset_sold',
            '💰 Aset Terjual!',
            "{$buyerName} baru saja membeli \"{$assetTitle}\". Saldo kamu bertambah Rp " . number_format($amount, 0, ',', '.'),
            ['amount' => $amount]
        );
    }

    public static function assetPurchased(string $buyerId, string $assetTitle, float $amount): self
    {
        return self::send($buyerId, 'asset_purchased',
            '🛒 Pembelian Berhasil',
            "Kamu berhasil membeli \"{$assetTitle}\" seharga Rp " . number_format($amount, 0, ',', '.') . ". Selamat menikmati!",
            ['amount' => $amount]
        );
    }

    public static function userVerified(string $userId): self
    {
        return self::send($userId, 'verified',
            '🏅 Akun Diverifikasi',
            'Selamat! Akun kamu telah mendapat Centang Biru dari admin. Status kreator terverifikasi kini aktif.'
        );
    }

    public static function userUnverified(string $userId): self
    {
        return self::send($userId, 'unverified',
            '⚠️ Verifikasi Dicabut',
            'Status verifikasi akun kamu telah dicabut oleh admin.'
        );
    }

    public static function topupReceived(string $userId, float $amount): self
    {
        return self::send($userId, 'topup',
            '💳 Saldo Ditambahkan',
            'Saldo kamu berhasil ditambahkan sebesar Rp ' . number_format($amount, 0, ',', '.') . '.',
            ['amount' => $amount]
        );
    }

    public static function refundSubmitted(string $userId, string $assetTitle): self
    {
        return self::send($userId, 'refund_submitted',
            '⏳ Refund Diproses',
            "Pengajuan refund untuk aset \"{$assetTitle}\" telah diterima dan sedang menunggu konfirmasi admin."
        );
    }

    public static function refundApproved(string $userId, string $assetTitle, float $amount): self
    {
        return self::send($userId, 'refund_approved',
            '✅ Refund Disetujui',
            "Pengajuan refund untuk aset \"{$assetTitle}\" telah disetujui. Saldo Rp " . number_format($amount, 0, ',', '.') . " telah dikembalikan.",
            ['amount' => $amount]
        );
    }

    public static function refundRejected(string $userId, string $assetTitle, string $reason): self
    {
        return self::send($userId, 'refund_rejected',
            '❌ Refund Ditolak',
            "Pengajuan refund untuk aset \"{$assetTitle}\" ditolak oleh admin. Alasan: {$reason}"
        );
    }

    public static function creatorNewAsset(string $userId, string $creatorName, string $assetTitle, string $assetId): self
    {
        return self::send($userId, 'creator_new_asset',
            '🌟 Rilis Baru!',
            "Kreator {$creatorName} baru saja mengunggah aset baru: \"{$assetTitle}\". Cek sekarang!",
            ['asset_id' => $assetId]
        );
    }
}
