/* Mandala Chile Yoga — filtro de la semana.
   La grilla entera está escrita en el HTML: sin este archivo se lee todo.
   Esto sólo agrega dos grupos de botones (nivel y horario) y esconde las
   clases que no calzan. Sin librerías, sin módulos. */
(function () {
  'use strict';
  var caja = document.querySelector('[data-filtro-semana]');
  var clases = Array.prototype.slice.call(document.querySelectorAll('.clase[data-nivel]'));
  if (!caja || !clases.length) return;

  var estado = { nivel: 'todas', franja: 'todo' };
  var GRUPOS = [
    { clave: 'nivel', titulo: 'Nivel', opciones: [['todas', 'Todas'], ['sin-experiencia', 'Sin experiencia']] },
    { clave: 'franja', titulo: 'Horario', opciones: [['todo', 'Todo el día'], ['manana', 'Mañana'], ['tarde', 'Tarde'], ['noche', 'Noche']] }
  ];

  function calza(li) {
    var n = li.getAttribute('data-nivel'), f = li.getAttribute('data-franja');
    var okNivel = estado.nivel === 'todas' || n === 'inicial' || n === 'multinivel';
    var okFranja = estado.franja === 'todo' || f === estado.franja;
    return okNivel && okFranja;
  }

  function aplicar() {
    clases.forEach(function (li) { li.hidden = !calza(li); });
    Array.prototype.forEach.call(document.querySelectorAll('.dia'), function (dia) {
      var visibles = dia.querySelectorAll('.clase:not([hidden])').length;
      var vacio = dia.querySelector('.dia__vacio');
      if (vacio) vacio.hidden = visibles > 0;
    });
    Array.prototype.forEach.call(caja.querySelectorAll('.filtro-sem__b'), function (b) {
      b.setAttribute('aria-pressed', String(estado[b.getAttribute('data-clave')] === b.getAttribute('data-valor')));
    });
  }

  GRUPOS.forEach(function (g) {
    var grupo = document.createElement('div');
    grupo.className = 'filtro-sem__grupo';
    grupo.setAttribute('role', 'group');
    grupo.setAttribute('aria-label', g.titulo);
    var t = document.createElement('span');
    t.className = 'filtro-sem__t';
    t.textContent = g.titulo;
    grupo.appendChild(t);
    g.opciones.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'filtro-sem__b';
      b.setAttribute('data-clave', g.clave);
      b.setAttribute('data-valor', o[0]);
      b.textContent = o[1];
      b.addEventListener('click', function () { estado[g.clave] = o[0]; aplicar(); });
      grupo.appendChild(b);
    });
    caja.appendChild(grupo);
  });
  caja.hidden = false;
  aplicar();
})();
