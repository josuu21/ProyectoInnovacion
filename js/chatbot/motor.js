// Chat: reconocimiento de consultas y contexto de la conversación.

/* Motor local: puntuación de evidencias, tolerancia tipográfica y contexto.
 * No ejecuta mensajes como código ni realiza peticiones de red.
 */
(function (raiz) {
  'use strict';
  const base = raiz.CuidaConocimiento;
  const porId = new Map(base.map(intencion => [intencion.id, intencion]));

  // Unifica mayúsculas, acentos y separadores para comparar consultas.
  function normalizar(texto) {
    return String(texto).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Palabras frecuentes que se excluyen para buscar los términos relevantes.
  const vacias = new Set(('a al algo alguna algunos ante aqui asi ayudar ayuda buen buenos buenas como con cual cuando de del desde donde el ella ellos en es esta estas este esto hacer hacia hay la las le les lo los mas me mi mis muy necesito necesita nos o para persona personas puedo puede pueden que quien quiero se ser si sin sobre son su sus te tengo tiene tienen tu tus un una unos unas y ya yo por porque no ni').split(' '));
  ['abuelo','abuela','abuelos','abuelita','abuelito','padre','madre','papa','mama','bien','mucho','favor'].forEach(t=>vacias.add(t));

  // Agrupa sinónimos y variantes bajo un mismo concepto.
  const grupos = [
    ['caminar','andar','camina','caminando','camino','anda','andando','desplazarse','desplazar','desplazamiento','desplazamientos'],
    ['movilidad','moverse','movimiento','mover','moverme','moverlo','moverla'], ['comer','come','comiendo','comen'], ['comida','comidas','alimentacion','alimentar','nutricion'],
    ['beber','bebe','bebiendo','liquido','liquidos','hidratar','hidratacion'], ['dormir','duerme','durmiendo','sueno','insomnio','desvelado','desvelada'],
    ['caida','caidas','caerse','caer','tropiezo','tropiezos','tropieza','resbalon','resbalones'],
    ['higiene','aseo','asear','lavarse','lavar','asearla','asearlo','asearse','lavarla','lavarlo'], ['ducha','duchar','ducharse','banar','banarse'],
    ['cuidador','cuidadora','cuidadores','cuidadoras'], ['agotado','agotada','cansado','cansada','agotamiento','cansancio','reventado','reventada'],
    ['triste','tristeza','desanimado','desanimada','llorar','llora','llorando'], ['solo','sola','soledad','aislamiento','aislado','aislada'],
    ['rutina','rutinas','organizar','organizo','organizacion','planificar','planificacion'],
    ['vestir','vestirse','vestido','vestirse','vestimenta'], ['medicacion','medicamento','medicamentos','pastilla','pastillas','farmaco','farmacos'],
    ['servicio','servicios'], ['recurso','recursos'], ['video','videos','tutorial','tutoriales','videoteca'],
    ['nervioso','nerviosa','nervios','ansiedad','angustia'], ['olvido','olvidos','olvida','memoria'],
    ['repartir','reparto','delegar','colaborar','colaboracion','colaboraran','colaboren','colabore'], ['descansar','descanso','respiro','relevo','releve','relevar','relevos'],
    ['apetito','hambre'], ['diente','dientes','dentadura','bucal'], ['familia','familiares','hermanos','hermano','hermana','hermanas'],
    ['mayor','mayores','anciano','anciana','ancianos'], ['abuelo','abuela','abuelos'], ['padre','papa'], ['madre','mama'],
    ['piel','cutis'], ['llaga','llagas','ulcera','ulceras'], ['accesibilidad','accesible','adaptacion'], ['incontinencia','escapes'],
    ['profesional','profesionales'], ['medico','medica','doctor','doctora'], ['baston','bastones'], ['andador','andadores'],
    ['levantar','levantarse','levantarlo','levantarla'], ['tragar','tragarse','deglucion','disfagia'],
    ['aburrimiento','aburrido','aburrida','aburre','aburrirse'], ['entretenimiento','entretener','entretenerse']
  ];
  const alias = new Map();
  grupos.forEach(grupo => grupo.forEach(palabra => alias.set(palabra, grupo[0])));
  const canon = palabra => alias.get(palabra) || palabra;
  const tokens = texto => [...new Set(normalizar(texto).split(' ').filter(t => t && !vacias.has(t)).map(canon))];

  // Calcula la distancia entre palabras, incluidas letras intercambiadas, para detectar erratas.
  function distancia(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 3;
    let anteanterior = null;
    let anterior = Array.from({length: b.length + 1}, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const fila = [i];
      for (let j = 1; j <= b.length; j++) {
        fila[j] = Math.min(fila[j-1]+1, anterior[j]+1, anterior[j-1]+(a[i-1]===b[j-1]?0:1));
        if (i>1 && j>1 && a[i-1]===b[j-2] && a[i-2]===b[j-1]) fila[j]=Math.min(fila[j],anteanterior[j-2]+1);
      }
      anteanterior=anterior;
      anterior = fila;
    }
    return anterior[b.length];
  }

  // Prepara los términos de cada intención para calcular sus coincidencias.
  const documentos = base.map(i => ({...i, terminos: new Set(tokens(i.claves.concat(i.ejemplos).join(' ')))}));
  const frecuencia = new Map();
  documentos.forEach(i => i.terminos.forEach(t => frecuencia.set(t, (frecuencia.get(t)||0)+1)));
  const peso = t => 1 + Math.log(1 + base.length / (frecuencia.get(t) || 1));
  const vocabulario = [...new Set([...frecuencia.keys(), ...alias.keys()])];

  // Busca una palabra cercana en el vocabulario cuando el término no se reconoce.
  function corregir(t) {
    if (frecuencia.has(t) || t.length < 5) return {token:t, factor:1};
    let candidato = null, minimo = 3;
    for (const v of vocabulario) {
      const d = distancia(t, v);
      const limite = Math.min(t.length,v.length) >= 9 ? 2 : 1;
      if (d <= limite && (d < minimo || (d===minimo && (frecuencia.get(canon(v))||0)>(frecuencia.get(candidato)||0)))) { minimo=d; candidato=canon(v); }
    }
    return {token:candidato || t, factor:candidato ? .78 : 1};
  }

  // Separa la consulta y distingue los temas negados de las limitaciones expresadas.
  function clausulas(texto) {
    // El alcance de la negación acaba con la cláusula, no con toda la pregunta.
    return String(texto).toLowerCase().replace(/\bsolo (?=(?:aburrid[oa]|triste|cansad[oa]|nervios[oa])\b)/gi, 'solamente ').split(/[,.!?;:\n]+|\b(?:pero|sino|aunque|en cambio)\b|\by (?=(?:quiero|necesito|busco|prefiero)\b)/i).map(normalizar).filter(Boolean).map(texto => {
      const limitacion = /\b(no (?:pued[eo]|consig[ou]e?|logra|duerme|come|bebe|quiere comer|tiene (?:hambre|apetito|sed))|no doy abasto|no se vale|no tiene con quien|no tengo con quien)\b/.test(texto);
      const negada = !limitacion && /\b(?:no|ni) (?:quiero|necesito|busco|hablo|pregunto|me refiero|tiene|tengo|esta|estoy|se siente|se ha caido|hay|es sobre)\b/.test(texto);
      return {texto, negada, tokens: tokens(texto).map(corregir)};
    });
  }

  // Puntúa las intenciones según palabras clave, ejemplos y coincidencias de la consulta.
  function clasificar(texto) {
    const partes = clausulas(texto);
    return documentos.map(i => {
      let mejor = 0;
      for (const parte of partes) {
        if (parte.negada) continue;
        const ts = parte.tokens;
        let puntuacion = 0;
        // Las evidencias distintivas pesan más que palabras comunes.
        const coinciden = ts.filter(t => i.terminos.has(t.token));
        const deClave = new Set(tokens(i.claves.join(' ')));
        coinciden.forEach(t => { puntuacion += peso(t.token) * t.factor * (deClave.has(t.token) ? 1 : .45); });
        let frase = 0;
        for (const clave of i.claves) {
          const normal = normalizar(clave);
          if ((' '+parte.texto+' ').includes(' '+normal+' ')) frase = Math.max(frase, tokens(clave).length >= 2 ? 9 : 3);
        }
        for (const ejemplo of i.ejemplos) {
          const normal = normalizar(ejemplo);
          if (parte.texto === normal) frase = Math.max(frase, 15);
          else if (normal.length > 9 && (' '+parte.texto+' ').includes(' '+normal+' ')) frase = Math.max(frase, 10);
          const esperados = tokens(ejemplo);
          if (esperados.length >= 2) {
            const comun = esperados.filter(t => ts.some(q => q.token===t)).length;
            if (comun===esperados.length) frase = Math.max(frase, 7);
          }
        }
        const clavesSimples = new Set(i.claves.filter(c => !normalizar(c).includes(' ')).flatMap(tokens));
        if (!frase && ts.some(t => clavesSimples.has(t.token))) frase = 3;
        if (i.id==='saludo' && frase>0) frase=Math.max(frase,8);
        puntuacion += frase;
        // Evita que un saludo o un "ayuda" genérico desplace una necesidad concreta.
        if (i.categoria==='inicio' && ts.length>2) puntuacion *= .65;
        mejor = Math.max(mejor, puntuacion);
      }
      return {id:i.id, score:mejor};
    }).filter(i => i.score>0).sort((a,b)=>b.score-a.score);
  }

  // Temas sugeridos cuando todavía no existe un contexto concreto.
  const iniciales = ['movilidad','higiene','alimentacion','cuidador','servicios','capacidades'];

  // Mantiene el tema, las aclaraciones pendientes y las variantes de cada conversación.
  function crearConversacion() {
    let ultimo = null, pendientes = [], turno = 0;
    const variantes = new Map();

    // Alterna las respuestas de una intención para evitar repeticiones consecutivas.
    function elegir(i) {
      const indice = variantes.get(i.id) || 0;
      variantes.set(i.id, indice+1);
      return i.respuestas[indice % i.respuestas.length];
    }

    // Convierte identificadores de intenciones en opciones para la interfaz.
    function opciones(ids) {
      return [...new Set(ids)].filter(id=>porId.has(id)).slice(0,6).map(id=>({id,texto:porId.get(id).titulo}));
    }

    // Compone la respuesta con su contenido, enlace y sugerencias de seguimiento.
    function resultado(i, modo, prefijo) {
      if (i.categoria!=='inicio') ultimo=i.id;
      pendientes=[];
      const contenido = modo==='pasos' ? i.pasos : modo==='necesitas' ? i.necesitas : modo==='mas' ? i.pasos+'\n\nPara prepararlo: '+i.necesitas : elegir(i);
      const seguir = i.categoria!=='inicio' ? [{id:'seguimiento_pasos',texto:'¿Cómo puedo hacerlo?'},{id:'seguimiento_necesitas',texto:'¿Qué necesito?'}] : [];
      return {tipo:'respuesta',intencion:i.id,tema:ultimo,texto:(prefijo||'')+contenido,enlace:i.enlace,
        opciones:seguir.concat(opciones(i.relacionadas)).slice(0,6)};
    }

    // Guarda las opciones pendientes y pide concretar la consulta.
    function aclarar(ids, texto) {
      pendientes=ids;
      return {tipo:'aclaracion',intencion:null,tema:ultimo,texto,opciones:opciones(ids)};
    }

    // Interpreta la consulta, prioriza urgencias y resuelve el tema o pide una aclaración.
    function responder(texto, eleccion) {
      turno++;
      const consulta=normalizar(texto);
      const ranking=clasificar(texto);
      // La seguridad se evalúa antes de cualquier botón o contexto previo.
      const peligro = ranking.find(r=>r.id==='emergencia');
      if (peligro && peligro.score>=10) return resultado(porId.get('emergencia'));
      const caida=ranking.find(r=>r.id==='caida_actual');
      if (caida && caida.score>=12) return resultado(porId.get('caida_actual'));
      if (eleccion && porId.has(eleccion)) return resultado(porId.get(eleccion));
      const seguimiento=/^(?:y )?(?:como (?:puedo |podria )?hacerlo|como lo hago|que necesito|que hace falta|puedes explicarme mas|explicame mas|cuentame mas|mas informacion|mas detalles|dime mas|continua|sigue|y luego|como|mas)$/.test(consulta)
        || /^seguimiento_/.test(eleccion||'');
      if (seguimiento) {
        if (pendientes.length) return aclarar(pendientes,'Antes de ampliar, ¿a cuál de estos temas te refieres?');
        if (!ultimo) return aclarar(iniciales,'Claro. ¿Sobre qué tema quieres los pasos o los materiales necesarios?');
        const modo=/necesito|falta|necesitas/.test(consulta+' '+eleccion) ? 'necesitas' : /hacerlo|hago|pasos/.test(consulta+' '+eleccion) ? 'pasos':'mas';
        return resultado(porId.get(ultimo),modo,'Sobre '+porId.get(ultimo).titulo.toLowerCase()+':\n\n');
      }
      if (pendientes.length) {
        const numeros={primera:0,primero:0,'1':0,segunda:1,segundo:1,'2':1,tercera:2,tercero:2,'3':2};
        const n=consulta.replace(/^(?:la|el) /,'');
        if (numeros[n]!==undefined && pendientes[numeros[n]]) return resultado(porId.get(pendientes[numeros[n]]));
      }
      const relevantes=ranking.filter(r=>porId.get(r.id).categoria!=='inicio');
      const social=ranking.find(r=>porId.get(r.id).categoria==='inicio');
      let primero=relevantes[0];
      const especificas = {movilidad:['andador','silla_ruedas','transferencias'],higiene:['ducha','bucal','incontinencia','vestido','piel'],alimentacion:['apetito','deglucion','hidratacion'],servicios:['centro_dia','teleasistencia','residencia','domicilio','valoracion']};
      // Si la duda menciona un apoyo concreto, priorízalo frente al tema general.
      if (primero && especificas[primero.id]) {
        const concreta=relevantes.find(r=>(especificas[primero.id]||[]).includes(r.id) && r.score>=6 && r.score>=primero.score*.85);
        if (concreta) primero=concreta;
      }
      if (!primero || (social && primero.score<5.5)) primero=social;
      if (!primero || primero.score<5.5) {
        const cercanos=ranking.filter(r=>r.score>=2.8).slice(0,3).map(r=>r.id);
        return aclarar(cercanos.length ? cercanos.concat(['capacidades']):iniciales,
          cercanos.length ? 'No tengo suficiente certeza para responder. ¿Te refieres a alguno de estos temas? También puedes contarme qué tarea te resulta difícil.'
          : (turno%2 ? 'No dispongo de información suficiente sobre esa consulta. Puedo orientarte sobre cuidados cotidianos y la web. ¿Quieres elegir un tema o reformularlo?'
          : 'No he identificado una necesidad de cuidado concreta. Prueba a contarme qué ocurre y con qué necesitas ayuda, o elige una de estas opciones.'));
      }
      const segundo=relevantes.find(r=>r.id!==primero.id && !(especificas[r.id]||[]).includes(primero.id) && r.score>=6);
      // Una pregunta explícita de navegación domina frente al tema de sus vídeos.
      if (segundo && !['inicio','web'].includes(porId.get(primero.id).categoria) &&
          segundo.score/primero.score>.84 && primero.score-segundo.score<3.5) {
        return aclarar([primero.id,segundo.id], 'Veo dos temas posibles: '+porId.get(primero.id).titulo.toLowerCase()+' y '+porId.get(segundo.id).titulo.toLowerCase()+'. ¿Cuál quieres tratar primero?');
      }
      const i=porId.get(primero.id);
      let prefijo='';
      if (i.id==='movilidad' && /\bno (?:puede|puedo) (?:andar|caminar|moverse)\b/.test(consulta)) prefijo='Si ahora no puede caminar, no fuerces el desplazamiento. Si ha ocurrido de repente, solicita atención sanitaria urgente.\n\n';
      return resultado(i,null,prefijo);
    }

    // Borra el tema, los turnos y las opciones pendientes de la conversación.
    function reiniciar() { ultimo=null; pendientes=[]; turno=0; variantes.clear(); }
    return {responder,reiniciar,estado:()=>({tema:ultimo,pendientes:pendientes.slice()})};
  }
  raiz.CuidaChat = {crearConversacion,clasificar,normalizar,base};
})(typeof window !== 'undefined' ? window : globalThis);
