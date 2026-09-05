/* ══════════════════════════════════════════════════════════════════
   CAMALEÓN · ARMADO DE MUEBLES · Ñuñoa — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: la tabla de minutos está
   escrita en el HTML, la repisa de la portada aparece armada y el
   botón de WhatsApp abre con un mensaje base. El JS agrega las
   apariciones al scroll, la cifra que cuenta, la suma de minutos, la
   frase de «cabe en una visita» y el mensaje armado con lo marcado.

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
  ['.cifras__lista', '.demora > .ancho:first-child', '.arma__grupo', '.arma__total', '.listo',
   '.tajo__txt', '.como .ancho > :not(.etapas)', '.etapas', '.armamos .ancho > :not(.chips)', '.chips',
   '.mitades__txt', '.cita__txt', '.mos .ancho', '.mos__grilla', '.agendar__cols > *', '.dueno .ancho']
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

  /* ── 3 · Cuánto se demora: suma, visita y mensaje ── */
  var form = document.getElementById('arma');
  if (!form) { return; }
  var cajas = form.querySelectorAll('input[type=checkbox][data-min]');
  var tNum = document.getElementById('t-num');
  var tTxt = document.getElementById('t-txt');
  var tVisita = document.getElementById('t-visita');
  var tMsg = document.getElementById('t-msg');
  var comuna = document.getElementById('a-comuna');
  var cuando = document.getElementById('a-cuando');
  var btnWsp = document.getElementById('btn-wsp');
  var btnCopiar = document.getElementById('btn-copiar');
  var base = 'https://wa.me/56993302260';

  var horas = function (min) {
    var h = Math.floor(min / 60), m = min % 60;
    if (!h) { return m + ' min'; }
    if (!m) { return h + (h === 1 ? ' hora' : ' horas'); }
    return h + ' h ' + m + ' min';
  };

  var armar = function () {
    var total = 0, lista = [];
    Array.prototype.forEach.call(cajas, function (c) {
      var fila = c.parentNode;
      var sel = fila.querySelector('.mueble__c');
      var n = sel ? parseInt(sel.value, 10) || 1 : 1;
      fila.classList.toggle('mueble--on', c.checked);
      if (sel) { sel.disabled = !c.checked; }
      if (!c.checked) { return; }
      total += n * (parseInt(c.getAttribute('data-min'), 10) || 0);
      lista.push((n > 1 ? n + ' × ' : '') + c.value);
    });

    var t = 'Hola, quiero agendar el armado de un mueble.';
    if (lista.length) {
      tNum.textContent = horas(total);
      tTxt.textContent = 'de armado, de referencia';
      tVisita.textContent = total <= 90 ? 'Cabe en una visita corta: media mañana o media tarde.'
                          : total <= 240 ? 'Es una visita de media jornada. Conviene partir en la mañana.'
                          : 'Conviene partir temprano, o dividir en dos visitas. Se coordina en el mensaje.';
      t = 'Hola, quiero agendar armado de: ' + lista.join(', ') + '.';
      t += '\nTiempo estimado según la página: ' + horas(total) + '.';
    } else {
      tNum.textContent = '0';
      tTxt.textContent = 'minutos de armado. Marca algo arriba.';
      tVisita.textContent = 'Marca los muebles que te llegaron y la página te dice si caben en una visita.';
    }
    if (comuna && comuna.value.trim()) { t += '\nComuna: ' + comuna.value.trim(); }
    if (cuando && cuando.value.trim()) { t += '\nMe acomoda: ' + cuando.value.trim(); }
    t += '\n¿Qué día pueden?';
    tMsg.textContent = lista.length ? t : '';
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
