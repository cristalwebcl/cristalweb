/* copiar.js — le agrega al bloque «guárdalo en el celular» un boton que copia
   la lista al portapapeles. El boton lo crea el JS: si este archivo no corre,
   no queda un boton muerto y el texto se puede seleccionar igual.
   IIFE, sin modulos, sin librerias. */
(function () {
  'use strict';
  var caja = document.querySelector('.guardar');
  var txt = caja && caja.querySelector('.guardar__txt');
  if (!txt || !navigator.clipboard) { return; }

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'guardar__btn';
  btn.textContent = 'Copiar la lista';
  caja.appendChild(btn);

  var reloj = null;
  btn.addEventListener('click', function () {
    navigator.clipboard.writeText(txt.textContent.trim()).then(function () {
      btn.textContent = 'Copiada';
      if (reloj) { clearTimeout(reloj); }
      reloj = setTimeout(function () { btn.textContent = 'Copiar la lista'; }, 2500);
    }, function () {
      btn.textContent = 'Selecciónala y cópiala';
    });
  });
})();
