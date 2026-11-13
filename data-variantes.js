/* ============================================================
   VARIANTES POR NIVEL — solo Pilates  (v3, revisada contra la base real)
   ------------------------------------------------------------
   Archivo: data-variantes.js
   Orden de carga: data.js → data-extra-2.js → data-extra-3.js → data-meta.js →
   ESTE ARCHIVO → app.js

   Cada ejercicio de Pilates queda con una versión por nivel
   (inicial, intermedio y avanzado), y cada versión pertenece a
   UN solo nivel. Así una clase intermedia y una avanzada nunca
   traen el mismo ejercicio: traen la versión de su nivel.

   De dónde sale el texto de cada versión (gana el primero que exista):
     1) MANUALES  → escrito a mano por id (abajo). Hoy cubre los 53
                    ejercicios avanzados y los intermedios cuya
                    "regresión" en la base era en realidad más difícil.
     2) CLASICOS  → progresiones del repertorio clásico de colchoneta
                    (solo mat sin accesorios) y footwork de reformer.
     3) Regresión / progresión del propio ejercicio, si es real.
     4) PATRONES  → si el ejercicio trae el texto genérico de
                    data-meta.js, se usa una progresión pensada para su
                    patrón de movimiento (puente, extensión, rotación…).
     Un nivel arriba = progresión · dos niveles arriba = progresión
     + tempo lento/pausa · un nivel abajo = regresión · dos niveles
     abajo = regresión + recorrido corto y pausas.

   Reglas de seguridad:
     - Inversiones y carga cervical o de hombros en el carro (Roll Over,
       Jackknife, Short/Long Spine, Snake, Star, Tendon Stretch,
       Balance Control…) NO tienen versión inicial.
     - Carro firme: el resorte no cambia en ninguna versión.
     - Preparación, cierre y ejercicios de pura movilidad progresan con
       permanencia y respiración, nunca con carga.
     - Población (data.js: general, mayores, embarazo, principiantes):
         · "principiantes" nunca pasa a una versión más difícil
           (app.js arma esas clases siempre en nivel inicial);
         · "embarazo" pasa solo si el ejercicio no es supino, prono ni
           plancha, no tiene flexión ni rotación de columna y no está
           marcado para evitar en embarazo;
         · "mayores" pasa a intermedio siempre, y a avanzado solo si no
           tiene flexión ni rotación de columna y no es una plancha.
       Lo que no pasa se completa en app.js con la versión de un nivel
       más abajo del mismo ejercicio (ver levelsFor).
       Si no queda ninguna población, esa versión no se genera.
     - Las versiones más difíciles suman en el cue el prerrequisito
       para pasar de nivel.

   Para corregir una versión puntual, en MANUALES:
     "pilates-006": { avanzado: "texto del cambio" }        ← solo el cambio
     "pilates-006": { avanzado: { description: "..." } }     ← pisa campos
     "pilates-006": { inicial: false }                       ← no generarla
   ============================================================ */

;(function () {
  if (typeof EXERCISES === "undefined" || !Array.isArray(EXERCISES)) {
    console.warn("[variantes] EXERCISES no está cargado: revisá el orden de los scripts.");
    return;
  }

  const LV = ["inicial", "intermedio", "avanzado"];
  const SUF = { inicial: "ini", intermedio: "int", avanzado: "ava" };
  const ADJ = { inicial: "inicial", intermedio: "intermedia", avanzado: "avanzada" };

  /* ============================================================
     1) VERSIONES ESCRITAS A MANO
     El texto describe QUÉ cambia respecto del ejercicio original.
     ============================================================ */
  const MANUALES = {
    /* --- Avanzados: versión inicial e intermedia --- */
    "pilates-029": { inicial: "con el carro firme, elevar solo un brazo o solo una pierna por vez y volver", intermedio: "brazo y pierna contrarios a la vez en recorrido corto, con el carro firme" },
    "pilates-037": { inicial: "pies apoyados, roll back parcial con los brazos al frente y vuelta a sentada", intermedio: "una pierna extendida y el otro pie apoyado (single leg teaser), subiendo solo hasta donde se sostenga sin impulso" },
    "pilates-038": { inicial: "sentada con las manos atrás y rodillas flexionadas, elevar apenas la pelvis (mesa baja) con el carro firme", intermedio: "mesa invertida con rodillas a 90° y la cadera a la altura de los hombros, sin extender las piernas" },
    "pilates-039": { intermedio: "piernas a 90° y despegar solo la pelvis unos centímetros, rodando hasta la cintura, sin pasar el peso al cuello" },
    "pilates-041": { inicial: "inclinación lateral sentada sin mover el carro, con el brazo por encima de la cabeza", intermedio: "inclinación lateral empujando el carro en recorrido corto, sin sumar la rotación" },
    "pilates-055": { inicial: "elephant con rodillas levemente flexionadas, recorrido corto y un color de resorte más pesado", intermedio: "elephant clásico con talones apoyados y recorrido medio, sin buscar la flexión profunda" },
    "pilates-058": { inicial: "sentada sobre los talones, bajar los brazos solo hasta el costado del cuerpo, sin la extensión de columna", intermedio: "arrodillada alta, brazos hasta atrás de la cadera con pausa, sin sumar la extensión de columna" },
    "pilates-066": { inicial: "pies apoyados, roll back parcial con los brazos al frente y vuelta a sentada", intermedio: "una pierna extendida y el otro pie apoyado (single leg teaser)" },
    "pilates-072": { inicial: "puente articulado con ambos pies en la barra y el carro quieto", intermedio: "puente sostenido despegando solo un talón por vez, sin extender la pierna" },
    "pilates-164": { inicial: "puente articulado con la banda en las rodillas y ambos pies en la barra, sin marcha", intermedio: "puente sostenido presionando la banda, despegando solo un talón por vez" },
    "pilates-182": { inicial: "cabeza apoyada y rodillas en mesa con la banda en los pies, bombeo de brazos corto", intermedio: "cabeza y hombros despegados, piernas en diagonal alta con la banda tensa" },
    "pilates-183": { inicial: "roll back parcial con pies apoyados, sosteniendo la banda en los pies", intermedio: "subir a la V con las rodillas flexionadas (piernas en mesa), usando la banda como asistencia" },
    "pilates-185": { inicial: "plancha de rodillas sostenida, sin pasos de manos", intermedio: "plancha completa sostenida, sin pasos de manos" },
    "pilates-187": { inicial: "acostada de lado con la cabeza sobre el brazo, patada corta con la banda floja", intermedio: "plancha lateral de antebrazo con la rodilla de abajo apoyada, sin la patada" },
    "pilates-191": { inicial: "roll back parcial con pies apoyados y el aro al frente", intermedio: "single leg teaser con el aro al frente" },
    "pilates-192": { inicial: "acostada de lado presionando el aro entre los tobillos, sin elevar la cadera", intermedio: "plancha lateral de antebrazo con la rodilla de abajo apoyada, presionando el aro" },
    "pilates-194": { inicial: "puente con el aro entre las rodillas, sin marcha", intermedio: "puente sostenido presionando el aro, despegando solo un talón por vez" },
    "pilates-199": { inicial: "plancha de rodillas con ambas manos en el piso", intermedio: "plancha de rodillas con una mano sobre la pelota" },
    "pilates-200": { inicial: "roll back parcial con pies apoyados y la pelota entre las manos", intermedio: "single leg teaser con la pelota entre las manos" },
    "pilates-201": { inicial: "puente con ambos pies en el piso y la pelota entre las rodillas", intermedio: "puente con ambos pies sobre la pelota" },
    "pilates-207": { inicial: "de rodillas con los antebrazos sobre la pelota, rodar solo unos centímetros", intermedio: "rodar la pelota hasta la mitad del antebrazo sin que la zona lumbar se hunda" },
    "pilates-208": { inicial: "plancha de rodillas en el piso", intermedio: "plancha con las espinillas sobre la pelota, sostenida, sin el pike" },
    "pilates-211": { inicial: "plancha de rodillas en el piso", intermedio: "plancha con las espinillas sobre la pelota, sostenida, sin llevar las rodillas al pecho" },
    "pilates-212": { inicial: "mesa invertida con ambos pies apoyados, recorrido corto y sin extender la pierna", intermedio: "mesa sostenida despegando solo un talón por vez" },
    "pilates-215": { inicial: "flexión de brazos de rodillas en el piso", intermedio: "plancha con los muslos sobre la pelota y flexión de brazos corta" },
    "pilates-216": { inicial: "roll back parcial con pies apoyados y el bloque entre las manos", intermedio: "single leg teaser con el bloque entre las manos" },
    "pilates-217": { inicial: "puente con ambos pies en el piso", intermedio: "puente con ambos pies sobre el bloque" },
    "pilates-218": { inicial: "flexión de brazos de rodillas con las manos en el piso", intermedio: "flexión de brazos de rodillas con las manos sobre los bloques" },
    "pilates-221": { inicial: "cabeza apoyada, rodillas en mesa con el bloque entre las rodillas, bombeo corto", intermedio: "cabeza y hombros despegados, piernas en mesa con el bloque entre los tobillos" },
    "pilates-223": { inicial: "dead bug en la colchoneta: solo brazos o solo piernas por vez", intermedio: "sobre el roller con los pies apoyados, alternando solo los brazos" },
    "pilates-224": { inicial: "puente con ambos pies en el piso", intermedio: "puente con ambos pies sobre el roller" },
    "pilates-226": { inicial: "en la colchoneta con la cabeza apoyada, rodilla al pecho alternada", intermedio: "sobre el roller con la cabeza apoyada, cambio de piernas lento" },
    "pilates-227": { inicial: "plancha de rodillas en el piso", intermedio: "plancha con las espinillas sobre el roller, sostenida, sin llevar las rodillas al pecho" },
    "pilates-229": { inicial: "puente con los pies en el piso", intermedio: "puente con los pies sobre el roller y las rodillas flexionadas" },
    "pilates-230": { inicial: "acostada en la colchoneta, brazo y pierna contrarios desde la mesa", intermedio: "sobre el roller con los pies apoyados, solo los brazos alternados" },
    "pilates-237": { inicial: "cuadrupedia con el carro firme, presionando el aro sin mover el carro", intermedio: "knee stretch en recorrido corto presionando el aro, resorte rojo" },
    "pilates-238": { inicial: "cabeza apoyada, piernas en mesa presionando el aro y solo el movimiento de brazos", intermedio: "coordinación con la cabeza elevada, sin la apertura de piernas" },
    "pilates-242": { intermedio: "en correas: frog y bajada de piernas en diagonal con la pelvis siempre apoyada, sin rodar" },
    "pilates-243": { intermedio: "plancha con las manos en la barra y los pies en el carro: alejar y acercar el carro en pike corto, sin la ondulación ni la rotación" },
    "pilates-244": { intermedio: "plancha lateral con la rodilla de abajo apoyada en el carro y la mano en la barra, sin abrir la pierna" },
    "pilates-245": { intermedio: "sentada en el carro con las manos en la barra: alejar y acercar el carro en recorrido corto con la columna en C, sin despegar la pelvis" },
    "pilates-246": { intermedio: "long stretch: plancha con las manos en la barra, recorrido corto, sin despegar la pierna" },
    "pilates-247": { intermedio: "en correas: bajada de piernas en diagonal y círculos chicos con la pelvis apoyada, sin rodar" },
    "pilates-248": { inicial: "footwork en metatarsos con ambos pies, recorrido completo y lento, sin pulsos", intermedio: "relevé (subir y bajar los talones) con el carro quieto, sin pulsos" },
    "pilates-249": { inicial: "boca abajo en la caja con el carro firme: extensión baja del pecho, sin empujar la barra", intermedio: "empujar la barra en recorrido corto con una extensión moderada" },
    "pilates-250": { inicial: "rodillas juntas en mesa, círculos chicos con las rodillas y la pelvis apoyada", intermedio: "piernas extendidas al techo, círculos chicos sin despegar la pelvis" },
    "pilates-251": { inicial: "esfinge: extensión baja apoyada en los antebrazos, pubis apoyado y cuello largo", intermedio: "swan con las manos debajo de los hombros, extensión solo hasta donde la zona lumbar no se comprima" },
    "pilates-252": { inicial: "plancha lateral de antebrazo con la rodilla de abajo apoyada", intermedio: "plancha lateral de mano con la rodilla de abajo apoyada, sin el arco" },
    "pilates-253": { inicial: "plancha de rodillas sostenida", intermedio: "plancha completa sostenida, sin elevar la pierna" },
    "pilates-254": { inicial: "sentada, sostener el equilibrio con las rodillas flexionadas tomando los tobillos, sin rodar", intermedio: "en equilibrio, extender una pierna por vez, sin rodar" },
    "pilates-257": { intermedio: "piernas a 90° y despegar solo la pelvis unos centímetros, sin llevar las piernas al techo ni pasar el peso al cuello" },
    "pilates-379": { inicial: "puente con el aro entre las rodillas, sin marcha", intermedio: "puente sostenido presionando el aro, despegando solo un talón por vez" },
    "pilates-382": { inicial: "puente articulado con el aro entre los muslos y ambos pies apoyados", intermedio: "puente sostenido presionando el aro, con pulsos chicos de presión" },

    /* --- Intermedios: la "regresión" de la base era más difícil o no era una regresión --- */
    "pilates-016": { inicial: "rodillas apoyadas en el carro (plancha de rodillas), recorrido corto", avanzado: "recorrido completo con una pausa de 2 tiempos atrás, el cuerpo en una sola línea" },
    "pilates-184": { inicial: "extensión baja apoyada en los antebrazos con la banda floja, sin abrirla" },
    "pilates-188": { inicial: "de pie con base amplia, banda larga y recorrido corto de la diagonal" },
    "pilates-189": { inicial: "solo los brazos con la banda, con las piernas en mesa quietas (o los pies apoyados)" },
    "pilates-190": { inicial: "roll down parcial desde sentada con las rodillas flexionadas y el aro en las manos" },
    "pilates-204": { inicial: "rodar la pelota solo un poco hacia adelante, con rodillas y manos apoyadas" },
    "pilates-209": { inicial: "puente con los pies sobre la pelota, sostenido, sin el curl" },
    "pilates-235": { inicial: "piernas en mesa con el aro entre los tobillos (o pies en la barra), solo el trabajo de brazos" },
  };

  /* ============================================================
     2) REPERTORIO CLÁSICO
     aparato: true → solo reformer; si no, solo colchoneta sin accesorios.
     ============================================================ */
  const CLASICOS = [
    { re: /\bcien\b|hundred/,
      inicial: "cabeza apoyada y piernas en mesa (o pies en el piso), bombeo de brazos corto, 5 tiempos de inhalación y 5 de exhalación",
      intermedio: "cabeza y hombros despegados, piernas en mesa, 10 ciclos de respiración sin perder la conexión del abdomen",
      avanzado: "piernas extendidas a la altura que permita sostener la pelvis estable (nunca por debajo del punto en que se arquea la zona lumbar), 10 ciclos completos" },
    { re: /roll ?up/,
      inicial: "roll down parcial desde sentada, rodillas flexionadas y manos detrás de los muslos, bajando solo hasta donde se pueda volver sin impulso",
      intermedio: "rodillas semiflexionadas o pies anclados con una banda, articulando la columna vértebra por vértebra",
      avanzado: "piernas extendidas y brazos por arriba de la cabeza, 3 tiempos para subir y 3 para bajar, sin impulso ni despegar los talones" },
    { re: /circulos? (de|con) (una )?pierna|leg circle/,
      inicial: "pierna de apoyo flexionada con el pie en el piso y la que trabaja levemente flexionada, círculos chicos",
      intermedio: "pierna de apoyo extendida, círculos del tamaño que la pelvis pueda sostener quieta",
      avanzado: "círculos más amplios con cambio de dirección sin pausa, pelvis inmóvil y menos presión de los brazos sobre la colchoneta" },
    { re: /rodar como (una )?pelota|rolling like a ball/,
      inicial: "solo el equilibrio: sentada en forma de pelota, despegar los pies y sostener 3 respiraciones, sin rodar",
      intermedio: "rodar hacia atrás hasta las escápulas y volver al equilibrio, sin apoyar cabeza ni cuello",
      avanzado: "forma más compacta (talones cerca de la cola) y pausa de 2 tiempos en el equilibrio al volver, sin que los pies toquen la colchoneta" },
    { re: /estiramiento de (una|1) pierna|single leg stretch/,
      inicial: "cabeza apoyada, alternar rodilla al pecho con la otra pierna en mesa, cambios lentos",
      intermedio: "cabeza y hombros despegados, la pierna que se aleja extendida a unos 45°",
      avanzado: "la pierna que se aleja más baja (sin arquear la lumbar), exhalación doble en cada cambio y tronco sin balanceo" },
    { re: /estiramiento de (dos|ambas|2) piernas|double leg stretch/,
      inicial: "cabeza apoyada, extender solo brazos o solo piernas hacia el techo, de a uno por vez",
      intermedio: "cabeza y hombros despegados, extender brazos y piernas a la vez con las piernas altas",
      avanzado: "piernas más bajas y brazos junto a las orejas, pausa de 2 tiempos en la extensión antes de recoger" },
    { re: /criss ?cross|oblicuos cruzados/,
      inicial: "pies apoyados en el piso, rotar el tronco hacia cada lado sin mover la pelvis",
      intermedio: "piernas en mesa, rotación lenta llevando el hombro hacia la rodilla contraria",
      avanzado: "pierna extendida más baja y pausa de 2 tiempos en cada rotación, codos abiertos" },
    { re: /estiramiento de (la )?columna|spine stretch/,
      inicial: "sentada sobre un almohadón o bloque con rodillas flexionadas, recorrido corto de flexión",
      intermedio: "piernas extendidas al ancho de la colchoneta, articulando vértebra por vértebra",
      avanzado: "pausa al final de la flexión con los brazos sostenidos al frente, y vuelta articulando hasta crecer por encima de la pelvis" },
    { re: /\bsierra\b|\bsaw\b/,
      inicial: "sentada sobre un almohadón con rodillas flexionadas, solo la rotación con brazos en cruz",
      intermedio: "piernas extendidas, rotación más flexión hacia el pie contrario",
      avanzado: "más rotación con 3 pulsos de exhalación y los dos isquiones bien anclados" },
    { re: /\bcisne\b|\bswan\b/,
      inicial: "extensión baja apoyada en los antebrazos (esfinge), pubis apoyado y cuello largo",
      intermedio: "manos debajo de los hombros, extensión solo hasta donde la zona lumbar no se comprima",
      avanzado: "despegar las manos y sostener la extensión 3 tiempos con los brazos al frente, repartiendo la extensión en toda la columna" },
    { re: /natacion|swimming/,
      inicial: "en cuadrupedia: brazo y pierna contrarios de a uno por vez, con pausa",
      intermedio: "boca abajo, alternar brazo y pierna contrarios en forma lenta",
      avanzado: "ritmo continuo con tronco y piernas despegados, 5 tiempos de inhalación y 5 de exhalación, sin balanceo de la pelvis" },
    { re: /patada lateral|side kick/,
      inicial: "de lado con la cabeza sobre el brazo y la rodilla de abajo flexionada, recorrido corto",
      intermedio: "ambas piernas extendidas, patada adelante y atrás con la pelvis quieta",
      avanzado: "de rodillas con una mano apoyada (kneeling side kick), tronco largo y la pierna a la altura de la cadera" },
    { re: /teaser/,
      inicial: "pies apoyados, roll back parcial con brazos al frente y vuelta a sentada",
      intermedio: "una pierna extendida y la otra con el pie apoyado (single leg teaser)",
      avanzado: "piernas y tronco suben juntos, sostener la V 3 tiempos y bajar articulando" },
    { re: /puente|bridge|pelvic curl/,
      inicial: "pelvic curl: articular la columna con ambos pies apoyados, subiendo solo hasta las escápulas",
      intermedio: "sostener el puente y marchar alternando los pies, sin que la pelvis caiga ni rote",
      avanzado: "puente sobre una pierna con la otra extendida, subir y bajar la pierna sin perder la altura de la cadera" },
    { re: /plancha|plank|leg pull front/,
      inicial: "apoyo con rodillas en la colchoneta, cuerpo en una línea de rodillas a cabeza, sostener 3 respiraciones",
      intermedio: "apoyo completo, cuerpo en una línea sin hundir la zona lumbar",
      avanzado: "en el apoyo completo, despegar una pierna por vez y sostener 2 tiempos sin rotar la pelvis" },
    { re: /footwork|trabajo de pies/, aparato: true,
      inicial: "ambos pies en paralelo (talones o arcos), recorrido completo y lento, sin trabar las rodillas",
      intermedio: "recorrer las posiciones (talones, metatarsos, V de Pilates) y sumar elevaciones de talón",
      avanzado: "una pierna por vez con la otra en mesa, pelvis estable y rodilla alineada con el segundo dedo" },
  ];

  /* ============================================================
     3) PROGRESIÓN POR PATRÓN (reemplaza los genéricos de data-meta.js en colchoneta)
     data-meta.js pone el mismo texto a todo lo que está en supino
     ("cabeza y hombros elevados"), que no sirve para un puente o un
     estiramiento. Acá se elige según lo que el ejercicio trabaja.
     ============================================================ */
  const PATRONES = {
    flexion_columna:   { up: "palancas largas (piernas en diagonal o brazos por encima de la cabeza) con cabeza y hombros despegados", down: "cabeza apoyada y rodillas flexionadas con los pies en el piso" },
    extension_columna: { up: "brazos más lejos del cuerpo (en W o al frente) sosteniendo la extensión 2 tiempos", down: "extensión baja apoyada en los antebrazos, con el pubis apoyado y la mirada al piso" },
    rotacion:          { up: "más rango de rotación con la pelvis anclada y una pausa de 2 tiempos en el giro", down: "giro corto con las manos en el pecho y la pelvis quieta" },
    flexion_lateral:   { up: "brazo por encima de la cabeza alargando el costado, con una pausa en la inclinación", down: "inclinación corta con la mano de abajo apoyada en el piso" },
    bisagra_cadera:    { up: "despegar un apoyo (un pie o un talón por vez) sin que la pelvis caiga ni rote", down: "recorrido corto de cadera con ambos apoyos firmes, sin que la pelvis se incline" },
    sentadilla:        { up: "más profundidad o una pierna por vez, con la rodilla alineada al segundo dedo", down: "recorrido corto y apoyo en una pared o silla" },
    abduccion:         { up: "pierna extendida (palanca larga) y una pausa de 2 tiempos arriba", down: "rodilla flexionada (palanca corta) y recorrido chico" },
    aduccion:          { up: "presión sostenida con pulsos chicos al final del recorrido", down: "presión suave, sin sostener" },
    empuje:            { up: "una pausa de 2 tiempos al final del recorrido, sin que los hombros suban", upBanda: "la banda más corta (más resistencia) y una pausa de 2 tiempos al final", down: "recorrido corto y ritmo lento, sin que los hombros suban", downBanda: "la banda más larga (menos resistencia) y recorrido corto, sin que los hombros suban" },
    traccion:          { up: "una pausa de 2 tiempos con los codos atrás, sin que los hombros suban", upBanda: "la banda más corta (más resistencia) y una pausa de 2 tiempos con los codos atrás", down: "recorrido corto y ritmo lento, sin que los hombros suban", downBanda: "la banda más larga (menos resistencia) y recorrido corto, sin que los hombros suban" },
    escapular:         { up: "brazos más lejos del cuerpo, sosteniendo los omóplatos abajo con una pausa de 2 tiempos", upBanda: "la banda más corta, sosteniendo los omóplatos abajo", down: "recorrido corto con los brazos cerca del cuerpo", downBanda: "la banda más larga y recorrido corto con los brazos cerca del cuerpo" },
    estabilidad_core:  { up: "reducir la base de apoyo (despegar un brazo o una pierna) sin que la pelvis rote", down: "más puntos de apoyo y sostenes cortos" },
    movilidad:         { up: "más permanencia en la posición, soltando un poco más en cada exhalación", down: "rango corto y cómodo, con apoyos donde haga falta" },
  };
  const PATRON_ORDEN = ["flexion_columna", "extension_columna", "rotacion", "flexion_lateral", "bisagra_cadera", "sentadilla", "abduccion", "aduccion", "empuje", "traccion", "escapular", "estabilidad_core", "movilidad"];
  // Textos genéricos que pone data-meta.js en colchoneta: se reemplazan por el patrón.
  const GENERICOS_MAT = [
    "Palancas largas (piernas o brazos extendidos) y cabeza y hombros elevados",
    "Palancas más largas y una pausa de 2 tiempos al final del recorrido",
    "Cabeza apoyada y rodillas flexionadas para acortar la palanca",
    "Rango reducido y más base de apoyo, priorizando la alineación",
  ];

  /* ---------- Seguridad ---------- */
  const SIN_INICIAL = /roll ?over|jack ?knife|navaja|control balance|balance control|boomerang|corkscrew|sacacorchos|long spine|short spine|overhead|neck pull|snake|serpiente|\bstar\b|tendon stretch/;
  const POB_KEY = "population";

  /* ---------- Helpers ---------- */
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const clean = (s) => String(s || "").trim().replace(/[.\s]+$/, "");
  const lowerFirst = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
  const upperFirst = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const isReformer = (ex) => (ex.modality || []).includes("reformer");
  const isFrame = (ex) => ex.moment === 1 || ex.moment === 6 ||
    (Array.isArray(ex.patron) && ex.patron.length > 0 && ex.patron.every((p) => p === "movilidad"));
  const isFirm = (ex) => /trabado|firme|no se tiene que mover/i.test(ex.resortes || "");
  const springsMove = (ex) => ex.resortes && !isFirm(ex);
  const onlyMat = (ex) => !isReformer(ex) &&
    (!Array.isArray(ex.accesorio) || !ex.accesorio.length || ex.accesorio.every((a) => a === "ninguno"));

  // "Es un ejercicio de nivel avanzado", "apto para todos los niveles"… no son regresiones ni progresiones.
  const isMeta = (s) => /^es (un|una) |nivel (inicial|intermedio|avanzado)|niveles|apto (para|desde)|sin necesidad|no requiere|para acercarse/i.test(s || "");
  // Saca las muletillas de la base para que el texto se lea como un cambio concreto.
  function tidy(s) {
    let t = clean(s)
      .replace(/^progres[aá]\s+/i, "")
      .replace(/\s+(es la entrada|es más accesible|alcanza para organizar el patrón).*$/i, "")
      .replace(/^variante más fácil:\s*/i, "");
    return upperFirst(t.trim());
  }

  function patronText(ex, dir) {
    const p = PATRON_ORDEN.find((k) => (ex.patron || []).includes(k)) || "estabilidad_core";
    const banda = (ex.accesorio || []).includes("banda");
    return (banda && PATRONES[p][dir + "Banda"]) || PATRONES[p][dir];
  }

  // Escala del estudio: amarillo < azul < rojo < verde.
  const COLORES = ["amarillo", "azul", "rojo", "verde"];
  const COLOR_LABEL = { amarillo: "Amarillo (muy liviano)", azul: "Azul (liviano a medio)", rojo: "Rojo (alto)", verde: "Verde (máximo)" };
  function shiftSprings(ex, change) {
    if (!springsMove(ex)) return ex.resortes;
    const t = norm(change);
    const dir = /mas liviano|resorte liviano/.test(t) ? -1 : /mas pesado|resorte pesado/.test(t) ? 1 : 0;
    if (!dir) return ex.resortes;
    const r = norm(ex.resortes);
    const idx = COLORES.findIndex((c) => r.includes(c));
    const next = COLORES[idx + dir];
    return idx >= 0 && next ? COLOR_LABEL[next] : ex.resortes;
  }

  function classicFor(ex) {
    const n = norm(ex.name);
    return CLASICOS.find((c) => c.re.test(n) && (c.aparato ? isReformer(ex) : onlyMat(ex))) || null;
  }

  // Ajusta la población de una versión más difícil. Devuelve false si no queda ninguna.
  function populationFor(v, ex, from, to) {
    if (!Array.isArray(v[POB_KEY])) { v[POB_KEY] = ["general"]; return true; }
    let pop = v[POB_KEY].slice();
    const patron = ex.patron || [];
    const flexOrRot = patron.some((p) => p === "flexion_columna" || p === "rotacion");
    const avoidsPregnancy = (ex.avoid || []).includes("Embarazo / posparto");
    // embarazo: nada boca arriba ni boca abajo, sin flexión ni torsión de columna, sin planchas
    const pregnancySafe = !avoidsPregnancy && !["supino", "prono", "plancha"].includes(ex.posicion) && !flexOrRot;
    if (to === 2) {
      // mayores sí puede tener versión avanzada, salvo flexión o rotación de columna con carga
      // (osteoporosis) y planchas (carga de muñecas y hombros)
      const mayoresOk = !flexOrRot && ex.posicion !== "plancha";
      pop = pop.filter((p) => p === "general" || (p === "mayores" && mayoresOk) || (p === "embarazo" && pregnancySafe));
    } else {
      pop = pop.filter((p) => p !== "principiantes");
      if (!pregnancySafe) pop = pop.filter((p) => p !== "embarazo");
    }
    v[POB_KEY] = pop;
    return pop.length > 0;
  }

  function extraStep(ex, prog) {
    if (isFrame(ex)) return /permanencia/i.test(prog) ? "con exhalaciones de 6 tiempos" : "con exhalaciones más largas (6 tiempos) y más tiempo de permanencia";
    const tail = springsMove(ex) ? ", sin que el carro golpee al volver" : "";
    if (/pausa|sosten/i.test(norm(prog))) return "con 3 tiempos de ida y 3 de vuelta" + tail;
    return "con 3 tiempos de ida, una pausa de 2 tiempos en el punto de mayor esfuerzo y 3 de vuelta" + tail;
  }

  function baseProgresion(ex) {
    let t = ex.progresion;
    if (!t || isMeta(t) || (!isReformer(ex) && GENERICOS_MAT.includes(t))) t = patronText(ex, "up");
    t = tidy(t);
    if (isFirm(ex) && /resorte/i.test(t)) t = "Recorrido completo y una pausa de 2 tiempos al final, sin cambiar el resorte (el carro sigue firme)";
    if (isFrame(ex) && /resorte|carga|palanca|resistencia/i.test(t)) t = upperFirst(PATRONES.movilidad.up);
    return t;
  }

  function baseRegresion(ex) {
    let t = ex.regresion;
    if (!t || isMeta(t) || (!isReformer(ex) && GENERICOS_MAT.includes(t))) t = patronText(ex, "down");
    t = tidy(t);
    if (isFirm(ex) && /resorte/i.test(t)) t = "Recorrido más corto y más base de apoyo, con el carro firme";
    return t;
  }

  function changeText(ex, from, to, classic) {
    if (classic && classic[LV[to]]) return classic[LV[to]];
    if (to > from) {
      const prog = baseProgresion(ex);
      return to - from === 1 ? prog : `${prog}, ${extraStep(ex, prog)}`;
    }
    const reg = baseRegresion(ex);
    if (from - to === 1) return reg;
    return /recorrido|rango|corto/i.test(reg)
      ? `${reg}, con una pausa para recuperar entre repeticiones`
      : `${reg}, con recorrido corto y una pausa para recuperar entre repeticiones`;
  }

  function makeVariant(ex, from, to, classic) {
    const level = LV[to];
    const manual = (MANUALES[ex.id] || {})[level];
    if (manual === false) return null;
    if (to === 0 && SIN_INICIAL.test(norm(ex.name)) && typeof manual !== "string") return null;

    const v = JSON.parse(JSON.stringify(ex));
    const harder = to > from;
    if (harder && !populationFor(v, ex, from, to)) return null;

    const change = typeof manual === "string" ? manual : changeText(ex, from, to, classic);
    v.id = `${ex.id}-${SUF[level]}`;
    v.name = `${ex.name} · ${level}`;
    v.familia = ex.id;
    v.variante = true;
    v.nivelMin = level;
    v.level = [level];
    v.description = `${clean(ex.description)}. Variante ${ADJ[level]}: ${lowerFirst(clean(change))}.`;
    if (ex.resortes) {
      v.resortes = shiftSprings(ex, change);
      // app.js no suma "subí/bajá un color" cuando la versión ya trae su propio resorte
      if (v.resortes !== ex.resortes) v.resortesAjustado = true;
    }
    v.regresion = to === 0 ? "Recorrido todavía más corto, priorizando la alineación" : `Volvé a la versión ${ADJ[LV[to - 1]]}`;
    v.progresion = to === 2 ? "Más repeticiones con la misma calidad, o un tempo todavía más lento" : `Pasá a la versión ${ADJ[LV[to + 1]]}`;
    if (harder) {
      v.cue = `Pasá a esta versión solo si la ${ADJ[LV[to - 1]]} sale limpia: respiración fluida, pelvis y escápulas estables y sin dolor.`;
    }
    if (manual && typeof manual === "object") Object.assign(v, manual);
    return v;
  }

  /* ---------- Generación ---------- */
  const ids = new Set(EXERCISES.map((e) => e.id));
  const bases = EXERCISES.filter((ex) => ex.discipline === "pilates" && !ex.variante);
  let creadas = 0;

  bases.forEach((ex) => {
    let from = LV.indexOf(ex.nivelMin);
    if (from < 0) {
      console.warn(`[variantes] ${ex.id} sin nivelMin válido ("${ex.nivelMin}"): se toma como inicial.`);
      from = 0;
    }
    ex.nivelMin = LV[from];
    ex.level = [LV[from]];
    ex.familia = ex.id;
    // la regresión / progresión del original también se limpia de textos que no aplican
    ex.regresion = baseRegresion(ex);
    ex.progresion = baseProgresion(ex);

    const classic = classicFor(ex);
    LV.forEach((_, to) => {
      if (to === from) return;
      const v = makeVariant(ex, from, to, classic);
      if (!v || ids.has(v.id)) return;
      ids.add(v.id);
      EXERCISES.push(v);
      creadas++;
    });
  });

  console.info(`[variantes] ${bases.length} ejercicios de Pilates → ${creadas} variantes nuevas.`);
})();