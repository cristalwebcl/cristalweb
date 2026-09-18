/* Clínica Dental Blue — la mano que se levanta.
   Los cinco pasos están ESCRITOS en el HTML y se leen sin este archivo.
   Esto agrega el botón «Levanto la mano»: al apretarlo la lista se apaga
   y aparece «Paramos. Cuando quieras, seguimos»; al apretarlo de nuevo,
   sigue. Es la señal de la pieza, hecha botón. No guarda nada. */
(function () {
  'use strict';
  var sec = document.querySelector('#miedo');
  var caja = document.querySelector('[data-mano]');
  if (!sec || !caja) return;
  var b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-pressed', 'false');
  b.textContent = 'Levanto la mano';
  var aviso = document.createElement('p');
  aviso.className = 'mano__aviso';
  aviso.setAttribute('aria-live', 'polite');
  aviso.hidden = true;
  b.addEventListener('click', function () {
    var pausa = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', pausa ? 'true' : 'false');
    b.textContent = pausa ? 'Seguimos' : 'Levanto la mano';
    sec.classList.toggle('miedo--pausa', pausa);
    aviso.textContent = pausa ? 'Paramos. Cuando quieras, seguimos.' : '';
    aviso.hidden = !pausa;
  });
  caja.appendChild(b);
  caja.appendChild(aviso);
})();
