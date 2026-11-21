/* ============================================================
   FRASES DE INICIO Y CIERRE DE CLASE
   ------------------------------------------------------------
   Para que la instructora las lea en voz alta.
   Estructura: FRASES[disciplina][objetivo] = { inicio: [...], cierre: [...] }
   Los ids de objetivo son los de OBJECTIVES (data.js).
   Si una combinación no tiene frases, app.js usa la frase genérica de siempre.
   No usar comillas dobles dentro de las frases.
   ============================================================ */

const FRASES = {
  pilates: {
    "lumbopelvica": {
      inicio: [
        "Hoy el protagonista es tu centro de apoyo: la pelvis y la zona lumbar. Apoyate en la colchoneta y dejá que el peso de la cadera se acomode solo.",
        "Imaginá que la pelvis es una base firme sobre la que se va a construir toda la clase. Antes de moverte, sentí cómo se reparte el peso entre los dos lados.",
        "Vamos a buscar estabilidad sin rigidez. Soltá los glúteos, aflojá la mandíbula y dejá que la respiración llegue hasta la parte baja de la espalda.",
        "Llevá tu atención a la zona lumbar y preguntate qué necesita hoy: sostén, espacio o descanso. Con esa respuesta vamos a trabajar.",
        "Hoy cada movimiento de piernas va a ser una oportunidad para que la pelvis aprenda a quedarse tranquila. Empezamos despacio, sin apuro.",
      ],
      cierre: [
        "Notá cómo queda apoyada ahora la pelvis. Esa sensación de base estable es lo que te llevás para caminar, sentarte y cargar peso en tu día.",
        "Tu zona lumbar trabajó con cuidado y con inteligencia. Agradecele el esfuerzo y dejá que descanse unas respiraciones más.",
        "Estabilidad no es quedarse dura: es poder moverse sin perder el centro. Eso fue lo que practicaste hoy, y se nota.",
        "Cuando te levantes de la silla esta semana, acordate de este apoyo. Ahí está el verdadero sentido de lo que hicimos.",
        "Felicitaciones por la paciencia con los movimientos chicos. Son los que más le enseñan al cuerpo.",
      ],
    },
    "columna": {
      inicio: [
        "Tu columna tiene muchas vértebras, y hoy vamos a darle movimiento a cada una. Empezá respirando largo, como si le hicieras lugar entre una y otra.",
        "Antes de empezar, recorré tu espalda con la atención, desde el cuello hasta el sacro. Fijate dónde se siente libre y dónde pide más espacio.",
        "Hoy la consigna es articular: nada de moverse en bloque. Vamos a ir despacio, de a un tramo por vez.",
        "Pensá en tu columna como una cadena flexible y fuerte a la vez. En esta clase vamos a enrollarla, alargarla y rotarla con suavidad.",
        "Dejá que la respiración sea la primera en moverte la espalda. Inhalá y sentí cómo se ensancha; exhalá y sentí cómo se alarga.",
      ],
      cierre: [
        "Fijate qué espacio ganó tu espalda. A veces el cambio es sutil, pero el cuerpo lo registra.",
        "Hoy le diste a tu columna movimiento en todas las direcciones. Esa variedad es la que la mantiene sana con los años.",
        "Antes de irte, crecé un poco desde la coronilla y notá lo fácil que resulta. Esa altura es tuya.",
        "Movilidad es un regalo que se renueva con cada práctica. Gracias por dedicarle este tiempo a tu espalda.",
        "Cuando sientas la espalda cansada esta semana, volvé a una de estas respiraciones largas. Ya sabés cómo hacerlo.",
      ],
    },
    "tren-superior": {
      inicio: [
        "Hoy vamos a fortalecer brazos, hombros y espalda alta. Antes de empezar, dejá caer los hombros lejos de las orejas y soltá las manos.",
        "La fuerza de los brazos nace en la espalda. Llevá la atención a los omóplatos y sentí que se apoyan anchos y tranquilos.",
        "Vamos a trabajar el tren superior sin apurarnos: cada repetición bien organizada vale más que muchas hechas de cualquier manera.",
        "Pensá en todo lo que hacés con los brazos en un día: cargar, empujar, abrazar. Hoy vamos a entrenar esa fuerza cotidiana.",
        "Empezamos con el cuello largo y el pecho abierto. Desde ahí, los brazos van a poder trabajar sin tensión de más.",
      ],
      cierre: [
        "Sacudí suave las manos y dejá que los brazos cuelguen pesados. Trabajaron mucho y lo hicieron con buena organización.",
        "Notá si los hombros quedaron más bajos y más anchos que al empezar. Esa postura es la que buscamos sostener fuera de la clase.",
        "Hoy fortaleciste los brazos desde la espalda, que es la forma más segura y duradera de ganar fuerza.",
        "La próxima vez que cargues una bolsa o levantes algo, pensá en tus omóplatos. Ahí está todo lo que practicamos.",
        "Gracias por el compromiso de hoy. La fuerza se construye así: con constancia y con atención.",
      ],
    },
    "centro": {
      inicio: [
        "Hoy vamos a despertar tu centro, ese abdomen profundo que sostiene todo sin hacer ruido. Apoyá una mano sobre la panza y sentí cómo respira.",
        "Antes de pedirle fuerza al abdomen, vamos a pedirle conexión. Exhalá largo y notá cómo se activa por sí solo, sin apretar.",
        "Tu centro es el punto de donde nacen todos los movimientos de esta clase. Tomate unos segundos para encontrarlo.",
        "Hoy no se trata de apretar fuerte, sino de sostener suave y por más tiempo. Dejá los glúteos y el cuello relajados.",
        "Imaginá un cinturón suave que te abraza la cintura desde adentro. Con esa imagen vamos a acompañar cada ejercicio.",
      ],
      cierre: [
        "Soltá por completo el abdomen y dejá que la panza suba y baje libre. Después de sostener, también hace falta soltar.",
        "Hoy tu centro trabajó en cada movimiento, incluso en los que parecían de brazos o de piernas. Así funciona en la vida real.",
        "Notá la diferencia entre la respiración de ahora y la del principio. Tu centro también se mueve con ella.",
        "Esa sensación de estar sostenida desde adentro es la que te llevás hoy. Prestale atención cuando estés de pie esta semana.",
        "Un centro fuerte y disponible cuida tu espalda todos los días. Gracias por entrenarlo con tanta dedicación.",
      ],
    },
    "control-escapular": {
      inicio: [
        "Hoy vamos a poner la atención en los omóplatos, que son la base de tus hombros. Sentí cómo se apoyan y dejalos deslizar apenas hacia abajo.",
        "Muchas tensiones de cuello nacen en hombros mal organizados. Hoy vamos a enseñarles un lugar más cómodo y estable.",
        "Antes de mover los brazos, vamos a aprender a mover la escápula. Es un trabajo fino, así que vamos con calma.",
        "Imaginá que tus omóplatos son dos alas apoyadas sobre la espalda. Durante la clase vamos a enseñarles a abrirse y a anclarse.",
        "Aflojá el cuello, separá los dientes y dejá que el peso de los brazos baje. Desde esa calma empezamos.",
      ],
      cierre: [
        "Rodá los hombros despacio un par de veces y notá cómo se mueven ahora. Hoy les diste mucha información nueva.",
        "Sentí el espacio entre tus orejas y tus hombros. Esa distancia es la que vale la pena cuidar frente a la compu o el celular.",
        "El control escapular es invisible desde afuera, pero se nota en cómo te sentís. Valoralo como un gran trabajo.",
        "Cuando aparezca tensión en el cuello esta semana, pensá en anclar los omóplatos. Es un recurso que ya tenés.",
        "Gracias por la atención que pusiste en movimientos tan sutiles. Ahí está la calidad del Pilates.",
      ],
    },
    "coordinacion-fluidez": {
      inicio: [
        "Hoy vamos a unir movimientos y respiración para que todo fluya. No busques la perfección: buscá el ritmo.",
        "Esta clase tiene secuencias que se encadenan. Si te perdés, frená, respirá y volvé a sumarte cuando quieras.",
        "Vamos a jugar con el ritmo: a veces lento, a veces más ágil. Dejá que la respiración marque el compás.",
        "Coordinar es pedirle al cuerpo que haga varias cosas a la vez. Arrancamos con lo simple y vamos sumando de a poco.",
        "Imaginá que el movimiento es como una ola: empieza, crece y vuelve a calmarse. Así vamos a transitar la clase.",
      ],
      cierre: [
        "Quedate quieta un momento y disfrutá del silencio después de tanto movimiento. El cuerpo sigue integrando lo que hizo.",
        "Hoy tu cuerpo aprendió secuencias nuevas. La próxima vez van a salir con más facilidad, porque ya quedaron registradas.",
        "Fluir no es ir rápido: es ir sin cortes. Notá cuánto de eso pudiste encontrar hoy.",
        "Si alguna secuencia costó, está perfecto. La coordinación se entrena equivocándose y volviendo a intentar.",
        "Gracias por animarte a moverte de otra manera. Esa curiosidad es la que hace crecer la práctica.",
      ],
    },
  },
  yoga: {
    "enraizamiento": {
      inicio: [
        "Sentí todos los puntos de tu cuerpo que tocan el piso. Hoy vamos a practicar desde esa sensación de raíz.",
        "Antes de buscar el equilibrio afuera, vamos a buscarlo adentro. Respirá lento y dejá que el peso baje.",
        "Hoy cada postura empieza por los pies. Abrí bien los dedos y sentí cómo el suelo te sostiene.",
      ],
      cierre: [
        "Quedate unos segundos sintiendo el apoyo del cuerpo en el piso. Esa estabilidad también es un estado de ánimo.",
        "Llevate esta sensación de estar plantada. Cuando el día se acelere, volvé a sentir tus pies.",
        "Gracias por practicar con presencia. El equilibrio que encontraste hoy no se queda en la colchoneta.",
      ],
    },
    "cadera": {
      inicio: [
        "La cadera guarda mucho de lo que vivimos. Hoy vamos a abrirla con paciencia, sin forzar ningún rango.",
        "Respirá hacia la pelvis y dejá que se ablande. En esta práctica, el tiempo hace más que la fuerza.",
        "Hoy vamos a darle espacio a las caderas. Usá todos los apoyos que necesites: no son un atajo, son una herramienta.",
      ],
      cierre: [
        "Notá cómo se siente la cadera ahora. Cada pequeña apertura cuenta, aunque no se vea.",
        "Dejá las piernas pesadas y sueltas. Hoy les diste un espacio que pocas veces tienen.",
        "Gracias por escuchar los límites de tu cuerpo. Esa escucha es la que hace segura la apertura.",
      ],
    },
    "columna-yoga": {
      inicio: [
        "Hoy vamos a mover la columna en todas sus direcciones. Empezá alargándote con la inhalación.",
        "Imaginá que tu espalda es un tallo flexible que se mece con la respiración. Con esa imagen arrancamos.",
        "Antes de cada movimiento, crecé un poquito. La flexibilidad sana empieza siempre por la longitud.",
      ],
      cierre: [
        "Sentí tu espalda apoyada y libre. Hoy la llevaste hacia adelante, hacia atrás, a los costados y en giro.",
        "Una columna que se mueve es una columna que se mantiene joven. Gracias por regalarle esta práctica.",
        "Dejá que la respiración siga recorriendo tu espalda unos momentos más antes de incorporarte.",
      ],
    },
    "fuerza-yoga": {
      inicio: [
        "Hoy vamos a encontrar fuerza sin perder la calma. Que la respiración sea siempre más larga que el esfuerzo.",
        "En esta práctica vamos a sostener posturas con firmeza y suavidad a la vez. Si la respiración se corta, aflojá un poco.",
        "Sentí tu cuerpo despierto y disponible. Hoy le vamos a pedir presencia y fuerza en cada postura.",
      ],
      cierre: [
        "Soltá todo el esfuerzo y dejá que el cuerpo descanse por completo. La fuerza también necesita este momento.",
        "Hoy demostraste que podés estar firme y tranquila al mismo tiempo. Llevate esa combinación.",
        "Gracias por quedarte en las posturas cuando costaban. Ahí es donde crece la fuerza de verdad.",
      ],
    },
  },
};
