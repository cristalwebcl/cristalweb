/* 202 · Servimax Gorbea — main.js
   IIFE, JS clásico, sin librerías, sin type="module" (rompe en file://).
   Hace tres cosas: cancelar el rescate, revelar grupos, y el header
   fantasma. La viñeta y las gotas de la portada NO pasan por acá:
   es CSS puro y sigue funcionando aunque este archivo no cargue. */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Reveals ──────────────────────────────────────────────────────
     El observer va sobre el CONTENEDOR, nunca sobre los hijos: un hijo
     con clip-path a área cero jamás dispara IntersectionObserver, y
     además el contenedor es lo que permite el stagger con --r. */
  var grupos = document.querySelectorAll('[data-rev-grupo]');

  function mostrar(el) { el.classList.add('ok'); }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entradas) {
      for (var i = 0; i < entradas.length; i++) {
        if (entradas[i].isIntersecting) {
          mostrar(entradas[i].target);
          io.unobserve(entradas[i].target);   // una sola vez: reaparecer cansa
        }
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    for (var g = 0; g < grupos.length; g++) {
      // Lo que ya se ve al cargar se muestra de inmediato, sin esperar scroll
      var r = grupos[g].getBoundingClientRect();
      if (r.top < window.innerHeight) { mostrar(grupos[g]); }
      else { io.observe(grupos[g]); }
    }
  } else {
    for (var k = 0; k < grupos.length; k++) { mostrar(grupos[k]); }
  }

  // Segundo resguardo: barrido a los 6 s pase lo que pase
  setTimeout(function () {
    for (var j = 0; j < grupos.length; j++) { mostrar(grupos[j]); }
  }, 6000);

  /* ── Header fantasma ──────────────────────────────────────────────
     Estado por defecto (sin JS) = sólido legible; el JS agrega la
     transparencia sobre la portada. Umbral 120 px, deltas < 8 px
     ignorados, jamás se esconde con el foco dentro. */
  var cab = document.getElementById('cab');
  if (cab) {
    var ultimo = window.pageYOffset || 0;
    var pedido = false;

    function pinta() {
      pedido = false;
      var y = window.pageYOffset || 0;
      var delta = y - ultimo;

      if (y <= 8) {
        cab.classList.add('cab--top');
        cab.classList.remove('cab--oculta');
      } else {
        cab.classList.remove('cab--top');
        if (Math.abs(delta) >= 8 && y > 120 && !cab.contains(document.activeElement)) {
          if (delta > 0) { cab.classList.add('cab--oculta'); }
          else { cab.classList.remove('cab--oculta'); }
        }
      }
      ultimo = y;
    }

    // rAF sólo como throttle de scroll — permitido: es UI, no la portada
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; window.requestAnimationFrame(pinta); }
    }, { passive: true });

    pinta();
  }

  void reduce;
})();
