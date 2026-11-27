// Pruebas del motor: reconocimiento de temas, variantes y continuidad del contexto.

/* Pruebas sin dependencias. Abrir pruebas.html en un navegador. */
(function () {
  'use strict';
  const resultados=[];

  // Registra si se cumple la condición de prueba y conserva los detalles de los fallos.
  function comprobar(nombre, condicion, detalle) {
    resultados.push({nombre,ok:Boolean(condicion),detalle:condicion?'':String(detalle||'Condición incumplida')});
  }
  comprobar('La base de conocimientos es una lista', Array.isArray(window.CuidaConocimiento));
  const motor=CuidaChat;
  comprobar('Al menos 40 intenciones',motor.base.length>=40);
  comprobar('Identificadores únicos',new Set(motor.base.map(i=>i.id)).size===motor.base.length);
  for (const i of motor.base) {
    comprobar('Contenido completo: '+i.id,i.ejemplos.length>=5 && i.respuestas.length>=2 && i.pasos && i.necesitas && i.relacionadas.every(id=>motor.base.some(x=>x.id===id)));
    for (const q of i.ejemplos) {
      const r=motor.crearConversacion().responder(q);
      comprobar(i.id+': '+q,r.intencion===i.id,'Recibido: '+r.intencion);
    }
  }

  // Consultas para comprobar variantes, erratas, negaciones y situaciones urgentes.
  const casos = [["mi abuelo no puede andar","movilidad"],["necesito ayuda para caminar","movilidad"],["tiene problemas de movildad","movilidad"],["movildad","movilidad"],["ALIMENTACIÓN","alimentacion"],["mi madre no quiere comer","apetito"],["mi padre no tiene hambre","apetito"],["No quiero hablar de movilidad, quiero ayuda para comer","alimentacion"],["No necesito ayuda con la higiene sino con el sueño","sueno"],["No está triste, se siente sola","soledad"],["No se ha caído, quiero prevenir caídas","caidas"],["No tiene dolor en el pecho, quiero ver los tutoriales","tutoriales"],["Mi abuelo no puede respirar","emergencia"],["Mi abuela está inconsciente","emergencia"],["de repente no puede caminar","emergencia"],["Mi padre se ha caído","caida_actual"],["estoy reventada cuidando a mi madre","cuidador"],["necesito un relevo","respiro"],["no doy abasto","cuidador"],["le cuesta andar","movilidad"],["ayuda con las pastillas","medicacion"],["Dónde puedo ver vídeos sobre higiene","tutoriales"],["Dónde están las preguntas frecuentes","recursos_web"],["Que puedo hacer para la hidratacion","hidratacion"],["se despierta durante la noche","sueno"],["cómo organizar los turnos con mis hermanos","reparto"],["No quiero hablar de movilidad y quiero ver los recursos","recursos_web"],["Ola buenas","saludo"],["Mi abuelita necesita que la ayude a andar","movilidad"],["Me cuesta moverme por casa","movilidad"],["El abuelo tiene poca moviliad","movilidad"],["Como ayudo a mi padre a lebantarse","transferencias"],["Cómo levantarlo sin hacerme daño","transferencias"],["Tengo que pasar a mi madre de la cama al sillón","transferencias"],["El abuelo necesita un baston para andar","andador"],["Tiene una silla de ruedas y me preocupan los frenos","silla_ruedas"],["Como evito que tropiece con los cables","iluminacion"],["La ducha es peligrosa para mi abuela","ducha"],["Cómo puedo asearla sin que se sienta incómoda","higiene"],["Necesita que le ayude a lavarse los dientes","bucal"],["Su dentadura le molesta","bucal"],["No puede ponerse la camiseta","vestido"],["Tengo que cambiarle el pañal","incontinencia"],["Tiene una llaga en la espalda","piel"],["Está todo el día tumbado","piel"],["Mi madre come cada vez menos","apetito"],["Cómo hago para que tome más agua","hidratacion"],["Le cuesta mucho tragarse la comida","deglucion"],["Mi madre tose cuando bebe","deglucion"],["No tiene apetito desde ayer","apetito"],["Qué comidas preparo para mi padre","alimentacion"],["Mi padre se siente aislado","soledad"],["Mi madre se aburre mucho","actividades"],["Quiero ideas para entretener a mi abuelo","actividades"],["Tiene miedo y está nervioso","ansiedad"],["Mi madre lleva días llorando","emociones"],["Mi padre olvida donde deja las cosas","memoria"],["Como puedo hablarle si no oye","comunicacion"],["No consigo dormir por las noches","sueno"],["Mi abuela no duerme bien","sueno"],["Se despierta a cada rato","sueno"],["Estoy muy cansada de cuidar a mi padre","cuidador"],["Quisiera que mis hermanas colaboraran","reparto"],["Siento que soy egoísta por descansar","culpa"],["Necesitamos alguien que nos releve","respiro"],["Cómo consigo asistencia a domicilio","domicilio"],["Qué ayudas ofrece el ayuntamiento","servicios"],["Cómo solicito el grado de dependencia","valoracion"],["Cómo funciona el botón que llevan al cuello","teleasistencia"],["Mi padre necesita un centro de dia","centro_dia"],["Busco residencia para mi abuela","residencia"],["Mi madre necesita cambiar de medicación","medicacion"],["Qué dosis debo darle","medicacion"],["Puedo ver los videos en esta pagina","tutoriales"],["Quiero escribir a las creadoras de la web","contacto"],["Cómo pongo el tema oscuro","tema_web"],["Los mensajes se guardan","privacidad"],["No necesito ayuda para caminar, sino para beber","hidratacion"],["No está triste, solo aburrida","actividades"],["No quiero videos sino recursos escritos","recursos_web"],["No busco una residencia, necesito un centro de día","centro_dia"],["No tiene problemas de movilidad, pero come muy poco","apetito"],["camniar","movilidad"],["necesito un andador para moverme","andador"]];
  for (const [q,id] of casos) {
    const r=motor.crearConversacion().responder(q);
    comprobar('Variante: '+q,r.intencion===id,'Esperado '+id+', recibido '+r.intencion);
  }

  // Comprueba seguimientos, cambios de tema, aclaraciones y reinicio del contexto.
  let c=motor.crearConversacion();
  comprobar('Seguimiento sin contexto pregunta antes',c.responder('¿Qué necesito?').tipo==='aclaracion');
  c.responder('Mi abuelo no puede andar');
  const pasos=c.responder('¿Cómo puedo hacerlo?');
  comprobar('Recuerda movilidad en los pasos',pasos.intencion==='movilidad' && pasos.texto.includes('1.'));
  comprobar('Recuerda movilidad en materiales',c.responder('¿Qué necesito?').intencion==='movilidad');
  c.responder('Gracias');
  comprobar('Un agradecimiento conserva el tema',c.responder('¿Puedes explicarme más?').intencion==='movilidad');
  comprobar('Cambio explícito de tema',c.responder('Necesito ayuda con la higiene').intencion==='higiene');
  comprobar('Contexto tras cambio de tema',c.responder('¿Qué necesito?').intencion==='higiene');
  c.reiniciar();
  comprobar('Reinicio elimina memoria',c.estado().tema===null && c.estado().pendientes.length===0);
  const ambigua=c.responder('Necesito ayuda con la ducha y la comida');
  comprobar('Consulta ambigua pide aclaración',ambigua.tipo==='aclaracion' && ambigua.opciones.length===2);
  comprobar('No amplía una ambigüedad sin resolver',c.responder('Explícame más').tipo==='aclaracion');
  const elegida=ambigua.opciones[0];
  comprobar('Botón resuelve ambigüedad',c.responder(elegida.texto,elegida.id).intencion===elegida.id);
  c.reiniciar();
  c.responder('Necesito ayuda con la ducha y la comida');
  comprobar('Selección ordinal',c.responder('la segunda').intencion==='alimentacion');
  c.reiniciar();
  const a=c.responder('Hola').texto,b=c.responder('Hola').texto;
  comprobar('Alterna respuestas sin repetir inmediatamente',a!==b);
  const desconocida=c.responder('Cuál es la capital de Marte');
  comprobar('No inventa ante pregunta desconocida',desconocida.tipo==='aclaracion' && desconocida.opciones.length>0);
  comprobar('No responde al tema negado',motor.crearConversacion().responder('No tengo problemas de sueño').intencion!=='sueno');
  comprobar('Emergencia prima sobre contexto',c.responder('No puede respirar').intencion==='emergencia');
  comprobar('Sugerencias relacionadas y dinámicas',JSON.stringify(c.responder('Ayuda para caminar').opciones)!==JSON.stringify(c.responder('Cómo ayudar con el aseo').opciones));
  comprobar('Tratamiento deriva sin pautar dosis',c.responder('Qué pastilla le puedo dar').texto.includes('No puedo recomendar'));
  comprobar('Enlace real de tutoriales',c.responder('Ver tutoriales').enlace.url==='tutoriales.html');

  // Publica los resultados del motor y muestra el recuento de fallos.
  window.resultadosMotor=resultados;
  const destino=document.getElementById('resultados');
  for (const r of resultados) {
    const li=document.createElement('li');
    li.textContent=(r.ok?'OK · ':'FALLO · ')+r.nombre+(r.detalle?' — '+r.detalle:'');
    if (!r.ok) li.className='fallo';
    destino.append(li);
  }
  const fallos=resultados.filter(r=>!r.ok);
  document.getElementById('resumen').textContent=resultados.length+' pruebas del motor; '+fallos.length+' fallos.';
  if(fallos.length) console.error('Pruebas del motor fallidas',fallos);
})();
