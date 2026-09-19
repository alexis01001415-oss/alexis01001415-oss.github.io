export const brand = {
  name: 'DUANOR',
  tagline: 'Aduanas. Sin fronteras.',
  city: 'Ciudad de México',
  demo: import.meta.env.PUBLIC_DEMO_MODE !== 'false',
};
export const services = [
  {
    n: '01',
    title: 'Despacho aduanal',
    slug: 'despacho-aduanal',
    label: 'EL SIGUIENTE PASO, EN ORDEN.',
    description:
      'Coordinamos el proceso de importación y exportación, desde la revisión documental hasta la liberación de tu mercancía.',
    detail:
      'Una operación empieza mucho antes de que llegue la carga. Revisamos la información comercial, identificamos los requisitos aplicables y trazamos contigo una ruta de despacho.',
    items: [
      'Revisión del expediente de comercio exterior',
      'Coordinación del despacho de importación y exportación',
      'Seguimiento de hitos y comunicación de incidencias',
      'Integración y entrega de documentación de la operación',
    ],
    icon: 'customs',
  },
  {
    n: '02',
    title: 'Logística internacional',
    slug: 'logistica-internacional',
    label: 'CADA TRAYECTO, CONECTADO.',
    description:
      'Conectamos transporte marítimo, aéreo y terrestre en una ruta diseñada alrededor de tu operación.',
    detail:
      'El transporte adecuado depende de tu carga, tus tiempos y tus prioridades. Comparamos alternativas de ruta y coordinamos a los participantes de cada tramo.',
    items: [
      'Planeación de rutas marítimas, aéreas y terrestres',
      'Coordinación con transportistas y agentes de carga',
      'Opciones de carga consolidada y contenedor completo',
      'Seguimiento de recepción y entrega',
    ],
    icon: 'ship',
  },
  {
    n: '03',
    title: 'Consultoría aduanera',
    slug: 'consultoria-aduanera',
    label: 'CLARIDAD ANTES DE MOVERTE.',
    description:
      'Resolvemos las preguntas de tu operación para que tomes decisiones con información y contexto.',
    detail:
      'Cada producto tiene particularidades. Nuestro enfoque parte de su composición, uso y origen para identificar qué se necesita revisar antes del embarque.',
    items: [
      'Orientación para preparar tu primera importación',
      'Análisis de clasificación arancelaria sujeto a ficha técnica',
      'Identificación de regulaciones y documentación',
      'Revisión del alcance de Incoterms y responsabilidades',
    ],
    icon: 'document',
  },
  {
    n: '04',
    title: 'Coordinación de carga',
    slug: 'coordinacion-de-carga',
    label: 'DEL PUNTO DE ORIGEN A TU PUERTA.',
    description:
      'Articulamos almacenamiento, maniobras y última milla para dar continuidad a tu cadena de suministro.',
    detail:
      'La liberación es una etapa, no el destino final. Integramos los servicios complementarios que tu carga necesita para continuar hacia tu almacén.',
    items: [
      'Coordinación de maniobras y almacenamiento',
      'Planeación de entrega nacional',
      'Comunicación con almacenes y centros de distribución',
      'Integración de evidencias de entrega',
    ],
    icon: 'box',
  },
];
export const faqs = [
  [
    '¿Qué necesito para cotizar una importación?',
    'Empieza con una descripción de la mercancía, país de origen, destino, valor comercial, peso y modalidad de transporte. Si aún no tienes todos los datos, puedes indicar que requieres asesoría. La cotización definitiva requiere revisar el expediente y los requisitos aplicables.',
  ],
  [
    '¿La estimación incluye impuestos y aranceles?',
    'No. La calculadora muestra honorarios y coordinación de referencia del prototipo. No incluye impuestos, aranceles, fletes, seguros, almacenajes, maniobras ni servicios de terceros. Estos conceptos dependen de la mercancía y se determinan después de la revisión.',
  ],
  [
    '¿Puedo importar si es mi primera vez?',
    'La primera operación empieza por revisar tu situación fiscal y los requisitos de la mercancía. El SAT contempla condiciones como RFC activo, e.firma vigente y obligaciones fiscales al corriente para la inscripción al Padrón de Importadores. Selecciona “Es mi primera operación” en el cotizador para dar contexto a tu solicitud.',
  ],
  [
    '¿Necesito estar inscrito en el Padrón de Importadores?',
    'Debe revisarse según la operación y las excepciones aplicables. Algunas mercancías también requieren un padrón sectorial. Antes de embarcar, confirma con el especialista responsable qué registro corresponde y consulta los requisitos vigentes directamente en el SAT.',
  ],
  [
    '¿Qué es la fracción arancelaria y para qué sirve el NICO?',
    'La fracción arancelaria clasifica la mercancía y permite revisar el tratamiento que le corresponde. El NICO añade detalle para identificarla comercialmente y generar estadísticas. La descripción comercial por sí sola puede ser insuficiente: prepara información de composición, uso y características técnicas para su revisión.',
  ],
  [
    '¿Cómo sé si mi mercancía necesita permisos o cumplir una NOM?',
    'Los requisitos se revisan a partir de la clasificación y las características de la mercancía, considerando la operación concreta. Pueden existir normas, permisos u otras regulaciones. Evita asumir que el requisito de un producto similar también aplica al tuyo; valida el caso antes del embarque.',
  ],
  [
    '¿Qué diferencia hay entre país de origen y procedencia?',
    'El origen se relaciona con dónde se produjo o transformó la mercancía; la procedencia es el país desde el cual se embarca. Pueden ser distintos. Ambos datos ayudan a preparar la revisión documental.',
  ],
  [
    '¿Todas las mercancías necesitan certificado de origen?',
    'La forma de acreditar el origen depende del propósito y del acuerdo comercial aplicable. Cuando se busca un trato arancelario preferencial, hay que verificar la regla de origen y la prueba admitida por ese acuerdo. No basta con que la carga salga de un país que tenga un tratado con México.',
  ],
  [
    '¿Qué documentos conviene pedir al proveedor desde el inicio?',
    'Factura, lista de empaque y ficha técnica son un punto de partida útil. Según el caso, también habrá que revisar el documento de transporte, la acreditación de origen y los documentos de cumplimiento aplicables. Confirma el expediente concreto antes de embarcar.',
  ],
  [
    '¿En qué se diferencian la factura y la lista de empaque?',
    'La factura describe la transacción comercial. La lista de empaque ayuda a identificar cómo se distribuye físicamente la carga en sus bultos. Conviene contrastar productos, cantidades y referencias entre ambos documentos para detectar diferencias desde la preparación.',
  ],
  [
    '¿Qué es el pedimento?',
    'Es la declaración electrónica de la operación aduanera. Reúne datos de la mercancía, su régimen y el cumplimiento correspondiente. La ficha PDF que genera este sitio es una referencia comercial del prototipo; no es un pedimento ni sustituye la documentación oficial.',
  ],
  [
    '¿Cómo elijo entre transporte marítimo, aéreo o terrestre?',
    'Compara la fecha requerida, origen y destino, volumen, peso, manejo y disponibilidad. Una misma operación puede combinar medios. El formulario te permite indicar tu preferencia o pedir orientación sin asumir que una modalidad es la adecuada para todos los productos.',
  ],
  [
    '¿Pueden confirmar una fecha de liberación antes de revisar la carga?',
    'Una fecha debe evaluarse con el expediente, la ruta y las condiciones de la operación. El prototipo no garantiza tiempos de liberación. Comparte tu fecha objetivo para identificar lo que debe revisarse y las dependencias que pueden afectar el calendario.',
  ],
  [
    '¿Cómo recibo mi propuesta?',
    'Al completar el cotizador puedes descargar una ficha PDF con los datos de tu operación y la estimación de referencia. Si el formulario de contacto está habilitado, puedes enviar la solicitud para su revisión comercial.',
  ],
];
