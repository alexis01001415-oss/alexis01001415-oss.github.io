# DUANOR — Aduanas y logística · V5

Prototipo comercial de una marca ficticia con base conceptual en Ciudad de México. Proyecto local en `C:\Users\alexi\Desktop\agencia aduanal web`. Sitio estático exportable a Hostinger, construido con Astro, TypeScript, Three.js, GSAP ScrollTrigger y jsPDF. Interfaz y contenidos en español de México.

La quinta iteración amplía y suaviza el indicador del hero, incorpora seis marcas ficticias de Logoipsum y sustituye el antiguo cintillo. Textos y tarjetas aparecen progresivamente con respeto por la preferencia de movimiento reducido. El cierre está centrado con luz azul tenue; contacto comparte el acabado y los márgenes del cotizador. En tablet y móvil, el CTA del header está dentro del menú. Conserva la paleta azul, Space Grotesk, DM Sans, el recorrido 3D responsive, las soluciones bento, el mapa, la línea de tiempo y el cotizador con PDF. Consulta [QA.md](QA.md) para las comprobaciones y configuración pendiente.

## Ejecutar y construir

Requiere Node.js 22.12+ (ver los requisitos de la versión de Astro del lockfile; desarrollado con Node 24) y npm.

```bash
npm ci
npm run dev
npm run build
npm run preview
npm test
```

`npm run build` verifica Astro/TypeScript y compila las páginas estáticas en `dist/`. `npm run preview` permite revisar esa compilación. El desarrollo no requiere servicios de backend. Las dependencias están fijadas en `package-lock.json`. Blender solo es necesario para editar los modelos fuente; no para ejecutar o compilar el sitio.

### Vista previa en el celular

Ejecuta `npm run preview -- --port 4324` y conecta el celular a la misma red local que esta computadora. La dirección de la sesión V5 es **http://192.168.100.84:4324/**; el QR está en `artifacts/duanor-mobile-qr.png`. La computadora y el servidor deben permanecer encendidos. Es un acceso local, no una publicación en Internet. Si cambia la IP asignada por el router, actualiza la dirección y el QR. Se comprobó HTTP 200 desde la computadora; queda pendiente verificarlo desde el teléfono físico y su red. No se modificó el firewall.

## Dónde poner tu clave de Web3Forms

Abre **`.env`, en la raíz de esta carpeta**, junto a `package.json`. Ya está creado, con la clave vacía. En una copia nueva del repositorio, copia `.env.example` como `.env`:

```dotenv
PUBLIC_WEB3FORMS_ACCESS_KEY=PEGA_AQUI_TU_ACCESS_KEY
PUBLIC_SITE_URL=https://www.dominio-del-cliente.mx
PUBLIC_DEMO_MODE=true
```

La clave debe ser la access key del formulario de [Web3Forms](https://web3forms.com/), asociada al correo en el que quieres recibir solicitudes. Es una clave pública por diseño del proveedor, no una clave privada de API. Nunca pongas secretos en variables `PUBLIC_`. Reinicia desarrollo o vuelve a ejecutar `npm run build` después de cambiarla. No basta con subir el `.env` a Hostinger: el valor se incorpora durante la compilación.

Sin clave, el usuario puede completar el cotizador y descargar el PDF; el envío se muestra deshabilitado, sin éxito simulado. Con clave, pulsa **Enviar solicitud**. El formulario transmite los datos, conceptos, rango y folio a Web3Forms con validación, honeypot, timeout y tratamiento de errores. Solo confirma cuando HTTP es correcto y el proveedor devuelve `success: true`. Esto confirma aceptación del servicio, no lectura ni entrega en bandeja. El PDF se descarga localmente; el correo contiene la información equivalente, no un adjunto. No requiere el plan de adjuntos de Web3Forms.

El formulario de contacto del footer y de `/contacto/` usa **la misma clave**. Solicita nombre, correo, empresa opcional, tema y mensaje, con consentimiento. Sin clave, su envío también permanece deshabilitado. No pide adjuntos ni envía un correo automáticamente al descargar el PDF.

## Publicación en Hostinger

1. Personaliza marca, datos de empresa, autorizaciones reales, servicios, rutas y tarifas. Completa y revisa privacidad y términos. El nombre del prototipo no implica disponibilidad de marca.
2. Coloca el dominio HTTPS definitivo y la clave de Web3Forms en `.env`.
3. Cuando el sitio represente al cliente real, cambia `PUBLIC_DEMO_MODE=false`. Este ajuste cambia robots y metadatos de indexación; no reescribe las menciones demostrativas ni las tarifas: revisa también los contenidos y PDF indicados abajo.
4. Ejecuta `npm ci`, `npm test` y `npm run build`. Revisa `npm run preview` y los puntos de [QA.md](QA.md).
5. Sube **el contenido de `dist/`**, incluyendo `.htaccess`, a `public_html` en Hostinger. No subas la carpeta `dist` como un subdirectorio. No subas `.env`, `src`, `assets`, `node_modules`, tests ni artefactos de QA.
6. Activa SSL y la redirección a HTTPS en hPanel; elige un único dominio principal (con o sin www) y redirige el otro.
7. Verifica inicio, rutas internas, 404, PDF, robots y sitemap. Realiza un envío real con datos de prueba, comprueba el correo destino y la carpeta de spam.
8. Registra `https://tu-dominio/sitemap-index.xml` en Search Console cuando corresponda.

No requiere Node, PHP ni una base de datos en producción. Las rutas corresponden a directorios con `index.html`; no hay rewrite de aplicación SPA. La página de error se sirve con `ErrorDocument 404 /404.html`. `.htaccess` incluye compresión, caché y cabeceras básicas. Respeta reglas preexistentes si el hosting ya aloja otro sitio.

## Proyecto local y GitHub Pages

El repositorio está preparado para publicarse como sitio de usuario en `alexis01001415-oss.github.io`. La rama de publicación es `main`. El workflow `.github/workflows/pages.yml` instala las dependencias bloqueadas, ejecuta las pruebas, compila Astro y publica `dist/` en GitHub Pages. `.github/workflows/ci.yml` conserva la verificación independiente para pushes y pull requests.

La publicación usa modo demostración y no incorpora una clave de Web3Forms. El cotizador puede generar el PDF, pero los envíos permanecen deshabilitados hasta configurar la clave del cliente en otro entorno. `.gitignore` excluye `.env`, dependencias, compilaciones, artefactos de QA y paquetes; conserva las fuentes, créditos, modelos web y archivos Blender editables.

Para un despliegue manual nuevo, crea o usa el repositorio público `alexis01001415-oss.github.io`, configura GitHub Pages con **GitHub Actions** como origen y sube `main`. La dirección resultante es `https://alexis01001415-oss.github.io/`.

## Personalización

| Qué cambiar                           | Archivo                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Clave, dominio e indexación           | `.env`                                                                                                              |
| Nombre, servicios y preguntas         | `src/data/site.ts`                                                                                                  |
| Logo y wordmark                       | `src/components/Brand.astro`, `public/favicon.svg`                                                                  |
| Portada y secciones                   | `src/pages/index.astro`                                                                                             |
| Marcas ilustrativas                   | `src/components/CollaborationLogos.astro`, `public/logos/`, `assets/logo-sources.md`                                |
| Entradas de textos y tarjetas         | `src/scripts/reveal.ts`, `src/styles/reveal.css`                                                                    |
| Hero, cierre, header y contacto V5    | `src/styles/refinements-v5.css`, `src/styles/header-contact-v5.css`, `src/styles/contact.css`                       |
| Colores, tipografías y responsive     | `src/styles/global.css`, `src/styles/brand-v3.css`, `src/styles/typography-v4.css`, `src/styles/interaction-v4.css` |
| Escenas, iluminación y recorrido      | `src/scripts/journey.ts` y módulos 3D en `src/scripts/`                                                             |
| Modelos editables en Blender          | `assets/blender/`                                                                                                   |
| Modelos optimizados para navegador    | `public/models/`                                                                                                    |
| Procedencia y licencias               | `assets/README-SOURCES.md`, `src/pages/creditos.astro`                                                              |
| Formulario, campos y estados          | `src/components/QuoteForm.astro`, `src/scripts/quote.ts`                                                            |
| Tarifas comerciales ilustrativas      | `src/scripts/estimate.ts`                                                                                           |
| Diseño y textos PDF                   | `src/scripts/pdf.ts`                                                                                                |
| Identidad real, privacidad y términos | `src/pages/nosotros.astro`, `src/pages/privacidad.astro`, `src/pages/terminos.astro`, footer                        |
| Guías y fuentes                       | `src/data/articles.ts`                                                                                              |
| Canonical y JSON-LD                   | `src/layouts/Layout.astro`                                                                                          |

## Cotizador y alcance

Tres pasos: operación y ruta; mercancía; contacto y consentimiento. Valor comercial no es valor en aduana. La fracción y el NICO se solicitan por separado y son opcionales. No se solicitan RFC, contraseñas ni e.firma.

Las tarifas son **inventadas para la demostración**, no precios de mercado: importación 3,800 MXN, exportación 3,200; coordinación marítima 1,600, aérea 1,000, terrestre 700; revisión adicional 900 y clasificación preliminar 1,200. El rango superior aplica un margen ilustrativo de 25%, con redondeo hacia arriba a centenas. No se calculan impuestos ni aranceles. Una modalidad por definir, régimen temporal/por definir o carga especial produce “Revisión especializada”, sin monto ofertado.

El PDF y el correo consumen la misma instantánea de datos. Editar y volver a crear genera nuevo folio. Los datos quedan en memoria, sin localStorage, base de datos ni analítica. El PDF usa Space Grotesk y DM Sans incrustadas, conserva caracteres españoles y pagina los textos largos. Para alfabetos sin cobertura se incluye una nota de normalización. La ficha normal tiene tres páginas; datos extensos pueden agregar páginas.

## Diseño, rendimiento y accesibilidad

- V2 incorpora modelos de terceros CC0, materiales y composición preparada en Blender. Fuentes editables en `assets/blender/` y exportaciones de producción en `public/models/`; procedencia en [assets/README-SOURCES.md](assets/README-SOURCES.md).
- Límite de resolución de WebGL; actualización móvil limitada; pausa cuando el recorrido sale de pantalla o la pestaña se oculta; botón para pausar y soporte de `prefers-reduced-motion`.
- Si no hay WebGL, se conserva un fallback gráfico y todos los contenidos y formularios. La página se sirve como HTML estático; el cotizador/PDF y las animaciones necesitan JavaScript.
- Imágenes conceptuales originales generadas por IA y optimizadas a WebP. Tipografías locales Space Grotesk y DM Sans, bajo SIL Open Font License 1.1, sin petición a Google Fonts.
- jsPDF y las tres TTF estáticas se cargan únicamente al descargar. Enlaces semánticos, navegación por teclado, estado ARIA de menús y asistente, validación, enlace para saltar contenido, estados de error accesibles.
- Canonical por página, títulos y descripciones, metadatos Open Graph/X, favicon, JSON-LD Organization/WebSite/WebPage, sitemap y robots generados desde el dominio configurado. No se inventan reseñas, direcciones, patentes ni certificaciones.

El prototipo permanece **noindex** por defecto para no publicar una agencia ficticia en buscadores. El SEO técnico está implementado; posicionamiento y resultados comerciales no están garantizados. Después de cambiar los modelos o cámaras, vuelve a comprobar movimiento reducido, pausa, fallback, carga fallida y tamaños móviles; los resultados históricos no sustituyen la validación de V4.

## Recursos y fuentes de investigación

- [SNICE: logística previa al despacho](https://www.snice.gob.mx/cs/avi/snice/comercio.aprende.importar.logistica.html) — base para los campos operativos y modalidades.
- [SAT: padrón de importadores](https://www.sat.gob.mx/minisitio/PadronImportadoresExportadores/pi_inscripcion.html).
- [SNICE: NICO](https://www.snice.gob.mx/cs/avi/snice/ligie.nico2022.html).
- [SNICE: exportación](https://www.snice.gob.mx/cs/avi/snice/comercio.aprende.exportar.html).
- [Web3Forms: HTML y JavaScript](https://docs.web3forms.com/how-to-guides/html-and-javascript), [API](https://docs.web3forms.com/getting-started/api-reference), [FAQ y clave pública](https://docs.web3forms.com/getting-started/faq).
- [Astro: despliegue en Hostinger](https://docs.astro.build/en/guides/deploy/hostinger/).
- [Three.js: WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html), [GSAP: ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [jsPDF](https://github.com/parallax/jsPDF).
- Las referencias visuales aportadas por el usuario orientan composición, ritmo y movimiento. No se reutilizan código, logotipos ni imágenes de esas páginas.

## Diseño y fuentes adicionales

- [Mapa de las 16 alcaldías de CDMX](https://datos.cdmx.gob.mx/dataset/alcaldias), INEGI Marco Geoestadístico 2020, distribuido por Datos Abiertos CDMX bajo CC BY 4.0. Geometría adaptada en `public/maps/cdmx.svg`, atribución en `/creditos/` y método en [assets/map-source.md](assets/map-source.md). Dos marcadores agrupan Pantaco y AICM; cinco fichas describen las aduanas y secciones oficiales sin atribuirlas a DUANOR.
- [Creative Buttons de Codrops](https://tympanus.net/Development/CreativeButtons/) y [Button Hover Styles](https://github.com/codrops/ButtonHoverStyles) se consultaron como referencias de interacción. Los botones usan una implementación propia de revelado circular, flecha, foco y estado presionado.
- PDF: `public/fonts/pdf/` conserva las TTF y licencias; `src/scripts/pdf.ts` controla distribución, márgenes y paginación.
- Contacto: `src/components/ContactForm.astro`, `src/scripts/contact.ts` y `src/styles/contact.css`.
- El camión del capítulo Destino se creó para el proyecto en Blender mediante `scripts/newtruck.py`, sin geometría de camiones de terceros. Fuente editable dentro de la escena de bodega.

## Modelos y licencias

Los modelos de terceros incorporados son **CC0**: [Container ship full, de Sketlux](https://opengameart.org/content/container-ship-full); [Steel Frame Shelves 02, de James Ray Cock](https://polyhaven.com/a/steel_frame_shelves_02); y [Cardboard Box 01, de Rahul Chaudhary](https://polyhaven.com/a/cardboard_box_01). Las fuentes permiten uso comercial y adaptación. La atribución es voluntaria bajo CC0 y se conserva en `/creditos/` por transparencia. La composición del interior y su recorrido se preparan para DUANOR en Blender.

El inventario, evidencia y distinción entre recursos incorporados y opciones investigadas están en [assets/README-SOURCES.md](assets/README-SOURCES.md). El exterior `warehouse02` se investigó, pero no forma parte de los modelos acreditados como incorporados. No se reutilizan miniaturas ni renders de las bibliotecas. CC0 describe los modelos citados; las fuentes tipográficas y dependencias de software mantienen sus propias licencias.

Para editar 3D, conserva los originales, trabaja sobre una copia y exporta derivados optimizados. Mantén los nombres de nodos y puntos de interés utilizados por la cámara, o actualiza el recorrido junto con el modelo. Los modelos se sirven desde el propio sitio; no necesitan cuentas de Sketchfab/Poly Haven ni una API en producción.

Fuentes entregadas: `assets/blender/container-ship.blend` y `assets/blender/warehouse-journey.blend`, con materiales y texturas empaquetadas. Los scripts `scripts/build-ship.py` y `scripts/build-warehouse.py` documentan la adaptación en Blender 5.1; para reconstruir desde cero, descarga los originales listados en el inventario. La bodega acepta `DUANOR_ASSETS` como ruta al directorio con las carpetas de los dos assets Poly Haven. `scripts/optimize-models.mjs` optimiza las texturas del GLB de bodega preservando los buffers Draco. Las vistas estáticas son renders propios de Blender.

El buque web pesa 193 KB y la bodega 3.73 MB. La bodega se descarga al acercarse al recorrido en cualquier tamaño de pantalla, también en móvil horizontal. Con movimiento reducido se muestran seis capítulos ilustrados y se ofrece activar el 3D de forma explícita. Sin JavaScript o WebGL quedan las escenas y el contenido accesibles. Los decodificadores se sirven localmente en `public/decoders/draco/` con su licencia Apache 2.0. Las licencias de las fuentes y Three.js están también en `public/licenses/`.

## Imágenes creadas

`public/images/port.webp`, generada con el modelo integrado de creación de imágenes y comprimida a WebP. Prompt final: “A single panoramic premium editorial photograph of a fictional Mexican commercial seaport at dark dusk, monumental dark black-green container ship with orderly desaturated green and muted clay containers, low aerial diagonal view, monumental silhouetted gantry cranes, black water, pale lime industrial light and faint amber sunset, cinematic natural realism, approximately 2.35:1; no text, logos, brands, watermark or UI.” No representa instalaciones de una empresa real.

V2 añade `public/images/inspection.webp` y `public/images/manufacturing.webp`: escenas conceptuales de inspección de mercancías y manufactura de precisión, generadas con IA. Los prompts se conservan en el inventario de fuentes. No se presentan como fotografías de instalaciones o clientes reales.

## Componentes de la iteración V4

- Soluciones: `src/components/SolutionsBento.astro` y `src/styles/solutions-bento.css`.
- Proceso: `src/components/ProcessTimeline.astro` y `src/styles/process-timeline.css`; navegación por enlaces, teclado y progreso de lectura.
- Documentación: `src/components/DocumentFlow.astro` y `src/styles/document-flow.css`; SVG original con pausa, movimiento reducido y suspensión fuera de pantalla.
- Aduanas de CDMX: `src/components/CdmxMap.astro`, `public/maps/cdmx.svg` y [fuentes y proyección](assets/map-source.md). Las referencias públicas no son oficinas de DUANOR.
- Ticket de estimación: `src/styles/quote-ticket.css`; el código de barras es decorativo y no constituye un comprobante de pago.
- Iconos: `src/components/Icon.astro`, generados como SVG sin JavaScript adicional; licencia en `public/licenses/Lucide.txt`.
