/* Carolina Azúa Studio — el diccionario del salón.
   Las ocho palabras están ESCRITAS en el HTML con su significado: sin este archivo se
   leen como una lista de definiciones. Esto agrega a cada tarjeta un botón que la da
   vuelta (la palabra al frente, el significado atrás). No guarda nada. Sin librerías. */
(function () {
  'use strict';
  var tarjetas = document.querySelectorAll('[data-palabra]');
  if (!tarjetas.length) return;
  Array.prototype.forEach.call(tarjetas, function (t, n) {
    var frente = t.querySelector('.palabra__frente');
    var dorso = t.querySelector('.palabra__dorso');
    if (!frente || !dorso) return;
    var nombre = frente.querySelector('b').textContent;
    dorso.id = 'significado-' + (n + 1);

    function boton(texto) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = texto;
      b.setAttribute('aria-controls', dorso.id);
      b.addEventListener('click', girar);
      return b;
    }
    var ver = boton('Qué significa');
    ver.setAttribute('aria-label', 'Qué significa ' + nombre);
    var volver = boton('Volver');
    /* atrás se repite la palabra en chico: dada vuelta, la tarjeta no debe perder su nombre */
    var eco = document.createElement('small');
    eco.className = 'palabra__eco'; eco.textContent = nombre;
    dorso.insertBefore(eco, dorso.firstChild);
    frente.appendChild(ver); dorso.appendChild(volver);

    function poner(vuelta) {
      t.classList.toggle('palabra--vuelta', vuelta);
      ver.setAttribute('aria-expanded', vuelta ? 'true' : 'false');
      /* la cara que no se ve no debe recibir foco ni leerse */
      frente.setAttribute('aria-hidden', vuelta ? 'true' : 'false');
      dorso.setAttribute('aria-hidden', vuelta ? 'false' : 'true');
      ver.tabIndex = vuelta ? -1 : 0;
      volver.tabIndex = vuelta ? 0 : -1;
    }
    function girar() {
      var vuelta = !t.classList.contains('palabra--vuelta');
      poner(vuelta);
      (vuelta ? volver : ver).focus();
    }
    poner(false);
  });
})();
