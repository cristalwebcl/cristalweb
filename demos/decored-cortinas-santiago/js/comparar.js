/* comparar.js — el comparador «roller o vertical».
   Sin este archivo la pieza se lee igual: quedan las cinco situaciones
   con su respuesta a la vista. Con JS aparecen unos botones que dejan
   sólo la situación elegida, para no leer las cinco.
   IIFE, sin modulos, sin librerias. */
(function () {
  'use strict';
  var caja = document.querySelector('.comparar');
  if (!caja) { return; }
  var casos = caja.querySelectorAll('.caso');
  if (casos.length < 2) { return; }

  var barra = document.createElement('div');
  barra.className = 'filtros';

  function mostrar(indice) {
    for (var i = 0; i < casos.length; i++) {
      casos[i].hidden = (indice !== -1 && i !== indice);
    }
    var botones = barra.querySelectorAll('button');
    for (var j = 0; j < botones.length; j++) {
      botones[j].setAttribute('aria-pressed', String(j - 1 === indice));
    }
  }

  function boton(texto, indice) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'filtros__b';
    b.textContent = texto;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { mostrar(indice); });
    return b;
  }

  barra.appendChild(boton('Todas', -1));
  for (var k = 0; k < casos.length; k++) {
    var h = casos[k].querySelector('h3');
    barra.appendChild(boton(h ? h.textContent : 'Caso ' + (k + 1), k));
  }
  caja.parentNode.insertBefore(barra, caja);
  mostrar(-1);
})();
