/* ═══════════════════════════════════════════════════════════════════
   CUBA SALUD · Loncoche
   JavaScript clásico, patrón IIFE. Sin módulos, sin librerías, sin
   build. La página funciona COMPLETA sin este archivo: acá vive el
   movimiento, nunca el contenido.

   El pulso del fondo NO está acá: son @keyframes de CSS, que no se
   congelan en pestañas de fondo y no cuestan un solo evento.
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
     1 · LA CABECERA QUE SABE DÓNDE VA
     Subraya en el menú la sección que se está mirando.

     Se hace con un IntersectionObserver sobre las secciones, no con
     un listener de scroll: el observer se calcula solo y no cuesta un
     evento por pixel.

     POLARIDAD — la lección de la 47. El estado por defecto es
     «ninguna marcada», que se ve perfectamente bien. El subrayado
     sólo agrega. Si este archivo no llega o el observer no dispara,
     el menú sigue siendo un menú y no se pierde nada. Un adorno se
     puede permitir fallar; una cabecera ilegible no.

     La franja que decide es el tercio superior de la pantalla: se
     descuenta un 55% por abajo para que la sección «activa» sea la
     que está arriba, donde mira el ojo, y no la que ocupa más alto.
     ═══════════════════════════════════════════════════════════════ */
  (function menuActivo() {
    var menu = document.getElementById('menu');
    if (!menu || !('IntersectionObserver' in window)) return;

    var enlaces = [].slice.call(menu.querySelectorAll('a[href^="#"]'));
    var mapa = {};
    var secciones = [];

    enlaces.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (!sec) return;
      mapa[id] = a;
      secciones.push(sec);
    });
    if (!secciones.length) return;

    function marcar(id) {
      enlaces.forEach(function (a) { a.classList.remove('aqui'); });
      if (id && mapa[id]) mapa[id].classList.add('aqui');
    }

    var visibles = {};

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        visibles[e.target.id] = e.isIntersecting;
      });
      // Gana la primera del documento que esté dentro de la franja.
      var activa = null;
      secciones.forEach(function (s) { if (!activa && visibles[s.id]) activa = s.id; });
      marcar(activa);
    }, { rootMargin: '-10% 0px -55% 0px', threshold: 0 });

    secciones.forEach(function (s) { obs.observe(s); });
  })();


  /* ═══════════════════════════════════════════════════════════════
     2 · REVEALS AL SCROLL
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
     3 · LA FOTO DE LA LÁMINA SE DESPLAZA AL SCROLL
     La capa es un 24% más alta que su marco, así que le sobra
     recorrido y nunca se ve el borde.
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
     4 · HUECOS DE FOTO
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