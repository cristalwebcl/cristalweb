/* ═══════════════════════════════════════════════════════════════════
   Clínica Veterinaria Araucanía — Villarrica
   JavaScript clásico, patrón IIFE. Sin módulos, sin librerías, sin
   build. La página funciona COMPLETA sin este archivo: acá sólo vive
   el movimiento y el armador de mensaje, nunca el contenido.

   El punto de luz de la banda de guardia NO se mueve desde acá:
   es @keyframes de CSS, que no se congela en pestañas de fondo y no
   cuesta nada.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';


  /* ── 0 · cancelar el rescate ──────────────────────────────────────
     El script inline del <head> programó un temporizador que quita la
     clase .js a los 4 s por si este archivo nunca llegaba. Llegó: se
     cancela para que los estados ocultos sigan vivos. */
  if (window.__rescate) {
    clearTimeout(window.__rescate);
    window.__rescate = null;
  }

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ═══════════════════════════════════════════════════════════════
     1 · REVEALS AL SCROLL
     Con DOS resguardos, porque un reveal que no dispara deja texto
     invisible para siempre:
       a) lo que ya está en pantalla al cargar se muestra de inmediato
       b) barrido a los 6 s que revela todo lo que quedó pendiente
     ═══════════════════════════════════════════════════════════════ */
  (function reveals() {
    var elems = [].slice.call(document.querySelectorAll('.reveal'));
    if (!elems.length) return;

    function mostrar(el) { el.classList.add('visible'); }

    var alto = window.innerHeight || document.documentElement.clientHeight;
    elems.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < alto * 0.92) mostrar(el);
    });

    if (!('IntersectionObserver' in window)) { elems.forEach(mostrar); return; }

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { mostrar(e.target); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    elems.forEach(function (el) {
      if (!el.classList.contains('visible')) obs.observe(el);
    });

    setTimeout(function () { elems.forEach(mostrar); }, 6000);
  })();


  /* ═══════════════════════════════════════════════════════════════
     2 · FOTOS QUE SE DESPLAZAN AL SCROLL
     El contenedor de la foto es un 24% más alto que su lámina, así
     que le sobra recorrido y nunca se ve el borde.
     ═══════════════════════════════════════════════════════════════ */
  (function parallax() {
    if (reduceMotion) return;

    var capas = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if (!capas.length) return;

    var FUERZA = 0.12;
    var pedido = false;

    function pintar() {
      pedido = false;
      var alto = window.innerHeight;
      capas.forEach(function (capa) {
        var lamina = capa.parentElement;
        var r = lamina.getBoundingClientRect();
        if (r.bottom < -100 || r.top > alto + 100) return;
        var centro = r.top + r.height / 2;
        var avance = (centro - alto / 2) / (alto / 2 + r.height / 2);
        capa.style.transform = 'translate3d(0,' + (avance * r.height * FUERZA).toFixed(1) + 'px,0)';
      });
    }

    // rAF como throttle: acá SÍ está permitido, es UI de scroll.
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; window.requestAnimationFrame(pintar); }
    }, { passive: true });
    window.addEventListener('resize', pintar, { passive: true });
    pintar();
  })();


    /* ═══════════════════════════════════════════════════════════════
     3 · HUECOS DE FOTO
     Si un hueco ya tiene background-image puesto desde el CSS, se le
     marca .tiene-foto para que desaparezca la nota. Integrar una
     imagen es descomentar una regla y nada más.
     ═══════════════════════════════════════════════════════════════ */
  (function huecos() {
    var lista = [].slice.call(document.querySelectorAll('[data-foto]'));
    lista.forEach(function (h) {
      var img = window.getComputedStyle(h).backgroundImage;
      if (img && img !== 'none' && img.indexOf('url(') !== -1) {
        h.classList.add('tiene-foto');
      }
    });
  })();

})();
