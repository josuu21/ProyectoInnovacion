// Conecta contenidos, calendario y sugerencias del chat con el perfil activo.

/* Puentes pequeños sobre las funciones existentes; nunca se envían datos a la red. */
(function(){
  'use strict';
  const C=window.CuidaCuenta,R=C.repositorio;
  const aviso=document.createElement('p');aviso.className='cuenta-notificacion';aviso.setAttribute('role','status');aviso.hidden=true;document.body.append(aviso);
  let timeout;

  // Muestra un mensaje de estado con el resultado de una acción.
  function notificar(t){aviso.textContent=t;aviso.hidden=false;clearTimeout(timeout);timeout=setTimeout(()=>{aviso.hidden=true;},6000);}

  // Alterna el contenido guardado o consultado del perfil y actualiza el botón.
  function marcar(id,campo,b){
    try{const p=R.activa();if(!p){notificar('Inicia sesión y selecciona una persona en Mi cuenta para guardar contenidos.');return;}
      R.cambiarPersona(p.id,x=>{const lista=x[campo]||[];x[campo]=lista.includes(id)?lista.filter(v=>v!==id):lista.concat(id);});actualizarBotones();notificar('Preferencia guardada para el perfil activo.');
    }catch(e){notificar(e.message);}
  }

  // Construye un botón preparado para ejecutar la acción correspondiente.
  function boton(texto,id,campo){const b=document.createElement('button');b.type='button';b.className='contenido-guardar';b.dataset.contenido=id;b.dataset.campo=campo;b.textContent=texto;b.onclick=()=>marcar(id,campo,b);return b;}
  document.querySelectorAll('.video-tarjeta').forEach((card,i)=>{
    const item=window.CuidaCatalogo.filter(r=>r.kind==='tutorial')[i];if(!item)return;card.id=item.id;
    const div=document.createElement('div');div.className='contenido-acciones';div.append(boton('Guardar tema',item.id,'favorites'),boton('Marcar tema consultado',item.id,'consulted'));
    // Preparado para vídeos reales. No se inventan reproducciones de miniaturas.
    if(card.querySelector('video,iframe')&&item.available)div.append(boton('Marcar como visto',item.id,'watched'));
    card.append(div);
  });
  document.querySelectorAll('.necesidades-opciones details').forEach((d,i)=>{
    const item=window.CuidaCatalogo.filter(r=>r.kind==='recurso')[i];if(!item)return;if(!d.id)d.id='empezar';
    const box=document.createElement('div');box.className='contenido-acciones';box.append(boton('Guardar recurso',item.id,'favorites'),boton('Marcar como leído',item.id,'consulted'));d.querySelector('.opcion-contenido').append(box);
  });

  // Sincroniza el texto y el estado accesible de los botones con el perfil activo.
  function actualizarBotones(){let p;try{p=R.activa();}catch(_){}document.querySelectorAll('[data-contenido]').forEach(b=>{const marcado=Boolean(p?.[b.dataset.campo]?.includes(b.dataset.contenido));b.setAttribute('aria-pressed',String(marcado));b.textContent=b.dataset.campo==='favorites'?(marcado?'Guardado · Quitar':'Guardar en favoritos'):b.dataset.campo==='watched'?(marcado?'Visto · Desmarcar':'Marcar como visto'):(marcado?'Consultado · Desmarcar':'Marcar como consultado');});}
  actualizarBotones();window.addEventListener('storage',actualizarBotones);
  // El calendario reutiliza su interfaz completa y el documento del perfil activo.
  if(document.getElementById('agenda')){
    try{const u=R.actual(),p=R.activa();if(u&&!p){location.replace('mi-cuenta.html#personas');return;}
      const banner=document.createElement('p');banner.className='cuenta-contexto';banner.textContent=p?'Calendario de '+p.nickname+'. Los cambios se reflejan en tu plan de cuidados.':'Agenda sin cuenta: se conserva por separado de los perfiles personales.';
      const a=document.createElement('a');a.href='mi-cuenta.html';a.textContent=' Abrir mi espacio';banner.append(a);const herramientas=document.querySelector('.agenda-herramientas');if(herramientas)herramientas.append(banner);else document.querySelector('main').prepend(banner);
    }catch(e){notificar(e.message);}
  }
  // Solo categorías y solo tras permiso explícito. Se reutilizan los ids del motor.
  const temaSolicitado=new URLSearchParams(location.search).get('tema');
  if(temaSolicitado&&window.CuidaChat?.base.some(x=>x.id===temaSolicitado)){window.dispatchEvent(new CustomEvent('cuida-chat-sugerencia',{detail:{id:temaSolicitado}}));}
  const panel=document.querySelector('.chat-panel');
  if(panel){
    let p,u;try{p=R.activa();u=R.actual();}catch(_){}if(!p)return;
    const box=document.createElement('section');box.className='chat-perfil';box.setAttribute('aria-label','Sugerencias de tu perfil');
    const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=!!u.chatConsent;
    label.append(input,document.createTextNode(' Adaptar sugerencias a mis categorías de apoyo'));
    const help=document.createElement('p');help.textContent='Solo se usan las categorías seleccionadas, dentro de este navegador. No se comparten nombres, edades, notas ni registros personales.';
    const choices=document.createElement('div');choices.className='chat-opciones';box.append(label,help,choices);panel.querySelector('.chat-nota').after(box);

    // Muestra sugerencias del perfil cuando está activado el consentimiento.
    function pintar(){choices.replaceChildren();if(!input.checked)return;
      [...new Set(C.categorias.filter(c=>p.needs[c.id]).map(c=>c.chat))].forEach(id=>{const item=window.CuidaChat?.base.find(x=>x.id===id);if(!item)return;const b=document.createElement('button');b.type='button';b.textContent=item.titulo;b.onclick=()=>window.dispatchEvent(new CustomEvent('cuida-chat-sugerencia',{detail:{id,texto:item.titulo}}));choices.append(b);});
      if(!choices.childNodes.length)choices.textContent='Añade áreas de apoyo en Mi cuenta para ver sugerencias.';
    }
    input.onchange=()=>{try{R.cambiar(x=>{x.chatConsent=input.checked;});pintar();notificar(input.checked?'Sugerencias adaptadas activadas.':'Personalización desactivada.');}catch(e){input.checked=!input.checked;notificar(e.message);}};pintar();
    window.addEventListener('storage',ev=>{if(ev.key!==C.CLAVE&&ev.key!==null)return;try{const actual=R.actual();p=R.activa();if(!actual||!p){box.remove();return;}input.checked=!!actual.chatConsent;pintar();}catch(_){input.checked=false;choices.replaceChildren();}});
  }
})();