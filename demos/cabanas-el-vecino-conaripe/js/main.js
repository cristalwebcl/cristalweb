/* ══════════════════════════════════════════════════════════════════
   CABANAS EL VECINO · Coñaripe — demo 149
   JS clasico, un IIFE, sin dependencias.

   Esta demo es T1: el contacto es el telefono verificado, escrito en
   el HTML como enlace tel:. NO hay formulario, asi que este archivo
   no participa en el contacto de ninguna forma: si no llega, el
   telefono sigue siendo un enlace que marca y el boton de WhatsApp
   sigue en su sitio, porque los dos estan escritos en el HTML.
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

  /* ── 2 · La entrada de la portada ──
     El fondo de portada arranca en opacity 0 bajo .js y sube cuando la
     seccion recibe .ok. Esto NO puede colgarse del observador de
     apariciones: ese le pondria ademas la clase .rev, y .rev esconde el
     elemento entero — es decir, escondería el titular. Va con su propio
     temporizador corto, que ademas hace que la foto se funda en vez de
     aparecer de golpe. */
  var portada = document.querySelector('.portada--foto');
  setTimeout(function () {
    if (portada) { portada.classList.add('ok'); }
  }, 120);

  /* ── 3 · La cifra que cuenta ──
     Sube SOLO el 124, que es el unico numero que costo verificar. El
     4,8 y el 6 son datos quietos y el 0 es la herida: un contador que
     hace subir un cero se lee como truco.
     El valor final esta escrito dentro del <b>, asi que sin JS o con
     menos movimiento se lee igual. */
  var contado = false;
  var contar = function (caja) {
    if (contado || reduce || !window.requestAnimationFrame) { return; }
    var el = caja.querySelector('[data-cuenta]');
    if (!el) { return; }
    contado = true;
    var fin = parseInt(el.getAttribute('data-cuenta'), 10);
    var texto = el.textContent;          /* el string original, con su formato */
    var dur = 900, t0 = 0;
    var paso = function (t) {
      if (!t0) { t0 = t; }
      var k = Math.min((t - t0) / dur, 1);
      el.textContent = String(Math.round(fin * (1 - Math.pow(1 - k, 3))));
      if (k < 1) { requestAnimationFrame(paso); }
      else { el.textContent = texto; }   /* restaura el formato al terminar */
    };
    requestAnimationFrame(paso);
    /* Seguro por si la pestaña queda oculta y el rAF se congela. */
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  };

  /* ── 4 · Apariciones al entrar en pantalla ──
     El observador va sobre CONTENEDORES. Las tres ventanas del pueblo se
     encienden con retardo desde el CSS (transition-delay): este archivo
     solo pone la clase .ok. Sin JS quedan encendidas de entrada, que es
     como deben verse.

     Y NO se corta por prefers-reduced-motion: cortarlo destapa todo de
     golpe y mata el fundido, que es justo lo que la casa no apaga. Lo
     que se apaga con menos movimiento es el desplazamiento, y eso lo
     hace el CSS. */
  var piezas = [];
  ['.lam__texto', '.pueblo', '.cifras__lista', '.datos',
   '.contra__in > :not(.contra__cols)', '.contra__cols',
   '.tajo', '.tajo__txt',
   '.mitades__foto', '.mitades__texto', '.cita__texto',
   /* El patron :not() revela los parrafos sueltos de la seccion como
      piezas y la grilla como UNA sola pieza, que despues cascadea sus
      hijos por su cuenta. Sin el hay que enumerar hijos a mano y se
      rompe en cuanto se agrega un parrafo. */
   '.dentro__in > :not(.dentro__lista)', '.dentro__lista',
   '.cierre', '.ficha', '.mapa',
   '.gal', '.tira__pieza', '.mos__p', '.dueno__cols'].forEach(function (sel) {
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
        /* El escalonado se toma del indice DENTRO DEL LOTE y con modulo
           4, para que un lote grande no acumule dos segundos de retardo. */
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    piezas.forEach(function (el) {
      /* Lo que ya esta en pantalla al cargar se destapa sin esperar un
         evento de scroll que en una pantalla apaisada puede no llegar. */
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { obs.observe(el); }
    });
  }
  /* Barrido incondicional a los 6 s: si algo no se mostro, se muestra
     igual. classList.add es idempotente y contar() tiene su guarda. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 5 · WhatsApp flotante ──
     El boton ya esta visible por CSS. Aca solo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA, no el boton: el boton es fixed y un elemento fixed no entra
     ni sale de la ventana, asi que observarlo no dispararia nunca. */
  var wapp = document.querySelector('.wapp');
  if (wapp && portada) {
    /* estado inicial calculado a mano: si el observador no llegara a
       dispararse, el boton no se queda pegado en un estado equivocado */
    var mirarWapp = function () {
      var r = portada.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      wapp.classList.toggle('wapp--arriba', visible > r.height * 0.55);
    };
    mirarWapp();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          wapp.classList.toggle('wapp--arriba', e.intersectionRatio > 0.55);
        });
      }, { threshold: [0, 0.55, 1] }).observe(portada);
    } else {
      window.addEventListener('scroll', mirarWapp, { passive: true });
    }
  }

})();
