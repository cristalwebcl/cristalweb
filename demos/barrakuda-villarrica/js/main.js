/* ═══════════════════════════════════════════════════════════════════
   BarraKuda · demo 139 (tanda P4) — subida a estándar premium 09-09-2026

   JS clásico, IIFE, sin librerías. Seis cosas:
   1. Cancela el temporizador de rescate de la clase .js.
   2. Cabecera fantasma (por defecto es sólida; acá se agrega la
      transparencia sobre la portada y el esconder al bajar).
   3. Entrada escalonada de la portada.
   4. Apariciones al scrollear, con sus tres resguardos, y la cifra
      que cuenta.
   5. El mensaje que se arma en vivo y se puede copiar. No se manda
      nada a ninguna parte: no hay un solo fetch en este archivo.
   6. El botón flotante, que sólo se aparta mientras se ve la portada.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* 1 · el rescate ya no hace falta: main.js llegó */
  clearTimeout(window.__rescate);

  var cab     = document.getElementById('cab');
  var portada = document.getElementById('portada');
  var reduce  = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════════════════════════
     2 · CABECERA FANTASMA
     Umbral de 120 px y deltas menores a 8 px ignorados, para que no
     tirite con el scroll fino del trackpad. Nunca se esconde si el
     foco del teclado está dentro de ella.
     ═══════════════════════════════════════════════════════════════ */
  if (cab) {
    var ultimo = window.pageYOffset || 0;
    var pedido = false;
    var UMBRAL = 120;
    var MINIMO = 8;

    var pintar = function () {
      pedido = false;
      var y = window.pageYOffset || 0;
      var delta = y - ultimo;

      var altoPortada = portada ? portada.offsetHeight : 0;
      if (y < altoPortada - 80) { cab.classList.add('cab--ghost'); }
      else                      { cab.classList.remove('cab--ghost'); }

      if (Math.abs(delta) < MINIMO) { return; }
      if (y < UMBRAL) {
        cab.classList.remove('cab--oculta');
      } else if (delta > 0 && !cab.contains(document.activeElement)) {
        cab.classList.add('cab--oculta');
      } else if (delta < 0) {
        cab.classList.remove('cab--oculta');
      }
      ultimo = y;
    };

    /* rAF sólo como throttle del scroll: permitido, es UI */
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; window.requestAnimationFrame(pintar); }
    }, { passive: true });

    pintar();
  }

  /* ═══════════════════════════════════════════════════════════════
     3 · LA ENTRADA DE LA PORTADA
     No espera al scroll: la portada ya está en pantalla.
     ═══════════════════════════════════════════════════════════════ */
  var caja = document.querySelector('.letrero__caja');
  setTimeout(function () {
    if (caja)    { caja.classList.add('ok'); }
    if (portada) { portada.classList.add('ok'); }
  }, 120);

  /* ═══════════════════════════════════════════════════════════════
     5 · EL MENSAJE QUE SE ARMA EN VIVO
     El resumen se arma para que el cliente VEA el mensaje antes de
     mandarlo: sin eso, un botón es una caja negra y la gente no lo
     aprieta. BarraKuda no publica número, así que acá no hay wa.me:
     el texto queda escrito y se puede copiar. El día que haya número,
     este mismo texto sale por WhatsApp cambiando una línea.
     ═══════════════════════════════════════════════════════════════ */
  var elQue     = document.getElementById('f-personas');
  var elCuando  = document.getElementById('f-cuando');
  var elResumen = document.getElementById('resumen');
  var elCopiar  = document.getElementById('copiar');
  var elAviso   = document.getElementById('aviso');

  if (elQue && elCuando && elResumen) {
    var armar = function () {
      var texto = 'Hola, vamos para allá.\n' +
                  'Cuántos: ' + (elQue.value.trim()    || '(sin escribir)') + '\n' +
                  'Cuándo: '  + (elCuando.value.trim() || '(sin escribir)');
      elResumen.textContent = texto;        /* nunca innerHTML */
      return texto;
    };

    elQue.addEventListener('input', armar);
    elCuando.addEventListener('input', armar);
    armar();                                /* una vez al cargar */

    if (elCopiar) {
      elCopiar.addEventListener('click', function () {
        var texto = armar();
        var decir = function (m) {
          if (!elAviso) { return; }
          elAviso.textContent = m;
          setTimeout(function () { elAviso.textContent = ''; }, 4000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(texto).then(function () {
            decir('copiado');
          }).catch(function () {
            decir('no se pudo copiar: selecciónelo arriba');
          });
        } else {
          decir('selecciónelo arriba y cópielo');
        }
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     6 · EL BOTÓN FLOTANTE
     Ya está visible por CSS. Acá sólo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA, no el botón: el botón es fixed y un elemento fixed no
     entra ni sale de la ventana, así que observarlo no dispararía
     nunca.
     ═══════════════════════════════════════════════════════════════ */
  var wapp = document.querySelector('.wapp');
  if (wapp && portada) {
    /* estado inicial calculado a mano: si el observador no llegara a
       dispararse, el botón no se queda pegado en un estado equivocado */
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

  /* ═══════════════════════════════════════════════════════════════
     4 · LA CIFRA QUE CUENTA
     Sólo cuenta una de las cuatro, y es la que costó verificar. Las
     que son aritmética de la propia página y el cero de la herida
     quedan quietas: un contador que sube un cero se lee como truco.
     El valor final está escrito dentro del <b>: sin JS o con
     reduced-motion se lee igual.
     ═══════════════════════════════════════════════════════════════ */
  var contado = false;
  var contar = function (caja2) {
    if (contado || reduce || !window.requestAnimationFrame) { return; }
    var el = caja2.querySelector('[data-cuenta]');
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
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  };

  /* ═══════════════════════════════════════════════════════════════
     4b · LAS APARICIONES
     La clase .rev se agrega desde acá, nunca en el HTML: así, con el
     JS caído, no hay nada oculto que rescatar. El observador va sobre
     el CONTENEDOR, jamás sobre el elemento recortado: un elemento con
     clip-path a área cero no dispara IntersectionObserver nunca.
     El observador NO se corta por reduced-motion: cortarlo destapa
     todo de golpe y mata el fundido, que es lo que no se apaga.
     ═══════════════════════════════════════════════════════════════ */
  var piezas = [];
  ['.cifras > :not(.cifras__lista)', '.cifras__lista',
   '.picoteo > h2', '.picoteo > p', '.tablas',
   '.barra > h2', '.barra > p', '.horas',
   '.tajo__txt',
   '.carta__ancho > :not(.fichas)', '.fichas',
   '.cita__texto',
   '.mitades__foto', '.mitades__texto',
   '.mos > :not(.mos__grilla)', '.mos__grilla',
   /* la HOJA entera es una pieza; el <thead> de adentro NO se observa
      nunca: bajo 620 px lleva clip-path a área cero y un elemento así no
      dispara IntersectionObserver jamás — se quedaría invisible. */
   '.gficha__ancho > :not(.gficha__hoja)', '.gficha__hoja',
   '.reserva__datos', '.reserva__form',
   '.dueno > h2', '.dueno__cols']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        if (piezas.indexOf(el) === -1) { piezas.push(el); }
      });
    });

  if (!piezas.length) { return; }
  piezas.forEach(function (el) { el.classList.add('rev'); });

  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras__lista')) { contar(el); }
  };

  if (!('IntersectionObserver' in window)) {
    piezas.forEach(destapar);
  } else {
    var ob = new IntersectionObserver(function (es, o) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        var el = e.target;
        o.unobserve(el);
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    /* Resguardo 1 · lo que ya está en pantalla al cargar se destapa sin
       esperar un evento de scroll que quizá nunca llegue. */
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { ob.observe(el); }
    });
  }

  /* Resguardo 2 · barrido a los 6 s, incondicional: si algo no se
     mostró, se muestra igual. classList.add es idempotente. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);
})();
