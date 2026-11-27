// Componentes compartidos: escape de textos, iconos, formularios y botones.

/* Componentes de texto y SVG propios. Todo dato variable se escapa al renderizar. */
(function(){
  'use strict';

  // Escapa caracteres especiales antes de insertar datos variables en las plantillas HTML.
  const escapar=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // Trazados SVG de los iconos del espacio personal.
  const paths={heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M18 8a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.9M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',home:'m3 10 9-7 9 7v11h-7v-7h-4v7H3Z',calendar:'M4 5h16v16H4ZM8 3v4M16 3v4M4 11h16',check:'m5 12 4 4L19 6',chart:'M4 3v18h17M8 17v-5M13 17V7M18 17v-8',book:'M12 5v16M12 5C9 2 4 3 2 4v16c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-2-10 1',settings:'M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',move:'m4 6 8-3 8 3-8 3ZM4 12l8 3 8-3M4 18l8 3 8-3',drop:'M12 3C9 8 5 11 5 15a7 7 0 0 0 14 0c0-4-4-7-7-12Z',shirt:'m8 3-5 3-2 5 5 2v8h12v-8l5-2-2-5-5-3c0 5-8 5-8 0Z',cup:'M4 5h12v11a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM16 7h3a3 3 0 0 1 0 6h-3',sun:'M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',moon:'M20 14A8 8 0 0 1 10 4 8 8 0 1 0 20 14Z',chat:'M21 11a9 9 0 0 1-9 9H3l1-5a9 9 0 1 1 17-4Z'};

  // Genera el SVG decorativo del icono solicitado.
  const icon=(id)=>`<svg class="cp-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[id]||paths.heart}"/></svg>`;
  let contador=0;

  // Genera un campo con etiqueta, valor escapado, restricciones y mensajes accesibles.
  function campo(nombre,titulo,valor='',tipo='text',op={}){
    const id='cp-campo-'+(++contador),attrs=`id="${id}" name="${nombre}" aria-describedby="${id}-error${tipo==='password'?' '+id+'-ayuda':''}" ${op.required?'required':''}`;
    let control;
    if(tipo==='select')control=`<select ${attrs}>${(op.options||[]).map(v=>`<option value="${escapar(v)}" ${String(valor)===String(v)?'selected':''}>${escapar(v||'Prefiero no indicarlo')}</option>`).join('')}</select>`;
    else if(tipo==='textarea')control=`<textarea ${attrs} rows="3" maxlength="400">${escapar(valor)}</textarea>`;
    else control=`<input ${attrs} type="${tipo}" value="${escapar(valor)}" ${op.autocomplete?'autocomplete="'+op.autocomplete+'"':''} ${tipo==='number'?'min="0" max="'+(op.max||120)+'" step="1"':''} ${tipo==='date'?'min="1900-01-01" max="2099-12-31"':''} ${tipo==='password'?'maxlength="128" minlength="'+(op.newPassword?10:8)+'"':tipo==='email'?'maxlength="254"':tipo==='text'?'maxlength="'+(op.max||60)+'"':''}>`;
    return `<div class="cp-campo"><label for="${id}">${titulo}${op.required?' <span class="cp-obligatorio">(obligatorio)</span>':' <span class="cp-opcional">(opcional)</span>'}</label>${tipo==='password'?`<div class="cp-clave">${control}<button type="button" data-action="clave" data-id="${id}" aria-label="Mostrar contraseña" aria-pressed="false">Mostrar</button></div><small id="${id}-ayuda">${op.newPassword?'Entre 10 y 128 caracteres. Usa una contraseña de prueba.':'Tu contraseña de prueba actual.'}</small>${op.strength?`<meter class="cp-fuerza" min="0" max="4" value="0" aria-label="Fortaleza de contraseña"></meter><small data-fuerza-texto>Escribe una contraseña</small>`:''}`:control}<small class="cp-error-campo" id="${id}-error" aria-live="polite"></small></div>`;
  }
  const boton=(texto,accion,valor='',clase='')=>`<button type="button" class="cp-boton ${clase}" data-action="${accion}" data-id="${escapar(valor)}">${texto}</button>`;

  // Presentación común para secciones que todavía no contienen datos.
  const vacio=(titulo,texto)=>`<div class="cp-vacio">${icon('heart')}<h3>${escapar(titulo)}</h3><p>${escapar(texto)}</p></div>`;
  window.CuidaUI={e:escapar,icon,campo,boton,vacio};
})();