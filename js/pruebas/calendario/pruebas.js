// Pruebas de agenda: fechas, validación, persistencia y acciones en la página real.

/* Ejecutar en un perfil de navegador aislado. No usa bibliotecas externas. */
(async function () {
  'use strict';
  const A=CuidaAgenda, resultados=[], $=id=>document.getElementById(id);
  const comprobar=(nombre,ok,detalle)=>resultados.push({nombre,ok:Boolean(ok),detalle:ok?'':String(detalle||'Condición incumplida')});
  const igual=(nombre,a,b)=>comprobar(nombre,JSON.stringify(a)===JSON.stringify(b),JSON.stringify(a)+' / '+JSON.stringify(b));
  const rechaza=(nombre,accion)=>{try{accion();comprobar(nombre,false);}catch(e){comprobar(nombre,true);}};

  // Almacenamiento simulado para comprobar los datos sin modificar cuentas reales.
  const memoria=()=>{const datos=new Map();return {getItem:k=>datos.has(k)?datos.get(k):null,setItem:(k,v)=>datos.set(k,v),removeItem:k=>datos.delete(k)};};

  // Casos de fechas: formato, años bisiestos, cambios de mes y de horario.
  const fecha='2026-11-24';
  comprobar('Año bisiesto',A.fechaValida('2028-02-29'));comprobar('Rechaza día imposible',!A.fechaValida('2026-02-29'));
  comprobar('Rechaza formato ambiguo',!A.fechaValida('24/11/2026'));comprobar('Rechaza meses imposibles',!A.fechaValida('2026-13-01'));
  igual('Cambio de año',A.cambiarMes('2026-12',1),'2027-01');igual('Cambio inverso de año',A.cambiarMes('2026-01',-1),'2025-12');
  igual('No sale del límite superior',A.cambiarMes('2099-12',1),'2099-12');igual('No sale del límite inferior',A.cambiarMes('1900-01',-1),'1900-01');
  igual('Sumar día en cambio de mes',A.sumarDias('2026-01-31',1),'2026-02-01');
  igual('Cruza cambio de horario de primavera',A.sumarDias('2026-03-28',1),'2026-03-29');
  igual('Cruza cambio de horario de otoño',A.sumarDias('2026-10-24',1),'2026-10-25');
  for(const mes of ['2026-01','2026-02','2026-11','2026-12','2028-02']) {
    const celdas=A.celdasMes(mes),delMes=celdas.filter(d=>d.delMes);
    comprobar(mes+': semanas completas',celdas.length%7===0);
    comprobar(mes+': empieza en lunes',A.fechaObjeto(celdas[0].fecha).getDay()===1);
    comprobar(mes+': termina en domingo',A.fechaObjeto(celdas.at(-1).fecha).getDay()===0);
    comprobar(mes+': fechas únicas',new Set(celdas.map(d=>d.fecha)).size===celdas.length);
    comprobar(mes+': todos los días',delMes.length===new Date(Number(mes.slice(0,4)),Number(mes.slice(5,7)),0).getDate());
  }

  // Casos de tareas: valores iniciales y rechazo de campos no válidos.
  const tarea=A.crearTarea({title:'Paseo',date:fecha,time:'09:30',assignee:'Ana'});
  igual('Estado inicial',tarea.status,'pendiente');comprobar('Identificador generado',tarea.id.length>5);
  rechaza('No acepta título vacío',()=>A.crearTarea({title:' ',date:fecha}));
  rechaza('No acepta hora imposible',()=>A.crearTarea({title:'Paseo',date:fecha,time:'25:30'}));
  rechaza('No acepta estados ajenos',()=>A.crearTarea({title:'Paseo',date:fecha,status:'borrada'}));
  rechaza('No acepta identificador inyectado',()=>A.validarTarea({...tarea,id:'"] img'}));
  rechaza('No acepta copia ajena',()=>A.validarDocumento({version:2,tasks:[]}));
  rechaza('No acepta ids duplicados',()=>A.validarDocumento({version:1,tasks:[tarea,tarea]}));

  // Casos de repetición: tareas diarias, semanales y en días laborables.
  const diaria=A.crearSerie({title:'Agua',date:fecha},'diaria',7);
  igual('Siete tareas diarias',diaria.length,7);igual('Última diaria',diaria.at(-1).date,'2026-11-30');
  comprobar('Serie con id común',diaria.every(t=>t.seriesId===diaria[0].seriesId));comprobar('Tareas con ids diferentes',new Set(diaria.map(t=>t.id)).size===7);
  const semanal=A.crearSerie({title:'Visita',date:fecha},'semanal',4);igual('Semanal cruza mes',semanal.at(-1).date,'2026-12-15');
  const laborables=A.crearSerie({title:'Aseo',date:'2026-11-27'},'laborables',3);igual('Salta fin de semana',laborables.map(t=>t.date),['2026-11-27','2026-11-30','2026-12-01']);
  rechaza('No crea repetición sin límite',()=>A.crearSerie({title:'Agua',date:fecha},'diaria',100000));
  igual('Búsqueda sin tildes y por responsable',A.filtrar([tarea],{busqueda:'ana'}).length,1);
  const conTilde=A.crearTarea({title:'Preparar alimentación',date:fecha});igual('Búsqueda sin acentos',A.filtrar([conTilde],{busqueda:'ALIMENTACION'}).length,1);
  igual('Filtro de estado',A.filtrar([tarea],{estado:'hecha'}).length,0);

  // Casos de persistencia, cambios externos, datos dañados y falta de espacio.
  const st=memoria(),almacen=A.crearAlmacen(st,'prueba');igual('Almacén nuevo vacío',almacen.cargar().tasks.length,0);
  almacen.modificar(ts=>ts.concat(tarea));igual('Persistencia',A.crearAlmacen(st,'prueba').cargar().tasks[0].title,'Paseo');
  const otro=A.crearAlmacen(st,'prueba');otro.modificar(ts=>ts.concat(conTilde));almacen.modificar(ts=>ts.map(t=>t.id===tarea.id?{...t,status:'hecha'}:t));
  igual('Lee cambios de otra pestaña antes de guardar',almacen.cargar().tasks.length,2);
  const bloqueado={getItem(){throw new Error('Bloqueado');}},temporal=A.crearAlmacen(bloqueado);temporal.cargar();temporal.modificar(ts=>ts.concat(tarea));
  comprobar('Informa almacenamiento temporal',temporal.estado().temporal);igual('Conserva datos en memoria si no hay almacenamiento',temporal.cargar().tasks.length,1);
  const corrupto=memoria();corrupto.setItem('x','mal-json');const protegido=A.crearAlmacen(corrupto,'x');rechaza('Detecta datos corruptos',()=>protegido.cargar());
  rechaza('No sobrescribe datos corruptos',()=>protegido.guardar({version:1,tasks:[]}));igual('Conserva original corrupto',corrupto.getItem('x'),'mal-json');
  protegido.recuperar();igual('Recuperación explícita',protegido.cargar().tasks.length,0);
  const sinEspacio={getItem:()=>null,setItem(){throw new Error('QuotaExceededError');}},cuota=A.crearAlmacen(sinEspacio);cuota.cargar();
  rechaza('No finge guardar si se agota espacio',()=>cuota.modificar(ts=>ts.concat(tarea)));
  // Integración real: la copia inicial se restaura incluso si falla una aserción.
  let original,puedeRestaurar=false,storagePrueba=null;
  try {
    const restaurar=()=>{if(puedeRestaurar){if(original===null)storagePrueba.removeItem(A.CLAVE);else storagePrueba.setItem(A.CLAVE,original);puedeRestaurar=false;}};
    window.addEventListener('beforeunload',restaurar,{once:true});
    const marco=$('aplicacion'),errores=[],pausa=ms=>new Promise(r=>setTimeout(r,ms));
    marco.src='../../calendario.html';
    await new Promise(resolve=>marco.addEventListener('load',resolve,{once:true}));
    const w=marco.contentWindow,d=marco.contentDocument,el=id=>d.getElementById(id);
    storagePrueba=w.localStorage;original=storagePrueba.getItem(A.CLAVE);puedeRestaurar=true;storagePrueba.removeItem(A.CLAVE);
    w.dispatchEvent(new w.StorageEvent('storage',{key:A.CLAVE,newValue:null}));
    w.addEventListener('error',e=>errores.push(e.message));w.addEventListener('unhandledrejection',e=>errores.push(String(e.reason)));
    const click=id=>el(id).click(),evento=(id,tipo)=>el(id).dispatchEvent(new w.Event(tipo,{bubbles:true}));
    const tareas=()=>JSON.parse(w.localStorage.getItem(A.CLAVE)||'{"tasks":[]}').tasks;
    const hoy=w.CuidaAgenda.hoy();
    comprobar('Página real carga el calendario',d.querySelectorAll('.agenda-dia-celda').length>=28);
    comprobar('Sin tareas de ejemplo inventadas',tareas().length===0);
    d.querySelector('[data-plantilla="pausa"]').click();
    comprobar('Plantilla editable de tiempo propio',el('tareaTitulo').value==='Un momento para mí' && el('tareaCategoria').value==='personal');
    click('cancelarTarea');igual('Cancelar no crea tareas',tareas().length,0);
    click('nuevaTarea');comprobar('Abre diálogo accesible',el('dialogoTarea').open);
    el('formTarea').requestSubmit();comprobar('Un título vacío no se guarda',el('dialogoTarea').open && tareas().length===0);
    el('tareaTitulo').value='Paseo de prueba';el('tareaFecha').value=hoy;el('tareaHora').value='09:30';el('tareaResponsable').value='Ana';el('tareaPrioridad').value='alta';el('tareaPasos').value='Preparar agua\nSalir al jardín';
    el('formTarea').requestSubmit();await pausa(50);
    comprobar('Enviar no recarga la página',!el('dialogoTarea').open && d.querySelectorAll('.agenda-dia-celda').length>=28);
    igual('Crea tarea real persistente',tareas().length,1);
    const primera=tareas()[0];comprobar('Día muestra la tarea',d.querySelector('[data-fecha="'+hoy+'"]').textContent.includes('Paseo de prueba'));
    d.querySelector('[data-fecha="'+hoy+'"]').click();comprobar('Día abre tablero con tres columnas',!el('panelDia').hidden && d.querySelectorAll('.agenda-columna').length===3);
    comprobar('Responsable visible',el('tablero').textContent.includes('Ana'));comprobar('Prioridad visible',el('tablero').textContent.includes('Importante'));
    let card=d.querySelector('[data-id="'+primera.id+'"]');card.querySelector('select').value='curso';card.querySelector('select').dispatchEvent(new w.Event('change',{bubbles:true}));
    comprobar('Selector mueve a En curso',d.querySelector('[data-estado="curso"] [data-id="'+primera.id+'"]'));
    card=d.querySelector('[data-id="'+primera.id+'"]');const transferencia=new w.DataTransfer();
    card.dispatchEvent(new w.DragEvent('dragstart',{bubbles:true,dataTransfer:transferencia}));
    d.querySelector('[data-estado="hecha"]').dispatchEvent(new w.DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:transferencia}));
    igual('Arrastrar marca como hecha',tareas()[0].status,'hecha');
    const paso=d.querySelector('[data-paso]');paso.click();comprobar('Checklist se guarda',tareas()[0].checklist[0].done);
    card=d.querySelector('[data-id="'+primera.id+'"]');Array.from(card.querySelectorAll('button')).find(b=>b.textContent==='Editar').click();
    el('tareaNotas').value='Recordar la bolsa';el('tareaTitulo').value='Paseo editado';el('tareaFecha').value=A.sumarDias(hoy,1);el('formTarea').requestSubmit();
    igual('Editar guarda sin duplicar',tareas().length,1);igual('Título editado',tareas()[0].title,'Paseo editado');igual('Editar mueve de día',tareas()[0].date,A.sumarDias(hoy,1));
    comprobar('Editar conserva pasos hechos',tareas()[0].checklist[0].done);
    card=d.querySelector('[data-id="'+primera.id+'"]');Array.from(card.querySelectorAll('button')).find(b=>b.textContent==='Duplicar').click();
    el('formTarea').requestSubmit();igual('Duplicar crea otra tarea',tareas().length,2);
    comprobar('Copia empieza pendiente',tareas().find(t=>t.id!==primera.id).status==='pendiente');
    card=d.querySelector('[data-id="'+primera.id+'"]');Array.from(card.querySelectorAll('button')).find(b=>b.textContent==='Eliminar').click();comprobar('Eliminar pide confirmación',el('dialogoConfirmar').open);click('aceptarConfirmacion');
    igual('Elimina solo la elegida',tareas().length,1);click('deshacer');igual('Deshacer restaura la tarea',tareas().length,2);
    el('buscarTareas').value='inexistente';evento('buscarTareas','input');igual('Filtro oculta tareas sin coincidencia',d.querySelectorAll('.agenda-tarjeta').length,0);
    click('limpiarFiltros');comprobar('Quitar filtros recupera tareas',d.querySelectorAll('.agenda-tarjeta').length===2);
    click('nuevaTarea');el('tareaTitulo').value='Serie de prueba';el('tareaFecha').value=hoy;el('tareaRepetir').value='semanal';evento('tareaRepetir','change');el('tareaCantidad').value=3;el('formTarea').requestSubmit();
    igual('Repetición semanal guarda tres tareas',tareas().filter(t=>t.title==='Serie de prueba').length,3);
    click('nuevaTarea');el('tareaTitulo').value='<img src=x onerror="window.inyectado=true">';el('formTarea').requestSubmit();
    comprobar('No interpreta HTML en tareas',!w.inyectado && d.querySelectorAll('.agenda-tarjeta img').length===0);
    const antesRecarga=tareas().length;
    marco.contentWindow.location.reload();await new Promise(resolve=>marco.addEventListener('load',resolve,{once:true}));
    storagePrueba=w.localStorage;
    igual('Recarga conserva tareas',tareas().length,antesRecarga);
    w.addEventListener('error',e=>errores.push(e.message));w.addEventListener('unhandledrejection',e=>errores.push(String(e.reason)));
    const doc=marco.contentDocument,ee=id=>doc.getElementById(id);
    ee('vistaDia').click();
    const editar=Array.from(doc.querySelectorAll('.agenda-tarjeta button')).find(b=>b.textContent==='Editar');editar.click();
    const abiertas=tareas(),idEditado=abiertas.find(t=>t.title===ee('tareaTitulo').value).id;
    storagePrueba.setItem(A.CLAVE,JSON.stringify({version:1,tasks:abiertas.map(t=>t.id===idEditado?{...t,updatedAt:'2099-01-01T00:00:00.000Z'}:t)}));
    ee('tareaTitulo').value='No debe sobrescribir';ee('formTarea').requestSubmit();
    comprobar('Evita sobrescribir edición de otra pestaña',ee('dialogoTarea').open && !tareas().some(t=>t.title==='No debe sobrescribir'));
    comprobar('Explica conflicto dentro del formulario',ee('errorTarea').textContent.includes('otra pestaña'));
    ee('cancelarTarea').click();
    const antesImportar=tareas().length,copiaA=A.crearTarea({title:'Importada de prueba',date:hoy});
    const archivo=new w.File([JSON.stringify({version:1,tasks:[copiaA]})],'copia.json',{type:'application/json'});
    const dt=new w.DataTransfer();dt.items.add(archivo);ee('archivoImportar').files=dt.files;ee('archivoImportar').dispatchEvent(new w.Event('change',{bubbles:true}));
    await pausa(100);comprobar('Importación muestra confirmación',ee('dialogoConfirmar').open);ee('aceptarConfirmacion').click();
    igual('Importa sin eliminar tareas existentes',tareas().length,antesImportar+1);
    ee('archivoImportar').files=dt.files;ee('archivoImportar').dispatchEvent(new w.Event('change',{bubbles:true}));await pausa(100);ee('aceptarConfirmacion').click();
    igual('No duplica al importar la misma copia',tareas().length,antesImportar+1);
    ee('filtroEstado').value='hecha';ee('filtroEstado').dispatchEvent(new w.Event('change',{bubbles:true}));
    ee('nuevaTarea').click();ee('tareaTitulo').value='Visible tras guardar';ee('formTarea').requestSubmit();
    comprobar('Nueva tarea no queda oculta por filtros',ee('filtroEstado').value==='' && ee('tablero').textContent.includes('Visible tras guardar'));
    const originalUrl=w.URL.createObjectURL,originalClick=w.HTMLAnchorElement.prototype.click;
    let blobExportado;
    w.URL.createObjectURL=blob=>{blobExportado=blob;return originalUrl.call(w.URL,blob);};
    w.HTMLAnchorElement.prototype.click=function(){};
    ee('exportar').click();
    w.URL.createObjectURL=originalUrl;w.HTMLAnchorElement.prototype.click=originalClick;
    comprobar('Exporta una copia JSON completa',blobExportado && JSON.parse(await blobExportado.text()).tasks.length===tareas().length);
    ee('vistaMes').click();
    let foco=doc.querySelector('[data-fecha="'+hoy+'"]');foco.focus();foco.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
    comprobar('Flechas desplazan el foco del calendario',doc.activeElement.dataset.fecha===A.sumarDias(hoy,1));
    const tema=doc.documentElement.dataset.tema;ee('temaBoton').click();comprobar('Funciona modo oscuro',doc.documentElement.dataset.tema!==tema);ee('temaBoton').click();
    for(const ancho of [375,320]) {
      marco.style.width=ancho+'px';await pausa(50);
      comprobar('Mes sin desbordamiento a '+ancho+'px',doc.documentElement.scrollWidth<=ancho+1);
      ee('vistaDia').click();comprobar('Tablero sin desbordamiento a '+ancho+'px',doc.documentElement.scrollWidth<=ancho+1);ee('filtroEstado').value='hecha';ee('filtroEstado').dispatchEvent(new w.Event('change',{bubbles:true}));
    ee('nuevaTarea').click();ee('tareaTitulo').value='Visible tras guardar';ee('formTarea').requestSubmit();
    comprobar('Nueva tarea no queda oculta por filtros',ee('filtroEstado').value==='' && ee('tablero').textContent.includes('Visible tras guardar'));
    const originalUrl=w.URL.createObjectURL,originalClick=w.HTMLAnchorElement.prototype.click;
    let blobExportado;
    w.URL.createObjectURL=blob=>{blobExportado=blob;return originalUrl.call(w.URL,blob);};
    w.HTMLAnchorElement.prototype.click=function(){};
    ee('exportar').click();
    w.URL.createObjectURL=originalUrl;w.HTMLAnchorElement.prototype.click=originalClick;
    comprobar('Exporta una copia JSON completa',blobExportado && JSON.parse(await blobExportado.text()).tasks.length===tareas().length);
    ee('vistaMes').click();
    }
    comprobar('Sin errores de JavaScript en acciones probadas',errores.length===0,errores.join(', '));
    marco.style.width='100%';
    restaurar();
  }catch(error){comprobar('Integración completa',false,error.stack||error.message);}
  finally{if(puedeRestaurar){if(original===null)storagePrueba.removeItem(A.CLAVE);else storagePrueba.setItem(A.CLAVE,original);}}
  $('resultados').replaceChildren();
  resultados.forEach(r=>{const li=document.createElement('li');li.textContent=(r.ok?'OK · ':'FALLO · ')+r.nombre+(r.detalle?' — '+r.detalle:'');if(!r.ok)li.className='fallo';$('resultados').append(li);});
  const fallos=resultados.filter(r=>!r.ok);
  $('resumen').textContent=resultados.length+' comprobaciones; '+fallos.length+' fallos.';
  document.body.dataset.pruebas=fallos.length?'fallo':'ok';window.resultadosAgenda=resultados;
  if(fallos.length)console.error('Pruebas fallidas',fallos);
})().catch(e=>{document.body.dataset.pruebas='error';document.getElementById('resumen').textContent=e.message;console.error(e);});
