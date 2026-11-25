/* Datos y fechas de la agenda. Sin dependencias ni llamadas de red. */
(function (raiz) {
  'use strict';
  const CLAVE='cuidapoyo-agenda-v1';
  const estados={pendiente:'Por hacer',curso:'En curso',hecha:'Hecho'};
  const categorias={cuidados:'Cuidados',citas:'Citas',hogar:'Hogar',personal:'Tiempo para mí'};
  const copiar=valor=>JSON.parse(JSON.stringify(valor));
  const id=()=>raiz.crypto && raiz.crypto.randomUUID ? raiz.crypto.randomUUID() : Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  function fechaValida(fecha) {
    if(typeof fecha!=='string' || !/^(19|20)\d\d-\d\d-\d\d$/.test(fecha)) return false;
    const [a,m,d]=fecha.split('-').map(Number), f=new Date(a,m-1,d,12);
    return f.getFullYear()===a && f.getMonth()===m-1 && f.getDate()===d;
  }
  function localFecha(fecha) {
    return fecha.getFullYear()+'-'+String(fecha.getMonth()+1).padStart(2,'0')+'-'+String(fecha.getDate()).padStart(2,'0');
  }
  function hoy() {
    const partes=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const valor=tipo=>partes.find(p=>p.type===tipo).value;
    return valor('year')+'-'+valor('month')+'-'+valor('day');
  }
  function fechaObjeto(fecha) { const [a,m,d]=fecha.split('-').map(Number); return new Date(a,m-1,d,12); }
  function sumarDias(fecha,cantidad) { const f=fechaObjeto(fecha);f.setDate(f.getDate()+cantidad);return localFecha(f); }
  function cambiarMes(mes,delta) {
    const f=fechaObjeto(mes+'-01');f.setMonth(f.getMonth()+delta);
    const salida=localFecha(f).slice(0,7);
    if(!fechaValida(salida+'-01')) return mes;
    return salida;
  }
  function celdasMes(mes) {
    const primero=mes+'-01';
    if(!fechaValida(primero)) throw new Error('Mes no válido.');
    const f=fechaObjeto(primero), inicio=sumarDias(primero,-((f.getDay()+6)%7));
    const ultimo=new Date(f.getFullYear(),f.getMonth()+1,0,12).getDate();
    const total=Math.ceil((((f.getDay()+6)%7)+ultimo)/7)*7;
    return Array.from({length:total},(_,i)=>({fecha:sumarDias(inicio,i),delMes:sumarDias(inicio,i).startsWith(mes)}));
  }
  function texto(valor,max,nombre,obligatorio) {
    if(typeof valor!=='string' || valor.length>max || (obligatorio && !valor.trim())) throw new Error('Revisa '+nombre+'.');
    return valor.trim();
  }
  function validarTarea(t) {
    if(!t || typeof t!=='object' || Array.isArray(t)) throw new Error('Hay una tarea no válida.');
    if(!fechaValida(t.date)) throw new Error('Hay una fecha no válida.');
    if(!Object.hasOwn(estados,t.status) || !Object.hasOwn(categorias,t.category) || !['normal','alta'].includes(t.priority)) throw new Error('Revisa el estado, la categoría o la prioridad.');
    if(typeof t.time!=='string' || (t.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(t.time))) throw new Error('La hora no es válida.');
    if(!Array.isArray(t.checklist) || t.checklist.length>20) throw new Error('Puedes añadir hasta 20 pasos.');
    if(![t.createdAt,t.updatedAt].every(v=>typeof v==='string' && Number.isFinite(Date.parse(v)))) throw new Error('La fecha de edición no es válida.');
    const identificadores=[t.id,t.seriesId,...t.checklist.map(p=>p.id)].filter(v=>v!==null);
    if(identificadores.some(v=>typeof v!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(v))) throw new Error('Identificador de tarea o paso no válido.');
    if(t.checklist.some(p=>typeof p.done!=='boolean')) throw new Error('El estado de un paso no es válido.');
    const checklist=t.checklist.map(p=>({id:texto(p.id,100,'el identificador del paso',true),text:texto(p.text,120,'los pasos',true),done:p.done===true}));
    if(new Set(checklist.map(p=>p.id)).size!==checklist.length) throw new Error('Hay pasos duplicados.');
    return {id:texto(t.id,100,'el identificador',true),title:texto(t.title,120,'el título',true),date:t.date,time:t.time,
      category:t.category,priority:t.priority,status:t.status,notes:texto(t.notes,2000,'las notas',false),
      assignee:texto(t.assignee,80,'la persona responsable',false),checklist,
      seriesId:t.seriesId===null?null:texto(t.seriesId,100,'la serie',true),
      createdAt:texto(t.createdAt,40,'la fecha de creación',true),updatedAt:texto(t.updatedAt,40,'la fecha de edición',true)};
  }
  function validarDocumento(documento) {
    if(!documento || documento.version!==1 || !Array.isArray(documento.tasks) || documento.tasks.length>10000) throw new Error('La copia debe ser de CuidApoyo y contener hasta 10.000 tareas.');
    const tasks=documento.tasks.map(validarTarea);
    if(new Set(tasks.map(t=>t.id)).size!==tasks.length) throw new Error('La copia contiene tareas duplicadas.');
    return {version:1,tasks};
  }
  function crearTarea(datos) {
    const ahora=new Date().toISOString();
    return validarTarea({id:id(),title:datos.title,date:datos.date,time:datos.time||'',category:datos.category||'cuidados',
      priority:datos.priority||'normal',status:datos.status||'pendiente',notes:datos.notes||'',assignee:datos.assignee||'',
      checklist:datos.checklist||[],seriesId:datos.seriesId||null,createdAt:ahora,updatedAt:ahora});
  }
  function crearSerie(datos,tipo,cantidad) {
    if(!['ninguna','diaria','semanal','laborables'].includes(tipo)) throw new Error('Repetición no válida.');
    if(!Number.isInteger(cantidad) || cantidad<1 || cantidad>52) throw new Error('Elige entre 1 y 52 tareas.');
    const grupo=tipo==='ninguna'?null:id(), tareas=[];
    let fecha=datos.date;
    for(let i=0;i<(tipo==='ninguna'?1:cantidad);i++) {
      if(tipo==='laborables') while([0,6].includes(fechaObjeto(fecha).getDay())) fecha=sumarDias(fecha,1);
      tareas.push(crearTarea({...datos,date:fecha,seriesId:grupo,checklist:(datos.checklist||[]).map(p=>({...p,id:id(),done:false}))}));
      fecha=sumarDias(fecha,tipo==='semanal'?7:1);
    }
    return tareas;
  }
  function ordenar(tareas) { return tareas.slice().sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'99:99').localeCompare(b.time||'99:99')||(a.priority===b.priority?0:a.priority==='alta'?-1:1)||a.createdAt.localeCompare(b.createdAt)); }
  function filtrar(tareas,filtros) {
    const normal=t=>t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const q=normal(filtros.busqueda||'').trim();
    return ordenar(tareas.filter(t=>(!filtros.categoria || t.category===filtros.categoria) &&
      (!filtros.estado || t.status===filtros.estado) && (!q || normal(t.title+' '+t.notes+' '+t.assignee).includes(q))));
  }
  function crearAlmacen(storage,clave) {
    clave=clave||CLAVE;
    let memoria={version:1,tasks:[]}, temporal=false, corrupto=false, original='';
    function cargar() {
      let raw;
      try {raw=storage.getItem(clave);} catch(e) {if(storage && storage.estricto) throw e;temporal=true;return copiar(memoria);}
      if(!raw) {corrupto=false;memoria={version:1,tasks:[]};return copiar(memoria);}
      original=raw;
      try {memoria=validarDocumento(JSON.parse(raw));corrupto=false;}
      catch(e) {corrupto=true;throw new Error('No se puede leer la agenda guardada. Puedes descargar los datos originales antes de recuperarla.');}
      return copiar(memoria);
    }
    function guardar(documento) {
      const valido=validarDocumento(documento);
      if(corrupto) throw new Error('Recupera los datos guardados antes de añadir cambios.');
      if(!temporal) {
        try {storage.setItem(clave,JSON.stringify(valido));}
        catch(e) {throw new Error('No se ha guardado el cambio. El navegador no permite guardar más datos. Descarga una copia y revisa su almacenamiento.');}
      }
      memoria=valido;
      return copiar(memoria);
    }
    function modificar(mutacion) {
      const actual=temporal?copiar(memoria):cargar();
      const tareas=mutacion(copiar(actual.tasks));
      return guardar({version:1,tasks:tareas});
    }
    function recuperar() {if(!corrupto)return cargar();storage.removeItem(clave);corrupto=false;original='';memoria={version:1,tasks:[]};return copiar(memoria);}
    return {cargar,modificar,guardar,recuperar,estado:()=>({temporal,corrupto,original})};
  }
  raiz.CuidaAgenda={CLAVE,estados,categorias,id,hoy,fechaValida,fechaObjeto,localFecha,sumarDias,cambiarMes,celdasMes,crearTarea,crearSerie,validarDocumento,validarTarea,ordenar,filtrar,crearAlmacen};
})(typeof window!=='undefined'?window:globalThis);
