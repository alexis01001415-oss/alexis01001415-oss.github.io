export const articles = [
  {
    slug: 'primera-importacion',
    category: 'PRIMEROS PASOS',
    title: 'Tu primera importación empieza antes del embarque.',
    description:
      'Una guía inicial para organizar la información y las preguntas de tu primera operación.',
    sections: [
      {
        title: 'Define qué quieres importar',
        text: 'Describe el producto, su composición, su función y su uso. Reúne fichas técnicas, fotografías y datos del fabricante cuando estén disponibles. Una descripción precisa permite orientar la revisión de requisitos.',
      },
      {
        title: 'Revisa tu preparación fiscal y operativa',
        text: 'Según la operación pueden aplicar requisitos de inscripción en el padrón de importadores y padrones sectoriales. El SAT detalla las condiciones de inscripción, entre ellas RFC activo y e.firma vigente. Nunca compartas contraseñas ni archivos de e.firma a través de un cotizador.',
      },
      {
        title: 'Planea ruta, costo y responsabilidades',
        text: 'El valor comercial de una mercancía no equivale al costo total de importación. Transporte, seguro, honorarios, contribuciones y otros conceptos requieren análisis separado. Revisa qué cubre el acuerdo comercial con tu proveedor y qué corresponde coordinar a cada parte.',
      },
      {
        title: 'Antes de embarcar',
        text: 'Confirma qué documentación y cumplimiento requiere tu producto. La revisión previa ayuda a identificar permisos, regulaciones y otros datos necesarios. Esta guía es introductoria; la viabilidad debe revisarse para cada caso.',
      },
    ],
    sources: [
      {
        name: 'SAT · Inscripción en el padrón de importadores',
        url: 'https://www.sat.gob.mx/minisitio/PadronImportadoresExportadores/pi_inscripcion.html',
      },
      {
        name: 'SNICE · Logística previa al despacho',
        url: 'https://www.snice.gob.mx/cs/avi/snice/comercio.aprende.importar.logistica.html',
      },
    ],
  },
  {
    slug: 'documentos-para-cotizar',
    category: 'TU EXPEDIENTE',
    title: 'Los datos que hacen más clara tu cotización.',
    description: 'Qué conviene tener a la mano para iniciar la revisión de tu operación.',
    sections: [
      {
        title: 'Empieza por una ficha de mercancía',
        text: 'Incluye descripción detallada, material, uso, cantidad, valor y moneda. Si conoces la fracción arancelaria y el NICO, compártelos por separado para su revisión. La fracción mexicana tiene ocho dígitos; el NICO añade dos.',
      },
      {
        title: 'Agrega los datos de la carga y la ruta',
        text: 'Peso bruto, bultos, volumen, país de origen, procedencia, destino y fecha aproximada permiten entender la operación. Indica si la carga necesita refrigeración, manejo especial o tiene otras condiciones particulares.',
      },
      {
        title: 'Documentos habituales, sujetos a cada caso',
        text: 'Factura o documento equivalente, lista de empaque y documento de transporte son referencias comunes. Según la mercancía y la operación pueden corresponder evidencia de origen, permisos y documentos para acreditar regulaciones. No todos los casos requieren exactamente lo mismo.',
      },
      {
        title: 'No necesitas saberlo todo para empezar',
        text: 'Si no conoces tu aduana, Incoterm o clasificación, indícalo. Es preferible identificar un dato pendiente que suponerlo. El cotizador te permite preparar una primera ficha para ordenar la conversación.',
      },
    ],
    sources: [
      {
        name: 'SNICE · Números de Identificación Comercial',
        url: 'https://www.snice.gob.mx/cs/avi/snice/ligie.nico2022.html',
      },
      {
        name: 'SNICE · Aprende a exportar',
        url: 'https://www.snice.gob.mx/cs/avi/snice/comercio.aprende.exportar.html',
      },
    ],
  },
  {
    slug: 'maritimo-aereo-terrestre',
    category: 'PLANEACIÓN LOGÍSTICA',
    title: 'Marítimo, aéreo o terrestre: empieza por tu carga.',
    description: 'Las preguntas que ayudan a elegir cómo conectar origen y destino.',
    sections: [
      {
        title: 'El modo de transporte responde a la operación',
        text: 'Origen y destino, peso, volumen, embalaje, valor, características del producto y urgencia intervienen en la planeación. Una modalidad no es universalmente mejor que otra.',
      },
      {
        title: 'Mira la ruta completa',
        text: 'No compares solamente el trayecto internacional. Considera recepción en origen, tránsito, llegada, despacho, maniobras y entrega. Los servicios incluidos y las responsabilidades pueden variar entre propuestas.',
      },
      {
        title: 'Aclara las condiciones especiales',
        text: 'Mercancías peligrosas, perecederas o con temperatura controlada necesitan una revisión particular. Informa estas características desde el inicio y confirma la documentación y aceptación del transportista.',
      },
      {
        title: 'Compara alcances, no solo importes',
        text: 'Una propuesta útil identifica los conceptos incluidos, las exclusiones y los supuestos de ruta. Los tiempos y costos definitivos deben confirmarse con los participantes de la operación antes de contratar.',
      },
    ],
    sources: [
      {
        name: 'SNICE · Planeación y logística de importación',
        url: 'https://www.snice.gob.mx/cs/avi/snice/comercio.aprende.importar.logistica.html',
      },
    ],
  },
];
