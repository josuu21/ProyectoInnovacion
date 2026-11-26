# Comunidad de CuidApoyo

Comunidad incorpora cuentas sociales reales, contactos mediante solicitudes y chat privado entre dispositivos que acceden al **mismo servidor**. Se integra en las seis páginas y en Mi cuenta. No requiere Firebase, Supabase, npm ni cuentas externas.

## Puesta en marcha local

Desde la raíz del proyecto, en PowerShell:

```powershell
& C:/xampp/php/php.exe -S 127.0.0.1:8085 servidor/router.php
```

Abre `http://127.0.0.1:8085/html/comunidad.html`. PHP necesita PDO SQLite y mbstring (ambos disponibles en el XAMPP encontrado). También puedes usar `php -S 127.0.0.1:8085 servidor/router.php` si PHP está en PATH. Live Server sirve la parte estática, pero **no ejecuta Comunidad**.

La base se crea automáticamente en `servidor/datos/comunidad.sqlite`, ignorada por Git. El router impide descargar datos, documentos, pruebas, archivos ocultos y código interno. `servidor/.htaccess` bloquea ese directorio al servir con Apache y AllowOverride habilitado.

Para producción usa PHP actualizado, Apache/Nginx con HTTPS, y configura `CUIDAPOYO_DATA_DIR` con una carpeta escribible **fuera de la raíz pública**. Deniega archivos ocultos y directorios internos también en el servidor web. No uses el servidor integrado de PHP como alojamiento público. Haz copias de SQLite con el servidor detenido o mediante su API de backup. Si HTTPS termina en un proxy, configura `CUIDAPOYO_SECURE_COOKIE=1` en el proceso PHP; no se confía automáticamente en cabeceras reenviadas.

## Probar con dos cuentas y dos dispositivos

1. Abre Comunidad en un navegador normal y en otro navegador/perfil independiente. Dos pestañas normales comparten la misma cookie; no sirven para mantener dos cuentas a la vez.
2. Marca «Quiero crear una cuenta de Comunidad» y registra a Ana. En el otro navegador registra a Bea, con correo y usuario diferentes.
3. Bea abre «Mi perfil y QR» y copia su código. Ana abre «Personas», busca por nombre, usuario o código y pulsa «Añadir contacto».
4. Bea ve la solicitud automáticamente y la acepta. Las dos abren la conversación y envían mensajes. Comprueba emojis, horas, no leídos y «Leído».
5. Cierra la sesión social y vuelve a entrar: se conservan contactos y mensajes.
6. Prueba bloquear desde Personas o el chat, desbloquear desde Personas, y eliminar una conversación de tu propia vista. La otra persona conserva su historial; un mensaje nuevo hace reaparecer la conversación. Abrirla desde Contactos recupera el historial completo.
7. Abre otra sección: el enlace Comunidad muestra los mensajes pendientes y aparece un aviso si llega otro mensaje.

Para dos ordenadores de la misma red, inicia con `-S 0.0.0.0:8085` y abre `http://IP-DEL-SERVIDOR:8085` desde el segundo dispositivo. Autoriza el puerto en el firewall solo para la red privada. El servidor debe seguir encendido. La cámara, copiar al portapapeles y compartir requieren un contexto seguro: usa **HTTPS para acceder desde móviles**; localhost sirve para probar en el propio equipo. Sin cámara o permisos, siempre puedes introducir el código.

## Funcionalidades y decisiones

- Identificador interno, usuario único, código aleatorio de 64 bits y QR automático. Búsqueda limitada a perfiles sociales públicos (nunca correos ni datos de cuidados).
- Solicitudes: enviar, aceptar, rechazar, cancelar; no admite solicitudes propias, duplicadas o cruzadas pendientes. Se necesita aceptación para abrir y enviar mensajes.
- Mensajes persistentes con consulta automática cada 1,8 segundos; avisos en otras páginas cada 8 segundos. Es actualización mediante polling, sin WebSocket ni proveedor externo; la latencia depende de la red. Historial en lotes de 100 con «Ver mensajes anteriores».
- Fecha/hora local del dispositivo, último mensaje, contador de no leídos y lectura cuando el chat está abierto en una pestaña visible. La confirmación significa que el navegador mostró el chat; no acredita lectura humana.
- Avatares elegibles, nombre visible, usuario, descripción opcional y código/QR en el perfil social. Copiar y compartir con alternativa manual.
- Bloqueos en ambos sentidos, desbloqueo solo del propio bloqueo, eliminación de la propia vista, emojis y borradores temporales por conversación.
- Escritorio con dos columnas; conversación a pantalla completa en móvil, teclado, foco visible, diálogos nativos, estados vacíos, errores y reducción de movimiento.
- Contraseñas con hash SHA-256 previo a password_hash de PHP para evitar el truncamiento de bcrypt en claves largas; nunca se guarda la contraseña ni el SHA-256 intermedio. Cookies HttpOnly/SameSite Strict/Secure con HTTPS; token de sesión aleatorio guardado como hash, caducidad a los siete días y revocación al salir. CSRF, comprobación de origen, consultas preparadas, límites de tamaño/intentos/envíos y autorización por participante para cada operación. Reintentos de mensajes con identificador idempotente.

## Cuentas existentes: separación explícita

**El acceso de Comunidad es independiente del prototipo de Mi cuenta.** Las cuentas locales anteriores no se convierten automáticamente en cuentas de servidor: la validación local no puede demostrar identidad al servidor. Registra una cuenta social incluso si ya usabas Mi cuenta. Puedes usar el mismo correo, pero ambas contraseñas y sesiones son independientes. Cerrar sesión o eliminar la cuenta local no cierra ni elimina la cuenta social, y salir de Comunidad no cierra el espacio local.

Los perfiles de dependientes, calendario, seguimiento y bienestar conservan su funcionamiento y almacenamiento originales. No hay migración, sincronización ni transferencia de estos datos al backend. Las cuentas sociales no incluyen recuperación por correo, verificación de email ni eliminación desde interfaz; esas funciones no forman parte de esta implementación. Los mensajes se almacenan en el servidor sin cifrado de extremo a extremo. La configuración del alojamiento y su información de privacidad deben completarse antes de publicar.

## Archivos

- `api/comunidad.php`: autenticación, esquema SQLite, perfiles y operaciones autorizadas.
- `servidor/router.php`, `.htaccess`, `.gitignore`: servidor local y protección de almacenamiento.
- `html/comunidad.html`: página integrada con los elementos comunes existentes.
- `js/comunidad/interfaz.js`: interacción social, mensajes, perfil y cámara.
- `js/comunidad/notificaciones.js`: avisos en el resto de páginas.
- `css/comunidad.css`: estilos, tema oscuro y vista móvil.
- `js/comunidad/vendor/`: generador QR y lector jsQR locales, con licencias MIT (generador) y Apache 2.0 (lector).
- `pruebas/comunidad/api.php`, `navegador.cjs`: pruebas HTTP y Chrome.
- Las seis páginas existentes: enlaces de navegación, acceso desde Mi cuenta, avisos y textos de privacidad; sin modificar sus módulos de datos.

## Verificación y límites

Se verificaron 30 comprobaciones HTTP con tres sesiones independientes: registro, búsqueda, solicitudes, duplicados, permisos, CSRF, envío bidireccional, idempotencia, lectura, bloqueo, desbloqueo, ocultación, recuperación tras login y archivos internos inaccesibles.

Se verificaron 12 pruebas de Chrome con dos contextos aislados: registro, QR generado y decodificado, solicitudes, actualización automática, lectura, emojis, escape de HTML, móvil de 390 px sin desbordamiento, cámara denegada, desconexión y recuperación, persistencia tras login y notificaciones en Recursos. Capturas e informe se guardan en `pruebas/comunidad/resultados/` (ignorados).

Pendientes de pruebas reales: cámara física/iluminación, permisos y compartir en Android/iOS, dos dispositivos físicos, HTTPS y configuración del alojamiento, volumen alto de usuarios. El polling y SQLite están orientados a una comunidad pequeña; no se ha hecho una prueba de carga.

Ejecutores (usan datos ficticios; utiliza una base separada de la que quieras conservar):

```powershell
# En una consola dedicada, antes de iniciar el servidor de pruebas:
$env:CUIDAPOYO_DATA_DIR = Join-Path $env:TEMP ('cuidapoyo-qa-' + [guid]::NewGuid())
& C:/xampp/php/php.exe -S 127.0.0.1:8086 servidor/router.php
# En otra consola, desde la raíz:
& C:/xampp/php/php.exe pruebas/comunidad/api.php http://127.0.0.1:8086
node pruebas/comunidad/navegador.cjs http://127.0.0.1:8086
node pruebas/cuenta/datos.cjs
node pruebas/cuenta/navegador.cjs
```

El ejecutor de navegador requiere Node 22+ y Chrome en la ruta de Windows que figura en el script; puedes ajustar esa ruta para otro sistema. El límite de registro es 30 intentos por IP cada 15 minutos: para muchas repeticiones usa una base temporal nueva. No borres una base con datos que quieras conservar.

También pasaron las 21 pruebas de datos de cuenta y las 20 pruebas previas de Chrome, incluidas 111 comprobaciones del calendario, 423 pruebas del motor del chatbot y 30 de su integración, sin fallos.

Al abrir Comunidad con Live Server (por ejemplo, `127.0.0.1:5500`), se comprueba el servidor PHP del mismo equipo en el puerto 8085 y se redirige automáticamente si responde como CuidApoyo. No se transfieren formularios ni credenciales entre puertos. Si PHP no está disponible, se muestran las instrucciones de arranque y el enlace de acceso, sin ofrecer un registro que no puede guardarse.
