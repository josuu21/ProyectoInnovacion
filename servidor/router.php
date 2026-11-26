<?php
// Router exclusivo del servidor de desarrollo; evita publicar datos y archivos internos.
$path=rawurldecode(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH));
if (strpos($path,"\0")!==false || strpos($path,'\\')!==false || preg_match('~(?:^|/)(?:\.|servidor|local|pruebas|docs)(?:/|$)|(?:^|/)\.[^/]*~i',$path)) { http_response_code(404); exit('No disponible'); }
$file=realpath(__DIR__.'/..'.$path);
$root=realpath(__DIR__.'/..');
if($file===false || ($file!==$root && strpos($file,$root.DIRECTORY_SEPARATOR)!==0)) {http_response_code(404);exit;}
if(is_file($file) && !preg_match('/\.(html|css|js|jpg|jpeg|png|svg|ico|webp|gif|woff2?)$/i',$file) && $file!==$root.DIRECTORY_SEPARATOR.'api'.DIRECTORY_SEPARATOR.'comunidad.php') {http_response_code(404);exit;}
return false;
