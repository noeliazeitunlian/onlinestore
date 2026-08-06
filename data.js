/* ============================================================
   BASE DE DATOS DE EJERCICIOS
   ------------------------------------------------------------
   Esto es una base de EJEMPLO para que el generador funcione
   de punta a punta. La idea es que la vayas reemplazando por
   tu contenido real (o el de la instructora que lo valide).

   Cada ejercicio tiene esta forma:

   {
     id: string único
     discipline: "pilates" | "yoga"
     name: string
     position: string (texto libre, ej "Supino", "De pie")
     modality: ["mat","reformer"] o ["suave","dinamico","restaurativo"]
     level: ["inicial","intermedio","avanzado"]
     moment: 1 a 6  -> a qué bloque de la clase pertenece
     objective: ["id-de-objetivo", ...]
     avoid: ["tag-contraindicacion", ...]  (opcional)
     description: texto que ve la alumna/instructora
     howTo: cómo explicarlo (opcional)
     adaptation: adaptación por patología (opcional, texto orientativo)
     seriesDefault: número de series sugeridas
   }
   ============================================================ */

const BLOCKS = [
  { id: 1, name: "Preparación",         subtitle: "Conectar con el cuerpo y la respiración",     weight: 0.15, optional: true },
  { id: 2, name: "Activación",          subtitle: "Despertar el centro, sentar las bases",        weight: 0.17 },
  { id: 3, name: "Desarrollo Principal",subtitle: "El patrón central, ligado al objetivo elegido",weight: 0.22 },
  { id: 4, name: "Profundización",      subtitle: "Variación, carga o coordinación sobre lo aprendido", weight: 0.17 },
  { id: 5, name: "Integración",         subtitle: "Secuencia fluida que une lo trabajado",        weight: 0.14 },
  { id: 6, name: "Cierre",              subtitle: "Vuelta al eje, respiración, sensación final",  weight: 0.15 },
];

const OBJECTIVES = {
  pilates: [
    { id: "lumbopelvica", label: "Estabilidad Lumbopélvica" },
    { id: "columna", label: "Movilidad de Columna" },
    { id: "tren-superior", label: "Fuerza de Tren Superior" },
    { id: "centro", label: "Conexión con el Centro" },
  ],
  yoga: [
    { id: "enraizamiento", label: "Equilibrio y Enraizamiento" },
    { id: "cadera", label: "Apertura de Cadera" },
    { id: "columna-yoga", label: "Flexibilidad de Columna" },
    { id: "fuerza-yoga", label: "Fuerza y Estabilidad" },
  ],
};

const MODALITIES = {
  pilates: [
    { id: "mat", label: "Mat" },
    { id: "reformer", label: "Reformer" },
    { id: "mixta", label: "Mixta" },
  ],
  yoga: [
    { id: "suave", label: "Suave" },
    { id: "dinamico", label: "Dinámico" },
    { id: "restaurativo", label: "Restaurativo" },
  ],
};

const POPULATIONS = [
  { id: "general", label: "Adultos (general)" },
  { id: "mayores", label: "Adultos mayores" },
  { id: "embarazo", label: "Embarazo / posparto" },
  { id: "principiantes", label: "Principiantes absolutas" },
];

const AVOID_TAGS = [
  "Hernia de disco lumbar",
  "Embarazo / posparto",
  "Problemas de cadera / prótesis",
  "Post-cirugía de rodilla",
  "Hipermovilidad",
  "Disfunción de suelo pélvico",
];

const EXERCISES = [
  // ---------- PILATES · Objetivo: Estabilidad Lumbopélvica ----------
  {
    id: "p1", discipline: "pilates", name: "Respiración y apoyo en neutro",
    position: "Supino", modality: ["mat", "reformer", "mixta"], level: ["inicial", "intermedio", "avanzado"],
    moment: 1, objective: ["lumbopelvica", "centro"],
    description: "Apoyá la espalda en el piso, encontrá la columna neutra e inhalá y exhalá por la nariz antes de empezar.",
    howTo: "Pedí que sientan los tres puntos de apoyo: sacro, y ambos omóplatos.",
    adaptation: "En embarazo avanzado, elevar el torso con almohadones en vez de supino completo.",
    seriesDefault: 1,
  },
  {
    id: "p2", discipline: "pilates", name: "Báscula pélvica",
    position: "Supino", modality: ["mat", "reformer", "mixta"], level: ["inicial", "intermedio"],
    moment: 1, objective: ["lumbopelvica"],
    description: "Báscula pélvica suave: encontrá neutro e impronta para preparar la estabilidad lumbopélvica del día.",
    seriesDefault: 1,
  },
  {
    id: "p3", discipline: "pilates", name: "Pies en correas — círculos pequeños",
    position: "Supino en el carro", modality: ["reformer", "mixta"], level: ["intermedio", "avanzado"],
    moment: 2, objective: ["lumbopelvica"],
    description: "Pelvis quieta, piernas en movimiento contra la resistencia del resorte. Círculos chicos y controlados.",
    howTo: "La pelvis no se mueve un milímetro: si se mueve, achicá el círculo.",
    avoid: ["Problemas de cadera / prótesis"],
    seriesDefault: 3,
  },
  {
    id: "p4", discipline: "pilates", name: "Imprinting activo",
    position: "Supino", modality: ["mat", "mixta"], level: ["inicial", "intermedio"],
    moment: 2, objective: ["lumbopelvica", "centro"],
    description: "Encontrá neutro y la impronta; perdé y recuperá la posición de forma intencional.",
    seriesDefault: 3,
  },
  {
    id: "p5", discipline: "pilates", name: "Footwork — trabajo de pies",
    position: "Supino en el carro", modality: ["reformer", "mixta"], level: ["inicial", "intermedio", "avanzado"],
    moment: 3, objective: ["lumbopelvica", "tren-superior"],
    description: "Carga media: las piernas empujan con resistencia. Empujá desde el centro y controlá la vuelta.",
    howTo: "El carro vuelve lento, nunca de golpe.",
    avoid: ["Post-cirugía de rodilla"],
    seriesDefault: 3,
  },
  {
    id: "p6", discipline: "pilates", name: "Puente con banda",
    position: "Supino", modality: ["mat"], level: ["inicial", "intermedio"],
    moment: 3, objective: ["lumbopelvica"],
    description: "Elevación de cadera con banda en las rodillas, controlando que no se abran ni se cierren.",
    avoid: ["Hernia de disco lumbar"],
    seriesDefault: 3,
  },
  {
    id: "p7", discipline: "pilates", name: "Side leg series con correa",
    position: "De costado en el carro", modality: ["reformer", "mixta"], level: ["intermedio", "avanzado"],
    moment: 4, objective: ["lumbopelvica"],
    description: "Pie en la correa: aperturas y círculos de cadera contra resistencia, pelvis estable y centro sostenido.",
    seriesDefault: 3,
  },
  {
    id: "p8", discipline: "pilates", name: "Arms in straps — remo",
    position: "Sentada en el carro", modality: ["reformer", "mixta"], level: ["intermedio", "avanzado"],
    moment: 4, objective: ["tren-superior"],
    description: "Carga liviana: el trabajo es de control escapular, no de fuerza. Escápulas abajo antes de mover los brazos.",
    seriesDefault: 3,
  },
  {
    id: "p9", discipline: "pilates", name: "Standing footwork de integración",
    position: "De pie en el carro", modality: ["reformer", "mixta"], level: ["intermedio", "avanzado"],
    moment: 5, objective: ["lumbopelvica", "centro"],
    description: "Equilibrio y control en bipedestación para cerrar el trabajo, integrando piernas y centro de pie.",
    seriesDefault: 3,
  },
  {
    id: "p10", discipline: "pilates", name: "Sirena — lateralización",
    position: "Sentada", modality: ["mat", "reformer", "mixta"], level: ["inicial", "intermedio", "avanzado"],
    moment: 6, objective: ["columna"],
    description: "Estiramiento lateral largo y continuo de un lado al otro, con respiración.",
    seriesDefault: 1,
  },
  {
    id: "p11", discipline: "pilates", name: "Observación interna",
    position: "Reposo", modality: ["mat", "reformer", "mixta"], level: ["inicial", "intermedio", "avanzado"],
    moment: 6, objective: ["lumbopelvica", "columna", "tren-superior", "centro"],
    description: "Invitá a notar cómo se siente el cuerpo ahora versus cuando llegó. 30 a 60 segundos de silencio.",
    seriesDefault: 1,
  },

  // ---------- YOGA · Objetivo: Equilibrio y Enraizamiento ----------
  {
    id: "y1", discipline: "yoga", name: "Respiración consciente sentada",
    position: "Sentada", modality: ["suave", "dinamico", "restaurativo"], level: ["inicial", "intermedio", "avanzado"],
    moment: 1, objective: ["enraizamiento"],
    description: "Sentate cómoda, cerrá los ojos y llevá la atención a tres respiraciones completas antes de moverte.",
    seriesDefault: 1,
  },
  {
    id: "y2", discipline: "yoga", name: "Gato-vaca",
    position: "Cuadrupedia", modality: ["suave", "dinamico"], level: ["inicial", "intermedio", "avanzado"],
    moment: 1, objective: ["columna-yoga"],
    description: "Movilizá la columna siguiendo la respiración: inhalás y arqueás, exhalás y redondeás.",
    seriesDefault: 1,
  },
  {
    id: "y3", discipline: "yoga", name: "Postura de la montaña con raíces",
    position: "De pie", modality: ["suave", "dinamico"], level: ["inicial", "intermedio", "avanzado"],
    moment: 2, objective: ["enraizamiento"],
    description: "De pie, apoyo parejo en los cuatro puntos del pie, buscando la sensación de raíz antes de moverte.",
    seriesDefault: 1,
  },
  {
    id: "y4", discipline: "yoga", name: "Guerrero II",
    position: "De pie", modality: ["dinamico"], level: ["intermedio", "avanzado"],
    moment: 3, objective: ["enraizamiento", "fuerza-yoga"],
    description: "Base amplia y estable, mirada al frente sobre la mano, sosteniendo la postura con respiración pareja.",
    avoid: ["Problemas de cadera / prótesis"],
    seriesDefault: 1,
  },
  {
    id: "y5", discipline: "yoga", name: "Árbol",
    position: "De pie", modality: ["suave", "dinamico"], level: ["inicial", "intermedio", "avanzado"],
    moment: 3, objective: ["enraizamiento"],
    description: "Apoyo en un pie, el otro apoyado en la pierna (nunca sobre la rodilla), sosteniendo la mirada fija.",
    seriesDefault: 1,
  },
  {
    id: "y6", discipline: "yoga", name: "Guerrero III",
    position: "De pie", modality: ["dinamico"], level: ["avanzado"],
    moment: 4, objective: ["enraizamiento", "fuerza-yoga"],
    description: "Equilibrio en un pie con el torso y la pierna libre paralelos al piso, sosteniendo el centro activo.",
    seriesDefault: 1,
  },
  {
    id: "y7", discipline: "yoga", name: "Paloma (apertura de cadera)",
    position: "Sentada", modality: ["suave", "restaurativo"], level: ["inicial", "intermedio", "avanzado"],
    moment: 4, objective: ["cadera"],
    description: "Cadera adelante flexionada, sostenida con manos o bloque debajo si no llega el piso.",
    avoid: ["Problemas de cadera / prótesis"],
    seriesDefault: 1,
  },
  {
    id: "y8", discipline: "yoga", name: "Saludo al sol (fluido)",
    position: "De pie", modality: ["dinamico"], level: ["intermedio", "avanzado"],
    moment: 5, objective: ["enraizamiento", "fuerza-yoga"],
    description: "Secuencia fluida que une lo trabajado en la clase, coordinando movimiento y respiración.",
    seriesDefault: 1,
  },
  {
    id: "y9", discipline: "yoga", name: "Postura del niño",
    position: "De rodillas", modality: ["suave", "restaurativo"], level: ["inicial", "intermedio", "avanzado"],
    moment: 6, objective: ["enraizamiento", "columna-yoga", "cadera", "fuerza-yoga"],
    description: "Rodillas separadas, sentate hacia atrás sobre los talones y apoyá la frente, respirando hacia la espalda.",
    seriesDefault: 1,
  },
  {
    id: "y10", discipline: "yoga", name: "Savasana",
    position: "Decúbito supino", modality: ["suave", "dinamico", "restaurativo"], level: ["inicial", "intermedio", "avanzado"],
    moment: 6, objective: ["enraizamiento", "columna-yoga", "cadera", "fuerza-yoga"],
    description: "Relajación final: soltá el control de la respiración y quedate en quietud unos minutos.",
    seriesDefault: 1,
  },
];
