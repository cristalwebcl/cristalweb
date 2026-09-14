/* ═══════════════════════════════════════════════════════════════════
   Hostal Siete Colores — Melipeuco · demo 105 (tanda P3)

   1. Cancela el rescate de la clase .js.
   2. Cabecera fantasma.
   3. Formulario → WhatsApp con resumen en vivo (T5). SIN JS el enlace
      igual funciona: apunta al wa.me del camping sin texto armado.
   4. Reveals con IntersectionObserver y sus dos resguardos.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var cab     = document.getElementById('cab');
  var portada = document.getElementById('portada');
  var reduce  = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── 2 · cabecera fantasma ── */
  if (cab) {
    var ultimo = window.pageYOffset || 0, pedido = false;
    var UMBRAL = 120, MINIMO = 8;
    var pintar = function () {
      pedido = false;
      var y = window.pageYOffset || 0, delta = y - ultimo;
      var alto = portada ? portada.offsetHeight : 0;
      if (y < alto - 80) { cab.classList.add('cab--ghost'); }
      else               { cab.classList.remove('cab--ghost'); }
      if (Math.abs(delta) < MINIMO) { return; }
      if (y < UMBRAL) { cab.classList.remove('cab--oculta'); }
      else if (delta > 0 && !cab.contains(document.activeElement)) { cab.classList.add('cab--oculta'); }
      else if (delta < 0) { cab.classList.remove('cab--oculta'); }
      ultimo = y;
    };
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; window.requestAnimationFrame(pintar); }
    }, { passive: true });
    pintar();
  }

  /* ── 3 · el formulario arma el mensaje ── */
  var form    = document.getElementById('form-reserva');
  var resumen = document.getElementById('resumen');
  var enviar  = document.getElementById('enviar');

  if (form && resumen && enviar) {
    var armar = function () {
      var que   = form.elements.bano.value;
      var fecha = form.elements.fecha.value.trim();
      var gente = form.elements.cuantos.value.trim();

      var texto = 'Hola, quiero reservar en el hostal';
      if (fecha) { texto += ' ' + fecha; }
      if (gente) { texto += '. Somos ' + gente; }
      if (que !== 'Da lo mismo') { texto += '. Baño: ' + que.toLowerCase(); }
      texto += '. ¿Tienen disponibilidad?';

      resumen.textContent = texto;
      enviar.href = 'https://wa.me/56963972658?text=' + encodeURIComponent(texto);
    };
    form.addEventListener('input', armar);
    form.addEventListener('change', armar);
    armar();
  }

  /* ── 4 · reveals ── */
  var piezas = [].slice.call(document.querySelectorAll(
    '.portada__texto > *, .hostal__intro > *, .fila, .cocina__cuerpo > *, .reservar > *, .dueno__cols > div'
  ));
  if (!piezas.length) { return; }
  if (reduce.matches || !('IntersectionObserver' in window)) { return; }

  piezas.forEach(function (el, i) {
    el.classList.add('rev');
    el.style.transitionDelay = (Math.min(i % 5, 4) * 70) + 'ms';
  });

  var mostrar = function (el) { el.classList.add('on'); };
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
  setTimeout(function () { piezas.forEach(mostrar); }, 6000);
})();
