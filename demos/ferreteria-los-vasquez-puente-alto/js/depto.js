/* Ferretería Los Vásquez — la lista para el mesón.
   Los seis arreglos y lo que lleva cada uno están escritos en el HTML: sin
   este archivo se leen igual. Esto agrega un botón «Sumar a la lista» a
   cada arreglo, junta lo que se lleva (sin repetir) en el bloque de
   mostaza y deja copiarlo. Sin librerías, sin módulos. */
(function () {
  'use strict';
  var bolsa = document.querySelector('[data-bolsa]');
  var arreglos = Array.prototype.slice.call(document.querySelectorAll('.arreglo[data-arreglo]'));
  if (!bolsa || !arreglos.length) return;

  var lista = bolsa.querySelector('.bolsa__lista');
  var vacia = bolsa.querySelector('.bolsa__vacia');
  var copiar = bolsa.querySelector('[data-copiar]');
  var aviso = bolsa.querySelector('.bolsa__aviso');
  var sumados = {};

  function cosas(li) {
    return Array.prototype.map.call(li.querySelectorAll('.arreglo__lleva li'), function (x) {
      return x.textContent.replace(/\s+/g, ' ').trim();
    });
  }

  function pintar() {
    var vistas = {}, orden = [];
    arreglos.forEach(function (li) {
      if (!sumados[li.getAttribute('data-arreglo')]) return;
      cosas(li).forEach(function (c) {
        var k = c.toLowerCase();
        if (!vistas[k]) { vistas[k] = true; orden.push(c); }
      });
    });
    while (lista.firstChild) lista.removeChild(lista.firstChild);
    orden.forEach(function (c) {
      var li = document.createElement('li');
      li.textContent = c;
      lista.appendChild(li);
    });
    lista.hidden = orden.length === 0;
    vacia.hidden = orden.length > 0;
    copiar.disabled = orden.length === 0;
    aviso.textContent = '';
    return orden;
  }

  arreglos.forEach(function (li) {
    var id = li.getAttribute('data-arreglo');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'arreglo__sumar';
    b.setAttribute('aria-pressed', 'false');
    b.textContent = 'Sumar a la lista';
    b.addEventListener('click', function () {
      sumados[id] = !sumados[id];
      b.setAttribute('aria-pressed', sumados[id] ? 'true' : 'false');
      b.textContent = sumados[id] ? 'En la lista' : 'Sumar a la lista';
      li.classList.toggle('arreglo--sumado', !!sumados[id]);
      pintar();
    });
    li.appendChild(b);
  });

  copiar.addEventListener('click', function () {
    var orden = pintar();
    if (!orden.length) return;
    var texto = 'Para llevar a Ferretería Los Vásquez:\n- ' + orden.join('\n- ');
    function listo() { aviso.textContent = 'Copiada. Pégala en tus notas o en un mensaje.'; }
    function aMano() {
      var ta = document.createElement('textarea');
      ta.value = texto;
      ta.setAttribute('readonly', '');
      ta.className = 'fuera-de-vista';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      aviso.textContent = ok ? 'Copiada. Pégala en tus notas o en un mensaje.' : 'No se pudo copiar: anótala de la lista de arriba.';
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(listo, aMano);
    } else {
      aMano();
    }
  });

  bolsa.hidden = false;
  pintar();
})();
