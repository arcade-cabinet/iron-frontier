import bpy
import mathutils
from pathlib import Path

SOURCE = Path('/Users/jbogaty/src/arcade-cabinet/iron-frontier/incoming/Main File V1_1.glb')
OUTPUT_DIR = Path('/Users/jbogaty/src/arcade-cabinet/iron-frontier/assets/models/western')
ASSEMBLED_OUT = OUTPUT_DIR / 'western-town-optimized.glb'
PARTS_DIR = OUTPUT_DIR / 'parts'

# Optional: map material name fragments to AmbientCG PBR texture set
AMBIENTCG = Path('/Users/jbogaty/src/arcade-cabinet/iron-frontier/assets/lookdev/ambientcg')
MATERIAL_MAP = {
    'wood': {
        'albedo': AMBIENTCG / 'Ground037_1K-JPG_Color.jpg',
        'normal': AMBIENTCG / 'Ground037_1K-JPG_NormalGL.jpg',
        'roughness': AMBIENTCG / 'Ground037_1K-JPG_Roughness.jpg',
    },
    'plank': {
        'albedo': AMBIENTCG / 'Ground037_1K-JPG_Color.jpg',
        'normal': AMBIENTCG / 'Ground037_1K-JPG_NormalGL.jpg',
        'roughness': AMBIENTCG / 'Ground037_1K-JPG_Roughness.jpg',
    },
    'stone': {
        'albedo': AMBIENTCG / 'Rock020_1K-JPG_Color.jpg',
        'normal': AMBIENTCG / 'Rock020_1K-JPG_NormalGL.jpg',
        'roughness': AMBIENTCG / 'Rock020_1K-JPG_Roughness.jpg',
    },
    'brick': {
        'albedo': AMBIENTCG / 'Rock020_1K-JPG_Color.jpg',
        'normal': AMBIENTCG / 'Rock020_1K-JPG_NormalGL.jpg',
        'roughness': AMBIENTCG / 'Rock020_1K-JPG_Roughness.jpg',
    },
    'ground': {
        'albedo': AMBIENTCG / 'Ground001_1K-JPG_Color.jpg',
        'normal': AMBIENTCG / 'Ground001_1K-JPG_NormalGL.jpg',
        'roughness': AMBIENTCG / 'Ground001_1K-JPG_Roughness.jpg',
    },
    'metal': {
        'albedo': AMBIENTCG / 'Rock020_1K-JPG_Color.jpg',
        'normal': AMBIENTCG / 'Rock020_1K-JPG_NormalGL.jpg',
        'roughness': AMBIENTCG / 'Rock020_1K-JPG_Roughness.jpg',
    },
}

# Export threshold for parts (skip tiny props)
MIN_PART_SIZE = 0.35


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def apply_transforms(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    obj.select_set(False)


def set_origin_to_base(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    obj.select_set(False)

    min_z = min((obj.matrix_world @ mathutils.Vector(v)).z for v in obj.bound_box)
    obj.location.z -= min_z


def separate_loose_parts(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.separate(type='LOOSE')
    bpy.ops.object.mode_set(mode='OBJECT')
    obj.select_set(False)


def bounds_dimensions(obj):
    bbox = [obj.matrix_world @ mathutils.Vector(v) for v in obj.bound_box]
    min_x = min(v.x for v in bbox)
    max_x = max(v.x for v in bbox)
    min_y = min(v.y for v in bbox)
    max_y = max(v.y for v in bbox)
    min_z = min(v.z for v in bbox)
    max_z = max(v.z for v in bbox)
    return (max_x - min_x, max_y - min_y, max_z - min_z)


def remap_materials(obj):
    for slot in obj.material_slots:
        if not slot.material:
            continue
        name = slot.material.name.lower()
        for key, textures in MATERIAL_MAP.items():
            if key in name:
                slot.material = build_pbr_material(key, textures)
                break


def build_pbr_material(name, textures):
    mat_name = f"PBR_{name}"
    mat = bpy.data.materials.get(mat_name)
    if mat:
        return mat

    mat = bpy.data.materials.new(mat_name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    output.location = (300, 0)
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    def add_tex_node(path, location):
        node = nodes.new(type='ShaderNodeTexImage')
        node.location = location
        node.image = bpy.data.images.load(str(path)) if path and path.exists() else None
        node.interpolation = 'Smart'
        return node

    albedo = add_tex_node(textures.get('albedo'), (-600, 120))
    normal = add_tex_node(textures.get('normal'), (-600, -100))
    rough = add_tex_node(textures.get('roughness'), (-600, -320))

    if albedo.image:
        links.new(albedo.outputs['Color'], bsdf.inputs['Base Color'])
    if rough.image:
        links.new(rough.outputs['Color'], bsdf.inputs['Roughness'])
    if normal.image:
        nrm = nodes.new(type='ShaderNodeNormalMap')
        nrm.location = (-300, -100)
        links.new(normal.outputs['Color'], nrm.inputs['Color'])
        links.new(nrm.outputs['Normal'], bsdf.inputs['Normal'])

    return mat


def export_selected(filepath):
    bpy.ops.export_scene.gltf(
        filepath=str(filepath),
        export_format='GLB',
        export_apply=True,
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_materials='EXPORT',
        use_selection=True,
        export_animations=False,
    )


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PARTS_DIR.mkdir(parents=True, exist_ok=True)

    reset_scene()
    bpy.ops.import_scene.gltf(filepath=str(SOURCE))

    meshes = [obj for obj in bpy.data.objects if obj.type == 'MESH']
    if not meshes:
        print('No meshes imported')
        return

    # If there's a single combined mesh, split into parts
    if len(meshes) == 1:
        separate_loose_parts(meshes[0])

    meshes = [obj for obj in bpy.data.objects if obj.type == 'MESH']

    # Clean + normalize
    for obj in meshes:
        apply_transforms(obj)
        set_origin_to_base(obj)
        remap_materials(obj)

    # Export assembled
    bpy.ops.object.select_all(action='DESELECT')
    for obj in meshes:
        obj.select_set(True)
    export_selected(ASSEMBLED_OUT)
    print(f"Exported assembled GLB: {ASSEMBLED_OUT}")

    # Export parts
    for obj in meshes:
        dims = bounds_dimensions(obj)
        if max(dims) < MIN_PART_SIZE:
            continue
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        safe_name = obj.name.replace(' ', '_').replace('.', '_')
        export_selected(PARTS_DIR / f"{safe_name}.glb")

    print(f"Exported parts to: {PARTS_DIR}")


if __name__ == '__main__':
    main()
