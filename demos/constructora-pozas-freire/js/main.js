/* ══════════════════════════════════════════════════════════════════
   CONSTRUCTORA POZAS · Freire — demo 182
   JS clasico, un IIFE, sin dependencias.

   Sin JavaScript la pagina se lee entera. El desglose son <details>
   nativos: abren y cierran sin una linea de JS y el sello de cada
   item se ve igual sin abrirlos. Lo unico que se pierde es la
   plomada del fondo.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · Cabecera fantasma ── */
  var cab = document.getElementById('cab');
  if (cab) {
    var flotando = false;
    var mirarCab = function () {
      var abajo = window.pageYOffset > 40;
      if (abajo !== flotando) {
        flotando = abajo;
        cab.classList.toggle('cab--flota', abajo);
      }
    };
    window.addEventListener('scroll', mirarCab, { passive: true });
    mirarCab();
  }

  /* ── 2 · Apariciones al entrar en pantalla ── */
  var piezas = [];
  ['.portada', '.mitades__texto', '.mitades__foto', '.cita__texto', '.tira__pieza', '.portada__texto', '.obras__titulo', '.obra', '.desglose__cabecera', '.filas', '.firma', '.terreno__cabecera', '.tj', '.cierre', '.dueno__cols']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        piezas.push(el);
      });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });
  var destapar = function (el) { el.classList.add('ok'); };

  if (!('IntersectionObserver' in window) || reduce) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { destapar(e.target); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { obs.observe(el); }
    });
    setTimeout(function () { piezas.forEach(destapar); }, 6000);
  }

})();
