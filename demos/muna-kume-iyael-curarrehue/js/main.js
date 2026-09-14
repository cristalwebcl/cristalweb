/* ══════════════════════════════════════════════════════════════════
   MUNA KUME IYAEL · Curarrehue — demo 143
   JS clasico, un IIFE, sin dependencias.

   OJO: las cinco fichas de ingredientes, la tabla del ano y la ficha de
   reserva NO dependen de este archivo. Estan escritas en el HTML,
   incluidas las barras de meses. Si este archivo no llega, la pagina se
   lee y se vende entera.
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
     Cuenta UNA sola de las cuatro, y es la que costo verificar (las
     resenas). Las otras tres son aritmetica de la propia pagina o la
     herida: un contador que sube el «5» de una grilla se lee como
     truco. El valor final esta escrito dentro del <b>, asi que sin JS
     o con reduced-motion se lee igual, y al terminar se restaura el
     texto original por si trae formato. */
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
    /* Seguro por si la pestana se oculta y el rAF se congela. La bandera
       es la parte importante: sin ella, un rAF que despierta DESPUES del
       seguro vuelve a pisar el numero con el valor a medio camino. */
    setTimeout(function () { listo = true; el.textContent = texto; }, dur + 600);
  };

  /* ── 3 · Apariciones al entrar en pantalla ──
     El observador va siempre sobre el CONTENEDOR. Nunca sobre el
     <thead> de la tabla, que en telefono tiene clip-path a area cero:
     un elemento asi no dispara jamas y se quedaria invisible. */
  var piezas = [];
  ['.portada', '.portada__texto', '.cifras__lista',
   '.glosario__cabecera', '.fichas',
   '.tajo', '.mitades__texto', '.mitades__foto',
   '.subida__cuerpo', '.despensa__cuerpo',
   '.cita__texto', '.temporada__cuerpo', '.razones',
   '.tira__pieza', '.mos__p', '.reserva__cuerpo', '.dueno__cols']
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

  if (!('IntersectionObserver' in window) || reduce) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        var el = e.target;
        obs.unobserve(el);
        destapar(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    /* Lo que ya esta en pantalla al cargar se destapa de inmediato: en
       una pantalla apaisada o en una pagina corta el evento de scroll
       puede no llegar nunca. */
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { obs.observe(el); }
    });
  }
  /* Barrido a los 6 s, incondicional: si algo no se mostro, se muestra
     igual. classList.add es idempotente y contar() tiene su guarda. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 4 · WhatsApp flotante ──
     El boton ya esta visible por CSS. Aca solo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA, no el boton: el boton es fixed y un elemento fixed no
     entra ni sale de la ventana, asi que observarlo no dispararia
     nunca. */
  var wapp = document.querySelector('.wapp');
  var portada = document.querySelector('.portada');
  if (wapp && portada) {
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

  /* ── 5 · La reserva (T5) ──
     Cuando el local de el numero, se cambia UNA linea: la de abajo.
     Mientras tanto el mensaje se arma en pantalla para leerlo por
     telefono o copiarlo, y el boton no lleva a ninguna parte. No se
     inventa un WhatsApp: es regla de la casa. */
  var NUMERO = '';   /* falta: el numero del local, formato 56912345678 */

  var form = document.getElementById('form-mesa');
  if (form) {
    var cuando   = document.getElementById('f-cuando');
    var personas = document.getElementById('f-personas');
    var nota     = document.getElementById('f-nota');
    var resumen  = document.getElementById('resumen');
    var enviar   = document.getElementById('enviar');

    var armar = function () {
      var c = (cuando   && cuando.value   || '').trim();
      var p = (personas && personas.value || '').trim();
      var v = (nota     && nota.value     || '').trim();

      if (!c && !p && !v) {
        return 'El mensaje se arma acá abajo a medida que escribe.';
      }

      var t = 'Hola, quisiera reservar una mesa';
      if (p) { t += ' para ' + p + (p === '1' ? ' persona' : ' personas'); }
      if (c) { t += ' el ' + c; }
      t += '.';
      if (v) { t += ' ' + v + '.'; }
      if (!p || !c) {
        t += ' (Falta indicar ' + (!p ? 'cuántos son' : '') +
             (!p && !c ? ' y ' : '') +
             (!c ? 'el día y la hora' : '') + '.)';
      }
      return t;
    };

    var refrescar = function () {
      var texto = armar();
      if (resumen) { resumen.textContent = texto; }   /* nunca innerHTML */
      if (enviar && NUMERO) {
        enviar.setAttribute('href',
          'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(texto));
      }
    };

    [cuando, personas, nota].forEach(function (i) {
      if (i) { i.addEventListener('input', refrescar); }
    });
    refrescar();

    if (enviar && !NUMERO) {
      enviar.addEventListener('click', function (ev) { ev.preventDefault(); });
    }
    form.addEventListener('submit', function (ev) { ev.preventDefault(); });
  }

})();
