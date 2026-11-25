/* Base de conocimientos local de Resuelve.
 * Cada intención incluye categoría, claves y sinónimos, ejemplos, respuestas
 * alternas, pasos, necesidades, preguntas relacionadas y un enlace opcional.
 * Añade contenidos con un id único y valida sus referencias en pruebas.html.
 * Fuentes y criterios de mantenimiento: chatbot/README.md.
 */
(function (raiz) {
  'use strict';
  raiz.CuidaConocimiento = [
    {
        "id":  "saludo",
        "categoria":  "inicio",
        "titulo":  "Saludar",
        "claves":  [
                       "hola",
                       "buenas",
                       "buenos dias",
                       "buenas tardes",
                       "hey",
                       "holi"
                   ],
        "ejemplos":  [
                         "Hola",
                         "Buenas",
                         "Hola qué tal",
                         "Buenos días",
                         "Hey buenas"
                     ],
        "respuestas":  [
                           "¡Hola! Soy Resuelve. Puedo orientarte sobre cuidados cotidianos, bienestar de quien cuida y recursos de CuidApoyo. ¿Qué necesitas hoy?",
                           "¡Buenas! Cuéntame qué te preocupa o elige un tema. Podemos hablar de higiene, comidas, movilidad, descanso o apoyo para cuidar."
                       ],
        "pasos":  "Elige una necesidad concreta; por ejemplo, ayudar a caminar o repartir las tareas.",
        "necesitas":  "Solo necesitas contarme tu duda sin nombres ni datos personales.",
        "relacionadas":  [
                             "movilidad",
                             "rutina",
                             "cuidador"
                         ],
        "enlace":  null
    },
    {
        "id":  "capacidades",
        "categoria":  "inicio",
        "titulo":  "Qué puedes hacer",
        "claves":  [
                       "que puedes hacer",
                       "opciones",
                       "menu",
                       "ayuda",
                       "no se",
                       "nose",
                       "que preguntar"
                   ],
        "ejemplos":  [
                         "Qué puedes hacer",
                         "Necesito ayuda",
                         "No sé qué preguntar",
                         "Muéstrame las opciones",
                         "Cómo funciona este asistente"
                     ],
        "respuestas":  [
                           "Puedo explicar cuidados diarios, acompañamiento, seguridad en casa y servicios de apoyo. Entiendo preguntas parecidas y recuerdo el último tema mientras esta página esté abierta. No diagnostico ni indico tratamientos.",
                           "Podemos empezar por una duda pequeña: aseo, alimentación, desplazamientos, soledad o descanso. También te ayudo a encontrar las secciones de la web."
                       ],
        "pasos":  "Escoge un tema de los botones o descríbelo con tus palabras.",
        "necesitas":  "Una descripción breve de lo que necesitas; no hace falta compartir datos identificativos.",
        "relacionadas":  [
                             "higiene",
                             "alimentacion",
                             "movilidad",
                             "servicios"
                         ],
        "enlace":  null
    },
    {
        "id":  "gracias",
        "categoria":  "inicio",
        "titulo":  "Dar las gracias",
        "claves":  [
                       "gracias",
                       "muchas gracias",
                       "te lo agradezco",
                       "muy amable"
                   ],
        "ejemplos":  [
                         "Gracias",
                         "Muchas gracias por ayudar",
                         "Te lo agradezco",
                         "Gracias de verdad",
                         "Muy amable"
                     ],
        "respuestas":  [
                           "¡De nada! Si quieres, seguimos con el mismo tema o buscamos otro recurso.",
                           "Me alegra acompañarte. Puedes pedirme más detalles o elegir otra pregunta."
                       ],
        "pasos":  "Escribe «explícame más» para continuar con el tema anterior.",
        "necesitas":  "Puedes seguir preguntando a tu ritmo.",
        "relacionadas":  [
                             "rutina",
                             "cuidador"
                         ],
        "enlace":  null
    },
    {
        "id":  "despedida",
        "categoria":  "inicio",
        "titulo":  "Despedirse",
        "claves":  [
                       "adios",
                       "hasta luego",
                       "chao",
                       "hasta pronto",
                       "nos vemos"
                   ],
        "ejemplos":  [
                         "Adiós",
                         "Hasta luego",
                         "Chao",
                         "Nos vemos",
                         "Hasta pronto"
                     ],
        "respuestas":  [
                           "¡Hasta pronto! Cuídate tú también. Puedes volver cuando lo necesites.",
                           "Gracias por conversar conmigo. Aquí puedes retomar tus dudas cuando quieras."
                       ],
        "pasos":  "Puedes iniciar una conversación nueva con el botón superior.",
        "necesitas":  "La conversación se borra al recargar o iniciar otra.",
        "relacionadas":  [
                             "capacidades",
                             "privacidad"
                         ],
        "enlace":  null
    },
    {
        "id":  "mayores",
        "categoria":  "cuidados",
        "titulo":  "Cuidar a una persona mayor",
        "claves":  [
                       "persona mayor",
                       "anciano",
                       "tercera edad",
                       "cuidar abuelo",
                       "cuidar abuela",
                       "cuidar padre",
                       "cuidar madre"
                   ],
        "ejemplos":  [
                         "Cómo cuidar a una persona mayor",
                         "Cuido a mi abuelo por primera vez",
                         "Consejos para atender a mi madre",
                         "Qué necesita una persona anciana",
                         "Cómo acompañar a mi padre mayor"
                     ],
        "respuestas":  [
                           "Empieza escuchando sus preferencias y observando qué hace sin ayuda. Acordad apoyos para aseo, comidas, movilidad y compañía, manteniendo sus decisiones y su intimidad.",
                           "Cada persona mayor necesita apoyos distintos. Pregunta qué le resulta difícil y priorizad una tarea, sin hacer por ella lo que todavía puede y quiere hacer."
                       ],
        "pasos":  "1. Pregunta qué necesita hoy.\n2. Revisa el entorno y los apoyos disponibles.\n3. Acordad una rutina flexible y una persona de referencia.",
        "necesitas":  "Una lista de necesidades, preferencias y contactos de apoyo, guardada fuera de este chat.",
        "relacionadas":  [
                             "autonomia",
                             "rutina",
                             "higiene"
                         ],
        "enlace":  {
                       "url":  "index.html#nosotros",
                       "texto":  "Conocer CuidApoyo"
                   }
    },
    {
        "id":  "dependencia",
        "categoria":  "cuidados",
        "titulo":  "Situación de dependencia",
        "claves":  [
                       "dependencia",
                       "dependiente",
                       "necesita ayuda diaria",
                       "no se vale solo",
                       "no se vale sola"
                   ],
        "ejemplos":  [
                         "Qué significa dependencia",
                         "Mi madre ya no se vale sola",
                         "Necesita ayuda todos los días",
                         "Cómo atender a una persona dependiente",
                         "Mi padre depende de nosotros"
                     ],
        "respuestas":  [
                           "La dependencia implica necesitar apoyo para actividades de la vida diaria. La ayuda debe ajustarse a la persona y revisarse cuando cambien sus necesidades. Para valoración y servicios, consulta los servicios sociales de tu zona.",
                           "Puedes comenzar anotando en qué tareas necesita ayuda y qué puede hacer por sí misma. Esa información facilita hablar con profesionales y organizar los apoyos."
                       ],
        "pasos":  "Anota dificultades de aseo, vestido, alimentación y desplazamientos. Solicita orientación a trabajo social para valorar apoyos.",
        "necesitas":  "Información de necesidades cotidianas y contacto con servicios sociales; los requisitos de valoración dependen de la administración competente.",
        "relacionadas":  [
                             "autonomia",
                             "valoracion",
                             "servicios"
                         ],
        "enlace":  null
    },
    {
        "id":  "autonomia",
        "categoria":  "cuidados",
        "titulo":  "Respetar su autonomía",
        "claves":  [
                       "autonomia",
                       "independencia",
                       "decidir",
                       "hacer solo",
                       "hacer sola",
                       "intimidad",
                       "dignidad"
                   ],
        "ejemplos":  [
                         "Cómo fomentar su autonomía",
                         "Quiere hacerlo solo",
                         "Debo decidir por ella",
                         "Cómo respetar su intimidad",
                         "Mi abuela quiere ser independiente"
                     ],
        "respuestas":  [
                           "Ofrece ayuda sin dar por hecho que la necesita. Pregunta antes de tocar, da tiempo para responder y permite elegir cosas cotidianas, como la ropa o el horario.",
                           "Mantener la autonomía también es cuidar. Divide una tarea en partes y acompaña solo en las que lo pida o necesite, respetando su privacidad."
                       ],
        "pasos":  "Ofrece dos opciones sencillas, espera su respuesta y acuerda qué parte de la tarea haréis juntos.",
        "necesitas":  "Tiempo, escucha y un entorno que permita participar con seguridad.",
        "relacionadas":  [
                             "vestido",
                             "comunicacion",
                             "mayores"
                         ],
        "enlace":  null
    },
    {
        "id":  "higiene",
        "categoria":  "higiene",
        "titulo":  "Aseo diario",
        "claves":  [
                       "higiene",
                       "aseo",
                       "lavarse",
                       "limpieza personal",
                       "asear",
                       "asearla",
                       "asearlo",
                       "lavarla",
                       "lavarlo",
                       "asearse"
                   ],
        "ejemplos":  [
                         "Cómo ayudar con la higiene",
                         "Cómo asear a mi padre",
                         "Necesita ayuda para lavarse",
                         "Cómo organizar el aseo diario",
                         "Consejos de limpieza personal"
                     ],
        "respuestas":  [
                           "Prepara lo necesario antes del aseo, explica cada paso y protege su intimidad. Procura un ambiente confortable y deja que participe todo lo posible.",
                           "El aseo puede ser un momento tranquilo si se acuerdan el horario y las preferencias. No hace falta apresurarse: ayuda por partes y observa si aparece dolor o irritación."
                       ],
        "pasos":  "1. Reúne toalla, ropa limpia y productos habituales.\n2. Comprueba que la persona esté cómoda.\n3. Explica cada paso y seca con suavidad, especialmente los pliegues.",
        "necesitas":  "Toalla, ropa limpia, productos de higiene habituales y apoyos adecuados al entorno.",
        "relacionadas":  [
                             "ducha",
                             "bucal",
                             "piel"
                         ],
        "enlace":  null
    },
    {
        "id":  "ducha",
        "categoria":  "higiene",
        "titulo":  "Ducha y baño seguros",
        "claves":  [
                       "ducha",
                       "duchar",
                       "baño",
                       "banar",
                       "bañar",
                       "lavar cuerpo"
                   ],
        "ejemplos":  [
                         "Cómo ayudarle a ducharse",
                         "Tiene miedo al baño",
                         "Cómo hacer una ducha segura",
                         "Necesito bañar a mi madre",
                         "Consejos para entrar en la ducha"
                     ],
        "respuestas":  [
                           "Mantén el suelo seco y los productos al alcance. Comprueba la temperatura con la persona y utiliza apoyos instalados correctamente. Si necesita ayuda para entrar o salir, pide que un profesional os enseñe una transferencia segura.",
                           "Antes de la ducha, prepara ropa y toallas y deja libre el recorrido. Un asiento adecuado puede ser útil tras valorar sus necesidades; no uses sillas improvisadas ni toalleros como apoyo."
                       ],
        "pasos":  "Prepara el baño sin prisas, acuerda la ayuda necesaria y detén la actividad si hay mareo, dolor o inseguridad.",
        "necesitas":  "Superficie antideslizante adecuada, toalla accesible y, si procede, asiento y barras valorados e instalados por profesionales.",
        "relacionadas":  [
                             "bano_accesible",
                             "transferencias",
                             "caidas"
                         ],
        "enlace":  null
    },
    {
        "id":  "bucal",
        "categoria":  "higiene",
        "titulo":  "Higiene de boca y prótesis",
        "claves":  [
                       "boca",
                       "bucal",
                       "dientes",
                       "dentadura",
                       "protesis dental",
                       "cepillar"
                   ],
        "ejemplos":  [
                         "Cómo limpiar su dentadura",
                         "Ayuda para lavarse los dientes",
                         "Cuidados de la boca",
                         "Cómo cuidar la prótesis dental",
                         "Le cuesta cepillarse"
                     ],
        "respuestas":  [
                           "Ofrece ayuda para la higiene bucal siguiendo las indicaciones del dentista. Respeta las pausas y no fuerces la boca. Dolor, sangrado persistente o dificultad para comer merecen consulta.",
                           "Incluye la boca en la rutina diaria. Si usa prótesis, sigue las instrucciones de limpieza y conservación que le hayan dado; no improvises productos abrasivos."
                       ],
        "pasos":  "Prepara sus útiles habituales, ofrece participar y pide al dentista una técnica adaptada si no puede cepillarse sin ayuda.",
        "necesitas":  "Cepillo y productos indicados para su boca o prótesis; una revisión si hay molestias.",
        "relacionadas":  [
                             "higiene",
                             "alimentacion",
                             "deglucion"
                         ],
        "enlace":  null
    },
    {
        "id":  "vestido",
        "categoria":  "higiene",
        "titulo":  "Ayuda para vestirse",
        "claves":  [
                       "vestir",
                       "vestirse",
                       "ropa",
                       "botones",
                       "calzarse",
                       "vestido",
                       "camiseta",
                       "pantalon",
                       "ponerse ropa",
                       "poner ropa",
                       "zapatos",
                       "abrochar"
                   ],
        "ejemplos":  [
                         "Cómo ayudarle a vestirse",
                         "Le cuesta abrochar botones",
                         "Qué ropa es más cómoda",
                         "No puede calzarse solo",
                         "Ayuda para ponerse la ropa"
                     ],
        "respuestas":  [
                           "Deja que elija su ropa y prepara las prendas en orden. Las prendas fáciles de abrir y el calzado estable pueden facilitar la tarea. Evita tirones de brazos o piernas.",
                           "Vestirse con tiempo ayuda a conservar la participación. Puedes ofrecer hacerlo sentado en un asiento estable cuando sea seguro y pedir orientación si hay dolor o movilidad muy limitada."
                       ],
        "pasos":  "Escoged la ropa, colocadla al alcance y realizad una parte cada vez, respetando descansos.",
        "necesitas":  "Ropa cómoda y un lugar estable y accesible; adaptaciones si las aconseja terapia ocupacional.",
        "relacionadas":  [
                             "autonomia",
                             "movilidad",
                             "rutina"
                         ],
        "enlace":  null
    },
    {
        "id":  "incontinencia",
        "categoria":  "higiene",
        "titulo":  "Pérdidas de orina",
        "claves":  [
                       "incontinencia",
                       "orina",
                       "pis",
                       "panal",
                       "pañal",
                       "escapes"
                   ],
        "ejemplos":  [
                         "Tiene pérdidas de orina",
                         "Cómo manejar los escapes de pis",
                         "Necesita usar pañal",
                         "Consejos para la incontinencia",
                         "Se le escapa la orina"
                     ],
        "respuestas":  [
                           "Habla del tema con respeto y facilita un acceso cómodo al baño. Mantén la piel limpia y seca con cambios adecuados. Las pérdidas nuevas, el dolor o cambios llamativos deben consultarse con profesionales.",
                           "La incontinencia no debe ocultarse ni asumirse sin valoración. Anota cuándo ocurre y consulta al equipo de salud para adaptar cuidados y productos. No reduzcas el agua por tu cuenta para evitar escapes."
                       ],
        "pasos":  "Facilita ropa que se pueda quitar, despeja el acceso al baño y registra cambios para comentarlos en consulta.",
        "necesitas":  "Productos adecuados a la persona y orientación de enfermería; protege siempre su intimidad.",
        "relacionadas":  [
                             "piel",
                             "bano_accesible",
                             "hidratacion"
                         ],
        "enlace":  null
    },
    {
        "id":  "piel",
        "categoria":  "higiene",
        "titulo":  "Cuidado de la piel",
        "claves":  [
                       "piel",
                       "rojez",
                       "rojeces",
                       "llaga",
                       "llagas",
                       "ulcera",
                       "presion",
                       "encamado",
                       "tumbado",
                       "tumbada",
                       "postrado",
                       "postrada",
                       "en cama"
                   ],
        "ejemplos":  [
                         "Cómo cuidar la piel",
                         "Tiene rojeces por estar en cama",
                         "Cómo prevenir llagas",
                         "Mi padre está encamado",
                         "Le veo una zona roja"
                     ],
        "respuestas":  [
                           "Observa la piel durante el aseo y manténla limpia y seca. Si pasa mucho tiempo en una posición, pide a enfermería un plan individual de cambios posturales y superficies de apoyo. No masajees zonas enrojecidas.",
                           "Las zonas que soportan presión necesitan atención. Una rojez persistente, una herida o dolor en la piel requieren valoración; este chat no puede determinar su causa ni indicar curas."
                       ],
        "pasos":  "Revisa la piel sin frotar, anota el cambio y contacta con enfermería si persiste o hay lesión. Pide un plan de movilización adaptado.",
        "necesitas":  "Orientación de enfermería, ropa sin pliegues y productos o superficies solo según valoración.",
        "relacionadas":  [
                             "higiene",
                             "transferencias",
                             "movilidad"
                         ],
        "enlace":  null
    },
    {
        "id":  "alimentacion",
        "categoria":  "alimentacion",
        "titulo":  "Alimentación cotidiana",
        "claves":  [
                       "alimentacion",
                       "comida",
                       "comer",
                       "dieta",
                       "menu",
                       "nutricion"
                   ],
        "ejemplos":  [
                         "Cómo organizar su alimentación",
                         "Qué puede comer una persona mayor",
                         "Consejos para las comidas",
                         "Necesito preparar el menú",
                         "Cómo ayudarle a comer"
                     ],
        "respuestas":  [
                           "Procura comidas tranquilas y adaptadas a sus preferencias e indicaciones profesionales. Facilita una postura cómoda y estable, sin prisas, y ofrece ayuda sin sustituir su participación.",
                           "Organizar las comidas ayuda a cuidar: acordad horarios flexibles, evita distracciones molestas y observa qué alimentos acepta. Las dietas especiales deben revisarse con su equipo de salud."
                       ],
        "pasos":  "Planifica las comidas, prepara utensilios cómodos y deja tiempo suficiente. Si tose al comer o le cuesta tragar, consulta antes de cambiar texturas.",
        "necesitas":  "Sus preferencias y las indicaciones dietéticas existentes; utensilios accesibles si hacen falta.",
        "relacionadas":  [
                             "hidratacion",
                             "apetito",
                             "deglucion"
                         ],
        "enlace":  null
    },
    {
        "id":  "hidratacion",
        "categoria":  "alimentacion",
        "titulo":  "Beber y mantenerse hidratado",
        "claves":  [
                       "hidratacion",
                       "hidratar",
                       "agua",
                       "beber",
                       "liquidos",
                       "sed"
                   ],
        "ejemplos":  [
                         "Cómo ayudarle a beber agua",
                         "Bebe muy poco",
                         "No tiene sed",
                         "Consejos de hidratación",
                         "Cómo ofrecer líquidos"
                     ],
        "respuestas":  [
                           "Ofrece bebidas de forma regular y déjalas accesibles si puede tomarlas con seguridad. Respeta las restricciones de líquidos indicadas por profesionales: no hay una cantidad universal para todas las personas.",
                           "Puedes asociar las bebidas a momentos del día y usar un recipiente cómodo. Si le cuesta tragar, se atraganta o bebe mucho menos de lo habitual, consulta al equipo sanitario."
                       ],
        "pasos":  "Pregunta qué bebida prefiere, ofrece oportunidades frecuentes y observa si puede beber sin dificultad. No fuerces ni modifiques espesores por tu cuenta.",
        "necesitas":  "Un recipiente fácil de sujetar y conocer si tiene restricciones o pautas de deglución.",
        "relacionadas":  [
                             "deglucion",
                             "alimentacion",
                             "rutina"
                         ],
        "enlace":  null
    },
    {
        "id":  "apetito",
        "categoria":  "alimentacion",
        "titulo":  "Falta de apetito",
        "claves":  [
                       "apetito",
                       "hambre",
                       "rechaza comida",
                       "no quiere comer",
                       "come poco",
                       "no come",
                       "come menos",
                       "comer menos",
                       "cada vez menos comida",
                       "rechaza alimentos",
                       "perdida apetito"
                   ],
        "ejemplos":  [
                         "No quiere comer",
                         "Mi abuela no tiene hambre",
                         "Come muy poco",
                         "Cómo actuar si pierde el apetito",
                         "Rechaza la comida"
                     ],
        "respuestas":  [
                           "Evita obligar a comer. Pregunta si hay dolor, cansancio o algo que le moleste, y ofrece un entorno tranquilo con alimentos acordes a sus pautas. Si el cambio persiste o pierde peso, pide valoración.",
                           "La falta de apetito tiene distintas causas que este chat no puede identificar. Anota desde cuándo ocurre y si hay problemas al masticar o tragar para explicarlo al profesional."
                       ],
        "pasos":  "Ofrece una opción conocida, respeta su ritmo y registra cambios. Consulta si la ingesta disminuye de forma mantenida o hay signos de deterioro.",
        "necesitas":  "Saber desde cuándo come menos y si hay molestias; evita suplementos sin orientación profesional.",
        "relacionadas":  [
                             "bucal",
                             "deglucion",
                             "alimentacion"
                         ],
        "enlace":  null
    },
    {
        "id":  "deglucion",
        "categoria":  "alimentacion",
        "titulo":  "Dificultad para tragar",
        "claves":  [
                       "tragar",
                       "deglucion",
                       "disfagia",
                       "atraganta",
                       "atragantar",
                       "tos al comer",
                       "tose al beber",
                       "tragarse",
                       "tragar comida",
                       "tose cuando bebe",
                       "tos bebiendo"
                   ],
        "ejemplos":  [
                         "Le cuesta tragar",
                         "Tose al beber agua",
                         "Se atraganta al comer",
                         "Qué hago con la disfagia",
                         "Tiene problemas de deglución"
                     ],
        "respuestas":  [
                           "Si le cuesta tragar o tose al comer o beber, solicita valoración sanitaria. No cambies texturas ni añadas espesantes sin indicación. Si ahora no puede respirar, hablar o toser, contacta inmediatamente con emergencias de tu zona.",
                           "Las dificultades de deglución necesitan evaluación profesional. Evita forzar la ingesta y pide una pauta adaptada; este chat no puede decidir qué consistencia es segura."
                       ],
        "pasos":  "Si ocurre durante la ingesta, detén ese intento y valora si hay dificultad respiratoria. Ante peligro actual, emergencias; en otros casos, consulta sanitaria con prontitud.",
        "necesitas":  "Valoración del equipo de salud y las pautas que este establezca para alimentos y bebidas.",
        "relacionadas":  [
                             "alimentacion",
                             "hidratacion",
                             "emergencia"
                         ],
        "enlace":  null
    },
    {
        "id":  "movilidad",
        "categoria":  "movilidad",
        "titulo":  "Ayuda para caminar",
        "claves":  [
                       "movilidad",
                       "andar",
                       "caminar",
                       "moverse",
                       "desplazarse",
                       "pasear",
                       "no puede andar",
                       "camina",
                       "desplazamiento",
                       "moverme",
                       "moverlo",
                       "moverla",
                       "desplazamiento"
                   ],
        "ejemplos":  [
                         "Mi abuelo no puede andar",
                         "Necesito ayuda para caminar",
                         "Tiene problemas de movilidad",
                         "Le cuesta desplazarse",
                         "Cómo acompañarle al caminar"
                     ],
        "respuestas":  [
                           "Para acompañar al caminar, despeja el recorrido, adapta el ritmo y deja descansos. No tires de sus brazos ni improvises apoyos. Si no puede mantenerse en pie, pide una valoración y una demostración profesional.",
                           "Las dificultades para moverse necesitan apoyos ajustados a la persona. Pregunta qué le cuesta y solicita a fisioterapia o terapia ocupacional orientación sobre desplazamientos seguros."
                       ],
        "pasos":  "1. Asegura luz y un paso libre.\n2. Confirma qué ayuda tiene indicada.\n3. Acompaña sin forzar y detente ante dolor, mareo o inestabilidad.",
        "necesitas":  "Calzado estable y el apoyo indicado para su situación. Si la dificultad aparece de repente, solicita atención sanitaria urgente.",
        "relacionadas":  [
                             "transferencias",
                             "andador",
                             "caidas"
                         ],
        "enlace":  null
    },
    {
        "id":  "transferencias",
        "categoria":  "movilidad",
        "titulo":  "Pasar de la cama a la silla",
        "claves":  [
                       "transferencia",
                       "transferencias",
                       "levantar",
                       "incorporar",
                       "cama silla",
                       "pasar silla",
                       "sentar",
                       "levantarse",
                       "levantarlo",
                       "levantarla",
                       "incorporarse",
                       "sentarlo",
                       "sentarla",
                       "cambiar de asiento"
                   ],
        "ejemplos":  [
                         "Cómo pasar de la cama a la silla",
                         "Necesito levantar a mi padre",
                         "Cómo ayudarle a incorporarse",
                         "No sé cómo sentarlo",
                         "Qué es una transferencia segura"
                     ],
        "respuestas":  [
                           "Las transferencias dependen de su fuerza y capacidad de colaboración. Pide una demostración presencial a un profesional antes de realizarlas. No levantes todo su peso ni tires de brazos o cuello.",
                           "Antes de cambiar de asiento, hay que valorar a la persona, el espacio y los apoyos. Si no puede colaborar o sientes que no puedes hacerlo con seguridad, detente y busca ayuda formada."
                       ],
        "pasos":  "Prepara un recorrido libre y consulta una técnica adaptada. No pruebes maniobras nuevas ni utilices una grúa sin formación y valoración.",
        "necesitas":  "Una valoración de movilidad, espacio suficiente y, si está indicado, equipo de apoyo y personas formadas.",
        "relacionadas":  [
                             "movilidad",
                             "silla_ruedas",
                             "cuidador"
                         ],
        "enlace":  null
    },
    {
        "id":  "andador",
        "categoria":  "movilidad",
        "titulo":  "Bastón y andador",
        "claves":  [
                       "andador",
                       "baston",
                       "muleta",
                       "muletas",
                       "ayuda tecnica caminar"
                   ],
        "ejemplos":  [
                         "Qué andador necesita",
                         "Cómo usar el bastón",
                         "Necesita muletas",
                         "Qué apoyo sirve para caminar",
                         "Cómo elegir una ayuda técnica"
                     ],
        "respuestas":  [
                           "La elección y ajuste de bastón o andador deben valorar su equilibrio, fuerza y entorno. Un profesional puede enseñar a usarlo y comprobar la altura adecuada.",
                           "No todos los apoyos sirven para todas las personas. Antes de comprar o cambiar un andador, consulta a fisioterapia o terapia ocupacional y revisa su estado de uso."
                       ],
        "pasos":  "Anota dónde le cuesta caminar y pide una prueba y ajuste profesional del dispositivo.",
        "necesitas":  "Valoración, medidas y entrenamiento; revisa también el espacio de casa.",
        "relacionadas":  [
                             "movilidad",
                             "accesibilidad",
                             "caidas"
                         ],
        "enlace":  null
    },
    {
        "id":  "silla_ruedas",
        "categoria":  "movilidad",
        "titulo":  "Uso de silla de ruedas",
        "claves":  [
                       "silla ruedas",
                       "silla de ruedas",
                       "reposapies",
                       "frenos silla"
                   ],
        "ejemplos":  [
                         "Cómo usar una silla de ruedas",
                         "Qué silla de ruedas elegir",
                         "Cómo revisar los frenos de la silla",
                         "Necesita reposapiés",
                         "Cómo preparar su silla para sentarse"
                     ],
        "respuestas":  [
                           "Una silla de ruedas debe ajustarse a la persona y a su entorno. Sigue las instrucciones de uso y pide formación para frenos, reposapiés y transferencias. No improvises traslados en escaleras.",
                           "Comprueba con un profesional que la silla permita una postura adecuada y los desplazamientos necesarios. Si causa dolor o marcas en la piel, solicita revisión."
                       ],
        "pasos":  "Revisa el manual y el estado del equipo; pide una demostración adaptada antes de hacer transferencias o superar desniveles.",
        "necesitas":  "Silla valorada y ajustada, recorrido accesible y formación de la persona y sus apoyos.",
        "relacionadas":  [
                             "transferencias",
                             "accesibilidad",
                             "piel"
                         ],
        "enlace":  null
    },
    {
        "id":  "caidas",
        "categoria":  "seguridad",
        "titulo":  "Prevenir caídas",
        "claves":  [
                       "caida",
                       "caidas",
                       "caerse",
                       "tropiezos",
                       "resbalar",
                       "evitar caer"
                   ],
        "ejemplos":  [
                         "Cómo prevenir caídas",
                         "Se tropieza mucho",
                         "Cómo evitar que se caiga",
                         "Consejos para no resbalar",
                         "Mi abuela tiene miedo a caerse"
                     ],
        "respuestas":  [
                           "Revisa iluminación, cables, alfombras sueltas y obstáculos. Facilita calzado estable y los apoyos indicados. Si hay caídas repetidas o mareos, consulta para valorar los factores de riesgo.",
                           "Puedes hacer una revisión de casa empezando por los recorridos habituales y el baño. Evita apoyos improvisados y pide una valoración si ha perdido estabilidad."
                       ],
        "pasos":  "Recorre la ruta cama-baño, despeja el paso y revisa luz y apoyos. Comenta las caídas o casi caídas con su equipo sanitario.",
        "necesitas":  "Luz suficiente, paso despejado y valoración de equilibrio y ayudas técnicas cuando proceda.",
        "relacionadas":  [
                             "caida_actual",
                             "bano_accesible",
                             "movilidad"
                         ],
        "enlace":  null
    },
    {
        "id":  "caida_actual",
        "categoria":  "seguridad",
        "titulo":  "Ha ocurrido una caída",
        "claves":  [
                       "se ha caido",
                       "se cayo",
                       "esta en el suelo",
                       "caido suelo",
                       "caida ahora"
                   ],
        "ejemplos":  [
                         "Mi padre se ha caído",
                         "Está en el suelo",
                         "Se cayó hace un momento",
                         "Qué hago después de una caída",
                         "Mi abuela se ha caído y no se levanta"
                     ],
        "respuestas":  [
                           "Después de una caída, no intentes levantarle a la fuerza. Comprueba si responde y si hay dolor o lesiones. Ante golpe en la cabeza, dolor importante, pérdida de conciencia o dificultad para moverse, contacta con atención urgente.",
                           "Quédate a su lado y evita moverle si sospechas una lesión. Si hay peligro actual o no responde, llama a emergencias de tu zona. Incluso sin lesión aparente conviene comentar la caída con su equipo de salud."
                       ],
        "pasos":  "Mantén la calma, comprueba cómo se encuentra y busca ayuda. Sigue las instrucciones del servicio sanitario y no improvises maniobras para levantarle.",
        "necesitas":  "Apoyo sanitario según los síntomas. Este chat no puede descartar una lesión.",
        "relacionadas":  [
                             "emergencia",
                             "caidas",
                             "movilidad"
                         ],
        "enlace":  null
    },
    {
        "id":  "accesibilidad",
        "categoria":  "accesibilidad",
        "titulo":  "Adaptar la vivienda",
        "claves":  [
                       "accesibilidad",
                       "adaptar casa",
                       "adaptar vivienda",
                       "barreras",
                       "rampa",
                       "puertas",
                       "pasillo"
                   ],
        "ejemplos":  [
                         "Cómo adaptar mi casa",
                         "Hay barreras en la vivienda",
                         "Necesita una rampa",
                         "Cómo mejorar la accesibilidad",
                         "Las puertas son estrechas"
                     ],
        "respuestas":  [
                           "Empieza por los recorridos más utilizados: entrada, dormitorio y baño. Despeja pasos y solicita una valoración de accesibilidad antes de instalar rampas o modificar apoyos.",
                           "Una vivienda accesible debe ajustarse a quien la usa. Terapia ocupacional o servicios sociales pueden orientar sobre adaptaciones y posibles recursos, sin que este chat garantice ayudas."
                       ],
        "pasos":  "Identifica dónde encuentra dificultades, toma nota y pide valoración antes de realizar obras o comprar dispositivos.",
        "necesitas":  "Información de los recorridos, necesidades de movilidad y asesoramiento técnico para instalaciones.",
        "relacionadas":  [
                             "bano_accesible",
                             "iluminacion",
                             "silla_ruedas"
                         ],
        "enlace":  null
    },
    {
        "id":  "bano_accesible",
        "categoria":  "accesibilidad",
        "titulo":  "Adaptar el baño",
        "claves":  [
                       "bano accesible",
                       "adaptar bano",
                       "barras",
                       "asideros",
                       "inodoro",
                       "wc"
                   ],
        "ejemplos":  [
                         "Cómo adaptar el baño",
                         "Dónde poner barras de apoyo",
                         "Necesita ayuda para usar el inodoro",
                         "Qué asideros necesita",
                         "Cómo hacer el baño accesible"
                     ],
        "respuestas":  [
                           "El baño requiere apoyos firmes, acceso despejado y superficies adecuadas. La posición de barras y altura de asiento deben valorarse según sus capacidades. Un toallero no es una barra de apoyo.",
                           "Antes de comprar elevadores o asientos, consulta qué necesita y comprueba su compatibilidad e instalación. Evita usar elementos sueltos como apoyo para levantarse."
                       ],
        "pasos":  "Observa las dificultades de entrada, aseo y uso del inodoro y pide una valoración del espacio y la instalación.",
        "necesitas":  "Medidas del baño y asesoramiento profesional para elegir e instalar apoyos seguros.",
        "relacionadas":  [
                             "ducha",
                             "transferencias",
                             "caidas"
                         ],
        "enlace":  null
    },
    {
        "id":  "iluminacion",
        "categoria":  "accesibilidad",
        "titulo":  "Iluminación y recorridos",
        "claves":  [
                       "iluminacion",
                       "luz",
                       "luces",
                       "oscuridad",
                       "noche bano",
                       "cables",
                       "alfombras"
                   ],
        "ejemplos":  [
                         "Qué iluminación necesita",
                         "Se levanta a oscuras",
                         "Hay cables por el pasillo",
                         "Qué hacer con las alfombras",
                         "Cómo iluminar el camino al baño"
                     ],
        "respuestas":  [
                           "Facilita luz en los recorridos y acceso cómodo a interruptores. Retira cables y objetos del paso y evita alfombras sueltas. Comprueba también que la iluminación no deslumbre.",
                           "Revisar el camino del dormitorio al baño es un buen comienzo. Asegura que se vea el suelo y que no tenga que buscar a oscuras interruptores o apoyos."
                       ],
        "pasos":  "Recorre la casa en los horarios habituales, identifica sombras y obstáculos y adapta la luz sin deslumbrar.",
        "necesitas":  "Iluminación accesible y suelos despejados; asesoramiento si necesita instalaciones nuevas.",
        "relacionadas":  [
                             "caidas",
                             "accesibilidad",
                             "sueno"
                         ],
        "enlace":  null
    },
    {
        "id":  "emociones",
        "categoria":  "emocional",
        "titulo":  "Bienestar emocional",
        "claves":  [
                       "bienestar emocional",
                       "emociones",
                       "triste",
                       "tristeza",
                       "animo",
                       "llora",
                       "desanimado",
                       "llorando",
                       "decaido",
                       "decaida",
                       "desanimada"
                   ],
        "ejemplos":  [
                         "Mi madre está triste",
                         "Cómo mejorar su ánimo",
                         "Llora a menudo",
                         "Consejos de bienestar emocional",
                         "Le veo desanimado"
                     ],
        "respuestas":  [
                           "Escucha sin restar importancia a lo que siente. Pregunta qué le ayudaría hoy y ofrece compañía o una actividad que elija. Si la tristeza persiste o afecta a su vida cotidiana, anima a consultar a un profesional.",
                           "Acompañar no exige tener todas las respuestas. Puedes escuchar, respetar silencios y mantener pequeños momentos agradables. No puedo diagnosticar lo que le ocurre."
                       ],
        "pasos":  "Busca un momento tranquilo, pregunta cómo se siente y escucha sin discutir ni apresurar soluciones.",
        "necesitas":  "Disponibilidad para escuchar y apoyo profesional si el malestar es persistente o intenso.",
        "relacionadas":  [
                             "soledad",
                             "actividades",
                             "comunicacion"
                         ],
        "enlace":  null
    },
    {
        "id":  "ansiedad",
        "categoria":  "emocional",
        "titulo":  "Preocupación y nervios",
        "claves":  [
                       "ansiedad",
                       "nervios",
                       "nervioso",
                       "nerviosa",
                       "preocupacion",
                       "miedo",
                       "angustia"
                   ],
        "ejemplos":  [
                         "Está muy nerviosa",
                         "Tiene ansiedad",
                         "Cómo acompañar cuando tiene miedo",
                         "Se preocupa todo el tiempo",
                         "Mi padre está angustiado"
                     ],
        "respuestas":  [
                           "Habla con calma y reduce estímulos que le resulten molestos. Pregunta qué le preocupa y ofrece acompañamiento sin imponerlo. Si es intenso, recurrente o aparece un cambio brusco, solicita valoración.",
                           "Puedes ayudar con un entorno tranquilo y explicando lo que va a ocurrir. Evita discutir sobre el miedo o prometer que no pasa nada; pregunta qué necesita."
                       ],
        "pasos":  "Escucha, ofrece una pausa y pregunta si prefiere compañía o tranquilidad. Consulta si el malestar continúa.",
        "necesitas":  "Un espacio tranquilo y atención profesional cuando el malestar sea intenso o mantenido.",
        "relacionadas":  [
                             "emociones",
                             "comunicacion",
                             "cuidador"
                         ],
        "enlace":  null
    },
    {
        "id":  "soledad",
        "categoria":  "acompanamiento",
        "titulo":  "Soledad y compañía",
        "claves":  [
                       "soledad",
                       "solo",
                       "sola",
                       "compania",
                       "acompanamiento",
                       "aislado",
                       "aislamiento"
                   ],
        "ejemplos":  [
                         "Mi abuela se siente sola",
                         "Cómo combatir la soledad",
                         "Necesita compañía",
                         "Está aislado",
                         "No tiene con quién hablar"
                     ],
        "respuestas":  [
                           "Pregunta qué tipo de compañía desea: una llamada, una visita breve o una actividad compartida. Acordad contactos regulares, respetando también sus momentos de intimidad.",
                           "La soledad no siempre se resuelve con más visitas. Escucha qué echa de menos y explorad actividades o apoyos comunitarios que le interesen."
                       ],
        "pasos":  "Acordad una llamada o visita con día y hora. Pregunta en servicios sociales por programas de acompañamiento disponibles.",
        "necesitas":  "Sus preferencias y una red de contactos o recursos comunitarios verificados en su zona.",
        "relacionadas":  [
                             "actividades",
                             "comunicacion",
                             "servicios"
                         ],
        "enlace":  null
    },
    {
        "id":  "actividades",
        "categoria":  "acompanamiento",
        "titulo":  "Actividades compartidas",
        "claves":  [
                       "actividades",
                       "entretenimiento",
                       "ocio",
                       "aburrimiento",
                       "aburre",
                       "pasatiempo",
                       "juegos",
                       "entretener",
                       "entretenido",
                       "aburrido",
                       "aburrida",
                       "aburrirse"
                   ],
        "ejemplos":  [
                         "Qué actividades podemos hacer",
                         "Se aburre en casa",
                         "Ideas de entretenimiento",
                         "Juegos para compartir",
                         "Cómo elegir un pasatiempo"
                     ],
        "respuestas":  [
                           "Elegid actividades que le gusten y pueda realizar con comodidad: música, fotografías, lectura compartida o una conversación. Ajusta duración y dificultad sin infantilizar.",
                           "Una actividad pequeña puede aportar conexión: escuchar su música, recordar historias o cuidar una planta. Lo importante es que la persona quiera participar."
                       ],
        "pasos":  "Ofrece dos propuestas, deja que elija y termina o cambia de actividad si se cansa.",
        "necesitas":  "Material sencillo, buena iluminación y conocer sus intereses y límites.",
        "relacionadas":  [
                             "soledad",
                             "emociones",
                             "autonomia"
                         ],
        "enlace":  null
    },
    {
        "id":  "comunicacion",
        "categoria":  "acompanamiento",
        "titulo":  "Hablar y escuchar",
        "claves":  [
                       "comunicacion",
                       "hablar",
                       "escuchar",
                       "conversar",
                       "entenderse",
                       "audicion",
                       "oye"
                   ],
        "ejemplos":  [
                         "Cómo hablar con mi abuelo",
                         "Le cuesta entenderme",
                         "Cómo comunicarme mejor",
                         "No oye bien",
                         "Cómo escuchar sin discutir"
                     ],
        "respuestas":  [
                           "Habla de frente, a un ritmo cómodo y con frases claras. Reduce el ruido, espera la respuesta y comprueba que os habéis entendido sin tratarle como a un niño.",
                           "Puedes facilitar la conversación haciendo una pregunta cada vez y dando tiempo. Si hay problemas de audición o comprensión nuevos, pide una revisión profesional."
                       ],
        "pasos":  "Busca un lugar tranquilo, llama su atención con respeto y plantea una sola idea antes de esperar.",
        "necesitas":  "Un entorno con poco ruido y las ayudas auditivas o de comunicación que tenga indicadas.",
        "relacionadas":  [
                             "autonomia",
                             "memoria",
                             "soledad"
                         ],
        "enlace":  null
    },
    {
        "id":  "memoria",
        "categoria":  "cuidados",
        "titulo":  "Olvidos y desorientación",
        "claves":  [
                       "memoria",
                       "olvidos",
                       "olvida",
                       "desorientacion",
                       "desorientado",
                       "demencia",
                       "alzheimer"
                   ],
        "ejemplos":  [
                         "Tiene muchos olvidos",
                         "Cómo acompañar a alguien con demencia",
                         "Mi madre se desorienta",
                         "Consejos si tiene Alzheimer",
                         "Olvida las cosas"
                     ],
        "respuestas":  [
                           "Mantén referencias sencillas y rutinas conocidas, sin discutir por cada olvido. Los cambios de memoria requieren valoración profesional; una confusión nueva o repentina necesita atención sanitaria urgente.",
                           "Las señales claras, un ambiente tranquilo y una tarea cada vez pueden ayudar. No puedo determinar la causa de los olvidos ni diagnosticar demencia."
                       ],
        "pasos":  "Usa recordatorios sencillos y guarda los objetos habituales en el mismo lugar. Consulta los cambios y solicita atención urgente si la confusión aparece de repente.",
        "necesitas":  "Rutinas conocidas, referencias claras y seguimiento del equipo sanitario.",
        "relacionadas":  [
                             "comunicacion",
                             "rutina",
                             "emergencia"
                         ],
        "enlace":  null
    },
    {
        "id":  "rutina",
        "categoria":  "rutinas",
        "titulo":  "Organizar el día",
        "claves":  [
                       "rutina",
                       "rutinas",
                       "organizar dia",
                       "horario",
                       "plan diario",
                       "agenda diaria",
                       "tareas"
                   ],
        "ejemplos":  [
                         "Cómo organizar el día",
                         "Necesito una rutina diaria",
                         "Ayuda con los horarios",
                         "Cómo planificar las tareas",
                         "Organizar mi día"
                     ],
        "respuestas":  [
                           "Prepara un horario flexible con aseo, comidas, actividad, descanso y tiempo propio. Elige lo prioritario y reparte lo que puedas; no hace falta llenar cada hora.",
                           "Una rutina útil se adapta a la persona. Anota qué necesita hoy, qué puede esperar y qué puedes compartir con alguien más."
                       ],
        "pasos":  "1. Anota tres prioridades.\n2. Reserva pausas.\n3. Asigna quién ayuda y cuándo.\n4. Revisa al final qué conviene cambiar.",
        "necesitas":  "Una libreta o calendario y acuerdos realistas con las personas que colaboran.",
        "relacionadas":  [
                             "reparto",
                             "sueno",
                             "alimentacion"
                         ],
        "enlace":  {
                       "url":  "recursos.html#organiza",
                       "texto":  "Ver ideas para organizarte"
                   }
    },
    {
        "id":  "sueno",
        "categoria":  "descanso",
        "titulo":  "Descanso y sueño",
        "claves":  [
                       "sueno",
                       "dormir",
                       "duerme",
                       "insomnio",
                       "desvelo",
                       "descanso nocturno",
                       "no puede dormir",
                       "despierta",
                       "despertares",
                       "despertar",
                       "no logra dormir"
                   ],
        "ejemplos":  [
                         "No puede dormir",
                         "Se despierta mucho por la noche",
                         "Cómo mejorar su sueño",
                         "Tiene insomnio",
                         "Consejos para descansar mejor"
                     ],
        "respuestas":  [
                           "Intenta mantener horarios regulares y un dormitorio confortable, con actividad diurna adaptada y un ambiente tranquilo al acostarse. Si los problemas persisten, consulta; no uses medicación para dormir sin indicación.",
                           "Observa qué interrumpe el descanso: ruido, molestias o necesidad de ir al baño. Un registro sencillo puede ayudar a comentarlo con el equipo sanitario."
                       ],
        "pasos":  "Anota horarios y despertares durante unos días, revisa el entorno y acuerda una rutina tranquila al acostarse.",
        "necesitas":  "Un entorno cómodo y conocer si hay molestias o pautas profesionales que afecten al sueño.",
        "relacionadas":  [
                             "iluminacion",
                             "rutina",
                             "respiro"
                         ],
        "enlace":  null
    },
    {
        "id":  "cuidador",
        "categoria":  "cuidadores",
        "titulo":  "Cuidarte mientras cuidas",
        "claves":  [
                       "cuidador",
                       "cuidadora",
                       "cuidarme",
                       "autocuidado",
                       "agotado",
                       "agotada",
                       "cansado",
                       "cansada",
                       "no puedo mas",
                       "no doy abasto"
                   ],
        "ejemplos":  [
                         "Estoy agotada de cuidar",
                         "Necesito cuidarme",
                         "No puedo más con todo",
                         "Estoy cansado",
                         "No doy abasto cuidando a mi padre"
                     ],
        "respuestas":  [
                           "Cuidar puede agotarte. Elige una necesidad tuya que no pueda esperar y pide ayuda concreta para cubrirla. Si el cansancio o malestar persisten, habla con tu profesional de salud.",
                           "Tu descanso forma parte del cuidado. No tienes que llevar todas las tareas sin apoyo: podemos pensar cómo repartirlas o buscar respiro."
                       ],
        "pasos":  "Anota qué tarea te sobrecarga, quién podría relevarte y qué pausa necesitas. Haz una petición concreta con un horario.",
        "necesitas":  "Una persona o servicio de apoyo y un acuerdo para que tu familiar siga acompañado cuando lo necesite.",
        "relacionadas":  [
                             "reparto",
                             "respiro",
                             "culpa"
                         ],
        "enlace":  {
                       "url":  "recursos.html#autocuidado",
                       "texto":  "Consultar autocuidado"
                   }
    },
    {
        "id":  "reparto",
        "categoria":  "cuidadores",
        "titulo":  "Repartir tareas y pedir ayuda",
        "claves":  [
                       "repartir",
                       "reparto",
                       "pedir ayuda",
                       "turnos",
                       "familia",
                       "hermanos",
                       "colaborar",
                       "delegar",
                       "hermanas",
                       "colaboraran",
                       "colaboren",
                       "colabore",
                       "compartir tareas",
                       "repartir responsabilidades"
                   ],
        "ejemplos":  [
                         "Cómo pedir ayuda a mi familia",
                         "Mis hermanos no colaboran",
                         "Cómo repartir las tareas",
                         "Necesito organizar turnos",
                         "Quiero delegar algunos cuidados"
                     ],
        "respuestas":  [
                           "Pide una tarea concreta con día y hora: «¿Puedes acompañarle el jueves por la tarde?». Un calendario compartido puede aclarar quién hace cada cosa y evitar que todo dependa de una persona.",
                           "Para repartir cuidados, separa tareas presenciales de otras como compras, gestiones o llamadas. Acordad responsabilidades realistas y revisad si se cumplen."
                       ],
        "pasos":  "Haz una lista de tareas, pregunta quién puede asumir cada una y deja por escrito los turnos y una alternativa ante imprevistos.",
        "necesitas":  "Una lista concreta, disponibilidad de cada persona y una forma sencilla de confirmar los acuerdos.",
        "relacionadas":  [
                             "rutina",
                             "respiro",
                             "domicilio"
                         ],
        "enlace":  {
                       "url":  "recursos.html#organiza",
                       "texto":  "Organizar los apoyos"
                   }
    },
    {
        "id":  "respiro",
        "categoria":  "cuidadores",
        "titulo":  "Descanso de la persona cuidadora",
        "claves":  [
                       "respiro",
                       "relevo",
                       "descansar cuidador",
                       "vacaciones",
                       "pausa",
                       "descanso cuidadora",
                       "releve",
                       "relevar",
                       "relevos",
                       "sustituir cuidador"
                   ],
        "ejemplos":  [
                         "Necesito un respiro",
                         "Quién puede relevarme",
                         "Cómo descansar de los cuidados",
                         "Necesito una pausa",
                         "Hay ayuda para poder irme unos días"
                     ],
        "respuestas":  [
                           "Puedes explorar relevo familiar, apoyo a domicilio o recursos de respiro disponibles en tu zona. Antes de ausentarte, acuerda quién cubre las necesidades y deja las pautas habituales accesibles.",
                           "Descansar requiere organizar la continuidad del cuidado. Trabajo social puede orientarte sobre opciones y requisitos; este chat no tramita reservas ni garantiza plazas."
                       ],
        "pasos":  "Define el tiempo de descanso, busca relevo y prepara contactos y rutinas para la persona que acompañe.",
        "necesitas":  "Un relevo adecuado a sus necesidades y consultar disponibilidad y condiciones del servicio.",
        "relacionadas":  [
                             "domicilio",
                             "centro_dia",
                             "reparto"
                         ],
        "enlace":  {
                       "url":  "recursos.html#autocuidado",
                       "texto":  "Cuidarte mientras cuidas"
                   }
    },
    {
        "id":  "culpa",
        "categoria":  "cuidadores",
        "titulo":  "Sentimiento de culpa",
        "claves":  [
                       "culpa",
                       "culpable",
                       "mala hija",
                       "mal hijo",
                       "egoista",
                       "egoísta"
                   ],
        "ejemplos":  [
                         "Me siento culpable por descansar",
                         "Creo que soy mala hija",
                         "Es egoísta pedir ayuda",
                         "Tengo culpa por no llegar a todo",
                         "Me siento mal por dejarlo con otra persona"
                     ],
        "respuestas":  [
                           "Necesitar descanso no reduce tu compromiso. Puedes reconocer ese sentimiento y revisar qué expectativas son realistas. Hablar con alguien de confianza o un profesional puede ayudarte si la culpa te limita.",
                           "Es frecuente exigirse más de lo que una persona puede sostener. Revisa qué necesita realmente tu familiar y qué apoyos os permitirían cuidar sin abandonar tus propias necesidades."
                       ],
        "pasos":  "Pon por escrito lo que sí estás haciendo, identifica una exigencia imposible y pide apoyo para una necesidad concreta.",
        "necesitas":  "Un espacio para hablar sin juicios y apoyo profesional si el malestar se mantiene.",
        "relacionadas":  [
                             "cuidador",
                             "reparto",
                             "respiro"
                         ],
        "enlace":  null
    },
    {
        "id":  "servicios",
        "categoria":  "servicios",
        "titulo":  "Encontrar servicios de asistencia",
        "claves":  [
                       "servicios",
                       "asistencia",
                       "recursos sociales",
                       "trabajo social",
                       "servicios sociales",
                       "ayuda disponible",
                       "ayuntamiento",
                       "ayudas sociales",
                       "ayudas disponibles",
                       "apoyos municipales"
                   ],
        "ejemplos":  [
                         "Qué servicios de asistencia existen",
                         "Dónde encontrar apoyo social",
                         "Cómo contactar con trabajo social",
                         "Qué ayudas hay para cuidar",
                         "Necesito recursos sociales"
                     ],
        "respuestas":  [
                           "Los servicios sociales de tu municipio pueden orientar sobre apoyos a domicilio, acompañamiento, centros y valoración de dependencia. La oferta y los requisitos varían según la zona.",
                           "Para conocer servicios adecuados, explica qué ayuda necesita la persona y en qué horarios. El centro de servicios sociales o trabajo social sanitario son puntos de orientación; aquí no dispongo de un directorio local actualizado."
                       ],
        "pasos":  "Anota las necesidades y consulta el canal oficial de tu ayuntamiento o comunidad autónoma para pedir orientación.",
        "necesitas":  "Necesidades de apoyo y canales oficiales de tu zona. No compartas documentos personales en este chat.",
        "relacionadas":  [
                             "domicilio",
                             "teleasistencia",
                             "valoracion"
                         ],
        "enlace":  null
    },
    {
        "id":  "domicilio",
        "categoria":  "servicios",
        "titulo":  "Ayuda a domicilio",
        "claves":  [
                       "ayuda domicilio",
                       "ayuda a domicilio",
                       "asistencia domiciliaria",
                       "cuidador domicilio",
                       "cuidadora domicilio",
                       "sad"
                   ],
        "ejemplos":  [
                         "Cómo pedir ayuda a domicilio",
                         "Qué es el SAD",
                         "Necesito asistencia domiciliaria",
                         "Busco una cuidadora para casa",
                         "Cómo contratar apoyo en casa"
                     ],
        "respuestas":  [
                           "La ayuda a domicilio puede apoyar tareas personales y cotidianas según el servicio y la valoración. Pregunta en servicios sociales por la vía pública o comprueba acreditación y condiciones de una entidad si buscas apoyo privado.",
                           "Antes de elegir apoyo en casa, define tareas, horarios y necesidades. Confirma qué incluye el servicio, quién lo presta y cómo se gestionan ausencias o incidencias."
                       ],
        "pasos":  "Prepara una lista de tareas y horarios y solicita información por canales oficiales o a entidades acreditadas.",
        "necesitas":  "Valoración de necesidades y condiciones por escrito; no puedo asignar personal ni confirmar precios o disponibilidad.",
        "relacionadas":  [
                             "servicios",
                             "valoracion",
                             "respiro"
                         ],
        "enlace":  null
    },
    {
        "id":  "teleasistencia",
        "categoria":  "servicios",
        "titulo":  "Teleasistencia",
        "claves":  [
                       "teleasistencia",
                       "pulsador",
                       "boton emergencia",
                       "colgante alarma"
                   ],
        "ejemplos":  [
                         "Qué es la teleasistencia",
                         "Cómo pedir un pulsador",
                         "Necesita un botón de emergencia",
                         "Cómo funciona el colgante de alarma",
                         "Quién ofrece teleasistencia"
                     ],
        "respuestas":  [
                           "La teleasistencia permite solicitar ayuda mediante un dispositivo o sistema conectado a un servicio. Consulta requisitos, cobertura y funcionamiento en tu zona; no sustituye todos los apoyos presenciales.",
                           "Antes de solicitar teleasistencia, pregunta cómo se activa, qué ocurre si no responde y qué instalación necesita. Comprueba que la persona puede y quiere utilizarla."
                       ],
        "pasos":  "Contacta con servicios sociales o un proveedor acreditado y solicita una explicación práctica del funcionamiento y los límites.",
        "necesitas":  "Información oficial del servicio, cobertura y formación para usar el dispositivo.",
        "relacionadas":  [
                             "servicios",
                             "soledad",
                             "caidas"
                         ],
        "enlace":  null
    },
    {
        "id":  "centro_dia",
        "categoria":  "servicios",
        "titulo":  "Centros de día",
        "claves":  [
                       "centro dia",
                       "centro de dia",
                       "centros de dia",
                       "centro diurno"
                   ],
        "ejemplos":  [
                         "Qué es un centro de día",
                         "Cómo buscar un centro diurno",
                         "Mi madre necesita centro de día",
                         "Qué preguntar a un centro de día",
                         "Hay centros para pasar el día acompañado"
                     ],
        "respuestas":  [
                           "Un centro de día puede ofrecer apoyo y actividades durante parte de la jornada. Valora si se adapta a sus necesidades, preferencias, transporte y horarios. Consulta requisitos y disponibilidad en servicios sociales.",
                           "Al explorar un centro de día, pregunta por los apoyos que presta, la participación de la persona y cómo se coordina con la familia. Este chat no conoce plazas ni precios actualizados."
                       ],
        "pasos":  "Solicita información, prepara preguntas y, si es posible, conoce el centro con la persona interesada.",
        "necesitas":  "Sus necesidades y preferencias, horarios, transporte y condiciones verificadas del centro.",
        "relacionadas":  [
                             "residencia",
                             "respiro",
                             "servicios"
                         ],
        "enlace":  null
    },
    {
        "id":  "residencia",
        "categoria":  "servicios",
        "titulo":  "Valorar atención residencial",
        "claves":  [
                       "residencia",
                       "residencial",
                       "residencias",
                       "ingreso centro"
                   ],
        "ejemplos":  [
                         "Cómo elegir una residencia",
                         "Necesita atención residencial",
                         "Qué preguntar antes de un ingreso",
                         "Buscamos residencias",
                         "Cómo valorar una residencia"
                     ],
        "respuestas":  [
                           "La decisión debe incluir a la persona y sus preferencias en la medida de lo posible. Compara apoyos, accesibilidad, trato, coordinación sanitaria y condiciones económicas. Trabajo social puede orientarte.",
                           "Antes de elegir una residencia, pregunta cómo se organiza la atención cotidiana, la comunicación con familiares y la participación de residentes. No dispongo de un listado verificado de plazas."
                       ],
        "pasos":  "Anota necesidades, visita opciones y solicita condiciones por escrito y un plan de atención adaptado.",
        "necesitas":  "Valoración de apoyos necesarios y datos oficiales de acreditación y condiciones del centro.",
        "relacionadas":  [
                             "centro_dia",
                             "autonomia",
                             "servicios"
                         ],
        "enlace":  null
    },
    {
        "id":  "valoracion",
        "categoria":  "servicios",
        "titulo":  "Solicitar valoración de dependencia",
        "claves":  [
                       "valoracion dependencia",
                       "grado dependencia",
                       "solicitar dependencia",
                       "reconocimiento dependencia",
                       "tramitar dependencia",
                       "solicitud dependencia"
                   ],
        "ejemplos":  [
                         "Cómo solicitar la dependencia",
                         "Qué es el grado de dependencia",
                         "Dónde pedir valoración de dependencia",
                         "Cómo tramitar el reconocimiento",
                         "Qué documentos pide la solicitud de dependencia"
                     ],
        "respuestas":  [
                           "La solicitud de reconocimiento de dependencia se consulta con la administración competente de tu comunidad autónoma o con servicios sociales. Los formularios y requisitos deben comprobarse en la sede oficial vigente.",
                           "Para iniciar el trámite, pide orientación a trabajo social y explica qué apoyos necesita la persona. No puedo asignar un grado ni garantizar prestaciones, importes o plazos."
                       ],
        "pasos":  "Localiza el procedimiento en la sede oficial, consulta la documentación vigente y solicita apoyo para completar la solicitud si lo necesitas.",
        "necesitas":  "El formulario y los documentos que indique la administración competente; evita enviar identificaciones o informes al chat.",
        "relacionadas":  [
                             "dependencia",
                             "servicios",
                             "domicilio"
                         ],
        "enlace":  null
    },
    {
        "id":  "medicacion",
        "categoria":  "salud",
        "titulo":  "Dudas sobre medicación",
        "claves":  [
                       "medicacion",
                       "medicamento",
                       "pastilla",
                       "dosis",
                       "tratamiento",
                       "medicina"
                   ],
        "ejemplos":  [
                         "Qué pastilla le puedo dar",
                         "Cómo organizar la medicación",
                         "Se ha olvidado una dosis",
                         "Puedo cambiar el tratamiento",
                         "Qué medicamento sirve para dormir"
                     ],
        "respuestas":  [
                           "No puedo recomendar fármacos, dosis ni cambios de tratamiento. Si hay una duda, una toma olvidada o un posible error, consulta al farmacéutico o al equipo sanitario con el nombre y la pauta delante.",
                           "Para organizar la medicación, sigue la pauta escrita y pide revisión si hay confusión. No tritures, dupliques ni suspendas una dosis por tu cuenta; pregunta a un profesional."
                       ],
        "pasos":  "Reúne la pauta actual fuera del chat y consulta la duda concreta. Si hay una posible intoxicación o peligro actual, contacta con atención urgente.",
        "necesitas":  "La pauta vigente y asesoramiento del farmacéutico o equipo sanitario.",
        "relacionadas":  [
                             "consulta",
                             "rutina",
                             "emergencia"
                         ],
        "enlace":  null
    },
    {
        "id":  "consulta",
        "categoria":  "salud",
        "titulo":  "Preparar una consulta profesional",
        "claves":  [
                       "consulta",
                       "medico",
                       "enfermeria",
                       "profesional",
                       "dolor",
                       "sintomas",
                       "diagnostico"
                   ],
        "ejemplos":  [
                         "Cómo preparar la consulta médica",
                         "Tiene dolor y no sé por qué",
                         "Necesito hablar con enfermería",
                         "Puedes decirme el diagnóstico",
                         "Qué contar al profesional"
                     ],
        "respuestas":  [
                           "Este chat no puede valorar síntomas ni diagnosticar. Para la consulta, anota qué ocurre, desde cuándo, si ha cambiado y cómo afecta a su día. Ante deterioro rápido o peligro actual, busca atención urgente.",
                           "Puedes llevar a la consulta una lista breve de dudas y cambios observados. Pide que te expliquen el plan y comprueba que sabes a quién llamar si empeora."
                       ],
        "pasos":  "Escribe cuándo empezó, qué has observado y tus preguntas principales. Lleva la información sanitaria que te hayan solicitado por un canal adecuado.",
        "necesitas":  "Contacto con su equipo sanitario; no hace falta compartir datos médicos identificativos aquí.",
        "relacionadas":  [
                             "medicacion",
                             "emergencia",
                             "mayores"
                         ],
        "enlace":  null
    },
    {
        "id":  "emergencia",
        "categoria":  "salud",
        "titulo":  "Peligro o cambio repentino",
        "claves":  [
                       "emergencia",
                       "urgente",
                       "no respira",
                       "no puede respirar",
                       "inconsciente",
                       "no responde",
                       "dolor pecho",
                       "de repente no puede andar",
                       "repente no puede caminar",
                       "confusion repentina",
                       "se ahoga"
                   ],
        "ejemplos":  [
                         "No puede respirar",
                         "Está inconsciente",
                         "No responde",
                         "De repente no puede andar",
                         "Tiene dolor en el pecho"
                     ],
        "respuestas":  [
                           "Si hay peligro actual, dificultad para respirar, pérdida de conciencia o un cambio brusco importante, contacta inmediatamente con emergencias de tu zona. No esperes una respuesta de este chat y sigue las instrucciones del personal sanitario.",
                           "Un cambio repentino importante necesita atención urgente. Busca ayuda sanitaria ahora si está ocurriendo y no intentes resolverlo con consejos generales del chat."
                       ],
        "pasos":  "Contacta con el servicio de emergencias de tu zona y explica lo que observas, dónde está la persona y cuándo empezó. Sigue sus instrucciones.",
        "necesitas":  "Ayuda sanitaria urgente; este asistente no puede evaluar la gravedad ni sustituir a emergencias.",
        "relacionadas":  [
                             "consulta",
                             "caida_actual"
                         ],
        "enlace":  null
    },
    {
        "id":  "tutoriales",
        "categoria":  "web",
        "titulo":  "Ver tutoriales",
        "claves":  [
                       "tutoriales",
                       "tutorial",
                       "video",
                       "videos",
                       "videoteca"
                   ],
        "ejemplos":  [
                         "Dónde están los tutoriales",
                         "Quiero ver vídeos",
                         "Cómo entrar en la videoteca",
                         "Hay tutoriales de higiene",
                         "Ver tutoriales"
                     ],
        "respuestas":  [
                           "En Tutoriales puedes explorar los temas y filtrarlos. Los vídeos todavía están en preparación; las miniaturas anuncian contenidos y no son reproductores.",
                           "La sección Tutoriales reúne temas previstos sobre cuidados diarios. Mientras se preparan los vídeos, puedes consultar los recursos escritos."
                       ],
        "pasos":  "Abre Tutoriales y usa los filtros por tema. Para información disponible ahora, entra en Recursos.",
        "necesitas":  "No necesitas registro para consultar estas secciones.",
        "relacionadas":  [
                             "recursos_web",
                             "higiene",
                             "movilidad"
                         ],
        "enlace":  {
                       "url":  "tutoriales.html",
                       "texto":  "Explorar Tutoriales"
                   }
    },
    {
        "id":  "recursos_web",
        "categoria":  "web",
        "titulo":  "Consultar Recursos",
        "claves":  [
                       "recursos web",
                       "ver recursos",
                       "seccion recursos",
                       "preguntas frecuentes",
                       "faq",
                       "recursos cuidapoyo",
                       "recursos escritos",
                       "textos web",
                       "guias escritas"
                   ],
        "ejemplos":  [
                         "Dónde están los recursos de la web",
                         "Ver recursos",
                         "Cómo abrir las preguntas frecuentes",
                         "Qué hay en la sección Recursos",
                         "Recursos CuidApoyo"
                     ],
        "respuestas":  [
                           "En Recursos encontrarás apartados para organizar tu día, cuidarte y resolver preguntas frecuentes. Los desplegables se abren al pulsar su título.",
                           "Puedes entrar en Recursos desde el menú superior. Allí tienes orientación escrita y preguntas frecuentes disponibles sin registro."
                       ],
        "pasos":  "Abre Recursos y pulsa un título desplegable para leer el contenido.",
        "necesitas":  "Navegador y conexión para abrir la web; no necesitas una cuenta.",
        "relacionadas":  [
                             "tutoriales",
                             "rutina",
                             "cuidador"
                         ],
        "enlace":  {
                       "url":  "recursos.html#dudas",
                       "texto":  "Leer preguntas frecuentes"
                   }
    },
    {
        "id":  "contacto",
        "categoria":  "web",
        "titulo":  "Contacto con CuidApoyo",
        "claves":  [
                       "contacto",
                       "contactar",
                       "correo",
                       "email",
                       "equipo cuidapoyo",
                       "escribir equipo",
                       "creadoras",
                       "escribir web",
                       "contactar web"
                   ],
        "ejemplos":  [
                         "Cómo contactar con CuidApoyo",
                         "Cuál es el correo",
                         "Quiero escribir al equipo",
                         "Dónde está Contacto",
                         "Puedo enviar un email"
                     ],
        "respuestas":  [
                           "El canal de contacto con el equipo todavía no está configurado. El antiguo botón Contacto ahora abre Mi cuenta, donde puedes organizar tus perfiles y tareas locales; no envía mensajes al equipo.",
                           "La web todavía no ofrece un canal de contacto operativo. Mi cuenta permite gestionar cuidados en este navegador, pero no envía consultas al equipo ni ofrece recuperación por correo."
                       ],
        "pasos":  "Puedes consultar los recursos públicos o abrir Mi cuenta desde la cabecera para organizar tus cuidados.",
        "necesitas":  "Por ahora no hay un correo operativo publicado en esta web.",
        "relacionadas":  [
                             "inicio_web",
                             "privacidad",
                             "servicios"
                         ],
        "enlace":  {
                       "url":  "index.html#contacto",
                       "texto":  "Consultar el apartado Contacto"
                   }
    },
    {
        "id":  "inicio_web",
        "categoria":  "web",
        "titulo":  "Navegar por CuidApoyo",
        "claves":  [
                       "inicio web",
                       "pagina principal",
                       "volver inicio",
                       "menu web",
                       "navegar",
                       "sobre nosotras",
                       "que es cuidapoyo"
                   ],
        "ejemplos":  [
                         "Cómo volver al inicio",
                         "Qué es CuidApoyo",
                         "Dónde está el menú de la web",
                         "Cómo navegar por la página",
                         "Quiero leer sobre nosotras"
                     ],
        "respuestas":  [
                           "CuidApoyo ofrece orientación y recursos para personas cuidadoras. El menú lleva a Inicio, Tutoriales, Recursos y este chat. En móvil, pulsa el botón de menú de la cabecera.",
                           "Puedes volver a Inicio con el logotipo o el enlace del menú. En esa página también encontrarás información sobre el proyecto."
                       ],
        "pasos":  "Pulsa el logotipo para volver a Inicio. En móvil, abre el menú superior para ver las secciones.",
        "necesitas":  "No necesitas registro; puedes cambiar entre páginas desde la cabecera.",
        "relacionadas":  [
                             "tutoriales",
                             "recursos_web",
                             "contacto"
                         ],
        "enlace":  {
                       "url":  "index.html",
                       "texto":  "Ir a Inicio"
                   }
    },
    {
        "id":  "tema_web",
        "categoria":  "web",
        "titulo":  "Cambiar el aspecto de la web",
        "claves":  [
                       "modo oscuro",
                       "modo claro",
                       "tema oscuro",
                       "tema claro",
                       "cambiar tema",
                       "luna",
                       "contraste"
                   ],
        "ejemplos":  [
                         "Cómo activar el modo oscuro",
                         "Quiero el modo claro",
                         "Para qué sirve la luna",
                         "Cómo cambiar el tema",
                         "Puedo cambiar el contraste de la web"
                     ],
        "respuestas":  [
                           "El botón de luna o sol en la cabecera cambia entre modo claro y oscuro. La web recuerda esa elección en este navegador cuando el almacenamiento local está disponible.",
                           "Puedes usar el botón junto al menú para cambiar el tema. También puedes ampliar la página con el zoom del navegador para leer más cómodamente."
                       ],
        "pasos":  "Pulsa el botón de tema en la cabecera. Para ampliar, utiliza los controles de zoom del navegador.",
        "necesitas":  "Un navegador; el chat conserva botones y texto adaptados a ambos temas.",
        "relacionadas":  [
                             "inicio_web",
                             "privacidad",
                             "capacidades"
                         ],
        "enlace":  null
    },
    {
        "id":  "privacidad",
        "categoria":  "web",
        "titulo":  "Privacidad y memoria del chat",
        "claves":  [
                       "privacidad",
                       "datos",
                       "guardar conversacion",
                       "memoria chat",
                       "borra",
                       "borrar",
                       "servidor",
                       "api"
                   ],
        "ejemplos":  [
                         "Se guarda la conversación",
                         "Qué haces con mis datos",
                         "Cómo borrar el chat",
                         "Envías mis mensajes a un servidor",
                         "Recuerdas mis preguntas"
                     ],
        "respuestas":  [
                           "Los mensajes se procesan en esta página y no se envían a un servidor del chat. Solo recuerdo el tema durante la conversación abierta; Nueva conversación o recargar elimina ese contexto. Evita compartir datos identificativos.",
                           "Este asistente no usa una API externa ni guarda mensajes en almacenamiento local. Mi cuenta sí guarda perfiles y tareas de prueba en este navegador. Solo adapto las sugerencias a categorías de apoyo si lo autorizas. Las fuentes tipográficas se cargan desde Google Fonts."
                       ],
        "pasos":  "Pulsa Nueva conversación para borrar los mensajes y el contexto. Recargar la página también los elimina.",
        "necesitas":  "No necesito nombres, documentos, teléfonos ni historias clínicas identificativas.",
        "relacionadas":  [
                             "capacidades",
                             "tema_web",
                             "inicio_web"
                         ],
        "enlace":  null
    }
];
})(typeof window !== 'undefined' ? window : globalThis);
