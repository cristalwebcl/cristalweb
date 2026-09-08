/* ══════════════════════════════════════════════════════════════════
   SENTIERO · Villarrica — demo 140
   JS clasico, un IIFE, sin dependencias. Todo lo que hace es opcional:
   si este archivo no llega, rescate.js quita la clase .js a los 4 s y
   la pagina se lee entera igual.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Llegamos: el temporizador de rescate ya no hace falta. */
  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · Cabecera fantasma ──
     Arranca solida (asi esta en el CSS) y se vuelve translucida al
     bajar. Al reves de como suele hacerse a proposito: si el JS falla,
     lo que queda es la version legible. */
  var cab = document.getElementById('cab');
  if (cab) {
    var flotando = false;
    var mirar = function () {
      var abajo = window.pageYOffset > 40;
      if (abajo !== flotando) {
        flotando = abajo;
        cab.classList.toggle('cab--flota', abajo);
      }
    };
    window.addEventListener('scroll', mirar, { passive: true });
    mirar();
  }

  /* ── 2 · Apariciones al entrar en pantalla ──
     Dos resguardos obligatorios: lo que ya se ve al cargar aparece de
     inmediato, y a los 6 s se destapa todo lo que quede. */
  var piezas = [];
  ['.cap__cuerpo', '.cap__n', '.portada__texto', '.dueno__cols'].forEach(function (sel) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
      piezas.push(el);
    });
  });

  piezas.forEach(function (el) { el.classList.add('rev'); });

  var destapar = function (el) { el.classList.add('ok'); };

  if (!('IntersectionObserver' in window) || reduce) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { destapar(e.target); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    piezas.forEach(function (el) {
      /* Resguardo 1: si ya esta a la vista, no se espera al observador. */
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { obs.observe(el); }
    });

    /* Resguardo 2: pase lo que pase, a los 6 s no queda nada oculto. */
    setTimeout(function () { piezas.forEach(destapar); }, 6000);
  }

  /* ── 3 · La reserva (T5) ──
     El mensaje se arma mientras se escribe. No hay numero publicado, asi
     que el boton no lleva a WhatsApp: muestra lo que enviaria. Cuando el
     local de el numero, se cambia UNA linea —la de abajo— y funciona. */
  var NUMERO = '';   /* falta: el numero del local, formato 56912345678 */

  var form = document.getElementById('form-mesa');
  if (form) {
    var cuando   = document.getElementById('f-cuando');
    var personas = document.getElementById('f-personas');
    var ocasion  = document.getElementById('f-ocasion');
    var resumen  = document.getElementById('resumen');
    var enviar   = document.getElementById('enviar');

    var armar = function () {
      var c = (cuando   && cuando.value   || '').trim();
      var p = (personas && personas.value || '').trim();
      var o = (ocasion  && ocasion.value  || '').trim();

      if (!c && !p && !o) {
        return 'El mensaje se arma acá abajo a medida que escribe.';
      }

      var t = 'Hola, quisiera reservar una mesa';
      if (p) { t += ' para ' + p + (p === '1' ? ' persona' : ' personas'); }
      if (c) { t += ' el ' + c; }
      t += '.';
      if (o) { t += ' Es por ' + o + '.'; }
      if (!p || !c) { t += ' (Falta indicar ' + (!p ? 'cuántos son' : '') +
                            (!p && !c ? ' y ' : '') +
                            (!c ? 'el día y la hora' : '') + '.)'; }
      return t;
    };

    var refrescar = function () {
      var texto = armar();
      if (resumen) { resumen.textContent = texto; }
      if (enviar && NUMERO) {
        enviar.setAttribute('href',
          'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(texto));
      }
    };

    [cuando, personas, ocasion].forEach(function (i) {
      if (i) { i.addEventListener('input', refrescar); }
    });
    refrescar();

    /* Sin numero el boton no puede enviar: se dice, no se finge. */
    if (enviar && !NUMERO) {
      enviar.addEventListener('click', function (ev) {
        ev.preventDefault();
        if (resumen) { resumen.focus && resumen.focus(); }
      });
    }

    form.addEventListener('submit', function (ev) { ev.preventDefault(); });
  }

})();
