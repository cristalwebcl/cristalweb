/* ═══════════════════════════════════════════════════════════════
   CristalWeb — main.js
   ═══════════════════════════════════════════════════════════════
   Sin librerías, sin módulos ES. Patrón IIFE porque
   <script type="module"> no corre al abrir el archivo con file://.

   Nada de lo que hay acá es necesario para leer la página: el
   contenido está escrito en el HTML. Esto solo agrega el movimiento.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var raiz = document.documentElement;

  /* El script inline del <head> dejó armado un temporizador que quita la
     clase .js a los 4 s. Si llegamos hasta acá, el JS funciona y ese
     rescate ya no hace falta. */
  if (window.__rescate) { clearTimeout(window.__rescate); }

  var sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Reveals al hacer scroll ──────────────────────────────────
     Con los dos resguardos de la casa: lo que ya está a la vista al
     cargar se muestra al tiro, y un barrido a los 6 s revela lo que
     haya quedado pendiente por cualquier motivo.                    */
  var porRevelar = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revelar(el) { el.classList.add("visible"); }

  if ("IntersectionObserver" in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) { return; }
        revelar(entrada.target);
        observador.unobserve(entrada.target);   // una sola vez
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    porRevelar.forEach(function (el) {
      var caja = el.getBoundingClientRect();
      if (caja.top < window.innerHeight) { revelar(el); }   // ya visible
      else { observador.observe(el); }
    });

    setTimeout(function () { porRevelar.forEach(revelar); }, 6000);   // barrido
  } else {
    porRevelar.forEach(revelar);
  }

  /* ── Cabecera: se marca cuando la página ya bajó ─────────────── */
  var cabecera = document.getElementById("cabecera");
  var ultimoY = -1;

  function alScrollear() {
    var y = window.pageYOffset;
    if (y === ultimoY) { return; }
    ultimoY = y;
    cabecera.classList.toggle("bajado", y > 24);
  }
  window.addEventListener("scroll", alScrollear, { passive: true });
  alScrollear();

  /* ── Menú de celular ─────────────────────────────────────────── */
  var boton = document.getElementById("menu-boton");
  var menu = document.getElementById("menu");

  function cerrarMenu() {
    menu.classList.remove("abierto");
    boton.setAttribute("aria-expanded", "false");
  }

  boton.addEventListener("click", function () {
    var abierto = menu.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", abierto ? "true" : "false");
  });

  menu.addEventListener("click", function (ev) {
    if (ev.target.closest("a")) { cerrarMenu(); }
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && menu.classList.contains("abierto")) {
      cerrarMenu();
      boton.focus();
    }
  });

  /* ── Tilt 3D del retrato ──────────────────────────────────────
     Escalón 2 de profundidad: la tarjeta se inclina siguiendo el
     cursor. Solo con mouse real — en pantalla táctil no existe el
     hover y el efecto tiene que morir con dignidad, no a medias.
     Se anima únicamente transform, así que no fuerza layout.        */
  var puntero = window.matchMedia("(hover: hover) and (pointer: fine)");

  if (puntero.matches && !sinMovimiento) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-tilt]"), function (figura) {
      var marco = figura.querySelector(".retrato__marco");
      if (!marco) { return; }

      figura.addEventListener("mousemove", function (ev) {
        var caja = marco.getBoundingClientRect();
        var x = (ev.clientX - caja.left) / caja.width - 0.5;    // -0.5 … 0.5
        var y = (ev.clientY - caja.top) / caja.height - 0.5;

        marco.style.transform =
          "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) " +
          "rotateX(" + (-y * 7).toFixed(2) + "deg) translateZ(6px)";
      });

      figura.addEventListener("mouseleave", function () {
        marco.style.transform = "";
      });
    });
  }
})();
