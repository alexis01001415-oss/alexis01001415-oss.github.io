# Logotipos de muestra: Logoipsum

Consultado y descargado el **17 de septiembre de 2026**. Estos recursos son marcas ficticias de muestra para la sección de colaboración del prototipo DUANOR. No identifican clientes, testimonios, afiliaciones ni socios reales.

## Autor y condiciones oficiales

- Fuente: **Logoipsum**, de SignalSupply. Diseño de logotipos: **Rizal / rizal˙**.
- Sitio: https://logoipsum.com/
- Licencia oficial: https://logoipsum.com/license
- Preguntas frecuentes oficiales: https://logoipsum.com/faq

La **Logoipsum Fair Use License** permite copiar, modificar y usar logotipos en proyectos personales o comerciales, incluidos prototipos, diseños web y plantillas. No exige atribución; se conserva el crédito por trazabilidad. No es una licencia CC ni una cesión de dominio público.

Los diseños sin alterar deben usarse como placeholders. La licencia permite incorporar versiones modificadas en productos, pero prohíbe venderlos como assets independientes, empaquetarlos en una colección competidora, atribuirse su autoría o registrarlos como marcas. La FAQ permite incluir placeholders en una interfaz comercial y recomienda dejar claro su carácter provisional.

En este proyecto los diseños se adaptan a plata/azul y conservan exclusivamente su función de muestras, con un aviso visible: **“Marcas de muestra. Colaboraciones ilustrativas.”** Antes de representar relaciones comerciales reales, sustituirlos por los logotipos autorizados de esas organizaciones. No se descargaron fuentes tipográficas ni recursos de Editor+.

## Archivos locales y procedencia

Los SVG se extrajeron del SVG de previsualización que sirve la página oficial de cada diseño, el mismo contenido vectorial disponible para copiar. Cada recurso está alojado localmente; no se usa hotlinking ni se requiere conexión con Logoipsum durante la visita al sitio.

| Archivo                          | Página oficial                    | Selección visual                                |
| -------------------------------- | --------------------------------- | ----------------------------------------------- |
| `public/logos/logoipsum-214.svg` | https://logoipsum.com/artwork/214 | Formas geométricas y logotipo apilado           |
| `public/logos/logoipsum-248.svg` | https://logoipsum.com/artwork/248 | Tres franjas diagonales que sugieren movimiento |
| `public/logos/logoipsum-220.svg` | https://logoipsum.com/artwork/220 | Logotipo horizontal enmarcado                   |
| `public/logos/logoipsum-267.svg` | https://logoipsum.com/artwork/267 | Hexágono de líneas repetidas                    |
| `public/logos/logoipsum-251.svg` | https://logoipsum.com/artwork/251 | Símbolo entrelazado y logotipo                  |
| `public/logos/logoipsum-299.svg` | https://logoipsum.com/artwork/299 | Círculo y estrella de cuatro puntas             |

Adaptaciones: sustitución de colores originales por tonos de la paleta DUANOR; redondeo de coordenadas de trazado a dos decimales; eliminación de espacios entre etiquetas; títulos y metadatos de fuente. Se preservan composición y proporciones. Los seis archivos suman **76,645 bytes sin compresión**. No contienen scripts, imágenes incrustadas, texto que dependa de una fuente externa ni referencias remotas ejecutables.

## Integración

Componente `src/components/CollaborationLogos.astro`, estilos `src/styles/collaboration-logos.css`. Prop opcional `id`, por defecto `colaboraciones`. Se prevé inmediatamente después del hero. Seis columnas en escritorio, tres en tablet y dos en móvil; todos los logos permanecen visibles y no hay carrusel, animación automática ni dependencia JavaScript.

El HTML usa una lista semántica, títulos y texto alternativo que identifican cada elemento como marca de muestra. Los SVG incluyen dimensiones para reservar su espacio y carga diferida.

## Párrafo de créditos

“Logotipos de muestra de Logoipsum, diseñados por Rizal para SignalSupply. Adaptación de color y optimización para este prototipo conforme a la Logoipsum Fair Use License. Se utilizan como marcas ficticias ilustrativas y no representan clientes ni afiliaciones reales.” Enlazar **Logoipsum** a https://logoipsum.com/ y **licencia** a https://logoipsum.com/license.
