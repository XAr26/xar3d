<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CreatorProfile extends Model
{
    use HasUuids;

    protected $fillable = ['user_id', 'bio', 'portfolio_url', 'avatar_url', 'software_skills', 'specializations', 'social_links'];
    
    protected $casts = [
        'software_skills' => 'array',
        'specializations' => 'array',
        'social_links' => 'array',
    ];
}
