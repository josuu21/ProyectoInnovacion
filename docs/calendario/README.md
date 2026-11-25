# Calendario de CuidApoyo

## Ubicación actual

Las rutas de esta documentación parten de la raíz del repositorio.
Página: `html/calendario.html`. Módulos: `js/calendario/`.
Pruebas HTML: `html/pruebas/calendario/pruebas.html`. Scripts de pruebas: `js/pruebas/calendario/`.
Estilos: `css/calendario.css`.


Página estática: abrir html/calendario.html o el enlace Calendario del menú.
Los enlaces de la web se abren en la misma pestaña para conservar la sesión local de Mi cuenta.
No hay dependencias nuevas, APIs ni servidor obligatorio. Mi cuenta permite asociar la agenda a la persona activa del prototipo local.

## Funciones

- Mes de lunes a domingo, colores pastel por columna, navegación, mes elegido,
  botón Hoy y navegación por teclado (flechas, Inicio, Fin, AvPág/RePág).
- Día con columnas Por hacer, En curso y Hecho. Arrastrar con ratón o usar el
  selector accesible de estado, también en móvil.
- Crear, editar, duplicar, cambiar de fecha y eliminar con confirmación y deshacer.
- Título, hora opcional, categoría, prioridad, responsable, notas y pasos marcables.
- Repetición diaria, semanal o de lunes a viernes, con cantidad explícita hasta
  52 tareas. Cada ocurrencia es independiente; editar o eliminar no cambia la serie.
- Búsqueda por título, notas o responsable, sin distinguir tildes; filtros por
  categoría y estado aplicados al mes y al tablero.
- Resumen del mes, progreso de hoy, próximas tareas y pendientes anteriores.
- Plantillas editables sin tareas de demostración insertadas en los datos.
- Exportar JSON e importar con validación y confirmación. Se añaden solo ids
  nuevos, conservando las tareas existentes. Máximo 5 MB y 10.000 tareas.
- Los horarios ordenan tareas. No hay alarmas ni notificaciones en segundo plano.

## Datos y límites

Sin cuenta, la clave es cuidapoyo-agenda-v1. Con sesión, el adaptador de js/cuenta/datos.js utiliza directamente persona.agenda: es el mismo documento que utiliza el panel, sin duplicar tareas. No contiene información del chat. La agenda antigua sin cuenta se conserva por separado.
Los cambios se guardan antes de confirmar éxito. Antes de mutar se lee la versión
más reciente; se rechaza una edición si cambió esa tarea en otra pestaña.
El evento storage actualiza la vista cuando se cambia desde otra pestaña.
Al no haber transacciones entre pestañas, escrituras exactamente simultáneas
podrían competir. Para edición colaborativa real se necesitaría un backend.

Los datos no se sincronizan entre dispositivos. Al borrar datos del navegador
se puede perder la agenda: conviene descargar copias. Si el almacenamiento
está bloqueado, se informa de que solo hay memoria temporal. Si está lleno,
se rechaza el guardado y se conserva el formulario. Un documento corrupto
queda protegido contra sobrescritura y se ofrece descargar el original antes
de reiniciarlo explícitamente.

La referencia de hoy usa Europe/Madrid; las fechas de tareas son fechas de
calendario, sin conversiones UTC. Rango de creación: 1900 a 2099.
En páginas abiertas durante la noche, la referencia de hoy se actualiza al
recuperar el foco, conservando la vista elegida.

## Estructura y pruebas

datos.js concentra fechas, validación y persistencia.
interfaz.js gestiona DOM, estado visual, acciones y diálogos.
calendario.css se limita a esta página y conserva los dos temas de la web.

Abrir pruebas.html en un perfil aislado de Chrome o con el servidor local
habitual. El harness usa el calendario real y guarda/restaura su almacenamiento
inicial; no ejecutarlo mientras se edita una agenda real en otra pestaña.
Para pruebas entre archivos locales, Chrome puede requerir
--allow-file-access-from-files. La aplicación no necesita ese permiso para
su uso normal.

Las pruebas cubren fechas bisiestas y cambios de mes/año, series, validación,
fallos de almacenamiento, creación/edición, estados por selector y arrastre,
pasos, duplicación, eliminación y deshacer, filtros, persistencia tras recarga,
conflictos de edición, importación, teclado y móvil.
