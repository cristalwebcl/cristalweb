/* Lunita — la perilla de etapas.
   Las tres etapas están ESCRITAS en el HTML y se leen sin este archivo.
   Esto agrega una perilla de tres paradas (cachorro, adulto, senior) que enciende
   una tarjeta y atenúa las otras. No pregunta edades ni calcula nada: la etapa la
   confirma el veterinario. No guarda nada. Sin librerías. */
(function () {
  'use strict';
  var caja = document.querySelector('[data-perilla]');
  var etapas = document.querySelectorAll('[data-etapa]');
  if (!caja || etapas.length !== 3) return;

  var rotulo = document.createElement('label');
  rotulo.setAttribute('for', 'perilla-etapa');
  rotulo.textContent = '¿En qué etapa está?';
  var perilla = document.createElement('input');
  perilla.type = 'range'; perilla.id = 'perilla-etapa';
  perilla.min = '1'; perilla.max = '3'; perilla.step = '1'; perilla.value = '2';
  var marcas = document.createElement('ul');
  marcas.className = 'perilla__marcas'; marcas.setAttribute('aria-hidden', 'true');
  var nombres = [];
  Array.prototype.forEach.call(etapas, function (e) {
    var n = e.querySelector('b').textContent; nombres.push(n);
    var li = document.createElement('li'); li.textContent = n; marcas.appendChild(li);
  });
  caja.appendChild(rotulo); caja.appendChild(perilla); caja.appendChild(marcas);

  function elegir() {
    var v = parseInt(perilla.value, 10);
    Array.prototype.forEach.call(etapas, function (e, i) {
      var es = (i + 1) === v;
      e.classList.toggle('etapa--elegida', es);
      e.classList.toggle('etapa--fuera', !es);
    });
    perilla.setAttribute('aria-valuetext', nombres[v - 1]);
  }
  perilla.addEventListener('input', elegir);
  perilla.addEventListener('change', elegir);
  elegir();
})();
