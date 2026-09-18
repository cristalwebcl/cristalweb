/* Cta Robleviejo — antes de la revisión técnica.
   Los siete puntos están ESCRITOS en el HTML y se leen sin este archivo.
   Esto agrega una casilla a cada uno, estampa el sello al marcarlo y arma
   el mensaje de WhatsApp con LO QUE FALTA por revisar. No guarda nada, no
   consulta nada y no dice cómo se arregla ninguna cosa. Sin librerías. */
(function () {
  'use strict';
  var lista = document.querySelector('[data-acta]');
  var caja = document.querySelector('[data-agenda]');
  if (!lista || !caja) return;
  var vista = caja.querySelector('.agenda-a__vista');
  var enlace = caja.querySelector('a.btn');
  var base = enlace.getAttribute('href').split('?')[0];
  var puntos = Array.prototype.slice.call(lista.querySelectorAll('.punto-a'));

  function armar() {
    var faltan = [];
    puntos.forEach(function (p) {
      var c = p.querySelector('input');
      p.classList.toggle('punto-a--ok', c.checked);
      if (!c.checked) faltan.push(p.getAttribute('data-nombre'));
    });
    var texto;
    if (faltan.length === 0) {
      texto = 'Hola. Ya revisé los siete puntos antes de la revisión técnica. Quiero agendar la pre-revisión igual, para confirmar.';
    } else if (faltan.length === puntos.length) {
      texto = 'Hola. Quiero agendar la pre-revisión antes de la revisión técnica.';
    } else {
      texto = 'Hola. Quiero agendar la pre-revisión. Me falta revisar: ' + faltan.join(', ') + '.';
    }
    vista.textContent = texto;
    vista.hidden = false;
    enlace.setAttribute('href', base + '?text=' + encodeURIComponent(texto));
  }

  puntos.forEach(function (p) {
    var c = p.querySelector('input');
    if (!c) return;
    c.hidden = false;
    c.addEventListener('change', armar);
  });
  armar();
})();
