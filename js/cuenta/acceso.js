/* Acceso común: enlace normal a la página personal, sin ventanas de formulario. */
(function(){
  'use strict';
  const R=window.CuidaCuenta.repositorio;
  const rutaCuenta=new URL('../../html/mi-cuenta.html',document.currentScript.src).href;
  function actualizar(){
    let u=null;try{u=R.actual();}catch(_){}
    document.querySelectorAll('.cabecera-accion,#contactoBoton,.pie-navegacion a[href$="index.html#contacto"]').forEach(a=>{a.href=rutaCuenta;a.textContent=u?'Mi cuenta':a.id==='contactoBoton'?'Crear mi cuenta':'Iniciar sesión';});
  }
  actualizar();window.addEventListener('cuida-cuenta-cambio',actualizar);window.addEventListener('pageshow',actualizar);window.addEventListener('storage',actualizar);
})();