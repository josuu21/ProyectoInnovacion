// Comportamiento común: menú, animación, tema visual y filtros de vídeos.

// Abrir y cerrar el menú en pantallas pequeñas
const botonMenu = document.getElementById('menuBoton');
const menu = document.getElementById('menu');

botonMenu.addEventListener('click', function () {
  menu.classList.toggle('abierto');
  botonMenu.setAttribute('aria-expanded', menu.classList.contains('abierto'));
});

// Cerrar el menú al pulsar una sección
const enlaces = document.querySelectorAll('#menu a');
enlaces.forEach(function (enlace) {
  enlace.addEventListener('click', function () {
    menu.classList.remove('abierto');
    botonMenu.setAttribute('aria-expanded', 'false');
    enlaces.forEach(function (otro) { otro.classList.remove('activo'); });
    enlace.classList.add('activo');
  });
});

// El acceso a la cuenta se gestiona en cuenta.js.

// Pausa persistente de la banda, disponible tambien en pantallas tactiles.
const banda = document.querySelector('.banda');
const controlBanda = document.querySelector('.banda-control');
if (banda && controlBanda) {
  controlBanda.addEventListener('click', function () {
    const pausada = banda.classList.toggle('en-pausa');
    controlBanda.setAttribute('aria-pressed', String(pausada));
    controlBanda.textContent = pausada ? 'Reanudar movimiento' : 'Pausar movimiento';
  });
}

// Tema persistente; sigue el sistema mientras no haya una eleccion propia.
const temaBoton = document.getElementById('temaBoton');
const temaSistema = window.matchMedia('(prefers-color-scheme: dark)');
let temaElegido = false;
try { temaElegido = Boolean(localStorage.getItem('cuidapoyo-tema')); } catch (e) {}

// Aplica el tema visual y sincroniza los atributos accesibles del botón.
function aplicarTema(oscuro) {
  document.documentElement.dataset.tema = oscuro ? 'oscuro' : 'claro';
  if (temaBoton) {
    temaBoton.setAttribute('aria-pressed', String(oscuro));
    temaBoton.setAttribute('aria-label', oscuro ? 'Activar modo claro' : 'Activar modo oscuro');
    temaBoton.title = oscuro ? 'Activar modo claro' : 'Activar modo oscuro';
  }
}
aplicarTema(document.documentElement.dataset.tema === 'oscuro');
if (temaBoton) temaBoton.addEventListener('click', function () {
  const oscuro = document.documentElement.dataset.tema !== 'oscuro';
  temaElegido = true;
  aplicarTema(oscuro);
  try { localStorage.setItem('cuidapoyo-tema', oscuro ? 'oscuro' : 'claro'); } catch (e) {}
});
temaSistema.addEventListener('change', function (evento) {
  if (!temaElegido) aplicarTema(evento.matches);
});

// Abrir el recurso enlazado al llegar desde otra página o tarjeta.

// Abre el recurso indicado por el fragmento de la URL.
function abrirRecursoEnlazado() {
  const destino = document.getElementById(location.hash.slice(1));
  if (destino && destino.tagName === 'DETAILS') destino.open = true;
}
abrirRecursoEnlazado();
window.addEventListener('hashchange', abrirRecursoEnlazado);
// Filtra los tutoriales combinando el tema seleccionado y el texto del buscador.
const filtrosVideos = document.querySelectorAll('.video-filtros button');
const tarjetasVideos = document.querySelectorAll('.video-tarjeta');
const abrirBusquedaVideos = document.getElementById('abrirBusquedaVideos');
const busquedaVideos = document.getElementById('busquedaVideos');
const buscarVideos = document.getElementById('buscarVideos');
let temaVideos = 'todos';

// Ignora las tildes, las mayúsculas y los espacios sobrantes al buscar.
function normalizarBusquedaVideos(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

// Busca en el título, la categoría y palabras habituales asociadas a cada tema.
function filtrarVideos() {
  const consulta = normalizarBusquedaVideos(buscarVideos ? buscarVideos.value : '');
  const palabras = consulta.split(/\s+/).filter(Boolean);
  const sinonimos = {
    alimentacion: 'comida comidas comer alimentos nutrición',
    higiene: 'aseo lavar limpieza',
    movilidad: 'moverse caminar andar movilización',
    bienestar: 'descanso descansar emociones autocuidado',
    acompanamiento: 'acompañar compañía escuchar',
    organizacion: 'organizar tareas rutinas repartir'
  };
  let visibles = 0;

  tarjetasVideos.forEach(function (tarjeta) {
    const categoria = tarjeta.dataset.categoria;
    const texto = normalizarBusquedaVideos(
      tarjeta.querySelector('h3').textContent + ' ' + categoria + ' ' + (sinonimos[categoria] || '')
    );
    const coincideTema = temaVideos === 'todos' || categoria === temaVideos;
    tarjeta.hidden = !coincideTema || !palabras.every(function (palabra) { return texto.includes(palabra); });
    if (!tarjeta.hidden) visibles++;
  });

  const cantidad = document.getElementById('videosCantidad');
  const sinResultados = document.getElementById('videosSinResultados');
  if (cantidad) cantidad.textContent = visibles + (visibles === 1 ? ' tutorial en preparación' : ' tutoriales en preparación');
  if (sinResultados) sinResultados.hidden = visibles !== 0;
}

// Conserva los filtros por tema y aplica también la búsqueda escrita.
filtrosVideos.forEach(function (boton) {
  boton.addEventListener('click', function () {
    temaVideos = boton.dataset.tema;
    filtrosVideos.forEach(function (filtro) {
      filtro.setAttribute('aria-pressed', String(filtro === boton));
    });
    filtrarVideos();
  });
});

// La lupa abre el campo y le da el foco. Al cerrarlo se limpia la búsqueda.
if (abrirBusquedaVideos && busquedaVideos && buscarVideos) {
  function cerrarBusquedaVideos() {
    busquedaVideos.hidden = true;
    abrirBusquedaVideos.setAttribute('aria-expanded', 'false');
    abrirBusquedaVideos.setAttribute('aria-label', 'Buscar tutoriales');
    abrirBusquedaVideos.title = 'Buscar tutoriales';
    buscarVideos.value = '';
    filtrarVideos();
    abrirBusquedaVideos.focus();
  }

  abrirBusquedaVideos.addEventListener('click', function () {
    if (!busquedaVideos.hidden) {
      cerrarBusquedaVideos();
      return;
    }
    busquedaVideos.hidden = false;
    abrirBusquedaVideos.setAttribute('aria-expanded', 'true');
    abrirBusquedaVideos.setAttribute('aria-label', 'Cerrar búsqueda de tutoriales');
    abrirBusquedaVideos.title = 'Cerrar búsqueda';
    buscarVideos.focus();
  });

  // Actualiza los resultados al escribir y permite cerrar el campo con Escape.
  buscarVideos.addEventListener('input', filtrarVideos);
  buscarVideos.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      cerrarBusquedaVideos();
    }
  });
}
