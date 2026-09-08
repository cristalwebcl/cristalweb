/* ══════════════════════════════════════════════════════════════════
   CABAÑAS LOS BOLDOS · Coñaripe — demo 154
   JS clasico, un IIFE, sin dependencias.

   El TERMOMETRO es adorno: este archivo solo le cambia la altura al
   liquido segun cuanto se ha bajado. Si no llega, el CSS lo deja
   lleno y la pagina se lee igual — ninguna informacion vive ahi.

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

  /* ── 2 · El termometro ──
     De 8% (fria) a 100% (listo). Arranca en 8 y no en 0 para que se
     vea que el instrumento existe antes de empezar a bajar. */
  var liq = document.getElementById('termLiq');
  if (liq && !reduce) {
    var subir = function () {
      var alto = document.documentElement.scrollHeight - window.innerHeight;
      var p = alto > 0 ? window.pageYOffset / alto : 0;
      if (p < 0) { p = 0; } else if (p > 1) { p = 1; }
      liq.style.height = (8 + p * 92).toFixed(1) + '%';
    };
    window.addEventListener('scroll', subir, { passive: true });
    window.addEventListener('resize', subir, { passive: true });
    subir();
  }

  /* ── 3 · Apariciones al entrar en pantalla ── */
  var piezas = [];
  ['.portada', '.portada__texto', '.tajo', '.mos__p', '.galeria__titulo', '.gal', '.mitades__texto', '.mitades__foto', '.cita__texto', '.tira__pieza', '.paso__cuerpo', '.despues__cuerpo', '.cierre', '.dueno__cols']
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
