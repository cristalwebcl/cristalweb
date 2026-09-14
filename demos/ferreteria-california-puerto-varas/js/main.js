/* ══════════════════════════════════════════════════════════════════
   FERRETERÍA CALIFORNIA · Av. Colón, Puerto Varas — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: el plano del local es SVG
   escrito en el HTML, las tres tablas de mostrador son listas y la
   temporada es una lista de meses. El JS sólo agrega las apariciones
   al scroll y arma el mensaje de la consulta.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 0 · Video de fondo ──────────────────────────────────────────
     La foto es la base; el clip va encima. Sólo se carga si el
     visitante no pidió menos movimiento ni ahorra datos, se pide
     recién cuando la sección se acerca —240 px antes, así el fundido
     ya arrancó cuando llega— y se pausa fuera de vista para no gastar
     batería. Si el navegador bloquea el autoplay, se queda la foto y
     no se nota nada: por eso los dos play() llevan un .catch vacío. ── */
  var vids = document.querySelectorAll('video[data-src]');
  if (vids.length) {
    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorra = con && (con.saveData === true || /2g/.test(con.effectiveType || ''));
    if (!reduce && !ahorra) {
      var activar = function (v) {
        if (v.getAttribute('src')) { return; }   /* guarda de idempotencia */
        v.muted = true; v.loop = true; v.setAttribute('muted', '');  /* Safari iOS mira el ATRIBUTO */
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
            if (e.isIntersecting) {
              v.enVista = true; activar(v);
              if (v.paused && v.classList.contains('video--ver')) { v.play().catch(function () {}); }
            } else {
              v.enVista = false;
              if (!v.paused) { v.pause(); }
            }
          });
        }, { rootMargin: '240px 0px', threshold: 0.01 });
        Array.prototype.forEach.call(vids, function (v) { ov.observe(v); });
      } else {
        Array.prototype.forEach.call(vids, activar);
      }
      /* Al volver a la pestaña el navegador deja el clip en pausa: se
         reanuda sólo el que estaba a la vista. Se usa !== false y no
         === true a propósito: si el observer todavía no corrió,
         enVista es undefined y el clip igual tiene que reanudarse. */
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

  /* ── 1 · Cabecera ── */
  var cab = document.getElementById('cab');
  if (cab) {
    var flota = false;
    var mirar = function () {
      var abajo = window.pageYOffset > 40;
      if (abajo !== flota) { flota = abajo; cab.classList.toggle('cab--flota', abajo); }
    };
    window.addEventListener('scroll', mirar, { passive: true });
    mirar();
  }

  /* ── 2 · Apariciones ── */
  /* El --largo de los trazos del plano NO se calcula acá. Antes se medía
     con getTotalLength() y se escribía con el.style.setProperty(): la
     CSP lo permite, pero dejaba cuatro elementos con atributo style en
     la página viva y la lista de comprobación pide cero. Los rectángulos
     son de medida fija, así que el perímetro está escrito en el CSS. */

  /* ── La cifra que cuenta ──
     Sólo una de las cuatro, y es la única que hubo que ir a buscar.
     El valor final está escrito dentro del <b>, así que sin JS o con
     menos movimiento se lee igual; al terminar se restaura el
     textContent original para no perder el formato, y hay un segundo
     seguro por si el rAF se congela con la pestaña oculta. */
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

  var piezas = [];
  ['.cifras__lista', '.most .ancho', '.mostradores', '.tajo__txt',
   '.pegas .ancho:not(.pegas__grilla)', '.pegas__grilla',
   '.mit__foto', '.mit__txt', '.hoja .ancho', '.temp .ancho',
   '.meses', '.cita__txt', '.mos .ancho', '.mos__grilla',
   '.donde__cols > *', '.dueno__cols', '.dueno__cierre']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });
  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras__lista')) { contar(el); }
  };

  /* El observer NO se corta por reduced-motion: cortarlo destapa todo
     de golpe y mata el fundido, que es justo lo que la regla de la
     casa prohíbe apagar. El desplazamiento ya lo apaga el CSS. */
  if (!('IntersectionObserver' in window)) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        /* e.target se guarda FUERA del temporizador: la entrada del
           observer se puede reciclar. Y el retardo es (i % 4) * 60, no
           i * 60, para que un lote grande no acumule dos segundos. */
        var el = e.target;
        obs.unobserve(el);
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    piezas.forEach(function (el) {
      /* Lo que ya está en pantalla al cargar se destapa de inmediato:
         en una página corta o en un móvil apaisado el evento de scroll
         que lo destaparía puede no llegar nunca. */
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); } else { obs.observe(el); }
    });
  }
  /* Barrido a los 6 s, incondicional y fuera de la rama del observer:
     también cubre que el observer exista pero falle. classList.add es
     idempotente y contar() tiene su propia guarda. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 3 · Preguntar antes de ir ──
     El local no publica teléfono y CristalWeb todavía no tiene
     WhatsApp propio: el flujo entrega TEXTO listo para pegar. */
  var form = document.getElementById('form-preg');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');

  if (form && salida && btn) {
    var most   = document.getElementById('f-most');
    var que    = document.getElementById('f-que');
    var cuando = document.getElementById('f-cuando');

    var armar = function () {
      var q = que && que.value ? que.value.trim() : '';
      if (!q) { salida.textContent = ''; return ''; }
      var t = 'Hola, una consulta.';
      if (most && most.value) { t += '\nMostrador: ' + most.value; }
      t += '\nNecesito: ' + q;
      if (cuando && cuando.value.trim()) { t += '\nPara: ' + cuando.value.trim(); }
      salida.textContent = t;
      return t;
    };

    [most, que, cuando].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba qué necesita.'; que.focus(); return; }
      var avisar = function (ok) {
        btn.textContent = ok ? 'Copiado' : 'No se pudo copiar — selecciónelo arriba';
        setTimeout(function () { btn.textContent = 'Copiar el mensaje'; }, 2600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { avisar(true); }, function () { avisar(false); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = t; ta.setAttribute('readonly', '');
        ta.style.position = 'absolute'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        avisar(ok);
      }
    });
  }

  /* ── 4 · Botón flotante de consulta ──────────────────────────────
     El botón ya está visible por CSS y escrito en el HTML. Acá sólo
     se lo aparta mientras el visitante mira la portada, para no tapar
     el titular. Se observa la PORTADA, no el botón: el botón es fixed
     y un elemento fixed no entra ni sale de la ventana, así que
     observarlo no dispararía nunca. El estado inicial se calcula a
     mano por si el observador no llegara a dispararse. ── */
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

})();
