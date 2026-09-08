/*  filtro-demos.js — filtro por rubro del catálogo de propuestas.

    Va aparte de main.js porque solo existe en demos.html: cargarlo en
    el índice sería pedir un archivo que no hace nada.

    Progresivo por diseño: los chips vienen con [hidden] en el HTML y
    solo se encienden acá. Sin JavaScript se ven las 52 propuestas, que
    es exactamente lo que hay que ver — el filtro es comodidad, no
    contenido.                                                        */
(function () {
  "use strict";

  var chips = document.getElementById("filtros");
  var rejilla = document.getElementById("rejilla");
  var vacio = document.getElementById("filtros-vacio");
  if (!chips || !rejilla) { return; }

  var tarjetas = Array.prototype.slice.call(rejilla.querySelectorAll(".proyecto"));
  var botones = Array.prototype.slice.call(chips.querySelectorAll(".filtro"));

  chips.hidden = false;

  function aplicar(rubro) {
    var visibles = 0;
    tarjetas.forEach(function (t) {
      var pasa = (rubro === "todas") || (t.getAttribute("data-rubro") === rubro);
      t.hidden = !pasa;
      if (pasa) {
        visibles++;
        // Una tarjeta que estuvo oculta pudo perderse su reveal: al
        // volver se muestra ya revelada en vez de quedar invisible.
        t.classList.add("visible");
      }
    });
    if (vacio) { vacio.hidden = visibles > 0; }
  }

  botones.forEach(function (b) {
    b.addEventListener("click", function () {
      botones.forEach(function (o) {
        o.classList.toggle("filtro--activo", o === b);
        o.setAttribute("aria-pressed", o === b ? "true" : "false");
      });
      aplicar(b.getAttribute("data-filtro"));
    });
    b.setAttribute("aria-pressed", b.classList.contains("filtro--activo") ? "true" : "false");
  });
})();
