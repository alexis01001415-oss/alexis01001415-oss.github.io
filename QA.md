# Registro de verificación

Este registro distingue las comprobaciones de V5 de los resultados históricos de V1 a V4. Los resultados anteriores no certifican la nueva versión. No se ha desplegado en una cuenta de hosting ni publicado el repositorio en GitHub.

## V5 — comprobaciones del 17 de septiembre de 2026

- Publicación en GitHub Pages completada el 19 de septiembre de 2026: repositorio público `alexis01001415-oss/alexis01001415-oss.github.io`, HTTPS forzado y despliegue mediante GitHub Actions. Home, ruta de servicio, modelos GLB, imagen editorial, robots y sitemap respondieron HTTP 200. Smoke remoto a 1440, 768 y 390 px: canvas 3D, seis logos, header, cotizador y contacto presentes; sin overflow ni errores JavaScript.
- Build final: 17 páginas; Astro/TypeScript revisa 51 archivos sin errores, warnings ni hints. Vite conserva el aviso de tamaño del módulo Three.js diferido.
- QA estática del build final: 769 enlaces y 288 fragmentos internos, sin destinos ausentes; 17 títulos/descripciones/canonicals únicos y JSON-LD válido. `artifacts/qa-static-v5.json`. El sitio sigue en modo demo/noindex.
- `scripts/qa-v5.mjs`: 56/56 controles en Edge. Viewports 1440×1000, 1920×1080, 1024×768, 768×1024, 390×844, 360×740 y 844×390. Sin desbordamiento horizontal ni colisiones entre CTA e indicador del hero. Header vuelve al subir desde secciones profundas. Las 17 páginas responden y las secundarias caben a 390 px. Cero errores JavaScript y cero hallazgos Axe en home a 1440 y 390 px. Capturas revisadas en escritorio y móvil.
- Indicador del hero: 6/6 controles. Círculo de proporción 1:1 a 1440/1024/768/390/360; textos separados y sin DNR. El tiempo de la animación y su desplazamiento continúan al bajar y subir, sin reiniciar el ciclo. `artifacts/qa-v5-cue.json`.
- Seis SVG de Logoipsum cargan localmente, con licencia y procedencia documentadas. Sección inmediatamente después del hero, con aviso de marcas ilustrativas. Sin overflow a 360/768/1440 y sin hallazgos Axe en revisión aislada. Cintillo anterior eliminado. Cierre centrado con halo azul y sin sello DNR.
- Header: CTA dentro del menú a 360/768/1024/1100 y en la barra a partir de 1101 px. Escape devuelve foco; enlaces y cambio a escritorio cierran el menú. Menú horizontal 844×390 desplazable y último enlace alcanzable. `artifacts/header-interaction-v5-report.json` y `header-keyboard-v5-report.json`.
- Contacto en home y `/contacto/`: mismos márgenes, padding, borde y fondo que el panel del cotizador a 360/768/1440. Cero overflow, errores JS o incidencias Axe. `artifacts/contact-layout-v5-report.json`. Los campos, cálculos, PDF y envío no cambiaron; no se enviaron correos reales.
- Entradas de textos y tarjetas: 11/11 controles dirigidos de animación, escalonado, limpieza, ejecución única, foco, enlaces internos, movimiento reducido inicial/dinámico y contenido visible sin JavaScript. Hero, recorrido 3D, mapa y formularios excluidos. `artifacts/qa-reveal.json` identifica el build comprobado.
- Confirmación sobre el build final de las 23:46:16: 10/10 controles aprobados. Reinicializar el documento y una tarjeta no duplica elementos ni observers; los contenidos ya mostrados no vuelven a animarse. Entrada, foco, movimiento reducido y contenido sin JS correctos. `artifacts/qa-reveal-final-v5.json`. No fue necesario modificar ni recompilar después.
- Vista previa LAN: servidor escuchando en `0.0.0.0:4324`; `http://192.168.100.84:4324/` devuelve HTTP 200 desde esta computadora. QR local en `artifacts/duanor-mobile-qr.png`. Requiere celular en la misma red y computadora/servidor activos. No se modificó el firewall ni se publicó un túnel. La conectividad y el rendimiento en un teléfono físico quedan pendientes.
- Paquete V5: `releases/duanor-hostinger-v5.zip`, 4,768,081 bytes y 81 archivos. Incluye `.htaccess`, seis logos, licencias y contenido estático. Sin `.env`, fuentes del proyecto ni artefactos de QA/QR. Compilación demostrativa, pendiente de personalización y configuración para el cliente.

## V4 — comprobaciones del 17 de septiembre de 2026

- Build estático: 17 páginas; Astro/TypeScript sin errores, warnings ni hints. Vite conserva la advertencia de tamaño del módulo Three.js, cargado de forma diferida. Las salidas de QA y paquetes quedan excluidas del análisis TypeScript.
- `npm test`: 3/3 pruebas de estimación; `npm audit --omit=dev`: 0 vulnerabilidades notificadas.
- `scripts/qa-v4.mjs`: 56/56 controles en Edge. Tamaños 1440×1000, 1920×1080, 1024×768, 768×1024, 390×844, 360×740 y 844×390. Sin overflow; textos y botones del hero no se superponen; el header vuelve al subir desde secciones profundas. Las 17 páginas responden y las secundarias caben en 390 px. Axe sin hallazgos en home a 1440 y 390 px.
- Tipografía medida en navegador: h1 de escritorio 64 px, interlineado 76.8 px y espaciado 1.5 px; párrafo del hero 16 px, interlineado 22.4 px y espaciado 1.5 px. Indicador de scroll circular y animado. Mega-menú revisado visualmente: cuatro iconos Lucide con relieve, flechas SVG y estados hover/foco.
- Bento, timeline y SVG: sin overflow, sin errores JavaScript y Axe limpio a 1440, 820, 390 y 360 px. Cuatro servicios con enlaces HTTP 200. Timeline clic/Arrow/Home/End/Enter y foco correctos; salto móvil respeta barra sticky. SVG pausa/reanuda con teclado y se detiene fuera de pantalla o con movimiento reducido. Sin JS conserva contenido. Informes en `artifacts/components-v4/`.
- Recorrido 3D: 101/101 controles de cámara, continuidad de render real entre posiciones fraccionales, texto y CTA, pausa, orientación y ciclo de contexto. Canvas ocupa el escenario completo en desktop/tablet/móvil, incluido 844×390; el camión queda encuadrado al final. La preferencia reducida muestra seis escenas y ofrece activar 3D. Sin WebGL/JS se mantienen los seis capítulos. Evidencia en `artifacts/qa-tour.json`.
- Mapa: probado compacto en home y completo en `/contacto/`, a 360, 768 y 1440 px. Cinco fichas oficiales, dos agrupaciones, selección/hover/teclado y foco correctos; sin colisiones de puntos o etiquetas, overflow, errores JS ni hallazgos axe. Puntos y polígonos comparten proyección; Pantaco comprobado dentro de Azcapotzalco y AICM en Venustiano Carranza. Fuentes/licencia en `assets/map-source.md`; informe `artifacts/map-v4-report.json`.
- Cotizador: resumen con estilo ticket. Flujo real hasta descarga PDF de 39,788 bytes, sin errores JS y conserva nombre/datos al editar. H1/párrafo/círculo registrados en `artifacts/qa-v4-smoke.json`; PDF `artifacts/pdf-v4-smoke.pdf`. No cambió el cálculo, la implementación del PDF ni el envío; no se enviaron correos reales. El PDF mantiene la revisión visual y pruebas extensas de V3.
- QA estática: 769 enlaces internos y 288 fragmentos, sin destinos ausentes; 17 títulos/descripciones/canonicals únicos y JSON-LD válido. `artifacts/qa-static-v4.json`. Sigue activo el modo demo/noindex.

- Revisión suplementaria del recorrido: 23/23 controles de colisiones con header visible, scroll hacia arriba en capítulos 2/5, opt-in de movimiento reducido, foco y rotación. Los controles, texto y CTA permanecen libres en 1440, 768, 390, 360 y 844×390. Conserva canvas al girar; no modifica la regla de navegación global. Informe `artifacts/qa-tour-header.json`.
- Paquete V4: `releases/duanor-hostinger-v4.zip`, 4,731,457 bytes y 74 archivos. Incluye `.htaccess`, licencias y contenido de `dist/`; no incluye `.env`, fuentes del proyecto, Blender ni artefactos de QA. Sigue siendo una compilación de demostración, pendiente de la configuración del cliente descrita en README.

## V3 — comprobaciones del 17 de septiembre de 2026

- Paleta azul aplicada a web, modelos Blender y PDF. Space Grotesk y DM Sans servidas localmente; TTF para PDF se descargan solo al exportar. Fuentes y licencias documentadas.
- Build estático: 17 páginas; Astro/TypeScript sin errores, warnings ni hints. Persiste el aviso de tamaño del módulo Three.js en Vite. 3/3 pruebas de estimación. `npm audit --omit=dev`: 0 vulnerabilidades notificadas.
- `scripts/qa-v3.mjs`: 56/56 comprobaciones en Edge. Viewports 1440×1000, 1920×1080, 1024×768, 768×1024, 390×844, 360×740 y 844×390. Sin desbordamiento horizontal; CTA e indicador del hero separados; header oculta al bajar y reaparece al subir desde secciones profundas. Las 17 páginas cargan, incluidas las secundarias a 390 px. En altura menor de 600 px, el hero queda en flujo normal.
- Axe sobre home V3 en 1440 y 390: cero violaciones automáticas. Corregidos contrastes de numeración y sello final. No equivale a una certificación integral de accesibilidad.
- `scripts/qa-tour.mjs`: 51/51 comprobaciones. Cámara real alcanza capítulos, pausa y navegación correctas, títulos separados de controles. Camión completo en 1440/768/390/360. Tablet usa disposición apilada; se ajustó móvil de altura corta y sombras del patio. Sin WebGL, sin JS y con movimiento reducido hay seis capítulos ilustrados en flujo normal.
- Modelos V3: buque 197,524 bytes; bodega con camión 3,730,852 bytes, Draco y 21 drawcalls. Modelo de camión original en Blender, sin atribución ficticia a bibliotecas. Los seis renders estáticos se actualizaron y revisaron.
- Contacto: sin clave queda deshabilitado y sin requests. Pruebas simuladas de validación/foco, honeypot, HTTP 200 con success:false, aceptación success:true, error429, caída de red, timeout20s, reintento y nuevo mensaje. Datos preservados en errores. Cero correos reales. Formulario/mapa sin overflow a 360/768/1440 y axe limpio a 360/1440. `artifacts/contact-v3-report.json`.
- SVG de CDMX: geometría real de 16 alcaldías, dominio público, referencias de Cuauhtémoc, Benito Juárez y Coyoacán. Click, flechas de teclado y Home cambian el panel y estado seleccionado. No se señalan oficinas ficticias como reales.
- PDF integrado: descarga real de tres páginas, 23 campos completos frente al payload simulado, folio, fecha y rango coincidentes. Tres TTF incrustadas y cinco colores comprobados. Operación especializada sin importes; texto extenso3400caracteres paginado en seis páginas. Fallo de fuente y reintento funcionan; snapshot intacto. Renderizadas e inspeccionadas las páginas normales, extensas y especializadas. `artifacts/pdf-v3-integrado-report.json`.
- QA estática: 765 referencias internas y 284 fragmentos, sin destinos ausentes. 17 títulos/descripciones/canonicals únicos; JSON-LD válido. `artifacts/qa-static-v3.json`. Demo conserva noindex.
- Revisión final: estados hover circulares, transición de fondo azul/intermedio/claro, dropdown y menú móvil por teclado, Escape y cambio de orientación comprobados (9/9). Campos del contacto con subrayado uniforme, inputs16px y consentimiento13px. `artifacts/qa-v3-smoke.json`.
- Paquete de entrega V3 en `releases/duanor-hostinger-v3.zip`, generado desde dist con .htaccess. No contiene .env, Blender, fuentes del proyecto ni artefactos de QA. GitHub sigue pendiente por decisión del usuario.

Pendiente para el cliente: clave y buzón reales de Web3Forms, prueba de entrega real, identidad/dominio y personalización legal/comercial, hosting/SSL y comprobación en dispositivos físicos. No se ha publicado externamente.

## V2 — preparación y procedencia

- Proyecto local: `C:\Users\alexi\Desktop\agencia aduanal web`.
- Repositorio inicializado en `codex/duanor-v2`. GitHub pendiente por indicación del usuario; sin autenticación `gh`, identidad Git ni primer commit al registrar este estado.
- El 17 de septiembre de 2026 se comprobaron las páginas fuente de _Container ship full_ (Sketlux, OpenGameArt), _Steel Frame Shelves 02_ (James Ray Cock, Poly Haven) y _Cardboard Box 01_ (Rahul Chaudhary, Poly Haven): recursos publicados como CC0. Ver [fuentes](assets/README-SOURCES.md).
- Imágenes de inspección y manufactura generadas e inspeccionadas visualmente, convertidas a WebP. Puerto proviene de V1. Son escenas conceptuales sin marcas ni texto legible.
- CI preparado para instalación, pruebas y build; todavía no ejecutado en GitHub. No realiza despliegue.

## V2 — comprobaciones realizadas el 17 de septiembre de 2026

- `npm run build`: 17 páginas. Astro/TypeScript: 0 errores, 0 warnings y 0 hints. Vite conserva una advertencia de tamaño para el módulo Three.js (~696 KB sin gzip); no es un error de compilación.
- `npm test`: 3/3 pruebas de estimación, conceptos y revisión especializada. `npm audit --omit=dev`: 0 vulnerabilidades reportadas.
- 17 HTML con HTTP 200; URL inexistente con 404; enlaces y anchors internos sin destinos rotos. Títulos y descripciones únicos, canonical y JSON-LD válidos. `/creditos/`, sitemap y robots comprobados. Sigue activo el modo demo sin indexación.
- Modelo real de buque: 197,528 bytes, 10 materiales, Draco. Bodega: 2,925,088 bytes, 12 grupos de materiales; reducción del 31.35% sin alterar la geometría comprimida. Fuentes Blender editables: 6.81 y 13.33 MB; no se distribuyen al navegador. Texturas de bodega 1024 px.
- Hero verificado a 1440×900, 1280×720, 768×1024 y 360×800. Tres perspectivas distintas, pausa, controles de etapas, movimiento reducido y fallback por pérdida de contexto. Corregidos encuadre de tablet, superposición en pantallas de poca altura e intervalo negativo ocasional de animación.
- Recorrido verificado en Edge a 1440×1000, 768×1024, 390×844, 360×740 y 360×640. Navegación por capítulos, pausa, posiciones de cámara comprobadas y ausencia de scroll horizontal. En 844×390 se usan seis capítulos ilustrados en flujo normal.
- Bodega con movimiento reducido: seis posters con alt descriptivo, sin cargar su GLB. Sin JavaScript conserva los seis capítulos. WebGL negado conserva ilustraciones. Cambio a movimiento reducido durante carga demorada elimina el canvas. Volver desde otra página mediante BFCache mantiene la escena.
- Axe en home final con movimiento reducido: 0 violaciones automáticas. `/creditos/`: 0. Corregidos contraste de etiquetas y grupos ARIA. Esta revisión no constituye una certificación completa de accesibilidad.
- Cotizador: validación de espacios en origen/destino/descripción/nombre/empresa, todos los pasos, creación de ficha, aceptación simulada de Web3Forms y descarga real de PDF después del envío. PDF de dos páginas renderizado e inspeccionado: español, importes, exclusiones, datos y folio correctos. No se envió correo real.
- Evidencia local en `artifacts/`: `qa-tour.json`, `qa-routes.json`, `qa-axe-final.json`, `quote-qa-final-report.json`, PDF y capturas. `scripts/qa-tour.mjs` repite los controles del recorrido con Microsoft Edge instalado y preview en el puerto 4324 (o `QA_URL`). Los artefactos no se publican ni se incluyen en Git.

Pendiente fuera del entorno local: rendimiento en dispositivos físicos, validación de hosting/HTTPS y entrega real de Web3Forms con la clave del cliente. Los escenarios de error de correo y entradas extensas de PDF conservan los resultados V1 porque su implementación no cambió en V2.

## V1 — resultados históricos

La entrega anterior registró el 17 de septiembre de 2026 las siguientes comprobaciones sobre el sitio estático de producción, antes de los cambios V2:

- `npm run build`: 16 páginas generadas; TypeScript/Astro sin errores, avisos ni hints de tipos. El bundler avisa del tamaño del módulo Three.js (~532 KB minificado sin gzip), necesario para la escena y cargado solo en home; no impide la compilación.
- `npm test`: 3 pruebas de cálculo comercial y revisión especializada satisfactorias.
- `npm audit --omit=dev`: cero vulnerabilidades reportadas al momento de entrega.
- QA estática: 632 referencias internas, 198 fragmentos, 54 referencias a recursos y sitemap, 18 dependencias CSS/JS revisadas. Sin rutas ni recursos ausentes. La revisión inicial detectó la URL del 404 y tres descripciones heredadas; corregidas. Confirmación final: 16 títulos, descripciones y canonicals únicos; JSON-LD válido.
- Robots y sitemap coherentes con modo demostración: noindex y bloqueo de rastreo, dominio reservado `duanor.example`, 15 URLs en sitemap sin 404. El modo publicable se configura en `.env`.
- Microsoft Edge/Chromium, viewports 360×800, 390×844, 768×1024 y 1440×1000: sin scroll horizontal. Se corrigió la superposición del barco y el botón en móvil.
- Navegación y dropdown con teclado, Escape, retorno de foco y menú móvil: correctos.
- Las tres fases 3D, pausa, movimiento reducido, ausencia de WebGL y pérdida del contexto: probados. La navegación entre fases también funciona sin WebGL.
- Axe en homepage inicial final: cero violaciones automáticas. Homepage con movimiento reducido y página de servicios: cero violaciones. No equivale a una certificación integral de accesibilidad.
- Cotizador: validaciones vacías, entradas de solo espacios, mínimos de descripción, correo, consentimiento, edición y conservación de datos verificados.
- Importación, exportación y operaciones que requieren revisión especializada: rango/conceptos correctos, sin cantidades en la salida especializada.
- PDF: descarga real en navegador; ficha normal de dos páginas revisada visualmente; español y 23 campos cotejados contra el payload del correo. Entradas extensas probadas con saltos de página.
- Web3Forms: respuestas simuladas de HTTP 429, HTTP 200 con `success:false`, fallo de red y aceptación realista `success:true`. Reintentos conservan folio/datos; descargar después del éxito conserva la confirmación. Ninguna llamada fue enviada al servicio externo durante QA.

## Pendiente de configuración del cliente

Clave y buzón reales de Web3Forms, prueba de entrega real de correo, dominio/SSL de Hostinger, identidad y datos legales, tarifas/cobertura reales, personalización de textos/PDF y activación de indexación. El prototipo usa configuración de demostración. Publicar en GitHub se retomará cuando lo indique el usuario.
