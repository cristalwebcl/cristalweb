/* Veterinaria Los Naranjos — lo que hay en el patio.
   La regla única («si comió algo raro, llama antes de hacer nada») está ESCRITA en la página,
   en #regla. Cada enlace con data-abre-regla es un ancla corriente que baja hasta ella; con
   este archivo, en vez de bajar, la abre encima en un <dialog> nativo: el navegador atrapa el
   foco, Escape cierra, tocar el fondo cierra y el foco vuelve a quien la abrió.
   No guarda nada. Sin librerías. */
(function () {
  'use strict';
  var regla = document.getElementById('regla');
  var enlaces = document.querySelectorAll('a[data-abre-regla]');
  if (!regla || !enlaces.length) return;
  var prueba = document.createElement('dialog');
  if (typeof prueba.showModal !== 'function') return;   /* sin <dialog>: quedan las anclas */

  var caja = document.createElement('dialog');
  caja.className = 'aviso-d';
  caja.setAttribute('aria-labelledby', 'aviso-t');
  var copia = regla.cloneNode(true);
  copia.removeAttribute('id');
  copia.classList.remove('rev', 'cascada');
  var titulo = copia.querySelector('h3');
  if (titulo) titulo.id = 'aviso-t';
  var cerrar = document.createElement('button');
  cerrar.type = 'button';
  cerrar.className = 'aviso-d__cerrar';
  cerrar.textContent = 'Cerrar';
  copia.appendChild(cerrar);
  caja.appendChild(copia);
  document.body.appendChild(caja);

  var quien = null;
  Array.prototype.forEach.call(enlaces, function (a) {
    a.setAttribute('aria-haspopup', 'dialog');
    a.addEventListener('click', function (e) {
      e.preventDefault();
      quien = a;
      if (!caja.open) caja.showModal();
    });
  });
  cerrar.addEventListener('click', function () { caja.close(); });
  /* tocar el fondo: el clic cae en el <dialog> mismo, no en su contenido */
  caja.addEventListener('click', function (e) { if (e.target === caja) caja.close(); });
  caja.addEventListener('close', function () { if (quien) quien.focus(); });
})();
