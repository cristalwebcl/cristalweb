/* Veterinaria Concha y Toro — main.js
   IIFE, JS clásico, sin librerías, sin type="module" (rompe en file://).
   Hace cuatro cosas: cancelar el rescate, la cabecera fantasma, las
   apariciones al scrollear, el latido de la portada y el formulario que
   arma el WhatsApp.

   El formulario NO reserva nada y no habla con ningún servidor: junta lo
   que se escribió y abre WhatsApp con el mensaje listo. Por eso su botón
   sólo existe cuando este archivo cargó (lo esconde el CSS): los dos
   enlaces de al lado —la agenda en línea de la clínica y el WhatsApp
   directo— funcionan siempre, con o sin JavaScript. */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FONO = '56986284955';

  /* ── Cabecera fantasma ──────────────────────────────────────────── */
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

  /* ── Apariciones ────────────────────────────────────────────────── */
  /* Se observa el CONTENEDOR y se destapa a sus hijos con stagger por
     nth-child en el CSS: nunca un style="--i:3" en el HTML, que la CSP
     bloquea sin avisar. */
  var grupos = document.querySelectorAll(
    '.ancho > .rotulo, .ancho > .titulo, .cifras__grid, .hora__cols, .serv__grid, ' +
    '.mitades__texto, .equipo__huecos, .urg__l, .mos__grilla, .dueno__cols, .datos'
  );
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

  /* ── Escena: el latido ──────────────────────────────────────────── */
  /* Primero se dibuja el trazo (1,3 s) y recién ahí empieza el reposo,
     que es el único bucle del sitio. Con menos movimiento no se pone
     ninguna de las dos clases y la línea queda completa y quieta. */
  var escena = document.querySelector('.escena');
  if (escena && !reduce) {
    var arranca = function () {
      escena.classList.add('escena--va');
      setTimeout(function () { escena.classList.add('escena--reposa'); }, 1600);
    };
    if ('IntersectionObserver' in window) {
      var oe = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { oe.unobserve(e.target); arranca(); }
        });
      }, { threshold: 0.25 });
      oe.observe(escena);
    } else {
      arranca();
    }
  }

  /* ── El formulario que arma el WhatsApp ─────────────────────────── */
  var form = document.getElementById('pedir');
  if (form) {
    form.addEventListener('submit', function (e) {
      /* Nunca se envía: la CSP permite form-action 'self', pero acá no
         hay nada al otro lado. Se corta el envío y se abre WhatsApp. */
      e.preventDefault();

      var val = function (id) {
        var el = document.getElementById(id);
        return el ? String(el.value || '').trim() : '';
      };
      var nombre = val('f-nombre');
      var motivo = val('f-motivo');
      var dia = val('f-dia');
      var bloque = val('f-bloque');

      var t = 'Hola, quiero pedir hora.';
      if (nombre) { t += ' Es para ' + nombre + '.'; }
      if (motivo) { t += ' Necesita ' + motivo + '.'; }
      if (dia) { t += ' Me acomoda ' + dia; }
      if (bloque) { t += ', en el bloque de ' + bloque; }
      t += '. ¿Tienen disponible?';

      window.open('https://wa.me/' + FONO + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
    });
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