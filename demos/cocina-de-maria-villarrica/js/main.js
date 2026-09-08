/* ═══════════════════════════════════════════════════════════════════
   Cocina de María · demo 137 (tanda P4)

   JS clásico, IIFE, sin librerías. Cuatro cosas:
   1. Cancela el temporizador de rescate de la clase .js.
   2. Cabecera fantasma (por defecto es sólida; acá se agrega la
      transparencia sobre la portada y el esconder al bajar).
   3. Reveals con IntersectionObserver y sus dos resguardos.
   4. T5 — la lista del cliente se arma en vivo y sale por wa.me.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* 1 · el rescate ya no hace falta: main.js llegó */
  clearTimeout(window.__rescate);

  var cab     = document.getElementById('cab');
  var portada = document.getElementById('portada');
  var reduce  = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ═══════════════════════════════════════════════════════════════
     2 · CABECERA FANTASMA
     Umbral de 120 px y deltas menores a 8 px ignorados, para que no
     tirite con el scroll fino del trackpad. Nunca se esconde si el
     foco del teclado está dentro de ella.
     ═══════════════════════════════════════════════════════════════ */
  if (cab) {
    var ultimo = window.pageYOffset || 0;
    var pedido = false;
    var UMBRAL = 120;
    var MINIMO = 8;

    var pintar = function () {
      pedido = false;
      var y = window.pageYOffset || 0;
      var delta = y - ultimo;

      var altoPortada = portada ? portada.offsetHeight : 0;
      if (y < altoPortada - 80) { cab.classList.add('cab--ghost'); }
      else                      { cab.classList.remove('cab--ghost'); }

      if (Math.abs(delta) < MINIMO) { return; }
      if (y < UMBRAL) {
        cab.classList.remove('cab--oculta');
      } else if (delta > 0 && !cab.contains(document.activeElement)) {
        cab.classList.add('cab--oculta');
      } else if (delta < 0) {
        cab.classList.remove('cab--oculta');
      }
      ultimo = y;
    };

    /* rAF sólo como throttle del scroll: permitido, es UI */
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; window.requestAnimationFrame(pintar); }
    }, { passive: true });

    pintar();
  }

  /* ═══════════════════════════════════════════════════════════════
     4 · EL PEDIDO (T5)
     El resumen se arma en vivo para que el cliente VEA el mensaje
     antes de mandarlo: sin eso, un botón de WhatsApp es una caja
     negra y la gente no lo aprieta. El destino queda apuntando al
     Instagram mientras no haya número confirmado — no se inventa uno.
     ═══════════════════════════════════════════════════════════════ */
  var elQue     = document.getElementById('f-personas');
  var elCuando  = document.getElementById('f-hora');
  var elResumen = document.getElementById('resumen');
  var elEnviar  = document.getElementById('enviar');
  var DESTINO   = elEnviar ? elEnviar.getAttribute('href') : '';

  if (elQue && elCuando && elResumen) {
    var armar = function () {
      var texto = 'Hola, quiero reservar una mesa para hoy.\n' +
                  'Cuántos: ' + (elQue.value.trim()    || '(sin escribir)') + '\n' +
                  'Hora: '    + (elCuando.value.trim() || '(sin escribir)');

      elResumen.textContent = texto;

      /* Cuando haya número confirmado basta poner el wa.me en el href
         del HTML: este mismo código le cuelga el texto armado. */
      if (elEnviar && DESTINO.indexOf('wa.me') !== -1) {
        elEnviar.href = DESTINO.split('?')[0] + '?text=' + encodeURIComponent(texto);
      }
    };

    elQue.addEventListener('input', armar);
    elCuando.addEventListener('input', armar);
    armar();
  }

  /* ═══════════════════════════════════════════════════════════════
     3 · REVEALS
     La clase .rev se agrega desde acá, nunca en el HTML: así, con el
     JS caído, no hay nada oculto que rescatar.
     ═══════════════════════════════════════════════════════════════ */
  var piezas = [].slice.call(document.querySelectorAll(
    '.portada__texto > *, .pizarra__marco > *, .carta__cabecera > *, .grupo, ' +
    '.casera__cuerpo > *, .reservar > *, .dueno__cols > div'
  ));

  if (!piezas.length) { return; }

  if (reduce.matches || !('IntersectionObserver' in window)) {
    return; /* sin animación: la página ya se ve entera */
  }

  piezas.forEach(function (el, i) {
    el.classList.add('rev');
    el.style.transitionDelay = (Math.min(i % 5, 4) * 70) + 'ms';
  });

  var mostrar = function (el) { el.classList.add('on'); };

  /* Resguardo 1 · lo que ya se ve al cargar se muestra de inmediato */
  var alto = window.innerHeight || 800;
  piezas.forEach(function (el) {
    if (el.getBoundingClientRect().top < alto * 0.92) { mostrar(el); }
  });

  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) { mostrar(e.target); obs.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  piezas.forEach(function (el) { obs.observe(el); });

  /* Resguardo 2 · barrido a los 6 s por si el observer nunca dispara */
  setTimeout(function () { piezas.forEach(mostrar); }, 6000);
})();
