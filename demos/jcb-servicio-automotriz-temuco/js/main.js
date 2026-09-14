/* ═══════════════════════════════════════════════════════════════════
   JCB Servicio Automotriz — Temuco
   JavaScript clásico, patrón IIFE. Sin módulos, sin librerías, sin
   build. La página funciona COMPLETA sin este archivo: acá sólo vive
   el movimiento, nunca el contenido.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 0 · cancelar el rescate ──────────────────────────────────────
     El script inline del <head> programó un temporizador que quita la
     clase .js a los 4 s por si este archivo nunca llegaba. Llegó: se
     cancela para que los estados ocultos sigan vivos y las
     animaciones puedan correr. */
  if (window.__rescate) {
    clearTimeout(window.__rescate);
    window.__rescate = null;
  }

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ═══════════════════════════════════════════════════════════════
     1 · HEADER FANTASMA
     Baja el scroll → se esconde entero. Sube → reaparece con fondo.
     En el tope → transparente de nuevo.
     ═══════════════════════════════════════════════════════════════ */
  (function headerFantasma() {
    var cab = document.querySelector('[data-cab]');
    if (!cab) return;

    var UMBRAL = 120;   // no esconder antes de esto
    var MINIMO = 8;     // deltas menores son ruido de trackpad
    var ultimo = window.pageYOffset || 0;
    var pedido = false;

    /* ESTADO INICIAL — no es un adorno.
       El header es transparente y su texto va en blanco porque encima
       del tope tiene la portada oscura detrás. Si alguien entra con un
       ancla (…/#horno) o recarga a media página, el navegador salta sin
       disparar ningún evento de scroll: el header quedaría transparente
       sobre el fondo crema y su texto blanco sería ilegible.
       Se fija dos veces porque el salto del ancla puede ocurrir antes o
       después de este archivo, según cuándo termine de cargar todo. */
    function fijarPorPosicion() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      ultimo = y;
      if (y > UMBRAL) cab.classList.add('esta-fija');
      else cab.classList.remove('esta-fija', 'esta-oculto');
    }
    fijarPorPosicion();
    window.addEventListener('load', fijarPorPosicion);
    window.addEventListener('hashchange', fijarPorPosicion);

    function evaluar() {
      pedido = false;
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      var delta = y - ultimo;

      if (Math.abs(delta) < MINIMO) return;

      // nunca esconder con el menú móvil abierto: lo están usando
      var menuAbierto = document.querySelector('.nav.abierto');

      if (y <= UMBRAL) {
        cab.classList.remove('esta-oculto', 'esta-fija');
      } else if (delta > 0 && !menuAbierto) {
        cab.classList.add('esta-oculto');
        cab.classList.remove('esta-fija');
      } else if (delta < 0) {
        cab.classList.remove('esta-oculto');
        cab.classList.add('esta-fija');
      }

      ultimo = y;
    }

    // rAF como throttle: acá SÍ está permitido, es UI de scroll.
    // (En la portada no: Chrome congela rAF en pestañas de fondo y la
    //  portada quedaría en blanco. Por eso la portada va con keyframes.)
    window.addEventListener('scroll', function () {
      if (!pedido) {
        pedido = true;
        window.requestAnimationFrame(evaluar);
      }
    }, { passive: true });
  })();


  /* ═══════════════════════════════════════════════════════════════
     2 · MENÚ MÓVIL
     ═══════════════════════════════════════════════════════════════ */
  (function menu() {
    var boton = document.querySelector('[data-hamb]');
    var nav = document.getElementById('nav');
    if (!boton || !nav) return;

    function cerrar() {
      nav.classList.remove('abierto');
      boton.setAttribute('aria-expanded', 'false');
    }

    boton.addEventListener('click', function () {
      var abierto = nav.classList.toggle('abierto');
      boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });

    // al elegir un destino, cerrar
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) cerrar();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('abierto')) {
        cerrar();
        boton.focus();
      }
    });

    // si se pasa a escritorio con el panel abierto, limpiar el estado
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) cerrar();
    });
  })();


  /* ═══════════════════════════════════════════════════════════════
     3 · REVEALS AL SCROLL
     Con DOS resguardos, porque un reveal que no dispara deja texto
     invisible para siempre:
       a) lo que ya está en pantalla al cargar se muestra de inmediato
       b) barrido a los 6 s que revela todo lo que quedó pendiente
     ═══════════════════════════════════════════════════════════════ */
  (function reveals() {
    var elems = [].slice.call(document.querySelectorAll('.reveal'));
    if (!elems.length) return;

    function mostrar(el) { el.classList.add('visible'); }

    // resguardo (a) — visible al iniciar, sin esperar al observer
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

    // resguardo (b) — barrido de seguridad
    setTimeout(function () { elems.forEach(mostrar); }, 6000);
  })();


  /* ═══════════════════════════════════════════════════════════════
     4 · FOTOS QUE SE DESPLAZAN AL SCROLL
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

        // fuera de pantalla: no gastar en calcular
        if (r.bottom < -100 || r.top > alto + 100) return;

        // -1 cuando la lámina entra por abajo, +1 cuando sale por arriba
        var centro = r.top + r.height / 2;
        var avance = (centro - alto / 2) / (alto / 2 + r.height / 2);
        var y = avance * r.height * FUERZA;

        capa.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
      });
    }

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
     5 · HUECOS DE FOTO
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
