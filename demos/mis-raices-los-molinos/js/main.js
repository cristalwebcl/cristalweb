/* ══════════════════════════════════════════════════════════════════
   MIS RAICES · Los Molinos — demo 141
   JS clasico, un IIFE, sin dependencias.

   OJO: el calendario de mariscos NO depende de este archivo. Las filas
   son <details> nativos: abren y cierran sin una linea de JavaScript.
   Si este archivo no llega, la pieza firma sigue funcionando entera.
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
    var mirar = function () {
      var abajo = window.pageYOffset > 40;
      if (abajo !== flotando) {
        flotando = abajo;
        cab.classList.toggle('cab--flota', abajo);
      }
    };
    window.addEventListener('scroll', mirar, { passive: true });
    mirar();
  }

  /* ── 2 · La cifra que cuenta ──
     Sólo cuenta UNA de las cuatro, y es la que costó verificar (las
     reseñas de Google, con su fecha). Las que son aritmética de la
     propia página —los 6 productos, las 3 fotos— y sobre todo el CERO
     de la herida quedan quietas: un contador que sube un 6 de una
     grilla se lee como truco, y un cero que sube desde cero no se ve.

     El valor final está ESCRITO dentro del <b>: sin JS, o con
     reduced-motion, la cifra se lee igual. Y al terminar se restaura el
     textContent original, porque el formato del string —si mañana dice
     1.200— no lo devuelve el entero calculado. */
  var contado = false;
  var contar = function (caja) {
    if (contado || reduce || !window.requestAnimationFrame) { return; }
    var el = caja.querySelector('[data-cuenta]');
    if (!el) { return; }
    contado = true;
    var fin = parseInt(el.getAttribute('data-cuenta'), 10);
    if (!fin) { return; }
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
    /* seguro por si la pestaña se oculta y el rAF se congela */
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  };

  /* ── 3 · Apariciones al entrar en pantalla ──
     El observador va sobre el CONTENEDOR, nunca sobre el elemento
     recortado. El patrón `> :not(.grilla)` revela los párrafos sueltos
     de una sección como piezas y la grilla como UNA sola pieza, que es
     la que después cascadea a sus hijos por --i. */
  var piezas = [];
  ['.portada', '.portada__texto', '.cifras__lista', '.cifras__pie', '.tajo',
   '.mos__p', '.mitades__texto', '.mitades__foto', '.cita__texto', '.tira__pieza',
   '.mar__cabecera', '.filas', '.ojo',
   '.oficio__cuerpo > :not(.fichas)', '.fichas',
   '.linea__cuerpo > *',
   '.vista__cuerpo', '.dueno__cols']
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

  /* El observador NO se corta por reduced-motion: cortarlo destaparía
     todo de golpe y mataría el fundido, que es justo lo que la regla de
     la casa prohíbe apagar. Lo que se apaga —el desplazamiento— se
     apaga en el CSS. */
  if (!('IntersectionObserver' in window)) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { destapar(e.target); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { obs.observe(el); }
    });
  }
  /* Barrido a los 6 s, INCONDICIONAL y fuera de la rama del observador:
     tambien cubre el caso de que el observador exista pero falle.
     classList.add es idempotente y contar() tiene su propia guarda, asi
     que llamar destapar dos veces no hace nada. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 4 · La reserva (T5) ──
     Cuando el local de el numero, se cambia UNA linea: la de abajo. */
  var NUMERO = '';   /* falta: el numero del local, formato 56912345678 */

  var form = document.getElementById('form-mesa');
  if (form) {
    var cuando   = document.getElementById('f-cuando');
    var personas = document.getElementById('f-personas');
    var vista    = document.getElementById('f-vista');
    var resumen  = document.getElementById('resumen');
    var enviar   = document.getElementById('enviar');

    var armar = function () {
      var c = (cuando   && cuando.value   || '').trim();
      var p = (personas && personas.value || '').trim();
      var v = (vista    && vista.value    || '').trim();

      if (!c && !p && !v) {
        return 'El mensaje se arma acá abajo a medida que escribe.';
      }

      var t = 'Hola, quisiera reservar una mesa';
      if (p) { t += ' para ' + p + (p === '1' ? ' persona' : ' personas'); }
      if (c) { t += ' el ' + c; }
      t += '.';
      if (v) { t += ' Sobre la mesa con vista: ' + v + '.'; }
      if (!p || !c) {
        t += ' (Falta indicar ' + (!p ? 'cuántos son' : '') +
             (!p && !c ? ' y ' : '') +
             (!c ? 'el día y la hora' : '') + '.)';
      }
      return t;
    };

    var refrescar = function () {
      var texto = armar();
      if (resumen) { resumen.textContent = texto; }
      if (enviar && NUMERO) {
        enviar.setAttribute('href',
          'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(texto));
      }
    };

    [cuando, personas, vista].forEach(function (i) {
      if (i) { i.addEventListener('input', refrescar); }
    });
    refrescar();

    if (enviar && !NUMERO) {
      enviar.addEventListener('click', function (ev) { ev.preventDefault(); });
    }
    form.addEventListener('submit', function (ev) { ev.preventDefault(); });
  }

  /* ── 5 · WhatsApp flotante ──
     El boton ya esta visible por CSS. Aca solo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA, no el boton: el boton es fixed y un elemento fixed no entra
     ni sale de la ventana, asi que observarlo no dispararia nunca.
     La variable se llama mirarWapp y no mirar porque `var` es de ambito
     de funcion y arriba ya hay una `mirar` para la cabecera. */
  var wapp = document.querySelector('.wapp');
  var portada = document.querySelector('.portada');
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
