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

  /* El script inline del <head> dejó armado un temporizador que quita la
     clase .js a los 4 s. Si llegamos hasta acá, el JS funciona y ese
     rescate ya no hace falta. */
  if (window.__rescate) { clearTimeout(window.__rescate); }

  var sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Reveals al hacer scroll ──────────────────────────────────
     La dirección la decide el HTML con data-rev (izq/der/abajo/escala);
     acá solo se reparte el escalonado y se enciende la clase.
     Dentro de un contenedor data-rev-hijos, cada hermano espera 70 ms
     más que el anterior, con tope en 8: más allá el escalonado total
     se vuelve lento y el usuario ya scrolleó.
     Dos resguardos de la casa: lo que ya está a la vista al cargar se
     muestra al tiro, y un barrido a los 6 s revela lo pendiente.      */
  var porRevelar = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  Array.prototype.forEach.call(document.querySelectorAll("[data-rev-hijos]"), function (grupo) {
    Array.prototype.forEach.call(grupo.querySelectorAll(".reveal"), function (el, i) {
      el.style.setProperty("--retraso", ((i % 8) * 0.07).toFixed(2) + "s");
    });
  });

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

  /* ── Carrusel de herramientas ─────────────────────────────────
     El HTML trae UN grupo de logos; se clona para que la cinta pueda
     desplazarse a -50% y reiniciarse sin mostrar un hueco. El clon es
     decorativo: aria-hidden y sin foco.
     La cinta se pausa cuando nadie la ve — cursor encima, foco de
     teclado dentro, fuera del viewport o pestaña en segundo plano —
     porque una animación infinita corriendo a ciegas solo gasta
     batería. Con prefers-reduced-motion el CSS la deja quieta.       */
  var carrusel = document.getElementById("carrusel");
  var cinta = document.getElementById("carrusel-cinta");

  if (carrusel && cinta) {
    var clon = cinta.children[0].cloneNode(true);
    clon.setAttribute("aria-hidden", "true");
    Array.prototype.forEach.call(clon.querySelectorAll("a, [tabindex]"), function (el) {
      el.setAttribute("tabindex", "-1");
    });
    cinta.appendChild(clon);

    var motivos = { cursor: false, foco: false, fuera: false, oculto: false };
    function sincronizar() {
      carrusel.classList.toggle("pausa",
        motivos.cursor || motivos.foco || motivos.fuera || motivos.oculto);
    }

    carrusel.addEventListener("mouseenter", function () { motivos.cursor = true;  sincronizar(); });
    carrusel.addEventListener("mouseleave", function () { motivos.cursor = false; sincronizar(); });
    carrusel.addEventListener("focusin",  function () { motivos.foco = true;  sincronizar(); });
    carrusel.addEventListener("focusout", function () { motivos.foco = false; sincronizar(); });

    document.addEventListener("visibilitychange", function () {
      motivos.oculto = document.hidden;
      sincronizar();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entradas) {
        motivos.fuera = !entradas[0].isIntersecting;
        sincronizar();
      }).observe(carrusel);
    }
  }

  /* ── Tilt 3D de las tarjetas de los socios ────────────────────
     Escalón 2 de profundidad: la tarjeta se inclina siguiendo el
     cursor. Solo con mouse real — en pantalla táctil no existe el
     hover y el efecto tiene que morir con dignidad, no a medias.
     La fuerza va limitada a 5°: más que eso el elemento se despega
     de su propia caja y el retrato se lee torcido, no profundo.      */
  var puntero = window.matchMedia("(hover: hover) and (pointer: fine)");

  if (puntero.matches && !sinMovimiento) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-tilt]"), function (tarjeta) {
      tarjeta.addEventListener("mousemove", function (ev) {
        var caja = tarjeta.getBoundingClientRect();
        var x = (ev.clientX - caja.left) / caja.width - 0.5;    // -0.5 … 0.5
        var y = (ev.clientY - caja.top) / caja.height - 0.5;

        tarjeta.style.transform =
          "perspective(1000px) rotateY(" + (x * 5).toFixed(2) + "deg) " +
          "rotateX(" + (-y * 5).toFixed(2) + "deg) translateZ(4px)";
      });

      tarjeta.addEventListener("mouseleave", function () {
        tarjeta.style.transform = "";
      });
    });
  }
})();
