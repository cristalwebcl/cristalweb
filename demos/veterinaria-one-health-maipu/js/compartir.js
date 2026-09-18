/* Clínica Veterinaria One Health — la salud que comparten.
   Los cinco hábitos están ESCRITOS en el HTML. Esto agrega un botón que los comparte con la
   hoja de compartir del teléfono (navigator.share); donde no existe, los copia; donde tampoco,
   los deja seleccionados. El texto se arma LEYENDO la lista: no hay una segunda copia que se
   desactualice. No guarda nada ni llama a ningún servidor. Sin librerías. */
(function () {
  'use strict';
  var caja = document.querySelector('[data-compartir]');
  var lista = document.querySelector('.habitos');
  if (!caja || !lista) return;
  var acciones = caja.querySelector('.comparte__acc');
  var estado = caja.querySelector('.comparte__estado');
  if (!acciones || !estado) return;

  function texto() {
    var lineas = ['Cinco hábitos de casa para vivir con mascotas:'];
    Array.prototype.forEach.call(lista.querySelectorAll('.habito'), function (h, n) {
      var nombre = h.querySelector('b'), detalle = h.querySelector('span');
      if (!nombre) return;
      lineas.push((n + 1) + '. ' + nombre.textContent.trim() + (detalle ? ' — ' + detalle.textContent.trim() : ''));
    });
    lineas.push('Son generales: la pauta de cada mascota la da su veterinario.');
    return lineas.join('\n');
  }
  function decir(t) { estado.textContent = t; }
  function seleccionar() {
    var r = document.createRange(); r.selectNodeContents(lista);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    decir('Quedaron seleccionados: cópialos y pégalos en el grupo de la casa.');
  }
  function copiar() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto()).then(function () {
        decir('Copiados. Pégalos en el grupo de la casa.');
      }, seleccionar);
    } else { seleccionar(); }
  }

  var b = document.createElement('button');
  b.type = 'button';
  b.textContent = navigator.share ? 'Compartir los cinco' : 'Copiar los cinco';
  b.addEventListener('click', function () {
    if (!navigator.share) { copiar(); return; }
    navigator.share({ title: 'Cinco hábitos de casa', text: texto() }).then(function () {
      decir('Compartidos.');
    }, function (e) {
      /* cerrar la hoja sin elegir no es un error: no se dice nada */
      if (e && e.name === 'AbortError') return;
      copiar();
    });
  });
  acciones.insertBefore(b, acciones.firstChild);
})();
