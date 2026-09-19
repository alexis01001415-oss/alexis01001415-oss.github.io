"""Rebuild the DUANOR interior in Blender 5.1. CC0 source props: assets/README-SOURCES.md.
Run: blender --background --factory-startup --python scripts/build-warehouse.py
Optional DUANOR_ASSETS points to the downloaded Poly Haven source directory.
"""
import bpy, math, os, random, json, runpy, tempfile, shutil, subprocess
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parent.parent
SOURCE = Path(os.environ.get('DUANOR_ASSETS', str(Path.home() / '.codex/duanor-v2-assets')))
random.seed(19)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, metal=0, rough=.5, emission=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=rough
    if emission:
        p.inputs['Emission Color'].default_value=(*color,1); p.inputs['Emission Strength'].default_value=emission
    return m
def hex_color(code):
    channels=[int(code[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in channels)
concrete=material('Concrete | silver aggregate',hex_color('B3BAC2'),rough=.88)
steel=material('Powder coated navy',hex_color('1B263B'),.65,.32)
ivory=material('Structural silver',hex_color('E0E1DD'),.35,.4)
lime=material('Safety blue gray',hex_color('778DA9'),.1,.42)
orange=material('Rack beam slate',hex_color('415A77'),.4,.44)
black=material('Rubber and screens',hex_color('0D1B2A'),.2,.38)
wood=material('Pallet oak',(.32,.21,.11),rough=.85)
chrome=material('Brushed aluminum',hex_color('778DA9'),.82,.25)
paper=material('Neutral shipping labels',hex_color('E0E1DD'),rough=.75)
glow=material('LED strips',hex_color('E0E1DD'),rough=.3,emission=3)

def cube(name, pos, size, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos); o=bpy.context.object; o.name=name
    o.dimensions=size; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(mat)
    if bevel:
        m=o.modifiers.new('Manufactured edges','BEVEL'); m.width=bevel; m.segments=2
        bpy.ops.object.modifier_apply(modifier=m.name)
        o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o

def cylinder(name,pos,radius,depth,mat,rotation=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=radius,depth=depth,location=pos)
    o=bpy.context.object;o.name=name;o.data.materials.append(mat)
    if rotation:o.rotation_euler=rotation
    for p in o.data.polygons:p.use_smooth=True
    return o

def beam(name,a,b,width,mat):
    d=Vector(b)-Vector(a); o=cube(name,(Vector(a)+Vector(b))/2,(width,width,d.length),mat)
    o.rotation_euler=d.to_track_quat('Z','Y').to_euler();return o

def label(text,pos,size,mat,rotation=(0,0,0)):
    c=bpy.data.curves.new(text,'FONT'); c.body=text;c.size=size;c.align_x='CENTER';c.extrude=.0005
    o=bpy.data.objects.new(text,c);bpy.context.collection.objects.link(o);o.location=pos;o.rotation_euler=rotation;c.materials.append(mat)
    bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)
    return o

def import_prop(asset,decimate=1):
    before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(SOURCE/asset/(asset+'_1k.gltf')))
    obj=next(o for o in set(bpy.data.objects)-before if o.type=='MESH')
    bpy.context.view_layer.objects.active=obj;bpy.ops.object.select_all(action='DESELECT');obj.select_set(True)
    if decimate<1:
        mod=obj.modifiers.new('Web geometry budget','DECIMATE');mod.ratio=decimate
        bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
    return obj

box=import_prop('cardboard_box_01',.16)
# Place imported geometry on its base; keep the baked scans' UVs and textures.
def normalize_mesh(o):
    minz=min(v.co.z for v in o.data.vertices)
    bounds=[(min(v.co[i] for v in o.data.vertices)+max(v.co[i] for v in o.data.vertices))/2 for i in range(2)]
    for v in o.data.vertices:v.co-=Vector((bounds[0],bounds[1],minz))
normalize_mesh(box)
box.hide_render=True;box.hide_viewport=True;box.location=(0,0,-100)
def carton(pos,scale=1,angle=0):
    o=bpy.data.objects.new('Scanned cardboard carton',box.data);bpy.context.collection.objects.link(o)
    o.location=pos;o.scale=(scale,scale,scale);o.rotation_euler.z=angle;return o
shelf=import_prop('steel_frame_shelves_02');normalize_mesh(shelf);shelf.location=(5,0,0);shelf.scale=(2.2,2.2,1.3)

# Open-sided industrial architecture; the original Blender set stays readable from every chapter.
cube('Foundation',(0,0,-.35),(26,34,.7),concrete,.12)
for x in range(-12,14,4):cube('Floor expansion joint',(x,0,.002),(.018,33,.006),steel)
for y in range(-16,18,4):cube('Floor expansion joint',(0,y,.002),(25,.018,.006),steel)
cube('Rear wall',(0,16.5,3.8),(25,.22,7.6),ivory,.04)
cube('Left cutaway wall',(-12.5,4,1.2),(.2,25,2.4),ivory,.04)
for y in [-14,-7,0,7,14]:
    for x in [-12,12]:
        cube('Structural column',(x,y,4),(.25,.35,8),steel,.02)
        cube('Column foot',(x,y,.06),(.65,.65,.12),chrome,.02)
    cube('Roof truss',(0,y,8),(24,.16,.24),steel,.02)
    cube('Upper truss',(0,y,8.65),(24,.12,.12),steel)
    for x in range(-12,12,3):
        beam('Truss diagonal',(x,y,8),(x+1.5,y,8.65),.07,ivory)
        beam('Truss diagonal',(x+1.5,y,8.65),(x+3,y,8),.07,ivory)
    cube('Suspended LED',(0,y,7.85),(8,.11,.05),glow)
# A translucent-looking narrow canopy provides roof context without occluding the journey.
cube('Rear roof canopy',(0,14,8.7),(25,5,.13),ivory,.02)
for x in [-9,-3,3,9]:
    cube('Rear glazing',(x,16.34,6.3),(4,.03,1.3),black)
    for d in [-1,0,1]:cube('Window mullion',(x+d,16.29,6.3),(.035,.05,1.3),chrome)

# Traffic and pedestrian markings.
for x in [-3.2,3.2]:cube('Aisle stripe',(x,-.6,.012),(.09,29,.018),lime)
for y in range(-13,15,3):cube('Lane dash',(0,y,.012),(.10,1.3,.018),paper)
for x in [-8,0,8]:
    cube('Receiving bay stripe',(x,-12,.013),(5,.10,.022),lime)
    for edge in [-2.5,2.5]:cube('Receiving bay stripe',(x+edge,-13.6,.013),(.08,3.2,.022),lime)
label('D U A N O R', (0,-15.3,.022),1.1,paper)
label('01 / INBOUND',(-8,-11.5,.025),.34,paper)
label('03 / DISPATCH',(7,12,.025),.33,paper)

def pallet(x,y,z=0):
    for dx in [-.58,0,.58]:cube('Pallet bearer',(x+dx,y,z+.10),(.12,1.2,.20),wood,.015)
    for dy in [-.53,-.27,0,.27,.53]:cube('Pallet slat',(x,y+dy,z+.235),(1.4,.20,.07),wood,.009)

# Industrial rack frames: multiple bays, diagonal bracing and textured packed goods.
for x in [-8,8]:
    for y in [-3,3,9]:
        for dx in [-2,2]:
            for dy in [-1.2,1.2]:cube('Rack upright',(x+dx,y+dy,2.7),(.12,.12,5.4),steel,.012)
            beam('Rack side brace',(x+dx,y-1.2,.4),(x+dx,y+1.2,2.7),.045,chrome)
            beam('Rack side brace',(x+dx,y+1.2,2.7),(x+dx,y-1.2,5.0),.045,chrome)
        for z in [.45,2.2,3.95]:
            cube('Rack shelf',(x,y,z),(4.15,2.5,.08),ivory,.01)
            for dy in [-1.22,1.22]:cube('Rack cross beam',(x,y+dy,z),(4.2,.12,.19),orange,.012)
            for dx in [-1,1]:
                pallet(x+dx,y,z+.05)
                for row in [-.32,.32]:
                    carton((x+dx,y+row,z+.34),1.8,random.uniform(-.05,.05))
                    if z<3:carton((x+dx,y+row,z+.98),1.6,random.uniform(-.04,.04))
        cube('Rack location tag',(x,y-1.30,4.0),(.8,.02,.26),paper)
        label(('A' if x<0 else 'B')+str(int((y+3)/6)+1),(x,y-1.32,3.93),.18,black,(math.pi/2,0,0))

# Receiving and dispatch pallets.
for x,y in [(-7,-9),(-8.6,-8.9),(-5.8,-7.3),(0,-10),(1.6,-10),(6,13),(8,13)]:
    pallet(x,y)
    for z in [.28,.94]:
        for dx in [-.34,.34]:carton((x+dx,y,z),1.8,random.uniform(-.04,.04))

# Inspection island with monitor, scale, lamp and actual scanned hero carton.
cube('Inspection bench',(3,-3,1.05),(3.4,1.6,.16),chrome,.05)
for x in [1.5,4.5]:
    for y in [-3.65,-2.35]:cube('Bench legs',(x,y,.50),(.07,.07,1.0),steel)
cube('Inspection scale',(2.5,-3,1.19),(.8,.7,.12),steel,.035)
carton((2.5,-3,1.26),1.65,.13)
cube('Digital screen',(4,-2.9,1.56),(.75,.06,.48),black,.025)
cube('Screen stand',(4,-2.9,1.26),(.06,.06,.3),chrome)
cube('Screen content',(4,-2.936,1.56),(.62,.002,.33),lime)
cube('Document sheet',(3.4,-3.4,1.14),(.4,.3,.008),paper)
label('02 / CONTROL',(3,-4.3,.025),.30,paper)
beam('Task lamp support',(1.7,-2.5,1.1),(1.7,-2.5,2.3),.045,steel)
cube('Task lamp',(2,-2.5,2.28),(.7,.25,.04),glow)

# Roller conveyor and loading doors.
for x in [3.8,5.2]:
    cube('Conveyor rails',(x,6,.83),(.10,6,.15),steel,.02)
    for y in [3.5,8.5]:cube('Conveyor legs',(x,y,.4),(.07,.07,.8),steel)
for y in [3+i*.20 for i in range(31)]:cylinder('Roller',(4.5,y,.87),.055,1.35,chrome,(0,math.pi/2,0))
for y in [4.2,6.7]:carton((4.5,y,.94),1.7,.02)
for x in [-5,5]:
    cube('Loading door frame',(x,16.23,2.25),(4.8,.18,4.5),steel,.03)
    cube('Sectional loading door',(x,16.1,2.18),(4.1,.08,4.1),chrome,.02)
    for z in [i*.35+.3 for i in range(12)]:cube('Door rib',(x,16.04,z),(4.0,.07,.035),steel)
    for dx in [-2.5,2.5]:
        cylinder('Safety bollard',(x+dx,15.25,.65),.12,1.3,lime)
        cylinder('Bollard band',(x+dx,15.25,.75),.123,.2,black)
    label('DOCK 0'+str(1 if x<0 else 2),(x,16.03,4.9),.43,steel,(math.pi/2,0,0))

# Original tractor-trailer beyond the rear dispatch dock. The exterior yard sits
# 1.1m below the warehouse floor, aligning the trailer bed with the loading dock.
asphalt=material('Exterior asphalt',hex_color('415A77'),rough=.94)
cube('Exterior loading yard',(0,29.5,-1.20),(29,26,.20),asphalt,.05)
for x in [-11,-3,2.8,7.2,11]:cube('Exterior bay line',(x,28,-1.093),(.085,19,.012),paper)
for y in [21,27,33,39]:cube('Exterior traffic dash',(-7,y,-1.092),(.11,2.4,.013),paper)
for x in [-5,5]:
    cube('Exterior loading aperture',(x,16.64,2.1),(4.34,.18,4.2),black,.03)
    cube('Exterior dock shutter',(x,16.75,2.12),(3.88,.08,3.95),chrome,.02)
    for z in [.3+i*.36 for i in range(11)]:cube('Exterior shutter seam',(x,16.806,z),(3.78,.025,.025),steel,.006)
    for dx in [-2.18,2.18]:cube('Dock rubber buffer',(x+dx,16.95,.62),(.21,.34,1.26),black,.045)
    cube('Dock bridge plate',(x,17.15,.04),(3.1,1.20,.12),steel,.025)
    for dx in [-2.58,2.58]:
        cylinder('Exterior bollard',(x+dx,17.2,-.45),.11,1.3,lime)
        cylinder('Exterior bollard band',(x+dx,17.2,-.3),.115,.18,ivory)
truck_module=runpy.run_path(str(ROOT/'scripts/newtruck.py'),run_name='duanor_original_truck')
truck_objects=truck_module['build_truck']((5,17.4,-1.1))

bpy.data.objects.remove(box,do_unlink=True)
# Apply modifiers then combine by material for a bounded runtime draw-call count.
for o in list(bpy.data.objects):
    if o.type=='MESH':
        bpy.context.view_layer.objects.active=o;bpy.ops.object.select_all(action='DESELECT');o.select_set(True)
        for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
groups={}
for o in list(bpy.data.objects):
    if o.type=='MESH':groups.setdefault(tuple(m.name for m in o.data.materials),[]).append(o)
for mats,objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1:bpy.ops.object.join()
    objects[0].name=' + '.join(mats)

scene=bpy.context.scene
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.26,.33,.46,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.65
def area(pos,power,size,color):
    bpy.ops.object.light_add(type='AREA',location=pos);l=bpy.context.object;l.data.energy=power;l.data.shape='DISK';l.data.size=size;l.data.color=color
    l.rotation_euler=(Vector((0,0,0))-l.location).to_track_quat('-Z','Y').to_euler()
area((2,-7,19),3500,18,(.94,.97,1));area((-16,4,12),2000,14,(.73,.84,1));area((10,13,17),2600,12,(.94,.97,1))
area((8,30,15),3100,15,(.91,.95,1))
bpy.ops.object.light_add(type='SUN', location=(8,-8,18));sun=bpy.context.object;sun.rotation_euler=(.35,-.4,-.4);sun.data.energy=2;sun.data.angle=.12
bpy.ops.object.camera_add();camera=bpy.context.object;scene.camera=camera;camera.data.lens=36
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=1440;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.render.image_settings.file_format='PNG'
poses=[((29,-36,24),(0,0,1.5)),((-6,-14,4.6),(0,-9,1.1)),((7,-7,3.7),(2.8,-2.8,1.3)),((0,0,4.2),(-7,5,2.3)),((9,10,5.5),(3,15,1.9)),((29,42,15),(4,25,2.2))]
camera.location=poses[0][0];camera.rotation_euler=(Vector(poses[0][1])-camera.location).to_track_quat('-Z','Y').to_euler()
for image in bpy.data.images:
    if image.source=='FILE':image.pack()
scene['palette']='V3 #0d1b2a #1b263b #415a77 #778da9 #e0e1dd; natural cardboard and oak retained.'
scene['truck_provenance']='Original articulated road truck modeled in Blender using scripts/newtruck.py; no downloaded truck asset.'
scene['camera_waypoints_blender']=json.dumps(poses)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/blender/warehouse-journey.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.objects:
    if o.type=='MESH':o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/models/warehouse-journey.glb'),export_format='GLB',use_selection=True,export_cameras=False,export_lights=False,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6,export_draco_position_quantization=14,export_image_format='JPEG',export_jpeg_quality=82)
print('WAREHOUSE EXPORT',len(groups),'draw groups',sum(len(o.data.polygons) for o in bpy.data.objects if o.type=='MESH'),'faces')
mesh_objects=[o for o in bpy.data.objects if o.type=='MESH']
coords=[o.matrix_world@Vector(c) for o in mesh_objects for c in o.bound_box]
print('WAREHOUSE BBOX',[[min(v[i] for v in coords) for i in range(3)],[max(v[i] for v in coords) for i in range(3)]])
node=shutil.which('node')
if not node:raise RuntimeError('Node.js is required for the original WebP fallback renders.')
encode="import sharp from 'sharp'; await sharp(process.argv[1]).webp({quality:86,effort:6}).toFile(process.argv[2]);"
for i,(position,target) in enumerate(poses):
    camera.location=position;camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(Path(tempfile.gettempdir())/('duanor-warehouse-v3-'+str(i)+'.png'))
    bpy.ops.render.render(write_still=True)
    subprocess.run([node,'--input-type=module','-e',encode,scene.render.filepath,str(ROOT/'public/images'/('warehouse-'+str(i)+'.webp'))],cwd=str(ROOT),check=True)
print('WAREHOUSE COMPLETE')
