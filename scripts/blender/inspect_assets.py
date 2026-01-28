import bpy
import mathutils

ASSETS = {
    "character_blend": "/Users/jbogaty/src/arcade-cabinet/iron-frontier/incoming/Character2.blend",
    "main_glb": "/Users/jbogaty/src/arcade-cabinet/iron-frontier/incoming/Main File V1_1.glb",
    "gunslinger_glb": "/Users/jbogaty/src/arcade-cabinet/iron-frontier/assets/models/characters/gunslinger.glb",
    "revolver_animated_glb": "/Users/jbogaty/src/arcade-cabinet/iron-frontier/assets/models/weapons/revolver-animated.glb",
    "revolver_fixed_glb": "/Users/jbogaty/src/arcade-cabinet/iron-frontier/assets/models/weapons/revolver-fixed.glb",
}


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def scene_bounds(objects):
    if not objects:
        return None
    min_x = min_y = min_z = 1e9
    max_x = max_y = max_z = -1e9
    for obj in objects:
        for v in obj.bound_box:
            v_world = obj.matrix_world @ mathutils.Vector(v)
            min_x = min(min_x, v_world.x)
            min_y = min(min_y, v_world.y)
            min_z = min(min_z, v_world.z)
            max_x = max(max_x, v_world.x)
            max_y = max(max_y, v_world.y)
            max_z = max(max_z, v_world.z)
    dims = (max_x - min_x, max_y - min_y, max_z - min_z)
    return (min_x, min_y, min_z), (max_x, max_y, max_z), dims


def report_scene(label):
    print(f"\n--- {label} ---")
    print("Objects:", [obj.name for obj in bpy.data.objects])
    print("Meshes:", [obj.name for obj in bpy.data.objects if obj.type == 'MESH'])
    print("Armatures:", [obj.name for obj in bpy.data.objects if obj.type == 'ARMATURE'])
    print("Actions:", [act.name for act in bpy.data.actions])
    print("Materials:", [mat.name for mat in bpy.data.materials])
    print("Images:", [img.name for img in bpy.data.images])

    meshes = [obj for obj in bpy.data.objects if obj.type == 'MESH']
    bounds = scene_bounds(meshes)
    if bounds:
        min_b, max_b, dims = bounds
        print("Scene bounds:", min_b, max_b)
        print("Scene dimensions:", dims)


# Character2.blend
try:
    bpy.ops.wm.open_mainfile(filepath=ASSETS["character_blend"])
    report_scene("Character2.blend")
except Exception as exc:
    print("Failed to open Character2.blend:", exc)

# Main File V1_1.glb
try:
    reset_scene()
    bpy.ops.import_scene.gltf(filepath=ASSETS["main_glb"])
    report_scene("Main File V1_1.glb")
except Exception as exc:
    print("Failed to import Main File V1_1.glb:", exc)

# Gunslinger and revolvers (may fail in headless contexts)
for key in ("gunslinger_glb", "revolver_animated_glb", "revolver_fixed_glb"):
    try:
        reset_scene()
        bpy.ops.import_scene.gltf(filepath=ASSETS[key])
        report_scene(key)
    except Exception as exc:
        print(f"Failed to import {key}:", exc)
