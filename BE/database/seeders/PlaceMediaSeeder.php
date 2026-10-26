<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Place;
use App\Models\Media;
use Illuminate\Support\Facades\DB;

class PlaceMediaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all places
        $places = Place::all();
        
        if ($places->isEmpty()) {
            $this->command->warn('No places found in database!');
            return;
        }

        $this->command->info("Found {$places->count()} places. Adding random images...");

        // Clear existing media for places (optional - comment out if you want to keep old ones)
        Media::whereNotNull('place_id')->delete();
        $this->command->info("Cleared old place images.");

        foreach ($places as $place) {
            // Random 2-5 images per place
            $imageCount = rand(2, 5);
            
            $this->command->info("Adding {$imageCount} images to: {$place->name}");

            for ($i = 0; $i < $imageCount; $i++) {
                // Random size between 800-1200
                $width = rand(800, 1200);
                $height = rand(600, 900);
                
                // Use Lorem Picsum with seed for consistent images
                // Seed based on place_id and image index for uniqueness
                $seed = ($place->id * 1000) + $i;
                
                // Store only the path (without https://picsum.photos/)
                // Frontend will add the domain: https://picsum.photos/{url}
                $url = "seed/{$seed}/{$width}/{$height}";
                
                // If you want full URL instead, use:
                // $url = "https://picsum.photos/seed/{$seed}/{$width}/{$height}";
                
                Media::create([
                    'url' => $url,
                    'file_name' => "place_{$place->id}_image_{$i}.jpg",
                    'size' => rand(100000, 500000), // Fake size 100KB-500KB
                    'width' => $width,
                    'height' => $height,
                    'format' => 'jpg',
                    'user_id' => $place->user_id,
                    'place_id' => $place->id,
                    'post_id' => null,
                    'review_id' => null,
                ]);
            }
        }

        $totalMedia = Media::whereNotNull('place_id')->count();
        $this->command->info("✅ Successfully added {$totalMedia} images to places!");
        $this->command->info("Image source: Lorem Picsum (https://picsum.photos)");
    }
}
