/* ══════════════════════════════════════════════════════════════════
   VETERINARIA LACUSTRE · Villarrica — demo 157
   JS clasico, un IIFE, sin dependencias.

   Cuatro cosas y ninguna mas: la cabecera que se despega, las
   apariciones al scrollear, la cifra que cuenta y el boton flotante de
   WhatsApp. El telefono vive en cuatro sitios (barra fija, cabecera,
   portada y cierre) como enlace tel: y ninguno de los cuatro depende de
   este archivo. En una pagina de urgencia eso no es opcional.

   El ambiente de portada (el polvo en el resplandor) es CSS puro: no
   se toca desde aca, asi funciona aunque el script no llegue.

   OJO CON LA CSP: `el.textContent = ...` y `el.style.x = ...` desde
   JavaScript SI funcionan con style-src 'self'. Lo que la CSP bloquea
   es el ATRIBUTO style escrito en el HTML, no el CSSOM. (Ver la demo
   147, donde los style= del markup salieron de ancho cero.)
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
     Cuenta UNA sola de las cuatro: las 155 resenas, que es la que costo
     verificar. El 12 y el 3 son aritmetica de la propia pagina y el 0
     es la herida: un contador subiendolos se leeria como truco.
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
    /* seguro por si el rAF se congela con la pestana oculta */
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  };

  /* ── 3 · Apariciones al entrar en pantalla ──
     El observador va siempre sobre el CONTENEDOR, nunca sobre un
     elemento recortado: uno con clip-path a area cero no dispara
     IntersectionObserver jamas y se queda invisible para siempre.
     El patron `> :not(.x)` revela los parrafos sueltos como piezas y la
     grilla como UNA sola, que despues cascadea sus hijos por CSS. */
  var piezas = [];
  ['.portada', '.portada__texto',
   '.cifras > :not(.cifras__lista)', '.cifras__lista',
   '.cinco__cuerpo',
   '.mitades__texto', '.mitades__foto',
   '.urgencia__cuerpo', '.tres',
   '.llevar > :not(.fichas)', '.fichas',
   '.cita__texto',
   '.tajo', '.tajo__txt',
   '.datos__caja > :not(.datos__lista)', '.datos__lista', '.mapa',
   '.cierre', '.tira__pieza',
   '.mos__titulo', '.mos__nota', '.mos__p',
   '.dueno__cols']
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

  if (!('IntersectionObserver' in window)) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        var el = e.target;               /* fuera del setTimeout: la entrada
                                            del observador se recicla */
        obs.unobserve(el);
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
  /* barrido a los 6 s, incondicional: si algo no se mostro, se muestra
     igual. classList.add es idempotente y contar() tiene su guarda. */
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
    var mirarWapp = function () {
      var r = port.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      wapp.classList.toggle('wapp--arriba', visible > r.height * 0.55);
    };
    mirarWapp();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          wapp.classList.toggle('wapp--arriba', e.intersectionRatio > 0.55);
        });
      }, { threshold: [0, 0.55, 1] }).observe(port);
    } else {
      window.addEventListener('scroll', mirarWapp, { passive: true });
    }
  }

})();
