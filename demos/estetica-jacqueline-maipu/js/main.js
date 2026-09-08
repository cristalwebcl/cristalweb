/* ══════════════════════════════════════════════════════════════════
   ESTÉTICA & PELUQUERÍA MAIPÚ JACQUELINE — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: el planificador de la visita
   es un formulario con casillas y minutos escritos, las sedes son
   texto, y los enlaces a la agenda y a WhatsApp funcionan solos. El JS
   agrega tres cosas: las apariciones al scroll, la cifra que cuenta y
   la suma de minutos con el mensaje ya armado.

   No carga nada, no mide nada, no manda nada a ninguna parte.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Video de fondo ──────────────────────────────────────────────
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

  /* ── 2 · Apariciones (observer sobre el CONTENEDOR, unobserve tras la
        primera vez, barrido a 6 s) ── */
  var piezas = [];
  ['.cifras__lista', '.visita .ancho', '.planner__grupo', '.planner__total',
   '.tajo__txt', '.servicios .ancho', '.fam', '.equipo .ancho', '.fichas',
   '.mitades__txt', '.sedes .ancho', '.sede', '.cita__txt', '.mos .ancho',
   '.mos__grilla', '.redes__cols > *', '.reservar__cols > *',
   '.dueno .ancho']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });
  piezas.forEach(function (el) { el.classList.add('rev'); });

  /* ── La cifra que cuenta (regla 7 de movimiento-web). El 520 está
        escrito en el HTML: sin JS o con reduced-motion se lee igual. ── */
  var contado = false;
  var contar = function (caja) {
    if (contado || reduce || !window.requestAnimationFrame) { return; }
    var el = caja.querySelector('[data-cuenta]');
    if (!el) { return; }
    contado = true;
    var fin = parseInt(el.getAttribute('data-cuenta'), 10);
    var texto = el.textContent;
    var dur = 1100, t0 = 0;
    var paso = function (t) {
      if (!t0) { t0 = t; }
      var p = Math.min((t - t0) / dur, 1);
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = String(Math.round(fin * e));
      el.style.transform = 'scale(' + (1 + 0.05 * Math.sin(Math.PI * p)).toFixed(4) + ')';
      if (p < 1) { requestAnimationFrame(paso); }
      else { el.textContent = texto; el.style.transform = ''; }
    };
    setTimeout(function () { requestAnimationFrame(paso); }, 150);
    setTimeout(function () { el.textContent = texto; el.style.transform = ''; }, dur + 600);
  };

  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras__lista')) { contar(el); }
  };

  if (!('IntersectionObserver' in window) || reduce) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { destapar(e.target); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); } else { obs.observe(el); }
    });
    setTimeout(function () { piezas.forEach(destapar); }, 6000);
  }

  /* ── 3 · Arma tu visita: suma los minutos, propone el orden y arma el
        mensaje. Las duraciones viven en data-min del HTML, así que sin
        JS se leen igual; esto sólo las suma. ── */
  var form = document.getElementById('planner');
  if (form) {
    var casillas = form.querySelectorAll('input[type=checkbox]');
    var num = document.getElementById('total-num');
    var txt = document.getElementById('total-txt');
    var orden = document.getElementById('orden');
    var msg = document.getElementById('msg');
    var wsp = document.getElementById('btn-wsp');
    var wspBase = 'https://wa.me/56979171689';

    /* Orden que conviene: lo largo primero (color, alisado), lo que se
       puede hacer en paralelo después, y lo de rostro al final para no
       mojarlo. Es oficio, no cronómetro: por eso está escrito como
       regla y no como cálculo. */
    var pesoDe = function (nombre) {
      if (/color|mechas|alisado|keratina|tratamiento/i.test(nombre)) { return 1; }
      if (/corte/i.test(nombre)) { return 2; }
      if (/manicure|esmaltado|pedicure|podolog/i.test(nombre)) { return 3; }
      return 4; /* pestañas, cejas, cera, limpieza */
    };

    var horas = function (m) {
      if (m < 60) { return m + ' min'; }
      var h = Math.floor(m / 60), r = m % 60;
      return h + ' h' + (r ? ' ' + r + ' min' : '');
    };

    var armar = function () {
      var elegidos = [], total = 0;
      Array.prototype.forEach.call(casillas, function (c) {
        if (c.checked) {
          elegidos.push({ n: c.value, m: parseInt(c.getAttribute('data-min'), 10) || 0 });
          total += parseInt(c.getAttribute('data-min'), 10) || 0;
        }
        var fila = c.closest('.serv');
        if (fila) { fila.classList.toggle('serv--on', c.checked); }
      });

      if (!elegidos.length) {
        num.textContent = '0';
        txt.textContent = 'min · marca uno o más servicios';
        orden.hidden = true; msg.hidden = true;
        wsp.setAttribute('href', wspBase);
        return;
      }

      elegidos.sort(function (a, b) { return pesoDe(a.n) - pesoDe(b.n) || b.m - a.m; });
      num.textContent = horas(total);
      txt.textContent = elegidos.length === 1 ? 'de visita, con un servicio' : 'de visita, con ' + elegidos.length + ' servicios';

      orden.textContent = 'Orden que conviene: ' + elegidos.map(function (e) { return e.n.toLowerCase(); }).join(' → ') + '.';
      orden.hidden = false;

      var t = 'Hola, quiero reservar en Estética Maipú Jacqueline.';
      t += '\nServicios: ' + elegidos.map(function (e) { return e.n; }).join(', ');
      t += '\nTiempo estimado: ' + horas(total);
      t += '\n¿Qué sede y qué horas tienen?';
      msg.textContent = t;
      msg.hidden = false;
      wsp.setAttribute('href', wspBase + '?text=' + encodeURIComponent(t));
    };

    Array.prototype.forEach.call(casillas, function (c) { c.addEventListener('change', armar); });
    armar();
  }

})();
