<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RefundRequest extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'asset_id',
        'download_id',
        'reason',
        'proof_image',
        'status',
        'admin_note'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function download()
    {
        return $this->belongsTo(Download::class);
    }
}
