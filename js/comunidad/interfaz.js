/* Comunidad: cliente de la API propia; no recibe perfiles de cuidados. */
(()=>{
'use strict';
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let user=null,csrf='',state=null,selected=null,busy=false,timer=null,lastUnread=null,epoch=0,searchSeq=0,messages=[],more=false,peerRead=0,chatBlocked=false,stream=null,scanTimer=null;
const drafts=new Map(),avatars=['💜','🌸','🌿','☀️','🦋','🌻','😊','🌈'];
async function api(action,data,query={}){
 const url=new URL('../api/comunidad.php',location.href);url.searchParams.set('action',action);Object.entries(query).forEach(([k,v])=>url.searchParams.set(k,v));
 let response;try{response=await fetch(url,{method:data?'POST':'GET',credentials:'same-origin',headers:data?{'Content-Type':'application/json','X-CSRF-Token':csrf}:{},body:data?JSON.stringify(data):undefined});}catch(_){throw Error('No hay conexión. Comprueba tu red y vuelve a intentarlo.');}
 let result;try{result=await response.json();}catch(_){throw Error('Comunidad necesita el servidor PHP. Consulta las instrucciones de puesta en marcha.');}
 if(!response.ok){if(response.status===401 && user){endSession();notice('La sesión ha terminado. Vuelve a entrar.');}throw Error(result.error||'No se ha podido completar la operación.');}return result;
}
function notice(text){$('#social-status').textContent=text;const dialog=document.querySelector('dialog[open]');if(dialog){let status=dialog.querySelector('.social-dialog-status');if(!status){status=document.createElement('p');status.className='social-dialog-status social-note';status.setAttribute('role','status');dialog.querySelector('.social-dialog-head').after(status);}status.textContent=text;}}
function showError(e){notice(e.message||'Ha ocurrido un error. Inténtalo de nuevo.');}
function row(u,actions='',extra=''){return `<article class="social-person"><span class="social-avatar" aria-hidden="true">${esc(u.avatar)}</span><div><strong>${esc(u.name)}</strong><small>@${esc(u.username)}</small>${extra}</div><div class="social-actions">${actions}</div></article>`;}
function button(label,action,id){return `<button type="button" data-action="${action}" data-id="${id}">${label}</button>`;}
function auth(){$('#social-auth').hidden=false;$('#social-app').hidden=true;$('#social-account').hidden=true;}
function endSession(){epoch++;user=null;csrf='';state=null;selected=null;lastUnread=null;drafts.clear();messages=[];clearTimeout(timer);stopCamera();document.querySelectorAll('dialog[open]').forEach(d=>d.close());$('#social-auth-form').reset();$('#social-register-fields').hidden=true;$('#social-register-fields').disabled=true;$('#social-auth-submit').textContent='Entrar en Comunidad';$('#social-compose').pending=null;$('#social-list').innerHTML='';$('#social-messages').innerHTML='';$('#social-search-results').innerHTML='';auth();}
function start(result){renderPeople.signature=null;user=result.user;csrf=result.csrf;epoch++;lastUnread=null;$('#social-auth').hidden=true;$('#social-app').hidden=false;$('#social-account').hidden=false;$('#social-user').textContent=user.name;tick();}
$('#social-auth-form').addEventListener('submit',async e=>{
 e.preventDefault();const f=e.currentTarget,b=f.querySelector('[type=submit]');b.disabled=true;
 try{start(await api($('#social-register').checked?'register':'login',Object.fromEntries(new FormData(f))));f.reset();notice('Ya estás en Comunidad.');}catch(e){showError(e);}finally{b.disabled=false;}
});
$('#social-register').addEventListener('change',()=>{const register=$('#social-register').checked;$('#social-register-fields').hidden=!register;$('#social-register-fields').disabled=!register;$('#social-auth-submit').textContent=register?'Crear cuenta de Comunidad':'Entrar en Comunidad';$('#social-password').autocomplete=register?'new-password':'current-password';});
function renderList(){
 if(!state)return;const q=$('#social-filter').value.trim().toLocaleLowerCase('es');const list=state.conversations.filter(c=>(c.name+' '+c.username).toLocaleLowerCase('es').includes(q));
 const listHTML=list.length?list.map(c=>`<button class="social-thread ${selected?.id===c.id?'selected':''}" data-action="chat" data-id="${c.id}" aria-pressed="${selected?.id===c.id}"><span class="social-avatar" aria-hidden="true">${esc(c.avatar)}</span><span><strong>${esc(c.name)}</strong><small>${esc(c.last_body||'Saluda y empieza a conversar')}</small></span>${Number(c.unread)?`<span class="social-badge" aria-label="${c.unread} mensajes sin leer">${c.unread}</span>`:''}</button>`).join(''):`<p class="social-empty">${q?'No hay conversaciones con ese nombre.':'Todavía no tienes conversaciones. Añade a alguien para empezar.'}</p>`;
 if($('#social-list').innerHTML!==listHTML)$('#social-list').innerHTML=listHTML;
 const incoming=state.requests.filter(r=>r.sender!==user.id).length;$('#social-people').textContent=`Personas${incoming?' · '+incoming+' solicitudes':' +'}`;$('#social-unread').textContent=state.conversations.reduce((n,c)=>n+Number(c.unread),0)||'';
}
function renderPeople(){
 if(!state)return;const signature=JSON.stringify([state.requests,state.contacts,state.blocks]);if(renderPeople.signature===signature)return;renderPeople.signature=signature;
 $('#social-requests').innerHTML=state.requests.length?state.requests.map(u=>row(u,u.sender===user.id?button('Cancelar','cancelled',u.id):button('Aceptar','accepted',u.id)+button('Rechazar','rejected',u.id),`<small>${u.sender===user.id?'Solicitud enviada':'Quiere añadirte'}</small>`)).join(''):'<p>No hay solicitudes pendientes.</p>';
 $('#social-contacts').innerHTML=state.contacts.length?state.contacts.map(u=>row(u,u.blocked?button('Desbloquear','unblock',u.id):button('Conversar','open',u.id)+button('Bloquear','block',u.id))).join(''):'<p>Todavía no tienes contactos. Busca a alguien por nombre o código personal.</p>';
 $('#social-blocks').innerHTML=state.blocks.length?state.blocks.map(u=>row(u,button('Desbloquear','unblock',u.id))).join(''):'<p>No tienes personas bloqueadas.</p>';
}
async function refresh(){
 const version=epoch;const result=await api('state');if(version!==epoch||!user)return;if(Number(result.uid)!==user.id){endSession();notice('Se ha cambiado la cuenta desde otra pestaña. Vuelve a entrar.');return;}state=result;
 const unread=state.conversations.reduce((n,c)=>n+Number(c.unread),0);if(lastUnread!==null && unread>lastUnread)notice('Tienes un nuevo mensaje. Abre la conversación para leerlo.');lastUnread=unread;
 renderList();renderPeople();if(selected){const now=state.conversations.find(c=>c.id===selected.id);if(now){selected=now;$('#social-chat-name').textContent=selected.name;}await refreshMessages();}$('#social-connection').textContent='Conectado · actualización automática';
}
async function tick(){clearTimeout(timer);if(!user)return;if(!busy){busy=true;try{await refresh();}catch(e){$('#social-connection').textContent='Sin conexión · reintentando';showError(e);}finally{busy=false;}}if(user)timer=setTimeout(tick,1800);}
function stamp(s){return new Date(s).toLocaleString('es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});}
function renderMessages(){
 const box=$('#social-messages'),nearBottom=box.scrollHeight-box.scrollTop-box.clientHeight<90;
 const html=messages.length?messages.map(m=>`<div class="social-message ${m.sender===user.id?'mine':''}"><p>${esc(m.body)}</p><small><time datetime="${esc(m.created)}">${esc(stamp(m.created))}</time>${m.sender===user.id?' · '+(m.id<=peerRead?'✓✓ Leído':'✓ Enviado'):''}</small></div>`).join(''):'<p class="social-empty">Este es el comienzo de vuestra conversación. Puedes enviar un saludo.</p>';
 if(box.innerHTML!==html){box.innerHTML=html;if(nearBottom)box.scrollTop=box.scrollHeight;}
 $('#social-older').hidden=!more;$('#social-blocked').hidden=!chatBlocked;$('#social-compose button[type=submit]').disabled=chatBlocked;$('#social-body').disabled=chatBlocked;
}
async function refreshMessages(){
 const id=selected.id,version=epoch;const result=await api('messages',null,{conversation:id});if(!user || version!==epoch || selected?.id!==id)return;
 const older=messages.filter(m=>result.messages.length&&m.id<result.messages[0].id);messages=[...older,...result.messages];if(!older.length)more=result.more;peerRead=result.peer_read;chatBlocked=result.blocked;renderMessages();
 if(document.visibilityState==='visible' && !$('#social-chat').hidden && messages.length && selected.read_id<messages[messages.length-1].id){const last=messages[messages.length-1].id;await api('read',{conversation:id,last});if(selected?.id===id)selected.read_id=last;}
}
async function selectChat(c){selected=c;messages=[];more=false;$('#social-welcome').hidden=true;$('#social-chat').hidden=false;$('#social-app').classList.add('has-chat');$('#social-chat-name').textContent=c.name;$('#social-body').value=drafts.get(c.id)||'';$('#social-messages').innerHTML='';renderList();await refreshMessages();$('#social-messages').scrollTop=$('#social-messages').scrollHeight;$('#social-body').focus();}
$('#social-filter').addEventListener('input',renderList);$('#social-body').addEventListener('input',e=>{if(selected)drafts.set(selected.id,e.target.value);});
$('#social-compose').addEventListener('submit',async e=>{
 e.preventDefault();if(!selected)return;const body=$('#social-body').value.trim();if(!body)return;const form=e.currentTarget,id=selected.id,b=form.querySelector('[type=submit]');b.disabled=true;
 let pending=form.pending;if(!pending||pending.body!==body||pending.conversation!==id)pending={conversation:id,body,nonce:Array.from(crypto.getRandomValues(new Uint8Array(24)),v=>v.toString(16).padStart(2,'0')).join('')};form.pending=pending;
 try{await api('send',pending);form.pending=null;drafts.delete(id);if(selected?.id===id){$('#social-body').value='';await refreshMessages();$('#social-messages').scrollTop=$('#social-messages').scrollHeight;}await refresh();}catch(e){showError(e);}finally{b.disabled=chatBlocked;}
});
$('#social-older').addEventListener('click',async()=>{if(!selected||!messages.length)return;const id=selected.id;try{const r=await api('messages',null,{conversation:id,before:messages[0].id});if(selected?.id!==id)return;const box=$('#social-messages'),height=box.scrollHeight;messages=[...r.messages,...messages];more=r.more;renderMessages();box.scrollTop=box.scrollHeight-height;}catch(e){showError(e);}});
$('#social-search-form').addEventListener('submit',async e=>{e.preventDefault();await searchPeople($('#social-query').value);});
async function searchPeople(q){
 const seq=++searchSeq;$('#social-query').value=q;$('#social-search-results').textContent='Buscando…';
 try{const r=await api('search',null,{q});if(seq!==searchSeq||!user)return;$('#social-search-results').innerHTML=r.users.length?r.users.map(u=>{const rel=u.relationship;const actions=rel?.status==='accepted'?button('Conversar','open',u.id):rel?.status==='pending'?(rel.sender===user.id?button('Cancelar solicitud','cancelled',u.id):button('Aceptar solicitud','accepted',u.id)):button('Añadir contacto','request',u.id);return row(u,actions,u.bio?`<p>${esc(u.bio)}</p>`:'');}).join(''):'<p>No se ha encontrado ningún usuario. Comprueba el nombre o el código. Tu propia cuenta no aparece en la búsqueda.</p>';}catch(e){$('#social-search-results').textContent=e.message;}
}
function openPeople(){renderPeople();$('#social-people-dialog').showModal();}
function openProfile(){const f=$('#social-profile-form');for(const key of ['name','username','bio','avatar'])f.elements[key].value=user[key];$('#social-code').textContent=user.code;const qr=qrcode(0,'M');qr.addData(user.code);qr.make();$('#social-qr').innerHTML=qr.createSvgTag({cellSize:6,margin:24,scalable:true});$('#social-qr svg').setAttribute('role','img');$('#social-qr svg').setAttribute('aria-label','Código QR personal de '+user.name);$('#social-profile-dialog').showModal();}
$('#social-profile-form').addEventListener('submit',async e=>{e.preventDefault();try{const r=await api('profile',Object.fromEntries(new FormData(e.currentTarget)));user=r.user;$('#social-user').textContent=user.name;$('#social-profile-dialog').close();notice('Tu perfil social se ha guardado.');await refresh();}catch(e){showError(e);}});
$('#social-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(user.code);$('#social-profile-note').textContent='Código copiado. Ya puedes enviarlo a otra persona.';}catch(_){$('#social-profile-note').textContent='Selecciona y copia el código que aparece junto al QR.';}});
$('#social-share').addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:'Mi código de CuidApoyo',text:`Añádeme en Comunidad de CuidApoyo con el código ${user.code}`});else $('#social-copy').click();}catch(e){if(e.name!=='AbortError')showError(e);}});
function stopCamera(){clearTimeout(scanTimer);if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;$('#social-video').srcObject=null;}
async function camera(){
 $('#social-camera-dialog').showModal();$('#social-camera-note').textContent='Permite usar la cámara y apunta al código QR de otra persona.';
 try{if(!navigator.mediaDevices?.getUserMedia)throw Error('La cámara no está disponible. Usa HTTPS o localhost, o introduce el código personal.');const captured=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});if(!$('#social-camera-dialog').open){captured.getTracks().forEach(t=>t.stop());return;}stream=captured;const video=$('#social-video');video.srcObject=stream;await video.play();const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
 const scan=async()=>{if(!stream)return;if(video.readyState>=2){canvas.width=640;canvas.height=Math.round(video.videoHeight/video.videoWidth*640);ctx.drawImage(video,0,0,canvas.width,canvas.height);const frame=ctx.getImageData(0,0,canvas.width,canvas.height);const result=jsQR(frame.data,frame.width,frame.height,{inversionAttempts:'attemptBoth'});if(result){const code=result.data.trim().toUpperCase();if(/^CA-[A-F0-9]{16}$/.test(code)){stopCamera();$('#social-camera-dialog').close();if(!$('#social-people-dialog').open)openPeople();await searchPeople(code);return;}$('#social-camera-note').textContent='Este QR no es un código personal de CuidApoyo.';}}scanTimer=setTimeout(scan,250);};scan();
 }catch(e){stopCamera();$('#social-camera-note').textContent=e.name==='NotAllowedError'?'No se ha permitido la cámara. Puedes introducir el código personal.':e.message||'No se ha podido abrir la cámara. Introduce el código personal.';}
}
$('#social-camera-dialog').addEventListener('close',stopCamera);$('#social-emojis').innerHTML=['😊','💜','👋','🌸','👍','🤗','🙏','☀️'].map(e=>`<button type="button" data-action="emoji" data-emoji="${e}" aria-label="Insertar ${e}">${e}</button>`).join('');$('#social-avatar').innerHTML=avatars.map(a=>`<option value="${a}">${a}</option>`).join('');
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action,id=Number(b.dataset.id);b.disabled=true;
 try{if(action==='close'){b.closest('dialog').close();return;}if(action==='people'){openPeople();return;}if(action==='profile'){openProfile();return;}if(action==='camera'){await camera();return;}if(action==='emoji'){const f=$('#social-body');f.setRangeText(b.dataset.emoji,f.selectionStart,f.selectionEnd,'end');f.dispatchEvent(new Event('input'));f.focus();return;}if(action==='back'){$('#social-app').classList.remove('has-chat');$('#social-chat').hidden=true;$('#social-welcome').hidden=false;selected=null;renderList();return;}if(action==='logout'){await api('logout',{});endSession();notice('Has cerrado sesión en Comunidad.');return;}if(action==='chat'){await selectChat(state.conversations.find(c=>c.id===id));return;}
 if(action==='hide'){if(!selected||!confirm('¿Eliminar esta conversación de tu vista? La otra persona conservará su historial.'))return;await api('hide',{conversation:selected.id});selected=null;messages=[];$('#social-chat').hidden=true;$('#social-welcome').hidden=false;$('#social-app').classList.remove('has-chat');notice('Conversación eliminada de tu vista. Volverá a aparecer si recibes otro mensaje.');await refresh();return;}
 if(action==='block-chat'){if(selected)await mutate('block',selected.peer);return;}if(['request','accepted','rejected','cancelled','block','unblock','open'].includes(action))await mutate(action,id);
 }catch(e){showError(e);}finally{b.disabled=false;}
});
async function mutate(action,id){if(action==='block' && !confirm('¿Bloquear a esta persona? No podréis enviaros mensajes hasta que se retire el bloqueo.'))return;const result=await api(['accepted','rejected','cancelled'].includes(action)?'respond':action,{target:id,choice:action});notice(({request:'Solicitud enviada correctamente.',accepted:'Solicitud aceptada. Ya podéis conversar.',rejected:'Solicitud rechazada.',cancelled:'Solicitud cancelada.',block:'Persona bloqueada.',unblock:'Has retirado tu bloqueo.'})[action]||'Conversación abierta.');await refresh();if(action==='open'){const c=state.conversations.find(c=>c.id===result.id);if(c){$('#social-people-dialog').close();await selectChat(c);}}else if($('#social-query').value.trim().length>=2 && $('#social-people-dialog').open)await searchPeople($('#social-query').value);}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&user)tick();});window.addEventListener('pagehide',()=>{clearTimeout(timer);stopCamera();});window.addEventListener('pageshow',e=>{if(e.persisted&&user)tick();});
async function iniciar(){
 try {start(await api('me'));}
 catch(e){
  if(e.message.startsWith('Inicia sesión')){auth();return;}
  // Live Server entrega archivos estáticos; nunca se envían contraseñas a otro puerto.
  const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  const staticServer=e.message.includes('necesita el servidor PHP');
  if(staticServer){
   $('#social-server-help').hidden=false;
   if(local && location.protocol==='http:' && location.port!=='8085'){
    const destination=new URL(location.href);destination.port='8085';
    $('#social-server-link').href=destination.href;$('#social-server-link').hidden=false;
    notice('Buscando el servidor local de Comunidad…');
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),2500);
    try {
     const health=new URL('../api/comunidad.php?action=health',destination);
     const response=await fetch(health,{credentials:'omit',cache:'no-store',signal:controller.signal});
     const result=await response.json();
     if(response.ok && result.service==='cuidapoyo-comunidad'){
      location.replace(destination.href);return;
     }
    }catch(_){}finally{clearTimeout(timeout);}
   }
   notice('Este servidor solo muestra la página. Arranca el servidor de Comunidad y abre el enlace de abajo.');
   return;
  }
  auth();showError(e);
 }
}
iniciar();
})();
