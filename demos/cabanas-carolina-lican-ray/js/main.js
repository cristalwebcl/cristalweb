/* ══════════════════════════════════════════════════════════════════
   CABANAS CAROLINA · Lican Ray — demo 148
   JS clasico, un IIFE, sin dependencias.

   Esta demo es T1: el contacto es el telefono verificado, escrito en
   el HTML como enlace tel:. NO hay formulario, asi que este archivo
   no participa en el contacto de ninguna forma: si no llega, el
   telefono sigue siendo un enlace que marca y el boton verde de
   WhatsApp sigue estando (esta escrito en el HTML y es visible por
   defecto; el JS solo lo aparta mientras se mira la portada).

   Cinco bloques: cabecera que se despega, apariciones al scrollear,
   la cifra que cuenta, el boton flotante y nada mas.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · Cabecera fantasma ──
     La clase se toca SOLO cuando cambia el estado: cero trabajo por
     frame. El borde cambia de color, no de ancho: transicionar el
     ancho salta un pixel la pagina entera. */
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
     UNA sola de las cuatro sube, y es la que costo verificar (las 169
     resenas de Google). Las otras tres son aritmetica de la propia
     pagina y la herida: un contador que sube un 6 se lee como truco.
     El valor final esta escrito dentro del <b>, asi que sin JS o con
     reduced-motion se lee igual. La restauracion final del texto y el
     temporizador de seguro cubren la pestana oculta, donde el
     requestAnimationFrame se congela. */
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
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  };

  /* ── 3 · Apariciones al entrar en pantalla ──
     El observador va SIEMPRE sobre el CONTENEDOR: un elemento con
     clip-path a area cero nunca dispara IntersectionObserver y se
     quedaria invisible para siempre. Los contenedores marcados
     .cascada en el HTML se neutralizan por CSS y cascadean sus hijos;
     las piezas sueltas entran con el retardo por lote de aca abajo.
     El observador NO se corta por reduced-motion: cortarlo destapa
     todo de golpe y mata el fundido, que es justo lo que la regla de
     la casa prohibe apagar. Lo que se apaga esta en el CSS. */
  var piezas = [];
  ['.portada', '.portada__texto', '.cifras__lista',
   '.unidades__cabecera', '.fichas', '.ojo',
   '.tajo', '.vieja__cuerpo', '.fallas',
   '.incluye__cuerpo', '.huecos', '.cita__texto',
   '.mitades__texto', '.mitades__foto', '.tira__pieza', '.mos__p',
   '.reserva__intro', '.datos', '.cierre', '.dueno__cols'
  ].forEach(function (sel) {
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
    var obs = new IntersectionObserver(function (entradas, o) {
      entradas.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        var el = e.target;
        o.unobserve(el);
        /* El indice es el del LOTE, no el global: con el modulo 4 un
           lote grande nunca acumula dos segundos de retardo. */
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    piezas.forEach(function (el) {
      /* Lo que ya esta en pantalla al cargar se destapa de inmediato,
         sin esperar un evento de scroll que en una pantalla apaisada
         puede no llegar nunca. */
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { obs.observe(el); }
    });
  }
  /* Barrido a los 6 s, incondicional y fuera de la rama del
     observador: cubre tambien el caso de que el observador exista pero
     falle. classList.add es idempotente y contar() tiene su guarda. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 4 · WhatsApp flotante ──
     El boton ya esta visible por CSS. Aca solo se lo aparta mientras
     el visitante mira la portada, para no tapar el titular. Se observa
     la PORTADA, no el boton: el boton es fixed y un elemento fixed no
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
        es.forEach(function (e) {
          wapp.classList.toggle('wapp--arriba', e.intersectionRatio > 0.55);
        });
      }, { threshold: [0, 0.55, 1] }).observe(port);
    } else {
      window.addEventListener('scroll', mirarWapp, { passive: true });
    }
  }

  /* ── Boton flotante de contacto ───────────────────────────────────
     El boton ya se ve por CSS. Aca solo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA, no el boton: un elemento fixed nunca entra ni sale de la
     ventana, asi que observarlo no dispararia jamas. ── */
  var flota = document.querySelector('.flota');
  var portadaF = document.querySelector('.portada');
  if (flota && portadaF) {
    var mirarFlota = function () {
      var r = portadaF.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      flota.classList.toggle('flota--arriba', visible > r.height * 0.55);
    };
    mirarFlota();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { flota.classList.toggle('flota--arriba', e.intersectionRatio > 0.55); });
      }, { threshold: [0, 0.55, 1] }).observe(portadaF);
    } else {
      window.addEventListener('scroll', mirarFlota, { passive: true });
    }
  }

})();