/* Croma — la foto que traes.
   Los cinco criterios están ESCRITOS en el HTML y se leen sin este archivo.
   Esto agrega a cada uno un par de botones «sí / no» y escribe el veredicto:
   si los cinco están en «sí», la foto sirve; si no, dice qué le falta. No
   sube fotos, no consulta nada y no promete ningún resultado. */
(function () {
  'use strict';
  var lista = document.querySelector('[data-criterios]');
  var caja = document.querySelector('[data-veredicto]');
  if (!lista || !caja) return;
  var vista = caja.querySelector('.veredicto__vista');
  var items = Array.prototype.slice.call(lista.querySelectorAll('.criterio'));
  var estado = items.map(function () { return null; });

  function escribir() {
    var faltan = [];
    var sinResponder = 0;
    items.forEach(function (it, i) {
      if (estado[i] === null) sinResponder++;
      else if (estado[i] === false) faltan.push(it.getAttribute('data-falta'));
    });
    if (sinResponder === items.length) { vista.textContent = 'Responde los cinco y te decimos si sirve.'; return; }
    if (faltan.length === 0 && sinResponder === 0) { vista.textContent = 'Sirve. Mándala junto a una foto tuya de hoy, con la misma luz.'; return; }
    if (faltan.length === 0) { vista.textContent = 'Va bien. Faltan ' + sinResponder + ' por responder.'; return; }
    vista.textContent = 'Mejor otra: ' + faltan.join('; ') + '.';
  }

  items.forEach(function (it, i) {
    var par = document.createElement('div');
    par.className = 'criterio__sn';
    ['Sí', 'No'].forEach(function (txt, k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = txt;
      if (k === 1) b.className = 'no';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        estado[i] = (k === 0);
        Array.prototype.forEach.call(par.children, function (x, j) { x.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
        escribir();
      });
      par.appendChild(b);
    });
    it.appendChild(par);
  });
  escribir();
})();
