# Blender (headless): import a USD/USDZ file and export it as GLB.
# Run by scripts/add-model.mjs:  blender -b --factory-startup --python usdz-to-glb.py -- in.usdz out.glb
import sys

import bpy

src, out = sys.argv[sys.argv.index("--") + 1 :]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.usd_import(filepath=src)
bpy.ops.export_scene.gltf(
    filepath=out,
    export_format="GLB",
    export_yup=True,
    export_apply=True,
)
