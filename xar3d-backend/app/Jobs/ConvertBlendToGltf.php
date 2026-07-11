<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Asset;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Illuminate\Support\Facades\Log;

class ConvertBlendToGltf implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $asset;

    public function __construct(Asset $asset)
    {
        $this->asset = $asset;
    }

    public function handle(): void
    {
        if (!$this->asset->file_url || !str_ends_with($this->asset->file_url, '.blend')) {
            Log::info("Asset {$this->asset->id} is not a .blend file or missing. Skipping 3D conversion.");
            return;
        }

        $localPath = Storage::disk('local')->path($this->asset->file_url);
        
        // This assumes a python script `convert.py` exists in the scripts/ folder
        // The script uses bpy to export the currently loaded .blend as .gltf
        $pythonScript = base_path('scripts/convert_gltf.py');
        $outputFile = Storage::disk('public')->path('previews/' . $this->asset->id . '.glb');
        
        // Ensure previews directory exists
        if (!file_exists(dirname($outputFile))) {
            mkdir(dirname($outputFile), 0755, true);
        }

        // Run Blender in background: blender -b file.blend -P convert_gltf.py -- output.glb
        $process = new Process(['blender', '-b', $localPath, '-P', $pythonScript, '--', $outputFile]);
        $process->setTimeout(300); // 5 minutes max
        
        try {
            $process->mustRun();
            
            // If successful, save the preview URL to the asset
            $this->asset->update([
                // Assuming we add a `preview_url` column to the assets table in the future
                // 'preview_url' => '/storage/previews/' . $this->asset->id . '.glb'
            ]);
            Log::info("Successfully converted asset {$this->asset->id} to GLB.");
        } catch (ProcessFailedException $exception) {
            Log::error("Failed to convert asset {$this->asset->id} to GLB: " . $exception->getMessage());
        }
    }
}
