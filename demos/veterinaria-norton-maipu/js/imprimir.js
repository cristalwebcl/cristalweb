/* Veterinaria Norton — la hoja que se imprime.
   La ficha del primer chequeo está ESCRITA en el HTML y el CSS de impresión
   (@media print) ya deja sólo esa hoja: Ctrl+P funciona sin este archivo.
   Esto agrega el botón. No guarda nada, no manda nada. Sin librerías. */
(function () {
  'use strict';
  var caja = document.querySelector('[data-imprimir]');
  if (!caja || typeof window.print !== 'function') return;
  var b = document.createElement('button');
  b.type = 'button';
  b.textContent = 'Imprimir la hoja';
  b.addEventListener('click', function () { window.print(); });
  var p = document.createElement('p');
  p.textContent = 'Sale sólo la ficha, en una página. También sirve mostrarla en el teléfono.';
  caja.appendChild(b);
  caja.appendChild(p);
})();
