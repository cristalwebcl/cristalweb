/* Vidriería Diseño A Tu Mano — el espejo a medida.
   La guía de cinco puntos está escrita en el HTML y se lee sin este
   archivo. Esto muestra el formulario (forma, medida, borde,
   instalación), dibuja el espejo a escala y arma el mensaje de
   WhatsApp. No calcula precios ni espesores. Sin librerías, sin módulos. */
(function () {
  'use strict';
  var forma = document.querySelector('[data-forma-espejo]');
  var caja = document.querySelector('[data-mensaje-espejo]');
  var espejo = document.querySelector('[data-espejo]');
  if (!forma || !caja || !espejo) return;
  var vista = caja.querySelector('.mensaje-e__vista');
  var enlace = caja.querySelector('a.btn');
  var base = enlace.getAttribute('href').split('?')[0];
  var cm = espejo.querySelector('.espejo__cm');
  var MAX = 200;

  function valor(nombre) {
    var el = forma.querySelector('input[name="' + nombre + '"]:checked');
    return el ? el.value : '';
  }
  function num(nombre, porDefecto) {
    var v = parseInt(forma.querySelector('input[name="' + nombre + '"]').value, 10);
    if (isNaN(v) || v < 10) v = porDefecto;
    if (v > 300) v = 300;
    return v;
  }

  function armar() {
    var f = valor('forma'), b = valor('borde'), i = valor('instalacion');
    var an = num('ancho', 80), al = num('alto', 120);
    if (f === 'redondo') al = an;
    var esc = MAX / Math.max(an, al);
    espejo.style.width = Math.round(an * esc) + 'px';
    espejo.style.height = Math.round(al * esc) + 'px';
    espejo.classList.toggle('espejo--redondo', f === 'redondo');
    espejo.classList.toggle('espejo--corte', f === 'corte');
    espejo.classList.toggle('espejo--biselado', b === 'biselado');
    cm.textContent = f === 'redondo' ? an + ' cm de diámetro' : an + ' × ' + al + ' cm';
    var nombreForma = { rectangular: 'rectangular', redondo: 'redondo', corte: 'con un corte en la esquina' }[f] || 'rectangular';
    var texto = 'Hola. Quiero cotizar un espejo ' + nombreForma + ' de ' + cm.textContent +
      ', borde ' + (b || 'pulido') + ', ' + (i === 'soportes' ? 'con soportes' : 'para pegar') + '. Les mando la foto del muro.';
    vista.textContent = texto;
    vista.hidden = false;
    enlace.setAttribute('href', base + '?text=' + encodeURIComponent(texto));
  }

  Array.prototype.forEach.call(forma.querySelectorAll('input'), function (el) {
    el.addEventListener('change', armar);
    el.addEventListener('input', armar);
  });
  forma.hidden = false;
  espejo.parentElement.hidden = false;
  armar();
})();
