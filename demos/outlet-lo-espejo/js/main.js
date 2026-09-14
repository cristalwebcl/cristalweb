/* Outlet Espacio Lo Espejo — main.js
   IIFE, JS clásico, sin librerías, sin type="module" (rompe en file://).
   Hace tres cosas: cancelar el rescate, la cabecera fantasma y las
   apariciones al scrollear, más el disparo de la escena de portada.

   Nada del contenido se genera acá: con main.js renombrado la página se
   lee ENTERA. */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Cabecera fantasma ──────────────────────────────────────────── */
  var cab = document.getElementById('cab');
  var port = document.getElementById('port');
  if (cab) {
    var ultimo = 0, pedido = false;
    var pinta = function () {
      pedido = false;
      var y = window.scrollY || document.documentElement.scrollTop;
      var alto = port ? port.offsetHeight - cab.offsetHeight : 240;
      cab.classList.toggle('cab--oculta', y > ultimo && y > alto * 0.5);
      ultimo = y;
    };
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; window.requestAnimationFrame(pinta); }
    }, { passive: true });
    pinta();
  }

  /* ── Apariciones ────────────────────────────────────────────────── */
  /* Se observa el CONTENEDOR y se destapa a sus hijos con stagger por
     nth-child en el CSS: nunca un style="--i:3" en el HTML, que la CSP
     bloquea sin avisar. */
  var grupos = document.querySelectorAll(
    '.preg, .tags, .versiones, .mit__txt, .cifras, .mos, ' +
    '.evid__l, .donde__cols, .pasos, .cont__in, .dueno__cols'
  );
  Array.prototype.forEach.call(grupos, function (g) { g.classList.add('rev'); });

  if ('IntersectionObserver' in window) {
    var ob = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('rev--on'); ob.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    Array.prototype.forEach.call(document.querySelectorAll('.rev'), function (g) { ob.observe(g); });
    /* Seguro: a los 6 s todo visible aunque el observador se estropee. */
    setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.rev'), function (g) { g.classList.add('rev--on'); });
    }, 6000);
  } else {
    Array.prototype.forEach.call(document.querySelectorAll('.rev'), function (g) { g.classList.add('rev--on'); });
  }

  /* ── Escena: las etiquetas cuelgan ──────────────────────────────── */
  /* Se observa la .escena entera y no cada etiqueta: un elemento que
     empieza en opacity 0 dentro de un SVG igual mide, pero si algún día
     se cambia a scale(0) mediría cero y NUNCA dispararía el observador.
     Pasa una vez y queda quieta: sin reposo.
     Con reduced-motion quedan colgadas y visibles. */
  var escena = document.querySelector('.escena');
  if (escena) {
    if (reduce) {
      escena.classList.add('escena--va');
    } else if ('IntersectionObserver' in window) {
      var oe = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('escena--va'); oe.unobserve(e.target); }
        });
      }, { threshold: 0.2 });
      oe.observe(escena);
    } else {
      escena.classList.add('escena--va');
    }
  }

  /* ── Botón flotante de contacto ───────────────────────────────────
     El botón ya se ve por CSS. Acá sólo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA, no el botón: un elemento fixed nunca entra ni sale de la
     ventana, así que observarlo no dispararía jamás. ── */
  var flota = document.querySelector('.flota');
  var portF = document.querySelector('.port');
  if (flota && portF) {
    var mirarFlota = function () {
      var r = portF.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      flota.classList.toggle('flota--arriba', visible > r.height * 0.55);
    };
    mirarFlota();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { flota.classList.toggle('flota--arriba', e.intersectionRatio > 0.55); });
      }, { threshold: [0, 0.55, 1] }).observe(portF);
    } else {
      window.addEventListener('scroll', mirarFlota, { passive: true });
    }
  }

})();
