/* ══════════════════════════════════════════════════════════════════
   ESCUELA RUTA CHILE · Maipú — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: la ruta es una lista
   ordenada con el camino ya dibujado, la calculadora muestra el caso
   de tres clases por semana escrito en el HTML, y el enlace a WhatsApp
   abre igual. El JS agrega las apariciones al scroll, la cifra que
   cuenta, la estimación de semanas y el mensaje armado.

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
  ['.cifras__lista', '.ruta .ancho', '.ruta__cuerpo', '.calc', '.tajo__txt',
   '.examen__cols > *', '.pruebas', '.carnet__txt', '.licencia',
   '.mitades__txt', '.donde__cols > *', '.cita__txt', '.mos .ancho',
   '.mos__grilla', '.contacto__cols > *', '.dueno .ancho']
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

  /* ── 3 · La calculadora de semanas. Referencia de oficio: 20 clases
        teóricas (dos a tres semanas, independiente del ritmo) más 20
        prácticas al ritmo elegido, y una semana de examen. ── */
  var calc = document.getElementById('calc');
  if (calc) {
    var radios = calc.querySelectorAll('input[name=ritmo]');
    var n = document.getElementById('calc-n');
    var sem = document.getElementById('calc-sem');
    var estimar = function () {
      var ritmo = 3;
      Array.prototype.forEach.call(radios, function (r) { if (r.checked) { ritmo = parseInt(r.value, 10) || 3; } });
      var practicas = Math.ceil(20 / ritmo);
      var teoricas = ritmo >= 5 ? 2 : 3;
      var total = practicas + teoricas + 1;
      n.textContent = String(ritmo);
      sem.textContent = total + ' semanas';
    };
    Array.prototype.forEach.call(radios, function (r) { r.addEventListener('change', estimar); });
    estimar();
  }

  /* ── 4 · Armar el mensaje de inscripción ── */
  var form = document.getElementById('form-ins');
  var salida = document.getElementById('salida');
  var btnWsp = document.getElementById('btn-wsp');
  var btnCopiar = document.getElementById('btn-copiar');
  if (form && salida && btnWsp) {
    var nombre = document.getElementById('f-nombre');
    var nivel  = document.getElementById('f-nivel');
    var ritmoS = document.getElementById('f-ritmo');
    var cuando = document.getElementById('f-cuando');
    var base = 'https://wa.me/56954960170';

    var armar = function () {
      var t = 'Hola, quiero inscribirme en Escuela Ruta Chile.';
      var nom = nombre && nombre.value ? nombre.value.trim() : '';
      if (nom) { t += '\nNombre: ' + nom; }
      if (nivel && nivel.value) { t += '\nPunto de partida: ' + nivel.value; }
      if (ritmoS && ritmoS.value) { t += '\nClases a la semana: ' + ritmoS.value; }
      if (cuando && cuando.value.trim()) { t += '\nMe acomoda: ' + cuando.value.trim(); }
      t += '\n¿Cuándo puedo partir?';
      salida.textContent = nom ? t : '';
      btnWsp.setAttribute('href', base + '?text=' + encodeURIComponent(t));
      return t;
    };
    [nombre, nivel, ritmoS, cuando].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
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
  }

})();
