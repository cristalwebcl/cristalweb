/* Gym Profit — tres situaciones en pestañas.
   Las tres están escritas en el HTML y se leen sin este archivo. Esto
   agrega los botones y muestra una a la vez (patrón de pestañas con
   flechas). No guarda nada. Sin librerías, sin módulos. */
(function () {
  'use strict';
  var caja = document.querySelector('[data-situaciones]');
  if (!caja) return;
  var tabs = caja.querySelector('.situaciones__tabs');
  var paneles = Array.prototype.slice.call(caja.querySelectorAll('.situacion'));
  if (!tabs || !paneles.length) return;
  var botones = [];

  function elegir(i, foco) {
    botones.forEach(function (b, j) {
      var si = i === j;
      b.setAttribute('aria-selected', si ? 'true' : 'false');
      b.tabIndex = si ? 0 : -1;
      paneles[j].hidden = !si;
    });
    if (foco) botones[i].focus();
  }

  tabs.setAttribute('role', 'tablist');
  paneles.forEach(function (p, i) {
    var h = p.querySelector('h3');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'situaciones__tab';
    b.id = 'sit-tab-' + i;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', p.id);
    b.textContent = h ? h.textContent : 'Situación ' + (i + 1);
    b.addEventListener('click', function () { elegir(i, false); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); elegir((i + 1) % paneles.length, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); elegir((i - 1 + paneles.length) % paneles.length, true); }
    });
    p.setAttribute('role', 'tabpanel');
    p.setAttribute('aria-labelledby', b.id);
    botones.push(b);
    tabs.appendChild(b);
  });

  tabs.hidden = false;
  elegir(0, false);
})();
