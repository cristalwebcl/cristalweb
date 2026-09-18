/* Veterinaria Animalitos — cómo traer al gato.
   Los cinco pasos están escritos en el HTML: sin este archivo se leen
   igual. Esto agrega un botón «Listo» a cada paso, cuenta cuántos van y,
   al completar los cinco, destaca el bloque de «avísanos que vienes con
   gato». No guarda nada. Sin librerías, sin módulos. */
(function () {
  'use strict';
  var lista = document.querySelector('[data-pasos-gato]');
  var cuenta = document.querySelector('[data-cuenta-gato]');
  var aviso = document.querySelector('[data-aviso-gato]');
  if (!lista || !cuenta || !aviso) return;
  var pasos = Array.prototype.slice.call(lista.querySelectorAll('.paso-g'));
  var total = pasos.length;
  var hechos = 0;

  function pintar() {
    if (hechos === 0) cuenta.textContent = 'Marca cada paso cuando lo tengas.';
    else if (hechos < total) cuenta.textContent = hechos + ' de ' + total + ' listos.';
    else cuenta.textContent = 'Los ' + total + ' listos: ahora avísanos.';
    aviso.classList.toggle('aviso-gato--listo', hechos === total);
  }

  pasos.forEach(function (li) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'paso-g__listo';
    b.setAttribute('aria-pressed', 'false');
    b.textContent = 'Listo';
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? 'Hecho' : 'Listo';
      li.classList.toggle('paso-g--listo', on);
      hechos += on ? 1 : -1;
      pintar();
    });
    li.appendChild(b);
  });

  cuenta.hidden = false;
  pintar();
})();
