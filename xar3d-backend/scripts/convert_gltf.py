import bpy
import sys

# Get the output path from command line arguments after '--'
argv = sys.argv 
try:
    argv = argv[argv.index("--") + 1:]
    output_path = argv[0]
except ValueError:
    print("Error: Output path not provided. Use -- /path/to/output.glb")
    sys.exit(1)

# Ensure it exports as GLB (Binary)
# bpy.ops.export_scene.gltf will detect binary by the .glb extension
try:
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=False,  # Export everything in the scene
        export_apply=True,    # Apply modifiers
        export_materials='EXPORT', # Export materials
    )
    print(f"Successfully exported to {output_path}")
except Exception as e:
    print(f"Failed to export: {e}")
    sys.exit(1)
