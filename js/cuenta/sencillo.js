// Adaptación de perfiles a las opciones del asistente sencillo.

(function(){
  'use strict';
  // Traducción de la interfaz sencilla al modelo existente, sin borrar datos.
  const opciones=[
    ['moverse','Moverse','move',['movilidad']],
    ['comer','Comer y beber','cup',['alimentacion','hidratacion']],
    ['asearse','Asearse','drop',['higiene']],
    ['vestirse','Vestirse','shirt',['vestimenta']],
    ['recordar','Recordar cosas','sun',['memoria']],
    ['comunicarse','Comunicarse','chat',['comunicacion']],
    ['descansar','Dormir y descansar','moon',['descanso']],
    ['acompanar','Sentirse acompañado','heart',['emocional','social']]
  ].map(([id,nombre,icono,keys])=>({id,nombre,icono,keys}));
  const ayudas=['Un poco de ayuda','Bastante ayuda','Ayuda durante casi todo el día'];

  // Traduce los niveles de autonomía anteriores a las opciones de ayuda actuales.
  function ayudaActual(valor){if(ayudas.includes(valor))return valor;return ({'Independiente':ayudas[0],'Necesita apoyo puntual':ayudas[0],'Necesita apoyo frecuente':ayudas[1],'Necesita apoyo continuo':ayudas[2]})[valor]||'';}

  // Actualiza las necesidades conservando categorías y frecuencias compatibles.
  function guardarNecesidades(anteriores,seleccion){
    const needs={...anteriores};
    opciones.forEach(o=>{
      const teniaAyuda=o.keys.some(k=>Object.hasOwn(anteriores,k));
      o.keys.forEach(k=>{
        if(!seleccion.includes(o.id))delete needs[k];
        else if(Object.hasOwn(anteriores,k)||!teniaAyuda)needs[k]=anteriores[k]||'Según necesidad';
      });
    });
    return needs;
  }

  // Adapta una copia del borrador al asistente sencillo y limita su paso a los valores válidos.
  function borrador(d){
    const nuevo=JSON.parse(JSON.stringify(d));
    if(!nuevo.simple){nuevo.step=0;nuevo.simple=true;}
    nuevo.step=Math.max(0,Math.min(2,nuevo.step||0));return nuevo;
  }
  window.CuidaSimple={opciones,ayudas,ayudaActual,guardarNecesidades,borrador};
})();