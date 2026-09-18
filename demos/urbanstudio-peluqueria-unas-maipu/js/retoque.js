/* UrbanStudio — el retoque.
   La lista está ESCRITA en el HTML y el total de minutos lo suman contadores de
   CSS: sin este archivo la pieza funciona entera. Esto sólo escribe los retoques
   elegidos en el mensaje de WhatsApp y dice el total en voz (aria-live).
   No guarda nada. Sin librerías. */
(function () {
  'use strict';
  var caja = document.querySelector('[data-retoques]');
  var boton = document.querySelector('[data-pedir]');
  var voz = document.querySelector('[data-suma-voz]');
  if (!caja || !boton) return;
  var base = 'https://wa.me/56949635027?text=';
  var casillas = caja.querySelectorAll('input[type="checkbox"]');

  function armar() {
    var nombres = [], total = 0;
    Array.prototype.forEach.call(casillas, function (c) {
      if (!c.checked) return;
      nombres.push(c.getAttribute('data-nombre'));
      total += parseInt(c.getAttribute('data-min'), 10) || 0;
    });
    var texto = nombres.length
      ? 'Hola. Quiero sólo un retoque, no una hora larga: ' + nombres.join(', ') + '. Calculo unos ' + total + ' minutos.'
      : 'Hola. Quiero sólo un retoque, no una hora larga.';
    boton.setAttribute('href', base + encodeURIComponent(texto));
    if (voz) voz.textContent = nombres.length ? 'Van ' + total + ' minutos de referencia.' : '';
  }
  Array.prototype.forEach.call(casillas, function (c) { c.addEventListener('change', armar); });
  armar();
})();
