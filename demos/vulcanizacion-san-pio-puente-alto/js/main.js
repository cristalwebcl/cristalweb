/* ══════════════════════════════════════════════════════════════════
   VULCANIZACIÓN SAN PIO · Puente Alto — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: los cuatro pasos son una
   lista, y los botones de WhatsApp y de llamar abren igual, sólo que
   el mensaje no se arma solo. El JS agrega las apariciones al scroll,
   la cifra que cuenta y el mensaje de pana con lo que se escribe.

   No carga nada, no mide nada, no manda nada a ninguna parte.
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

  /* ── 2 · Apariciones (observer sobre el contenedor) ── */
  var piezas = [];
  ['.cifras__lista', '.pana .ancho', '.pasos', '.aviso', '.tajo__txt',
   '.servicios .ancho > :not(.dos)', '.dos .lista', '.mitades__txt', '.cita__txt',
   '.mos .ancho', '.mos__grilla', '.contacto__cols > *', '.dueno .ancho']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });
  piezas.forEach(function (el) { el.classList.add('rev'); });

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

  /* ── 3 · El mensaje de pana ── */
  var donde = document.getElementById('a-donde');
  var veh = document.getElementById('a-veh');
  var que = document.getElementById('a-que');
  var salida = document.getElementById('a-salida');
  var btn = document.getElementById('a-wsp');
  if (donde && veh && que && salida && btn) {
    var base = 'https://wa.me/56966900936';
    var armar = function () {
      var d = donde.value.trim();
      var t = 'Hola, quedé en pana con una rueda.';
      t += '\nDónde: ' + (d || '(te mando la ubicación)');
      t += '\nVehículo: ' + veh.value;
      t += '\nQué pasó: ' + que.value;
      t += '\n¿Pueden venir?';
      salida.textContent = d ? t : '';
      btn.setAttribute('href', base + '?text=' + encodeURIComponent(t));
    };
    [donde, veh, que].forEach(function (c) {
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();
  }

})();
