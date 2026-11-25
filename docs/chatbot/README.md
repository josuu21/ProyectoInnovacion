# Resuelve: mantenimiento y pruebas

## Ubicación actual

Las rutas de esta documentación parten de la raíz del repositorio.
Página: `html/chatbot.html`. Módulos: `js/chatbot/`.
Pruebas HTML: `html/pruebas/chatbot/pruebas.html`. Scripts de pruebas: `js/pruebas/chatbot/`.
El estilo compartido y el script común están en `css/styles.css` y `js/script.js`.


La web usa HTML, CSS y JavaScript sin compilación, dependencias nuevas ni APIs.
El chatbot se carga únicamente en html/chatbot.html. script.js conserva menú,
tema visual, recursos desplegables y filtros de tutoriales.

## Archivos

- conocimiento.js: 53 intenciones en 15 categorías; 265 ejemplos, dos respuestas
  por intención, pasos, necesidades, relacionadas y enlaces internos opcionales.
- motor.js: normalización, sinónimos, distancia de edición con transposiciones, puntuación con
  frecuencia de términos, negaciones por cláusula, desambiguación y contexto.
- interfaz.js: DOM seguro mediante textContent, temporizador cancelable,
  indicador de escritura, opciones dinámicas, foco y desplazamiento.
- pruebas.html: pruebas reproducibles del motor y de la interfaz real.
  Abrir mediante el servidor local habitual. Para abrir directamente como
  archivo, algunos navegadores necesitan permitir lectura entre archivos locales
  para la prueba de iframes; la página chatbot.html no necesita ese permiso.

## Añadir contenido

Crea un objeto con id único, categoria, titulo, claves (incluye sinónimos y
expresiones coloquiales), al menos cinco ejemplos, al menos dos respuestas,
pasos, necesitas, relacionadas (ids existentes) y enlace opcional.
Comprueba que el enlace y su ancla existen en el proyecto.
Añade sinónimos morfológicos al motor cuando haga falta y un caso de regresión
a pruebas.js. No copies instrucciones clínicas sin revisión profesional.

## Reconocimiento y límites

La puntuación combina términos distintivos, coincidencias de frases, cobertura
de ejemplos y sinónimos. Tolera intercambios de letras adyacentes y hasta una edición en palabras de cinco letras
o más y dos en palabras largas (mínimo nueve letras). La corrección es
conservadora y puede confundir palabras cercanas: no es un modelo de lenguaje.
El sistema pregunta si hay poco respaldo o dos temas con puntuaciones similares.

Las negaciones excluyen cláusulas como «no quiero hablar de movilidad» y
«no está triste», pero conservan limitaciones como «no puede andar»,
«no quiere comer» y «no tiene hambre». No se promete comprender cualquier
negación compleja, ironía ni información implícita.

Los seguimientos genéricos usan el último tema útil; saludos y agradecimientos
no lo sustituyen. La memoria y las variantes se borran al reiniciar o recargar.
Una aclaración pendiente requiere elegir antes de ampliar. Las señales de
peligro con puntuación suficiente tienen prioridad sobre contexto y botones.
Nunca se ofrecen diagnósticos, dosis ni técnicas de traslado individualizadas.

## Accesibilidad y privacidad

Texto de al menos 16 px, controles de 48 px, foco visible, log desplazable con
teclado, anuncios de estado, dos temas, diseño móvil y movimiento reducido.
Si se está leyendo arriba, la respuesta no arrastra la lectura: aparece
«Leer nuevos mensajes». Un reinicio cancela respuestas pendientes.
No se usa innerHTML con mensajes, almacenamiento de conversaciones, fetch
ni telemetría. Se mantiene la carga de Google Fonts ya existente en la web.

## Fuentes de referencia

Revisadas el 24 de noviembre de 2026. Orientación general adaptada, no una
validación clínica exhaustiva de la base.

- Prevención de caídas: CDC, https://www.cdc.gov/falls/prevention/
- Autocuidado y apoyo al cuidador: NIA,
  https://www.nia.nih.gov/health/caregiving/taking-care-yourself-tips-caregivers
- Dificultad para tragar y necesidad de valoración: NHS,
  https://www.nhs.uk/symptoms/swallowing-problems-dysphagia/
- Servicios de apoyo: Imserso,
  https://sede.imserso.gob.es/es/web/imserso/autonomia-personal-dependencia/sistema-autonomia-atencion-dependencia-saad/preguntas-frecuentes/prestaciones-atencion-dependencia/criterios-generales

No se incluyen números, importes, plazas, plazos ni requisitos locales que
puedan quedar desactualizados. Las respuestas remiten a canales oficiales.
Los vídeos y el correo de contacto se describen como no operativos, de
acuerdo con el estado real del proyecto.

## Integración con Mi cuenta

`js/cuenta/integraciones.js` añade sugerencias para las categorías de apoyo del
perfil activo solo tras permiso explícito. Nunca envía nombres, edad, notas,
registros ni credenciales al motor. El permiso se guarda en la cuenta y se
puede retirar en el chat o en Configuración. La conversación sigue sin guardarse.
Los enlaces públicos `chatbot.html?tema=<id>` abren una intención existente
cuando el usuario elige ese recurso. No incluyen el perfil en la URL.
El evento `cuida-chat-sugerencia` reutiliza el mismo flujo de respuestas,
indicador de carga y prioridades del motor; no crea una segunda base.