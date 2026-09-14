/* ═══════════════════════════════════════════════════════════════════
   Los Troncos · demo 138 (tanda P4) — ampliada el 09-09-2026

   JS clásico, IIFE, sin librerías. Siete cosas, en este orden:
   1. Cancela el temporizador de rescate de la clase .js.
   2. Video de fondo (portada y cita): se pide tarde, se pausa fuera de
      vista y no se pide nunca si hay reduced-motion o ahorro de datos.
   3. Cabecera fantasma (por defecto es sólida; acá se agrega la
      transparencia sobre la portada y el esconder al bajar).
   4. La entrada de la portada, que no espera al scroll.
   5. Apariciones con IntersectionObserver, sobre CONTENEDORES, con sus
      dos resguardos; y la cifra que cuenta.
   6. T5 — el mensaje de reserva se arma en vivo y se puede copiar.
   7. El botón flotante, que se aparta mientras se mira la portada.
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
     2 · VIDEO DE FONDO
     La foto es la base; el video va encima. Sólo se carga si el
     visitante no pidió menos movimiento ni ahorra datos, se pide
     recién cuando la sección se acerca (240 px antes) y se pausa
     fuera de vista para no gastar batería. Si el navegador bloquea el
     autoplay, se queda la foto y no se nota nada.
     ═══════════════════════════════════════════════════════════════ */
  var vids = document.querySelectorAll('video[data-src]');
  if (vids.length) {
    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorra = con && (con.saveData === true || /2g/.test(con.effectiveType || ''));
    if (!reduce && !ahorra) {
      var activar = function (v) {
        if (v.getAttribute('src')) { return; }   /* guarda de idempotencia */
        v.muted = true; v.loop = true; v.setAttribute('muted', '');
        v.addEventListener('canplay', function () {
          var p = v.play();
          /* la clase se pone DENTRO del .then: si se pusiera antes, se
             vería un rectángulo negro fundiéndose sobre la foto */
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
            if (e.isIntersecting) {
              v.enVista = true; activar(v);
              if (v.paused && v.classList.contains('video--ver')) { v.play().catch(function () {}); }
            } else {
              v.enVista = false; if (!v.paused) { v.pause(); }
            }
          });
        }, { rootMargin: '240px 0px', threshold: 0.01 });
        Array.prototype.forEach.call(vids, function (v) { ov.observe(v); });
      } else {
        Array.prototype.forEach.call(vids, activar);
      }
      /* Al volver a la pestaña el navegador deja el clip en pausa: se
         reanuda sólo el que estaba a la vista. */
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'visible') { return; }
        Array.prototype.forEach.call(vids, function (v) {
          if (v.enVista !== false && v.paused && v.classList.contains('video--ver')) {
            v.play().catch(function () {});
          }
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
     No espera al scroll: ya está en pantalla. La foto se funde con la
     sección y el texto entra escalonado por CSS.
     ═══════════════════════════════════════════════════════════════ */
  var txt = document.querySelector('.portada__texto');
  setTimeout(function () {
    if (portada) { portada.classList.add('ok'); }
    if (txt)     { txt.classList.add('ok'); }
  }, 120);

  /* ═══════════════════════════════════════════════════════════════
     5 · LA CIFRA QUE CUENTA
     Sólo la que costó verificar: las 289 reseñas. El valor final está
     escrito dentro del <b>, así que sin JS o con reduced-motion se lee
     igual, y al terminar se restaura el texto original por si el
     número traía formato.
     ═══════════════════════════════════════════════════════════════ */
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
    /* Seguro por si el reloj del rAF no avanza (pestaña oculta, batería
       baja, navegador sin cabeza). OJO con el orden: hay que APAGAR el
       bucle antes de restaurar el texto. Sin la bandera `listo`, el
       siguiente cuadro volvía a escribir el número a medias y la banda
       se quedaba mostrando «0» para siempre — es lo que pasaba en las
       capturas, donde el 289 salía en cero. */
    setTimeout(function () { listo = true; el.textContent = texto; }, dur + 600);
  };

  /* ═══════════════════════════════════════════════════════════════
     5b · APARICIONES
     La clase .rev se agrega desde acá, nunca en el HTML: así, con el
     JS caído, no hay nada oculto que rescatar. El observador va sobre
     los CONTENEDORES —un elemento recortado a área cero nunca dispara
     IntersectionObserver y se queda invisible para siempre— y las
     grillas cascadean por CSS con la clase .cascada.
     ═══════════════════════════════════════════════════════════════ */
  var piezas = [];
  var sumar = function (sel) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
      if (piezas.indexOf(el) === -1) { piezas.push(el); }
    });
  };

  /* piezas que se esconden con la regla general .rev */
  ['.cifras__lista', '.puntos__cabecera > *', '.escala', '.ojo',
   '.mitades__foto', '.mitades__texto',
   '.cortes__cabecera > *', '.cortes__grilla', '.cortes__pie',
   '.cuantos__cuerpo > :not(.tablas):not(.reservar)', '.tablas', '.reservar > *',
   /* el .tajo NO va acá: entra entero como una pieza (lista `propias`),
      y su frase va dentro. Un reveal con translateY sobre un
      figcaption en position absoluto correría el velo y dejaría ver un
      dedo de foto sin teñir por abajo. */
   '.cita__texto', '.tira__pieza',
   '.galeria > :not(.galeria__grilla)', '.hueco',
   '.mos__titulo', '.mos__nota',
   '.dueno__cols > div', '.dueno__cierre'].forEach(sumar);
  piezas.forEach(function (el) { el.classList.add('rev'); });

  /* piezas que ya traen su propio estado oculto en el CSS y sólo
     necesitan la clase .ok (el tajo y las seis del mosaico) */
  var propias = [];
  ['.tajo', '.mos__p'].forEach(function (sel) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { propias.push(el); });
  });
  propias.forEach(function (el) { piezas.push(el); });

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

    piezas.forEach(function (el) {
      /* Resguardo 1 · lo que ya se ve al cargar se destapa de inmediato,
         sin esperar un evento de scroll que puede no llegar nunca. */
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { ob.observe(el); }
    });
  }

  /* Resguardo 2 · barrido a los 6 s, incondicional: si algo no se
     mostró, se muestra igual. add es idempotente y contar tiene guarda. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ═══════════════════════════════════════════════════════════════
     6 · EL PEDIDO (T5)
     El resumen se arma en vivo para que el cliente VEA el mensaje
     antes de mandarlo: sin eso, un botón de contacto es una caja negra
     y la gente no lo aprieta. No hay número que poner —la ficha del
     negocio no publica ninguno— así que acá el botón copia el texto;
     el día que haya WhatsApp basta escribir el wa.me en el href del
     HTML y este mismo código le cuelga el mensaje armado.
     ═══════════════════════════════════════════════════════════════ */
  var elQue     = document.getElementById('f-personas');
  var elCuando  = document.getElementById('f-cuando');
  var elResumen = document.getElementById('resumen');
  var elEnviar  = document.getElementById('enviar');
  var DESTINO   = elEnviar ? elEnviar.getAttribute('href') : '';

  if (elQue && elCuando && elResumen) {
    var ultimoTexto = '';
    var armar = function () {
      var texto = 'Hola, quiero reservar una mesa.\n' +
                  'Cuántos: ' + (elQue.value.trim()    || '(sin escribir)') + '\n' +
                  'Cuándo: '  + (elCuando.value.trim() || '(sin escribir)');

      ultimoTexto = texto;
      elResumen.textContent = texto;

      if (elEnviar && DESTINO.indexOf('wa.me') !== -1) {
        elEnviar.href = DESTINO.split('?')[0] + '?text=' + encodeURIComponent(texto);
      }
    };

    elQue.addEventListener('input', armar);
    elCuando.addEventListener('input', armar);
    armar();

    /* Copiar al portapapeles. Si el navegador no lo permite, no pasa
       nada malo: el mensaje está escrito ahí arriba para copiarlo a
       mano, que es el estado base de esta página. */
    if (elEnviar && DESTINO.indexOf('wa.me') === -1) {
      elEnviar.addEventListener('click', function (ev) {
        if (!navigator.clipboard || !navigator.clipboard.writeText) { return; }
        ev.preventDefault();
        navigator.clipboard.writeText(ultimoTexto).then(function () {
          var antes = elEnviar.textContent;
          elEnviar.textContent = 'Mensaje copiado';
          setTimeout(function () { elEnviar.textContent = antes; }, 2200);
        }).catch(function () {});
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     7 · EL BOTÓN FLOTANTE
     Ya está visible por CSS. Acá sólo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA, no el botón: el botón es fixed y un elemento fixed no
     entra ni sale de la ventana, así que observarlo no dispararía
     nunca.
     ═══════════════════════════════════════════════════════════════ */
  var wapp = document.querySelector('.wapp');
  if (wapp && portada) {
    /* estado inicial calculado a mano, por si el observador no llegara
       a dispararse: el botón no se queda pegado en el estado erróneo */
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
