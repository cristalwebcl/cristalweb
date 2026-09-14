/* Calculadora de «Cuánto lleva tu obra». Las cantidades por m² son las mismas de la tabla escrita en el HTML:
   si este archivo no carga, la tabla se lee igual y la calculadora queda oculta. Referencias de ejemplo. */
(function () {
  'use strict';
  var caja = document.querySelector('[data-calc]');
  if (!caja) return;
  var trabajo = document.getElementById('calc-t');
  var metros = document.getElementById('calc-m');
  var salida = document.getElementById('calc-o');
  if (!trabajo || !metros || !salida) return;

  var POR_M2 = {
    radier: [['saco', 'sacos de cemento', 1.3], ['m3', 'm³ de arena', 0.05], ['m3', 'm³ de ripio', 0.08]],
    muro:   [['saco', 'sacos de cemento', 0.4], ['m3', 'm³ de arena', 0.03], ['un', 'ladrillos', 36]],
    estuco: [['saco', 'sacos de cemento', 0.3], ['m3', 'm³ de arena', 0.02]]
  };

  function calcular() {
    var n = parseFloat(String(metros.value).replace(',', '.'));
    if (!(n > 0)) { salida.textContent = 'Escribe cuántos metros cuadrados.'; return; }
    var filas = POR_M2[trabajo.value] || [];
    salida.textContent = filas.map(function (f) {
      var v = f[2] * n;
      var texto = f[0] === 'm3' ? (Math.ceil(v * 10) / 10).toFixed(1).replace('.', ',') : String(Math.ceil(v));
      return texto + ' ' + f[1];
    }).join(' · ');
  }

  caja.hidden = false;
  trabajo.addEventListener('change', calcular);
  metros.addEventListener('input', calcular);
  calcular();
})();
