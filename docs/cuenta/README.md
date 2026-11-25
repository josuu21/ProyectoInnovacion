# Mi espacio de cuidado

## Ubicación actual

Las rutas de esta documentación parten de la raíz del repositorio.
Página: `html/mi-cuenta.html`. Módulos: `js/cuenta/`.
Estilos: `css/cuenta.css`. Pruebas: `pruebas/cuenta/`.


Abrir `html/mi-cuenta.html` con Live Server, sin instalación ni compilación.
El calendario se abre ahora en la misma pestaña para conservar sessionStorage.

## Archivos

- `js/cuenta/acceso.js`: navegación y estado de acceso comunes.
- `datos.js`: repositorio local, PBKDF2, migración y adaptador de agenda.
- `ui.js`: campos accesibles, escape de texto y SVG propios.
- `panel.js`: acceso, las cuatro secciones, tareas, registros y ajustes.
- `sencillo.js`: ocho tarjetas de ayuda, tres niveles y conversión de borradores anteriores.
- `catalogo.js`: contenidos existentes y temas de la base del chatbot.
- `integraciones.js`: favoritos públicos, contexto de agenda y permiso del chat.
- `cuenta.css`: diseño claro/oscuro, móvil, foco y movimiento reducido.
- `pruebas/`: pruebas de datos y recorridos de navegador sin dependencias.

## Modelo y migración

Se conservan `cuidapoyo-cuentas-v1` y `cuidapoyo-sesion-v1`. Cada cuenta usa
`version: 2` con nombre, sal, derivado, personas, persona activa, datos del
cuidador, bienestar por fecha, consentimiento del chat y borrador del asistente.
El antiguo `profile` se transforma al leer y se persiste al iniciar sesión o
modificar. Conserva nombre, edad, relación, objetivo y categorías anteriores.
Higiene/vestimenta y compañía/comunicación se desdoblan en las nuevas categorías.
Se conservan la sal y el derivado PBKDF2-SHA256 de 210.000 iteraciones.
Las claves anteriores de 8 caracteres funcionan; las nuevas usan de 10 a 128.

Cada persona tiene necesidades con frecuencia, preferencias, organización,
agenda, seguimiento por fecha, favoritos y temas consultados/vistos.
El bienestar pertenece al cuidador, separado de las personas.

## Calendario y contenidos

Panel y calendario usan exactamente `persona.agenda`, con el contrato existente
`{version: 1, tasks: []}` y las funciones de `js/calendario/datos.js`. No se crea una
segunda lista de tareas. Se conserva la interfaz del calendario y su importador.
Las tareas propuestas en versiones anteriores conservan sus ids y sus datos.
Las repeticiones son ocurrencias explícitas durante el periodo elegido.

La agenda sin cuenta, `cuidapoyo-agenda-v1`, se conserva sin asignarla a nadie.
Para trasladarla a una persona, exportar sin sesión e importar desde el calendario
de ese perfil. El importador conserva los ids existentes y evita duplicarlos.
El modo estricto del adaptador impide guardar temporalmente tras cambiar de perfil.

El chat no recibe nombres, edades, notas, registros o contraseñas del perfil.
Con consentimiento solo muestra botones de sus intenciones existentes para las
categorías seleccionadas. El permiso puede retirarse. Elegir un enlace público
al chat abre solo ese tema, sin transmitir el perfil.
Los vídeos aún no existen: se guardan temas y se marcan consultados. El soporte
para vistos se activa cuando se incorporen vídeos reales y se marque su entrada
de catálogo como disponible. No se inventan visualizaciones ni datos clínicos.

## Privacidad y limitaciones

Prototipo solo para datos ficticios. localStorage NO es autenticación segura para
producción ni protege los datos ante alguien con acceso al navegador. No hay
cifrado de perfiles ni copias, recuperación por correo, sincronización entre
dispositivos ni alarmas con la página cerrada. No incluir datos sanitarios sensibles.
Las escrituras exactamente simultáneas entre pestañas todavía pueden competir.

Las variables se escapan al renderizar. El chat sigue usando textContent.
Los cambios solo se confirman tras guardarse. Los datos corruptos no se
sobrescriben; se puede descargar el original para recuperación manual.
La exportación de cuenta no contiene sal ni derivados de contraseña. No hay
importación completa de cuentas; el calendario mantiene su importador de tareas.
Eliminar cuenta borra sus perfiles, tareas, preferencias y registros; conserva
las demás cuentas y la agenda utilizada sin sesión.

## Futuro backend PHP

Sustituir `crearRepositorio` por un cliente de API con los mismos métodos de
dominio. El servidor deberá verificar sesión y propiedad de cada perfil en cada
operación, derivar contraseñas en servidor y usar cookies HttpOnly/Secure/SameSite.
Añadir transacciones, control de concurrencia, recuperación de acceso y políticas
de privacidad antes de datos reales. No confiar en el email o id del cliente
como autorización.

## Pruebas reproducibles

Con Node 22+:

    node pruebas/cuenta/datos.cjs
    node pruebas/cuenta/navegador.cjs

El segundo script usa Chrome de Windows en su ruta habitual: adaptar para otro SO.
Arranca un servidor solo en loopback y un perfil temporal sin usar el perfil
habitual. Usa CDP y módulos nativos; no instala paquetes. Cierra el navegador y
servidor al finalizar. Guarda capturas e informes en `pruebas/cuenta/resultados/`.
El perfil desechable queda en Temp y no contiene datos reales.

Las pruebas de datos cubren credenciales, separación, persistencia, migración,
calendario, cuotas/permisos, corrupción, exportación, borrado y escape XSS.
El navegador cubre formularios reales, teclado, tres pasos, datos anteriores,
bienestar, favoritos, calendario, consentimiento, varias personas, borradores,
móvil y modo oscuro. Ejecuta también los harness anteriores del calendario
y del chatbot.
No se ha hecho una auditoría WCAG completa ni pruebas con lectores de pantalla
reales. Se comprueban etiquetas, foco, diálogos, avisos, teclado y desbordamiento.
Las pruebas detectan excepciones JS; Google Fonts se bloquea durante QA para
no depender de conexiones externas.
## Resultado de la verificación del 25 de noviembre de 2026

- 21 pruebas de datos: correctas.
- 20 recorridos/comprobaciones del navegador simplificado: correctos.
- Regresión del calendario: 111 comprobaciones, 0 fallos.
- Regresión del motor del chatbot: 423 pruebas, 0 fallos.
- Regresión de su interfaz: 30 pruebas, 0 fallos.
- Cero excepciones de JavaScript en los recorridos de Chrome.
- Sintaxis comprobada de los archivos JavaScript del proyecto.
- Capturas de acceso, tarjetas del asistente y panel en escritorio y móvil oscuro.
- Cuatro destinos visibles en móvil y tablet; sin desbordamiento a 320, 390 y 768 px.

Los informes JSON y las capturas de esta ejecución están en `pruebas/cuenta/resultados/`.
## Experiencia simplificada

El menú principal solo ofrece Mi espacio, Persona a mi cuidado, Mis tareas y
Mi bienestar. Mi cuenta y ajustes es un enlace independiente. Las URL anteriores
siguen admitidas para no romper enlaces guardados; no añaden destinos al menú.

Después del registro o inicio de sesión se entra directamente en Mi espacio.
La configuración de la persona es opcional: nombre/edad/parentesco, ocho tarjetas
de apoyo y tres opciones de ayuda. Los borradores de cinco pasos se pueden retomar
empezando por los datos de la persona, conservando su contenido adicional.

El modelo de datos no se cambia ni se borran campos al simplificar. Al modificar
se conservan frecuencias anteriores, preferencias, rutinas, tareas, favoritos y
registros. Comer y beber agrupa alimentación e hidratación en pantalla, pero no
añade nuevas categorías al editar una selección antigua que ya existía.

El inicio muestra saludo, persona, pendientes de hoy, dos recomendaciones y un
consejo de autocuidado. Los recursos guardados quedan en un desplegable secundario.
No hay gráficos ni porcentajes. Las tareas solo piden nombre, fecha y hora opcional;
las repeticiones y los pasos siguen disponibles en el calendario. Una edición
rápida conserva notas, categoría, estado y pasos anteriores.

En Persona a mi cuidado, las opciones secundarias permiten gestionar otras personas,
consultar la información antigua y abrir las anotaciones previas. El diario de
bienestar es voluntario y empieza cerrado. Se mantienen exportación, cambio de
contraseña, eliminación con confirmación y el aviso de prototipo local.