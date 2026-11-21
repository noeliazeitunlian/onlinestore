/* ============================================================
   ADAPTACIONES POR LESIÓN / PATOLOGÍA
   ------------------------------------------------------------
   Se carga DESPUÉS de data-meta.js y data-variantes.js (usa los
   campos "patron" y "posicion" que calculan esos archivos).

   Para cada condición define:
     principle  qué hay que cuidar en general
     tip        consejo general cuando el ejercicio no la compromete
     dataKeys   etiquetas de data.js que cuentan como esta condición
                (en "avoid" y en "adaptations" de cada ejercicio)
     rules      reglas por tipo de movimiento / posición:
                  nivel "evitar"     → contraindicado, conviene reemplazarlo
                  nivel "precaucion" → se puede hacer con la adaptación indicada

   Prioridad al mostrar una adaptación:
     1) la adaptación escrita a mano en el ejercicio (data.js)
     2) la de las reglas de abajo, según lo que el ejercicio exige
     3) si el ejercicio no compromete la condición, se dice eso

   Las adaptaciones son orientativas: siempre individualizar y trabajar
   junto al profesional tratante de cada alumna.
   ============================================================ */

(function () {
  const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const txt = (ex) => norm(`${ex.name} ${ex.position || ""}`);
  const desc = (ex) => norm(ex.description || "");
  const pat = (ex, p) => (ex.patron || []).includes(p);
  const isAdvancedOnly = (ex) => ex.nivelMin === "avanzado" || ((ex.level || []).length === 1 && ex.level[0] === "avanzado");

  // ---------- detectores de exigencia ----------
  const RE = {
    // flexión de tronco con la cabeza despegada o con carga sobre la columna flexionada
    flexCarga: /roll up|roll over|teaser|jackknife|short spine|long spine|hundred|criss|abdominal|crunch|\bcurl\b(?! de isquio)|rolling|rocker|double leg stretch|single leg stretch|boomerang|elev\w* (la )?cabeza y (los )?hombros|barco|navasana/,
    // rodar o flexionar toda la columna (sin cabeza despegada)
    flexColumna: /roll down|roll back|rodar hacia abajo|spine stretch|curva en c|redonde\w* (de |la )?(columna|espalda)|desenroll|enroll|pinza|paschimottanasana|flexion hacia adelante|\bsaw\b|sierra|serrucho/,
    flexSuave: /\bgato\b|\bvaca\b|\bnino\b|balasana|rest position|postura de descanso|rodillas al pecho|respiraci/,
    invertida: /roll over|jackknife|short spine|long spine|\bvela\b|salamba sarvangasana|\barado\b|halasana|\brueda\b|urdhva dhanurasana|sirsasana|\bpike\b/,
    extProfunda: /\brueda\b|urdhva dhanurasana|dhanurasana|camello|ustrasana|swan dive|\bpez\b|matsyasana|snake|serpiente/,
    extCabezaAtras: /\bcobra\b|bhujangasana|camello|ustrasana|\bswan\b|cisne|\bpez\b|matsyasana|perro boca arriba/,
    saltos: /\bsalto|\bjump|rebote/,
    plancha: /plancha|plank|long stretch|up stretch|push.?up|flexion(es)? de brazos|chaturanga|snake|serpiente|\bstar\b|balance control|leg pull/,
    planchaLateral: /plancha lateral|side bend|\bstar\b|vasisthasana/,
    manosEnPiso: /perro boca abajo|adho mukha|cuervo|bakasana|mesa invertida|reverse plank|purvottanasana|tendon stretch|elephant|elefante|knee stretch|caminata de manos|cuadrupedia/,
    hombroEvitar: /mesa invertida|reverse plank|purvottanasana|tendon stretch|side bend|\bstar\b|snake|serpiente|\brueda\b|urdhva|cuervo|bakasana|chaturanga|dhanurasana|camello|ustrasana|leg pull/,
    sobreCabeza: /sobre la cabeza|por encima de la cabeza|overhead|press sobre la cabeza|brazos arriba|brazos en y|y-t-w|saludo al sol|perro boca abajo|guerrero (i|iii)\b/,
    rodillaProfunda: /guirnalda|malasana|heroe|virasana|postura del nino|balasana|rest position|postura de descanso|sentadilla profunda|cuclillas|\brana\b/,
    arrodillada: /de rodillas|arrodillad|knee stretch|cuadrupedia|zancada baja|anjaneyasana|camello|ustrasana|lagartija/,
    sentadilla: /sentadilla|squat|estocada|zancada|lunge|silla|utkatasana|guerrero|footwork|scooter/,
    caderaEvitar: /aguila|garudasana|paloma completa|lagartija|\brana\b|guirnalda|malasana|\bleno\b|agnistambhasana|sacacorchos|corkscrew|cruz\w* (la |una )?pierna/,
    caderaPrecaucion: /paloma|figura cuatro|zapatero|mariposa|baddha konasana|rodillas al pecho|circulos de piern|leg circles|side kick|patada lateral|clam|almeja|estocada|zancada|split/,
    estiramiento: /estiramiento|elong|apertura de cadera|split|paloma|lagartija|mariposa|zapatero|pinza|triangulo|trikonasana|media luna/,
    liberacion: /liberacion|descarga|amasa|balanceo de pantorrillas|oscilaciones|masaje/,
    torsionCerrada: /torsion|twist|matsyendrasana|\bgiro|rotacion|\bsaw\b|sierra|serrucho|criss/,
    cuervo: /cuervo|bakasana/,
  };
  const has = (ex, key) => RE[key].test(txt(ex));
  const prono = (ex) => ex.posicion === "prono" || /prono|boca abajo/.test(norm(ex.position));
  const supino = (ex) => ex.posicion === "supino" || /supino|boca arriba/.test(norm(ex.position));
  const enPlancha = (ex) => ex.posicion === "plancha" || has(ex, "plancha");
  const cuadrupedia = (ex) => ex.posicion === "cuadrupedia" || /cuadrupedia/.test(txt(ex));
  const arrodillada = (ex) => ex.posicion === "arrodillado" || cuadrupedia(ex) || has(ex, "arrodillada");
  const manosApoyadas = (ex) => enPlancha(ex) || cuadrupedia(ex) || has(ex, "manosEnPiso") ||
    /manos (apoyadas )?(en|sobre) (el piso|la plataforma|bloques|los bloques|el roller)/.test(desc(ex));
  const flexCualquiera = (ex) => has(ex, "flexCarga") || has(ex, "flexColumna") || pat(ex, "flexion_columna");

  // ---------- condiciones ----------
  const CONDITIONS = [
    {
      id: "Osteoporosis / osteopenia",
      dataKeys: ["Osteoporosis / osteopenia"],
      principle: "evitar la flexión de columna (sobre todo combinada con rotación) y el impacto",
      tip: "Mantené la columna larga y neutra, y sumá trabajo de extensión suave y de fuerza de piernas, que favorecen la densidad ósea.",
      rules: [
        { nivel: "evitar", when: (ex) => has(ex, "flexCarga") || has(ex, "invertida"),
          texto: "Este ejercicio flexiona la columna con carga, el movimiento que más riesgo de fractura vertebral tiene. Reemplazalo por una versión con la cabeza apoyada y la columna neutra (por ejemplo, el mismo trabajo de piernas o brazos sin enrollar el torso)." },
        { nivel: "evitar", when: (ex) => has(ex, "flexColumna") && !has(ex, "flexSuave"),
          texto: "Este ejercicio redondea toda la columna. Cambiá el enrollado por una bisagra de cadera con la espalda larga, o quedate creciendo desde la coronilla sin redondear." },
        { nivel: "evitar", when: (ex) => has(ex, "saltos"),
          texto: "Este ejercicio tiene impacto o rebote. Reemplazá el rebote por el mismo movimiento con los pies apoyados y un ritmo controlado." },
        { nivel: "precaucion", when: (ex) => has(ex, "flexSuave") && flexCualquiera(ex),
          texto: "La flexión es suave, pero igual conviene limitarla: pedí poco recorrido de redondeo y priorizá el alargamiento de la espalda." },
        { nivel: "precaucion", when: (ex) => pat(ex, "rotacion") || has(ex, "torsionCerrada"),
          texto: "Tiene rotación de columna. Hacela con la espalda erguida, en un rango chico y sin sumar flexión hacia adelante." },
        { nivel: "precaucion", when: (ex) => pat(ex, "flexion_columna"),
          texto: "Tiene algo de flexión de columna. Achicá el recorrido y mantené la espalda lo más larga posible." },
      ],
    },
    {
      id: "Hernia de disco lumbar",
      dataKeys: ["Hernia de disco lumbar"],
      principle: "evitar la flexión lumbar profunda y la rotación forzada bajo carga",
      tip: "Priorizá el control abdominal con la columna neutra y cortá el ejercicio si aparece dolor que baja a la pierna.",
      rules: [
        { nivel: "evitar", when: (ex) => /roll up|roll over|teaser|jackknife|short spine|long spine|rocker|criss|double leg stretch|crunch|boomerang|rolling/.test(txt(ex)),
          texto: "Flexiona la zona lumbar con carga. Reemplazalo por el mismo trabajo con la cabeza apoyada y la pelvis neutra (por ejemplo, piernas en mesa con deslizamientos de talón)." },
        { nivel: "precaucion", when: (ex) => flexCualquiera(ex),
          texto: "Tiene flexión de columna. Achicá el rango, flexioná las rodillas si las piernas están estiradas y priorizá el control antes que la amplitud." },
        { nivel: "precaucion", when: (ex) => pat(ex, "rotacion") || has(ex, "torsionCerrada"),
          texto: "Tiene rotación. Rotá en un rango mínimo, creciendo antes de girar y sin sumar flexión." },
        { nivel: "precaucion", when: (ex) => has(ex, "extProfunda"),
          texto: "Tiene una extensión profunda de espalda. Quedate en una extensión corta, con el abdomen activo y sin comprimir la zona lumbar." },
      ],
    },
    {
      id: "Embarazo (2.º y 3.er trimestre)",
      dataKeys: ["Embarazo / posparto"],
      principle: "evitar boca abajo, la presión abdominal, las torsiones cerradas y estar mucho tiempo boca arriba",
      tip: "Mantené una respiración fluida, una intensidad moderada y cortá ante mareo, falta de aire, dolor o pérdidas. Siempre con el alta de su médico/a.",
      rules: [
        { nivel: "evitar", when: (ex) => prono(ex),
          texto: "Es boca abajo. Reemplazalo por el mismo patrón en cuadrupedia, de costado o sentada." },
        { nivel: "evitar", when: (ex) => has(ex, "flexCarga") || has(ex, "invertida"),
          texto: "Genera presión abdominal (flexión de tronco o inversión). Reemplazalo por respiración con activación suave del transverso, sentada o de costado." },
        { nivel: "evitar", when: (ex) => has(ex, "saltos"),
          texto: "Tiene impacto. Hacelo sin rebote, con los pies apoyados." },
        { nivel: "precaucion", when: (ex) => enPlancha(ex),
          texto: "Es una plancha. Pasala a la pared (de pie, manos en la pared) o a cuadrupedia, y cortá si el abdomen se abulta en el centro." },
        { nivel: "precaucion", when: (ex) => has(ex, "torsionCerrada") || pat(ex, "rotacion"),
          texto: "Tiene rotación. Hacé una torsión abierta (girando hacia el lado contrario a la pierna que cruza) y sin comprimir el abdomen." },
        { nivel: "precaucion", when: (ex) => supino(ex),
          texto: "Es boca arriba. Desde el segundo trimestre evitá sostener mucho tiempo esta posición: elevá el torso con una cuña o almohadones, o hacelo de costado. Si aparece mareo, girala de costado izquierdo." },
      ],
    },
    {
      id: "Posparto",
      dataKeys: ["Embarazo / posparto"],
      manualAvoidLevel: "precaucion", // lo marcado para embarazo/posparto en data.js se toma como precaución
      principle: "reconstruir de a poco la conexión de suelo pélvico y abdomen profundo, sin presión hacia abajo",
      tip: "Empezá por la respiración y la activación de suelo pélvico, chequeá si hay diástasis y respetá los tiempos de alta (en cesárea, cuidá la cicatriz).",
      rules: [
        { nivel: "evitar", when: (ex) => has(ex, "saltos"),
          texto: "Tiene impacto: no conviene en los primeros meses. Hacelo sin rebote, con los pies apoyados." },
        { nivel: "precaucion", when: (ex) => has(ex, "flexCarga"),
          texto: "Es una flexión de tronco. Si hay diástasis o el abdomen se abulta en el centro, quedate con la cabeza apoyada y trabajá solo la exhalación con activación profunda." },
        { nivel: "precaucion", when: (ex) => enPlancha(ex),
          texto: "Es una plancha. Empezá con rodillas apoyadas o en la pared, exhalando en el esfuerzo, y sumá la plancha completa solo si no hay abultamiento ni presión hacia abajo." },
        { nivel: "precaucion", when: (ex) => has(ex, "invertida"),
          texto: "Es una inversión con carga abdominal. Esperá a tener buena conexión de centro y suelo pélvico; mientras tanto, usá un puente bajo." },
      ],
    },
    {
      id: "Diástasis abdominal",
      dataKeys: ["Diástasis abdominal"],
      principle: "evitar lo que haga abultar la línea media del abdomen (flexión con cabeza despegada, cargas altas)",
      tip: "Exhalá antes de cada esfuerzo activando el abdomen profundo y mirá la línea media: si se abulta o se hunde, bajá la exigencia.",
      rules: [
        { nivel: "evitar", when: (ex) => has(ex, "flexCarga") || has(ex, "invertida"),
          texto: "La flexión de tronco con la cabeza despegada aumenta la presión sobre la línea media. Reemplazalo por la versión con cabeza apoyada y exhalación con activación profunda." },
        { nivel: "precaucion", when: (ex) => enPlancha(ex),
          texto: "Es una plancha. Hacela con rodillas apoyadas o en la pared y chequeá que la línea media no se abulte." },
        { nivel: "precaucion", when: (ex) => (pat(ex, "rotacion") || has(ex, "torsionCerrada")) && flexCualquiera(ex),
          texto: "Combina rotación y flexión, lo que tensiona los oblicuos sobre la línea media. Hacé solo la rotación con la espalda apoyada o erguida." },
        { nivel: "precaucion", when: (ex) => has(ex, "extProfunda"),
          texto: "La extensión profunda estira la pared abdominal. Quedate en un rango corto." },
      ],
    },
    {
      id: "Disfunción de suelo pélvico",
      dataKeys: ["Disfunción de suelo pélvico"],
      principle: "evitar retener el aire y la presión intraabdominal alta",
      tip: "Coordiná cada esfuerzo con una exhalación activa y bajá la intensidad si aparece sensación de peso o presión hacia abajo.",
      rules: [
        { nivel: "evitar", when: (ex) => has(ex, "saltos"),
          texto: "El impacto aumenta la presión sobre el suelo pélvico. Hacelo sin rebote, con los pies apoyados." },
        { nivel: "precaucion", when: (ex) => enPlancha(ex),
          texto: "Es una plancha. Apoyá las rodillas, acortá el tiempo de sostén y exhalá durante el esfuerzo, sin retener el aire." },
        { nivel: "precaucion", when: (ex) => has(ex, "flexCarga"),
          texto: "Es una flexión de tronco. Exhalá al subir sin empujar hacia abajo; si aparece presión, quedate con la cabeza apoyada." },
      ],
    },
    {
      id: "Problemas de cadera / prótesis",
      dataKeys: ["Problemas de cadera / prótesis"],
      principle: "evitar el rango extremo de flexión, la rotación interna y cruzar la línea media",
      tip: "Trabajá en un rango cómodo y sumá apoyos (bloques, silla, pared). En prótesis, seguí las indicaciones de su traumatólogo/a.",
      rules: [
        { nivel: "evitar", when: (ex) => has(ex, "caderaEvitar"),
          texto: "Lleva la cadera a un rango extremo o cruza la línea media. Reemplazalo por una versión con menos flexión y sin cruzar las piernas (por ejemplo, figura cuatro reclinada con el pie apoyado)." },
        { nivel: "precaucion", when: (ex) => has(ex, "caderaPrecaucion") || pat(ex, "abduccion"),
          texto: "Trabaja la cadera en apertura o en rango amplio. Achicá el recorrido, evitá cruzar la línea media y sumá apoyos bajo las rodillas si hace falta." },
        { nivel: "precaucion", when: (ex) => has(ex, "rodillaProfunda"),
          texto: "Tiene flexión profunda de cadera. Elevá la pelvis con un bloque o almohadón para reducir el ángulo." },
      ],
    },
    {
      id: "Post-cirugía de rodilla",
      dataKeys: ["Post-cirugía de rodilla"],
      principle: "evitar la flexión profunda de rodilla, el apoyo directo sobre ella y los giros con el pie fijo",
      tip: "Respetá el rango que le dio su kinesiólogo/a y que no aparezca dolor ni inflamación después de la clase.",
      rules: [
        { nivel: "evitar", when: (ex) => has(ex, "rodillaProfunda"),
          texto: "Tiene flexión profunda de rodilla. Reemplazalo por la versión sentada en una silla o con un bloque alto entre los talones y la pelvis." },
        { nivel: "evitar", when: (ex) => /knee stretch/.test(txt(ex)),
          texto: "Carga peso sobre las rodillas flexionadas mientras se mueven. Reemplazalo por la versión de pie con las manos en la barra." },
        { nivel: "precaucion", when: (ex) => arrodillada(ex),
          texto: "Apoya peso sobre las rodillas. Poné una almohadilla o manta doblada debajo, o pasalo a una versión sentada o de pie si molesta." },
        { nivel: "precaucion", when: (ex) => has(ex, "sentadilla") || pat(ex, "sentadilla"),
          texto: "Flexiona la rodilla con carga. Reducí el rango, bajá la carga y cuidá que la rodilla siga la línea del segundo dedo del pie, sin girar con el pie fijo." },
      ],
    },
    {
      id: "Lesión de hombro / manguito rotador",
      dataKeys: ["Lesión de hombro / manguito rotador"],
      principle: "evitar cargar peso sobre los brazos, llevarlos por encima de la cabeza con carga y la extensión forzada del hombro",
      tip: "Trabajá debajo de la altura del hombro, sin dolor, y priorizá la estabilidad escapular antes que la fuerza.",
      rules: [
        { nivel: "evitar", when: (ex) => has(ex, "hombroEvitar") && !/omoplatos sobre/.test(txt(ex)),
          texto: "Carga mucho peso sobre el hombro o lo lleva a extensión forzada. Reemplazalo por un trabajo sin apoyo de manos (de costado, supino o sentada)." },
        { nivel: "precaucion", when: (ex) => enPlancha(ex) || manosApoyadas(ex),
          texto: "Apoya peso en los brazos. Pasalo a la pared o a los antebrazos, con menos tiempo de sostén, y cortá si aparece dolor." },
        { nivel: "precaucion", when: (ex) => has(ex, "sobreCabeza") || /sobre la cabeza|por encima de la cabeza/.test(desc(ex)),
          texto: "Lleva los brazos por encima de la cabeza. Quedate debajo de la altura del hombro o en el rango sin dolor, sin peso ni resistencia." },
        { nivel: "precaucion", when: (ex) => pat(ex, "empuje") || pat(ex, "traccion"),
          texto: "Trabaja el hombro con resistencia. Bajá la carga (resorte o banda más liviana), achicá el recorrido y anclá primero el omóplato." },
      ],
    },
    {
      id: "Dolor cervical",
      dataKeys: ["Dolor cervical"],
      principle: "evitar cargar peso sobre el cuello y sostener la cabeza despegada mucho tiempo",
      tip: "Mantené la cabeza apoyada siempre que puedas y el cuello largo, con la mirada siguiendo la línea de la columna.",
      rules: [
        { nivel: "evitar", when: (ex) => has(ex, "invertida") || /rocker|\bpez\b|matsyasana/.test(txt(ex)),
          texto: "Pone peso sobre el cuello. Reemplazalo por un puente bajo o por el mismo trabajo de piernas con la pelvis apoyada." },
        { nivel: "precaucion", when: (ex) => has(ex, "flexCarga"),
          texto: "Sostiene la cabeza despegada. Hacelo con la cabeza apoyada (o sostenida con las manos o un aro detrás de la nuca) y trabajá solo piernas o brazos." },
        { nivel: "precaucion", when: (ex) => has(ex, "extCabezaAtras"),
          texto: "Lleva la cabeza hacia atrás. Mantené el cuello largo, con la mirada al piso o al frente, sin dejar caer la cabeza." },
        { nivel: "precaucion", when: (ex) => prono(ex),
          texto: "Es boca abajo. Apoyá la frente sobre las manos o una toalla para no girar el cuello." },
      ],
    },
    {
      id: "Muñeca / túnel carpiano",
      dataKeys: ["Muñeca / túnel carpiano"],
      principle: "evitar cargar peso con la muñeca en extensión completa",
      tip: "Alterná las cargas de manos con trabajos sin apoyo y aflojá la muñeca entre series.",
      rules: [
        { nivel: "evitar", when: (ex) => has(ex, "cuervo") || has(ex, "planchaLateral") && !/rodilla|antebrazo|asistida/.test(txt(ex)),
          texto: "Carga todo el peso en una o dos muñecas. Reemplazalo por la versión sobre antebrazos o con la rodilla apoyada." },
        { nivel: "precaucion", when: (ex) => manosApoyadas(ex),
          texto: "Apoya peso en las manos. Pasalo a los antebrazos, usá puños cerrados o una cuña bajo la base de la mano para reducir la extensión de muñeca." },
      ],
    },
    {
      id: "Escoliosis",
      dataKeys: ["Escoliosis"],
      principle: "evitar forzar el rango en rotación e inclinación, sobre todo hacia el lado de la curva",
      tip: "Buscá alargar la columna antes de cada movimiento y trabajá de forma simétrica, sin forzar el lado que más cuesta.",
      rules: [
        { nivel: "precaucion", when: (ex) => pat(ex, "rotacion") || has(ex, "torsionCerrada"),
          texto: "Tiene rotación. Crecé desde la coronilla antes de girar y no fuerces el lado que más cuesta: el objetivo es simetría, no rango." },
        { nivel: "precaucion", when: (ex) => pat(ex, "flexion_lateral"),
          texto: "Tiene inclinación lateral. Trabajá en un rango chico y alargando primero; si su kinesiólogo/a indicó un lado de corrección, priorizá ese." },
        { nivel: "precaucion", when: (ex) => has(ex, "extProfunda") || has(ex, "invertida"),
          texto: "Exige mucho rango a la columna. Quedate en una versión más corta, sin buscar el máximo." },
      ],
    },
    {
      id: "Hipermovilidad",
      dataKeys: ["Hipermovilidad"],
      principle: "evitar buscar el rango máximo o bloquear las articulaciones al final del recorrido",
      tip: "Sostené el movimiento con el músculo, dentro de un rango controlado, y priorizá la estabilidad por sobre la flexibilidad.",
      rules: [
        { nivel: "evitar", when: (ex) => has(ex, "extProfunda") || /roll over|jackknife|paloma completa/.test(txt(ex)),
          texto: "Lleva las articulaciones a un rango extremo. Reemplazalo por una versión más corta (por ejemplo, un puente en lugar de una extensión profunda)." },
        { nivel: "precaucion", when: (ex) => enPlancha(ex) || manosApoyadas(ex),
          texto: "Apoya peso en los brazos. Mantené una leve flexión activa en los codos, sin bloquearlos." },
        { nivel: "precaucion", when: (ex) => has(ex, "estiramiento") || pat(ex, "flexion_lateral") || pat(ex, "extension_columna"),
          texto: "Es un estiramiento o un movimiento de rango amplio. Frená antes del final del recorrido y sostené con el músculo." },
        { nivel: "precaucion", when: (ex) => has(ex, "sentadilla") || pat(ex, "sentadilla"),
          texto: "Extiende las rodillas con carga. Frená apenas antes de estirarlas del todo, sin bloquearlas." },
      ],
    },
    {
      id: "Fibromialgia",
      dataKeys: ["Fibromialgia"],
      principle: "evitar los sostenidos largos, las cargas altas, la presión dolorosa y los cambios bruscos de ritmo",
      tip: "Dejá que la alumna regule el ritmo según su energía del día, sumá pausas y priorizá terminar la clase sin dolor.",
      rules: [
        { nivel: "precaucion", when: (ex) => has(ex, "liberacion") || ((ex.accesorio || []).some((a) => a === "foam_roller" || a === "pelota") && /bajo (el|la|los|las)|sobre (el|la) (roller|pelota)/.test(desc(ex))),
          texto: "Tiene presión directa sobre músculos. Usá una presión muy liviana o reemplazalo por un estiramiento suave sin apoyo del elemento." },
        { nivel: "precaucion", when: (ex) => enPlancha(ex),
          texto: "Es un sostén isométrico exigente. Acortalo a 2 o 3 respiraciones, con rodillas apoyadas, y sumá pausa entre series." },
        { nivel: "precaucion", when: (ex) => has(ex, "saltos"),
          texto: "Tiene rebote o impacto. Hacelo sin rebote y con un ritmo parejo." },
        { nivel: "precaucion", when: (ex) => isAdvancedOnly(ex),
          texto: "Es un ejercicio de alta exigencia. Ofrecé la versión de nivel inicial o intermedio y menos repeticiones." },
      ],
    },
    {
      id: "Hipertensión arterial",
      dataKeys: ["Hipertensión arterial"],
      principle: "evitar las inversiones (cabeza por debajo del corazón), la apnea y los sostenidos isométricos largos",
      tip: "Que la respiración sea siempre fluida, con exhalación en el esfuerzo, y que los cambios de posición sean lentos (de acostada a parada, pasando por sentada).",
      rules: [
        { nivel: "evitar", when: (ex) => has(ex, "invertida"),
          texto: "Es una inversión con la cabeza por debajo del corazón. Reemplazalo por un puente bajo o por piernas elevadas sobre una silla." },
        { nivel: "precaucion", when: (ex) => /perro boca abajo|adho mukha|roll down|rodar hacia abajo|flexion hacia adelante|uttanasana|pike/.test(txt(ex)),
          texto: "Lleva la cabeza por debajo del corazón. Quedate poco tiempo, con las manos en bloques altos o la pared, y subí despacio." },
        { nivel: "precaucion", when: (ex) => enPlancha(ex),
          texto: "Es un sostén isométrico. Acortá el tiempo y exhalá durante todo el esfuerzo, sin retener el aire." },
      ],
    },
  ];

  const BY_ID = Object.fromEntries(CONDITIONS.map((c) => [c.id, c]));
  const RANK = { evitar: 2, precaucion: 1 };

  // ¿Qué tan comprometida está la condición en este ejercicio? → { nivel, textos[] }
  function assess(ex, condId) {
    const c = BY_ID[condId];
    if (!c || !ex) return { nivel: null, textos: [] };
    const avoid = ex.avoid || [];
    let nivel = null;
    if (avoid.includes(c.id) || c.dataKeys.some((k) => avoid.includes(k))) nivel = c.manualAvoidLevel || "evitar";
    const hits = c.rules.filter((r) => {
      try { return r.when(ex); } catch { return false; }
    });
    hits.forEach((r) => { if (!nivel || RANK[r.nivel] > RANK[nivel]) nivel = r.nivel; });
    // se muestran los consejos del nivel más alto que aplica (si hay que reemplazarlo, no se
    // mezcla con "achicá el recorrido"); como máximo dos, para que se pueda leer en clase
    const top = hits.length ? Math.max(...hits.map((r) => RANK[r.nivel])) : 0;
    const textos = hits.filter((r) => RANK[r.nivel] === top).map((r) => r.texto);
    return { nivel, textos };
  }

  function manualText(ex, c) {
    const ad = ex.adaptations || {};
    if (ad[c.id]) return ad[c.id];
    const key = c.dataKeys.find((k) => ad[k]);
    return key ? ad[key] : null;
  }

  // Adaptación completa para mostrar → { nivel, texto }
  function adaptation(ex, condId) {
    const c = BY_ID[condId];
    if (!c) return { nivel: null, texto: ex.adaptation || "No hay un ajuste específico registrado; individualizá el rango y la intensidad, y ante cualquier duda consultá con el profesional tratante de la alumna." };
    const { nivel, textos } = assess(ex, condId);
    const manual = manualText(ex, c);
    // la regla del embarazo boca arriba suma información aunque haya texto a mano
    const extra = c.id === "Embarazo (2.º y 3.er trimestre)" && supino(ex) && manual && !/costado|cuña|almohad|inclinad/.test(norm(manual))
      ? " Además, desde el segundo trimestre evitá sostener mucho tiempo la posición boca arriba: elevá el torso con una cuña o almohadones."
      : "";
    if (manual) return { nivel: nivel || "precaucion", texto: manual + extra };
    if (textos.length) {
      const tagged = (ex.avoid || []).includes(c.id) || c.dataKeys.some((k) => (ex.avoid || []).includes(k));
      const nota = tagged && ex.adaptation ? ` Para este ejercicio en particular: ${ex.adaptation.charAt(0).toLowerCase()}${ex.adaptation.slice(1)}` : "";
      return { nivel, texto: textos.slice(0, 2).join(" ") + nota };
    }
    if (nivel) {
      return { nivel, texto: `Este ejercicio está marcado para cuidar en esta condición: conviene ${c.principle}. ${ex.adaptation || "Reducí el rango y la intensidad, o reemplazalo por una versión más simple."}` };
    }
    return { nivel: null, texto: `Este ejercicio no compromete especialmente esta condición: puede hacerlo con el grupo. ${c.tip}` };
  }

  // condiciones en las que el ejercicio está contraindicado (para el aviso "Evitar en")
  function evitarList(ex) {
    return CONDITIONS.filter((c) => assess(ex, c.id).nivel === "evitar").map((c) => c.id);
  }

  window.PATOLOGIAS = { CONDITIONS, BY_ID, assess, adaptation, evitarList };

  // la lista de condiciones del formulario de ejercicios propios y de los paneles
  AVOID_TAGS.length = 0;
  CONDITIONS.forEach((c) => AVOID_TAGS.push(c.id));
})();
