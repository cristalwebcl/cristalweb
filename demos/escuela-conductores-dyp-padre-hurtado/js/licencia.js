/* Escuela de Conductores DyP — ¿qué licencia?
   Las tres licencias están escritas en el HTML: sin este archivo se leen
   igual. Esto agrega la pregunta «¿qué vas a manejar?» y marca la tarjeta
   que corresponde. No guarda nada. Sin librerías, sin módulos. */
(function () {
  'use strict';
  var caja = document.querySelector('[data-que-manejas]');
  var tarjetas = Array.prototype.slice.call(document.querySelectorAll('.licencia[data-para]'));
  if (!caja || !tarjetas.length) return;

  var OPCIONES = [['auto', 'Un auto'], ['moto', 'Una moto'], ['trabajo', 'Para trabajar']];
  var botones = [];

  var t = document.createElement('span');
  t.className = 'que-manejas__t';
  t.textContent = '¿Qué vas a manejar?';
  caja.appendChild(t);

  function elegir(clave) {
    botones.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-clave') === clave ? 'true' : 'false');
    });
    tarjetas.forEach(function (li) {
      li.classList.toggle('licencia--elegida', li.getAttribute('data-para') === clave);
    });
  }

  OPCIONES.forEach(function (o) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'que-manejas__b';
    b.setAttribute('data-clave', o[0]);
    b.setAttribute('aria-pressed', 'false');
    b.textContent = o[1];
    b.addEventListener('click', function () {
      var ya = b.getAttribute('aria-pressed') === 'true';
      elegir(ya ? '' : o[0]);
    });
    botones.push(b);
    caja.appendChild(b);
  });

  caja.hidden = false;
})();
