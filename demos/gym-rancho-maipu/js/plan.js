/* Gym Rancho — ¿qué plan?
   Los cuatro planes están ESCRITOS en el HTML y se leen sin este archivo.
   Esto agrega tres preguntas (cuántas veces, a qué hora, solo o con
   clases) y resalta el plan que corresponde. No calcula precios: no hay.
   No guarda nada. Sin librerías. */
(function () {
  'use strict';
  var caja = document.querySelector('[data-preguntas]');
  var planes = document.querySelectorAll('[data-plan]');
  var vered = document.querySelector('[data-veredicto-plan]');
  if (!caja || !planes.length || !vered) return;

  function sel(nombre, rotulo, opciones) {
    var l = document.createElement('label');
    var t = document.createElement('span'); t.textContent = rotulo;
    var s = document.createElement('select'); s.name = nombre;
    opciones.forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; s.appendChild(op); });
    l.appendChild(t); l.appendChild(s); caja.appendChild(l);
    s.addEventListener('change', elegir);
    return s;
  }
  var veces = sel('veces', 'Cuántas veces a la semana', [['2', 'Dos'], ['3', 'Tres'], ['5', 'Cinco o más']]);
  var hora = sel('hora', 'A qué hora', [['manana', 'Mañana'], ['tarde', 'Tarde'], ['noche', 'Noche']]);
  var modo = sel('modo', 'Cómo entrenas', [['solo', 'Por mi cuenta'], ['clases', 'Con clases']]);

  function elegir() {
    var clave;
    if (modo.value === 'clases') clave = 'clases';
    else if (veces.value === '2') clave = 'prueba';
    else if (hora.value === 'manana') clave = 'mananero';
    else clave = 'libre';
    var nombre = '';
    Array.prototype.forEach.call(planes, function (p) {
      var es = p.getAttribute('data-plan') === clave;
      p.classList.toggle('plan--elegido', es);
      if (es) nombre = p.querySelector('b').textContent;
    });
    vered.textContent = 'Te corresponde el plan ' + nombre + '. Lo confirmas en el mesón.';
    vered.hidden = false;
  }
  elegir();
})();
