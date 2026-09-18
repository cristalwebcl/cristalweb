/* Cerrajería La Hatillana — para el local.
   Las seis cosas que cierran un local están escritas en el HTML y se
   leen sin este archivo. Esto muestra una casilla en cada una, arma el
   mensaje de WhatsApp con lo marcado y lo enseña antes de mandarlo. No
   guarda nada y no dice cómo se abre nada. Sin librerías, sin módulos. */
(function () {
  'use strict';
  var lista = document.querySelector('[data-cierra]');
  var caja = document.querySelector('[data-mensaje-local]');
  if (!lista || !caja) return;
  var cosas = Array.prototype.slice.call(lista.querySelectorAll('.cosa'));
  var vista = caja.querySelector('.mensaje-l__vista');
  var enlace = caja.querySelector('a.btn');
  var base = enlace.getAttribute('href').split('?')[0];
  var SALUDO = 'Hola. Tengo un local y quiero cotizar: ';
  var CIERRE = '. ¿Qué día pueden venir?';

  function armar() {
    var marcadas = cosas.filter(function (li) { return li.querySelector('input').checked; })
      .map(function (li) { return li.getAttribute('data-nombre'); });
    cosas.forEach(function (li) { li.classList.toggle('cosa--si', li.querySelector('input').checked); });
    if (!marcadas.length) {
      vista.hidden = true;
      enlace.setAttribute('href', base + '?text=' + encodeURIComponent('Hola. Tengo un local y quiero cotizar.'));
      return;
    }
    var texto = SALUDO + marcadas.join(', ') + CIERRE;
    vista.textContent = texto;
    vista.hidden = false;
    enlace.setAttribute('href', base + '?text=' + encodeURIComponent(texto));
  }

  cosas.forEach(function (li) {
    var input = li.querySelector('input');
    input.hidden = false;
    input.addEventListener('change', armar);
  });
  armar();
})();
