// Cuenta: perfiles, acceso local, persistencia y exportación de datos.

/* Repositorio local. Sustituir esta capa por una API autenticada al añadir PHP.
   No aporta aislamiento de seguridad ante alguien con acceso al navegador. */
(function (raiz) {
  'use strict';
  const CLAVE = 'cuidapoyo-cuentas-v1', SESION = 'cuidapoyo-sesion-v1';
  const categorias = [
    ['movilidad','Movilidad y desplazamientos','move','movilidad','Preparar un entorno cómodo para desplazarse'],
    ['higiene','Higiene personal','drop','higiene','Organizar los materiales de aseo'],
    ['vestimenta','Vestimenta','shirt','vestido','Preparar la ropa elegida'],
    ['alimentacion','Alimentación','cup','alimentacion','Organizar las comidas del día'],
    ['hidratacion','Hidratación','drop','hidratacion','Organizar los momentos de bebida habituales'],
    ['memoria','Memoria y orientación','sun','memoria','Repasar la organización del día juntos'],
    ['comunicacion','Comunicación','chat','comunicacion','Reservar un momento para conversar'],
    ['emocional','Acompañamiento emocional','heart','emociones','Compartir un rato de compañía'],
    ['descanso','Descanso y sueño','moon','sueno','Preparar un ambiente tranquilo para descansar'],
    ['rutinas','Organización de rutinas','calendar','rutina','Revisar las tareas y repartir apoyos'],
    ['ocio','Actividades de ocio','star','actividades','Elegir una actividad que disfrute'],
    ['seguridad','Prevención de accidentes domésticos','home','iluminacion','Revisar el orden de los espacios de paso'],
    ['social','Relaciones sociales','users','soledad','Organizar una llamada o visita deseada']
  ].map(([id,nombre,icono,chat,tarea])=>({id,nombre,icono,chat,tarea}));
  const frecuencias = ['Puntual','Diaria','Semanal','Según necesidad'];
  const copiar = v => JSON.parse(JSON.stringify(v));
  const uid = () => raiz.crypto.randomUUID ? raiz.crypto.randomUUID() : 'p-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  const texto = (v,max=400) => typeof v === 'string' ? v.trim().slice(0,max) : '';
  const emailValido = v => typeof v==='string' && v.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const fuerza = v => Math.min(4, (v.length>=10?1:0)+(v.length>=14?1:0)+(/[a-z]/.test(v)&&/[A-Z]/.test(v)?1:0)+(/\d/.test(v)&&/[^\w\s]/.test(v)?1:0));

  // Normaliza el perfil y valida la edad, las necesidades y los datos de organización.
  function persona(datos={}) {
    const needs = {};
    categorias.forEach(c=>{if (frecuencias.includes(datos.needs?.[c.id])) needs[c.id]=datos.needs[c.id];});
    const edad = datos.age === '' || datos.age == null ? '' : Number(datos.age);
    if (edad!=='' && (!Number.isInteger(edad)||edad<0||edad>120)) throw new Error('La edad debe estar entre 0 y 120 años, o quedar vacía.');
    return {id:datos.id||uid(), nickname:texto(datos.nickname,60)||'Persona a mi cuidado', age:edad,
      relationship:texto(datos.relationship,60), autonomy:texto(datos.autonomy,80), cohabits:texto(datos.cohabits,30),
      preferences:texto(datos.preferences), enjoys:texto(datos.enjoys), needs,
      organization:{schedule:texto(datos.organization?.schedule),daily:texto(datos.organization?.daily),weekly:texto(datos.organization?.weekly),rest:texto(datos.organization?.rest),goals:texto(datos.organization?.goals),reminders:texto(datos.organization?.reminders,60)},
      agenda:datos.agenda||{version:1,tasks:[]}, tracking:datos.tracking||{}, favorites:datos.favorites||[], consulted:datos.consulted||[], watched:datos.watched||[]};
  }

  // Adapta las cuentas antiguas al modelo actual conservando los datos existentes.
  function migrar(cuenta) {
    if (!cuenta || typeof cuenta!=='object' || !/^[a-f0-9]{64}$/i.test(cuenta.hash||'') || typeof cuenta.salt!=='string') throw new Error('Hay cuentas locales que no se pueden leer. No se han sobrescrito.');
    if (cuenta.version===2) {
      if (!Array.isArray(cuenta.people)||!cuenta.caregiver||!cuenta.wellbeing||cuenta.people.some(p=>!p.id||!p.needs||!p.agenda||!p.tracking)) throw new Error('El perfil guardado no es válido. Conserva una copia antes de recuperarlo.');
      return copiar(cuenta);
    }
    const p=cuenta.profile, needs={};
    const mapa=[['movilidad'],['memoria'],['higiene','vestimenta'],['alimentacion'],['emocional','comunicacion'],['rutinas']];
    (p?.needs||[]).forEach(n=>(mapa[Number(n)]||[]).forEach(id=>needs[id]='Según necesidad'));
    const people=p?[persona({...p,id:'perfil-anterior',needs,organization:{goals:p.goal}})]:[];
    return {version:2,name:texto(cuenta.name,60)||'Cuidador/a',salt:cuenta.salt,hash:cuenta.hash,people,activePerson:people[0]?.id||null,caregiver:{},wellbeing:{},chatConsent:false,setupDone:Boolean(p),draft:null};
  }

  // Deriva una huella de la contraseña con PBKDF2 y una sal, sin guardar el texto original.
  async function derivar(password,salt) {
    if (!raiz.crypto?.subtle) throw new Error('Abre CuidApoyo con Live Server (localhost) o HTTPS para usar las contraseñas.');
    const key=await raiz.crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
    const bits=await raiz.crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:210000,hash:'SHA-256'},key,256);
    return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');
  }

  // Agrupa las operaciones de cuentas locales, sesión y perfiles de personas cuidadas.
  function crearRepositorio(storage,session) {

    // Lee las cuentas y detecta permisos bloqueados o datos dañados.
    function leer() {
      let raw;
      try {raw=storage.getItem(CLAVE);} catch (_) {throw new Error('El navegador bloquea el almacenamiento. Actívalo para guardar tu cuenta local.');}
      if (!raw) return Object.create(null);
      try {const datos=JSON.parse(raw);if (!datos||typeof datos!=='object'||Array.isArray(datos)) throw 0;return datos;}
      catch (_) {throw new Error('No se pueden leer las cuentas guardadas. No se han sobrescrito los datos originales.');}
    }

    // Guarda los datos y comunica los errores que impidan confirmar la escritura.
    function guardar(datos) {
      try {storage.setItem(CLAVE,JSON.stringify(datos));}
      catch (_) {throw new Error('No se ha guardado el cambio. Comprueba el espacio y los permisos de almacenamiento del navegador.');}
    }

    // Consulta el correo asociado a la sesión del navegador.
    function sesion() {try {return session.getItem(SESION);}catch(_){return null;}}

    // Recupera la cuenta de la sesión y adapta sus datos al formato actual.
    function actual() {const email=sesion(),datos=leer();return email&&Object.hasOwn(datos,email)?{email,...migrar(datos[email])}:null;}

    // Aplica una modificación a la cuenta autenticada y guarda el resultado.
    function cambiar(mutacion) {
      const email=sesion(),datos=leer();
      if (!email||!Object.hasOwn(datos,email)) throw new Error('Inicia sesión para continuar.');
      const cuenta=migrar(datos[email]);mutacion(cuenta);datos[email]=cuenta;guardar(datos);return {email,...copiar(cuenta)};
    }

    // Valida los datos, crea la cuenta local y abre su sesión.
    async function registro(name,email,password) {
      name=texto(name,60);email=email.trim().toLowerCase();
      if (!name||!emailValido(email)) throw new Error('Escribe tu nombre y un correo válido.');
      if (password.length<10||password.length>128) throw new Error('Usa una contraseña de prueba de entre 10 y 128 caracteres.');
      const salt=Array.from(raiz.crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
      const hash=await derivar(password,salt),datos=leer();
      if (Object.hasOwn(datos,email)) throw new Error('Ya hay una cuenta con ese correo. Prueba a iniciar sesión.');
      Object.defineProperty(datos,email,{value:{version:2,name,salt,hash,people:[],activePerson:null,caregiver:{},wellbeing:{},chatConsent:false,setupDone:false,draft:null},enumerable:true,configurable:true,writable:true});
      guardar(datos);try {session.setItem(SESION,email);}catch(_){throw new Error('Cuenta creada, pero la sesión está bloqueada. Permite el almacenamiento de sesión e inicia sesión.');}return actual();
    }

    // Comprueba las credenciales, actualiza la cuenta y establece la sesión.
    async function login(email,password) {
      email=email.trim().toLowerCase();const datos=leer(),cuenta=Object.hasOwn(datos,email)?migrar(datos[email]):null;
      if (!cuenta||await derivar(password,cuenta.salt)!==cuenta.hash) throw new Error('El correo o la contraseña no coinciden. Revisa ambos campos.');
      datos[email]=cuenta;guardar(datos);
      try {session.setItem(SESION,email);} catch(_){throw new Error('No se puede abrir una sesión. Revisa los permisos del navegador.');}return actual();
    }

    // Elimina la referencia de la sesión actual.
    function salir() {session.removeItem(SESION);}

    // Busca la persona seleccionada dentro de la cuenta actual.
    function activa() {const u=actual();return u?.people.find(p=>p.id===u.activePerson)||null;}

    // Localiza una persona de la cuenta y aplica la modificación solicitada.
    function cambiarPersona(id,mutacion) {return cambiar(u=>{const p=u.people.find(p=>p.id===id);if(!p)throw new Error('Esta persona ya no está en tu cuenta.');mutacion(p,u);});}

    // Crea o actualiza una persona conservando su agenda, seguimiento y contenidos guardados.
    function guardarPersona(datos,cuidador) {
      const p=persona(datos);
      return cambiar(u=>{const i=u.people.findIndex(x=>x.id===p.id);if(i<0)u.people.push(p);else u.people[i]={...u.people[i],...p,agenda:u.people[i].agenda,tracking:u.people[i].tracking,favorites:u.people[i].favorites,consulted:u.people[i].consulted,watched:u.people[i].watched};u.activePerson=p.id;u.setupDone=true;u.draft=null;if(cuidador)u.caregiver=cuidador;});
    }

    // Comprueba que la persona pertenece a la cuenta y la establece como perfil activo.
    function seleccionar(id) {return cambiar(u=>{if(!u.people.some(p=>p.id===id))throw new Error('Elige una persona de tu cuenta.');u.activePerson=id;});}

    // Elimina la persona y elige otro perfil activo si hace falta.
    function eliminarPersona(id) {return cambiar(u=>{u.people=u.people.filter(p=>p.id!==id);if(u.activePerson===id)u.activePerson=u.people[0]?.id||null;});}

    // Adapta la agenda del perfil activo a la interfaz de almacenamiento del calendario.
    function agendaStorage() {
      const u=actual(),pid=u?.activePerson;
      if(!u||!pid) return storage;
      // El calendario usa su validador y su API habituales sobre el mismo documento.

      // Comprueba el contexto requerido antes de continuar la operación.
      function comprobar(){const a=actual();if(!a||a.email!==u.email||a.activePerson!==pid)throw new Error('El perfil ha cambiado. Recarga el calendario antes de continuar.');return a;}
      return {estricto:true,getItem(){const a=comprobar(),p=a.people.find(p=>p.id===pid);return JSON.stringify(p.agenda);},
        setItem(key,raw){comprobar();const doc=raiz.CuidaAgenda.validarDocumento(JSON.parse(raw));cambiarPersona(pid,p=>{p.agenda=doc;});},
        removeItem(){comprobar();cambiarPersona(pid,p=>{p.agenda={version:1,tasks:[]};});}};
    }

    // Valida la contraseña y actualiza nombre y correo manteniendo los perfiles.
    async function editarCuenta(name,email,password) {
      const u=actual();if(!u)throw new Error('Inicia sesión.');email=email.trim().toLowerCase();name=texto(name,60);
      if(!name||!emailValido(email))throw new Error('Escribe tu nombre y un correo válido.');
      if(await derivar(password,u.salt)!==u.hash)throw new Error('La contraseña actual no coincide.');
      const datos=leer();if(email!==u.email&&Object.hasOwn(datos,email))throw new Error('Ese correo ya pertenece a otra cuenta.');
      const cuenta=migrar(datos[u.email]);cuenta.name=name;delete datos[u.email];Object.defineProperty(datos,email,{value:cuenta,enumerable:true,writable:true,configurable:true});
      guardar(datos);try{session.setItem(SESION,email);}catch(_){salir();throw new Error('Datos guardados. Vuelve a iniciar sesión con tu nuevo correo.');}
    }

    // Verifica la contraseña actual y guarda la nueva huella con una sal renovada.
    async function cambiarClave(actualClave,nueva) {
      const u=actual();if(!u||await derivar(actualClave,u.salt)!==u.hash)throw new Error('La contraseña actual no coincide.');
      if(nueva.length<10||nueva.length>128)throw new Error('La nueva contraseña debe tener entre 10 y 128 caracteres.');
      const salt=uid(),hash=await derivar(nueva,salt);cambiar(c=>{c.salt=salt;c.hash=hash;});
    }

    // Verifica la contraseña antes de borrar la cuenta y cerrar su sesión.
    async function eliminarCuenta(password) {
      const u=actual();if(!u||await derivar(password,u.salt)!==u.hash)throw new Error('La contraseña no coincide.');
      const datos=leer();delete datos[u.email];guardar(datos);salir();
    }

    // Prepara una copia de la cuenta que excluye la huella y la sal de la contraseña.
    function exportar() {const u=actual();if(!u)throw new Error('Inicia sesión.');const {hash,salt,...datos}=u;return {app:'CuidApoyo',version:2,exportedAt:new Date().toISOString(),...datos};}
    return {actual,activa,cambiar,cambiarPersona,registro,login,salir,guardarPersona,seleccionar,eliminarPersona,agendaStorage,editarCuenta,cambiarClave,eliminarCuenta,exportar};
  }
  let repositorio;
  // El fallo de acceso queda visible en la interfaz, sin fingir persistencia temporal.
  try {repositorio=crearRepositorio(raiz.localStorage,raiz.sessionStorage);}catch(_){repositorio=crearRepositorio(null,null);}
  raiz.CuidaCuenta={CLAVE,SESION,categorias,frecuencias,persona,crearRepositorio,derivar,fuerza,emailValido,uid,repositorio};
})(typeof window!=='undefined'?window:globalThis);