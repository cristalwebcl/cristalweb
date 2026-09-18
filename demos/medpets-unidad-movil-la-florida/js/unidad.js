/* Medpets — lo que cabe en la unidad.
   Las dos columnas están ESCRITAS en el HTML y se leen sin este archivo.
   Esto agrega las fichas de «¿qué necesita tu mascota?»: al elegir una se
   ilumina la fila que corresponde en su columna y una frase dice dónde se
   hace. No arma mensajes, no consulta nada, no nombra medicamentos. */
(function () {
  'use strict';
  var lista = document.querySelector('[data-necesita]');
  var resp = document.querySelector('[data-respuesta]');
  var filas = document.querySelectorAll('[data-lados] li[data-clave]');
  if (!lista || !resp || !filas.length) return;
  var botones = [];

  function elegir(clave, boton) {
    botones.forEach(function (b) { b.setAttribute('aria-pressed', b === boton ? 'true' : 'false'); });
    var donde = '';
    Array.prototype.forEach.call(filas, function (li) {
      var es = li.getAttribute('data-clave') === clave;
      li.classList.toggle('lado__si', es);
      if (es) donde = li.closest('.lado').getAttribute('data-donde');
    });
    resp.textContent = donde === 'unidad'
      ? 'Se hace en tu casa, en la unidad.'
      : 'Eso se deriva a clínica: igual te orientan por WhatsApp.';
    resp.hidden = false;
  }

  Array.prototype.forEach.call(filas, function (li) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.textContent = li.getAttribute('data-nombre') || li.textContent;
    b.addEventListener('click', function () { elegir(li.getAttribute('data-clave'), b); });
    var item = document.createElement('li');
    item.appendChild(b);
    lista.appendChild(item);
    botones.push(b);
  });
})();
