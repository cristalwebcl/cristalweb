/* Instituto de Ortodoncia — ¿a qué edad?
   Las tres etapas están escritas en el HTML: sin este archivo se leen
   igual. Esto agrega un deslizador de edad que marca la etapa que
   corresponde (niños, adolescentes, adultos). No diagnostica ni guarda
   nada. Sin librerías, sin módulos. */
(function () {
  'use strict';
  var caja = document.querySelector('[data-edad-sel]');
  var etapas = Array.prototype.slice.call(document.querySelectorAll('.etapa[data-desde]'));
  if (!caja || !etapas.length) return;

  var label = document.createElement('label');
  label.setAttribute('for', 'edad-rango');
  label.textContent = '¿Qué edad tiene quien necesita la hora?';
  var fila = document.createElement('div');
  fila.className = 'edad-sel__fila';
  var rango = document.createElement('input');
  rango.type = 'range';
  rango.id = 'edad-rango';
  rango.min = '4';
  rango.max = '70';
  rango.step = '1';
  rango.value = '9';
  var salida = document.createElement('output');
  salida.setAttribute('for', 'edad-rango');
  fila.appendChild(rango);
  fila.appendChild(salida);
  caja.appendChild(label);
  caja.appendChild(fila);

  function pintar() {
    var e = parseInt(rango.value, 10);
    salida.textContent = e + (e === 70 ? '+ años' : ' años');
    rango.setAttribute('aria-valuetext', salida.textContent);
    etapas.forEach(function (li) {
      var d = parseInt(li.getAttribute('data-desde'), 10);
      var h = parseInt(li.getAttribute('data-hasta'), 10);
      li.classList.toggle('etapa--elegida', e >= d && e <= h);
    });
  }

  rango.addEventListener('input', pintar);
  caja.hidden = false;
  pintar();
})();
