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
function abrirRecursoEnlazado() {
  const destino = document.getElementById(location.hash.slice(1));
  if (destino && destino.tagName === 'DETAILS') destino.open = true;
}
abrirRecursoEnlazado();
window.addEventListener('hashchange', abrirRecursoEnlazado);
// Filtrar la videoteca por temas sin salir de la página.
const filtrosVideos = document.querySelectorAll('.video-filtros button');
const tarjetasVideos = document.querySelectorAll('.video-tarjeta');
filtrosVideos.forEach(function (boton) {
  boton.addEventListener('click', function () {
    const tema = boton.dataset.tema;
    filtrosVideos.forEach(function (filtro) {
      filtro.setAttribute('aria-pressed', String(filtro === boton));
    });
    let visibles = 0;
    tarjetasVideos.forEach(function (tarjeta) {
      tarjeta.hidden = tema !== 'todos' && tarjeta.dataset.categoria !== tema;
      if (!tarjeta.hidden) visibles++;
    });
    document.getElementById('videosCantidad').textContent = visibles + (visibles === 1 ? ' tutorial en preparación' : ' tutoriales en preparación');
  });
});
