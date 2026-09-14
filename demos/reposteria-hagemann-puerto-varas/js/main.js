/* ══════════════════════════════════════════════════════════════════
   REPOSTERÍA HAGEMANN · Puerto Varas — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: la vitrina con sus horas de
   horno es una lista normal, el calendario de temporada dice sus meses
   por escrito, las cuatro señales del kuchen bien hecho son texto y el
   enlace al Instagram sigue abriendo. El JS sólo agrega las
   apariciones al scroll, los dos clips de fondo, el conteo de la
   primera cifra y el armado del mensaje del encargo.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · Video de fondo ──────────────────────────────────────────
     La foto es la base; el video va encima. Sólo se carga si el
     visitante no pidió menos movimiento ni ahorra datos, se pide
     recién cuando la sección se acerca (240 px antes) y se pausa
     fuera de vista para no gastar batería. Si el navegador bloquea
     el autoplay, se queda la foto y no se nota nada. ── */
  var vids = document.querySelectorAll('video[data-src]');
  if (vids.length) {
    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorra = con && (con.saveData === true || /2g/.test(con.effectiveType || ''));
    if (!reduce && !ahorra) {
      var activar = function (v) {
        if (v.getAttribute('src')) { return; }
        v.muted = true; v.loop = true; v.setAttribute('muted', '');
        v.addEventListener('canplay', function () {
          var p = v.play();
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
            if (e.isIntersecting) { v.enVista = true; activar(v); if (v.paused && v.classList.contains('video--ver')) { v.play().catch(function () {}); } }
            else { v.enVista = false; if (!v.paused) { v.pause(); } }
          });
        }, { rootMargin: '240px 0px', threshold: 0.01 });
        Array.prototype.forEach.call(vids, function (v) { ov.observe(v); });
      } else { Array.prototype.forEach.call(vids, activar); }
      /* Al volver a la pestaña el navegador deja el clip en pausa:
         se reanuda sólo el que estaba a la vista. */
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'visible') { return; }
        Array.prototype.forEach.call(vids, function (v) {
          if (v.enVista !== false && v.paused && v.classList.contains('video--ver')) { v.play().catch(function () {}); }
        });
      });
    }
  }

  /* ── 2 · Cabecera ── */
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

  /* ── 3 · La cifra que cuenta ─────────────────────────────────────
     Una sola de las cuatro, y es la que costó verificar. El «+20»
     lleva signo, así que al terminar se restaura el texto original:
     sin eso quedaría convertido en un «20» pelado. El segundo
     temporizador cubre la pestaña oculta, donde el rAF se congela. */
  var contado = false;
  var contar = function (caja) {
    if (contado || reduce || !window.requestAnimationFrame) { return; }
    var el = caja.querySelector('[data-cuenta]');
    if (!el) { return; }
    contado = true;
    var fin = parseInt(el.getAttribute('data-cuenta'), 10);
    var texto = el.textContent;
    var dur = 900, t0 = 0;
    var paso = function (t) {
      if (!t0) { t0 = t; }
      var k = Math.min((t - t0) / dur, 1);
      el.textContent = String(Math.round(fin * (1 - Math.pow(1 - k, 3))));
      if (k < 1) { requestAnimationFrame(paso); }
      else { el.textContent = texto; }
    };
    requestAnimationFrame(paso);
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  };

  /* ── 4 · Apariciones (el observer va sobre el CONTENEDOR) ── */
  var piezas = [];
  ['.cifras__lista', '.vitrina .ancho', '.kuchen', '.tajo__txt',
   '.temporada .ancho', '.familia .ancho', '.masa .ancho > :not(.senales)',
   '.senales', '.mit__txt', '.cita__txt',
   '.mos .ancho', '.mos__grilla', '.encargos__cols > *',
   '.dueno__cols', '.dueno__cierre']
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
        var el = e.target;
        o.unobserve(el);
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); } else { obs.observe(el); }
    });
  }
  /* Barrido a los 6 s, incondicional: si algo no se mostró, se muestra
     igual. classList.add es idempotente y contar() tiene su guarda. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 5 · Botón flotante de contacto ──────────────────────────────
     El botón ya está visible por CSS. Acá sólo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA, no el botón: el botón es fixed y un elemento fixed no
     entra ni sale de la ventana, así que observarlo no dispararía
     nunca. El estado inicial se calcula a mano por si el observador no
     llegara a dispararse. ── */
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
  }

  /* ── 6 · Armar el encargo ──
     La repostería agenda por Instagram y ahí no se puede precargar
     texto, así que se copia al portapapeles. Cuando publiquen un
     WhatsApp, esta función cambia de una línea. */
  var form = document.getElementById('form-enc');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');

  if (form && salida && btn) {
    var nombre   = document.getElementById('f-nombre');
    var que      = document.getElementById('f-que');
    var personas = document.getElementById('f-personas');
    var dia      = document.getElementById('f-dia');

    var armar = function () {
      var n = nombre && nombre.value ? nombre.value.trim() : '';
      var d = dia && dia.value ? dia.value.trim() : '';
      if (!n && !d) { salida.textContent = ''; return ''; }
      var t = 'Hola, quiero hacer un encargo.';
      if (n) { t += '\nNombre: ' + n; }
      if (que && que.value) { t += '\nQué: ' + que.value; }
      if (personas && personas.value) { t += '\nPara: ' + personas.value + ' personas'; }
      if (d) { t += '\nPara el día: ' + d; }
      salida.textContent = t;
      return t;
    };

    [nombre, que, personas, dia].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos su nombre y para qué día.'; nombre.focus(); return; }
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

})();
