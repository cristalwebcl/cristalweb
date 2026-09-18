/* Ferretería Galvarino — la lista que se acuerda.
   Los seis arreglos están ESCRITOS en el HTML y se marcan sin este archivo.
   Esto guarda las casillas en ESTE teléfono (localStorage) para que mañana sigan
   marcadas, dibuja el avance y ofrece borrar. Nada sale del teléfono. Si el
   navegador no deja guardar (ventana privada), la lista funciona igual sin memoria.
   Sin librerías. */
(function () {
  'use strict';
  var CLAVE = 'galvarino-arriendo-v1';
  var lista = document.querySelector('[data-arreglos]');
  var caja = document.querySelector('[data-avance]');
  if (!lista || !caja) return;
  var casillas = lista.querySelectorAll('input[type="checkbox"]');

  function leer() {
    try { var t = window.localStorage.getItem(CLAVE); var a = t ? JSON.parse(t) : []; return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  var seGuarda = true;
  function guardar(ids) {
    try { window.localStorage.setItem(CLAVE, JSON.stringify(ids)); seGuarda = true; }
    catch (e) { seGuarda = false; }
  }

  var barra = document.createElement('progress');
  barra.max = casillas.length; barra.value = 0;
  barra.setAttribute('aria-label', 'Arreglos listos');
  var cuenta = document.createElement('b');
  cuenta.setAttribute('aria-live', 'polite');
  var nota = document.createElement('span');
  var borrar = document.createElement('button');
  borrar.type = 'button'; borrar.textContent = 'Empezar de nuevo';
  caja.appendChild(barra); caja.appendChild(cuenta); caja.appendChild(nota); caja.appendChild(borrar);

  function pintar() {
    var ids = [];
    Array.prototype.forEach.call(casillas, function (c) { if (c.checked) ids.push(c.id); });
    barra.value = ids.length;
    cuenta.textContent = ids.length + ' de ' + casillas.length + ' listos';
    nota.textContent = seGuarda ? 'Se guarda sólo en este teléfono.' : 'Este navegador no deja guardar.';
    return ids;
  }

  var guardados = leer();
  Array.prototype.forEach.call(casillas, function (c) {
    if (guardados.indexOf(c.id) >= 0) c.checked = true;
    c.addEventListener('change', function () { guardar(pintar()); pintar(); });
  });
  borrar.addEventListener('click', function () {
    Array.prototype.forEach.call(casillas, function (c) { c.checked = false; });
    try { window.localStorage.removeItem(CLAVE); } catch (e) {}
    pintar();
  });
  guardar(pintar()); pintar();
})();
