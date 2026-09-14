/* ═══════════════════════════════════════════════════════════════════
   TIENDA PRODUCTOS QUIMEY · Villarrica
   JavaScript clásico, patrón IIFE. Sin módulos, sin librerías, sin
   build. La página funciona COMPLETA sin este archivo: acá vive el
   movimiento, nunca el contenido.

   El goteo de la portada NO está acá: son @keyframes de CSS con cinco
   hilos que se estiran desde el borde. No se congelan en pestañas de
   fondo y no cuestan un solo evento. La etiqueta de la cabecera es un
   rectángulo con borde, también sin código.
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
     invisible para siempre — y en esta página lo que se esconde es la
     sección de los cuatro destinos, que es a lo que viene la gente:
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
     2 · LA FOTO DE LA LÁMINA SE DESPLAZA AL SCROLL
     La capa es un 24% más alta que su marco, así que le sobra
     recorrido y nunca se ve el borde. El marco es el PADRE: medir la
     capa en vez del marco fue el bug de la 46, donde se movía la nota
     y no la foto.
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
        var marco = capa.parentElement;
        var r = marco.getBoundingClientRect();
        if (r.bottom < -100 || r.top > alto + 100) return;
        var centro = r.top + r.height / 2;
        var avance = (centro - alto / 2) / (alto / 2 + r.height / 2);
        capa.style.transform =
          'translate3d(0,' + (avance * r.height * FUERZA).toFixed(1) + 'px,0)';
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
     marca .tiene-foto y la nota desaparece sola. Integrar una imagen
     es descomentar una regla y nada más.
     ═══════════════════════════════════════════════════════════════ */
  (function huecos() {
    var lista = [].slice.call(document.querySelectorAll('[data-foto]'));
    lista.forEach(function (h) {
      var img = window.getComputedStyle(h).backgroundImage;
      if (img && img.indexOf('url(') !== -1) h.classList.add('tiene-foto');
    });
  })();

  /* ── Boton flotante de contacto ───────────────────────────────────
     El boton ya se ve por CSS. Aca solo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA, no el boton: un elemento fixed nunca entra ni sale de la
     ventana, asi que observarlo no dispararia jamas. ── */
  var flota = document.querySelector('.flota');
  var portadaF = document.querySelector('.portada');
  if (flota && portadaF) {
    var mirarFlota = function () {
      var r = portadaF.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      flota.classList.toggle('flota--arriba', visible > r.height * 0.55);
    };
    mirarFlota();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { flota.classList.toggle('flota--arriba', e.intersectionRatio > 0.55); });
      }, { threshold: [0, 0.55, 1] }).observe(portadaF);
    } else {
      window.addEventListener('scroll', mirarFlota, { passive: true });
    }
  }

})();