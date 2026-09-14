/* Cortinas Rolzzo — main.js
   IIFE, JS clásico, sin librerías, sin type="module" (rompe en file://).
   Hace cuatro cosas: cancelar el rescate, la cabecera fantasma, las
   apariciones al scrollear y la escena de la cortina que baja.
   Nada del contenido depende de este archivo: si no carga, la página se
   lee entera igual. */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Cabecera fantasma ────────────────────────────────────────────
     Se oculta al bajar y vuelve al subir, para no tapar contenido en el
     teléfono. NO se transparenta sobre la portada: al ser sticky en flujo
     normal queda ARRIBA de la foto y no encima, así que transparentarla
     mostraba el papel claro y el texto blanco desaparecía. */
  var cab = document.getElementById('cab');
  var portada = document.getElementById('portada');
  if (cab) {
    var ultimo = 0, pedido = false;
    var pinta = function () {
      pedido = false;
      var y = window.scrollY || document.documentElement.scrollTop;
      var alto = portada ? portada.offsetHeight - cab.offsetHeight : 240;
      cab.classList.toggle('cab--oculta', y > ultimo && y > alto * 0.5);
      ultimo = y;
    };
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; window.requestAnimationFrame(pinta); }
    }, { passive: true });
    pinta();
  }

  /* ── Apariciones ──────────────────────────────────────────────────
     Se observa el CONTENEDOR y se destapa a sus hijos con stagger por
     nth-child en el CSS: nunca un style="--i:3" en el HTML, que la CSP
     bloquea sin avisar. */
  var grupos = document.querySelectorAll('.ancho > .rotulo, .ancho > .titulo, .cifras__grid, .tipos__grid, .pasos, .mos__grilla, .dueno__cols, .pedir__pasos, .datos');
  Array.prototype.forEach.call(grupos, function (g) { g.classList.add('rev'); });

  if ('IntersectionObserver' in window) {
    var ob = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('rev--on'); ob.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(document.querySelectorAll('.rev'), function (g) { ob.observe(g); });
    /* Seguro: a los 6 s todo visible aunque el observador se estropee. */
    setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.rev'), function (g) { g.classList.add('rev--on'); });
    }, 6000);
  } else {
    Array.prototype.forEach.call(document.querySelectorAll('.rev'), function (g) { g.classList.add('rev--on'); });
  }

  /* ── Escena: la cortina roller baja ───────────────────────────────
     Pasa UNA vez y se queda abajo. Con menos movimiento, arranca bajada. */
  var escena = document.querySelector('.escena');
  if (escena) {
    if (reduce) {
      escena.classList.add('escena--va');
    } else if ('IntersectionObserver' in window) {
      var oe = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('escena--va'); oe.unobserve(e.target); }
        });
      }, { threshold: 0.3 });
      oe.observe(escena);
    } else {
      escena.classList.add('escena--va');
    }
  }

  /* ── La cifra que cuenta ──────────────────────────────────────────
     Sólo la de las reseñas, y sólo una vez. Con menos movimiento queda
     el número escrito, que es lo que importa. El seguro para el bucle
     va dentro del propio rAF: un setTimeout que no lo detenga dejaría
     el número a medias en pantalla. */
  var cuenta = document.querySelector('[data-cuenta]');
  if (cuenta && !reduce && 'IntersectionObserver' in window) {
    var fin = parseInt(cuenta.getAttribute('data-cuenta'), 10) || 0;
    var oc = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        oc.unobserve(e.target);
        var t0 = null, dur = 1400;
        var paso = function (t) {
          if (t0 === null) { t0 = t; }
          var p = Math.min(1, (t - t0) / dur);
          var suave = 1 - Math.pow(1 - p, 3);
          cuenta.textContent = String(Math.round(fin * suave));
          if (p < 1) { window.requestAnimationFrame(paso); }
          else { cuenta.textContent = String(fin); }
        };
        window.requestAnimationFrame(paso);
      });
    }, { threshold: 0.6 });
    oc.observe(cuenta);
  }

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