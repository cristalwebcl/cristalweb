/* ══════════════════════════════════════════════════════════════════
   VETVAL · Valdivia — demo 162
   JS clasico, un IIFE, sin dependencias.

   Todo lo que hay acá es comodidad: la página está escrita entera en el
   HTML y se lee y se vende sin este archivo. Lo único que se pierde sin
   él son las apariciones al scrollear, el conteo de una cifra y que el
   botón de WhatsApp se aparte mientras se mira la portada.

   OJO CON LA CSP: `el.style.height = ...` desde JavaScript SI
   funciona con style-src 'self'. Lo que la CSP bloquea es el ATRIBUTO
   style escrito en el HTML, no el CSSOM. (Ver la demo 147, donde los
   style= del markup salieron de ancho cero.)
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · Cabecera fantasma ──
     La clase se toca sólo cuando cambia el estado: cero trabajo por
     frame. Y lo que transiciona es el COLOR del borde, no su ancho —
     transicionar border-width salta un pixel la página entera. */
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
     Cuenta UNA sola de las cuatro, y es la que costó verificar (las
     reseñas). Las otras tres son aritmética de la propia página o la
     herida: un contador que sube el «0» se lee como truco.
     El valor final está escrito dentro del <b>, así que sin JS o con
     menos movimiento se lee igual; y al terminar se restaura el texto
     original para no dejar convertido un número con formato. */
  var contado = false;
  var contar = function (caja) {
    if (contado || reduce || !window.requestAnimationFrame) { return; }
    var el = caja.querySelector('[data-cuenta]');
    if (!el) { return; }
    contado = true;
    var fin = parseInt(el.getAttribute('data-cuenta'), 10);
    var texto = el.textContent;
    var dur = 900, t0 = 0, listo = false;
    var paso = function (t) {
      if (listo) { return; }
      if (!t0) { t0 = t; }
      var k = Math.min((t - t0) / dur, 1);
      el.textContent = String(Math.round(fin * (1 - Math.pow(1 - k, 3))));
      if (k < 1) { requestAnimationFrame(paso); }
      else { listo = true; el.textContent = texto; }
    };
    requestAnimationFrame(paso);
    /* Seguro para la pestaña oculta, donde el rAF se congela — y para
       los navegadores sin cabeza, donde el reloj de rAF puede no avanzar
       y el bucle se quedaría pisando el «157» con un «0» eterno. El
       `listo` es lo que corta el bucle, no sólo restaura el texto. */
    setTimeout(function () { listo = true; el.textContent = texto; }, dur + 600);
  };

  /* ── 3 · La entrada de la portada ──
     No espera al scroll: la portada ya está en pantalla, así que su
     bloque de texto NO entra por el observer. Las cinco piezas se
     escalonan por CSS (animation-delay por nth-child, 70 ms de paso);
     acá sólo se da la orden de partida a los 120 ms. La última arranca
     a los 0,28 s, por debajo del techo de 0,4 s de la casa. */
  var portadaTexto = document.querySelector('.portada__texto');
  setTimeout(function () {
    if (portadaTexto) { portadaTexto.classList.add('ok'); }
  }, 120);

  /* ── 4 · Apariciones al entrar en pantalla ──
     El observer va siempre sobre el CONTENEDOR, nunca sobre un elemento
     recortado: uno con clip-path a área cero no dispara jamás y se queda
     invisible para siempre (por eso el rótulo del botón flotante, que
     bajo 520 px va con clip-path, no está en esta lista).

     El patrón `:not()` deja los párrafos sueltos como piezas y la
     grilla como UNA sola pieza que luego cascadea a sus hijos por CSS.
     Sin él habría que enumerar hijos a mano y se rompe al agregar uno. */
  var piezas = [];
  ['.portada',
   '.cifras__lista',
   '.cuanto__cuerpo > :not(.puntos)', '.puntos',
   '.tajo', '.tajo__txt',
   '.mitades__texto', '.mitades__foto',
   '.consulta__cabecera', '.ficha', '.consulta > .firma',
   '.cita__texto',
   '.antes__cuerpo > :not(.momentos)', '.momentos',
   '.cierre > :not(.datos)', '.datos',
   '.tira__pieza',
   '.mos > :not(.mos__grilla)', '.mos__p',
   '.dueno > :not(.dueno__cols)', '.dueno__cols']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        if (piezas.indexOf(el) === -1) { piezas.push(el); }
      });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });

  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras__lista')) { contar(el); }
  };

  if (!('IntersectionObserver' in window)) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (entradas, o) {
      entradas.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        var el = e.target;
        o.unobserve(el);
        /* módulo 4 para que un lote grande no acumule dos segundos */
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    /* Lo que YA está en pantalla al cargar se destapa de inmediato: en
       una página corta o en un móvil apaisado el evento de scroll que
       lo despertaría puede no llegar nunca. */
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { obs.observe(el); }
    });
  }
  /* Barrido a los 6 s, incondicional y fuera de la rama del observer:
     si algo no se mostró, se muestra igual. classList.add es idempotente
     y contar() tiene su propia guarda. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

})();
