/* Mall Chino Centro Hogar — main.js
   IIFE, JS clásico, sin librerías, sin type="module" (rompe en file://).
   Hace cuatro cosas: cancelar el rescate, la cabecera fantasma, las
   apariciones al scrollear, el estante que se llena y el buscador del
   plano.

   Nada del contenido depende de este archivo: las siete secciones y lo
   que hay en cada una están escritas en el HTML. Si el script no carga,
   el buscador ni siquiera aparece (lo esconde el CSS) y queda la lista
   completa, que es la información de verdad. */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    '.ancho > .rotulo, .ancho > .titulo, .cifras__grid, .zonas, .temporada__grid, ' +
    '.mitades__texto, .pasos, .mos__grilla, .dueno__cols, .datos'
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

  /* ── Escena: el estante se llena ────────────────────────────────── */
  /* Se observa la .escena entera y no cada producto: un producto con
     scale(0) mide cero y un elemento de área cero NUNCA dispara el
     IntersectionObserver — se quedaría invisible para siempre. */
  var escena = document.querySelector('.escena');
  if (escena) {
    if (reduce) {
      escena.classList.add('escena--va');
    } else if ('IntersectionObserver' in window) {
      var oe = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('escena--va'); oe.unobserve(e.target); }
        });
      }, { threshold: 0.25 });
      oe.observe(escena);
    } else {
      escena.classList.add('escena--va');
    }
  }

  /* ── El buscador del plano ──────────────────────────────────────── */
  /* Honesto: no consulta ningún inventario ni pregunta nada a un
     servidor. Compara lo que se escribe contra la lista de palabras que
     ya está ESCRITA EN EL HTML (data-busca de cada zona) y enciende el
     pasillo que corresponde. Por eso puede prometer poco y cumplirlo. */
  var campo = document.getElementById('q');
  var aviso = document.getElementById('buscar-r');
  var zonas = document.querySelectorAll('.zona');
  var planoZ = document.querySelectorAll('.pl-z');

  if (campo && zonas.length) {
    var normaliza = function (t) {
      t = String(t).toLowerCase();
      /* Sin tildes: nadie escribe "jardín" con tilde en un buscador. */
      return t.replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
              .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u');
    };

    var limpiar = function () {
      Array.prototype.forEach.call(zonas, function (z) { z.classList.remove('zona--on', 'zona--off'); });
      Array.prototype.forEach.call(planoZ, function (p) { p.classList.remove('pl-z--on', 'pl-z--off'); });
      if (aviso) { aviso.textContent = ''; }
    };

    var buscar = function () {
      var t = normaliza(campo.value).trim();
      if (t.length < 2) { limpiar(); return; }

      var hallados = [];
      Array.prototype.forEach.call(zonas, function (z) {
        var bolsa = normaliza((z.getAttribute('data-busca') || '') + ' ' + z.textContent);
        if (bolsa.indexOf(t) >= 0) { hallados.push(z.getAttribute('data-zona')); }
      });

      Array.prototype.forEach.call(zonas, function (z) {
        var on = hallados.indexOf(z.getAttribute('data-zona')) >= 0;
        z.classList.toggle('zona--on', on);
        z.classList.toggle('zona--off', hallados.length > 0 && !on);
      });
      Array.prototype.forEach.call(planoZ, function (p) {
        var on = hallados.indexOf(p.getAttribute('data-zona')) >= 0;
        p.classList.toggle('pl-z--on', on);
        p.classList.toggle('pl-z--off', hallados.length > 0 && !on);
      });

      if (!aviso) { return; }
      if (!hallados.length) {
        aviso.textContent = 'No está en esta lista de ejemplo. Conviene preguntarlo por WhatsApp.';
      } else if (hallados.length === 1) {
        aviso.textContent = 'Debería estar en 1 sección.';
      } else {
        aviso.textContent = 'Debería estar en ' + hallados.length + ' secciones.';
      }
    };

    campo.addEventListener('input', buscar);
    campo.addEventListener('search', buscar);
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
