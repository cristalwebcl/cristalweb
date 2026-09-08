/* ══════════════════════════════════════════════════════════════════
   FORTIN MAPUCHE · Pucura — demo 144
   JS clasico, un IIFE, sin dependencias.

   OJO: los fondos de las cuatro laminas son CSS puro y no dependen
   de este archivo. Si main.js no llega, las laminas se ven completas
   con su fuego, su camino y sus tablones.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · Cabecera fantasma ── */
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

  /* ── 2 · Apariciones al entrar en pantalla ── */
  var piezas = [];
  ['.lamina__texto', '.dueno__cols']
    .forEach(function (sel) {
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
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { obs.observe(el); }
    });
    setTimeout(function () { piezas.forEach(destapar); }, 6000);
  }

  /* ── 3 · La reserva (T5) ──
     Cuando el local de el numero, se cambia UNA linea: la de abajo. */
  var NUMERO = '';   /* falta: el numero del local, formato 56912345678 */

  var form = document.getElementById('form-mesa');
  if (form) {
    var cuando   = document.getElementById('f-cuando');
    var personas = document.getElementById('f-personas');
    var nota     = document.getElementById('f-nota');
    var resumen  = document.getElementById('resumen');
    var enviar   = document.getElementById('enviar');

    var armar = function () {
      var c = (cuando   && cuando.value   || '').trim();
      var p = (personas && personas.value || '').trim();
      var v = (nota     && nota.value     || '').trim();

      if (!c && !p && !v) {
        return 'El mensaje se arma acá abajo a medida que escribe.';
      }

      var t = 'Hola, quisiera reservar una mesa';
      if (p) { t += ' para ' + p + (p === '1' ? ' persona' : ' personas'); }
      if (c) { t += ' el ' + c; }
      t += '.';
      if (v) { t += ' ' + v + '.'; }
      if (!p || !c) {
        t += ' (Falta indicar ' + (!p ? 'cuántos son' : '') +
             (!p && !c ? ' y ' : '') +
             (!c ? 'el día y la hora' : '') + '.)';
      }
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

    [cuando, personas, nota].forEach(function (i) {
      if (i) { i.addEventListener('input', refrescar); }
    });
    refrescar();

    if (enviar && !NUMERO) {
      enviar.addEventListener('click', function (ev) { ev.preventDefault(); });
    }
    form.addEventListener('submit', function (ev) { ev.preventDefault(); });
  }

})();
