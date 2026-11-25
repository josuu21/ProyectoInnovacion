/* QA en Chrome instalado. Perfil desechable, servidor loopback y CDP sin paquetes. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{spawn}=require('node:child_process'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'../..'),artefactos=path.join(__dirname,'resultados');fs.mkdirSync(artefactos,{recursive:true});
const perfil=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'cuidapoyo-qa-'));
let chrome,server,ws;const errores=[];let total=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
 server=http.createServer((req,res)=>{try{let p=path.resolve(base,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!p.startsWith(base+path.sep))throw 0;const ext=path.extname(p);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg'})[ext]||'text/plain; charset=utf-8');res.end(fs.readFileSync(p));}catch(_){res.statusCode=404;res.end('No encontrado');}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-extensions','--remote-debugging-port=0','--user-data-dir='+perfil,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let port;
 for(let n=0;n<100;n++){try{port=fs.readFileSync(path.join(perfil,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch(_){await sleep(100);}}
 if(!port)throw Error('Chrome no expuso DevTools');
 const tabs=await (await fetch('http://127.0.0.1:'+port+'/json')).json();
 ws=new WebSocket(tabs.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let seq=0;const pendientes=new Map();
 ws.onmessage=ev=>{const d=JSON.parse(ev.data);if(d.id){const p=pendientes.get(d.id);if(p){pendientes.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}}else if(d.method==='Runtime.exceptionThrown'){errores.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);}};
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pendientes.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const js=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 const wait=async expression=>{for(let i=0;i<100;i++){if(await js(expression))return;await sleep(75);}throw Error('Espera agotada: '+expression);};
 async function go(page){await cdp('Page.navigate',{url:origin+'/html/'+page});await wait('document.readyState==="complete"');await sleep(120);}
 async function click(selector){assert(await js(`!!document.querySelector(${JSON.stringify(selector)})`),'No existe '+selector);await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await sleep(80);}
 async function fill(name,value,form='form'){await js(`(()=>{const f=document.querySelector(${JSON.stringify(form)}),i=f.elements[${JSON.stringify(name)}];i.value=${JSON.stringify(value)};i.dispatchEvent(new Event('input',{bubbles:true}));})()`);}
 async function submit(form){await js(`document.querySelector(${JSON.stringify(form)}).requestSubmit()`);await sleep(130);}
 async function route(hash){await js(`location.hash=${JSON.stringify(hash)}`);await sleep(100);}
 async function test(name,fn){await fn();total++;console.log('OK '+name);}
 async function shot(name){const r=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(artefactos,name+'.png'),Buffer.from(r.data,'base64'));}
 await cdp('Runtime.enable');await cdp('Page.enable');await cdp('Network.enable');await cdp('Network.setBlockedURLs',{urls:['*fonts.googleapis.com*','*fonts.gstatic.com*']});
 await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
 await go('mi-cuenta.html');
 await test('Registro corto, contraseña y teclado',async()=>{
  await fill('email','incorrecto');assert(await js('document.querySelector("[name=email]").getAttribute("aria-invalid")==="true"'));
  await click('[data-action=clave]');assert(await js('document.querySelector("[name=password]").type==="text"'));
  await click('[data-action=modo][data-id=registro]');assert.equal(await js('document.querySelectorAll("[data-form=acceso] input").length'),4);
  await fill('name','Ana de prueba');await fill('email','ana@example.test');await fill('password','Prueba-Segura-123!');await fill('confirm','no-coincide');assert(await js('document.querySelector("[name=confirm]").getAttribute("aria-invalid")==="true"'));
  await fill('confirm','Prueba-Segura-123!');await js('document.querySelector("[name=email]").focus()');await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});assert.equal(await js('document.activeElement.name'),'password');
  await shot('acceso-escritorio');await submit('[data-form=acceso]');await wait('!!document.querySelector(".cp-simple")');
 });
 await test('Entrada libre, cuatro destinos y ajustes independientes',async()=>{
  assert.equal(await js('document.querySelectorAll("[data-form=asistente]").length'),0);
  assert.deepEqual(await js('Array.from(document.querySelectorAll(".cp-lateral nav a"),a=>a.textContent.trim())'),['Mi espacio','Persona a mi cuidado','Mis tareas','Mi bienestar']);
  assert(await js('!!document.querySelector(".cp-ajustes")'));assert.equal(await js('document.querySelectorAll(".cp-principal progress,.cp-grafico,.cp-numero").length'),0);
  await route('bienestar');assert(await js('document.querySelector("#cp-titulo").textContent==="Mi bienestar"'));await route('inicio');
 });
 await test('Persona: tres pasos cortos y ocho tarjetas completas',async()=>{
  await click('[data-action=nueva]');assert.equal(await js('document.querySelectorAll("[data-form=asistente] input,[data-form=asistente] select").length'),3);
  await fill('nickname','Madre de prueba');await fill('age','78');await fill('relationship','Mi madre');await submit('[data-form=asistente]');
  assert.equal(await js('document.querySelectorAll(".cp-ayuda-tarjeta").length'),8);assert.equal(await js('document.querySelectorAll("[data-form=asistente] select").length'),0);
  await click('.cp-ayuda-tarjeta:has([value=moverse])');await click('.cp-ayuda-tarjeta:has([value=comer])');assert(await js('document.querySelector("[value=moverse]").checked'));await shot('asistente-ayudas');
  await click('[data-action=paso-atras]');assert.equal(await js('document.querySelector("[name=nickname]").value'),'Madre de prueba');await submit('[data-form=asistente]');assert(await js('document.querySelector("[value=moverse]").checked'));await submit('[data-form=asistente]');
  assert.equal(await js('document.querySelectorAll("[name=autonomy]").length'),3);await click('.cp-nivel-ayuda label:nth-child(3)');await submit('[data-form=asistente]');await wait('!!document.querySelector(".cp-simple")');
  assert.equal(await js('CuidaCuenta.repositorio.activa().nickname'),'Madre de prueba');assert.equal(await js('CuidaCuenta.repositorio.activa().autonomy'),'Bastante ayuda');
  assert(await js('CuidaCuenta.repositorio.activa().needs.alimentacion&&CuidaCuenta.repositorio.activa().needs.hidratacion'));
 });
 await test('Inicio con lo importante y recomendaciones automáticas',async()=>{
  assert.equal(await js('document.querySelector("#cp-titulo").textContent'),'Hola, Ana de prueba');assert(await js('!!document.querySelector("[data-action=editar]")'));
  assert.equal(await js('document.querySelectorAll(".cp-principal progress,.cp-grafico,.cp-numero").length'),0);
  assert(await js('document.querySelector(".cp-recomendaciones-simples").textContent.includes("moverse")'));
  assert(await js('document.querySelector(".cp-recomendaciones-simples").textContent.includes("comidas")'));
  await shot('panel-escritorio');
 });
 await test('Tarea con solo nombre, fecha y hora opcional',async()=>{
  await route('plan');assert.deepEqual(await js('Array.from(document.querySelectorAll("[data-form=tarea] input"),i=>i.name)'),['title','date','time']);
  await fill('title','Paseo de prueba','[data-form=tarea]');await fill('time','18:00','[data-form=tarea]');await submit('[data-form=tarea]');assert.equal(await js('CuidaCuenta.repositorio.activa().agenda.tasks.length'),1);
  assert(await js('parseInt(getComputedStyle(document.querySelector("[data-tarea]")).width)>=28'));
  await click('[data-tarea]');assert.equal(await js('CuidaCuenta.repositorio.activa().agenda.tasks[0].status'),'hecha');
  await click('.cp-principal>.cp-secundario summary');await click('[data-tarea]');assert.equal(await js('CuidaCuenta.repositorio.activa().agenda.tasks[0].status'),'pendiente');
 });
 await test('Calendario usa la misma tarea y devuelve los cambios',async()=>{
  await go('calendario.html');assert(await js('document.querySelector(".cuenta-contexto").textContent.includes("Madre de prueba")'));await click('#vistaDia');
  await js('(()=>{const s=document.querySelector(".agenda-tarjeta select");s.value="hecha";s.dispatchEvent(new Event("change",{bubbles:true}));})()');
  assert.equal(await js('CuidaCuenta.repositorio.activa().agenda.tasks.length'),1);await go('mi-cuenta.html');
  assert.equal(await js('document.querySelectorAll(".cp-principal>article [data-tarea]").length'),0);
 });
 await test('Edición rápida conserva notas, pasos y categoría de una tarea',async()=>{
  await js('CuidaCuenta.repositorio.cambiarPersona(CuidaCuenta.repositorio.activa().id,p=>{const t=p.agenda.tasks[0];t.status="pendiente";t.category="personal";t.notes="Nota anterior";t.checklist=[{id:"paso-previo",text:"Preparar",done:true}];})');
  await go('mi-cuenta.html#plan');await click('.cp-tarea-opciones summary');await click('[data-action=editar-tarea]');await fill('title','Paseo modificado','[data-form=tarea]');await submit('[data-form=tarea]');
  assert.deepEqual(await js('(()=>{const t=CuidaCuenta.repositorio.activa().agenda.tasks[0];return [t.title,t.notes,t.category,t.checklist[0].done];})()'),['Paseo modificado','Nota anterior','personal',true]);
 });
 await test('Modificar persona no elimina información anterior ni frecuencias',async()=>{
  await js('CuidaCuenta.repositorio.cambiarPersona(CuidaCuenta.repositorio.activa().id,p=>{p.preferences="Ventana abierta";p.enjoys="Música";p.organization.daily="Preparar la ropa";p.needs.movilidad="Diaria";delete p.needs.hidratacion;p.needs.rutinas="Semanal";p.favorites=["recurso-autocuidado"];p.tracking[CuidaAgenda.hoy()]={activities:"Lectura"};})');
  await go('mi-cuenta.html#personas');await click('[data-action=editar]');await fill('nickname','Madre de prueba');await submit('[data-form=asistente]');await submit('[data-form=asistente]');await submit('[data-form=asistente]');
  assert.deepEqual(await js('(()=>{const p=CuidaCuenta.repositorio.activa();return [p.preferences,p.enjoys,p.organization.daily,p.needs.movilidad,p.needs.rutinas,p.favorites[0],p.agenda.tasks.length,p.tracking[CuidaAgenda.hoy()].activities];})()'),['Ventana abierta','Música','Preparar la ropa','Diaria','Semanal','recurso-autocuidado',1,'Lectura']);assert(await js('!Object.hasOwn(CuidaCuenta.repositorio.activa().needs,"hidratacion")'));
 });
 await test('Favoritos y tutoriales conectados con las páginas públicas',async()=>{
  await go('recursos.html');await click('[data-contenido=recurso-organiza][data-campo=favorites]');await go('tutoriales.html');await click('[data-contenido=video-espacio][data-campo=consulted]');
  assert(await js('CuidaCuenta.repositorio.activa().consulted.includes("video-espacio")'));await go('mi-cuenta.html');await click('.cp-principal>.cp-secundario summary');
  assert(await js('document.querySelector(".cp-principal>.cp-secundario").textContent.includes("Mis favoritos")'));assert.equal(await js('CuidaCuenta.repositorio.activa().favorites.length'),2);
 });
 await test('Chatbot conserva permiso explícito y temas enlazados',async()=>{
  await go('chatbot.html');assert.equal(await js('document.querySelector(".chat-perfil input").checked'),false);await click('.chat-perfil input');assert(await js('document.querySelectorAll(".chat-perfil .chat-opciones button").length>0'));await click('.chat-perfil .chat-opciones button');await wait('document.querySelectorAll(".chat-mensaje-bot").length>1');await click('.chat-perfil input');
  await go('chatbot.html?tema=memoria');await wait('document.querySelectorAll(".chat-mensaje-bot").length>1');assert(await js('document.querySelector("#chatTema").textContent==="Tema: "+CuidaChat.base.find(x=>x.id==="memoria").titulo'));
 });
 await test('Bienestar sencillo y diario voluntario cerrado al entrar',async()=>{
  await go('mi-cuenta.html#bienestar');assert.equal(await js('document.querySelector(".cp-principal>.cp-secundario").open'),false);await click('.cp-principal>.cp-secundario summary');
  await fill('minutes','30','[data-form=bienestar]');await fill('goal','Leer un rato','[data-form=bienestar]');await submit('[data-form=bienestar]');assert.equal(await js('CuidaCuenta.repositorio.actual().wellbeing[CuidaAgenda.hoy()].minutes'),30);
  await click('[data-action=pausa]');assert.equal(await js('document.querySelector("[data-form=tarea]").elements.title.value'),'Un momento para mí');await submit('[data-form=tarea]');assert(await js('CuidaCuenta.repositorio.activa().agenda.tasks.some(t=>t.category==="personal"&&t.title==="Un momento para mí")'));
 });
 await test('Varias personas se conservan en las opciones secundarias',async()=>{
  await route('personas');await click('.cp-principal>.cp-secundario>summary');await click('[data-action=nueva]');await fill('nickname','Segunda persona');await submit('[data-form=asistente]');await submit('[data-form=asistente]');await submit('[data-form=asistente]');
  assert.equal(await js('CuidaCuenta.repositorio.actual().people.length'),2);assert.equal(await js('CuidaCuenta.repositorio.activa().agenda.tasks.length'),0);await route('personas');
  await js('(()=>{const s=document.querySelector("#cp-persona-activa");s.value=CuidaCuenta.repositorio.actual().people[0].id;s.dispatchEvent(new Event("change"));})()');assert.equal(await js('CuidaCuenta.repositorio.activa().agenda.tasks.length'),2);
 });
 await test('Borrador de cinco pasos se retoma sin perder datos',async()=>{
  await js('CuidaCuenta.repositorio.cambiar(u=>{u.draft={step:4,person:CuidaCuenta.persona({nickname:"Borrador antiguo",preferences:"Conservar esto",organization:{daily:"Mi rutina"}}),caregiver:{experience:"Años"}};})');
  await go('mi-cuenta.html');assert.equal(await js('document.querySelectorAll("[data-form=asistente]").length'),0);await route('personas');await click('[data-action=continuar-asistente]');
  assert.equal(await js('document.querySelector("[name=nickname]").value'),'Borrador antiguo');assert(await js('document.querySelector("#cp-titulo").textContent.includes("quién" )'));
  await submit('[data-form=asistente]');await submit('[data-form=asistente]');await submit('[data-form=asistente]');assert.equal(await js('CuidaCuenta.repositorio.activa().preferences'),'Conservar esto');assert.equal(await js('CuidaCuenta.repositorio.activa().organization.daily'),'Mi rutina');
 });
 await test('Pausar el asistente es opcional y no interrumpe la navegación',async()=>{
  await route('personas');await click('[data-action=editar]');await fill('nickname','Apodo pendiente');await click('[data-action=pausar-asistente]');await route('bienestar');assert.equal(await js('document.querySelectorAll("[data-form=asistente]").length'),0);await route('personas');await click('[data-action=continuar-asistente]');assert.equal(await js('document.querySelector("[name=nickname]").value'),'Apodo pendiente');await click('[data-action=pausar-asistente]');await click('[data-action=descartar-borrador]');
 });
 await test('Móvil, tablet y oscuro: cuatro accesos sin desbordamiento',async()=>{
  for(const ancho of [320,390,768]){await cdp('Emulation.setDeviceMetricsOverride',{width:ancho,height:1000,deviceScaleFactor:1,mobile:true});await route('inicio');await js('document.documentElement.dataset.tema="oscuro"');assert(await js('document.documentElement.scrollWidth<=innerWidth'));assert.equal(await js('document.querySelectorAll(".cp-lateral nav a").length'),4);if(ancho===390)await shot('panel-movil-oscuro');}
  await route('personas');await click('[data-action=editar]');await submit('[data-form=asistente]');assert(await js('document.documentElement.scrollWidth<=innerWidth'));await shot('asistente-movil');await click('[data-action=pausar-asistente]');await click('[data-action=descartar-borrador]');
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});await route('inicio');await js('document.documentElement.dataset.tema="claro"');
 });
 await test('Ajustes, clave y volver a entrar sin cuestionario',async()=>{
  await route('configuracion');await fill('current','Prueba-Segura-123!','[data-form=cambiar-clave]');await fill('password','Nueva-Prueba-456!','[data-form=cambiar-clave]');await fill('confirm','Nueva-Prueba-456!','[data-form=cambiar-clave]');await submit('[data-form=cambiar-clave]');await wait('document.querySelector("#cuentaEstado").textContent.includes("Contraseña actualizada")');await click('[data-action=salir]');await fill('email','ana@example.test');await fill('password','Nueva-Prueba-456!');await submit('[data-form=acceso]');await wait('!!document.querySelector(".cp-simple")');assert.equal(await js('location.hash'),'#inicio');assert.equal(await js('document.querySelectorAll("[data-form=asistente]").length'),0);
 });
 await test('XSS y eliminación con confirmación conservados',async()=>{
  await js('CuidaCuenta.repositorio.cambiarPersona(CuidaCuenta.repositorio.activa().id,p=>p.nickname="<img src=x onerror=window.__xss=1>")');await go('mi-cuenta.html');assert.equal(await js('window.__xss||0'),0);assert(await js('document.querySelector(".cp-principal").textContent.includes("<img")'));
  await route('personas');await click('.cp-principal>.cp-secundario>summary');await click('[data-action=eliminar-persona]');await click('[data-action=cancelar-confirmacion]');assert.equal(await js('CuidaCuenta.repositorio.actual().people.length'),3);
 });
 await test('Eliminar cuenta requiere contraseña y borra solo la cuenta',async()=>{
  await route('configuracion');await click('[data-action=eliminar-cuenta]');await fill('password','Nueva-Prueba-456!','#cp-confirmacion');await click('#cp-confirmacion [type=submit]');await wait('!!document.querySelector("[data-form=acceso]")');assert.equal(await js('CuidaCuenta.repositorio.actual()'),null);
 });
 await test('Regresión: calendario existente completo',async()=>{await go('pruebas/calendario/pruebas.html');await wait('!!document.body.dataset.pruebas');const resultados=await js('window.resultadosAgenda');fs.writeFileSync(path.join(artefactos,'calendario.json'),JSON.stringify(resultados,null,2));assert.equal(await js('document.body.dataset.pruebas'),'ok',JSON.stringify(resultados?.filter(x=>!x.ok)));console.log(await js('document.querySelector("#resumen").textContent'));});
 await test('Regresión: motor e interfaz del chatbot existentes',async()=>{await go('pruebas/chatbot/pruebas.html');await wait('!!document.body.dataset.pruebas');const motor=await js('window.resultadosMotor'),interfaz=await js('window.resultadosInterfaz');fs.writeFileSync(path.join(artefactos,'chatbot.json'),JSON.stringify({motor,interfaz},null,2));assert.equal(await js('document.body.dataset.pruebas'),'ok',JSON.stringify({motor:motor?.filter(x=>!x.ok),interfaz:interfaz?.filter(x=>!x.ok)}));console.log(await js('document.querySelector("#resumen").textContent+" "+document.querySelector("#resumenInterfaz").textContent'));});
 assert.deepEqual(errores,[],'Errores de consola');
 fs.writeFileSync(path.join(artefactos,'informe.json'),JSON.stringify({passed:total,consoleErrors:errores,date:new Date().toISOString()},null,2));
 console.log('RESULTADO NAVEGADOR: '+total+' pruebas correctas; cero excepciones de JavaScript.');
}
main().catch(e=>{console.error(e);if(errores.length)console.error(errores);process.exitCode=1;}).finally(async()=>{ws?.close();chrome?.kill();server?.close();/* El perfil temporal de Chrome no contiene datos del usuario. */});