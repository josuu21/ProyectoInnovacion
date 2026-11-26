<?php
// Pruebas HTTP con tres cookies independientes. Ejecutar contra una base vacía de pruebas.
$base=$argv[1]??'http://127.0.0.1:8085';
$n=0;$tag=bin2hex(random_bytes(4));$accounts=[];
function check($value,$label){global $n;if(!$value)throw new RuntimeException('FALLO: '.$label);$n++;echo 'OK '.$label.PHP_EOL;}
function callApi(&$client,$action,$data=null,$query=[],$expected=200,$csrf=true){global $base;
 $c=curl_init($base.'/api/comunidad.php?'.http_build_query(array_merge(['action'=>$action],$query)));
 $headers=['Content-Type: application/json'];if($csrf && isset($client['csrf']))$headers[]='X-CSRF-Token: '.$client['csrf'];
 curl_setopt_array($c,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_HTTPHEADER=>$headers,CURLOPT_COOKIE=>'cuida_social='.($client['cookie']??''),CURLOPT_HEADERFUNCTION=>function($c,$h)use(&$client){if(preg_match('/^Set-Cookie: cuida_social=([^;]*)/i',$h,$m))$client['cookie']=urldecode($m[1]);return strlen($h);},CURLOPT_TIMEOUT=>10]);
 if($data!==null){curl_setopt($c,CURLOPT_POST,true);curl_setopt($c,CURLOPT_POSTFIELDS,json_encode($data));}
 $raw=curl_exec($c);$code=curl_getinfo($c,CURLINFO_HTTP_CODE);$error=curl_error($c);curl_close($c);$r=json_decode($raw,true);
 if($code!==$expected || !is_array($r))throw new RuntimeException($action.' HTTP '.$code.' (esperado '.$expected.') '.$raw.' '.$error);
 if(isset($r['csrf']))$client['csrf']=$r['csrf'];if(isset($r['user']))$client['user']=$r['user'];return $r;
}
try{
 $a=[];$b=[];$c=[];$anonymous=[];
 callApi($anonymous,'state',null,[],401);check(true,'Sin sesión no se accede a datos');
 foreach(['a','b','c'] as $key){$client=&$$key;callApi($client,'register',['name'=>'Persona '.$key.' '.$tag,'username'=>$key.'_'.$tag,'email'=>$key.'_'.$tag.'@example.test','password'=>'Prueba-Segura-123!']);}unset($client);
 check($a['cookie']!==$b['cookie'],'Dos cuentas con sesiones distintas');
 check(!isset($a['user']['email'])&&!isset($a['user']['password']),'Perfiles públicos sin correo ni hash');
 $r=callApi($a,'search',null,['q'=>$b['user']['username']]);check(count($r['users'])===1,'Búsqueda por usuario');
 $r=callApi($a,'search',null,['q'=>$b['user']['code']]);check((int)$r['users'][0]['id']===$b['user']['id'],'Búsqueda por código QR personal');
 $r=callApi($a,'search',null,['q'=>'Persona b '.$tag]);check(count($r['users'])===1,'Búsqueda por nombre visible');
 callApi($a,'request',['target'=>$a['user']['id']],[],422);check(true,'No se permite añadirse a uno mismo');
 callApi($a,'request',['target'=>$b['user']['id']],[],403,false);check(true,'Protección CSRF');
 callApi($a,'request',['target'=>$b['user']['id']]);callApi($a,'request',['target'=>$b['user']['id']],[],409);callApi($b,'request',['target'=>$a['user']['id']],[],409);check(true,'Sin solicitudes duplicadas o cruzadas');
 callApi($a,'respond',['target'=>$b['user']['id'],'choice'=>'accepted'],[],403);check(true,'El remitente no puede aceptar su solicitud');
 $s=callApi($b,'state');check(count($s['requests'])===1,'Solicitud recibida en sesión independiente');
 callApi($b,'respond',['target'=>$a['user']['id'],'choice'=>'accepted']);$s=callApi($a,'state');$id=(int)$s['conversations'][0]['id'];check(count($s['contacts'])===1,'Contacto y conversación creados');
 foreach(['messages','send','read','hide'] as $action){$data=$action==='messages'?null:['conversation'=>$id,'last'=>999,'body'=>'Intrusión','nonce'=>str_repeat('x',20)];callApi($c,$action,$data,$action==='messages'?['conversation'=>$id]:[],404);}check(true,'Tercera persona sin acceso a mensajes, envío, lectura ni eliminación');
 $message=['conversation'=>$id,'body'=>'Hola 💜 <script>alert(1)</script>','nonce'=>bin2hex(random_bytes(16))];$first=callApi($a,'send',$message);$retry=callApi($a,'send',$message);check($first['id']===$retry['id'],'Reintentos sin duplicar mensajes');
 $s=callApi($b,'state');check((int)$s['conversations'][0]['unread']===1,'No leídos y último mensaje');
 $r=callApi($b,'messages',null,['conversation'=>$id]);if(count($r['messages'])!==1) echo json_encode($r).PHP_EOL; check(count($r['messages'])===1 && $r['messages'][0]['body']===$message['body'],'Mensaje y emoji persistentes');
 callApi($b,'read',['conversation'=>$id,'last'=>$first['id']]);$r=callApi($a,'messages',null,['conversation'=>$id]);check($r['peer_read']===$first['id'],'Confirmación de lectura');
 callApi($b,'send',['conversation'=>$id,'body'=>'Hola de vuelta','nonce'=>bin2hex(random_bytes(16))]);check(count(callApi($a,'messages',null,['conversation'=>$id])['messages'])===2,'Mensajes en ambas direcciones');
 callApi($b,'block',['target'=>$a['user']['id']]);callApi($a,'send',['conversation'=>$id,'body'=>'No debe pasar','nonce'=>bin2hex(random_bytes(16))],[],403);callApi($b,'send',['conversation'=>$id,'body'=>'Tampoco pasa','nonce'=>bin2hex(random_bytes(16))],[],403);check(true,'Bloqueo impide el envío en ambos sentidos');
 callApi($b,'unblock',['target'=>$a['user']['id']]);callApi($a,'send',['conversation'=>$id,'body'=>'Tras desbloquear','nonce'=>bin2hex(random_bytes(16))]);check(true,'Desbloquear permite conversar');
 callApi($a,'hide',['conversation'=>$id]);check(count(callApi($a,'state')['conversations'])===0 && count(callApi($b,'messages',null,['conversation'=>$id])['messages'])===3,'Eliminar solo afecta a la propia vista');
 callApi($b,'send',['conversation'=>$id,'body'=>'Nuevo saludo','nonce'=>bin2hex(random_bytes(16))]);check(count(callApi($a,'state')['conversations'])===1,'Nuevo mensaje recupera la conversación oculta');
 $email='a_'.$tag.'@example.test';$stale=$a;callApi($a,'logout',[]);callApi($stale,'state',null,[],401);callApi($a,'login',['email'=>$email,'password'=>'Prueba-Segura-123!']);$s=callApi($a,'state');check(count($s['contacts'])===1 && count($s['conversations'])===1,'Contactos y mensajes tras cerrar y abrir sesión');
 callApi($c,'request',['target'=>$a['user']['id']]);callApi($c,'respond',['target'=>$a['user']['id'],'choice'=>'cancelled']);check(count(callApi($a,'state')['requests'])===0,'Cancelar solicitud');
 callApi($c,'request',['target'=>$a['user']['id']]);callApi($a,'respond',['target'=>$c['user']['id'],'choice'=>'rejected']);check(count(callApi($a,'state')['requests'])===0,'Rechazar solicitud');
 callApi($a,'profile',['name'=>'Nombre actualizado','username'=>'a_'.$tag,'bio'=>'Acompañando','avatar'=>'🌿']);check(callApi($a,'me')['user']['bio']==='Acompañando','Perfil social editable');
 foreach(['/servidor/datos/comunidad.sqlite','/.git/config','/local/','/api/comunidad.php/../../servidor/datos/comunidad.sqlite'] as $path){$h=curl_init($base.$path);curl_setopt($h,CURLOPT_RETURNTRANSFER,true);curl_exec($h);$code=curl_getinfo($h,CURLINFO_HTTP_CODE);curl_close($h);check($code===404,'Archivo interno protegido: '.$path);}
 echo 'TOTAL: '.$n.' comprobaciones correctas'.PHP_EOL;
}catch(Throwable $e){fwrite(STDERR,$e->getMessage().PHP_EOL);exit(1);}
