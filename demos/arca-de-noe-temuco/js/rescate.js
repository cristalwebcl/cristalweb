/* Rescate — va en ARCHIVO, no en linea: la CSP (script-src 'self')
   bloquea los <script> inline SIN avisar en pantalla. Se saco de index.html
   al poner la CSP.
   Pone la clase .js que habilita los estados ocultos, y si main.js no llega
   a tiempo la quita: la pagina se ve entera igual. */
(function () {
    var d = document.documentElement;
    d.classList.remove('no-js');
    d.classList.add('js');
    window.__rescate = setTimeout(function () {
      d.classList.remove('js');
    }, 4000);
  })();
