/* Ferretería Siempre Stock — lo que siempre hay.
   Las seis familias con sus básicos están ESCRITAS en el HTML y se leen
   sin este archivo. Esto agrega el buscador, que sólo filtra contra esa
   misma lista: no consulta nada, no sabe si hay stock hoy, no inventa.
   Sin librerías, sin módulos. */
(function () {
  'use strict';
  var caja = document.querySelector('[data-buscar-stock]');
  var lista = document.querySelector('[data-familias]');
  if (!caja || !lista) return;
  var campo = caja.querySelector('input');
  var cuenta = caja.querySelector('output');
  var vacio = document.querySelector('[data-vacio-stock]');
  var familias = Array.prototype.slice.call(lista.querySelectorAll('.familia'));
  var items = [];

  familias.forEach(function (f) {
    Array.prototype.forEach.call(f.querySelectorAll('li'), function (li) {
      items.push({ li: li, fam: f, texto: normal(li.textContent), html: li.textContent });
    });
  });
  var total = items.length;

  function normal(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function pintar(li, texto, q) {
    if (!q) { li.textContent = texto; return; }
    var i = normal(texto).indexOf(q);
    if (i < 0) { li.textContent = texto; return; }
    li.textContent = '';
    li.appendChild(document.createTextNode(texto.slice(0, i)));
    var b = document.createElement('b');
    b.textContent = texto.slice(i, i + q.length);
    li.appendChild(b);
    li.appendChild(document.createTextNode(texto.slice(i + q.length)));
  }

  function filtrar() {
    var q = normal(campo.value.trim());
    var vistos = 0;
    items.forEach(function (it) {
      var ok = !q || it.texto.indexOf(q) >= 0;
      it.li.hidden = !ok;
      if (ok) { vistos++; pintar(it.li, it.html, q); }
    });
    familias.forEach(function (f) {
      f.hidden = !Array.prototype.some.call(f.querySelectorAll('li'), function (li) { return !li.hidden; });
    });
    if (vacio) vacio.hidden = vistos !== 0;
    cuenta.textContent = q
      ? (vistos === 0 ? 'Nada con esa palabra en la lista. Pregunta igual: la lista es de ejemplo.' : vistos + ' de ' + total + ' a la vista')
      : total + ' básicos en la lista';
  }

  campo.addEventListener('input', filtrar);
  campo.addEventListener('search', filtrar);
  caja.hidden = false;
  filtrar();
})();
