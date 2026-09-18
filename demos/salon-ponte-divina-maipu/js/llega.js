/* Salón Ponte Divina — cuánto dura.
   La tabla de técnicas está ESCRITA en el HTML con sus semanas de referencia; cada fila trae en
   data-min y data-max los días de esa referencia. Esto le da vida a las dos fechas: «me las hago
   el…» y «las necesito para el…». Resta una de la otra y marca cada fila: llega, llega justo o no
   llega. Sólo usa las dos fechas que escribe la persona: no mira el reloj, no guarda nada y no
   llama a ningún servidor. Sin librerías. */
(function () {
  'use strict';
  var caja = document.querySelector('[data-fechas]');
  var filas = document.querySelectorAll('.dura tbody tr[data-min]');
  if (!caja || !filas.length) return;
  var hago = caja.querySelector('#f-hago');
  var evento = caja.querySelector('#f-evento');
  var salida = caja.querySelector('output');
  if (!hago || !evento || !salida) return;
  var TEXTO = { llega: 'Llega', justo: 'Llega justo', no: 'No llega' };

  function limpiar() {
    Array.prototype.forEach.call(filas, function (tr) {
      tr.classList.remove('llega', 'justo', 'no');
      var v = tr.querySelector('.veredicto');
      if (v) v.parentNode.removeChild(v);
    });
  }
  function dias() {
    if (!hago.value || !evento.value) return null;
    /* a mediodía: así un cambio de hora no se come un día */
    var a = new Date(hago.value + 'T12:00:00'), b = new Date(evento.value + 'T12:00:00');
    if (isNaN(a) || isNaN(b)) return null;
    return Math.round((b - a) / 86400000);
  }
  function frase(n) {
    if (n === 0) return 'Es el mismo día: llegan todas.';
    var s = Math.floor(n / 7), d = n % 7, partes = [];
    if (s) partes.push(s + (s === 1 ? ' semana' : ' semanas'));
    if (d) partes.push(d + (d === 1 ? ' día' : ' días'));
    return 'Entre las dos fechas hay ' + partes.join(' y ') + '.';
  }
  function pintar() {
    limpiar();
    var n = dias();
    if (n === null) { salida.textContent = ''; return; }
    if (n < 0) { salida.textContent = 'El evento quedó antes de la cita: revisa las fechas.'; return; }
    salida.textContent = frase(n);
    Array.prototype.forEach.call(filas, function (tr) {
      var min = parseInt(tr.getAttribute('data-min'), 10), max = parseInt(tr.getAttribute('data-max'), 10);
      var clase = n <= min ? 'llega' : (n <= max ? 'justo' : 'no');
      tr.classList.add(clase);
      var v = document.createElement('span');
      v.className = 'veredicto';
      v.textContent = TEXTO[clase];
      tr.cells[1].appendChild(v);
    });
  }
  hago.addEventListener('input', pintar);
  evento.addEventListener('input', pintar);
})();
