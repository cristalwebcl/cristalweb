/* nivel.js — el test de «¿qué nivel soy?».
   Sin este archivo la pieza se lee igual: las cinco preguntas quedan a la
   vista y el recuadro de abajo muestra los tres niveles con lo que cubre
   cada uno. Con JS, al marcar las cinco respuestas el recuadro se
   reemplaza por el nivel recomendado. IIFE, sin modulos, sin librerias. */
(function () {
  'use strict';
  var test = document.querySelector('.test');
  var caja = document.getElementById('resultado');
  if (!test || !caja) { return; }

  var NIVELES = [
    ['Básico', 'Partir por lo de siempre: moverse en la planilla, escribir fórmulas simples y ordenar datos.'],
    ['Intermedio', 'Buscar datos entre planillas, filtrar en serio y armar gráficos que se entiendan.'],
    ['Avanzado', 'Tablas dinámicas, fórmulas anidadas y dejar resuelto lo que se repite todos los meses.']
  ];
  var TOTAL = test.querySelectorAll('.preg').length;

  function pintar(indice) {
    var h3 = document.createElement('h3');
    h3.textContent = 'Te calza el ' + NIVELES[indice][0].toLowerCase();
    var p = document.createElement('p');
    p.textContent = NIVELES[indice][1];
    var eco = document.createElement('p');
    eco.className = 'nivel__eco';
    eco.textContent = 'De ejemplo: el nivel lo confirma la academia antes de inscribirte.';
    caja.textContent = '';
    caja.appendChild(h3);
    caja.appendChild(p);
    caja.appendChild(eco);
  }

  function calcular() {
    var marcadas = test.querySelectorAll('input[type="radio"]:checked');
    if (marcadas.length < TOTAL) { return; }
    var suma = 0;
    for (var i = 0; i < marcadas.length; i++) { suma += Number(marcadas[i].value) || 0; }
    pintar(suma <= 3 ? 0 : (suma <= 7 ? 1 : 2));
  }

  test.addEventListener('change', calcular);
})();
