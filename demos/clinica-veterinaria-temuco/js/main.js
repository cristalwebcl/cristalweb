/* ══════════════════════════════════════════════════════════════════
   CLINICA VETERINARIA TEMUCO — demo 160
   JS clasico, un IIFE, sin dependencias.

   Las filas de la farmacia son <details> nativos: abren y cierran sin
   no llega, la tabla se lee completa — y en una pagina que ayuda a
   decidir cuando llevar un animal, eso no es negociable.

   OJO CON LA CSP: `el.style.height = ...` desde JavaScript SI
   funciona con style-src 'self'. Lo que la CSP bloquea es el ATRIBUTO
   style escrito en el HTML, no el CSSOM. (Ver la demo 147, donde los
   style= del markup salieron de ancho cero.)
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
  ['.portada', '.portada__texto', '.tajo', '.mos__p', '.mitades__texto', '.mitades__foto', '.cita__texto', '.tira__pieza', '.triage__cabecera', '.tabla-envoltura', '.nombre__cuerpo', '.cierre', '.dueno__cols']
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
