/* 191 · Salón Guapas — main.js
   IIFE, JS clásico, sin librerías, sin type="module" (rompe en file://).
   Cuatro cosas: cancelar el rescate, revelar grupos, el header fantasma
   y la ficha que arma el mensaje. El ambiente de destellos de la portada
   NO pasa por acá: es CSS puro y funciona aunque este archivo no cargue. */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  /* ── Reveals ──────────────────────────────────────────────────────
     El observer va sobre el CONTENEDOR, nunca sobre los hijos: un hijo
     con clip-path a área cero jamás dispara IntersectionObserver, y
     además el contenedor es lo que permite el stagger con --r. */
  var grupos = document.querySelectorAll('[data-rev-grupo]');
  function mostrar(el) { el.classList.add('ok'); }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entradas) {
      for (var i = 0; i < entradas.length; i++) {
        if (entradas[i].isIntersecting) {
          mostrar(entradas[i].target);
          io.unobserve(entradas[i].target);
        }
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    for (var g = 0; g < grupos.length; g++) {
      var r = grupos[g].getBoundingClientRect();
      if (r.top < window.innerHeight) { mostrar(grupos[g]); }
      else { io.observe(grupos[g]); }
    }
  } else {
    for (var k = 0; k < grupos.length; k++) { mostrar(grupos[k]); }
  }

  setTimeout(function () {
    for (var j = 0; j < grupos.length; j++) { mostrar(grupos[j]); }
  }, 6000);

  /* ── Header fantasma ─────────────────────────────────────────────
     Estado por defecto (sin JS) = sólido legible. Umbral 120 px,
     deltas < 8 px ignorados, jamás se esconde con el foco dentro. */
  var cab = document.getElementById('cab');
  if (cab) {
    var ultimo = window.pageYOffset || 0;
    var pedido = false;

    function pinta() {
      pedido = false;
      var y = window.pageYOffset || 0;
      var delta = y - ultimo;
      if (y <= 8) {
        cab.classList.add('cab--top');
        cab.classList.remove('cab--oculta');
      } else {
        cab.classList.remove('cab--top');
        if (Math.abs(delta) >= 8 && y > 120 && !cab.contains(document.activeElement)) {
          if (delta > 0) { cab.classList.add('cab--oculta'); }
          else { cab.classList.remove('cab--oculta'); }
        }
      }
      ultimo = y;
    }

    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; window.requestAnimationFrame(pinta); }
    }, { passive: true });

    pinta();
  }

  /* ── La ficha que arma el mensaje ────────────────────────────────
     No envía nada a ninguna parte y no guarda nada: arma el texto en el
     propio teléfono y lo copia. El número de la ficha de Google no está
     confirmado como WhatsApp, así que la página no promete un envío que
     podría fallar. */
  var form = document.getElementById('ficha-hora');
  var salida = document.getElementById('resumen-txt');
  var btn = document.getElementById('btn-copiar');

  function valor(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }

  function armar() {
    var nombre = valor('f-nombre');
    var lineas = [];
    lineas.push('Hola' + (nombre ? ', soy ' + nombre : '') + '. Quiero pedir hora.');
    lineas.push('');
    lineas.push('Servicio: ' + valor('f-servicio'));
    lineas.push('Largo: ' + valor('f-largo'));
    lineas.push('Color previo: ' + valor('f-previo'));
    lineas.push('Cuando me acomoda: ' + valor('f-cuando'));
    var extra = valor('f-extra');
    if (extra) { lineas.push('Ademas: ' + extra); }
    lineas.push('');
    lineas.push('Gracias.');
    salida.textContent = lineas.join('\n');
  }

  if (form && salida) {
    form.addEventListener('input', armar);
    form.addEventListener('change', armar);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    armar();
  }

  if (btn && salida) {
    btn.addEventListener('click', function () {
      var antes = btn.textContent;

      function avisar() {
        btn.textContent = btn.getAttribute('data-copiado') || 'Copiado';
        setTimeout(function () { btn.textContent = antes; }, 2000);
      }

      function seleccionar() {
        // Sin API de portapapeles: se deja seleccionado para copiar a mano
        var r = document.createRange();
        r.selectNodeContents(salida);
        var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(salida.textContent).then(avisar, seleccionar);
      } else {
        seleccionar();
      }
    });
  }
})();
