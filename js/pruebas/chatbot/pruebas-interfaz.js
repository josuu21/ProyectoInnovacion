// Pruebas del chat: mensajes, controles, accesibilidad y enlaces en el navegador.

/* Integración sobre la página real: registra errores, usa el formulario y los botones. */
(async function () {
  'use strict';
  const salida=document.getElementById('integracion');
  const registros=[];
  const pausa=ms=>new Promise(r=>setTimeout(r,ms));
  const comprobar=(nombre,ok)=>{registros.push({nombre,ok:Boolean(ok)});};
  const marco=document.getElementById('paginaChat');
  if(!marco.contentDocument || !marco.contentDocument.getElementById('chatFormulario')) await new Promise(resolve=>marco.addEventListener('load',resolve,{once:true}));
  const w=marco.contentWindow,d=marco.contentDocument;
  const errores=[];
  w.addEventListener('error',e=>errores.push(e.message));
  w.addEventListener('unhandledrejection',e=>errores.push(String(e.reason)));
  comprobar('Cargan los tres scripts del chat',w.CuidaChat && w.CuidaConocimiento && d.querySelectorAll('.chat-mensaje-bot').length===1);
  const entrada=d.getElementById('chatEntrada'),form=d.getElementById('chatFormulario');

  // Valida el mensaje, evita envíos simultáneos y solicita la respuesta al motor local.
  async function enviar(texto) {
    entrada.value=texto;
    form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
    await pausa(600);
  }
  entrada.value='hola';
  form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  comprobar('Muestra indicador de escritura',!d.getElementById('chatEscritura').hidden);
  comprobar('Evita doble envío durante respuesta',form.querySelector('button').disabled);
  await pausa(600);
  comprobar('Responde al formulario',d.querySelectorAll('.chat-mensaje-bot').length===2);
  await enviar('mi abuelo no puede andar');
  comprobar('Muestra el tema reconocido',d.getElementById('chatTema').textContent.includes('caminar'));
  const seguir=Array.from(d.querySelectorAll('#chatOpciones button')).find(b=>b.textContent.includes('Cómo'));
  comprobar('Botón de seguimiento disponible',seguir);
  seguir.click(); await pausa(600);
  comprobar('Botón conserva contexto',d.querySelector('.chat-mensaje:last-child').textContent.includes('Sobre ayuda para caminar'));
  await enviar('<img src=x onerror="window.inyectado=true">');
  comprobar('Mensaje tratado como texto, sin HTML ejecutable',!w.inyectado && d.querySelectorAll('.chat-mensajes img').length===0);
  comprobar('Log accesible y con foco',d.getElementById('chatMensajes').getAttribute('role')==='log' && d.getElementById('chatMensajes').tabIndex===0);
  comprobar('El foco permanece en la entrada',d.activeElement===entrada);
  await enviar('ver tutoriales');
  comprobar('Enlace contextual en la respuesta',d.querySelector('.chat-mensaje:last-child a').getAttribute('href')==='tutoriales.html');
  entrada.value='hola'; form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  d.getElementById('chatReiniciar').click(); await pausa(600);
  comprobar('Reinicio cancela respuesta pendiente',d.querySelectorAll('.chat-mensaje').length===1 && d.getElementById('chatEscritura').hidden);
  await enviar('qué necesito');
  comprobar('Reinicio borra contexto',d.querySelector('.chat-mensaje:last-child').textContent.toLowerCase().includes('sobre qué tema'));
  const anteriores=d.querySelectorAll('.chat-mensaje').length;
  await enviar('   ');
  comprobar('No añade mensajes vacíos',d.querySelectorAll('.chat-mensaje').length===anteriores);
  for (const ancho of [375,320]) {
    marco.style.width=ancho+'px'; await pausa(100);
    comprobar('Chat sin desbordamiento horizontal a '+ancho+'px',d.querySelector('.chat-panel').getBoundingClientRect().right<=ancho && d.querySelector('.chat-panel').scrollWidth<=d.querySelector('.chat-panel').clientWidth+1);
  }
  d.getElementById('menuBoton').click();
  comprobar('Conserva menú móvil',d.getElementById('menu').classList.contains('abierto') && d.getElementById('menuBoton').getAttribute('aria-expanded')==='true');
  d.getElementById('menuBoton').click();
  marco.style.width='100%';
  const tema=d.documentElement.dataset.tema;
  d.getElementById('temaBoton').click();
  comprobar('Conserva cambio de tema',d.documentElement.dataset.tema!==tema);
  d.getElementById('temaBoton').click();
  comprobar('Sin errores JavaScript ni promesas rechazadas',errores.length===0);
  // Verifica destinos locales y anclas reales. Un iframe permite comprobarlos incluso sin servidor.
  const paginas=new Map();
  for(const intencion of w.CuidaChat.base.filter(i=>i.enlace)) {
    const [ruta,ancla]=intencion.enlace.url.split('#');
    if(!paginas.has(ruta)) {
      const pagina=document.createElement('iframe');
      pagina.hidden=true; pagina.src='../../'+ruta;
      document.body.append(pagina);
      await new Promise(resolve=>pagina.addEventListener('load',resolve,{once:true}));
      paginas.set(ruta,pagina.contentDocument);
    }
    const pagina=paginas.get(ruta);
    comprobar('Destino existente de '+intencion.id, pagina && pagina.querySelector('main') && (!ancla || pagina.getElementById(ancla)));
  }
  const videos=paginas.get('tutoriales.html');
  const filtro=videos.querySelector('.video-filtros button[data-tema="higiene"]');
  filtro.click();
  comprobar('Conserva los filtros de tutoriales',Array.from(videos.querySelectorAll('.video-tarjeta')).every(t=>t.hidden===(t.dataset.categoria!=='higiene')) && filtro.getAttribute('aria-pressed')==='true');
  comprobar('Recuento de tutoriales coherente',videos.getElementById('videosCantidad').textContent.startsWith(String(videos.querySelectorAll('.video-tarjeta:not([hidden])').length)));

  // Publica los resultados de integración y el estado global de las pruebas.
  window.resultadosInterfaz=registros;
  registros.forEach(r=>{const li=document.createElement('li');li.textContent=(r.ok?'OK · ':'FALLO · ')+r.nombre;if(!r.ok)li.className='fallo';salida.append(li);});
  const fallos=registros.filter(r=>!r.ok);
  document.getElementById('resumenInterfaz').textContent=registros.length+' pruebas de integración; '+fallos.length+' fallos.';
  document.body.dataset.pruebas=fallos.length || window.resultadosMotor.some(r=>!r.ok)?'fallo':'ok';
  if(fallos.length)console.error('Pruebas de interfaz fallidas',fallos);
})().catch(error=>{
  document.body.dataset.pruebas='error';
  document.getElementById('resumenInterfaz').textContent='Error: '+error.message;
  console.error(error);
});
