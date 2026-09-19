# Fonts embedded in DUANOR PDFs

Source: the official Google Fonts repository, downloaded 2026-09-17.

- DM Sans: https://github.com/google/fonts/tree/main/ofl/dmsans
  Source `DMSans[opsz,wght].ttf`. Static instances: `opsz=14`, `wght=400` and `wght=600`.
- Space Grotesk: https://github.com/google/fonts/tree/main/ofl/spacegrotesk
  Source `SpaceGrotesk[wght].ttf`. Static instance: `wght=600`.

Instances were created with fontTools.varLib.instancer. These actual TTF files are loaded from this site only when the user requests a PDF, then embedded and subset by jsPDF. No Google Fonts network request occurs in the browser. The PDFs use DM Sans for body text and Space Grotesk for headings.

Both families use SIL Open Font License 1.1. The original copyright notices and complete licenses are included as DM-Sans-OFL.txt and Space-Grotesk-OFL.txt. Keep these notices with the fonts when redistributing the project. The generated PDF itself is not placed under the font license.
