/* ══════════════════════════════════════════════════════════════════
   BAZAR JULY · IMPRESIONES Y FOTOCOPIAS · Santiago Centro — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: el formulario está escrito
   en el HTML, la tabla de tiempos también, las hojas de la portada
   aparecen apiladas y el botón de WhatsApp abre con un mensaje base.
   El JS agrega las apariciones al scroll, la cifra que cuenta y el
   mensaje de cotización armado con lo que se elige.

   No carga nada, no mide nada, no manda nada a ninguna parte.
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

  /* ── 2 · Apariciones (observer sobre el contenedor) ── */
  var piezas = [];
  ['.cifras__lista', '.cotiza > .ancho:first-child', '.cot', '.tiempos', '.tajo__txt',
   '.archivo .ancho > :not(.reglas)', '.reglas', '.imprimimos .ancho > :not(.fam)', '.fam',
   '.mitades__txt', '.cita__txt', '.mos .ancho', '.mos__grilla', '.contacto__cols > *', '.dueno .ancho']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });
  piezas.forEach(function (el) { el.classList.add('rev'); });

  var contado = false;
  var contar = function (caja) {
    if (contado || reduce || !window.requestAnimationFrame) { return; }
    var el = caja.querySelector('[data-cuenta]');
    if (!el) { return; }
    contado = true;
    var fin = parseInt(el.getAttribute('data-cuenta'), 10);
    var texto = el.textContent;
    var dur = 1100, t0 = 0;
    var paso = function (t) {
      if (!t0) { t0 = t; }
      var p = Math.min((t - t0) / dur, 1);
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = String(Math.round(fin * e));
      el.style.transform = 'scale(' + (1 + 0.05 * Math.sin(Math.PI * p)).toFixed(4) + ')';
      if (p < 1) { requestAnimationFrame(paso); }
      else { el.textContent = texto; el.style.transform = ''; }
    };
    setTimeout(function () { requestAnimationFrame(paso); }, 150);
    setTimeout(function () { el.textContent = texto; el.style.transform = ''; }, dur + 600);
  };

  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras__lista')) { contar(el); }
  };

  if (!('IntersectionObserver' in window) || reduce) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { destapar(e.target); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); } else { obs.observe(el); }
    });
    setTimeout(function () { piezas.forEach(destapar); }, 6000);
  }

  /* ── 3 · Cotiza sin venir: el mensaje ── */
  var form = document.getElementById('cot');
  if (!form) { return; }
  var tipo = document.getElementById('c-tipo');
  var cant = document.getElementById('c-cant');
  var papel = document.getElementById('c-papel');
  var cuando = document.getElementById('c-cuando');
  var salida = document.getElementById('c-salida');
  var btnWsp = document.getElementById('btn-wsp');
  var btnCopiar = document.getElementById('btn-copiar');
  var base = 'https://wa.me/56981934386';

  var marcado = function (nombre) {
    var r = form.querySelector('input[name=' + nombre + ']:checked');
    return r ? r.value : '';
  };

  var armar = function () {
    var n = parseInt(cant.value, 10);
    if (!(n > 0)) { n = 1; }
    var t = 'Hola, quiero cotizar en Bazar July:';
    t += '\nTrabajo: ' + tipo.value;
    t += '\nCantidad: ' + n;
    t += '\nTamaño o papel: ' + papel.value;
    var color = marcado('color'); if (color) { t += '\nColor: ' + color; }
    var arch = marcado('archivo'); if (arch) { t += '\nArchivo: ' + arch; }
    if (cuando.value.trim()) { t += '\nPara cuándo: ' + cuando.value.trim(); }
    t += '\nLes mando el archivo por acá. ¿Precio y fecha?';
    salida.textContent = t;
    btnWsp.setAttribute('href', base + '?text=' + encodeURIComponent(t));
    return t;
  };

  Array.prototype.forEach.call(form.querySelectorAll('input, select'), function (c) {
    c.addEventListener('change', armar);
    c.addEventListener('input', armar);
  });
  armar();

  if (btnCopiar) {
    btnCopiar.addEventListener('click', function () {
      var t = armar();
      var avisar = function (ok) {
        btnCopiar.textContent = ok ? 'Copiado' : 'No se pudo copiar';
        setTimeout(function () { btnCopiar.textContent = 'Copiar el mensaje'; }, 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { avisar(true); }, function () { avisar(false); });
      } else { avisar(false); }
    });
  }

})();
