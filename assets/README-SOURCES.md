# DUANOR V2 — procedencia de recursos

Fuentes revisadas el 17 de septiembre de 2026. Este inventario adapta la investigación de modelos para distinguir los recursos seleccionados para la web de las alternativas únicamente investigadas. La licencia de los modelos no se extiende automáticamente al software, las fuentes tipográficas o las imágenes del sitio.

## Modelos incorporados

| Recurso                | Autor           | Fuente oficial                                                     | Licencia | Fuente editable                             |
| ---------------------- | --------------- | ------------------------------------------------------------------ | -------- | ------------------------------------------- |
| Container ship full    | Sketlux         | [OpenGameArt](https://opengameart.org/content/container-ship-full) | CC0      | Blender `.blend`                            |
| Steel Frame Shelves 02 | James Ray Cock  | [Poly Haven](https://polyhaven.com/a/steel_frame_shelves_02)       | CC0      | Blender `.blend`, además de glTF y texturas |
| Cardboard Box 01       | Rahul Chaudhary | [Poly Haven](https://polyhaven.com/a/cardboard_box_01)             | CC0      | Blender `.blend`, además de glTF y texturas |

La escena de bodega se compone para DUANOR en Blender con los modelos de estantería y caja, arquitectura y disposición propias. Las fuentes editables de la entrega se conservan en `assets/blender/`; los GLB optimizados que consume la web se sirven desde `public/models/`. El barco parte del modelo de Sketlux y se adapta a la dirección visual del proyecto. No se atribuye a DUANOR la autoría original de estos tres recursos.

### Permisos y evidencia

- La página de OpenGameArt identifica a Sketlux, publica `Container ship full` bajo CC0 y ofrece directamente el archivo [container-ship-full.blend1_.blend](https://opengameart.org/sites/default/files/container-ship-full.blend1_.blend). El original descargado pesa 6,514,552 bytes.
- Las páginas de Poly Haven identifican a James Ray Cock y Rahul Chaudhary, ofrecen archivos Blend/glTF y enlazan su licencia CC0. Los metadatos y manifiestos de descarga se consultaron durante la preparación. Fuentes de referencia: estante de 4,348 triángulos y caja de 16,952 triángulos; las exportaciones optimizadas pueden diferir.
- [Poly Haven: licencia](https://polyhaven.com/license) permite uso comercial, modificación y redistribución de sus assets sin atribución obligatoria. Las miniaturas, renders de ejemplo, logos y textos de la web tienen condiciones distintas y no se incorporan al sitio de DUANOR.
- [CC0 1.0: resumen](https://creativecommons.org/publicdomain/zero/1.0/) y [texto legal](https://creativecommons.org/publicdomain/zero/1.0/legalcode). La atribución se conserva voluntariamente como registro de procedencia; no implica colaboración ni respaldo de los autores.
- No se incorporan modelos NC (uso no comercial) ni ND (sin derivados). Las descargas seleccionadas eran públicas y no requirieron compras ni eludir accesos.

SHA-256 del `.blend` original de Sketlux:

```text
B873A1A6F7CCD3B0646BEB020AA95BC062F72ECF2D8C3C47FDF630E824CAA9B6
```

Crédito público mantenido en `/creditos/`: modelos adaptados de Container ship full, de Sketlux (OpenGameArt); Steel Frame Shelves 02, de James Ray Cock; y Cardboard Box 01, de Rahul Chaudhary (Poly Haven). Modelos fuente CC0. Adaptación, composición y recorrido web para DUANOR.

## Opciones investigadas que no se acreditan como incorporadas

- [Warehouse building, low poly — 32kda](https://opengameart.org/content/warehouse-building-low-poly): exterior arquitectónico CC0, archivo `warehouse02.zip` descargado durante la investigación; contiene `.blend`, GLB y texturas. **No se utiliza como interior ni se afirma incorporado al sitio.** Archivo original: 32,374,751 bytes; SHA-256 `D6D914E3189AF802B0A696C02B7816D7B898C289DDFF35B937D226FB3ED0CF6A`.
- [Low-Poly Isometric Warehouse Scene — TheGIWI](https://blendswap.com/blend/21850): escena Blender CC0; descarga requiere sesión, no adquirida.
- [cargo-ship — loopo](https://blendswap.com/blend/6381): Blender CC0; descarga requiere sesión, no adquirida.
- [Cargo ship — hungry_drifter](https://sketchfab.com/3d-models/cargo-ship-b7c97df584824ca682d26daabf401f87): página directa bloqueada durante la investigación. No se validaron archivo, licencia concreta u origen Blender ni se descargó. No es un asset de producción.
- [Kenney Watercraft Kit](https://kenney.nl/assets/watercraft-kit): explorado en V1, sin recursos incorporados.

Esta lista es un historial de investigación, no una lista de créditos de la web publicada.

## Imágenes conceptuales originales

Generadas con la herramienta integrada de creación de imágenes y comprimidas a WebP. Se usan imágenes propias generadas, no fotografías descargadas de las referencias. No representan instalaciones, mercancías, personas o clientes de una agencia real.

### Puerto — V1

Archivo: `public/images/port.webp`.

Prompt final:

> A single panoramic premium editorial photograph of a fictional Mexican commercial seaport at dark dusk, monumental dark black-green container ship with orderly desaturated green and muted clay containers, low aerial diagonal view, monumental silhouetted gantry cranes, black water, pale lime industrial light and faint amber sunset, cinematic natural realism, approximately 2.35:1; no text, logos, brands, watermark or UI.

### Inspección — V2

Archivo: `public/images/inspection.webp`. Original generado: 1672 × 941 píxeles.

Prompt final:

> Use case: photorealistic-natural. Asset type: editorial photograph for a premium Mexican customs and international logistics website. Create a panoramic 16:9 cinematic close photograph of textured dark work gloves carefully checking a neutral ivory shipping label on a kraft export carton, a small unbranded inspection stamp beside it and a dark tablet softly out of focus on a documentation and inspection workbench inside an upscale industrial warehouse. Only hands in gloves visible, no recognizable faces. Strong oblique warm natural light, deep charcoal and olive shadows, very subtle lime accent reflected in the background. Authentic premium industrial editorial photography, tactile cardboard fibers and matte gloves, shallow depth of field, fine realistic film grain, close composition with a little atmospheric breathing room. No legible text, no logos, no watermark, no UI, no mockup, no collages. Single finished photograph.

### Manufactura — V2

Archivo: `public/images/manufacturing.webp`. Original generado: 1672 × 941 píxeles.

Prompt final:

> Use case: photorealistic-natural. Asset type: premium industrial editorial website photograph. Create a single panoramic 16:9 photograph of an industrial robotic arm handling a precision machined metallic component in a conceptual modern Mexican manufacturing factory. Dynamic close framing: the robotic gripper and immaculate complex machined aluminum part are tack sharp in the foreground, the articulated industrial arm extends diagonally into the scene. Sophisticated deep green and near-black factory environment, cool white linear industrial lighting, subtle warm amber signal light accent. Real premium magazine photography, plausible industrial mechanism, brushed metal and finely machined grooves, crisp details and natural optical depth of field, subtle film grain, restrained cinematic contrast. No brands, no logos, no readable text, no watermark, no recognizable people, no UI, no collages, no science fiction. One finished photograph.

## Tipografías y software

- Space Grotesk: The Space Grotesk Project Authors, [proyecto oficial](https://github.com/floriankarsten/space-grotesk). SIL Open Font License 1.1. Paquete web `@fontsource-variable/space-grotesk`; licencia en `public/licenses/Space-Grotesk-OFL.txt`.
- DM Sans: The DM Sans Project Authors, [proyecto oficial](https://github.com/googlefonts/dm-fonts). SIL Open Font License 1.1. Paquete web `@fontsource-variable/dm-sans`; licencia en `public/licenses/DM-Sans-OFL.txt`. Fuentes TTF para PDF y procedencia en `public/fonts/pdf/README.md`.
- Las tipografías se sirven localmente. Conserva sus avisos de licencia al redistribuirlas o modificarlas.
- Astro, Three.js, GSAP, jsPDF y demás dependencias conservan sus respectivas licencias. Consulta las versiones fijadas en `package-lock.json` y los archivos de licencia de cada paquete. Este inventario no declara todo el proyecto como CC0.

## Edición y exportación

Abre las fuentes Blender con ejecución automática de scripts desactivada. Conserva los originales y realiza adaptaciones en copias. No se necesita la API de Poly Haven en el sitio publicado. Tras exportar modelos, comprueba materiales, escala, nombres de nodos utilizados por el recorrido, tamaño de descarga y todas las posiciones de cámara. Actualiza estos créditos si cambia algún recurso incorporado.

## Camión original — V3

El tractor con semirremolque que aparece al final del recorrido es un modelo original construido para este prototipo dentro de Blender, mediante `scripts/newtruck.py`, e incorporado a `assets/blender/warehouse-journey.blend`. No procede de Sketchfab ni de otro repositorio de camiones y no se presenta como un modelo comprado, escaneado o de una marca real. No incorpora texturas, logos o geometría de camiones de terceros.

El modelo incluye cabina con perfil moldeado, capó, deflector, vidrios, espejos y sus soportes, parrilla, faros, indicadores, depósitos, escape, escalones, chasis, quinta rueda, cinco ejes, dieciocho neumáticos, rines con birlos, salpicaderas, puertas y herrajes del remolque. Las piezas son mallas reales creadas y exportadas en Blender; el navegador carga el GLB resultante. El conjunto utiliza la nueva paleta navy, slate y silver del sitio. El cartón y la madera de los recursos existentes conservan sus tonos naturales.

Se revisaron alternativas comerciales permitidas, pero **no se incorporaron**: [Semi-Trailer Truck (lowpoly), Teh_Bucket](https://opengameart.org/content/semi-trailer-truck-lowpoly), CC0, 450 triángulos; [FSTruck-001, Karmabub](https://opengameart.org/content/fstruck-001), CC0, estilo FreeStyle; y [3D Vehicles Pack, mehrasaur](https://opengameart.org/content/3d-vehicles-pack), CC0, modelos de arcilla. Su nivel de detalle o estilo no se ajustaba a esta escena. Estos autores no se acreditan como autores del camión utilizado.

Las imágenes `ship-fallback.webp` y `warehouse-0.webp` a `warehouse-5.webp` son renders propios de las escenas Blender entregadas, iluminados de nuevo para la paleta V3 `#0d1b2a`, `#1b263b`, `#415a77`, `#778da9`, `#e0e1dd`. La última imagen muestra el exterior del andén y el camión; las primeras cinco posiciones de cámara se conservan.

## Iconos y gráfico documental — V4

- [Lucide](https://lucide.dev/license): biblioteca de iconos SVG de interfaz, incluida mediante `@lucide/astro`. Licencia ISC; los iconos derivados de Feather conservan MIT. Avisos incluidos en `public/licenses/Lucide.txt`. No requiere API ni descarga externa durante la visita.
- La composición animada `src/components/DocumentFlow.astro` es un SVG original creado para este proyecto. No utiliza Lottie ni imágenes de terceros.
- La cartografía y los puntos oficiales de aduana se documentan en [map-source.md](map-source.md).

## Marcas ficticias — V5

Seis SVG de [Logoipsum](https://logoipsum.com/), diseñados por Rizal para SignalSupply, adaptados a la paleta del sitio y alojados localmente. Se utilizan exclusivamente como muestras ilustrativas, conforme a la [Logoipsum Fair Use License](https://logoipsum.com/license). No representan clientes ni relaciones comerciales reales. Procedencia de cada diseño, adaptaciones y condiciones en [logo-sources.md](logo-sources.md); crédito visible en `/creditos/`.
