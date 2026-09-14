/* Caracol Ñuñoa Centro — main.js
   IIFE, JS clásico, sin librerías, sin type="module" (rompe en file://).
   Hace cinco cosas: cancelar el rescate, la cabecera fantasma, las
   apariciones al scrollear, la rampa que sube encendiendo los pisos y la
   sincronía entre la lista de niveles y el corte del edificio.

   Nada del contenido depende de este archivo. Los cuatro niveles, los
   rubros, el horario y la dirección están escritos en el HTML: con
   main.js renombrado la página se lee entera y el corte se ve completo.
   Lo único que se pierde es el subrayado del nivel al pasar el cursor,
   que es decoración y no promete nada. */
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
    '.ancho > .rotulo, .ancho > .titulo, .cifras__grid, .niveles, .horario__grid, ' +
    '.mitades__texto, .pasos, .mos__grilla, .dueno__cols, .contacto__cols, .datos--anchos'
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

  /* ── Escena: la rampa sube y se encienden los cuatro pisos ──────── */
  /* Se observa la .escena entera y nunca los letreros: un rect con
     opacity 0 sigue midiendo, pero el trazo con dashoffset completo
     tiene área CERO mientras no se dibuja, y un elemento de área cero no
     dispara jamás el IntersectionObserver — la escena se quedaría
     invisible para siempre. */
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

  /* ── La lista de niveles y el corte, sincronizados ──────────────── */
  /* Honesto: no consulta ningún directorio ni sabe qué locales hay. Lo
     único que hace es subrayar en el dibujo el mismo nivel que el cursor
     está leyendo en la lista, emparejando por data-piso. Sin JS el corte
     se ve completo y la lista está entera: no se pierde información. */
  var lista = document.querySelector('.niveles');
  var bandas = document.querySelectorAll('.cx-nivel');

  if (lista && bandas.length) {
    var marcar = function (piso) {
      Array.prototype.forEach.call(document.querySelectorAll('.nivel'), function (n) {
        n.classList.toggle('nivel--on', piso !== null && n.getAttribute('data-piso') === piso);
      });
      Array.prototype.forEach.call(bandas, function (b) {
        var es = piso !== null && b.getAttribute('data-piso') === piso;
        b.classList.toggle('cx-nivel--on', es);
        b.classList.toggle('cx-nivel--off', piso !== null && !es);
      });
    };

    var desde = function (destino) {
      var n = destino;
      while (n && n !== lista) {
        if (n.classList && n.classList.contains('nivel')) { return n.getAttribute('data-piso'); }
        n = n.parentNode;
      }
      return null;
    };

    lista.addEventListener('mouseover', function (e) { marcar(desde(e.target)); });
    lista.addEventListener('mouseleave', function () { marcar(null); });
    /* En pantalla táctil no hay cursor: un toque enciende el nivel y el
       siguiente toque en otro lo cambia. No navega a ninguna parte. */
    lista.addEventListener('click', function (e) { marcar(desde(e.target)); });
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
