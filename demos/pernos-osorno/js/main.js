/* ═══════════════════════════════════════════════════════════════════
   Pernos Osorno — Av. René Soriano 2407
   JavaScript clásico, patrón IIFE. Sin módulos, sin librerías, sin
   build. La página funciona COMPLETA sin este archivo: acá sólo vive
   el movimiento, nunca el contenido.

   Esta demo NO tiene barra superior ni menú hamburguesa: la
   navegación es la cajonera, que en escritorio va fija a la izquierda
   y en teléfono baja al pie como tira deslizable. Por eso faltan los
   bloques de "header fantasma" y "menú móvil" que llevan las otras.
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
     1 · CAJÓN ABIERTO
     Marca en la cajonera la sección que se está mirando. Es puro
     adorno de orientación: si esto no corre, la cajonera sigue
     navegando igual porque son anclas normales.
     ═══════════════════════════════════════════════════════════════ */
  (function cajonActivo() {
    var cajones = [].slice.call(document.querySelectorAll('.cajon'));
    if (!cajones.length) return;

    // par [enlace, sección] para los cajones que apuntan a algo real
    var pares = [];
    cajones.forEach(function (a) {
      var id = (a.getAttribute('href') || '').replace('#', '');
      var sec = id && document.getElementById(id);
      if (sec) pares.push({ a: a, sec: sec });
    });
    if (!pares.length) return;

    /* Se calcula con el scroll y NO con IntersectionObserver, por dos
       razones concretas:
         · con IO, cuando el lector pasa por la lámina —que no es una
           sección con id— ninguna entra en la banda y la cajonera se
           apaga entera. Acá gana siempre la última sección cuyo tope
           quedó por encima de la línea de lectura, así que una vez
           marcada nunca se queda sin marca.
         · son cinco secciones: recorrerlas es más barato que mantener
           cinco observers, y da el mismo resultado sin depender de un
           umbral que hay que adivinar. */
    var activo = null;
    var pedido = false;

    function evaluar() {
      pedido = false;
      var linea = (window.pageYOffset || document.documentElement.scrollTop || 0)
                + (window.innerHeight || 0) * 0.33;

      var elegido = null;
      pares.forEach(function (p) {
        var tope = p.sec.getBoundingClientRect().top
                 + (window.pageYOffset || document.documentElement.scrollTop || 0);
        if (tope <= linea) elegido = p;
      });

      if (elegido === activo) return;         // sin cambios: no tocar el DOM
      cajones.forEach(function (a) { a.classList.remove('activo'); });
      if (elegido) elegido.a.classList.add('activo');
      activo = elegido;
    }

    window.addEventListener('scroll', function () {
      if (!pedido) {
        pedido = true;
        window.requestAnimationFrame(evaluar);
      }
    }, { passive: true });

    window.addEventListener('resize', evaluar, { passive: true });
    evaluar();
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

    // resguardo (a)
    var alto = window.innerHeight || document.documentElement.clientHeight;
    elems.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < alto * 0.92) mostrar(el);
    });

    if (!('IntersectionObserver' in window)) {
      elems.forEach(mostrar);
      return;
    }

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          mostrar(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    elems.forEach(function (el) {
      if (!el.classList.contains('visible')) obs.observe(el);
    });

    // resguardo (b)
    setTimeout(function () { elems.forEach(mostrar); }, 6000);
  })();


  /* ═══════════════════════════════════════════════════════════════
     3 · FOTOS QUE SE DESPLAZAN AL SCROLL
     Parallax suave sobre [data-parallax]. El contenedor de la foto es
     un 24% más alto que su lámina (ver CSS), así que le sobra
     recorrido y nunca se ve el borde.

     Se apaga entero con prefers-reduced-motion: es movimiento
     decorativo, justo lo que hay que sacrificar.
     ═══════════════════════════════════════════════════════════════ */
  (function parallax() {
    if (reduceMotion) return;

    var capas = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if (!capas.length) return;

    var FUERZA = 0.12;   // fracción del recorrido; más que esto se nota falso
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
        var y = avance * r.height * FUERZA;

        capa.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
      });
    }

    // rAF como throttle: acá SÍ está permitido, es UI de scroll.
    // (En la portada no: Chrome congela rAF en pestañas de fondo y la
    //  portada quedaría en blanco. Por eso la portada va con keyframes.)
    window.addEventListener('scroll', function () {
      if (!pedido) {
        pedido = true;
        window.requestAnimationFrame(pintar);
      }
    }, { passive: true });

    window.addEventListener('resize', pintar, { passive: true });
    pintar();
  })();


  /* ═══════════════════════════════════════════════════════════════
     4 · HUECOS DE FOTO
     Si un hueco ya tiene background-image puesto desde el CSS, se le
     marca .tiene-foto para que desaparezca la nota de "acá va la foto
     tal". Así integrar una imagen es descomentar una regla y nada más.
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
