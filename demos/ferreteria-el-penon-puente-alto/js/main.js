/* ══════════════════════════════════════════════════════════════════
   FERRETERÍA EL PEÑÓN · Puente Alto — CristalWeb
   Todo lo que hace este archivo es adorno: el video de fondo, la
   cabecera que se despega, las apariciones al scroll, el conteo de las
   cifras y la lista de la pega que se marca.

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
     fuera de vista para no gastar batería. ── */
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

  /* ── 2 · Apariciones (observer sobre el CONTENEDOR) ── */
  var piezas = [];
  ['.cifras__lista', '.pegas .ancho > :not(.pega__lista)', '.pega__lista',
   '.familias .ancho > :not(.fam__grilla)', '.fam__grilla',
   '.maestro .ancho > :not(.fichas)', '.fichas', '.cita__txt', '.mit__txt',
   '.mos .ancho', '.mos__grilla', '.contacto__cols > *', '.dueno .ancho']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });
  piezas.forEach(function (el) { el.classList.add('rev'); });

  if ('IntersectionObserver' in window) {
    var ob = new IntersectionObserver(function (es, o) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        setTimeout(function () { e.target.classList.add('ok'); }, (i % 4) * 60);
        o.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    piezas.forEach(function (el) { ob.observe(el); });
  } else {
    piezas.forEach(function (el) { el.classList.add('ok'); });
  }
  /* Barrido a los 6 s: si algo no se mostró, se muestra igual. */
  setTimeout(function () { piezas.forEach(function (el) { el.classList.add('ok'); }); }, 6000);

  /* ── 3 · Portada y escena ── */
  var txt = document.querySelector('.portada__texto');
  var esc = document.querySelector('.escena--panel');
  setTimeout(function () {
    if (txt) { txt.classList.add('ok'); }
    if (esc) { esc.classList.add('ok'); }
  }, 120);

  /* ── 4 · Las cifras cuentan hacia arriba ── */
  var cifras = document.querySelectorAll('[data-cuenta]');
  if (cifras.length && !reduce && 'IntersectionObserver' in window) {
    var oc = new IntersectionObserver(function (es, o) {
      es.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        o.unobserve(e.target);
        var fin = parseInt(e.target.getAttribute('data-cuenta'), 10);
        var t0 = 0, dur = 900;
        var paso = function (t) {
          if (!t0) { t0 = t; }
          var k = Math.min((t - t0) / dur, 1);
          e.target.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3))).toString();
          if (k < 1) { requestAnimationFrame(paso); }
        };
        requestAnimationFrame(paso);
      });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(cifras, function (c) { oc.observe(c); });
  }

  /* ── 5 · La lista de la pega ──
     Arma el texto con los ítems de la tarjeta marcada y lo deja escrito
     para leerlo por teléfono o copiarlo. No envía nada. */
  var botones = document.querySelectorAll('.pega__boton');
  var salida = document.getElementById('salida-txt');
  if (botones.length && salida) {
    Array.prototype.forEach.call(botones, function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(botones, function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        var tarjeta = b.closest('.pega');
        var items = [];
        Array.prototype.forEach.call(tarjeta.querySelectorAll('li'), function (li) { items.push(li.textContent.trim()); });
        salida.textContent = 'Hola, necesito lo de «' + b.getAttribute('data-pega') +
          '»: ' + items.join(', ') + '. ¿Lo tienen todo?';
      });
    });
  }
})();
