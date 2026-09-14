/* ═══════════════════════════════════════════════════════════════════
   Cocina de María · demo 137 (tanda P4) · premium 09-09-2026

   JS clásico, IIFE, sin librerías. Siete cosas:
   1. Cancela el temporizador de rescate de la clase .js.
   2. Los dos videos de fondo: se piden al acercarse, se pausan fuera
      de vista y no se descargan si se pidió menos movimiento.
   3. Cabecera fantasma (por defecto es sólida; acá se agrega la
      transparencia sobre la portada y el esconder al bajar).
   4. La entrada escalonada de la portada.
   5. La cifra que cuenta — sólo el 516, que es el que costó verificar.
   6. Apariciones al scroll, con el observer sobre los CONTENEDORES.
   7. El formulario que arma el mensaje y el botón flotante.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* 1 · el rescate ya no hace falta: main.js llegó */
  clearTimeout(window.__rescate);

  var cab     = document.getElementById('cab');
  var portada = document.getElementById('portada');
  var reduce  = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 2 · Video de fondo ──────────────────────────────────────────
     La foto es la base; el video va encima. Sólo se carga si el
     visitante no pidió menos movimiento ni ahorra datos, se pide
     recién cuando la sección se acerca (240 px antes) y se pausa
     fuera de vista para no gastar batería. Si el navegador bloquea
     el autoplay, se queda la foto y no se nota nada. ── */
  var vids = document.querySelectorAll('video[data-src]');
  if (vids.length) {
    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorra = con && (con.saveData === true || /2g/.test(con.effectiveType || ''));
    if (!reduce && !ahorra) {
      var activar = function (v) {
        if (v.getAttribute('src')) { return; }
        v.muted = true; v.loop = true; v.setAttribute('muted', '');
        v.addEventListener('canplay', function () {
          var p = v.play();
          if (p && p.then) { p.then(function () { v.classList.add('video--ver'); }).catch(function () {}); }
          else { v.classList.add('video--ver'); }
        }, { once: true });
        v.src = v.getAttribute('data-src');
        v.load();
      };
      if ('IntersectionObserver' in window) {
        var ov = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            var v = e.target;
            if (e.isIntersecting) { v.enVista = true; activar(v); if (v.paused && v.classList.contains('video--ver')) { v.play().catch(function () {}); } }
            else { v.enVista = false; if (!v.paused) { v.pause(); } }
          });
        }, { rootMargin: '240px 0px', threshold: 0.01 });
        Array.prototype.forEach.call(vids, function (v) { ov.observe(v); });
      } else { Array.prototype.forEach.call(vids, activar); }
      /* Al volver a la pestaña el navegador deja el clip en pausa:
         se reanuda sólo el que estaba a la vista. */
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'visible') { return; }
        Array.prototype.forEach.call(vids, function (v) {
          if (v.enVista !== false && v.paused && v.classList.contains('video--ver')) { v.play().catch(function () {}); }
        });
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     3 · CABECERA FANTASMA
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
     4 · LA ENTRADA DE LA PORTADA
     No espera al scroll: la portada ya está en pantalla. forwards y
     nunca both — both pisa lo que venía antes.
     ═══════════════════════════════════════════════════════════════ */
  var txt = document.querySelector('.portada__texto');
  setTimeout(function () { if (txt) { txt.classList.add('ok'); } }, 120);

  /* ═══════════════════════════════════════════════════════════════
     5 · LA CIFRA QUE CUENTA
     Una sola de las cuatro, y es la que costó verificar. Las otras
     tres son aritmética de la propia página y la herida: un contador
     que sube un «0» se lee como truco. El valor final está escrito
     dentro del <b>, así que sin JS o con menos movimiento se lee
     igual. La restauración de textContent al final y el temporizador
     de seguro cubren la pestaña oculta, donde el rAF se congela.
     ═══════════════════════════════════════════════════════════════ */
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

  /* ═══════════════════════════════════════════════════════════════
     6 · APARICIONES
     La clase .rev se agrega desde acá, nunca en el HTML: así, con el
     JS caído, no hay nada oculto que rescatar. El observer va sobre
     el CONTENEDOR: un elemento con clip-path a área cero no dispara
     nunca y se queda invisible para siempre.
     ═══════════════════════════════════════════════════════════════ */
  var piezas = [];
  ['.cifras__lista',
   '.pizarra__marco > :not(.platos)', '.platos',
   '.tajo__txt',
   '.carta__cabecera > *', '.carta__grupos .grupo > h3', '.carta__grupos .lineas', '.carta .firma',
   '.mitades__foto', '.mitades__texto',
   '.cita__texto',
   '.casera__cuerpo > *',
   '.tira',
   '.galeria > :not(.galeria__grilla)', '.galeria__grilla .gal',
   '.mos > :not(.mos__grilla)', '.mos__grilla',
   '.reserva__ficha > :not(.ficha)', '.reserva__ficha .ficha', '.reserva__caja',
   '.dueno__in > h2', '.dueno__cols', '.dueno__cierre']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });

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

    /* Lo que ya está en pantalla al cargar se destapa sin esperar un
       evento de scroll que en una página corta puede no llegar nunca. */
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { ob.observe(el); }
    });
  }

  /* Barrido a los 6 s, incondicional: si algo no se mostró, se muestra
     igual. classList.add es idempotente y contar() tiene su guarda. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ═══════════════════════════════════════════════════════════════
     7a · EL MENSAJE DE RESERVA
     El resumen se arma en vivo para que el cliente VEA el mensaje
     antes de mandarlo: sin eso, un botón de WhatsApp es una caja
     negra y la gente no lo aprieta. El destino apunta a esta misma
     sección mientras no haya número confirmado — no se inventa uno.
     El día que la casa dé el suyo, basta poner el wa.me en el href
     del HTML: este mismo código le cuelga el texto armado.
     textContent, nunca innerHTML.
     ═══════════════════════════════════════════════════════════════ */
  var elQue     = document.getElementById('f-personas');
  var elCuando  = document.getElementById('f-hora');
  var elResumen = document.getElementById('resumen');
  var elEnviar  = document.getElementById('enviar');
  var DESTINO   = elEnviar ? elEnviar.getAttribute('href') : '';

  if (elQue && elCuando && elResumen) {
    var armar = function () {
      var texto = 'Hola, quiero reservar una mesa para hoy.\n' +
                  'Cuántos: ' + (elQue.value.trim()    || '(sin escribir)') + '\n' +
                  'Hora: '    + (elCuando.value.trim() || '(sin escribir)');

      elResumen.textContent = texto;

      if (elEnviar && DESTINO.indexOf('wa.me') !== -1) {
        elEnviar.href = DESTINO.split('?')[0] + '?text=' + encodeURIComponent(texto);
      }
    };

    elQue.addEventListener('input', armar);
    elCuando.addEventListener('input', armar);
    elQue.addEventListener('change', armar);
    elCuando.addEventListener('change', armar);
    armar();
  }

  /* ═══════════════════════════════════════════════════════════════
     7b · WhatsApp flotante
     El botón ya está visible por CSS. Acá sólo se lo aparta mientras
     el visitante mira la portada, para no tapar el titular. Se observa
     la PORTADA, no el botón: el botón es fixed y un elemento fixed no
     entra ni sale de la ventana, así que observarlo no dispararía
     nunca.
     ═══════════════════════════════════════════════════════════════ */
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
        es.forEach(function (e) { wapp.classList.toggle('wapp--arriba', e.intersectionRatio > 0.55); });
      }, { threshold: [0, 0.55, 1] }).observe(portada);
    } else {
      window.addEventListener('scroll', mirarWapp, { passive: true });
    }
  }
})();
