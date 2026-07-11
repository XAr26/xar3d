<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CreatorFollower extends Model
{
    use HasUuids;

    protected $fillable = ['follower_id', 'creator_id'];

    public function follower()
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }
}
