/* Rescate — va en ARCHIVO, no en linea: la CSP (script-src 'self')
   bloquea los <script> inline sin avisar en pantalla. Estaba en linea y
   al poner la CSP el 11-09-2026 dejo de ejecutarse: la clase .js nunca
   se ponia y los estados ocultos no se destapaban.
   Pone la clase .js que habilita los estados ocultos, y si main.js no
   llega a tiempo la quita: la pagina se ve entera igual. */
(function () {
    var d = document.documentElement;
    d.classList.remove('no-js');
    d.classList.add('js');
    window.__rescate = setTimeout(function () { d.classList.remove('js'); }, 4000);
  })();
