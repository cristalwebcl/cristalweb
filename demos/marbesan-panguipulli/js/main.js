/* ══════════════════════════════════════════════════════════════════
   Marbesán · Panguipulli — CristalWeb
   JavaScript clásico, patrón IIFE, sin librerías y sin build. Todo lo
   que hay acá es comodidad: el contenido está escrito en el HTML y la
   página se lee entera con el script bloqueado.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Video de fondo ──────────────────────────────────────────────
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

  /* ── La cabecera que se despega ──────────────────────────────── */
  var cab = document.getElementById('cab');
  if (cab) {
    var flota = false;
    var mirarCab = function () {
      var abajo = window.pageYOffset > 40;
      if (abajo !== flota) { flota = abajo; cab.classList.toggle('cab--flota', abajo); }
    };
    window.addEventListener('scroll', mirarCab, { passive: true });
    mirarCab();
  }

  /* ── La cifra que cuenta ──────────────────────────────────────
     Sólo cuenta UNA de las cuatro, y es la que costó verificar: las
     45 opiniones de Google. Las que son aritmética de la propia
     página y la herida (el 0) quedan quietas. El valor final está
     escrito dentro del <b>, así que sin JS o con reduced-motion se
     lee igual. ── */
  var contado = false;
  var contar = function (caja) {
    /* Si la pestaña no está a la vista, no se cuenta: el rAF se congela
       ahí y el número quedaría detenido a media cuenta. Se muestra el
       valor final, que es el que está escrito en el HTML. */
    if (contado || reduce || !window.requestAnimationFrame ||
        document.visibilityState !== 'visible') { return; }
    var el = caja.querySelector('[data-cuenta]');
    if (!el) { return; }
    contado = true;
    var fin = parseInt(el.getAttribute('data-cuenta'), 10);
    var texto = el.textContent;
    var dur = 900, t0 = 0, cerrado = false;
    var paso = function (t) {
      if (cerrado) { return; }
      if (!t0) { t0 = t; }
      var k = Math.min((t - t0) / dur, 1);
      el.textContent = String(Math.round(fin * (1 - Math.pow(1 - k, 3))));
      if (k < 1) { requestAnimationFrame(paso); }
      else { cerrado = true; el.textContent = texto; }
    };
    requestAnimationFrame(paso);
    /* Seguro para el caso en que el reloj de cuadros vaya más lento que
       el reloj de temporizadores (pestaña oculta, navegador sin cabeza,
       captura automática): se restaura el valor escrito y se CIERRA la
       cuenta, para que el cuadro siguiente no vuelva a pisarlo. */
    setTimeout(function () { cerrado = true; el.textContent = texto; }, dur + 600);
  };

  /* ── Apariciones (el observer va sobre el CONTENEDOR) ──────────
     Nunca sobre un elemento recortado: uno con clip-path a área cero
     no dispara IntersectionObserver y se queda invisible para
     siempre. ── */
  var piezas = [];
  ['.cifras__lista', '.firma .ancho > :not(.platos):not(.mesa)', '.platos', '.mesa',
   '.carta .ancho > :not(.fam)', '.fam', '.tajo__txt', '.cita__txt',
   '.mit__in', '.mos .ancho', '.mos__grilla',
   '.llevar__cols > *', '.contacto__cols > *', '.dueno .ancho']
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
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { ob.observe(el); }
    });
  }
  /* Barrido a los 6 s, incondicional: si algo no se mostró, se
     muestra igual. classList.add es idempotente. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── La entrada de la portada ─────────────────────────────────
     No espera al scroll: la portada ya está en pantalla. ── */
  var txt = document.querySelector('.portada__texto');
  setTimeout(function () { if (txt) { txt.classList.add('ok'); } }, 120);
  /* Seguro: a los 2,5 s el estado escondido deja de existir, corran o
     no las animaciones. Un navegador que las congela —headless, una
     pestaña en segundo plano, una captura automática— dejaría el
     titular invisible, y el titular es la venta. */
  setTimeout(function () { if (txt) { txt.classList.add('puesto'); } }, 2500);

  /* ── ¿Alcanza para dos? — la mesa se compone en PANTALLA ───────
     La salida NO va a WhatsApp, y es a propósito: el teléfono del
     negocio está en conflicto entre dos fuentes y esta página no
     inventa uno. El botón compone el texto para leerlo o copiarlo.
     Los platos se leen DEL DOM: si mañana cambia la carta escrita en
     el HTML, el mensaje cambia solo. textContent, jamás innerHTML. ── */
  var bs = document.querySelectorAll('.mesa__b');
  var salida = document.getElementById('mesa-txt');
  if (bs.length && salida) {
    var nombres = [];
    Array.prototype.forEach.call(document.querySelectorAll('.plato h3'), function (h) {
      nombres.push(h.textContent.trim());
    });
    var sinAlcohol = '';
    var chipSin = document.querySelector('.chip--sin');
    if (chipSin && chipSin.parentNode) {
      var n = chipSin.parentNode.querySelector('.trago__n');
      if (n) { sinAlcohol = n.textContent.trim(); }
    }
    var enMinuscula = function (s) {
      return s ? s.charAt(0).toLocaleLowerCase('es') + s.slice(1) : '';
    };
    var trago = sinAlcohol ? ' Y ' + (/limonada/i.test(sinAlcohol) ? 'una ' : 'un ') +
                             enMinuscula(sinAlcohol) + ' para el que maneja.' : '';
    /* Los nombres de los platos se leen del DOM tal cual están escritos,
       así que la frase nunca los pluraliza: se cuentan en PORCIONES. Sin
       eso saldría «tres ceviche peruano», que es exactamente el detalle
       por el que una demo se lee como hecha por una máquina. */
    var recetas = {
      '2': function () {
        return 'Una porción de ' + enMinuscula(nombres[0]) + ' para partir, una de ' + enMinuscula(nombres[1]) +
               ' y una de ' + enMinuscula(nombres[4]) + ' para el que no come carne.' + trago;
      },
      '4': function () {
        return 'Dos porciones de ' + enMinuscula(nombres[0]) + ' para la mesa, dos de ' + enMinuscula(nombres[2]) +
               ', una de ' + enMinuscula(nombres[3]) + ' para compartir y una de ' + enMinuscula(nombres[4]) +
               ' para el que no come carne.' + trago;
      },
      '6': function () {
        return 'Tres porciones de ' + enMinuscula(nombres[0]) + ' para partir, dos de ' + enMinuscula(nombres[1]) +
               ', una de ' + enMinuscula(nombres[3]) + ' para el centro, una de ' + enMinuscula(nombres[4]) +
               ' para el que no come carne y una de ' + enMinuscula(nombres[5]) + ' para el que anda apurado.' + trago;
      }
    };
    var poner = function (b) {
      var g = b.getAttribute('data-gente');
      Array.prototype.forEach.call(bs, function (o) {
        o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
      });
      if (recetas[g] && nombres.length >= 6) { salida.textContent = recetas[g](); }
    };
    Array.prototype.forEach.call(bs, function (b) {
      b.addEventListener('click', function () { poner(b); });
    });
  }

  /* ── WhatsApp flotante ────────────────────────────────────────
     El botón ya está visible por CSS. Acá sólo se lo aparta mientras
     el visitante mira la portada, para no tapar el titular. Se observa
     la PORTADA, no el botón: el botón es fixed y un elemento fixed no
     entra ni sale de la ventana, así que observarlo no dispararía
     nunca. ── */
  var wapp = document.querySelector('.wapp');
  var port = document.querySelector('.portada');
  if (wapp && port) {
    var mirarW = function () {
      var r = port.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      wapp.classList.toggle('wapp--arriba', visible > r.height * 0.55);
    };
    mirarW();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { wapp.classList.toggle('wapp--arriba', e.intersectionRatio > 0.55); });
      }, { threshold: [0, 0.55, 1] }).observe(port);
    } else {
      window.addEventListener('scroll', mirarW, { passive: true });
    }
  }
})();
