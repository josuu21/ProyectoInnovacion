// Espacio personal: vistas, formularios y acciones para organizar los cuidados.

/* Vistas y acciones del espacio personal. Sin dependencias ni peticiones de red. */
(function(){
  'use strict';
  const root=document.getElementById('cuentaApp');if(!root)return;
  const C=window.CuidaCuenta,R=C.repositorio,A=window.CuidaAgenda;
  const {e,icon,campo,boton,vacio}=window.CuidaUI;
  const estado=document.getElementById('cuentaEstado');
  const S=window.CuidaSimple;
  const secciones=[['inicio','Mi espacio','home'],['personas','Persona a mi cuidado','users'],['plan','Mis tareas','check'],['bienestar','Mi bienestar','heart']];
  let nuevaPausa=false;
  let usuario=null,perfil=null,wizard=null,modo='login',fechaRegistro=A.hoy(),editandoTarea=null,confirmacion=null,focoConfirmacion=null;
  const hoy=()=>A.hoy(),formato=f=>new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short'}).format(A.fechaObjeto(f));

  // Muestra un mensaje de estado con el resultado de una acción.
  function notificar(texto,error=false){estado.textContent=texto;estado.className='cp-aviso'+(error?' cp-error':'');estado.setAttribute('role',error?'alert':'status');estado.hidden=false;}

  // Actualiza los datos de la cuenta utilizados por la interfaz.
  function actualizar(){usuario=R.actual();perfil=usuario?.people.find(p=>p.id===usuario.activePerson)||null;}

  // Resuelve la sección de la URL y usa el inicio si no es válida.
  function seccion(){const id=location.hash.slice(1);return [...secciones.map(s=>s[0]),'configuracion','recursos','favoritos','seguimiento','calendario'].includes(id)?id:'inicio';}

  // Navega a una sección o vuelve a dibujarla si ya está seleccionada.
  function ir(id){if(seccion()===id)render();else location.hash=id;}

  // Construye el título, la descripción y las acciones de cabecera de una vista.
  function cabecera(titulo,texto,extra=''){return `<div class="cp-titulo"><div><p class="rotulo">MI ESPACIO · CUIDAPOYO</p><h1 id="cp-titulo" tabindex="-1">${titulo}</h1><p>${texto}</p></div>${extra}</div>`;}

  // Obtiene las tareas validadas del perfil activo.
  function leerTareas(){return perfil?A.validarDocumento(perfil.agenda).tasks:[];}

  // Aplica cambios a las tareas del perfil y valida el documento antes de guardarlo.
  function guardarTareas(mutacion){if(!perfil)throw new Error('Añade o selecciona una persona para organizar sus tareas.');R.cambiarPersona(perfil.id,p=>{p.agenda=A.validarDocumento({version:1,tasks:mutacion(A.validarDocumento(p.agenda).tasks)});});}

  // Reconstruye el panel según la sesión, el perfil y la sección actual.
  function render(foco=false){
    try{
      actualizar();
      if(!usuario){wizard=null;root.innerHTML=acceso();}
      else {
        // La configuración se inicia o retoma solo a petición del usuario.
        
        if(wizard)root.innerHTML=asistente();
        else {
          const id=seccion();
          root.innerHTML=`<div class="cp-layout cp-simple"><aside class="cp-lateral"><a class="cp-espacio" href="#inicio">${icon('heart')} Tu espacio de cuidado</a><nav aria-label="Mi espacio personal">${secciones.map(([s,t,i])=>`<a href="#${s}" ${s===id?'aria-current="page"':''}>${icon(i)}${t}</a>`).join('')}</nav><div class="cp-utilidades"><a class="cp-ajustes" href="#configuracion">${icon('settings')} Mi cuenta y ajustes</a>${boton('Cerrar sesión','salir','','cp-salir')}</div></aside><section class="cp-principal" aria-labelledby="cp-titulo">${vista(id)}</section></div>`;
        }
      }
      window.dispatchEvent(new Event("cuida-cuenta-cambio"));enlazar();if(usuario?.draft&&!wizard&&seccion()==='personas')mostrarContinuar();if(foco){const titulo=document.getElementById('cp-titulo');titulo?.focus({preventScroll:true});titulo?.scrollIntoView({block:'start',behavior:'instant'});}
    }catch(error){root.innerHTML=`${cabecera('No podemos abrir tu espacio','Tus datos guardados no se han sobrescrito.')}<div class="cp-card"><p>${e(error.message)}</p>${boton('Descargar datos originales','original')}${boton('Volver a intentar','recargar')}</div>`;notificar(error.message,true);}
  }

  // Construye el formulario de acceso o registro según el modo seleccionado.
  function acceso(){
    return `<div class="cp-acceso"><section class="cp-presentacion"><span class="cp-sello">${icon('heart')} A TU LADO, CADA DÍA</span><h1 id="cp-titulo" tabindex="-1">Un espacio para cuidar.<br><span>Y para cuidarte.</span></h1><p>Organiza los cuidados, encuentra apoyo y deja también un hueco para ti.</p><ul><li>${icon('users')} Un perfil para cada persona que acompañas</li><li>${icon('calendar')} Tu día, organizado a tu ritmo</li><li>${icon('book')} Recursos según lo que necesitas</li></ul><p class="cp-nota">No necesitas una cuenta para consultar los recursos públicos.</p></section><section class="cp-card cp-form-acceso" aria-label="Acceso a mi cuenta"><div class="cp-tabs" role="group" aria-label="Elige cómo acceder">${boton('Iniciar sesión','modo','login',modo==='login'?'seleccionado':'')}${boton('Crear cuenta','modo','registro',modo==='registro'?'seleccionado':'')}</div><h2>${modo==='registro'?'Empecemos por ti':'Qué bien tenerte por aquí'}</h2><p>${modo==='registro'?'Crea una cuenta de prueba para explorar tu espacio.':'Entra en la cuenta guardada en este navegador.'}</p><form data-form="acceso" novalidate>${modo==='registro'?campo('name','Nombre o apodo','','text',{required:true,autocomplete:'given-name'}):''}${campo('email','Correo electrónico','','email',{required:true,autocomplete:'username'})}${campo('password','Contraseña','','password',{required:true,newPassword:modo==='registro',strength:modo==='registro',autocomplete:modo==='registro'?'new-password':'current-password'})}${modo==='registro'?campo('confirm','Repite la contraseña','','password',{required:true,newPassword:true,autocomplete:'new-password'}):''}<p class="cp-nota">${modo==='registro'?'Utiliza datos ficticios. No guardamos contraseñas en texto plano.':'No hay recuperación por correo en este prototipo. Usa la misma dirección con la que te registraste.'}</p><button class="cp-boton principal" type="submit">${modo==='registro'?'Crear mi cuenta':'Entrar en mi espacio'}</button></form></section></div>`;
  }

  // Selecciona el contenido de la sección abierta del espacio personal.
  function vista(id){
    if(id==='inicio')return inicio();if(id==='personas')return personas();if(id==='bienestar')return bienestar();if(id==='configuracion')return configuracion();
    if(!perfil)return cabecera((secciones.find(s=>s[0]===id)?.[1]||'Tus recursos'),'Primero, elige a quién quieres acompañar.')+vacio('Tu espacio está por empezar','Añade una persona para guardar sus necesidades, tareas y recursos.')+boton('Añadir persona','nueva');
    if(id==='plan')return plan();if(id==='seguimiento')return seguimiento();if(id==='recursos')return recursos(false);if(id==='favoritos')return recursos(true);
    return cabecera('Tu calendario',`Organización de ${e(perfil.nickname)}, conectada con su plan de cuidados.`)+`<div class="cp-card"><h2>Una sola agenda, en dos vistas</h2><p>Las tareas creadas o completadas aquí son las mismas que aparecen en el calendario. Puedes organizar repeticiones, horarios y pasos desde su vista completa.</p><a class="cp-boton principal" href="calendario.html">Abrir calendario de ${e(perfil.nickname)}</a><h3>Próximas actividades</h3>${listaTareas(leerTareas().filter(t=>t.date>=hoy()&&t.status!=='hecha').slice(0,8))}</div>`;
  }

  // Genera la lista de tareas con sus acciones y presentación sencilla opcional.
  function listaTareas(tareas,sencilla=false){
    if(!tareas.length)return '<p class="cp-nota">No hay tareas en este apartado. Puedes añadir una en Mis tareas.</p>';
    return `<ul class="cp-lista-tareas">${A.ordenar(tareas).map(t=>`<li class="${t.status==='hecha'?'cp-completada':''}"><label><input type="checkbox" data-tarea="${e(t.id)}" ${t.status==='hecha'?'checked':''}><span><strong>${e(t.title)}</strong><small>${e(formato(t.date))}${t.time?' · '+e(t.time):''} · ${e(A.estados[t.status])}</small></span></label>${sencilla?'':`<details class="cp-tarea-opciones"><summary>Opciones<span class="solo-lector"> de ${e(t.title)}</span></summary><div>${boton('Modificar','editar-tarea',t.id)}${boton('Eliminar','eliminar-tarea',t.id)}</div></details>`}</li>`).join('')}</ul>`;
  }

  // Muestra las tareas de hoy y las recomendaciones del espacio personal.
  function inicio(){
    const pendientes=leerTareas().filter(t=>t.date===hoy()&&t.status!=='hecha');
    const recomendados=perfil?window.CuidaRecomendados(perfil,usuario).filter(r=>r.kind==='tutorial'&&r.category!=='bienestar').slice(0,2):[];
    return cabecera('Hola, '+e(usuario.name),'Este es tu espacio. Vamos a cuidar, paso a paso.')+
      (perfil?'<article class="cp-card cp-destacada">'+tarjetaPersona(perfil)+'</article>':`<article class="cp-card cp-destacada"><h2>¿A quién cuidas?</h2><p>Si quieres, añade a la persona que cuidas. Son tres pasos cortos y puedes hacerlo más tarde.</p>${boton('Añadir persona','nueva','','principal')}</article>`)+
      `<article class="cp-card"><div class="cp-titulo"><h2>Tareas pendientes de hoy</h2><a class="cp-boton" href="#plan">Ver mis tareas</a></div>${perfil?listaTareas(pendientes.slice(0,5),true):'<p>Aquí aparecerán las tareas que decidas añadir.</p>'}${pendientes.length>5?'<p><a class="cp-enlace" href="#plan">Ver las demás tareas de hoy</a></p>':''}</article>`+
      (perfil?`<article class="cp-card"><h2>Para ayudarte a cuidar</h2><p>Hemos elegido estos temas según la ayuda que necesita ${e(perfil.nickname)}.</p><div class="cp-recomendaciones-simples">${recomendados.map(r=>`<a href="${r.url}">${icon('book')}<span><strong>${e(r.title)}</strong><small>Tema de tutorial · En preparación</small></span></a>`).join('')||window.CuidaRecomendados(perfil,usuario).filter(r=>r.category!=='inicio'&&r.kind!=='tutorial').slice(0,2).map(r=>`<a href="${r.url}">${icon('book')}<strong>${e(r.title)}</strong></a>`).join('')}</div><p class="cp-nota">Orientación general. No sustituye el asesoramiento sanitario profesional.</p></article>`:'')+
      `<article class="cp-card cp-cuidado"><h2>${icon('heart')} Un momento para ti</h2><p>También necesitas descansar. Piensa en una tarea que puedas compartir hoy con alguien cercano.</p><a class="cp-enlace" href="#bienestar">Encontrar apoyo para mí</a></article>`+
      (perfil?`<details class="cp-secundario"><summary>Ver más recursos y mis favoritos</summary>${recursos(false,true)}<h2>Mis favoritos</h2>${recursos(true,true)}</details>`:'');
  }

  // Construye la tarjeta de una persona con sus datos y acciones.
  function tarjetaPersona(p){
    return `<div class="cp-tarjeta-persona">${icon('users')}<div><h2>${e(p.nickname)}</h2><p>${e(p.relationship||'Persona a tu cuidado')}${p.age!==''?' · '+e(p.age)+' años':''}</p></div></div>${p.autonomy?`<p>${e(S.ayudaActual(p.autonomy)||p.autonomy)}</p>`:''}<div class="cp-chips">${S.opciones.filter(o=>o.keys.some(k=>p.needs[k])).map(o=>`<span>${e(o.nombre)}</span>`).join('')}</div>${boton('Modificar información','editar',p.id)}`;
  }

  // Muestra los perfiles de personas cuidadas y las opciones para gestionarlos.
  function personas(){
    return cabecera('Persona a mi cuidado','Puedes cambiar esta información cuando quieras.')+
      (usuario.people.length>1?`<label class="cp-selector cp-selector-persona">¿De quién quieres ver la información?<select id="cp-persona-activa">${usuario.people.map(p=>`<option value="${e(p.id)}" ${p.id===usuario.activePerson?'selected':''}>${e(p.nickname)}</option>`).join('')}</select></label>`:'')+
      (perfil?`<article class="cp-card cp-destacada">${tarjetaPersona(perfil)}</article><details class="cp-secundario"><summary>Otras opciones de esta persona</summary><p>Puedes conservar más de una persona en tu cuenta. Sus tareas y anotaciones se guardan por separado.</p>${boton('Añadir otra persona','nueva')}${boton('Eliminar esta persona','eliminar-persona',perfil.id,'peligro')}${datosAnteriores(perfil)}<details><summary>Ver sus anotaciones</summary>${seguimiento(true)}</details></details>`:
      `<article class="cp-card"><h2>Empecemos con lo sencillo</h2><p>Solo te preguntaremos a quién cuidas, en qué necesita ayuda y cuánta ayuda necesita.</p>${boton('Añadir persona','nueva','','principal')}</article>`);
  }

  // Presenta la información conservada del modelo anterior del perfil.
  function datosAnteriores(p){
    const campos=[['Preferencias',p.preferences],['Actividades que disfruta',p.enjoys],['Convivencia',p.cohabits],['Horarios',p.organization.schedule],['Tareas diarias',p.organization.daily],['Actividades semanales',p.organization.weekly],['Descansos',p.organization.rest],['Objetivos',p.organization.goals]];
    const otros=C.categorias.filter(c=>p.needs[c.id]&&!S.opciones.some(o=>o.keys.includes(c.id)));
    return campos.some(([,v])=>v)||otros.length?`<details><summary>Información que ya habías guardado</summary>${campos.filter(([,v])=>v).map(([t,v])=>`<p><strong>${t}:</strong> ${e(v)}</p>`).join('')}${otros.map(c=>`<p>${e(c.nombre)} · ${e(p.needs[c.id])}</p>`).join('')}</details>`:'';
  }

  // Muestra el plan de cuidados y las tareas pendientes del perfil.
  function plan(){
    const tareas=leerTareas(),pendientes=tareas.filter(t=>t.status!=='hecha');
    return cabecera('Mis tareas','Añade lo que necesitas hacer. También aparecerá en tu calendario.', '<a class="cp-boton" href="calendario.html">'+icon('calendar')+' Abrir calendario</a>')+
      `<article class="cp-card"><h2>${editandoTarea?'Modificar tarea':'Añadir una tarea'}</h2>${formTarea()}</article><article class="cp-card"><h2>Mis tareas pendientes</h2>${listaTareas(pendientes)}</article>`+
      `<details class="cp-secundario"><summary>Ver las tareas realizadas</summary>${listaTareas(tareas.filter(t=>t.status==='hecha'))}</details><p class="cp-nota">¿Quieres repetir una rutina o añadir varios pasos? Puedes hacerlo en el calendario.</p>`;
  }

  // Prepara el formulario de creación o edición de una tarea del plan.
  function formTarea(){
    const t=leerTareas().find(t=>t.id===editandoTarea)||(nuevaPausa?{title:'Un momento para mí'}:{});
    return `<form data-form="tarea" novalidate>${campo('title','Nombre de la tarea',t.title||'','text',{required:true,max:120})}<div class="cp-grid">${campo('date','Fecha',t.date||hoy(),'date',{required:true})}${campo('time','Hora',t.time||'','time')}</div><div class="cp-acciones"><button class="cp-boton principal" type="submit">${editandoTarea?'Guardar cambios':'Añadir tarea'}</button>${editandoTarea?boton('Cancelar','cancelar-tarea'):''}</div></form>`;
  }

  // Genera las opciones de ánimo, incluida la posibilidad de no indicarlo.
  function opcionesAnimo(name,value){return `<fieldset class="cp-animo"><legend>¿Cómo describirías el ánimo general? (opcional)</legend>${[['bien','☺','Con ánimo'],['neutro','◉','Normal'],['bajo','☁','Con poco ánimo']].map(([v,i,t])=>`<label><input type="radio" name="${name}" value="${v}" ${value===v?'checked':''}><span aria-hidden="true">${i}</span>${t}</label>`).join('')}<label><input type="radio" name="${name}" value="" ${!value?'checked':''}>Sin indicar</label></fieldset>`;}

  // Presenta el registro diario y las tareas de la fecha seleccionada.
  function seguimiento(integrado=false){
    const r=perfil.tracking[fechaRegistro]||{},ts=leerTareas().filter(t=>t.date===fechaRegistro);
    return (integrado?'':cabecera('Tus anotaciones',`Un recuerdo sencillo del día de ${e(perfil.nickname)}.`))+`<div class="cp-card"><label class="cp-fecha">Fecha del registro<input type="date" id="cp-fecha-registro" min="1900-01-01" max="${hoy()}" value="${fechaRegistro}"></label><h2>Actividades de esta fecha</h2>${listaTareas(ts)}<form data-form="seguimiento" novalidate>${opcionesAnimo('mood',r.mood)}<div class="cp-grid">${campo('activities','Actividades realizadas',r.activities,'textarea')}${campo('leisure','Tiempo de ocio y actividades disfrutadas',r.leisure,'textarea')}${campo('rest','Descansos',r.rest)}${campo('rating','¿Cómo ha ido el día?',r.rating||'','select',{options:['','Tranquilo','Con altibajos','Difícil']})}</div>${campo('notes','Observaciones generales, sin información sensible',r.notes,'textarea')}<button class="cp-boton principal" type="submit">Guardar este día</button></form></div><article class="cp-card"><h3>Historial por fechas</h3>${Object.keys(perfil.tracking).sort().reverse().map(f=>`<div class="cp-historial"><div><strong>${e(formato(f))}</strong><p>${e(perfil.tracking[f].rating||'Sin valoración')} · ${e(({bien:'Con ánimo',neutro:'Normal',bajo:'Con poco ánimo'})[perfil.tracking[f].mood]||'Ánimo sin indicar')}</p><p>${e(perfil.tracking[f].activities||'Sin actividades anotadas')}</p></div><div>${boton('Abrir registro','abrir-registro',f)}${boton('Eliminar','eliminar-registro',f)}</div></div>`).join('')||'<p>Aún no hay registros. Solo guardaremos los días que tú decidas anotar.</p>'}</article>`;
  }

  // Muestra el registro de bienestar del cuidador para la fecha seleccionada.
  function bienestar(){
    const r=usuario.wellbeing[fechaRegistro]||{};
    return cabecera('Mi bienestar','Cuidar también significa encontrar un momento para ti.')+
      `<article class="cp-card cp-cuidado"><h2>${icon('heart')} No tienes que hacerlo todo a solas</h2><p>Pedir ayuda y descansar también forman parte del cuidado. Piensa en algo pequeño que te gustaría hacer hoy para ti.</p><a class="cp-boton principal" href="recursos.html#autocuidado">Encontrar consejos y apoyo</a></article><article class="cp-card"><h2>Reserva un descanso</h2><p>Un paseo, una llamada o un rato de lectura. Puedes reservarlo en tu calendario.</p>${perfil?boton('Añadir un descanso a mis tareas','pausa'):'<a class="cp-boton" href="#personas">Añadir a la persona que cuido</a>'}</article><a class="cp-enlace" href="chatbot.html?tema=cuidador">${icon('chat')} Hablar con Resuelve sobre cómo me siento</a>`+
      `<details class="cp-secundario"><summary>Anotar cómo me encuentro y ver mis días guardados</summary><p>Solo si te apetece. No es necesario rellenarlo cada día.</p><label class="cp-fecha">Fecha<input type="date" id="cp-fecha-registro" min="1900-01-01" max="${hoy()}" value="${fechaRegistro}"></label><form data-form="bienestar" novalidate>${opcionesAnimo('mood',r.mood)}<div class="cp-grid">${campo('minutes','Minutos de descanso',r.minutes??'','number',{max:1440})}${campo('load','¿Cómo llevas el día?',r.load||'','select',{options:['','Llevadera','A ratos difícil','Necesito más apoyo']})}</div>${campo('goal','Algo que quiero hacer para mí',r.goal,'textarea')}${campo('disconnect','¿Qué me ayuda a desconectar?',r.disconnect,'textarea')}<button type="submit" class="cp-boton principal">Guardar mi día</button></form><h2>Mis días guardados</h2>${Object.keys(usuario.wellbeing).sort().reverse().map(f=>{const d=usuario.wellbeing[f];return `<div class="cp-historial"><div><strong>${e(formato(f))}</strong><p>${e(d.load||'Sin valoración')}${d.minutes!==''?' · '+e(d.minutes)+' minutos de descanso':''}</p><p>${e(d.goal)}</p></div><div>${boton('Ver este día','abrir-registro',f)}${boton('Eliminar','eliminar-bienestar',f)}</div></div>`;}).join('')||'<p>Aún no has guardado ningún día.</p>'}</details>`;
  }

  // Presenta los contenidos recomendados o los favoritos del perfil.
  function recursos(favoritos,integrado=false){
    const lista=favoritos?window.CuidaCatalogo.filter(r=>perfil.favorites.includes(r.id)):window.CuidaRecomendados(perfil,usuario);
    return (integrado?'':cabecera(favoritos?'Tus favoritos':'Recursos para tu día a día',`Recomendaciones para acompañar a ${e(perfil.nickname)}.`))+
      `<div class="cp-grid">${lista.map(r=>`<article class="cp-card"><p class="cp-chip">${r.kind==='tutorial'?'Tema de tutorial · En preparación':'Recurso disponible'}</p><h2>${e(r.title)}</h2><p>${r.available?'Orientación general para acompañarte y organizarte.':'Todavía no hay vídeo para reproducir. Puedes guardar este tema o marcar que lo has consultado.'}</p><div class="cp-acciones"><a class="cp-boton" href="${r.url}">Consultar ${r.kind==='tutorial'?'tema':'recurso'}</a>${boton(perfil.favorites.includes(r.id)?'Quitar favorito':'Guardar favorito','favorito',r.id)}${boton(perfil.consulted.includes(r.id)?'Consultado · Desmarcar':'Marcar consultado','consultado',r.id)}${r.kind==='tutorial'&&r.available?boton(perfil.watched.includes(r.id)?'Visto · Desmarcar':'Marcar visto','visto',r.id):''}</div></article>`).join('')||vacio('Guarda lo que te resulte útil','Los recursos que guardes desde esta web aparecerán aquí para el perfil activo.')}</div><article class="cp-card"><h2>Continuar aprendiendo</h2><p>${perfil.consulted.length} temas o recursos consultados en este perfil. Los vídeos previstos no se contabilizan como vistos.</p><a class="cp-boton" href="tutoriales.html">Explorar los temas de tutoriales</a></article>`;
  }

  // Construye las opciones de edición, exportación y eliminación de la cuenta.
  function configuracion(){
    return cabecera('Configuración de cuenta','Tu información, tus preferencias y tus datos locales.')+`<div class="cp-grid"><article class="cp-card"><h2>Datos de acceso</h2><form data-form="datos-cuenta" novalidate>${campo('name','Nombre o apodo',usuario.name,'text',{required:true,autocomplete:'given-name'})}${campo('email','Correo electrónico',usuario.email,'email',{required:true,autocomplete:'username'})}${campo('password','Confirma tu contraseña actual','','password',{required:true,autocomplete:'current-password'})}<button class="cp-boton principal" type="submit">Guardar datos</button></form></article><article class="cp-card"><h2>Cambiar contraseña</h2><form data-form="cambiar-clave" novalidate>${campo('current','Contraseña actual','','password',{required:true,autocomplete:'current-password'})}${campo('password','Nueva contraseña','','password',{required:true,newPassword:true,strength:true,autocomplete:'new-password'})}${campo('confirm','Repite la nueva contraseña','','password',{required:true,newPassword:true,autocomplete:'new-password'})}<button class="cp-boton principal" type="submit">Cambiar contraseña</button></form></article></div><details class="cp-secundario"><summary>Preferencias que ya habías guardado</summary><article class="cp-card"><h2>Preferencias del cuidador</h2><form data-form="cuidador" novalidate>${camposCuidador(usuario.caregiver)}<label class="cp-check"><input type="checkbox" name="chatConsent" ${usuario.chatConsent?'checked':''}> Permitir sugerencias del chatbot basadas solo en las categorías de apoyo</label><p class="cp-nota">No se envían datos personales al chatbot ni a servicios externos. Puedes retirar este permiso cuando quieras.</p><button type="submit" class="cp-boton principal">Guardar preferencias</button></form></article></details><div class="cp-grid"><article class="cp-card"><h2>Una copia de tus datos</h2><p>Descarga los perfiles, las agendas, los registros y tus preferencias. La copia no incluye la contraseña ni su derivación. Guárdala con cuidado; no está cifrada.</p>${boton('Exportar mi cuenta en JSON','exportar','','principal')}<p class="cp-nota">Esta exportación es para consultar tus datos. La importación de tareas sigue disponible en el calendario.</p></article><article class="cp-card cp-zona-peligro"><h2>Eliminar mi cuenta local</h2><p>Elimina todos tus perfiles, tareas, favoritos y registros de esta cuenta en este navegador. La agenda sin cuenta se conserva.</p>${boton('Eliminar mi cuenta','eliminar-cuenta','','peligro')}</article></div>`;
  }

  // Genera los campos de información, experiencia y necesidades del cuidador.
  function camposCuidador(c){return `<div class="cp-grid">${campo('nickname','¿Cómo prefieres que te llamemos?',c.nickname||usuario.name)}${campo('experience','Experiencia como cuidador/a',c.experience||'','select',{options:['','Estoy empezando','Tengo algo de experiencia','Llevo varios años cuidando']})}${campo('time','Tiempo dedicado al cuidado',c.time||'','select',{options:['','Menos de 2 horas al día','De 2 a 8 horas al día','Más de 8 horas al día','Varía según el día']})}${campo('help','¿Tienes ayuda de otras personas?',c.help||'','select',{options:['','Sí, habitualmente','A veces','No habitualmente']})}${campo('difficulties','¿Qué te resulta más difícil?',c.difficulties,'textarea')}${campo('goals','¿Qué te gustaría conseguir?',c.goals,'textarea')}</div>`;}
  const pasos=[['¿A quién cuidas?','users'],['¿En qué necesita ayuda?','heart'],['¿Cuánta ayuda necesita?','check']];

  // Construye el paso actual del asistente de configuración del perfil.
  function asistente(){
    const {step,person:p}=wizard;
    return `<section class="cp-asistente cp-asistente-simple" aria-labelledby="cp-titulo">${cabecera(pasos[step][0], 'Paso '+(step+1)+' de 3. Puedes dejar los datos para más tarde.')}<div class="cp-card"><progress max="3" value="${step+1}" aria-label="Paso ${step+1} de 3"></progress><form data-form="asistente" novalidate>${step===0?`${campo('nickname','Nombre o apodo',p.nickname==='Persona a mi cuidado'?'':p.nickname)}<div class="cp-grid">${campo('age','Edad',p.age,'number')}${campo('relationship','Parentesco',p.relationship,'select',{options:['','Mi madre','Mi padre','Mi pareja','Mi abuela','Mi abuelo','Mi hijo o hija','Otro familiar','Otra persona']})}</div>`:step===1?`<p>Puedes elegir varias opciones. Pulsa sobre cada tarjeta.</p><div class="cp-ayudas-simples">${S.opciones.map(o=>`<label class="cp-ayuda-tarjeta"><input type="checkbox" name="need" value="${o.id}" ${o.keys.some(k=>p.needs[k])?'checked':''}>${icon(o.icono)}<span>${e(o.nombre)}</span></label>`).join('')}</div>`:`<p>Elige la opción que mejor describa vuestro día a día. Puedes cambiarla después.</p><fieldset class="cp-nivel-ayuda"><legend class="solo-lector">Cantidad de ayuda</legend>${S.ayudas.map((v,i)=>`<label><input type="radio" name="autonomy" value="${e(v)}" ${S.ayudaActual(p.autonomy)===v?'checked':''}>${icon(['heart','users','sun'][i])}<span>${e(v)}</span></label>`).join('')}</fieldset>`}<div class="cp-asistente-pie">${step>0?boton('Volver','paso-atras'):boton('Ahora no','pausar-asistente')}<button class="cp-boton principal" type="submit">${step===2?'Guardar y entrar en mi espacio':'Continuar'}</button></div></form></div>${step>0?boton('Continuar más tarde','pausar-asistente'):''}</section>`;
  }

  // Recoge los valores del formulario y actualiza el borrador del asistente.
  function recogerPaso(form){
    const data=new FormData(form),d=Object.fromEntries(data),p=wizard.person;
    if(wizard.step===0){p.nickname=d.nickname.trim()||'Persona a mi cuidado';p.age=d.age===''?'':Number(d.age);p.relationship=d.relationship;}
    if(wizard.step===1)p.needs=S.guardarNecesidades(p.needs,data.getAll('need'));
    if(wizard.step===2)p.autonomy=d.autonomy||p.autonomy;
  }

  // Conserva el estado del asistente en la cuenta local.
  function guardarBorrador(){R.cambiar(u=>{u.draft=wizard;});}

  // Prepara el asistente para crear o editar una persona y muestra su primer paso.
  function nuevoAsistente(p){wizard={simple:true,step:0,person:p?JSON.parse(JSON.stringify(p)):C.persona(),caregiver:{...usuario.caregiver},edit:!!p,initial:!usuario.setupDone};render(true);}

  // Prepara una descarga local y libera después la URL temporal utilizada.
  function descargar(datos,nombre){const url=URL.createObjectURL(new Blob([JSON.stringify(datos,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=nombre;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}

  // Prepara el diálogo y conserva la acción que se ejecutará al aceptar.
  function confirmar(titulo,texto,accion,conClave=false){
    const dialog=document.getElementById('cuentaConfirmar');focoConfirmacion=document.activeElement;confirmacion=accion;
    dialog.innerHTML=`<form id="cp-confirmacion" novalidate><h2 id="cp-confirmar-titulo">${e(titulo)}</h2><p>${e(texto)}</p>${conClave?campo('password','Confirma tu contraseña','','password',{required:true,autocomplete:'current-password'}):''}<p id="cp-confirmar-error" role="alert"></p><div class="cp-acciones">${boton('Cancelar','cancelar-confirmacion')}<button class="cp-boton peligro" type="submit">Confirmar eliminación</button></div></form>`;
    dialog.showModal();dialog.querySelector('[data-action="cancelar-confirmacion"]').focus();
    dialog.querySelector('form').onsubmit=async ev=>{ev.preventDefault();if(!validarFormulario(ev.currentTarget))return;const b=ev.currentTarget.querySelector('[type=submit]');b.disabled=true;b.textContent='Procesando…';try{await accion(new FormData(ev.currentTarget).get('password'));dialog.close();render(true);notificar('Datos eliminados.');}catch(error){dialog.querySelector('#cp-confirmar-error').textContent=error.message;}finally{b.disabled=false;b.textContent='Confirmar eliminación';}};
  }

  // Valida un campo y actualiza su mensaje de error y su estado accesible.
  function errorCampo(input){
    let mensaje='';const v=input.value.trim();
    if(input.required&&!v)mensaje='Completa este campo para continuar.';
    else if(input.type==='email'&&v&&!C.emailValido(v))mensaje='Escribe un correo válido, por ejemplo nombre@ejemplo.com.';
    else if(input.validity.rangeUnderflow||input.validity.rangeOverflow)mensaje=`Escribe un valor entre ${input.min} y ${input.max}.`;
    else if(input.type==='number'&&v&&(!Number.isInteger(Number(v))||input.validity.badInput))mensaje='Escribe un número entero.';
    else if(input.type==='password'&&v.length<Number(input.minLength))mensaje=`Usa al menos ${input.minLength} caracteres.`;
    else if(input.name==='confirm'&&input.value!==input.form.elements.password.value)mensaje='Las contraseñas no coinciden.';
    else if(input.type==='date'&&v&&!A.fechaValida(v))mensaje='Elige una fecha válida.';
    else if(!input.validity.valid)mensaje='Revisa el formato de este campo.';
    const error=document.getElementById(input.id+'-error');if(error)error.textContent=mensaje;
    input.setAttribute('aria-invalid',String(Boolean(mensaje)));return !mensaje;
  }

  // Valida los controles y lleva el foco al primer campo que necesita revisión.
  function validarFormulario(form){let valido=true,primero;form.querySelectorAll('input:not([type=checkbox]):not([type=radio]),select,textarea').forEach(input=>{if(!input.disabled&&!errorCampo(input)){valido=false;primero||=input;}});if(!valido){notificar('Revisa los campos señalados antes de continuar.',true);primero.focus();}return valido;}

  // Conecta los controles recién dibujados con sus eventos y validaciones.
  function enlazar(){
    root.querySelectorAll('.cp-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===modo)));
    root.querySelectorAll('form').forEach(f=>{f.addEventListener('submit',enviarFormulario);f.querySelectorAll('input,select,textarea').forEach(input=>{input.addEventListener('blur',()=>errorCampo(input));input.addEventListener('input',()=>{if(input.type!=='checkbox'&&input.type!=='radio')errorCampo(input);if(input.name==='password'){const meter=input.closest('.cp-campo')?.querySelector('meter');if(meter){const n=C.fuerza(input.value);meter.value=n;input.closest('.cp-campo').querySelector('[data-fuerza-texto]').textContent=['Muy sencilla','Sencilla','Media','Buena','Fuerte'][n];}const confirm=input.form.elements.confirm;if(confirm&&confirm.value)errorCampo(confirm);}});});});
    root.querySelector('#cp-persona-activa')?.addEventListener('change',ev=>{try{R.seleccionar(ev.target.value);editandoTarea=null;render();notificar('Perfil activo actualizado.');}catch(e){notificar(e.message,true);}});
    root.querySelector('#cp-fecha-registro')?.addEventListener('change',ev=>{if(A.fechaValida(ev.target.value)&&ev.target.value<=hoy()){fechaRegistro=ev.target.value;render();}else notificar('Elige una fecha válida hasta hoy.',true);});
    root.querySelectorAll('[name=need]').forEach(i=>i.onchange=()=>{const card=i.closest('.cp-necesidad');if(card){card.classList.toggle('seleccionada',i.checked);const select=card.querySelector('select');if(select)select.disabled=!i.checked;}});
    root.querySelectorAll('[data-tarea]').forEach(i=>i.onchange=()=>{try{const id=i.dataset.tarea;guardarTareas(ts=>ts.map(t=>t.id===id?{...t,status:i.checked?'hecha':'pendiente',updatedAt:new Date().toISOString()}:t));render();root.querySelector(`[data-tarea="${CSS.escape(id)}"]`)?.focus({preventScroll:true});notificar('Estado actualizado también en el calendario.');}catch(e){i.checked=!i.checked;notificar(e.message,true);}});
  }

  // Procesa el formulario, guarda sus cambios y comunica el resultado.
  async function enviarFormulario(ev){
    ev.preventDefault();const form=ev.currentTarget;if(!validarFormulario(form))return;
    const d=Object.fromEntries(new FormData(form)),tipo=form.dataset.form,b=form.querySelector('[type=submit]'),texto=b.textContent;
    if(b.disabled)return;b.disabled=true;b.textContent='Guardando…';form.setAttribute('aria-busy','true');
    try{
      if(tipo==='acceso'){
        if(modo==='registro')await R.registro(d.name,d.email,d.password);else await R.login(d.email,d.password);
        history.replaceState(null,'','#inicio');render(true);notificar(modo==='registro'?'Tu cuenta está lista. Puedes añadir a la persona que cuidas cuando quieras.':'Sesión iniciada.');return;
      }
      if(tipo==='asistente'){
        recogerPaso(form);
        if(wizard.step<2){wizard.step++;guardarBorrador();render(true);}
        else {R.guardarPersona(wizard.person,{...usuario.caregiver,...wizard.caregiver});wizard=null;ir('inicio');notificar('Bienvenido a tu espacio. La información se ha guardado y puedes cambiarla cuando quieras.');}
        return;
      }
      if(tipo==='datos-cuenta'){await R.editarCuenta(d.name,d.email,d.password);render();notificar('Datos de cuenta actualizados.');return;}
      if(tipo==='cambiar-clave'){await R.cambiarClave(d.current,d.password);render();notificar('Contraseña actualizada. Usa la nueva la próxima vez que entres.');return;}
      if(tipo==='cuidador'){const c={...d};delete c.chatConsent;R.cambiar(u=>{u.caregiver={...u.caregiver,...c};u.chatConsent=!!d.chatConsent;});}
      if(tipo==='tarea'){
        const anterior=leerTareas().find(t=>t.id===editandoTarea);const category=anterior?.category||(nuevaPausa?'personal':'cuidados'),datos={title:d.title,date:d.date,time:d.time,category};
        const viejo=editandoTarea;
        if(viejo)guardarTareas(ts=>ts.map(t=>t.id===viejo?A.validarTarea({...t,...datos,updatedAt:new Date().toISOString()}):t));
        else {const nueva=A.crearTarea(datos);guardarTareas(ts=>ts.concat(nueva));}
        editandoTarea=null;nuevaPausa=false;
      }
      if(tipo==='seguimiento')R.cambiarPersona(perfil.id,p=>{p.tracking[fechaRegistro]=d;});
      if(tipo==='bienestar'){d.minutes=d.minutes===''?'':Number(d.minutes);R.cambiar(u=>{u.wellbeing[fechaRegistro]=d;});}
      render();notificar('Cambios guardados en este navegador.');
    }catch(error){notificar(error.message,true);}
    finally{b.disabled=false;b.textContent=texto;form.removeAttribute('aria-busy');}
  }
  document.addEventListener('click',async ev=>{
    const b=ev.target.closest('[data-action]');if(!b)return;
    const accion=b.dataset.action,id=b.dataset.id;
    try{
      if(accion==='clave'){const input=document.getElementById(id);input.type=input.type==='password'?'text':'password';b.textContent=input.type==='password'?'Mostrar':'Ocultar';b.setAttribute('aria-pressed',String(input.type==='text'));b.setAttribute('aria-label',input.type==='password'?'Mostrar contraseña':'Ocultar contraseña');return;}
      if(accion==='modo'){modo=id;render();root.querySelector('form input')?.focus();}
      if(accion==='nueva')nuevoAsistente();
      if(accion==='editar')nuevoAsistente(usuario.people.find(p=>p.id===id));
      if(accion==='seleccionar'){R.seleccionar(id);editandoTarea=null;render();notificar('Perfil seleccionado. Sus datos se mantienen separados.');}
      if(accion==='salir'){if(wizard)guardarBorrador();R.salir();wizard=null;render();notificar('Has cerrado tu sesión.');}
      if(accion==='paso-atras'||accion==='paso'){const f=root.querySelector('[data-form=asistente]');recogerPaso(f);wizard.step=accion==='paso-atras'?Math.max(0,wizard.step-1):Number(id);guardarBorrador();render(true);}
      if(accion==='pausar-asistente'){recogerPaso(root.querySelector('form'));guardarBorrador();R.cambiar(u=>{u.setupDone=true;});wizard=null;render();notificar('Borrador guardado. Puedes retomarlo desde el aviso de configuración.');}
      if(accion==='continuar-asistente'){wizard=S.borrador(R.actual().draft);render(true);}
      if(accion==='descartar-borrador'){R.cambiar(u=>{u.draft=null;});wizard=null;render();notificar('Borrador descartado. Los perfiles guardados se conservan.');}
      if(accion==='eliminar-persona')confirmar('¿Eliminar este perfil?','Se eliminarán sus tareas, seguimiento y favoritos. Los demás perfiles se conservarán.',()=>{R.eliminarPersona(id);});
      if(accion==='editar-tarea'){editandoTarea=id;ir('plan');render();root.querySelector('[data-form=tarea] input')?.focus();}
      if(accion==='cancelar-tarea'){editandoTarea=null;nuevaPausa=false;render();}
      if(accion==='eliminar-tarea')confirmar('¿Eliminar esta tarea?','Se eliminará también del calendario. Las demás repeticiones se conservan.',()=>guardarTareas(ts=>ts.filter(t=>t.id!==id)));
      if(accion==='abrir-registro'){fechaRegistro=id;render();root.querySelector('#cp-fecha-registro')?.focus();}
      if(accion==='eliminar-registro')confirmar('¿Eliminar este registro?','Solo se eliminará la anotación de esta fecha. Las tareas se conservan.',()=>R.cambiarPersona(perfil.id,p=>{delete p.tracking[id];}));
      if(accion==='eliminar-bienestar')confirmar('¿Eliminar esta anotación?','Las anotaciones de otros días se conservarán.',()=>R.cambiar(u=>{delete u.wellbeing[id];}));
      if(accion==='pausa'){nuevaPausa=true;editandoTarea=null;ir('plan');render();const f=root.querySelector('[data-form=tarea]');f.elements.title.value='Un momento para mí';f.elements.date.focus();notificar('Elige día y hora, y pulsa Añadir tarea para reservar tu descanso.');}
      if(['favorito','consultado','visto'].includes(accion)){const campo=accion==='favorito'?'favorites':accion==='visto'?'watched':'consulted',item=window.CuidaCatalogo.find(r=>r.id===id);if(!item||accion==='visto'&&!item.available)return;R.cambiarPersona(perfil.id,p=>{p[campo]=p[campo].includes(id)?p[campo].filter(v=>v!==id):p[campo].concat(id);});render();notificar('Preferencia actualizada.');}
      if(accion==='exportar'){descargar(R.exportar(),'cuidapoyo-mi-cuenta-'+hoy()+'.json');notificar('Exportación preparada sin contraseñas ni derivados.');}
      if(accion==='eliminar-cuenta')confirmar('¿Eliminar toda tu cuenta local?','Esta acción no se puede deshacer. Puedes cancelar y exportar tus datos antes. Confirma tu contraseña para eliminar esta cuenta y todos sus perfiles.',async password=>{await R.eliminarCuenta(password);wizard=null;},true);
      if(accion==='cancelar-confirmacion')document.getElementById('cuentaConfirmar').close();
      if(accion==='recargar')render();
      if(accion==='original'){let raw;try{raw=localStorage.getItem(C.CLAVE);}catch(_){throw new Error('El navegador no permite acceder al original.');}descargar({aviso:'Datos originales sin procesar. Pueden incluir derivados de contraseñas.',raw},'cuidapoyo-original.json');}
    }catch(error){notificar(error.message,true);}
  });

  // Ofrece retomar o descartar la configuración guardada como borrador.
  function mostrarContinuar(){const box=document.createElement('div');box.className='cp-borrador cp-card';box.innerHTML=`<p>Tienes una configuración pendiente.</p>${boton('Retomar asistente','continuar-asistente')}${boton('Descartar borrador','descartar-borrador')}`;root.querySelector('.cp-principal').append(box);}
  document.getElementById('cuentaConfirmar').addEventListener('close',()=>{confirmacion=null;if(focoConfirmacion?.isConnected)focoConfirmacion.focus();});
  window.addEventListener('hashchange',()=>{render(true);});
  window.addEventListener('storage',ev=>{if(ev.key===C.CLAVE||ev.key===null){wizard=null;editandoTarea=null;render();notificar('Datos actualizados desde otra pestaña.');}});
  window.addEventListener('pageshow',()=>{render();});
  window.addEventListener('focus',()=>{if(document.visibilityState==='visible'&&!root.querySelector('form :focus')){try{actualizar();}catch(e){notificar(e.message,true);}}});
  
  render();
})();