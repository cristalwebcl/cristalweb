/* ══════════════════════════════════════════════════════════════════
   FLOR DE PIEDRA · Lican Ray — demo 151
   JS clasico, un IIFE, sin dependencias.

   Esta demo es T1: el contacto es el telefono verificado, escrito en
   el HTML como enlace tel:. NO hay formulario, asi que este archivo
   no participa en el contacto de ninguna forma: si no llega, el
   telefono sigue siendo un enlace que marca.
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
    var mirar = function () {
      var abajo = window.pageYOffset > 40;
      if (abajo !== flotando) {
        flotando = abajo;
        cab.classList.toggle('cab--flota', abajo);
      }
    };
    window.addEventListener('scroll', mirar, { passive: true });
    mirar();
  }

  /* ── 2 · Apariciones al entrar en pantalla ──
     El PLANO es un SVG escrito en el HTML y sus zonas son enlaces <a>
     columnas de texto, sin pestañas ni interruptor. Si este archivo no
     llega, las dos temporadas se leen igual, una al lado de la otra. */
  var piezas = [];
  ['.portada', '.portada__texto', '.tajo', '.mos__p', '.galeria__titulo', '.gal', '.mitades__texto', '.mitades__foto', '.cita__texto', '.tira__pieza', '.temporadas__cabecera', '.comparador', '.ojo',
   '.trece__cuerpo', '.cierre', '.dueno__cols'].forEach(function (sel) {
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
