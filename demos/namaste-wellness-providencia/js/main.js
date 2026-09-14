/* ═══════════════════════════════════════════════════════════════════
   MAIN.JS «PRESENTACIÓN» — CristalWeb, 13-09-2026 (kit demos\presentacion)
   JavaScript clásico, patrón IIFE. Sin módulos, sin librerías, sin build.
   La página se lee COMPLETA sin este archivo: acá vive el movimiento,
   nunca el contenido. La luz que respira, el parallax de la banda y el
   desenfoque al scroll son CSS y no cuestan un solo evento.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 0 · cancelar el rescate (rescate.js quita .js a los 4 s) ── */
  if (window.__rescate) { clearTimeout(window.__rescate); window.__rescate = null; }

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ── 1 · Video de fondo (sólo en las demos que lo llevan) ─────────
     La foto es la base; el video va encima. Sólo se carga si no se
     pidió menos movimiento ni se ahorra datos, se pide 240 px antes de
     que la sección llegue y se pausa fuera de vista. Si el autoplay se
     bloquea, se queda la foto. Patrón de ESTANDAR-PREMIUM § 3.3. ── */
  var vids = document.querySelectorAll('video[data-src]');
  if (vids.length) {
    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorra = con && (con.saveData === true || /2g/.test(con.effectiveType || ''));
    if (!reduce && !ahorra) {
      var activar = function (v) {
        if (v.getAttribute('src')) { return; }
        v.muted = true; v.loop = true; v.setAttribute('muted', '');
        v.addEventListener('canplay', function () {
          var ver = function () {
            v.classList.add('video--ver');
            if (v.parentElement) { v.parentElement.classList.add('con-video'); }
          };
          var p = v.play();
          if (p && p.then) { p.then(ver).catch(function () {}); } else { ver(); }
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
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'visible') { return; }
        Array.prototype.forEach.call(vids, function (v) {
          if (v.enVista !== false && v.paused && v.classList.contains('video--ver')) { v.play().catch(function () {}); }
        });
      });
    }
  }


  /* ── 2 · Titulares palabra por palabra ────────────────────────────
     Cada palabra en una ventana (.pal, overflow hidden) que sube desde
     abajo. El texto ya estaba en el HTML: sólo se reenvuelve. El --i va
     por CSSOM (setProperty), que la CSP permite; un style="" no. Sólo
     se parten titulares de texto plano (sin etiquetas adentro). ── */
  function partir(el) {
    var lineas = el.querySelectorAll('.linea');
    var bloques = lineas.length ? Array.prototype.slice.call(lineas) : [el];
    var n = 0;
    bloques.forEach(function (b) {
      if (b.children.length) return;
      var palabras = b.textContent.trim().split(/\s+/);
      b.textContent = '';
      palabras.forEach(function (p, k) {
        var ventana = document.createElement('span');
        var dentro = document.createElement('span');
        ventana.className = 'pal';
        dentro.className = 'pal__in';
        dentro.textContent = p;
        dentro.style.setProperty('--i', n++);
        ventana.appendChild(dentro);
        b.appendChild(ventana);
        if (k < palabras.length - 1) b.appendChild(document.createTextNode(' '));
      });
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.portada__h1, .t2'), partir);
  Array.prototype.forEach.call(document.querySelectorAll('.t2'), function (t) { t.classList.add('titulo'); });

  var txt = document.querySelector('.portada__texto');
  setTimeout(function () { if (txt) txt.classList.add('ok'); }, 120);


  /* ── 3 · La cifra que cuenta (sólo la verificada) ─────────────────
     El valor final ya está escrito: sin JS o con reduced-motion se lee
     igual. ── */
  var contado = false;
  function contar(caja) {
    if (contado || reduce || !window.requestAnimationFrame) return;
    var el = caja.querySelector('[data-cuenta]');
    if (!el) return;
    contado = true;
    var fin = parseInt(el.getAttribute('data-cuenta'), 10);
    var texto = el.textContent;
    var dur = 900, t0 = 0;
    function paso(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / dur, 1);
      el.textContent = String(Math.round(fin * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(paso); else el.textContent = texto;
    }
    requestAnimationFrame(paso);
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  }


  /* ── 4 · Apariciones al scroll ────────────────────────────────────
     El observer va sobre el CONTENEDOR. Lo que ya está en pantalla se
     destapa al cargar y a los 6 s se destapa todo lo pendiente. ── */
  var piezas = [];
  ['.rotulo', '.titulo', '.entrada', '.nota', '.cifras__lista', '.fichas', '.tarjetas',
   '.banda__txt', '.cita__txt', '.mos__grilla', '.datos', '.aviso', '.mapa-g',
   '.dueno__cols', '.dueno__cierre', '.rev-extra']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });
  piezas.forEach(function (el) { el.classList.add('rev'); });

  function destapar(el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras__lista')) contar(el);
  }
  if (!('IntersectionObserver' in window)) {
    piezas.forEach(destapar);
  } else {
    var ob = new IntersectionObserver(function (es, o) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        var el = e.target;
        o.unobserve(el);
        setTimeout(function () { destapar(el); }, (i % 4) * 70);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) destapar(el);
      else ob.observe(el);
    });
  }
  setTimeout(function () { piezas.forEach(destapar); }, 6000);


  /* ── 5 · La bruma de las secciones oscuras se mueve apenas ────────
     La capa es un 24 % más alta que su marco. El marco es el PADRE. ── */
  (function parallax() {
    if (reduce) return;
    var capas = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if (!capas.length) return;
    var FUERZA = 0.12, pedido = false;
    function pintar() {
      pedido = false;
      var alto = window.innerHeight;
      capas.forEach(function (capa) {
        var r = capa.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > alto + 100) return;
        var avance = (r.top + r.height / 2 - alto / 2) / (alto / 2 + r.height / 2);
        capa.style.transform = 'translate3d(0,' + (avance * r.height * FUERZA).toFixed(1) + 'px,0)';
      });
    }
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; window.requestAnimationFrame(pintar); }
    }, { passive: true });
    window.addEventListener('resize', pintar, { passive: true });
    pintar();
  })();


  /* ── 6 · Botón flotante: se aparta mientras se mira la portada ────
     Se observa la PORTADA, no el botón (un fixed nunca entra ni sale). ── */
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
