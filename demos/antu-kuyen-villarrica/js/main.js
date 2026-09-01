/* ══════════════════════════════════════════════════════════════════
   CABAÑAS ANTU KUYEN · Villarrica — demo 152
   JS clasico, un IIFE, sin dependencias.

   OJO CON LA MECANICA: la pagina oscurece porque cada seccion tiene
   su propio fondo en el CSS, NO porque este archivo la vaya pintando.
   Si main.js no llega, los cinco escalones de luz se ven exactamente
   igual. Lo unico que hace este archivo por la mecanica es que la
   CABECERA acompañe: sin el, se queda clara, que es la version
   legible.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · La cabecera acompaña la hora ──
     Cuando la seccion que ocupa la franja de arriba es una de las dos
     oscuras, la cabecera se pasa a la noche. Se mira la seccion que
     esta justo debajo del header, no la mas visible: asi el cambio
     ocurre en el borde exacto entre dos escalones. */
  var cab = document.getElementById('cab');
  if (cab) {
    var oscuras = ['e4', 'e5'];
    var esNoche = false;

    var mirar = function () {
      var alto = cab.getBoundingClientRect().height;
      var bajo = document.elementFromPoint(
        Math.round(window.innerWidth / 2),
        Math.round(alto + 4)
      );
      var sec = bajo && bajo.closest ? bajo.closest('section') : null;
      var noche = false;
      if (sec) {
        oscuras.forEach(function (c) {
          if (sec.classList.contains(c)) { noche = true; }
        });
      }
      if (noche !== esNoche) {
        esNoche = noche;
        cab.classList.toggle('cab--noche', noche);
      }
    };

    window.addEventListener('scroll', mirar, { passive: true });
    window.addEventListener('resize', mirar, { passive: true });
    mirar();
  }

  /* ── 2 · Apariciones al entrar en pantalla ── */
  var piezas = [];
  ['.portada', '.portada__texto', '.tajo', '.mos__p', '.galeria__titulo', '.gal', '.mitades__texto', '.mitades__foto', '.cita__texto', '.tira__pieza', '.bloque', '.cap__cuerpo', '.cap__h', '.dueno__cols']
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
