"""Original DUANOR tractor/semitrailer mesh, authored procedurally in Blender.

No third-party truck model, vehicle brand, logo or texture is used. Real mesh
details include tire sidewalls, wheels, lugs, fenders, cab glazing, mirrors,
grille, steps, fuel tanks, trailer framing, door hardware and reflectors.
build_truck() is imported by build-warehouse.py. Coordinates are Blender Z-up;
the trailer rear is local Y=0 and the tractor points toward positive Y.
"""
import math
import bpy
from mathutils import Vector


def build_truck(origin=(5, 17.4, -1.1)):
    before = set(bpy.data.objects)
    collection = bpy.data.collections.new('DUANOR · original road transport')
    bpy.context.scene.collection.children.link(collection)

    def color(code):
        values = [int(code[i:i + 2], 16) / 255 for i in (0, 2, 4)]
        return tuple(v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in values)

    def mat(name, code, metallic, roughness, emission=0):
        material = bpy.data.materials.new('Truck · ' + name)
        material.diffuse_color = (*color(code), 1)
        material.use_nodes = True
        shader = material.node_tree.nodes.get('Principled BSDF')
        shader.inputs['Base Color'].default_value = (*color(code), 1)
        shader.inputs['Metallic'].default_value = metallic
        shader.inputs['Roughness'].default_value = roughness
        if emission:
            shader.inputs['Emission Color'].default_value = (*color(code), 1)
            shader.inputs['Emission Strength'].default_value = emission
        return material

    navy = mat('midnight enamel', '1B263B', .45, .29)
    slate = mat('slate trim', '415A77', .45, .38)
    silver = mat('silver trailer', 'E0E1DD', .23, .42)
    chrome = mat('brushed alloy', '778DA9', .78, .24)
    rubber = mat('rubber', '0D1420', .02, .76)
    glass = mat('tinted glass', '0D1B2A', .64, .12)
    white = mat('running lights', 'E0E1DD', .05, .2, 1.8)
    amber = mat('reflectors', 'B47E45', .16, .42)

    def finish(obj, name, material, bevel=0):
        obj.name = 'Truck · ' + name
        obj.data.materials.append(material)
        for owner in list(obj.users_collection): owner.objects.unlink(obj)
        collection.objects.link(obj)
        if bevel:
            modifier = obj.modifiers.new('Formed metal edges', 'BEVEL')
            modifier.width = bevel
            modifier.segments = 3
            modifier.limit_method = 'ANGLE'
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.modifier_apply(modifier=modifier.name)
            modifier = obj.modifiers.new('Weighted surface normals', 'WEIGHTED_NORMAL')
            bpy.ops.object.modifier_apply(modifier=modifier.name)
        return obj

    def box(name, position, size, material, bevel=.025):
        bpy.ops.mesh.primitive_cube_add(size=1, location=position)
        obj = bpy.context.object
        obj.dimensions = size
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        return finish(obj, name, material, bevel)

    def cylinder(name, position, radius, length, material, rotation=(0, math.pi / 2, 0), vertices=24):
        bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=length, location=position, rotation=rotation)
        obj = finish(bpy.context.object, name, material, .008)
        for face in obj.data.polygons: face.use_smooth = len(face.vertices) == 4
        return obj

    def beam(name, start, end, width, material):
        delta = Vector(end) - Vector(start)
        obj = box(name, (Vector(start) + Vector(end)) / 2, (width, width, delta.length), material, .006)
        obj.rotation_euler = delta.to_track_quat('Z', 'Y').to_euler()
        return obj

    def polygon(name, vertices, faces, material, bevel=0):
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(vertices, [], faces)
        mesh.update()
        obj = bpy.data.objects.new(name, mesh)
        bpy.context.collection.objects.link(obj)
        return finish(obj, name, material, bevel)

    def profile(name, yz, width, material, bevel=.06):
        count = len(yz)
        vertices = [(side * width / 2, y, z) for side in [-1, 1] for y, z in yz]
        faces = [tuple(reversed(range(count))), tuple(range(count, count * 2))]
        faces += [(i, (i + 1) % count, (i + 1) % count + count, i + count) for i in range(count)]
        return polygon(name, vertices, faces, material, bevel)

    def fender(y, side):
        vertices=[]
        for x in [side * .91, side * 1.48]:
            for radius in [.58, .66]:
                for i in range(17):
                    theta=math.pi*i/16
                    vertices.append((x,y+math.cos(theta)*radius,.55+math.sin(theta)*radius))
        faces=[]
        for i in range(16):
            faces.extend([(i,i+1,18+i,17+i),(34+i,51+i,52+i,35+i),(i,34+i,35+i,i+1),(17+i,18+i,52+i,51+i)])
        faces += [(0,17,51,34),(16,50,67,33)]
        polygon('formed wheel arch',vertices,faces,slate,.012)

    # Tractor undercarriage: ladder chassis, crossmembers and fifth wheel.
    for x in [-.62,.62]: box('ladder chassis rail',(x,14.55,.76),(.16,7.1,.22),rubber)
    for y in [11.4,12.5,13.5,14.7,16.4,17.5]: box('chassis crossmember',(0,y,.74),(1.4,.10,.14),slate,.01)
    cylinder('fifth wheel coupling',(0,12.0,1.01),.60,.13,rubber,rotation=(0,0,0))

    # Trailer body has separate framed panels, ribs, rub rails and real door hardware.
    box('trailer floor',(0,6.3,1.1),(2.53,12.6,.21),slate,.035)
    box('trailer box',(0,6.3,2.67),(2.53,12.6,2.92),silver,.06)
    for side in [-1,1]:
        for z in [1.17,4.10]: box('trailer perimeter rail',(side*1.30,6.3,z),(.055,12.64,.07),chrome,.014)
        for i in range(26): box('trailer vertical seam',(side*1.278,.22+i*.48,2.65),(.022,.035,2.85),chrome,.007)
        box('trailer lower rub rail',(side*1.308,6.3,1.31),(.04,12.4,.10),slate,.012)
        for y in [1,3,5,7,9,11.5]: box('side reflector',(side*1.337,y,1.33),(.015,.20,.055),amber,.005)
        box('side impact guard',(side*1.11,7.2,.65),(.10,5.1,.24),chrome,.018)
        for y in [5.5,8.9]: box('guard bracket',(side*.98,y,.88),(.13,.13,.7),slate,.012)
        box('landing gear',(side*.81,10.3,.69),(.14,.18,.8),slate,.012)
        box('landing foot',(side*.81,10.3,.23),(.40,.40,.06),chrome,.012)
    box('trailer rear door division',(0,-.028,2.65),(.045,.06,2.85),slate,.005)
    for x in [-1.13,-.51,.51,1.13]:
        cylinder('locking bar',(x,-.073,2.65),.027,2.52,chrome,rotation=(0,0,0),vertices=12)
        for z in [1.46,3.74]: box('door hinge',(x,-.10,z),(.14,.07,.12),slate,.01)
        box('door lock handle',(x,-.14,1.84),(.30,.04,.07),chrome,.01)
    box('rear underrun guard',(0,-.16,.60),(2.42,.16,.18),chrome)

    # Sculpted cab and bonnet use mesh profiles rather than intersecting blocks.
    profile('sleeper and cab shell',[(13.1,1.15),(15.4,1.15),(15.45,2.46),(15.19,3.42),(14.55,3.95),(13.42,3.95),(13.08,3.34)],2.39,navy,.10)
    profile('sculpted hood',[(15.30,1.04),(18.15,1.04),(18.10,1.93),(17.55,2.13),(15.40,2.40)],1.60,navy,.075)
    profile('aerodynamic roof fairing',[(13.0,3.78),(13.2,4.14),(14.13,4.14),(14.70,3.80)],2.31,slate,.07)
    # The glazing is aligned with the tilted windscreen face.
    polygon('windshield',[(-1.06,15.433,2.50),(1.06,15.433,2.50),(1.03,15.19,3.36),(-1.03,15.19,3.36)],[(0,1,2,3)],glass)
    beam('windscreen center seal',(0,15.436,2.50),(0,15.194,3.36),.027,rubber)
    for side in [-1,1]:
        x=side*1.201
        polygon('side glazing',[(x,14.30,2.49),(x,15.37,2.49),(x,15.14,3.30),(x,14.30,3.52)],[(0,1,2,3)],glass)
        box('door lower panel',(side*1.213,14.72,1.91),(.027,1.15,.79),slate,.02)
        box('door handle',(side*1.238,14.31,2.28),(.03,.20,.045),chrome,.01)
        box('sleeper vent',(side*1.217,13.56,2.85),(.024,.36,.55),rubber,.015)
        for z in [2.65,2.75,2.85,2.95,3.05]: box('vent louver',(side*1.238,13.56,z),(.018,.33,.025),chrome,.004)
        for z,y in [(.68,15.0),(.94,14.85)]: box('cab access step',(side*1.23,y,z),(.45,1.04,.12),chrome,.022)
        cylinder('diesel tank',(side*1.07,13.32,.82),.33,1.23,chrome,rotation=(math.pi/2,0,0))
        for y in [12.93,13.72]: box('tank strap',(side*1.34,y,.82),(.035,.06,.58),slate,.008)
        beam('mirror arm',(side*1.16,15.10,3.17),(side*1.56,15.43,3.06),.032,chrome)
        beam('mirror lower support',(side*1.19,15.27,2.54),(side*1.56,15.43,2.68),.024,chrome)
        box('mirror body',(side*1.58,15.43,2.90),(.10,.30,.51),navy,.035)
        box('mirror glass',(side*1.638,15.43,2.90),(.008,.25,.43),glass,.006)
        cylinder('vertical exhaust',(side*1.24,13.01,2.80),.058,2.8,chrome,rotation=(0,0,0),vertices=16)
        cylinder('exhaust cap',(side*1.24,13.01,4.20),.061,.04,rubber,rotation=(0,0,0),vertices=16)

    box('recessed grille',(0,18.172,1.53),(1.35,.06,.80),rubber,.035)
    for z in [1.20+i*.083 for i in range(9)]: box('horizontal grille blade',(0,18.215,z),(1.25,.035,.025),chrome,.005)
    box('front chrome bumper',(0,18.18,.76),(2.6,.21,.30),chrome,.045)
    for side in [-1,1]:
        box('headlamp housing',(side*.995,17.99,1.17),(.44,.37,.32),slate,.04)
        box('LED headlamp',(side*.995,18.188,1.21),(.37,.025,.16),white,.018)
        box('indicator',(side*1.075,18.19,1.045),(.17,.025,.046),amber,.008)
        fender(17.03,side)
    for x in [-.86,-.43,0,.43,.86]: box('cab roof marker',(x,14.85,3.77),(.10,.12,.045),white,.015)

    # Five axles, eighteen tires, deep rims, hubcaps and eight lugs per visible wheel.
    for y,is_front in [(17.03,True),(12.05,False),(13.35,False),(2.1,False),(3.4,False)]:
        cylinder('axle',(0,y,.54),.10,2.3,rubber,vertices=12)
        for side in [-1,1]:
            wheel_positions=[1.10] if is_front else [.88,1.19]
            for wheel_x in wheel_positions:
                x=side*wheel_x
                bpy.ops.mesh.primitive_torus_add(major_radius=.365,minor_radius=.175,major_segments=32,minor_segments=12,location=(x,y,.54),rotation=(0,math.pi/2,0))
                tire=finish(bpy.context.object,'tire sidewall and tread',rubber)
                for face in tire.data.polygons: face.use_smooth=True
                outward=x+side*.143
                cylinder('wheel rim',(outward,y,.54),.314,.045,chrome)
                cylinder('hub recess',(outward+side*.030,y,.54),.216,.026,rubber)
                cylinder('hubcap',(outward+side*.054,y,.54),.132,.080,chrome)
                for n in range(8):
                    angle=n*math.tau/8
                    cylinder('wheel lug',(outward+side*.052,y+math.cos(angle)*.226,.54+math.sin(angle)*.226),.026,.035,chrome,vertices=8)
            if not is_front:
                box('mud flap',(side*1.10,y-.59,.43),(.68,.038,.58),rubber,.012)

    # Minimal fictional brand lettering embossed on each trailer side.
    for side in [-1,1]:
        data=bpy.data.curves.new('DUANOR trailer wordmark','FONT')
        data.body='DUANOR';data.align_x='CENTER';data.size=.66;data.extrude=.001
        text=bpy.data.objects.new('Truck · DUANOR trailer wordmark',data)
        collection.objects.link(text)
        text.location=(side*1.31,6.75,2.56)
        text.rotation_euler=(math.pi/2,0,math.pi/2 if side>0 else -math.pi/2)
        data.materials.append(navy)
        bpy.ops.object.select_all(action='DESELECT');text.select_set(True);bpy.context.view_layer.objects.active=text
        bpy.ops.object.convert(target='MESH')

    objects=[obj for obj in set(bpy.data.objects)-before if obj.type=='MESH']
    for obj in objects:
        obj.location+=Vector(origin)
        obj['provenance']='Original mesh authored for DUANOR in Blender with scripts/newtruck.py; no third-party truck asset.'
    bpy.context.view_layer.update()
    coords=[obj.matrix_world@Vector(corner) for obj in objects for corner in obj.bound_box]
    bounds=[[min(p[i] for p in coords) for i in range(3)],[max(p[i] for p in coords) for i in range(3)]]
    print('DUANOR_TRUCK_BOUNDS',bounds,'mesh parts',len(objects))
    return objects
