/* Studio71 — el corte para tu rostro.
   Las cinco formas y sus cortes están ESCRITOS en el HTML. Esto le da vida al probador: se
   elige una foto propia y se prueban encima los cinco contornos (figuras de CSS).
   LA FOTO NO SALE DEL TELÉFONO: FileReader la abre como data: dentro de esta misma página
   (es lo único que la CSP deja pintar además de los archivos del sitio); no se sube, no se
   guarda y se pierde al cerrar la pestaña. No hay ninguna petición de red. Sin librerías. */
(function () {
  'use strict';
  var caja = document.querySelector('[data-prueba]');
  if (!caja) return;
  if (!window.FileReader) { caja.hidden = true; return; }
  var img = caja.querySelector('.prueba__marco img');
  var contorno = caja.querySelector('.contorno');
  var archivo = caja.querySelector('input[type="file"]');
  var perilla = caja.querySelector('input[type="range"]');
  var botones = caja.querySelectorAll('[data-forma]');
  if (!img || !contorno || !archivo || !perilla) return;

  archivo.addEventListener('change', function () {
    var f = archivo.files && archivo.files[0];
    if (!f || f.type.indexOf('image/') !== 0) return;
    var lector = new FileReader();
    lector.onload = function () {
      img.src = lector.result;
      img.alt = 'Tu foto';
      img.hidden = false;
    };
    lector.readAsDataURL(f);
  });

  /* CSSOM, no atributo style: la CSP bloquea el segundo y permite el primero */
  perilla.addEventListener('input', function () {
    img.style.transform = 'scale(' + (perilla.value / 100) + ')';
  });

  Array.prototype.forEach.call(botones, function (b) {
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(botones, function (o) {
        o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
      });
      contorno.className = 'contorno contorno--' + b.getAttribute('data-forma');
    });
  });
})();
