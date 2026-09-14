/* ══════════════════════════════════════════════════════════════════
   FAMILY FITNESS · Puerto Varas — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: las seis fases de las doce
   semanas son una lista ordenada normal con el porcentaje escrito al
   lado, los tres planes son texto y el enlace al Instagram sigue
   abriendo. El JS sólo agrega las apariciones al scroll y arma el
   mensaje de la evaluación.

   Las barras de avance son CSS puro —un ancho porcentual sobre una
   pista—: no las anima JavaScript, así que con el script apagado
   siguen mostrando exactamente el mismo porcentaje.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · Cabecera ── */
  var cab = document.getElementById('cab');
  if (cab) {
    var flota = false;
    var mirar = function () {
      var abajo = window.pageYOffset > 40;
      if (abajo !== flota) { flota = abajo; cab.classList.toggle('cab--flota', abajo); }
    };
    window.addEventListener('scroll', mirar, { passive: true });
    mirar();
  }

  /* ── 2 · Video de fondo ──
     La foto es la base; el clip va encima. Sólo se carga si el
     visitante no pidió menos movimiento ni ahorra datos, se pide
     recién cuando la sección se acerca (240 px antes) y se pausa
     fuera de vista para no gastar batería. Si el navegador bloquea el
     autoplay, la promesa rechaza, el catch vacío se la traga y se
     queda la foto: no se nota nada y la consola queda limpia. */
  var vids = document.querySelectorAll('video[data-src]');
  if (vids.length) {
    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorra = con && (con.saveData === true || /2g/.test(con.effectiveType || ''));
    if (!reduce && !ahorra) {
      var activar = function (v) {
        if (v.getAttribute('src')) { return; }   /* el observer redispara: sin esto el clip reinicia */
        v.muted = true; v.loop = true; v.setAttribute('muted', '');  /* Safari iOS mira el ATRIBUTO */
        v.addEventListener('canplay', function () {
          var p = v.play();
          /* La clase de fundido sólo dentro del .then(): puesta antes
             se vería un rectángulo negro fundiéndose sobre la foto. */
          if (p && p.then) { p.then(function () { v.classList.add('video--ver'); }).catch(function () {}); }
          else { v.classList.add('video--ver'); }
        }, { once: true });
        v.src = v.getAttribute('data-src');
        v.load();
      };
      if ('IntersectionObserver' in window) {
        var ov = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            var v = e.target;
            if (e.isIntersecting) {
              v.enVista = true; activar(v);
              if (v.paused && v.classList.contains('video--ver')) { v.play().catch(function () {}); }
            } else {
              v.enVista = false; if (!v.paused) { v.pause(); }
            }
          });
        }, { rootMargin: '240px 0px', threshold: 0.01 });
        Array.prototype.forEach.call(vids, function (v) { ov.observe(v); });
      } else { Array.prototype.forEach.call(vids, activar); }
      /* Al volver a la pestaña el navegador deja el clip en pausa: se
         reanuda sólo el que estaba a la vista. Se compara con !== false
         a propósito: si el observer todavía no corrió, enVista es
         undefined y el clip igual arranca. */
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'visible') { return; }
        Array.prototype.forEach.call(vids, function (v) {
          if (v.enVista !== false && v.paused && v.classList.contains('video--ver')) { v.play().catch(function () {}); }
        });
      });
    }
  }

  /* ── 3 · La cifra que cuenta ──
     Una sola de las cuatro sube, y es la que costó verificar: los
     seguidores. Las otras tres son aritmética de la propia página o
     la herida, y un contador que suba un «0» se lee como truco.
     El valor final está escrito dentro del <b>, así que sin JS o con
     menos movimiento se lee igual. Al terminar se restaura ese texto
     original: sin eso el «5.052» quedaría convertido en «5052». */
  var contado = false;
  var contar = function (caja) {
    if (contado || reduce || !window.requestAnimationFrame) { return; }
    var el = caja.querySelector('[data-cuenta]');
    if (!el) { return; }
    contado = true;
    var fin = parseInt(el.getAttribute('data-cuenta'), 10);
    var texto = el.textContent;
    var dur = 1000, t0 = 0;
    var paso = function (t) {
      if (!t0) { t0 = t; }
      var k = Math.min((t - t0) / dur, 1);
      el.textContent = String(Math.round(fin * (1 - Math.pow(1 - k, 3))));
      if (k < 1) { window.requestAnimationFrame(paso); }
      else { el.textContent = texto; }
    };
    window.requestAnimationFrame(paso);
    /* Seguro por si la pestaña se oculta y el rAF se congela. */
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  };

  /* ── 4 · Apariciones ──
     El observer va sobre el CONTENEDOR, nunca sobre el elemento
     recortado: una pieza con clip-path a área cero no dispara jamás.
     Y NO se corta por prefers-reduced-motion — cortarlo destaparía
     todo de golpe y mataría el fundido, que es lo único que la regla
     de la casa pide conservar. Lo que se apaga ahí es el transform,
     y eso vive en el CSS. */
  var piezas = [];
  ['.cifras__lista', '.semanas .ancho', '.fases', '.tajo__txt', '.como .ancho',
   '.planes', '.mit__foto', '.mit__txt', '.horarios .ancho', '.cita__txt',
   '.mos .ancho', '.mos__grilla', '.empezar__cols > *', '.dueno__cols', '.dueno__cierre']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });
  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras__lista')) { contar(el); }
  };

  if (!('IntersectionObserver' in window)) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (es, o) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        var el = e.target;            /* fuera del setTimeout: la entrada se recicla */
        o.unobserve(el);
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    piezas.forEach(function (el) {
      /* Lo que ya está en pantalla al cargar se destapa de inmediato:
         en una página corta el evento de scroll puede no llegar nunca. */
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); } else { obs.observe(el); }
    });
  }
  /* Barrido incondicional y fuera de la rama del observer: cubre
     también el caso de que el observer exista pero falle. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 5 · Botón flotante ──
     El botón ya está visible por CSS. Acá sólo se lo aparta mientras
     el visitante mira la portada, para no tapar el titular. Se observa
     la PORTADA, no el botón: el botón es fixed y un elemento fixed no
     entra ni sale de la ventana, así que observarlo no dispararía
     nunca. El estado inicial se calcula a mano por si el observador
     tardara: así el botón no arranca pegado en el estado equivocado. */
  var wapp = document.querySelector('.wapp');
  var port = document.querySelector('.portada');
  if (wapp && port) {
    var mirarPort = function () {
      var r = port.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      wapp.classList.toggle('wapp--arriba', visible > r.height * 0.55);
    };
    mirarPort();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { wapp.classList.toggle('wapp--arriba', e.intersectionRatio > 0.55); });
      }, { threshold: [0, 0.55, 1] }).observe(port);
    } else {
      window.addEventListener('scroll', mirarPort, { passive: true });
    }
    /* AVISO PARA QUIEN MIDA ESTO CON EDGE SIN CABEZA (09-09-2026): con
       --virtual-time-budget, poner scrollTop a mano NO despacha ningún
       evento scroll ni vuelve a disparar el observador, así que el botón
       se lee con .wapp--arriba puesta —opacidad 0, pointer-events none—
       aunque la página esté en el pie. No es un fallo de acá: la cabecera,
       que usa el patrón de scroll de toda la casa, tampoco recibe su
       .cab--flota en esa misma medición. Para comprobarlo de verdad hay
       que despachar un scroll a mano en la sonda: ahí el botón vuelve a
       opacidad 1, 149x56 y pointer-events auto, medido. */
  }

  /* ── 6 · Pedir la evaluación ──
     El centro agenda por Instagram y ahí no se puede precargar texto,
     así que se copia al portapapeles. Cuando publiquen un WhatsApp,
     esta función cambia de una línea. */
  var form = document.getElementById('form-emp');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');

  if (form && salida && btn) {
    var nombre = document.getElementById('f-nombre');
    var nivel  = document.getElementById('f-nivel');
    var plan   = document.getElementById('f-plan');
    var hora   = document.getElementById('f-hora');

    var armar = function () {
      var n = nombre && nombre.value ? nombre.value.trim() : '';
      if (!n) { salida.textContent = ''; return ''; }
      var t = 'Hola, quiero pedir una evaluación.';
      t += '\nNombre: ' + n;
      if (nivel && nivel.value) { t += '\nParte desde: ' + nivel.value; }
      if (plan && plan.value)   { t += '\nModalidad: ' + plan.value; }
      if (hora && hora.value.trim()) { t += '\nHorario: ' + hora.value.trim(); }
      salida.textContent = t;
      return t;
    };

    [nombre, nivel, plan, hora].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos su nombre.'; nombre.focus(); return; }
      var avisar = function (ok) {
        btn.textContent = ok ? 'Copiado — péguelo en el chat' : 'No se pudo copiar — selecciónelo arriba';
        setTimeout(function () { btn.textContent = 'Copiar el mensaje'; }, 3000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { avisar(true); }, function () { avisar(false); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = t; ta.setAttribute('readonly', '');
        ta.style.position = 'absolute'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        avisar(ok);
      }
    });
  }

  /* ── Boton flotante de contacto ───────────────────────────────────
     El boton ya se ve por CSS. Aca solo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA, no el boton: un elemento fixed nunca entra ni sale de la
     ventana, asi que observarlo no dispararia jamas. ── */
  var flota = document.querySelector('.flota');
  var portadaF = document.querySelector('.portada');
  if (flota && portadaF) {
    var mirarFlota = function () {
      var r = portadaF.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      flota.classList.toggle('flota--arriba', visible > r.height * 0.55);
    };
    mirarFlota();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { flota.classList.toggle('flota--arriba', e.intersectionRatio > 0.55); });
      }, { threshold: [0, 0.55, 1] }).observe(portadaF);
    } else {
      window.addEventListener('scroll', mirarFlota, { passive: true });
    }
  }

})();