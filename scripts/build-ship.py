"""Build DUANOR's licensed Blender cargo ship and its original fallback render.

Run with Blender 5.1 in background mode and --disable-autoexec:
  blender --background --factory-startup --disable-autoexec --python scripts/build-ship.py

Source: Container ship full, Sketlux, CC0.
https://opengameart.org/content/container-ship-full
The source is never overwritten. The GLB uses KHR_draco_mesh_compression.
"""

import argparse
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

import bpy
import bmesh
from mathutils import Matrix, Vector


ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--source', default=str(Path.home() / '.codex/duanor-v2-assets/container-ship-full-original.blend'))
parser.add_argument('--skip-render', action='store_true')
options = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
blend_path = ROOT / 'assets/blender/container-ship.blend'
glb_path = ROOT / 'public/models/container-ship.glb'
webp_path = ROOT / 'public/images/ship-fallback.webp'
for path in [blend_path, glb_path, webp_path]:
    path.parent.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.open_mainfile(filepath=options.source)
scene = bpy.context.scene
for obj in list(bpy.data.objects):
    if obj.type != 'MESH':
        bpy.data.objects.remove(obj, do_unlink=True)
scene.world = bpy.data.worlds.new('DUANOR studio atmosphere')
scene.world.use_nodes = True
scene.world.node_tree.nodes.get('Background').inputs['Color'].default_value = (0.07, 0.10, 0.16, 1)
scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value = 0.38


def linear_rgb(hex_color):
    channels = [int(hex_color[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels)


def material(name, hex_color, roughness=0.5, metallic=0.12):
    mat = bpy.data.materials.new(name)
    color = (*linear_rgb(hex_color), 1)
    mat.diffuse_color = color
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = color
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metallic
    return mat


palette = {
    'hull': material('01 — Navy painted steel', '1B263B', 0.38, 0.45),
    'waterline': material('02 — Midnight waterline', '0D1B2A', 0.43, 0.2),
    'deck': material('03 — Slate deck', '415A77', 0.66, 0.15),
    'ivory': material('04 — Silver enamel', 'E0E1DD', 0.38, 0.14),
    'bone': material('05 — Silver containers', 'E0E1DD', 0.54, 0.24),
    'olive': material('06 — Slate containers', '415A77', 0.6, 0.23),
    'charcoal': material('07 — Navy containers', '1B263B', 0.45, 0.32),
    'lime': material('08 — Blue gray containers', '778DA9', 0.5, 0.2),
    'glass': material('09 — Tinted bridge glazing', '0D1B2A', 0.17, 0.6),
    'steel': material('10 — Brushed fittings', '778DA9', 0.38, 0.65),
}

source_meshes = [obj for obj in scene.objects if obj.type == 'MESH']
original_points = [obj.matrix_world @ Vector(corner) for obj in source_meshes for corner in obj.bound_box]
minimum = Vector([min(point[axis] for point in original_points) for axis in range(3)])
maximum = Vector([max(point[axis] for point in original_points) for axis in range(3)])
center_floor = Vector(((minimum.x + maximum.x) / 2, (minimum.y + maximum.y) / 2, minimum.z))
# The original bow is -Y. Rotate the vessel so the bow is +X and refine its proportions.
length_stretch = 1.42
uniform_scale = 12.0 / ((maximum.y - minimum.y) * length_stretch)
normalization = (
    Matrix.Scale(uniform_scale, 4)
    @ Matrix.Diagonal((length_stretch, 1, 1, 1))
    @ Matrix.Rotation(math.pi / 2, 4, 'Z')
    @ Matrix.Translation(-center_floor)
)
source_to_palette = {
    'body.001': 'hull', 'body color': 'waterline', 'Material.001': 'hull',
    'deck': 'deck', 'Material.002': 'ivory', 'Material.004': 'ivory',
    'Material.005': 'ivory', 'Material.008': 'ivory', 'body.002': 'steel',
    'Material.003': 'charcoal', 'crain': 'lime', 'steam outets': 'charcoal',
    'window': 'glass', 'glass.001': 'glass',
}
container_colors = ['bone', 'charcoal', 'olive', 'bone', 'olive', 'lime', 'charcoal']

for index, obj in enumerate(sorted(source_meshes, key=lambda item: item.name)):
    old_materials = list(obj.data.materials)
    obj.data = obj.data.copy()
    obj.data.transform(normalization @ obj.matrix_world)
    obj.matrix_world = Matrix.Identity(4)
    obj.data.materials.clear()
    if obj.name.startswith('crate'):
        container_material = palette[container_colors[index % len(container_colors)]]
        obj.data.materials.append(container_material)
        for face in obj.data.polygons:
            face.material_index = 0
        obj.name = 'Cargo — ' + obj.name
    else:
        for previous in old_materials:
            key = source_to_palette.get(previous.name if previous else '', 'ivory')
            obj.data.materials.append(palette[key])
        if not obj.data.materials:
            obj.data.materials.append(palette['ivory'])
        if obj.name in ['body', 'body.001', 'Cube']:
            bevel = obj.modifiers.new('Subtle manufactured edge radius', 'BEVEL')
            bevel.width = 0.012
            bevel.segments = 2
            bevel.limit_method = 'ANGLE'
            bevel.angle_limit = math.radians(25)
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(obj.data)
    bm.free()
    obj['source_author'] = 'Sketlux'
    obj['source_license'] = 'CC0-1.0'
    obj['source_url'] = 'https://opengameart.org/content/container-ship-full'

bpy.context.view_layer.update()
# A modest handrail and mooring fittings accent the adapted source geometry.
detail_collection = bpy.data.collections.new('DUANOR · deck fittings')
scene.collection.children.link(detail_collection)


def cylinder_between(name, a, b, radius, mat, vertices=8):
    delta = Vector(b) - Vector(a)
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=delta.length, location=(Vector(a) + Vector(b)) / 2)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_euler = delta.to_track_quat('Z', 'Y').to_euler()
    obj.data.materials.append(mat)
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)
    detail_collection.objects.link(obj)
    return obj


deck_z = (0.2899987 - minimum.z) * uniform_scale
for side in [-1, 1]:
    y = side * 1.39
    for z_offset in [0.12, 0.24]:
        cylinder_between('Deck guardrail', (-3.15, y, deck_z + z_offset), (4.1, y, deck_z + z_offset), 0.008, palette['steel'])
    for step in range(13):
        x = -3.15 + step * (7.25 / 12)
        cylinder_between('Guardrail stanchion', (x, y, deck_z), (x, y, deck_z + 0.27), 0.012, palette['steel'])

ship_objects = [obj for obj in scene.objects if obj.type == 'MESH']
all_corners = [obj.matrix_world @ Vector(corner) for obj in ship_objects for corner in obj.bound_box]
source_bbox = [[min(point[axis] for point in all_corners) for axis in range(3)], [max(point[axis] for point in all_corners) for axis in range(3)]]

# Export one mesh with material primitives to keep draw calls small while preserving
# individually editable source objects in the .blend file.
export_collection = bpy.data.collections.new('Temporary export')
scene.collection.children.link(export_collection)
export_objects = []
depsgraph = bpy.context.evaluated_depsgraph_get()
for original in ship_objects:
    mesh = bpy.data.meshes.new_from_object(original.evaluated_get(depsgraph))
    clone = bpy.data.objects.new('export_' + original.name, mesh)
    clone.matrix_world = original.matrix_world.copy()
    export_collection.objects.link(clone)
    export_objects.append(clone)
bpy.ops.object.select_all(action='DESELECT')
for obj in export_objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = export_objects[0]
bpy.ops.object.join()
exported = bpy.context.object
exported.name = 'DUANOR Container Ship · Sketlux CC0 adaptation'
exported['copyright'] = 'Container ship full by Sketlux, CC0. Adapted for DUANOR.'
exported['license'] = 'https://creativecommons.org/publicdomain/zero/1.0/'
exported['source'] = 'https://opengameart.org/content/container-ship-full'
for uv in list(exported.data.uv_layers):
    exported.data.uv_layers.remove(uv)
triangle_count = sum(len(face.vertices) - 2 for face in exported.data.polygons)
bpy.ops.export_scene.gltf(
    filepath=str(glb_path), export_format='GLB', use_selection=True,
    export_cameras=False, export_lights=False, export_animations=False,
    export_extras=True, export_texcoords=False, export_normals=True,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
)
bpy.data.objects.remove(exported, do_unlink=True)
bpy.data.collections.remove(export_collection)

studio = bpy.data.collections.new('Studio · render only, excluded from GLB')
scene.collection.children.link(studio)


def move_to_studio(obj):
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)
    studio.objects.link(obj)


def area_light(name, position, power, color, size):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = power
    data.color = color
    data.shape = 'DISK'
    data.size = size
    obj = bpy.data.objects.new(name, data)
    studio.objects.link(obj)
    obj.location = position
    obj.rotation_euler = (Vector((0, 0, 1.1)) - obj.location).to_track_quat('-Z', 'Y').to_euler()


area_light('Large neutral softbox', (0, -6, 10), 2200, (0.93, 0.96, 1.0), 9)
area_light('Blue gray rim softbox', (-3, 6, 7), 2700, (0.68, 0.8, 1.0), 8)
area_light('Bow fill', (8, -2, 4), 850, (0.79, 0.9, 1.0), 6)
bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -0.055))
ground = bpy.context.object
ground.name = 'Studio floor · render only'
ground.data.materials.append(material('Studio midnight background', '0D1B2A', 0.68, 0.04))
move_to_studio(ground)
bpy.ops.object.camera_add(location=(13.8, -21, 13.7))
camera = bpy.context.object
camera.name = 'Studio camera · render only'
camera.rotation_euler = (Vector((0, 0, 1.15)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 16.8
move_to_studio(camera)
scene.camera = camera
scene.render.engine = 'CYCLES'
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = 1600
scene.render.resolution_y = 1050
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.view_settings.exposure = 0.4
scene.render.film_transparent = False
scene['source_author'] = 'Sketlux'
scene['source_license'] = 'CC0-1.0'
scene['source_url'] = 'https://opengameart.org/content/container-ship-full'
scene['adaptations'] = 'V3 navy, slate and silver PBR palette; longitudinal proportion refinement; beveled hull and bridge; added guardrails; Draco web export; original studio lighting and render.'
scene['coordinate_system'] = 'Blender: bow +X, up +Z, center XY and floor Z=0. glTF: bow +X, up +Y, floor Y=0.'
bpy.ops.object.select_all(action='DESELECT')
bpy.context.view_layer.objects.active = ship_objects[0]
ship_objects[0].select_set(True)
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            area.spaces.active.region_3d.view_distance = 19
            area.spaces.active.region_3d.view_location = (0, 0, 1.1)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))

if not options.skip_render:
    png_path = Path(tempfile.gettempdir()) / 'duanor-ship-fallback-render.png'
    scene.render.filepath = str(png_path)
    bpy.ops.render.render(write_still=True)
    node = shutil.which('node')
    if not node:
        raise RuntimeError('Node.js is required to encode the original render as WebP.')
    code = "import sharp from 'sharp'; await sharp(process.argv[1]).webp({quality:88,effort:6}).toFile(process.argv[2]);"
    subprocess.run([node, '--input-type=module', '-e', code, str(png_path), str(webp_path)], cwd=str(ROOT), check=True)

print('DUANOR_SHIP_BUILD=' + json.dumps({
    'blend': str(blend_path), 'blend_bytes': blend_path.stat().st_size,
    'glb': str(glb_path), 'glb_bytes': glb_path.stat().st_size,
    'webp': str(webp_path), 'webp_bytes': webp_path.stat().st_size if webp_path.exists() else None,
    'blender_bbox': source_bbox,
    'gltf_bbox': [[source_bbox[0][0], source_bbox[0][2], -source_bbox[1][1]], [source_bbox[1][0], source_bbox[1][2], -source_bbox[0][1]]],
    'triangles': triangle_count,
    'orientation': 'Bow +X. glTF +Y up, floor Y=0. Vessel length 12 units.',
    'requires': 'KHR_draco_mesh_compression; use Three DRACOLoader with local decoder.'
}))
