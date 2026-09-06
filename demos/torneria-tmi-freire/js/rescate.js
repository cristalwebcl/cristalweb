/* Rescate — va en ARCHIVO, no en línea: la CSP (script-src 'self')
   bloquea los <script> inline sin avisar en pantalla.
   Pone la clase .js que habilita los estados ocultos, y si main.js no
   llega en 4 s la quita: la página se ve entera igual. */
(function () {
  var d = document.documentElement;
  d.classList.remove('no-js');
  d.classList.add('js');
  window.__rescate = setTimeout(function () { d.classList.remove('js'); }, 4000);
})();
