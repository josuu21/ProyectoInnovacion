<?php
// API de Comunidad. Nunca lee ni recibe los perfiles locales de cuidados.
declare(strict_types=1);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
function fail($status, $message) { http_response_code($status); echo json_encode(['error'=>$message], JSON_UNESCAPED_UNICODE); exit; }
function numericIds($data) { if(!is_array($data)) return $data; foreach($data as $key=>&$v) { if(is_array($v)) $v=numericIds($v); elseif(in_array($key,['id','sender','peer','a','b','conversation','read_id','hidden_id','last_id','unread','peer_read','blocked'],true) && $v!==null) $v=(int)$v; } return $data; }
function output($data) { echo json_encode(numericIds($data), JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE); exit; }
function run($sql, $args=[]) { global $db; $s=$db->prepare($sql); $s->execute($args); return $s; }
function one($sql, $args=[]) { return run($sql,$args)->fetch(PDO::FETCH_ASSOC); }
function rows($sql, $args=[]) { return run($sql,$args)->fetchAll(PDO::FETCH_ASSOC); }
function field($data,$key,$min,$max) { $s=$data[$key]??''; if (!is_string($s)) fail(422,'Revisa los datos del formulario.'); $s=trim($s); if(mb_strlen($s)<$min || mb_strlen($s)>$max) fail(422,'Revisa el campo '.$key.'.'); return $s; }
function publicUser($id) { return one('SELECT id,name,username,code,bio,avatar FROM users WHERE id=?',[$id]); }
function pairIds($a,$b) { return [min($a,$b),max($a,$b)]; }
function blocked($a,$b) { return (bool)one('SELECT 1 FROM blocks WHERE (owner=? AND target=?) OR (owner=? AND target=?)',[$a,$b,$b,$a]); }
function contact($a,$b) { list($a,$b)=pairIds($a,$b); return one('SELECT * FROM requests WHERE a=? AND b=? AND status=\'accepted\'',[$a,$b]); }
function conversation($id,$uid) {
 $c=one('SELECT * FROM conversations WHERE id=? AND (a=? OR b=?)',[$id,$uid,$uid]);
 if(!$c) fail(404,'No se encuentra esta conversación.');
 return $c;
}
function transaction($fn) { global $db; $db->exec('BEGIN IMMEDIATE'); try { $r=$fn(); $db->exec('COMMIT'); return $r; } catch(Throwable $e) { $db->exec('ROLLBACK'); throw $e; } }
// Comprobación pública sin cookies ni datos: identifica el servidor PHP local.
if (($_SERVER['REQUEST_METHOD']??'GET')==='GET' && ($_GET['action']??'')==='health') {
 header('Access-Control-Allow-Origin: *');
 output(['service'=>'cuidapoyo-comunidad','version'=>1]);
}
try {
 $directory=getenv('CUIDAPOYO_DATA_DIR') ?: dirname(__DIR__).'/servidor/datos';
 if(!is_dir($directory) && !mkdir($directory,0700,true)) throw new RuntimeException('storage');
 $db=new PDO('sqlite:'.$directory.'/comunidad.sqlite',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
 $db->exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
 $db->exec('CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, name TEXT NOT NULL, username TEXT NOT NULL UNIQUE COLLATE NOCASE, code TEXT NOT NULL UNIQUE, bio TEXT NOT NULL DEFAULT \'\', avatar TEXT NOT NULL DEFAULT \'💜\');
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, uid INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, csrf TEXT NOT NULL, expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS requests(a INTEGER NOT NULL REFERENCES users(id), b INTEGER NOT NULL REFERENCES users(id), sender INTEGER NOT NULL REFERENCES users(id), status TEXT NOT NULL CHECK(status IN (\'pending\',\'accepted\',\'rejected\',\'cancelled\')), PRIMARY KEY(a,b), CHECK(a<b));
 CREATE TABLE IF NOT EXISTS conversations(id INTEGER PRIMARY KEY, a INTEGER NOT NULL REFERENCES users(id), b INTEGER NOT NULL REFERENCES users(id), UNIQUE(a,b), CHECK(a<b));
 CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY, conversation INTEGER NOT NULL REFERENCES conversations(id), sender INTEGER NOT NULL REFERENCES users(id), body TEXT NOT NULL, created TEXT NOT NULL, nonce TEXT NOT NULL, UNIQUE(sender,nonce));
 CREATE INDEX IF NOT EXISTS messages_conversation ON messages(conversation,id);
 CREATE TABLE IF NOT EXISTS views(conversation INTEGER NOT NULL REFERENCES conversations(id), uid INTEGER NOT NULL REFERENCES users(id), read_id INTEGER NOT NULL DEFAULT 0, hidden_id INTEGER NOT NULL DEFAULT -1, PRIMARY KEY(conversation,uid));
 CREATE TABLE IF NOT EXISTS blocks(owner INTEGER NOT NULL REFERENCES users(id), target INTEGER NOT NULL REFERENCES users(id), PRIMARY KEY(owner,target), CHECK(owner<>target));
 CREATE TABLE IF NOT EXISTS attempts(bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, until INTEGER NOT NULL);');
 $method=$_SERVER['REQUEST_METHOD'];
 if(!in_array($method,['GET','POST'],true)) fail(405,'Método no permitido.');
 $action=$_GET['action']??'me';
 $data=[];
 if($method==='POST') {
  if(stripos($_SERVER['CONTENT_TYPE']??'','application/json')!==0) fail(415,'Usa JSON para enviar datos.');
  if((int)($_SERVER['CONTENT_LENGTH']??0)>20000) fail(413,'El contenido es demasiado largo.');
  $data=json_decode(file_get_contents('php://input',false,null,0,20001),true);
  if(!is_array($data)) fail(400,'No se ha podido leer la petición.');
  // Comparación con el Host recibido, sin depender de cabeceras de proxy no confiables.
  $origin=$_SERVER['HTTP_ORIGIN']??'';
  if($origin) {
   $url=parse_url($origin); $host=strtolower(($url['host']??'').(isset($url['port'])?':'.$url['port']:''));
   if($host!==strtolower($_SERVER['HTTP_HOST']??'')) fail(403,'Origen no permitido.');
  }
 }
 $secure=(!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off') || getenv('CUIDAPOYO_SECURE_COOKIE')==='1';
 function cookieSession($token,$expires) { global $secure; setcookie('cuida_social',$token,['expires'=>$expires,'path'=>'/','secure'=>$secure,'httponly'=>true,'samesite'=>'Strict']); }
 $raw=$_COOKIE['cuida_social']??'';
 $session=one('SELECT * FROM sessions WHERE token=? AND expires>?',[hash('sha256',$raw),time()]);
 $uid=$session?(int)$session['uid']:0;
 if(in_array($action,['register','login'],true)) {
  if($method!=='POST') fail(405,'Envía el formulario.');
  $bucket=hash('sha256',($_SERVER['REMOTE_ADDR']??'local').':'.$action);
  transaction(function() use($bucket){
   run('DELETE FROM attempts WHERE until<?',[time()]);
   $r=one('SELECT * FROM attempts WHERE bucket=?',[$bucket]);
   if($r && $r['count']>=30) fail(429,'Demasiados intentos. Espera 15 minutos antes de volver a probar.');
   run('INSERT INTO attempts(bucket,count,until) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1',[$bucket,time()+900]);
  });
  $email=strtolower(field($data,'email',3,254)); $password=field($data,'password',10,128);
  if(!filter_var($email,FILTER_VALIDATE_EMAIL)) fail(422,'Escribe un correo válido.');
  if($action==='register') {
   $name=field($data,'name',1,60); $username=strtolower(field($data,'username',3,30));
   if(!preg_match('/^[a-z0-9_]{3,30}$/D',$username)) fail(422,'El nombre de usuario admite letras sin tildes, números y guion bajo.');
   $hash=password_hash(hash('sha256',$password),PASSWORD_DEFAULT);
   try {run('INSERT INTO users(email,password,name,username,code) VALUES(?,?,?,?,?)',[$email,$hash,$name,$username,'CA-'.strtoupper(bin2hex(random_bytes(8)))]);} catch(PDOException $e){ if($e->getCode()==='23000') fail(409,'El correo o el nombre de usuario ya está registrado.'); throw $e; }
   $uid=(int)$db->lastInsertId();
  } else {
   $u=one('SELECT * FROM users WHERE email=?',[$email]);
   $check=$u?$u['password']:'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';
   if(!password_verify(hash('sha256',$password),$check) || !$u) fail(401,'El correo o la contraseña no coinciden.');
   $uid=(int)$u['id'];
  }
  run('DELETE FROM sessions WHERE expires<? OR token=?',[time(),hash('sha256',$raw)]);
  $token=bin2hex(random_bytes(32)); $csrf=bin2hex(random_bytes(32)); $expires=time()+604800;
  run('INSERT INTO sessions VALUES(?,?,?,?)',[hash('sha256',$token),$uid,$csrf,$expires]); cookieSession($token,$expires);
  output(['user'=>publicUser($uid),'csrf'=>$csrf]);
 }
 if(!$uid) fail(401,'Inicia sesión en Comunidad para continuar.');
 if($method==='POST' && !hash_equals($session['csrf'],$_SERVER['HTTP_X_CSRF_TOKEN']??'')) fail(403,'La sesión ha cambiado. Recarga la página.');
 $reads=['me','state','search','messages'];
 if(in_array($action,$reads,true) && $method!=='GET') fail(405,'Método no permitido.');
 if(!in_array($action,$reads,true) && $method!=='POST') fail(405,'Método no permitido.');
 if($action==='me') output(['user'=>publicUser($uid),'csrf'=>$session['csrf']]);
 if($action==='logout') { run('DELETE FROM sessions WHERE token=?',[$session['token']]); cookieSession('',time()-3600); output(['ok'=>true]); }
 if($action==='profile') {
  $name=field($data,'name',1,60); $username=strtolower(field($data,'username',3,30)); $bio=field($data,'bio',0,240); $avatar=field($data,'avatar',1,12);
  if(!preg_match('/^[a-z0-9_]{3,30}$/D',$username) || !in_array($avatar,['💜','🌸','🌿','☀️','🦋','🌻','😊','🌈'],true)) fail(422,'Revisa el nombre de usuario y el avatar.');
  try {run('UPDATE users SET name=?,username=?,bio=?,avatar=? WHERE id=?',[$name,$username,$bio,$avatar,$uid]);}catch(PDOException $e){if($e->getCode()==='23000') fail(409,'Ese nombre de usuario ya está en uso.');throw $e;}
  output(['user'=>publicUser($uid)]);
 }
 if($action==='search') {
  $q=trim((string)($_GET['q']??'')); if(mb_strlen($q)<2 || mb_strlen($q)>80) output(['users'=>[]]);
  $like='%'.str_replace(['\\','%','_'],['\\\\','\\%','\\_'],$q).'%';
  $list=rows("SELECT id,name,username,code,bio,avatar FROM users u WHERE id<>? AND (name LIKE ? ESCAPE '\' OR username LIKE ? ESCAPE '\' OR code=?) AND NOT EXISTS(SELECT 1 FROM blocks WHERE (owner=? AND target=u.id) OR (owner=u.id AND target=?)) LIMIT 30",[$uid,$like,$like,strtoupper($q),$uid,$uid]);
  foreach($list as &$u) { list($a,$b)=pairIds($uid,(int)$u['id']);$u['relationship']=one('SELECT status,sender FROM requests WHERE a=? AND b=?',[$a,$b]); } unset($u);
  output(['users'=>$list]);
 }
 if(in_array($action,['request','respond','block','unblock','open'],true)) {
  $target=filter_var($data['target']??null,FILTER_VALIDATE_INT);
  if(!$target || $target===$uid || !publicUser($target)) fail(422,'Elige a otra persona registrada.');
  list($a,$b)=pairIds($uid,$target);
  $result=transaction(function() use($action,$target,$uid,$a,$b,$data){
   if($action==='block') {run('INSERT OR IGNORE INTO blocks VALUES(?,?)',[$uid,$target]);run("UPDATE requests SET status='cancelled' WHERE a=? AND b=? AND status='pending'",[$a,$b]);return ['ok'=>true];}
   if($action==='unblock') {run('DELETE FROM blocks WHERE owner=? AND target=?',[$uid,$target]);return ['ok'=>true];}
   if(blocked($uid,$target)) fail(403,'No se puede contactar con esta persona.');
   $r=one('SELECT * FROM requests WHERE a=? AND b=?',[$a,$b]);
   if($action==='request') {
    if($r && in_array($r['status'],['pending','accepted'],true)) fail(409,'Ya existe una solicitud o ya sois contactos.');
    run("INSERT INTO requests VALUES(?,?,?,'pending') ON CONFLICT(a,b) DO UPDATE SET sender=excluded.sender,status='pending'",[$a,$b,$uid]);return ['ok'=>true];
   }
   if($action==='respond') {
    $choice=$data['choice']??'';
    if(!$r || $r['status']!=='pending') fail(409,'La solicitud ya no está pendiente.');
    if(($choice==='cancelled' && (int)$r['sender']!==$uid) || (in_array($choice,['accepted','rejected'],true) && (int)$r['sender']===$uid) || !in_array($choice,['accepted','rejected','cancelled'],true)) fail(403,'No puedes realizar esta acción.');
    run('UPDATE requests SET status=? WHERE a=? AND b=?',[$choice,$a,$b]);
    if($choice==='accepted') run('INSERT OR IGNORE INTO conversations(a,b) VALUES(?,?)',[$a,$b]);
    return ['ok'=>true];
   }
   if(!contact($uid,$target)) fail(403,'Primero debéis aceptar la solicitud de contacto.');
   run('INSERT OR IGNORE INTO conversations(a,b) VALUES(?,?)',[$a,$b]);
   $c=one('SELECT id FROM conversations WHERE a=? AND b=?',[$a,$b]);
   run('INSERT INTO views(conversation,uid,hidden_id) VALUES(?,?,-1) ON CONFLICT(conversation,uid) DO UPDATE SET hidden_id=-1',[$c['id'],$uid]);return $c;
  });output($result);
 }
 if($action==='state') {
  $requests=rows("SELECT r.sender,r.status,u.id,u.name,u.username,u.code,u.bio,u.avatar FROM requests r JOIN users u ON u.id=CASE WHEN r.a=? THEN r.b ELSE r.a END WHERE (r.a=? OR r.b=?) AND r.status='pending'",[$uid,$uid,$uid]);
  $contacts=rows("SELECT u.id,u.name,u.username,u.code,u.bio,u.avatar,EXISTS(SELECT 1 FROM blocks WHERE owner=? AND target=u.id) AS blocked FROM requests r JOIN users u ON u.id=CASE WHEN r.a=? THEN r.b ELSE r.a END WHERE (r.a=? OR r.b=?) AND r.status='accepted'",[$uid,$uid,$uid,$uid]);
  $conversations=rows("SELECT c.id,c.a,c.b,u.id AS peer,u.name,u.username,u.avatar,COALESCE(v.read_id,0) AS read_id,COALESCE(v.hidden_id,-1) AS hidden_id,(SELECT MAX(id) FROM messages WHERE conversation=c.id) AS last_id,(SELECT body FROM messages WHERE conversation=c.id ORDER BY id DESC LIMIT 1) AS last_body,(SELECT created FROM messages WHERE conversation=c.id ORDER BY id DESC LIMIT 1) AS last_time,(SELECT COUNT(*) FROM messages WHERE conversation=c.id AND sender<>? AND id>COALESCE(v.read_id,0) AND id>COALESCE(v.hidden_id,-1)) AS unread FROM conversations c JOIN users u ON u.id=CASE WHEN c.a=? THEN c.b ELSE c.a END LEFT JOIN views v ON v.conversation=c.id AND v.uid=? WHERE (c.a=? OR c.b=?) AND COALESCE((SELECT MAX(id) FROM messages WHERE conversation=c.id),0)>COALESCE(v.hidden_id,-1) ORDER BY COALESCE(last_id,0) DESC",[$uid,$uid,$uid,$uid,$uid]);
  $blocks=rows('SELECT u.id,u.name,u.username,u.code,u.bio,u.avatar FROM blocks b JOIN users u ON u.id=b.target WHERE b.owner=?',[$uid]);
  output(['uid'=>$uid,'requests'=>$requests,'contacts'=>$contacts,'conversations'=>$conversations,'blocks'=>$blocks]);
 }
 if(in_array($action,['messages','send','read','hide'],true)) {
  $id=(int)($data['conversation']??$_GET['conversation']??0); $c=conversation($id,$uid); $peer=(int)$c['a']===$uid?(int)$c['b']:(int)$c['a'];
  if($action==='messages') {
   $before=max(0,(int)($_GET['before']??0));
   $v=one('SELECT * FROM views WHERE conversation=? AND uid=?',[$id,$uid]);$hidden=$v?(int)$v['hidden_id']:-1;
   $messages=rows('SELECT id,sender,body,created FROM messages WHERE conversation=? AND id>? AND (CAST(? AS INTEGER)=0 OR id<?) ORDER BY id DESC LIMIT 101',[$id,$hidden,$before,$before]);
   $more=count($messages)>100;if($more)array_pop($messages);
   $read=one('SELECT read_id FROM views WHERE conversation=? AND uid=?',[$id,$peer]);
   output(['messages'=>array_reverse($messages),'more'=>$more,'peer_read'=>$read?(int)$read['read_id']:0,'blocked'=>blocked($uid,$peer)]);
  }
  if($action==='send') {
   $body=field($data,'body',1,4000); $nonce=field($data,'nonce',16,80);
   $message=transaction(function() use($uid,$peer,$id,$body,$nonce){
    if(blocked($uid,$peer) || !contact($uid,$peer)) fail(403,'No se puede enviar el mensaje. Revisa tus contactos y bloqueos.');
    $existing=one('SELECT id,conversation FROM messages WHERE sender=? AND nonce=?',[$uid,$nonce]);
    if($existing) {if((int)$existing['conversation']!==$id) fail(409,'Identificador de mensaje repetido.');return $existing;}
    $n=one("SELECT COUNT(*) AS n FROM messages WHERE sender=? AND created>?",[$uid,gmdate('Y-m-d\TH:i:s\Z',time()-60)]);
    if($n['n']>=90) fail(429,'Has enviado muchos mensajes. Espera un momento.');
    run('INSERT INTO messages(conversation,sender,body,created,nonce) VALUES(?,?,?,?,?)',[$id,$uid,$body,gmdate('Y-m-d\TH:i:s\Z'),$nonce]);
    return ['id'=>(int)$GLOBALS['db']->lastInsertId()];
   });output($message);
  }
  if($action==='read') {
   $last=max(0,(int)($data['last']??0));$max=one('SELECT COALESCE(MAX(id),0) AS n FROM messages WHERE conversation=?',[$id]);$last=min($last,(int)$max['n']);
   run('INSERT INTO views(conversation,uid,read_id) VALUES(?,?,?) ON CONFLICT(conversation,uid) DO UPDATE SET read_id=MAX(read_id,excluded.read_id)',[$id,$uid,$last]);output(['ok'=>true]);
  }
  if($action==='hide') {
   $max=one('SELECT COALESCE(MAX(id),0) AS n FROM messages WHERE conversation=?',[$id]);
   run('INSERT INTO views(conversation,uid,hidden_id,read_id) VALUES(?,?,?,?) ON CONFLICT(conversation,uid) DO UPDATE SET hidden_id=excluded.hidden_id,read_id=MAX(read_id,excluded.read_id)',[$id,$uid,$max['n'],$max['n']]);output(['ok'=>true]);
  }
 }
 fail(404,'Esta opción no está disponible.');
} catch(Throwable $e) { error_log('Comunidad: '.$e->getMessage()); fail(500,'No se ha podido completar la operación. Inténtalo de nuevo.'); }
