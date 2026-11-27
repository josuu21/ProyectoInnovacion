// Calendario: vistas, formularios, navegación, filtros y copias de la agenda.

/* Vista mensual y tablero diario. Los mensajes y las tareas se insertan como texto. */
(function () {
  'use strict';
  const A=window.CuidaAgenda, $=id=>document.getElementById(id);
  if(!A) return;
  let storage;try{storage=window.localStorage;}catch(e){storage=null;}
  let contexto; try { contexto=window.CuidaCuenta?.repositorio.actual(); if(contexto&&!contexto.activePerson){location.replace('mi-cuenta.html#personas');return;} } catch(error) { document.getElementById('avisoAlmacen').textContent=error.message; document.getElementById('avisoAlmacen').hidden=false; return; }
  const perfilInicial=contexto?.activePerson;
  const almacen=A.crearAlmacen(contexto?window.CuidaCuenta.repositorio.agendaStorage():storage);
  let hoy=A.hoy(),ultimoError='';
  let documento={version:1,tasks:[]}, mes=hoy.slice(0,7), dia=hoy, vista='dia';
  let editando=null, baseEdicion=null, focoAnterior=null, confirmacion=null, deshacer=null, arrastrada=null;
  const formato=(fecha,opciones)=>new Intl.DateTimeFormat('es-ES',opciones).format(A.fechaObjeto(fecha));
  const normalizar=t=>t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

  // Crea un elemento del DOM con su clase y contenido de texto.
  function nodo(tag,clase,texto) {const n=document.createElement(tag);if(clase)n.className=clase;if(texto!==undefined)n.textContent=texto;return n;}

  // Construye un botón preparado para ejecutar la acción correspondiente.
  function boton(texto,clase,accion) {const b=nodo('button',clase,texto);b.type='button';b.addEventListener('click',accion);return b;}

  // Comunica los cambios mediante la región de estado accesible de la agenda.
  function anunciar(texto) {$('agendaEstado').textContent=texto;}

  // Muestra un aviso y ofrece deshacer la acción cuando se proporciona esa opción.
  function aviso(texto,accion) {
    $('avisoTexto').textContent=texto;deshacer=accion||null;$('deshacer').hidden=!accion;$('agendaAviso').hidden=false;anunciar(texto);
  }

  // Conecta el control cerrarAviso con su acción de click.
  $('cerrarAviso').addEventListener('click',()=>{$('agendaAviso').hidden=true;});

  // Conecta el control deshacer con su acción de click.
  $('deshacer').addEventListener('click',()=>{if(deshacer){const accion=deshacer;deshacer=null;accion();}});

  // Prepara una descarga local y libera después la URL temporal utilizada.
  function descargar(contenido,nombre) {
    const url=URL.createObjectURL(new Blob([contenido],{type:'application/json'})), a=nodo('a');a.href=url;a.download=nombre;
    document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  // Explica el estado del guardado y ofrece descargar o recuperar los datos dañados.
  function bannerAlmacen() {
    const e=almacen.estado(),banner=$('avisoAlmacen');banner.replaceChildren();banner.hidden=!(e.corrupto||e.temporal);
    if(e.corrupto) {
      banner.append(nodo('p','', 'No se han podido leer los datos guardados. No los hemos sobrescrito. Descarga el original antes de recuperar el calendario.'));
      banner.append(boton('Descargar datos originales','agenda-enlace',()=>descargar(e.original,'cuidapoyo-datos-originales.json')));
      banner.append(boton('Reiniciar el calendario','agenda-enlace',()=>confirmar('Recuperar el calendario','Esta acción retira los datos que no se pueden leer. Descarga primero el original si quieres conservarlo.',()=>{
        try{documento=almacen.recuperar();renderizar();aviso('Calendario recuperado. Ya puedes importar una copia válida.');}catch(error){aviso(error.message);}
      },'Reiniciar')));
    } else if(e.temporal) banner.textContent='El navegador no permite guardar la agenda. Puedes utilizarla durante esta sesión y descargar una copia antes de cerrar.';
    $('estadoGuardado').textContent=e.temporal?'Solo se conserva en esta sesión. Descarga una copia antes de salir.':'Se guarda en este navegador. Descarga una copia para conservarla o llevarla a otro dispositivo.';
  }
  try{documento=almacen.cargar();}catch(e){aviso(e.message);}

  // Comprueba el perfil, guarda el cambio y actualiza la vista o muestra el error.
  function mutar(cambio,mensaje,despues) {
    ultimoError='';
    try{const actual=window.CuidaCuenta?.repositorio.actual();if(actual?.email!==contexto?.email||actual?.activePerson!==perfilInicial)throw new Error('El perfil ha cambiado. Recarga la página para continuar.');documento=almacen.modificar(cambio);renderizar();if(mensaje)aviso(mensaje,despues);return true;}
    catch(e){ultimoError=e.message;aviso(e.message);bannerAlmacen();return false;}
  }
  const filtros=()=>({busqueda:$('buscarTareas').value,categoria:$('filtroCategoria').value,estado:$('filtroEstado').value});
  const filtradas=()=>A.filtrar(documento.tasks,filtros());
  const delDia=(fecha,tareas)=>tareas.filter(t=>t.date===fecha);

  // Selecciona la vista y fecha de la agenda, actualiza el contenido y gestiona el foco.
  function cambiarVista(nueva,fecha,foco) {
    if(fecha && A.fechaValida(fecha)){dia=fecha;mes=fecha.slice(0,7);}
    vista=nueva;renderizar();
    if(foco) {if(vista==='dia')$('diaTitulo').focus({preventScroll:true});else if(vista==='atrasadas')$('atrasadasTitulo').focus({preventScroll:true});}
    anunciar(vista==='dia'?'Tareas del '+formato(dia,{dateStyle:'full'}):vista==='mes'?formato(mes+'-01',{month:'long',year:'numeric'}):'Pendientes de días anteriores');
  }

  // Avanza o retrocede un mes y anuncia el periodo que se muestra.
  function irMes(delta) {mes=A.cambiarMes(mes,delta);dia=mes+'-01';vista='mes';renderizar();anunciar(formato(dia,{month:'long',year:'numeric'}));}

  // Actualiza el progreso de hoy, las próximas tareas y el aviso de tareas atrasadas.
  function renderizarLateral() {
    $('hoyTitulo').textContent=formato(hoy,{weekday:'long'});
    $('hoyFecha').textContent=formato(hoy,{day:'numeric',month:'long',year:'numeric'});
    const tareas=delDia(hoy,documento.tasks),hechas=tareas.filter(t=>t.status==='hecha').length,porcentaje=tareas.length?Math.round(hechas/tareas.length*100):0;
    $('porcentajeHoy').textContent=porcentaje+'%';$('circuloProgreso').style.setProperty('--avance',porcentaje+'%');
    $('resumenHoy').textContent=tareas.length?hechas+' de '+tareas.length+' hechas':'Tu día está por escribir';
    const proximas=A.ordenar(documento.tasks.filter(t=>t.date>=hoy && t.status!=='hecha')).slice(0,3);
    $('proximas').replaceChildren();
    proximas.forEach(t=>{
      const li=nodo('li'),b=boton('','',()=>{cambiarVista('dia',t.date,true);});
      b.append(nodo('span','',formato(t.date,{day:'numeric',month:'short'})+(t.time?' · '+t.time:'')),nodo('strong','',t.title));li.append(b);$('proximas').append(li);
    });
    if(!proximas.length)$('proximas').append(nodo('li','agenda-secundario','Sin tareas próximas. Un poco de espacio también está bien.'));
    const atrasadas=documento.tasks.filter(t=>t.date<hoy && t.status!=='hecha').length;
    $('verAtrasadas').hidden=!atrasadas;$('verAtrasadas').textContent=atrasadas+' pendiente'+(atrasadas===1?'':'s')+' de días anteriores';
  }

  // Calcula y muestra el resumen de tareas del mes filtrado.
  function renderizarResumen(tareas) {
    const mensuales=tareas.filter(t=>t.date.startsWith(mes)), pendientes=mensuales.filter(t=>t.status==='pendiente').length, hechas=mensuales.filter(t=>t.status==='hecha').length;
    $('estadisticasMes').replaceChildren();
    [['▦',mensuales.length,'tareas este mes'],['◷',pendientes,'por hacer'],['✓',hechas,'hechas, ¡bien ahí!']].forEach(([icono,total,texto])=>{
      const bloque=nodo('div','agenda-estadistica'),datos=nodo('div');datos.append(nodo('strong','',String(total)),nodo('small','',texto));bloque.append(nodo('span','',icono),datos);$('estadisticasMes').append(bloque);
    });
  }

  // Dibuja las celdas del calendario y conecta la navegación y sus acciones.
  function renderizarMes(tareas) {
    $('mesTitulo').textContent=formato(mes+'-01',{month:'long'});$('mesAno').textContent=mes.slice(0,4);
    $('elegirMes').value=mes;$('mesAnterior').disabled=mes==='1900-01';$('mesSiguiente').disabled=mes==='2099-12';
    const cuerpo=$('diasMes');cuerpo.replaceChildren();let fila;
    A.celdasMes(mes).forEach((celda,indice)=>{
      if(indice%7===0){fila=nodo('tr');cuerpo.append(fila);}
      const td=nodo('td'),tareasDia=delDia(celda.fecha,tareas),hechas=tareasDia.filter(t=>t.status==='hecha').length;
      const b=boton('','agenda-dia-celda'+(!celda.delMes?' fuera-mes':'')+(celda.fecha===hoy?' es-hoy':'')+(celda.fecha===dia?' seleccionada':''),()=>cambiarVista('dia',celda.fecha,true));
      b.dataset.fecha=celda.fecha;b.tabIndex=celda.fecha===dia?0:-1;b.disabled=!A.fechaValida(celda.fecha);
      b.setAttribute('aria-label',formato(celda.fecha,{dateStyle:'full'})+'. '+tareasDia.length+' tareas, '+hechas+' hechas.');
      if(celda.fecha===hoy)b.setAttribute('aria-current','date');
      const numero=nodo('span','agenda-dia-numero');numero.append(nodo('span','',String(Number(celda.fecha.slice(-2)))));if(celda.fecha===hoy)numero.append(nodo('em','','HOY'));b.append(numero);
      const muestras=nodo('span','agenda-muestras');
      tareasDia.slice(0,2).forEach(t=>muestras.append(nodo('span','agenda-muestra cat-'+t.category+(t.status==='hecha'?' terminada':''),(t.status==='hecha'?'✓ ':t.time?t.time+' ':'')+t.title)));
      b.append(muestras);
      const puntos=nodo('span','agenda-puntos-dia');puntos.setAttribute('aria-hidden','true');
      [...new Set(tareasDia.map(t=>t.category))].forEach(c=>puntos.append(nodo('i','marca-'+c)));b.append(puntos);
      if(tareasDia.length)b.append(nodo('span','agenda-dia-cantidad',''+tareasDia.length+(tareasDia.length===1?' tarea':' tareas')+(hechas===tareasDia.length?' ✓':'')));
      b.addEventListener('keydown',evento=>{
        let nueva;
        if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(evento.key))nueva=A.sumarDias(celda.fecha,{ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[evento.key]);
        else if(evento.key==='Home')nueva=A.sumarDias(celda.fecha,-((A.fechaObjeto(celda.fecha).getDay()+6)%7));
        else if(evento.key==='End')nueva=A.sumarDias(celda.fecha,6-((A.fechaObjeto(celda.fecha).getDay()+6)%7));
        else if(evento.key==='PageUp'||evento.key==='PageDown')nueva=A.cambiarMes(mes,evento.key==='PageUp'?-1:1)+'-01';
        if(nueva){evento.preventDefault();if(A.fechaValida(nueva)){dia=nueva;mes=nueva.slice(0,7);renderizar();const destino=$('diasMes').querySelector('[data-fecha="'+nueva+'"]');if(destino)destino.focus({preventScroll:true});}}
      });
      td.append(b);fila.append(td);
    });
  }

  // Actualiza el estado de la interfaz y sincroniza sus controles.
  function cambiarEstado(id,estado) {
    mutar(tareas=>tareas.map(t=>t.id===id?{...t,status:estado,updatedAt:new Date().toISOString()}:t),estado==='hecha'?'Tarea terminada. Un paso menos, ¡bien hecho!':'Tarea movida a «'+A.estados[estado]+'».');
  }

  // Construye la tarjeta de una tarea con sus datos y acciones disponibles.
  function tarjeta(t,mostrarFecha) {
    const card=nodo('article','agenda-tarjeta cat-'+t.category+(t.status==='hecha'?' etiqueta-hecha':''));card.dataset.id=t.id;card.draggable=true;
    const superior=nodo('div','agenda-tarjeta-superior');superior.append(nodo('span','agenda-etiqueta',A.categorias[t.category]));if(t.priority==='alta')superior.append(nodo('span','agenda-importante','! Importante'));card.append(superior);
    card.append(nodo('h4','',t.title));
    if(t.time || mostrarFecha)card.append(nodo('p','agenda-hora',(mostrarFecha?formato(t.date,{day:'numeric',month:'short'})+(t.time?' · ':''):'')+t.time));
    if(t.assignee)card.append(nodo('p','','Se encarga: '+t.assignee));
    if(t.notes)card.append(nodo('p','',t.notes));
    if(t.seriesId)card.append(nodo('p','agenda-serie','↻ Tarea de una repetición'));
    if(t.checklist.length) {
      card.append(nodo('p','',t.checklist.filter(p=>p.done).length+'/'+t.checklist.length+' pasos'));
      const lista=nodo('div','agenda-checklist');
      t.checklist.forEach(p=>{
        const label=nodo('label'),input=nodo('input');input.type='checkbox';input.checked=p.done;
        input.setAttribute('aria-label',p.text+' · '+t.title);
        input.addEventListener('change',()=>{const focoId=p.id;const ok=mutar(tareas=>tareas.map(x=>x.id===t.id?{...x,checklist:x.checklist.map(y=>y.id===p.id?{...y,done:input.checked}:y),updatedAt:new Date().toISOString()}:x),'Paso actualizado.');if(ok){const restaurar=document.querySelector('[data-paso="'+focoId+'"]');if(restaurar)restaurar.focus({preventScroll:true});}});
        input.dataset.paso=p.id;label.append(input,nodo('span','',p.text));lista.append(label);
      });card.append(lista);
    }
    const acciones=nodo('div','agenda-tarjeta-acciones'),estado=nodo('select');estado.setAttribute('aria-label','Estado de '+t.title);
    Object.entries(A.estados).forEach(([valor,titulo])=>{const op=nodo('option','',titulo);op.value=valor;estado.append(op);});estado.value=t.status;
    estado.addEventListener('change',()=>{cambiarEstado(t.id,estado.value);const restaurar=document.querySelector('[data-id="'+t.id+'"] select');if(restaurar){const menu=restaurar.closest('details');if(menu)menu.open=true;restaurar.focus({preventScroll:true});}});
    // Completar es la acción principal; el resto queda en un menú de opciones.
    const completar=boton(t.status==='hecha'?'Volver a pendientes':'✓ Marcar como hecha','agenda-completar',()=>{
      cambiarEstado(t.id,t.status==='hecha'?'pendiente':'hecha');
      const siguiente=document.querySelector('[data-id="'+t.id+'"] .agenda-completar');
      if(siguiente)siguiente.focus({preventScroll:true});
    });
    const mas=nodo('details','agenda-tarea-mas'),resumen=nodo('summary','','Más opciones'),opciones=nodo('div','agenda-tarea-menu');
    opciones.append(estado,boton('Duplicar','',()=>abrirTarea(t,'duplicar')),boton('Eliminar','',()=>eliminar([t.id])));
    mas.append(resumen,opciones);
    acciones.append(completar,boton('Editar','',()=>abrirTarea(t)),mas);
    card.append(acciones);
    card.addEventListener('dragstart',e=>{
      if(e.target.closest('button,select,input,textarea')){e.preventDefault();return;}
      arrastrada=t.id;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',t.id);card.classList.add('en-arrastre');
    });
    card.addEventListener('dragend',()=>{arrastrada=null;card.classList.remove('en-arrastre');document.querySelectorAll('.arrastrando-sobre').forEach(c=>c.classList.remove('arrastrando-sobre'));});
    return card;
  }

  // Distribuye las tareas del día o las atrasadas en el tablero por estados.
  function renderizarDia(tareas) {
    const todas=delDia(dia,documento.tasks),visibles=delDia(dia,tareas),hechas=todas.filter(t=>t.status==='hecha').length;
    $('diaTitulo').textContent=formato(dia,{weekday:'long',day:'numeric',month:'long'});
    $('elegirDia').value=dia;$('diaAnterior').disabled=dia==='1900-01-01';$('diaSiguiente').disabled=dia==='2099-12-31';
    $('diaResumen').textContent=todas.length?todas.length+' tareas · '+hechas+' hechas · '+(todas.length-hechas)+' por completar':'No tienes tareas para este día. Pulsa «Añadir tarea» para empezar.';
    $('tablero').replaceChildren();
    Object.entries(A.estados).forEach(([estado,titulo])=>{
      const columna=nodo('section','agenda-columna');columna.dataset.estado=estado;columna.setAttribute('aria-label',titulo);
      const tarjetas=visibles.filter(t=>t.status===estado),h=nodo('h3');
      if(!tarjetas.length && estado!=='pendiente')return;
      h.append(nodo('i'),document.createTextNode(titulo),nodo('span','',String(tarjetas.length)));columna.append(h);
      tarjetas.forEach(t=>columna.append(tarjeta(t)));
      if(!tarjetas.length)columna.append(nodo('p','agenda-columna-vacia',estado==='hecha'?'Aquí irán tus pequeños logros.':estado==='curso'?'Una cosa cada vez.':'No hay tareas pendientes.'));

      columna.addEventListener('dragover',e=>{if(arrastrada){e.preventDefault();e.dataTransfer.dropEffect='move';columna.classList.add('arrastrando-sobre');}});
      columna.addEventListener('dragleave',e=>{if(!columna.contains(e.relatedTarget))columna.classList.remove('arrastrando-sobre');});
      columna.addEventListener('drop',e=>{e.preventDefault();const id=arrastrada;arrastrada=null;columna.classList.remove('arrastrando-sobre');if(id&&documento.tasks.some(t=>t.id===id))cambiarEstado(id,estado);});
      $('tablero').append(columna);
    });
    $('limpiarHechas').hidden=!hechas;
  }

  // Actualiza las vistas, los contadores y los avisos de la agenda.
  function renderizar() {
    const tareas=filtradas(),f=filtros();
    $('panelMes').hidden=vista!=='mes';$('panelDia').hidden=vista!=='dia';$('panelAtrasadas').hidden=vista!=='atrasadas';
    $('estadisticasMes').hidden=vista!=='mes';
    $('vistaMes').setAttribute('aria-pressed',String(vista==='mes'));$('vistaDia').setAttribute('aria-pressed',String(vista==='dia'));
    renderizarLateral();renderizarResumen(tareas);
    if(vista==='mes')renderizarMes(tareas);
    if(vista==='dia')renderizarDia(tareas);
    if(vista==='atrasadas') {
      const pendientes=tareas.filter(t=>t.date<hoy&&t.status!=='hecha');$('listaAtrasadas').replaceChildren();
      pendientes.forEach(t=>$('listaAtrasadas').append(tarjeta(t,true)));
      if(!pendientes.length)$('listaAtrasadas').append(nodo('p','agenda-secundario','No hay pendientes anteriores con estos filtros.'));
    }
    const activos=Boolean(f.busqueda||f.categoria||f.estado);
    $('limpiarFiltros').hidden=!activos;
    // Mantiene visibles los filtros activos para que ninguna tarea parezca desaparecer.
    if($('filtrosIndicador'))$('filtrosIndicador').hidden=!activos;
    if(activos && $('opcionesFiltros'))$('opcionesFiltros').open=true;
    const cantidad=(vista==='dia'?tareas.filter(t=>t.date===dia):vista==='mes'?tareas.filter(t=>t.date.startsWith(mes)):tareas.filter(t=>t.date<hoy&&t.status!=='hecha')).length;
    $('filtrosResumen').textContent=activos?cantidad+' tareas coinciden con los filtros.':'';
    bannerAlmacen();
  }

  // Prepara el diálogo y conserva la acción que se ejecutará al aceptar.
  function confirmar(titulo,texto,accion,etiqueta) {
    confirmacion=accion;$('confirmarTitulo').textContent=titulo;$('confirmarTexto').textContent=texto;$('aceptarConfirmacion').textContent=etiqueta||'Confirmar';$('dialogoConfirmar').showModal();
  }

  // Conecta el control cancelarConfirmacion con su acción de click.
  $('cancelarConfirmacion').addEventListener('click',()=>{$('dialogoConfirmar').close();confirmacion=null;});

  // Conecta el control dialogoConfirmar con su acción de cancel.
  $('dialogoConfirmar').addEventListener('cancel',()=>{confirmacion=null;});

  // Conecta el control aceptarConfirmacion con su acción de click.
  $('aceptarConfirmacion').addEventListener('click',()=>{const accion=confirmacion;confirmacion=null;$('dialogoConfirmar').close();if(accion)accion();});

  // Retira las tareas seleccionadas y prepara la posibilidad de deshacer el borrado.
  function eliminar(ids) {
    confirmar(ids.length===1?'¿Eliminar esta tarea?':'¿Retirar las tareas hechas?',ids.length===1?'Se elimina solo esta tarea, aunque forme parte de una repetición. Podrás deshacerlo desde el aviso.':'Se retirarán '+ids.length+' tareas hechas de este día. Podrás deshacerlo desde el aviso.',()=>{
      let retiradas=[];
      mutar(tareas=>{retiradas=tareas.filter(t=>ids.includes(t.id));return tareas.filter(t=>!ids.includes(t.id));},
        ids.length===1?'Tarea eliminada.':'Tareas retiradas.',()=>mutar(tareas=>tareas.concat(retiradas.filter(t=>!tareas.some(x=>x.id===t.id))),'Eliminación deshecha.'));
    },'Eliminar');
  }

  // Rellena el formulario para crear, editar o duplicar una tarea y abre el diálogo.
  function abrirTarea(tarea,modo,predefinidos) {
    focoAnterior=document.activeElement;editando=tarea&&modo!=='duplicar'?tarea.id:null;baseEdicion=editando?tarea.updatedAt:null;
    const t=tarea||{title:'',date:dia,time:'',category:'cuidados',priority:'normal',status:'pendiente',assignee:'',notes:'',checklist:[],...(predefinidos||{})};
    $('formTarea').reset();$('tituloDialogo').textContent=editando?'Editar tarea':modo==='duplicar'?'Duplicar tarea':'Nueva tarea';
    $('tareaTitulo').value=(modo==='duplicar'?t.title.slice(0,112)+' (copia)':t.title);$('tareaFecha').value=t.date;$('tareaHora').value=t.time;
    $('tareaCategoria').value=t.category;$('tareaPrioridad').value=t.priority;$('tareaEstado').value=modo==='duplicar'?'pendiente':t.status;
    $('tareaResponsable').value=t.assignee;$('tareaNotas').value=t.notes;$('tareaPasos').value=t.checklist.map(p=>p.text).join('\n');
    $('repeticionCampos').hidden=Boolean(editando);$('cantidadCampo').hidden=true;$('notaSerie').hidden=!(editando&&t.seriesId);$('errorTarea').textContent='';
    // Al editar, muestra los detalles que la tarea ya tenía guardados.
    if($('tareaDetalles'))$('tareaDetalles').open=Boolean(t.notes||t.assignee||t.checklist.length||t.priority==='alta'||t.seriesId||t.status==='curso');
    $('dialogoTarea').showModal();$('tareaTitulo').focus();
  }

  // Cierra el formulario y devuelve el foco al control que lo abrió.
  function cerrarTarea() {$('dialogoTarea').close();if(focoAnterior&&focoAnterior.isConnected)focoAnterior.focus({preventScroll:true});else $('nuevaTarea').focus({preventScroll:true});}

  // Conecta el control cerrarTarea con su acción de click.
  $('cerrarTarea').addEventListener('click',cerrarTarea);$('cancelarTarea').addEventListener('click',cerrarTarea);

  // Conecta el control tareaRepetir con su acción de change.
  $('tareaRepetir').addEventListener('change',()=>{$('cantidadCampo').hidden=$('tareaRepetir').value==='ninguna';$('tareaCantidad').value=$('tareaRepetir').value==='semanal'?4:7;});

  // Valida y guarda la tarea o sus repeticiones; detecta cambios realizados desde otra pestaña.
  $('formTarea').addEventListener('submit',e=>{
    e.preventDefault();$('errorTarea').textContent='';
    try {
      const textos=$('tareaPasos').value.split('\n').map(t=>t.trim()).filter(Boolean);
      if(textos.length>20||textos.some(t=>t.length>120))throw new Error('Añade hasta 20 pasos, con un máximo de 120 caracteres cada uno.');
      const anterior=editando?documento.tasks.find(t=>t.id===editando):null;
      const usados=new Set();
      const checklist=textos.map(text=>{const previo=anterior&&anterior.checklist.find(p=>p.text===text&&!usados.has(p.id));if(previo)usados.add(previo.id);return {id:previo?previo.id:A.id(),text,done:previo?previo.done:false};});
      const datos={title:$('tareaTitulo').value.trim(),date:$('tareaFecha').value,time:$('tareaHora').value,category:$('tareaCategoria').value,
        priority:$('tareaPrioridad').value,status:$('tareaEstado').value,assignee:$('tareaResponsable').value.trim(),notes:$('tareaNotas').value.trim(),checklist};
      const nuevas=editando?null:A.crearSerie(datos,$('tareaRepetir').value,Number($('tareaCantidad').value));
      const resultado=mutar(tareas=>{
        if(editando) {
          const actual=tareas.find(t=>t.id===editando);
          if(!actual || actual.updatedAt!==baseEdicion)throw new Error('Esta tarea ha cambiado en otra pestaña. Cierra el formulario y vuelve a abrirla para ver la última versión.');
          return tareas.map(t=>t.id===editando?A.validarTarea({...t,...datos,updatedAt:new Date().toISOString()}):t);
        }
        return tareas.concat(nuevas);
      },editando?'Cambios guardados.':nuevas.length>1?nuevas.length+' tareas creadas. Cada repetición puede editarse por separado.':'Tarea guardada. Ya tienes un paso preparado.');
      if(resultado){
        dia=editando?datos.date:nuevas[0].date;mes=dia.slice(0,7);
        const guardada=documento.tasks.find(t=>t.id===(editando||nuevas[0].id));
        if(guardada && !A.filtrar([guardada],filtros()).length){
          $('buscarTareas').value='';$('filtroCategoria').value='';$('filtroEstado').value='';
          aviso('Tarea guardada. Se han quitado los filtros para que puedas verla.');
        }
        if(vista==='atrasadas')vista='dia';
        cerrarTarea();renderizar();
      }
      else $('errorTarea').textContent=ultimoError||'No se ha podido guardar. Tus cambios siguen en este formulario.';
    }catch(error){$('errorTarea').textContent=error.message;}
  });

  // Abre el formulario para crear una tarea.
  $('nuevaTarea').addEventListener('click',()=>abrirTarea());

  // Conecta el control vistaMes con su acción de click.
  $('vistaMes').addEventListener('click',()=>cambiarVista('mes'));$('vistaDia').addEventListener('click',()=>cambiarVista('dia',dia,true));

  // Conecta el control volverMes con su acción de click.
  $('volverMes').addEventListener('click',()=>cambiarVista('mes'));$('atrasadasVolver').addEventListener('click',()=>cambiarVista('mes'));

  // Conecta el control mesAnterior con su acción de click.
  $('mesAnterior').addEventListener('click',()=>irMes(-1));$('mesSiguiente').addEventListener('click',()=>irMes(1));

  // Conecta el control mesHoy con su acción de click.
  $('mesHoy').addEventListener('click',()=>cambiarVista('mes',hoy));$('irHoy').addEventListener('click',()=>cambiarVista('dia',hoy,true));

  // Conecta el control diaAnterior con su acción de click.
  $('diaAnterior').addEventListener('click',()=>cambiarVista('dia',A.sumarDias(dia,-1),true));$('diaSiguiente').addEventListener('click',()=>cambiarVista('dia',A.sumarDias(dia,1),true));

  // Conecta el control elegirMes con su acción de change.
  $('elegirMes').addEventListener('change',e=>{if(A.fechaValida(e.target.value+'-01'))cambiarVista('mes',e.target.value+'-01');});

  // Conecta el control elegirDia con su acción de change.
  $('elegirDia').addEventListener('change',e=>{if(A.fechaValida(e.target.value))cambiarVista('dia',e.target.value,true);});
  ['buscarTareas','filtroCategoria','filtroEstado'].forEach(id=>$(id).addEventListener(id==='buscarTareas'?'input':'change',renderizar));

  // Restablece los filtros para mostrar todas las tareas.
  $('limpiarFiltros').addEventListener('click',()=>{$('buscarTareas').value='';$('filtroCategoria').value='';$('filtroEstado').value='';renderizar();$('buscarTareas').focus();});

  // Conecta el control verAtrasadas con su acción de click.
  $('verAtrasadas').addEventListener('click',()=>cambiarVista('atrasadas',null,true));

  // Conecta el control limpiarHechas con su acción de click.
  $('limpiarHechas').addEventListener('click',()=>eliminar(documento.tasks.filter(t=>t.date===dia&&t.status==='hecha').map(t=>t.id)));

  // Valores iniciales de las tareas creadas desde los accesos rápidos.
  const plantillas={paseo:{title:'Paseo y compañía',category:'cuidados'},comida:{title:'Preparar las comidas',category:'hogar'},cita:{title:'Una cita o visita',category:'citas'},pausa:{title:'Un momento para mí',category:'personal',notes:'Un pequeño descanso también es importante.'}};
  document.querySelectorAll('[data-plantilla]').forEach(b=>b.addEventListener('click',()=>abrirTarea(null,null,plantillas[b.dataset.plantilla])));

  // Lee los datos actuales y descarga una copia JSON de la agenda.
  $('exportar').addEventListener('click',()=>{try{documento=almacen.cargar();descargar(JSON.stringify({...documento,exportedAt:new Date().toISOString()},null,2),'cuidapoyo-calendario-'+hoy+'.json');aviso('Copia descargada. Guárdala en un lugar de confianza.');}catch(e){aviso(e.message);}});

  // Conecta el control importar con su acción de click.
  $('importar').addEventListener('click',()=>{$('archivoImportar').value='';$('archivoImportar').click();});

  // Valida la copia y pide confirmación antes de añadir tareas sin duplicar las existentes.
  $('archivoImportar').addEventListener('change',async e=>{
    const archivo=e.target.files[0];if(!archivo)return;
    try{
      if(archivo.size>5000000)throw new Error('La copia no puede superar los 5 MB.');
      const copia=A.validarDocumento(JSON.parse(await archivo.text()));
      confirmar('Importar una copia', 'La copia contiene '+copia.tasks.length+' tareas. Se añadirán las que no estén ya en tu agenda. Las tareas existentes conservarán sus datos.',()=>{
        let añadidas=0;
        mutar(tareas=>{const ids=new Set(tareas.map(t=>t.id));const nuevas=copia.tasks.filter(t=>!ids.has(t.id));añadidas=nuevas.length;return tareas.concat(nuevas);},'Copia importada.');
        anunciar('Importación finalizada. '+añadidas+' tareas nuevas.');
      },'Añadir tareas');
    }catch(error){aviso(error instanceof SyntaxError?'El archivo no contiene una copia JSON válida.':error.message);}
  });
  window.addEventListener('storage',e=>{
    if(e.key===A.CLAVE || e.key===window.CuidaCuenta?.CLAVE || e.key===null) {
      try{const actual=window.CuidaCuenta?.repositorio.actual();if(actual?.email!==contexto?.email||actual?.activePerson!==perfilInicial){location.reload();return;}documento=almacen.cargar();renderizar();anunciar('Agenda actualizada desde otra pestaña.');}catch(error){aviso(error.message);bannerAlmacen();}
    }
  });
  // Actualiza el día si la página permanece abierta durante la noche.
  window.addEventListener('focus',()=>{const actual=A.hoy();if(actual!==hoy){hoy=actual;renderizar();anunciar('La referencia de hoy se ha actualizado.');}});
  renderizar();
})();

