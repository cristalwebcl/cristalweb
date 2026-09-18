/* DogtorVet — los dientes de tu mascota.
   Los cuatro bloques están ESCRITOS en el HTML, cada uno con su título. Esto arma con esos
   títulos una fila de cuatro pestañas con forma de diente y muestra un panel a la vez.
   Patrón de pestañas de la WAI-ARIA: flechas izquierda y derecha, Inicio y Fin; sólo la
   pestaña elegida queda en el orden de tabulación. No guarda nada. Sin librerías. */
(function () {
  'use strict';
  var caja = document.querySelector('[data-pestanas]');
  if (!caja) return;
  var paneles = Array.prototype.slice.call(caja.querySelectorAll('.diente-p'));
  if (paneles.length < 2) return;

  var fila = document.createElement('div');
  fila.className = 'dientes__fila';
  fila.setAttribute('role', 'tablist');
  fila.setAttribute('aria-label', 'Los dientes de tu mascota');

  var botones = paneles.map(function (p, n) {
    var titulo = p.querySelector('h3');
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'diente-t' + (n + 1);
    b.textContent = titulo ? titulo.textContent : 'Parte ' + (n + 1);
    b.setAttribute('role', 'tab');
    p.id = p.id || 'diente-p' + (n + 1);
    b.setAttribute('aria-controls', p.id);
    p.setAttribute('role', 'tabpanel');
    p.setAttribute('aria-labelledby', b.id);
    p.tabIndex = 0;
    b.addEventListener('click', function () { elegir(n, false); });
    fila.appendChild(b);
    return b;
  });

  function elegir(n, conFoco) {
    botones.forEach(function (b, i) {
      var si = i === n;
      b.setAttribute('aria-selected', si ? 'true' : 'false');
      b.tabIndex = si ? 0 : -1;
      paneles[i].hidden = !si;
    });
    if (conFoco) botones[n].focus();
  }

  fila.addEventListener('keydown', function (e) {
    var ahora = botones.indexOf(document.activeElement);
    if (ahora < 0) return;
    var a = -1;
    if (e.key === 'ArrowRight') a = (ahora + 1) % botones.length;
    else if (e.key === 'ArrowLeft') a = (ahora - 1 + botones.length) % botones.length;
    else if (e.key === 'Home') a = 0;
    else if (e.key === 'End') a = botones.length - 1;
    if (a < 0) return;
    e.preventDefault();
    elegir(a, true);
  });

  caja.insertBefore(fila, paneles[0]);
  caja.classList.add('dientes--listas');
  elegir(0, false);
})();
