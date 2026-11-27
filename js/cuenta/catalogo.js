// Contenidos: catálogo de recursos y recomendaciones según las necesidades.

/* Catálogo de contenidos reales. Los vídeos previstos nunca cuentan como vistos. */
(function(){
  'use strict';

  // Tutoriales previstos, todavía marcados como no disponibles en el catálogo.
  const tutoriales=[['aseo','Aseo diario: por dónde empezar','higiene'],['espacio','Preparar un espacio cómodo para moverse','movilidad'],['comidas','Organizar el momento de las comidas','alimentacion'],['comodidad','La comodidad también forma parte del cuidado','higiene'],['ayuda','Cuándo pedir ayuda para una movilización','movilidad'],['pausa','Encontrar un momento de descanso para ti','bienestar'],['escuchar','Escuchar y acompañar en el día a día','emocional'],['repartir','Cómo repartir las tareas de cuidado','rutinas'],['sentir','Hablar de cómo te sientes al cuidar','bienestar']].map(([id,title,category])=>({id:'video-'+id,title,category,url:'tutoriales.html#video-'+id,kind:'tutorial',available:false}));

  // Recursos escritos disponibles y sus destinos dentro de la web.
  const recursos=[{id:'recurso-inicio',title:'Estoy empezando a cuidar',category:'inicio',url:'recursos.html#empezar'}, {id:'recurso-organiza',title:'Quiero organizar mejor mi día',category:'rutinas',url:'recursos.html#organiza'}, {id:'recurso-autocuidado',title:'También necesito cuidarme',category:'bienestar',url:'recursos.html#autocuidado'}, {id:'recurso-dudas',title:'Resuelve tus primeras dudas',category:'inicio',url:'recursos.html#dudas'}].map(r=>({...r,kind:'recurso',available:true}));

  // Enlaces al chat para cada categoría de necesidades.
  const orientaciones=CuidaCuenta.categorias.map(c=>({id:'orientacion-'+c.id,title:'Orientación: '+c.nombre,category:c.id,url:'chatbot.html?tema='+c.chat,kind:'recurso',available:true}));
  window.CuidaCatalogo=[...recursos,...tutoriales,...orientaciones];

  // Selecciona contenidos según las necesidades y la situación del cuidador.
  window.CuidaRecomendados=(p,u)=>{
    const cats=new Set(Object.keys(p?.needs||{}));
    if(cats.has('vestimenta'))cats.add('higiene');if(cats.has('hidratacion'))cats.add('alimentacion');if(cats.has('seguridad'))cats.add('movilidad');if(cats.has('comunicacion')||cats.has('social'))cats.add('emocional');
    const horas=u?.caregiver?.time;
    if(horas==='Más de 8 horas al día'||!u?.caregiver?.help||u.caregiver.help==='No habitualmente')cats.add('bienestar');
    return window.CuidaCatalogo.filter(r=>r.category==='inicio'||r.category==='bienestar'||cats.has(r.category));
  };
})();