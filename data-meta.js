/* ============================================================
   METADATOS ESTRUCTURADOS DE LOS EJERCICIOS
   ------------------------------------------------------------
   Se carga DESPUÉS de data.js y data-extra-2.js. Completa en cada
   ejercicio los campos que el generador usa para filtrar y ordenar:

     nivelMin   "inicial" | "intermedio" | "avanzado"  (nivel mínimo)
     level      se recalcula como [nivelMin, ...niveles superiores]
     accesorio  ["correas_manos","correas_pies","barra","box","carro","torre",
                 "banda","aro","pelota","fitball","bloques","foam_roller","ninguno"]
     posicion   "supino" | "lateral" | "prono" | "plancha" | "cuadrupedia" |
                "arrodillado" | "sentado" | "de_pie_en_carro" | "de_pie_en_piso"
     patron     ["empuje","traccion","escapular","rotacion","flexion_columna",
                 "extension_columna","flexion_lateral","estabilidad_core",
                 "bisagra_cadera","sentadilla","aduccion","abduccion","movilidad"]
     resortes   texto (solo reformer)
     regresion  texto corto (lo que se muestra en nivel inicial)
     progresion texto corto (lo que se muestra en nivel avanzado)

   Si un ejercicio ya trae alguno de estos campos cargado a mano,
   se respeta: las reglas de abajo solo completan lo que falta.
   OVERRIDES permite corregir casos puntuales sin tocar data.js.
   ============================================================ */

(function () {
  const LEVELS = ["inicial", "intermedio", "avanzado"];
  const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const isReformer = (ex) => (ex.modality || []).includes("reformer");

  // ---------- correcciones puntuales (id -> campos) ----------
  // Revisión hecha con criterio de profesora de Pilates (nov 2026).
  // Lo que se carga acá pisa lo que calcula el detector automático.
  // Cada id aparece UNA sola vez: si un ejercicio tiene varias correcciones, van juntas.

  // Carro firme: ejercicios sentada, arrodillada o acostada con un accesorio, donde el carro
  // NO tiene que moverse. Con un resorte liviano el carro rueda y la alumna pierde la base.
  const FIRME = "Verde o carro trabado (el carro no se tiene que mover)";

  const OVERRIDES = {
    /* ===== 1. NIVELES — los 45 cambios del detector ===== */

    // --- 1a. CORREGIDOS (19): el detector los subió de más ---
    // Criterio: el puente básico (pelvic curl) es la BASE del repertorio inicial.
    // Lo que exige control de centro es el puente con marcha, unipodal, piernas extendidas
    // o sobre una superficie inestable (fitball, roller). Esos sí suben.
    "pilates-006": { nivelMin: "inicial" }, // Spine Twist: repertorio básico de mat (regresión: sentada sobre almohadón, rodillas flexionadas)
    "pilates-007": { nivelMin: "inicial" }, // Single Leg Stretch PREPARACIÓN: con cabeza apoyada es inicial
    "pilates-011": { nivelMin: "inicial" }, // Single Leg Circles: básico con la pierna de apoyo flexionada y círculos chicos
    "pilates-057": { nivelMin: "inicial" }, // puente articulado en el carro: base del reformer inicial
    "pilates-061": { nivelMin: "inicial" }, // secuencia SIMPLE de brazos y piernas: inicial
    "pilates-077": { nivelMin: "inicial" }, // el aro entre rodillas facilita (da feedback de alineación)
    "pilates-083": { nivelMin: "inicial" }, // la pelota entre manos y rodillas ES la regresión del dead bug
    "pilates-140": { nivelMin: "inicial" }, // pies sobre bloques: base estable, sigue siendo puente básico
    "pilates-157": { nivelMin: "intermedio" }, // Long Stretch es intermedio en el repertorio (el nombre lo dice)
    "pilates-160": { nivelMin: "inicial" }, // puente con banda en muslos: la banda guía la alineación de rodillas
    "pilates-172": { nivelMin: "inicial" }, // puente con pelota entre rodillas: facilita
    "pilates-180": { nivelMin: "inicial", accesorio: ["pelota", "carro"], patron: ["movilidad"], resortes: FIRME }, // liberación lumbar: es descarga, no trabajo de centro
    "pilates-234": { nivelMin: "inicial" }, // puente en el carro con aro: básico
    "pilates-261": { nivelMin: "inicial" }, // puente con bloque entre muslos: básico
    "pilates-326": { nivelMin: "inicial" }, // plancha DE RODILLAS: es la regresión de la plancha
    "pilates-351": { nivelMin: "inicial" }, // puente segmentado con pausa: es el pelvic curl clásico
    "pilates-366": { nivelMin: "inicial" }, // coordinación SIMPLE: igual que pilates-445, que ya es inicial
    "pilates-372": { nivelMin: "inicial", accesorio: ["aro", "carro"], resortes: FIRME }, // rodillas al pecho en supino: descarga lumbar
    "pilates-376": { nivelMin: "inicial", patron: ["movilidad"] }, // postura del niño: es descanso, nunca puede ser intermedio

    // --- 1b. CONFIRMADOS (26): el detector tenía razón. Quedan fijos para que no dependan de la regex ---
    "pilates-079": { nivelMin: "intermedio" }, // pies sobre fitball: superficie inestable
    "pilates-105": { nivelMin: "intermedio" }, // puente en fitball
    "pilates-164": { nivelMin: "avanzado" }, // puente con marcha en el carro: el carro se mueve, exige mucho centro
    "pilates-270": { nivelMin: "intermedio" }, // puente + empuje del carro
    "pilates-273": { nivelMin: "intermedio" }, // arrodillada en el carro
    "pilates-276": { nivelMin: "intermedio", resortes: FIRME }, // arrodillada en el carro con banda
    "pilates-282": { nivelMin: "intermedio" }, // puente + empuje del carro
    "pilates-286": { nivelMin: "intermedio" }, // chest expansion arrodillada
    "pilates-299": { nivelMin: "intermedio" }, // estocada con rotación: exige equilibrio
    "pilates-311": { nivelMin: "intermedio" }, // plancha completa
    "pilates-314": { nivelMin: "intermedio" }, // estocada con rotación
    "pilates-328": { nivelMin: "intermedio" }, // mesa invertida: carga de muñecas y hombros
    "pilates-331": { nivelMin: "intermedio" }, // estocada con rotación
    "pilates-336": { nivelMin: "intermedio" }, // flexión de brazos sobre roller: inestable
    "pilates-338": { nivelMin: "intermedio" }, // cuadrupedia a plancha
    "pilates-353": { nivelMin: "intermedio" }, // Hundred en correas
    "pilates-360": { nivelMin: "intermedio", posicion: "cuadrupedia" }, // knee stretch: misma posición que pilates-014 y 074
    "pilates-362": { nivelMin: "intermedio" }, // arrodillada con correas
    "pilates-363": { nivelMin: "intermedio" }, // swan en la caja larga
    "pilates-364": { nivelMin: "intermedio" }, // pulling straps
    "pilates-368": { nivelMin: "intermedio" }, // arrodillada con correas
    "pilates-370": { nivelMin: "intermedio" }, // puente con brazos sobre la cabeza: suma palanca larga
    "pilates-379": { nivelMin: "avanzado" }, // puente con marcha y aro
    "pilates-380": { nivelMin: "intermedio" }, // rotación arrodillada con correa
    "pilates-382": { nivelMin: "avanzado" }, // puente unipodal con aro
    "pilates-383": { nivelMin: "intermedio" }, // integración footwork + puente

    // --- 1c. OTROS NIVELES MAL CARGADOS EN LA BASE (no los marcó el detector) ---
    "pilates-016": { nivelMin: "intermedio" }, // Long Stretch: mismo nivel que pilates-157
    "pilates-017": { nivelMin: "inicial" }, // push-up sobre rodillas: es la regresión de la flexión de brazos
    "pilates-025": { nivelMin: "intermedio" }, // plancha alta: intermedio, no avanzado
    "pilates-151": { nivelMin: "inicial", patron: ["bisagra_cadera", "aduccion"] }, // Frog: ejercicio de entrada a correas en pies (no es rotación)
    "pilates-152": { nivelMin: "inicial" }, // círculos en correas: básico del reformer
    "pilates-203": { nivelMin: "intermedio" }, // elevación lateral de piernas juntas: intermedio
    "pilates-330": { nivelMin: "intermedio" }, // caminata de manos hasta plancha: termina en plancha completa

    /* ===== 2. REFORMER SIN CONFIGURACIÓN CLARA (26) ===== */
    // La mayoría son ejercicios sentada, arrodillada o acostada sobre el carro con banda, aro o pelota.
    // "Sobre el carro" está bien como accesorio; lo que estaba MAL era el resorte (uno liviano hace rodar el carro).
    "pilates-059": { resortes: FIRME }, // cuadrupedia sobre el carro
    "pilates-116": { accesorio: ["banda", "carro"], resortes: FIRME },
    "pilates-117": { accesorio: ["banda", "carro"], resortes: FIRME },
    "pilates-163": { resortes: FIRME, patron: ["traccion", "escapular", "estabilidad_core"] }, // apertura de brazos con banda = tracción horizontal
    "pilates-165": { resortes: FIRME },
    "pilates-167": { resortes: FIRME },
    "pilates-177": { resortes: FIRME },
    // pilates-180: corregido arriba (nivel + config)
    "pilates-239": { resortes: FIRME },
    "pilates-243": { accesorio: ["barra"], resortes: "Azul (liviano a medio)", patron: ["rotacion", "estabilidad_core"] }, // Snake: manos en la barra, pies contra los apoyahombros
    "pilates-244": { accesorio: ["barra"], resortes: "Azul (liviano a medio)", patron: ["estabilidad_core", "abduccion"] }, // Star: mano en la barra, pie en el carro
    "pilates-266": { resortes: FIRME },
    "pilates-267": { resortes: FIRME },
    "pilates-271": { resortes: FIRME },
    "pilates-272": { resortes: FIRME, patron: ["abduccion", "rotacion"] },
    "pilates-275": { accesorio: ["banda", "barra"], resortes: "Verde (máximo)" }, // es footwork: pies en la barra
    // pilates-276: corregido arriba (nivel + config)
    "pilates-277": { resortes: FIRME },
    "pilates-278": { resortes: FIRME },
    "pilates-284": { resortes: FIRME },
    "pilates-285": { resortes: FIRME },
    "pilates-291": { resortes: FIRME },
    "pilates-345": { resortes: FIRME },
    // pilates-372: corregido arriba (nivel + config)
    "pilates-373": { resortes: FIRME },
    "pilates-375": { resortes: FIRME },

    /* ===== 3. ACCESORIOS, PATRONES Y POSICIONES MAL DETECTADOS ===== */
    // Push Through Bar es de la TORRE, no son correas. Y se EMPUJA la barra: no es tracción.
    "pilates-005": { accesorio: ["torre"], posicion: "sentado", patron: ["empuje", "flexion_columna", "escapular"], resortes: "Torre: resorte del push through, medio" },
    "pilates-153": { accesorio: ["correas_pies"], patron: ["abduccion", "aduccion", "estabilidad_core"], resortes: "Azul (liviano a medio)" }, // la correa va en el PIE, no en la mano
    "pilates-154": { patron: ["empuje", "escapular"] }, // Offering: empuje al frente con palmas arriba
    "pilates-021": { patron: ["escapular"] }, // protracción/retracción: es escapular, no empuje ni tracción
    "pilates-350": { patron: ["empuje", "estabilidad_core"] }, // tríceps: es empuje
    "pilates-033": { patron: ["escapular", "movilidad"] },
    "pilates-036": { patron: ["abduccion", "estabilidad_core"] }, // Side Kick no es rotación
    "pilates-035": { patron: ["sentadilla", "estabilidad_core"] }, // Standing Leg Press: trabajo de piernas
    "pilates-147": { patron: ["sentadilla"] }, // Running: trabajo de piernas y pies
    "pilates-156": { patron: ["sentadilla", "estabilidad_core"] }, // Scooter: empuje con la pierna
    "pilates-072": { patron: ["bisagra_cadera", "estabilidad_core"] }, // puente con pierna extendida: no es extensión de columna
    "pilates-087": { patron: ["bisagra_cadera", "estabilidad_core"] }, // extensión de CADERA, no de columna
    "pilates-174": { patron: ["bisagra_cadera", "estabilidad_core"] }, // puente: no es rotación
    "pilates-201": { patron: ["bisagra_cadera", "estabilidad_core"] }, // puente unipodal: no es rotación
    "pilates-224": { patron: ["bisagra_cadera", "estabilidad_core"] },
    "pilates-245": { patron: ["flexion_columna", "estabilidad_core"] }, // Tendon Stretch: no es sentadilla
    "pilates-246": { patron: ["estabilidad_core"] }, // Balance Control Front: no es rotación
    "pilates-138": { patron: ["movilidad"] },
    "pilates-141": { patron: ["escapular"] },
    "pilates-097": { patron: ["aduccion", "estabilidad_core"] },
    "pilates-175": { posicion: "cuadrupedia" }, // knee stretch: igual que 014 y 074 (ordena mejor la clase)
    "pilates-237": { posicion: "cuadrupedia" },
    // Caja corta: la serie se hace con el carro FIRME (resortes llenos), no liviano
    "pilates-236": { resortes: FIRME },
    "pilates-287": { resortes: FIRME },
    "pilates-357": { resortes: FIRME, patron: ["estabilidad_core", "aduccion"] }, // espalda plana: centro, no flexión lateral
    "pilates-358": { resortes: FIRME },
    "pilates-369": { resortes: FIRME },

    /* ===== 4. PATRONES DEDUCIDOS DEL TEXTO (revisión del resto de la base) ===== */
    // Criterio: el patrón tiene que decir qué TRABAJA el ejercicio, no qué palabra aparece en la descripción.
    "pilates-004": { patron: ["flexion_columna", "estabilidad_core"] }, // Hundred prep: no es movilidad
    "pilates-009": { patron: ["flexion_columna", "estabilidad_core"] }, // Hundred completo
    "pilates-015": { patron: ["extension_columna", "estabilidad_core"] }, // Swimming: es extensión
    "pilates-028": { patron: ["rotacion", "flexion_columna"] }, // Criss Cross: rota en flexión
    "pilates-029": { patron: ["extension_columna", "estabilidad_core"] }, // brazo y pierna cruzados en prono
    "pilates-031": { patron: ["bisagra_cadera", "estabilidad_core"] }, // es un puente
    "pilates-038": { patron: ["bisagra_cadera", "estabilidad_core"] }, // Reverse Plank: extensión de cadera
    "pilates-046": { patron: ["estabilidad_core"] }, // activación del centro, no movilidad
    "pilates-089": { patron: ["traccion", "escapular"] }, // abrir la banda = tracción horizontal
    "pilates-093": { patron: ["abduccion", "estabilidad_core"] }, // caminata lateral con banda: glúteo medio
    "pilates-094": { patron: ["empuje", "escapular"] }, // presionar el aro entre las manos: pectoral
    "pilates-115": { patron: ["abduccion", "estabilidad_core"] },
    "pilates-125": { patron: ["movilidad"] }, // brazos al techo de cierre: no es tracción
    "pilates-173": { patron: ["traccion", "estabilidad_core"] }, // brazos en correas
    "pilates-193": { patron: ["extension_columna", "escapular"] }, // swan: no es aducción
    "pilates-196": { patron: ["escapular"] },
    "pilates-209": { patron: ["bisagra_cadera", "estabilidad_core"] }, // curl de isquios: no es flexión de columna
    "pilates-212": { patron: ["bisagra_cadera", "estabilidad_core"] }, // mesa invertida: extensión de cadera
    "pilates-221": { patron: ["flexion_columna", "estabilidad_core"] }, // Hundred con bloque
    "pilates-222": { patron: ["movilidad"] }, // estiramiento de flexores: no es sentadilla
    "pilates-251": { patron: ["extension_columna", "estabilidad_core"] },
    "pilates-252": { patron: ["flexion_lateral", "estabilidad_core"] }, // Side Bend: no es empuje
    "pilates-254": { patron: ["estabilidad_core", "flexion_columna"] }, // Open Leg Rocker
    "pilates-290": { patron: ["rotacion", "movilidad"] }, // caída lateral de rodillas: rotación de columna
    "pilates-321": { posicion: "plancha" }, // caminata de manos desde la pelota termina en plancha
    "pilates-334": { patron: ["escapular", "estabilidad_core"] }, // protracción: no es tracción
  };

  // Leyenda de resortes que se muestra en la interfaz: escala de colores del estudio
  // (amarillo < azul < rojo < verde). Los textos de resortes de cada ejercicio usan esta escala.
  window.RESORTES_LEYENDA = "Colores de los resortes del estudio: amarillo = muy liviano (precisión, entrada en calor, rehabilitación) · azul = liviano a medio (estabilidad y control) · rojo = alto (fuerza) · verde = máximo (fuerza avanzada, con técnica consolidada).";

  // ---------- accesorio ----------
  const EQUIP_TO_ACC = {
    band: "banda", "magic-circle": "aro", "soft-ball": "pelota",
    fitball: "fitball", blocks: "bloques", "foam-roller": "foam_roller",
  };

  function computeAccesorio(ex, setup) {
    const acc = new Set((ex.equipment || []).map((e) => EQUIP_TO_ACC[e]).filter(Boolean));
    if (isReformer(ex)) {
      const feet = /pies (en|dentro de) (las )?correas|correas en (los )?pies|correas en los empeines|rana|frog/.test(setup);
      const hands = /correas? (en|entre) (las |ambas )?manos|correas en las manos|tir\w* de las correas|las correas (hacia|desde)|baj\w* (las )?correas|brazos (en|con) (las )?correas|tomando las correas|sosten\w* las correas|correas tensas|con las correas/.test(setup)
        || /resortes de brazos|espaldas al cabezal|manijas|\basas\b/.test(setup)
        || (/correa/.test(setup) && !feet && !/bajo la correa|debajo de la correa/.test(setup));
      if (feet) acc.add("correas_pies");
      if (hands) acc.add("correas_manos");
      if (/caja (larga|corta)|\bbox\b/.test(setup)) acc.add("box");
      if (!feet && !hands && /barra/.test(setup)) acc.add("barra");
      if (![...acc].some((a) => ["correas_pies", "correas_manos", "box", "barra"].includes(a))) acc.add("carro");
    }
    if (!acc.size) acc.add("ninguno");
    return [...acc];
  }

  // ---------- posición ----------
  function computePosicion(ex) {
    const p = norm((ex.position || "").split(",")[0]);
    const all = norm(ex.position + " " + ex.name);
    if (/plancha|perro boca abajo/.test(p) || /plancha(?! (invertida|inversa))/.test(norm(ex.name)) && !/reverse plank|mesa invertida/.test(norm(ex.name))) return "plancha";
    if (/rodillas|arrodill/.test(p)) return "arrodillado";
    if (/sentad|paloma|silla|equilibrio/.test(p)) return "sentado";
    if (/cuadrupedia/.test(p)) return "cuadrupedia";
    if (/supino|boca arriba|omoplatos sobre/.test(p)) return "supino";
    if (/prono|boca abajo/.test(p)) return "prono";
    if (/costado|lateral/.test(p)) return "lateral";
    if (/de pie|estocada|zancada|cuclillas|sentadilla|una pierna/.test(p)) {
      return isReformer(ex) && /carro|plataforma/.test(all) ? "de_pie_en_carro" : "de_pie_en_piso";
    }
    if (/supino/.test(all)) return "supino";
    if (/sentad/.test(all)) return "sentado";
    return isReformer(ex) ? "supino" : "de_pie_en_piso";
  }

  // ---------- patrón de movimiento ----------
  function computePatron(ex, txt, posicion) {
    const obj = ex.objective || [];
    const upper = obj.includes("tren-superior") || obj.includes("control-escapular");
    const out = new Set();
    const has = (re) => re.test(txt);

    const push = has(/\bpress\b|empuj\w* (con )?los brazos|extend\w* (los|ambos) brazos hacia (el techo|adelante|arriba|el frente)|flexion(es)? de brazos|push|triceps|punch|golpe|abrazo|hug|saludo|salute|empuj\w* el piso|empuj\w* hacia el techo|llev\w* (el aro|los brazos|las manos) hacia el techo|shaving|serve/);
    const pull = has(/\bremo\b|row|tir\w* de|traccion|chest expansion|expansion de pecho|biceps|bajada de brazos|baj\w* (los brazos|las correas)|pull|hacia (la cadera|las costillas)|llev\w* los codos hacia atras|aperturas? horizontal|abr\w* la banda/);

    if (upper && push) out.add("empuje");
    if (upper && pull) out.add("traccion");
    if (!upper && has(/flexion(es)? de brazos|push.?up/)) out.add("empuje");
    if (upper && has(/omoplat|escapul|protracci|retracci|angeles|movilidad de hombros|circulos de brazos/)) out.add("escapular");

    if (has(/\brot\w*|\bsaw\b|serrucho|criss|giro|twist|torsion|sacacorchos|corkscrew/)) out.add("rotacion");
    if (has(/roll up|roll down|roll back|enroll|desenroll|hundred|abdominal|\bcurl\b|teaser|flexion de torso|redonde|rodillas al pecho|jackknife|roll over|short spine|long spine|single leg stretch|double leg stretch|elev\w* (la )?cabeza y (los )?hombros/)) out.add("flexion_columna");
    if (has(/swan|cisne|extension (de |toracica)|elev\w* el pecho|cobra|y-t-w|w e y|brazos en w|backbend/)) out.add("extension_columna");
    if (has(/mermaid|sirena|inclinaci\w* lateral|flexion lateral|side bend|estiramiento lateral|el costado se alargue|inclinate/)) out.add("flexion_lateral");
    if (has(/plancha|dead bug|bicho muerto|\bmesa\b|bird dog|marcha|equilibrio|balance|elephant|elefante|knee stretch|estabilidad|sin que (la pelvis|el carro|el roller|la pelota) (se mueva|ruede|caiga)/) || posicion === "plancha") out.add("estabilidad_core");
    if (has(/puente|bisagra|peso muerto|extension de cadera|patada hacia atras|kick back|elev\w* la pelvis/)) out.add("bisagra_cadera");
    if (has(/sentadilla|squat|estocada|zancada|footwork|empuj\w* el carro con (las )?piernas|relev|talones en la barra|lunge|salto|jump/)) out.add("sentadilla");
    if (has(/clam|almeja|abduccion|apertura lateral de piernas?|elevacion lateral de piernas?|abr\w* (la )?rodilla de arriba|abr\w* y cerr\w* las piernas|side kick|patada lateral|abr\w* las piernas/)) out.add("abduccion");
    if (!out.has("empuje") && !out.has("traccion") && has(/aduccion|presion\w* (suave )?(el aro|la pelota|el bloque)|cerr\w* las piernas/)) out.add("aduccion");
    if (has(/movilidad|estiramiento|elong|respiraci|apertura de pecho|circulos|descarga|liber|gato|vaca|balanceo|bascula/)) out.add("movilidad");

    if (!out.size) out.add(ex.moment === 1 || ex.moment === 6 ? "movilidad" : "estabilidad_core");
    return [...out];
  }

  // ---------- nivel mínimo ----------
  const AV_RE = /unipodal|un solo pie|teaser|jackknife|roll over|short spine|long spine|snake|serpiente|\bstar\b|corkscrew|sacacorchos|rocker|side bend|swan dive|control balance|balance control|tendon stretch|backstroke|long stretch|up stretch|\bpike\b|rodillas al pecho en plancha|boomerang|puente[^.]*marcha|puente[^.]*piernas extendidas|sin (apoyo de )?(las )?manos|salto|jump|una pierna (extendida )?(al|hacia el) techo[^.]*pelvis|plancha lateral(?! (asistida|corta|sobre antebrazo y rodilla))/;
  const INT_RE = /puente|plancha|hundred|single leg stretch|double leg stretch|criss|roll up|de rodillas (en|sobre) el carro|arrodillada|de pie (en|sobre) el carro|plataforma|knee stretch|elephant|elefante|down stretch|dead bug|estocada|zancada|swan|rodillas al pecho|caja larga|pulsos|mesa invertida|side kick|curl de isquio|piernas en diagonal|coordinaci/;
  const EASY_RE = /puente bajo|despertar de columna|bascula|respiraci|movilidad|estiramiento|apertura de pecho|activacion|descarga/;

  function heuristicLevel(txt) {
    if (AV_RE.test(txt)) return "avanzado";
    if (INT_RE.test(txt) && !EASY_RE.test(txt)) return "intermedio";
    return "inicial";
  }

  const maxLevel = (a, b) => LEVELS[Math.max(LEVELS.indexOf(a), LEVELS.indexOf(b))];

  // ---------- resortes sugeridos (solo reformer) ----------
  function computeResortes(ex) {
    const acc = ex.accesorio, pos = ex.posicion, pat = ex.patron;
    if (acc.includes("correas_pies")) return "Rojo (alto)";
    if (acc.includes("box")) return "Azul (liviano a medio)";
    if (acc.includes("correas_manos")) {
      if (pos === "supino") return "Azul (liviano a medio)";
      return "Amarillo o azul (liviano)";
    }
    if (pos === "de_pie_en_carro") return "Azul (liviano a medio; que el carro no se dispare)";
    if (pos === "plancha" || pos === "cuadrupedia" || pos === "arrodillado") return "Rojo (alto)";
    if (pos === "lateral" || (pos === "sentado" && pat.includes("flexion_lateral"))) return "Azul (liviano a medio)";
    if (acc.includes("barra") && pat.includes("bisagra_cadera")) return "Rojo o verde (alto a máximo)";
    if (acc.includes("barra")) return "Verde (máximo)";
    return "Rojo (alto)";
  }

  // grupo de configuración del carro: sirve para ordenar y no cambiar resortes/correas a cada rato
  function computeSetupGroup(ex) {
    if (!isReformer(ex)) return "";
    const a = ex.accesorio;
    if (a.includes("torre")) return "0-torre";
    if (a.includes("barra")) return "1-barra";
    if (a.includes("correas_pies")) return "2-correas_pies";
    if (a.includes("correas_manos")) return "3-correas_manos";
    if (a.includes("box")) return "4-box";
    return "5-carro";
  }

  // ---------- regresión / progresión ----------
  function splitProgression(text) {
    if (!text) return null;
    const [first, ...rest] = text.split(/;\s*/);
    const easy = first.replace(/^variante más fácil:\s*/i, "").trim();
    let hard = rest.join("; ").replace(/^para progresar[^,]*,\s*/i, "").trim();
    if (/no requiere|sin necesidad|no necesita/i.test(hard + first)) hard = "";
    return { easy, hard };
  }

  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  function genericRegresion(ex) {
    const pat = ex.patron;
    if (isReformer(ex)) {
      if (pat.includes("empuje") || pat.includes("traccion")) return "Recorrido más corto y un color de resorte más liviano, priorizando que los hombros no suban";
      return "Un color de resorte más pesado para estabilizar el carro y recorrido más corto";
    }
    if (ex.discipline === "yoga") return "Usá bloques, manta o pared como apoyo y entrá solo hasta la primera sensación";
    if (ex.posicion === "supino") return "Cabeza apoyada y rodillas flexionadas para acortar la palanca";
    if (ex.posicion === "plancha") return "Apoyá las rodillas para bajar la carga";
    if (ex.posicion === "de_pie_en_piso") return "Base más amplia y apoyo en una pared o silla si hace falta";
    return "Rango reducido y más base de apoyo, priorizando la alineación";
  }

  function genericProgresion(ex) {
    const pat = ex.patron;
    if (isReformer(ex)) {
      if (pat.includes("empuje") || pat.includes("traccion")) return "Pasá a un color de resorte más pesado o sumá una pausa de 2 tiempos al final del recorrido";
      return "Un color de resorte más liviano para exigir más control del centro";
    }
    if (ex.discipline === "yoga") return "Más permanencia y sin apoyos, buscando la expresión completa de la postura";
    if (ex.posicion === "supino") return "Palancas largas (piernas o brazos extendidos) y cabeza y hombros elevados";
    if (ex.posicion === "plancha") return "Elevá un brazo o una pierna sin que la pelvis rote";
    return "Palancas más largas y una pausa de 2 tiempos al final del recorrido";
  }

  // ---------- enriquecer un ejercicio ----------
  function enrichExercise(ex) {
    if (!ex || ex._meta) return ex;
    Object.assign(ex, OVERRIDES[ex.id] || {});
    const setup = norm([ex.position, ex.name, ex.description].join(" "));
    const txt = norm([ex.name, ex.position, ex.description].join(". "));

    if (!ex.accesorio || !ex.accesorio.length) ex.accesorio = computeAccesorio(ex, setup);
    if (!ex.posicion) ex.posicion = computePosicion(ex);
    if (!ex.patron || !ex.patron.length) ex.patron = computePatron(ex, txt, ex.posicion);

    // nivel mínimo: el menor nivel cargado, subido si el ejercicio exige más control del que dice la base
    if (!ex.nivelMin) {
      const loaded = (ex.level || []).filter((l) => LEVELS.includes(l));
      const minLoaded = loaded.length ? LEVELS.find((l) => loaded.includes(l)) : "inicial";
      ex.nivelMin = ex.discipline === "pilates" ? maxLevel(minLoaded, heuristicLevel(txt)) : minLoaded;
    }
    ex.level = LEVELS.slice(LEVELS.indexOf(ex.nivelMin));

    if (isReformer(ex) && !ex.resortes) ex.resortes = computeResortes(ex);
    ex.setupGroup = computeSetupGroup(ex);

    const prog = splitProgression(ex.progression);
    if (!ex.regresion) ex.regresion = cap(prog && prog.easy ? prog.easy : genericRegresion(ex));
    if (!ex.progresion) ex.progresion = cap(prog && prog.hard ? prog.hard : genericProgresion(ex));

    Object.defineProperty(ex, "_meta", { value: true, enumerable: false });
    return ex;
  }

  EXERCISES.forEach(enrichExercise);
  window.enrichExercise = enrichExercise;

  // etiquetas para la interfaz
  window.ACCESORIO_LABELS = {
    correas_manos: "Correas en manos", correas_pies: "Correas en pies", barra: "Barra",
    box: "Box", carro: "Sobre el carro", banda: "Banda", aro: "Aro mágico", pelota: "Pelota",
    fitball: "Fitball", bloques: "Bloques", foam_roller: "Foam roller", ninguno: "Sin elementos",
    torre: "Torre (push through)",
  };
  window.POSICION_ORDER = ["supino", "lateral", "prono", "plancha", "cuadrupedia", "arrodillado", "sentado", "de_pie_en_carro", "de_pie_en_piso"];
  window.POSICION_LABELS = {
    supino: "Supino", lateral: "De costado", prono: "Prono", plancha: "Plancha", cuadrupedia: "Cuadrupedia",
    arrodillado: "Arrodillada", sentado: "Sentada", de_pie_en_carro: "De pie en el carro", de_pie_en_piso: "De pie",
  };
  window.PATRON_LABELS = {
    empuje: "Empuje", traccion: "Tracción", escapular: "Hombros y escápulas", rotacion: "Rotación",
    flexion_columna: "Flexión de columna", extension_columna: "Extensión de columna", flexion_lateral: "Flexión lateral",
    estabilidad_core: "Estabilidad de centro", bisagra_cadera: "Bisagra de cadera", sentadilla: "Sentadilla / piernas",
    aduccion: "Aducción", abduccion: "Abducción", movilidad: "Movilidad",
  };
  // sub-objetivo para "Fuerza de tren superior"
  window.UPPER_FOCUS = [
    { id: "mixto", label: "Mixto", patron: null },
    { id: "empuje", label: "Empujes", patron: "empuje" },
    { id: "traccion", label: "Tracciones", patron: "traccion" },
    { id: "escapular", label: "Hombros y escápulas", patron: "escapular" },
  ];
})();
