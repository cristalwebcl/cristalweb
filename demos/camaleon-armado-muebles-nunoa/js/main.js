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
