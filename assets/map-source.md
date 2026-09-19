# Ciudad de México: cartografía e instalaciones aduanales

Revisión de fuentes: **17 de septiembre de 2026**. El mapa corresponde a Ciudad de México; AIFA está en Zumpango, Estado de México, y no se representa como instalación de CDMX.

## Cartografía y licencia comercial

- Archivo publicado: `public/maps/cdmx.svg` (40,380 bytes, 16 polígonos de alcaldías).
- Autoría cartográfica: **INEGI, Marco Geoestadístico 2020**, distribuido por el Portal de Datos Abiertos de la Ciudad de México.
- Conjunto: **Límite de Alcaldías (áreas geoestadísticas municipales)**, https://datos.cdmx.gob.mx/dataset/alcaldias
- GeoJSON utilizado: https://datos.cdmx.gob.mx/dataset/bae265a8-d1f6-4614-b399-4184bc93e027/resource/deb5c583-84e2-4e07-a706-1b3a0dbc99b0/download/deb5c583-84e2-4e07-a706-1b3a0dbc99b0.json
- El recurso declara `urn:ogc:def:crs:OGC:1.3:CRS84`: longitud, latitud en grados.
- Licencia declarada por el portal: **CC-BY-4.0-ESP**, https://creativecommons.org/licenses/by/4.0/deed.es
- Permite compartir y adaptar, incluido uso comercial, conservando atribución, enlace de licencia e indicación de modificaciones.
- La fecha de actualización del catálogo (1 de septiembre de 2026) no convierte las geometrías de 2020 en una medición de 2026.
- Esta adaptación sustituye el SVG histórico de EOZyo de la versión anterior. No usa su geometría.

Atribución visible: “Cartografía adaptada de INEGI, Marco Geoestadístico 2020 · Datos Abiertos CDMX · CC BY 4.0”. También está incluida en los metadatos del SVG.

## Transformación reproducible

Se proyectaron los anillos GeoJSON y las referencias de ubicación mediante **Mercator esférica**, con norte hacia arriba. No se dibujó a mano el contorno ni se movieron marcadores para ajustar la composición.

Para longitud `lon` y latitud `lat`, en grados:

```text
X = lon × π / 180
Y = ln(tan(π / 4 + lat × π / 360))
x = (X - xmin) × scale + offsetX
y = (ymax - Y) × scale + offsetY
viewBox = 0 0 760 1024
xmin = -1.7342450882878353
ymax = 0.34882432392264606
scale = 96072.87093049928
offsetX = 24
offsetY = 28.23044312727319
```

Escala uniforme: mínimo entre `712/(xmax-xmin)` y `976/(ymax-ymin)`, con centrado de la geometría. Los anillos se simplificaron con Ramer–Douglas–Peucker, tolerancia **0.22 unidades del viewBox**, y sus puntos se redondearon a dos decimales. Se conservaron las 16 alcaldías, sus identificadores CVEGEO y nombres. El mapa es de referencia; las áreas geoestadísticas no establecen límites jurídicos.

## Posiciones y agrupación

Se muestran dos marcadores de conjuntos y cinco fichas seleccionables. No se afirma que las cinco instalaciones compartan una puerta o un edificio. El grupo Pantaco usa la referencia de su aduana de carga y agrupa la aduana y su sección; AICM usa la referencia de su zona de carga y agrupa la aduana y sus dos secciones.

| Conjunto                 |   Latitud |   Longitud |           x en SVG |           y en SVG |
| ------------------------ | --------: | ---------: | -----------------: | -----------------: |
| Pantaco, aduana de carga | 19.474167 | -99.168611 | 353.17560252577647 | 239.22472080969612 |
| AICM, aduana de carga    | 19.442778 | -99.072778 |  513.8672192229686 |  295.0457363180872 |

Fuente de ambas coordenadas: **SEMARNAT, contrato DGRMIS-DGIT-DAC-169/2024, Servicio de Telefonía**, anexo de ubicaciones, página 101 del PDF, folio impreso **PT 00055**. Tabla revisada visualmente. Las coordenadas son referencias de instalaciones registradas en ese inventario, no un levantamiento de accesos para navegación vehicular.

https://dsiappsdev.semarnat.gob.mx/inai/XXVIII/2024/512/3T/169.CONTRATO-DGRMIS-DGIT-DAC-169-2024.pdf#page=101

Las etiquetas tienen desplazamientos gráficos y líneas guía para evitar colisiones. Los centros de los botones permanecen en la proyección de las coordenadas anteriores. La lista permite elegir cada entidad sin superponer cinco puntos cercanos.

## Alcance y fuentes oficiales de instalaciones

El alcance es **las dos aduanas y las tres secciones aduaneras de CDMX que figuran en las fuentes siguientes**. No es un directorio de todos los almacenes, recintos fiscalizados privados, empresas aduanales, terminales de pasajeros o oficinas administrativas de ANAM. Las fichas no atribuyen instalaciones a DUANOR, no publican horarios ni garantizan servicios o acceso.

1. **SAT, Anexo 22 de RGCE para 2026, Apéndice 1 (Aduana-Sección), compilación de la primera modificación del 20 de mayo de 2026.** Páginas 37–39: claves 20-0, 20-2, 47-0, 47-1 y 47-2. Página 40: AIFA 85-0, Santa Lucía, Zumpango, Estado de México, excluida del mapa.
   https://www.sat.gob.mx/minisitio/NormatividadRMFyRGCE/documentos2026/rgce/compiladas/CompiladoAnexo22_1raRMRGCE2026.pdf
   La modificación anticipada del Anexo 22 publicada el 14 de septiembre de 2026 se refiere a los apéndices 8 y 9; no cambia este catálogo del apéndice 1.
   https://www.sat.gob.mx/minisitio/NormatividadRMFyRGCE/documentos2026/rgce/anticipadas/2da_ModificacionAnexo22_2daRMRGCE_2026_QuintaAnticipada.pdf
2. **Acuerdo de circunscripción territorial, DOF del 15 de mayo de 2025**, apartados XVII y XVIII: aduanas de AICM y México; Satélite y Centro Postal Mecanizado dentro de las instalaciones del AICM; sección de contenedores en Azcapotzalco.
   https://sidof.segob.gob.mx/notas/docFuente/5757337
3. **Directorio ANAM: Aduana de México.** Domicilio Ferrocarril Central s/n, esquina Av. Cuitláhuac, colonia Cosmopolita, Azcapotzalco, C.P. 02670. Menciona su sección de importación y exportación de contenedores.
   https://www.anam.gob.mx/aduana-mexico/
4. **Directorio ANAM: Aduana del AICM.** Domicilio Av. 602 s/n, Zona Federal, colonia Peñón de los Baños, Venustiano Carranza, C.P. 15620. Menciona Centro Postal Mecanizado.
   https://www.anam.gob.mx/aduana-aicm/
5. **ANAM, procedimiento AM-06-H00-006H00999-N-5-2026, publicado el 3 de marzo de 2026**, Apéndice 1, Relación de Inmuebles ANAM: p. 91 (renglones 126–127) identifica Aduana México (Pantaco) y Sección Aduanera Pantaco; esta última en Rabaul s/n, esquina Nueces, colonia Jardín Azpeitia, C.P. 02500. P. 83 confirma la dirección Av. 602 para Aduana AICM.
   https://www.anam.gob.mx/wp-content/uploads/CONV_SIIIDF-1_1.pdf#page=91

| Clave | Nombre de ficha          | Tipo                        | Domicilio publicado / alcance del dato                         |
| ----- | ------------------------ | --------------------------- | -------------------------------------------------------------- |
| 20-0  | Aduana de México         | Aduana interior             | Directorio ANAM, Ferrocarril Central y Av. Cuitláhuac          |
| 20-2  | Sección de contenedores  | Sección de Aduana de México | Inventario ANAM 2026, Sección Pantaco, Rabaul y Nueces         |
| 47-0  | Aduana del AICM          | Aduana aeroportuaria        | Directorio ANAM, Av. 602 s/n                                   |
| 47-1  | Sección Satélite         | Sección de Aduana AICM      | Interior del AICM, según DOF; no se inventa una calle o acceso |
| 47-2  | Centro Postal Mecanizado | Sección de Aduana AICM      | Interior del AICM, según DOF; no se inventa una puerta         |

El directorio web de AICM no enumera Satélite, pero el acuerdo y el catálogo SAT 2026 sí la incluyen. Se mantiene en el alcance como sección reconocida en esas fuentes, sin inferir horarios ni operación de un servicio particular. El inventario ANAM también lista SEPOMEX AICM en Av. Piloto Aviador Carlos León; no se equipara ese renglón con un acceso preciso del Centro Postal Mecanizado sin una identificación explícita.

## Interacción

El componente mantiene props `id` y `compact`. Dos botones de mapa y cinco selectores funcionan con clic, foco, hover de ratón, flechas, Home y End. Las fichas usan `aria-live`, controles con `aria-pressed` y `aria-controls`, y enlaces directos a las fuentes oficiales. La variante compacta conserva únicamente mapa, selección y ficha para integrarse con el texto existente de cobertura.

## Fuentes del contenido orientativo

Consultadas el 17 de septiembre de 2026. El contenido del sitio resume criterios generales; no sustituye la revisión individual de una operación ni establece tasas, plazos o clasificaciones.

- SAT, inscripción al Padrón de Importadores: https://www.sat.gob.mx/minisitio/PadronImportadoresExportadores/pi_inscripcion.html
- SNICE, logística de importación y documentación: https://www.snice.gob.mx/cs/avi/snice/comercio.aprende.importar.logistica.html
- SNICE, Números de Identificación Comercial: https://www.snice.gob.mx/cs/avi/snice/ligie.nico2022.html
- SNICE, acreditación del origen: https://www.snice.gob.mx/cs/avi/snice/drrnas.origen.acercade.html
- SNICE, instrumentos asociados a la clasificación: https://www.snice.gob.mx/cs/avi/snice/nuevaligie.instrumentacion.html
- Web3Forms, implementación de formularios: https://docs.web3forms.com/how-to-guides/html-and-javascript
- Web3Forms, protección contra spam: https://docs.web3forms.com/getting-started/customizations/spam-protection
