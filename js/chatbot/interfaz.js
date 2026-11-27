// Chat: mensajes, sugerencias y controles accesibles.

/* Interfaz accesible del chat. La memoria vive solo en esta página. */
(function () {
  'use strict';
  const formulario = document.getElementById('chatFormulario');
  if (!formulario) return;
  // Evita el envío nativo incluso si una dependencia no se ha cargado.
  formulario.addEventListener('submit', evento => evento.preventDefault());
  if (!window.CuidaChat) {
    document.getElementById('chatEstado').textContent = 'No se ha podido cargar el asistente. Recarga la página para intentarlo de nuevo.';
    return;
  }
  const entrada = document.getElementById('chatEntrada');
  const mensajes = document.getElementById('chatMensajes');
  const opciones = document.getElementById('chatOpciones');
  const estado = document.getElementById('chatEstado');
  const escritura = document.getElementById('chatEscritura');
  const tema = document.getElementById('chatTema');
  const enviarBoton = formulario.querySelector('[type="submit"]');
  const nuevos = document.getElementById('chatNuevos');
  const conversacion = CuidaChat.crearConversacion();
  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  let temporizador = null, ocupado = false, mensajeNumero = 0;

  // Presenta la bienvenida solo si el chat se ha cargado correctamente.
  const escenario = document.getElementById('chatEscenario');
  const bienvenida = document.getElementById('chatBienvenida');
  const panel = document.getElementById('chatPanel');
  const abrir = document.getElementById('chatAbrir');
  let temporizadorBienvenida = null;

  // Abre la conversación una sola vez y conserva el foco si se usa el botón.
  function abrirChat(enfocar) {
    if (!bienvenida || bienvenida.hidden) return;
    window.clearTimeout(temporizadorBienvenida);
    temporizadorBienvenida = null;
    const teniaFoco = bienvenida.contains(document.activeElement);
    bienvenida.hidden = true;
    panel.hidden = false;
    escenario.classList.remove('chat-presentando');
    escenario.classList.add('chat-abierto');
    if (enfocar || teniaFoco) entrada.focus({preventScroll:true});
  }

  // Reduce el movimiento cuando el dispositivo lo solicita y permite saltar el saludo.
  if (escenario && bienvenida && panel && abrir && !movimientoReducido.matches) {
    escenario.classList.add('chat-presentando');
    panel.hidden = true;
    bienvenida.hidden = false;
    abrir.addEventListener('click', () => abrirChat(true));
    temporizadorBienvenida = window.setTimeout(() => abrirChat(false), 1800);
    movimientoReducido.addEventListener('change', evento => {
      if (evento.matches) abrirChat(false);
    });
  }

  // Comprueba si la lectura está cerca del final del historial de mensajes.
  function alFinal() { return mensajes.scrollHeight - mensajes.clientHeight - mensajes.scrollTop < 70; }

  // Desplaza el historial cuando corresponde y respeta la preferencia de movimiento reducido.
  function desplazar(forzar) {
    if (forzar || alFinal()) {
      mensajes.scrollTo({top:mensajes.scrollHeight,behavior:movimientoReducido.matches?'auto':'smooth'});
      nuevos.hidden=true;
    } else nuevos.hidden=false;
  }

  // Añade un mensaje como texto y su enlace opcional y actualiza el seguimiento del historial.
  function agregarMensaje(autor, texto, enlace) {
    const seguir = alFinal();
    const mensaje = document.createElement('div');
    mensaje.className = 'chat-mensaje chat-mensaje-' + autor;
    mensaje.id = 'chat-mensaje-' + (++mensajeNumero);
    const nombre = document.createElement('strong');
    nombre.textContent = autor==='bot'?'Resuelve':'Tú';
    mensaje.append(nombre);
    // Solo texto: el mensaje del usuario nunca se interpreta como HTML.
    texto.split('\n\n').forEach(parrafo => {
      const p=document.createElement('p');
      p.textContent=parrafo;
      mensaje.append(p);
    });
    if (enlace) {
      const link=document.createElement('a');
      link.href=enlace.url;
      link.textContent=enlace.texto;
      mensaje.append(link);
    }
    mensajes.append(mensaje);
    desplazar(autor==='usuario' || seguir);
  }

  // Sustituye las opciones del chat por botones conectados al envío de consultas.
  function sugerencias(lista) {
    opciones.replaceChildren();
    lista.forEach(opcion => {
      const boton=document.createElement('button');
      boton.type='button';
      boton.textContent=opcion.texto;
      boton.disabled=ocupado;
      boton.addEventListener('click',()=>enviar(opcion.texto,opcion.id));
      opciones.append(boton);
    });
  }

  // Sincroniza el indicador de escritura y bloquea el envío mientras se prepara una respuesta.
  function cambiarEstado(valor) {
    ocupado=valor;
    enviarBoton.disabled=valor;
    escritura.hidden=!valor;
    opciones.querySelectorAll('button').forEach(b=>{b.disabled=valor;});
    estado.textContent=valor?'Resuelve está preparando una respuesta.':'';
  }

  // Valida el mensaje, evita envíos simultáneos y solicita la respuesta al motor local.
  function enviar(texto, id) {
    abrirChat(false);
    if (ocupado) return;
    const limpio=texto.trim();
    if (!limpio) { estado.textContent='Escribe una pregunta o elige una sugerencia.'; entrada.focus(); return; }
    if (limpio.length>500) { estado.textContent='Tu mensaje puede tener hasta 500 caracteres.'; return; }
    agregarMensaje('usuario',limpio);
    entrada.value='';
    cambiarEstado(true);
    // El retraso es solo visual; el procesamiento se realiza localmente.
    temporizador=window.setTimeout(()=>{
      temporizador=null;
      const respuesta=conversacion.responder(limpio,id);
      cambiarEstado(false);
      agregarMensaje('bot',respuesta.texto,respuesta.enlace);
      sugerencias(respuesta.opciones);
      const actual=CuidaChat.base.find(i=>i.id===respuesta.tema);
      tema.textContent=actual?'Tema: '+actual.titulo:'Elige por dónde empezar';
    }, movimientoReducido.matches?50:450);
    // Mantiene el teclado disponible sin robar el foco al llegar la respuesta.
    entrada.focus({preventScroll:true});
  }
  formulario.addEventListener('submit',evento=>{
    evento.preventDefault();
    enviar(entrada.value);
  });
  nuevos.addEventListener('click',()=>desplazar(true));
  mensajes.addEventListener('scroll',()=>{if(alFinal()) nuevos.hidden=true;},{passive:true});
  document.getElementById('chatReiniciar').addEventListener('click',()=>{
    window.clearTimeout(temporizador);
    temporizador=null;
    cambiarEstado(false);
    conversacion.reiniciar();
    mensajes.replaceChildren();
    entrada.value='';
    tema.textContent='Elige por dónde empezar';
    iniciar();
    estado.textContent='Se ha borrado la conversación y su contexto.';
    entrada.focus({preventScroll:true});
  });

  // Muestra el saludo y las opciones iniciales del chat.
  function iniciar() {
    agregarMensaje('bot','¡Hola! Soy Resuelve, el asistente de CuidApoyo. Puedo orientarte sobre cuidados diarios, bienestar y recursos de apoyo. Cuéntame qué necesitas o elige una opción. Puedes pedirme después «¿cómo puedo hacerlo?» o «¿qué necesito?».');
    sugerencias(['movilidad','higiene','alimentacion','cuidador','servicios','capacidades'].map(id=>({id,texto:CuidaChat.base.find(i=>i.id===id).titulo})));
  }
  window.addEventListener('cuida-chat-sugerencia',evento=>{const opcion=CuidaChat.base.find(x=>x.id===evento.detail?.id);if(opcion)enviar(opcion.titulo,opcion.id);});
  iniciar();
})();
