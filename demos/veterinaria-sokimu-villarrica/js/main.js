/* ══════════════════════════════════════════════════════════════════
   VETERINARIA SOKIMU · Villarrica — demo 156
   JS clasico, un IIFE, sin dependencias.

   Las filas de la farmacia son <details> nativos: abren y cierran sin
   una linea de JavaScript. Si este archivo no llega, la clasificacion
   receta/venta directa se lee completa.

   OJO CON LA CSP: `el.style.height = ...` desde JavaScript SI
   funciona con style-src 'self'. Lo que la CSP bloquea es el ATRIBUTO
   style escrito en el HTML, no el CSSOM. (Ver la demo 147, donde los
   style= del markup salieron de ancho cero.)

   09-09-2026 — faltaban tres cosas que el HTML ya pedia y que este
   archivo nunca hizo: apartar el boton flotante de WhatsApp sobre la
   portada, contar el 150 de la banda de cifras, y meter en la lista de
   apariciones la banda de cifras y los cuatro pasos de la visita (los
   dos llevan class="cascada" en el marcado y sin .rev no cascadeaba
   nada). Ademas el observer se cortaba entero con reduced-motion, que
   destapa todo de golpe y mata el fundido — y el fundido es
   exactamente lo que la regla de la casa prohibe apagar.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · Cabecera fantasma ── */
  var cab = document.getElementById('cab');
  if (cab) {
    var flotando = false;
    var mirarCab = function () {
      var abajo = window.pageYOffset > 40;
      if (abajo !== flotando) {
        flotando = abajo;
        cab.classList.toggle('cab--flota', abajo);
      }
    };
    window.addEventListener('scroll', mirarCab, { passive: true });
    mirarCab();
  }

  /* ── 2 · La cifra que cuenta ──
     Solo cuenta el 150 —la unica que costo verificar—. El 4,7 lleva
     coma, el 7 es aritmetica de esta misma pagina y el 0 es la herida:
     un contador ahi se leeria como truco.
     El valor final esta ESCRITO dentro del <b>, asi que sin JS o con
     reduced-motion se lee igual. Y se restaura el textContent original
     al terminar, porque el formato del numero no se puede perder. */
  var contado = false;
  var contar = function (caja) {
    if (contado || reduce || !window.requestAnimationFrame) { return; }
    var el = caja.querySelector('[data-cuenta]');
    if (!el) { return; }
    contado = true;
    var fin = parseInt(el.getAttribute('data-cuenta'), 10);
    var texto = el.textContent;
    var dur = 900, t0 = 0;
    var paso = function (t) {
      if (!t0) { t0 = t; }
      var k = Math.min((t - t0) / dur, 1);
      el.textContent = String(Math.round(fin * (1 - Math.pow(1 - k, 3))));
      if (k < 1) { requestAnimationFrame(paso); }
      else { el.textContent = texto; }
    };
    requestAnimationFrame(paso);
    /* seguro por si la pestana esta oculta y el rAF se congela */
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  };

  /* ── 3 · Apariciones al entrar en pantalla ──
     El observer va sobre el CONTENEDOR, nunca sobre el elemento
     recortado: un elemento con clip-path a area cero no dispara
     IntersectionObserver jamas y se queda invisible para siempre. */
  var piezas = [];
  ['.portada', '.portada__texto', '.cifras__lista', '.tajo', '.mos__p',
   '.mitades__texto', '.mitades__foto', '.cita__texto', '.tira__pieza',
   '.farmacia__cabecera', '.filas', '.dosis__cuerpo', '.visita__cab',
   '.pasos', '.visita__nota', '.cierre', '.dueno__cols']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        piezas.push(el);
      });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });
  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras__lista')) { contar(el); }
  };

  /* El observer NO se corta por reduced-motion: cortarlo destapa todo
     de golpe y mata el fundido. Lo que se apaga con esa preferencia son
     los desplazamientos, y eso vive en el CSS. */
  if (!('IntersectionObserver' in window)) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (entradas, o) {
      entradas.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        var el = e.target;
        o.unobserve(el);
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    /* lo que ya esta en pantalla al cargar se destapa sin esperar un
       evento de scroll que en una pagina corta puede no llegar nunca */
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { obs.observe(el); }
    });
  }
  /* barrido a los 6 s, incondicional y fuera de la rama del observer:
     si el observer existe pero falla, la pagina igual se ve entera */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 4 · WhatsApp flotante ──
     El boton ya esta visible por CSS. Aca solo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA, no el boton: el boton es fixed y un elemento fixed no
     entra ni sale de la ventana, asi que observarlo no dispararia
     nunca. */
  var wapp = document.querySelector('.wapp');
  var port = document.querySelector('.portada');
  if (wapp && port) {
    /* estado inicial calculado a mano: si el observador no llegara a
       dispararse, el boton no se queda pegado en un estado equivocado */
    var mirarWapp = function () {
      var r = port.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      wapp.classList.toggle('wapp--arriba', visible > r.height * 0.55);
    };
    mirarWapp();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { wapp.classList.toggle('wapp--arriba', e.intersectionRatio > 0.55); });
      }, { threshold: [0, 0.55, 1] }).observe(port);
    } else {
      window.addEventListener('scroll', mirarWapp, { passive: true });
    }
  }

})();
