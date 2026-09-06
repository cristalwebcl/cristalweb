/* ═══════════════════════════════════════════════════════════════════
   Studio_handmade · demo 130 (tanda P3)

   JS clásico, IIFE, sin librerías. Tres cosas:
   1. Cancela el temporizador de rescate de la clase .js.
   2. Cabecera fantasma (por defecto es sólida; acá se agrega la
      transparencia sobre la portada y el esconder al bajar).
   3. Reveals con IntersectionObserver y sus dos resguardos.

   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* 1 · el rescate ya no hace falta: main.js llegó */
  clearTimeout(window.__rescate);

  var cab     = document.getElementById('cab');
  var portada = document.getElementById('portada');
  var reduce  = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ═══════════════════════════════════════════════════════════════
     2 · CABECERA FANTASMA
     Umbral de 120 px y deltas menores a 8 px ignorados, para que no
     tirite con el scroll fino del trackpad. Nunca se esconde si el
     foco del teclado está dentro de ella.
     ═══════════════════════════════════════════════════════════════ */
  if (cab) {
    var ultimo = window.pageYOffset || 0;
    var pedido = false;
    var UMBRAL = 120;
    var MINIMO = 8;

    var pintar = function () {
      pedido = false;
      var y = window.pageYOffset || 0;
      var delta = y - ultimo;

      var altoPortada = portada ? portada.offsetHeight : 0;
      if (y < altoPortada - 80) { cab.classList.add('cab--ghost'); }
      else                      { cab.classList.remove('cab--ghost'); }

      if (Math.abs(delta) < MINIMO) { return; }
      if (y < UMBRAL) {
        cab.classList.remove('cab--oculta');
      } else if (delta > 0 && !cab.contains(document.activeElement)) {
        cab.classList.add('cab--oculta');
      } else if (delta < 0) {
        cab.classList.remove('cab--oculta');
      }
      ultimo = y;
    };

    /* rAF sólo como throttle del scroll: permitido, es UI */
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; window.requestAnimationFrame(pintar); }
    }, { passive: true });

    pintar();
  }

  /* ═══════════════════════════════════════════════════════════════
     3 · REVEALS
     La clase .rev se agrega desde acá, nunca en el HTML: así, con el
     JS caído, no hay nada oculto que rescatar.
     ═══════════════════════════════════════════════════════════════ */
  var piezas = [].slice.call(document.querySelectorAll(
    '.portada__texto > *, .combos__cabecera > *, .tarjeta, ' +
    '.mano__cuerpo > *, .nota, .dueno__cols > div'
  ));

  if (!piezas.length) { return; }

  if (reduce.matches || !('IntersectionObserver' in window)) {
    return; /* sin animación: la página ya se ve entera */
  }

  piezas.forEach(function (el, i) {
    el.classList.add('rev');
    el.style.transitionDelay = (Math.min(i % 5, 4) * 70) + 'ms';
  });

  var mostrar = function (el) { el.classList.add('on'); };

  /* Resguardo 1 · lo que ya se ve al cargar se muestra de inmediato */
  var alto = window.innerHeight || 800;
  piezas.forEach(function (el) {
    if (el.getBoundingClientRect().top < alto * 0.92) { mostrar(el); }
  });

  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) { mostrar(e.target); obs.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  piezas.forEach(function (el) { obs.observe(el); });

  /* Resguardo 2 · barrido a los 6 s por si el observer nunca dispara */
  setTimeout(function () { piezas.forEach(mostrar); }, 6000);
})();
