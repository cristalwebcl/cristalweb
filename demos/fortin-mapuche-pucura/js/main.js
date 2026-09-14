/* ══════════════════════════════════════════════════════════════════
   FORTIN MAPUCHE · Pucura — demo 144
   JS clasico, un IIFE, sin dependencias.

   OJO: los fondos de las laminas son CSS puro y no dependen de este
   archivo. Si main.js no llega, las laminas se ven completas con su
   fuego, su camino y sus tablones, las fotos se ven, el formulario
   sigue siendo legible y el boton de WhatsApp sigue ahi.

   REGLA QUE YA COSTO CARO (09-09-2026): si el CSS esconde algo bajo
   .js, ALGUIEN tiene que destaparlo. La version anterior escondia la
   foto de portada, el tajo y las seis fotos del mosaico y no las
   destapaba nunca: la pagina se veia negra de la mitad para abajo.
   Por eso ahora (a) la portada se destapa con una animacion CSS que no
   depende de este archivo, y (b) todo lo demas pasa por la lista de
   piezas de abajo, con un barrido incondicional a los 6 s.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · Cabecera fantasma ──
     La clase se toca SOLO cuando cambia el estado: cero trabajo por
     fotograma. Y el borde cambia de COLOR, no de ancho: transicionar
     el ancho salta un pixel la pagina entera. */
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
     Cuenta UNA sola de las cuatro: la que costo verificar (las
     reseñas). Las otras tres son aritmetica de la propia pagina o la
     herida, y un contador que sube un «0» se lee como truco.
     El valor final esta escrito dentro del <b>: sin JS, o con
     reduced-motion, se lee igual. */
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
      if (k < 1) { window.requestAnimationFrame(paso); }
      else { el.textContent = texto; }   /* restaura el formato al terminar */
    };
    window.requestAnimationFrame(paso);
    /* Seguro por si el rAF se congela con la pestaña oculta. */
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  };

  /* ── 3 · Apariciones al entrar en pantalla ──
     El observador va sobre el CONTENEDOR, nunca sobre un elemento
     recortado: un elemento con clip-path a area cero no dispara jamas.
     Las grillas llevan .cascada en el HTML y escalonan a sus hijos por
     CSS; las piezas sueltas escalonan por lote aca abajo. */
  var piezas = [];
  ['.cifras__lista',
   '.lamina:not(.lamina--portada) .lamina__texto > *',
   '.tajo',
   '.mitades__texto', '.mitades__foto',
   '.escala__texto > *', '.escala__fichas', '.escala__nota',
   '.cita__texto',
   '.avisar .reservar > *', '.datos',
   '.tira',
   '.mos__titulo', '.mos__nota', '.mos__grilla',
   '.dueno__cols', '.dueno__cierre']
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
        var el = e.target;              /* fuera del setTimeout a proposito */
        o.unobserve(el);
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    piezas.forEach(function (el) {
      /* Lo que ya esta en pantalla al cargar se destapa de inmediato:
         esperar un evento de scroll que quiza no llegue nunca es como
         se pierde media portada en un movil apaisado. */
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { obs.observe(el); }
    });
  }
  /* Barrido a los 6 s, incondicional y fuera de la rama del observador:
     si algo no se mostro, se muestra igual. classList.add es idempotente
     y contar() tiene su propia guarda. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 4 · La entrada de la portada ──
     No espera al scroll: la portada ya esta en pantalla. */
  var txtPortada = document.querySelector('.portada__texto');
  setTimeout(function () {
    if (txtPortada) { txtPortada.classList.add('ok'); }
  }, 120);

  /* ── 5 · Avisar que vamos ──
     Cuando el local de el numero, se cambia UNA linea: la de abajo. */
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
      /* textContent, jamas innerHTML: lo que escribe el visitante no
         se interpreta como marcado. */
      if (resumen) { resumen.textContent = texto; }
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

  /* ── 6 · WhatsApp flotante ──
     El boton ya esta visible por CSS. Aca solo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA, no el boton: el boton es fixed y un elemento fixed no
     entra ni sale de la ventana, asi que observarlo no dispararia
     nunca. */
  var wapp = document.querySelector('.wapp');
  var portada = document.querySelector('.portada');
  if (wapp && portada) {
    /* estado inicial calculado a mano, por si el observador no llegara
       a dispararse y el boton quedara pegado en un estado equivocado */
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
      }, { threshold: [0, 0.25, 0.55, 0.8, 1] }).observe(portada);
    } else {
      window.addEventListener('scroll', mirarWapp, { passive: true });
    }
  }

})();
