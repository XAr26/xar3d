<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Characters',    'slug' => 'characters'],
            ['name' => 'Environments',  'slug' => 'environments'],
            ['name' => 'Vehicles',      'slug' => 'vehicles'],
            ['name' => 'Props',         'slug' => 'props'],
            ['name' => 'Architecture',  'slug' => 'architecture'],
            ['name' => 'Nature',        'slug' => 'nature'],
            ['name' => 'Weapons',       'slug' => 'weapons'],
            ['name' => 'Sci-Fi',        'slug' => 'sci-fi'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['slug' => $cat['slug']],
                ['id' => Str::uuid(), 'name' => $cat['name']]
            );
        }
    }
}
