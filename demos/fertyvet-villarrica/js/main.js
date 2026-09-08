/* 187 · FertyVet — main.js
   IIFE, JS clásico, sin librerías, sin type="module" (rompe en file://).
   Hace tres cosas: cancelar el rescate, revelar grupos, y el header
   fantasma. El ambiente de partículas de la portada NO pasa por acá:
   es CSS puro y sigue funcionando aunque este archivo no cargue. */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Video de fondo ───────────────────────────────────────────────
     La foto es la base; el video va encima. Sólo se carga si el
     visitante no pidió menos movimiento ni ahorra datos, se pide
     recién cuando la sección se acerca y se pausa fuera de vista para
     no gastar batería. Si el navegador bloquea el autoplay, se queda
     la foto y no se nota nada. ── */
  var vids = document.querySelectorAll('video[data-src]');
  if (vids.length) {
    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorra = con && (con.saveData === true || /2g/.test(con.effectiveType || ''));
    if (!reduce && !ahorra) {
      var activar = function (v) {
        if (v.getAttribute('src')) { return; }
        v.muted = true; v.loop = true; v.setAttribute('muted', '');
        v.addEventListener('canplay', function () {
          var pr = v.play();
          if (pr && pr.then) { pr.then(function () { v.classList.add('video--ver'); }).catch(function () {}); }
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

  /* ── Reveals ──────────────────────────────────────────────────────
     El observer va sobre el CONTENEDOR, nunca sobre los hijos: un hijo
     con clip-path a área cero jamás dispara IntersectionObserver, y
     además el contenedor es lo que permite el stagger con --r. */
  var grupos = document.querySelectorAll('[data-rev-grupo]');

  function mostrar(el) { el.classList.add('ok'); }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entradas) {
      for (var i = 0; i < entradas.length; i++) {
        if (entradas[i].isIntersecting) {
          mostrar(entradas[i].target);
          io.unobserve(entradas[i].target);   // una sola vez: reaparecer cansa
        }
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    for (var g = 0; g < grupos.length; g++) {
      // Lo que ya se ve al cargar se muestra de inmediato, sin esperar scroll
      var r = grupos[g].getBoundingClientRect();
      if (r.top < window.innerHeight) { mostrar(grupos[g]); }
      else { io.observe(grupos[g]); }
    }
  } else {
    for (var k = 0; k < grupos.length; k++) { mostrar(grupos[k]); }
  }

  // Segundo resguardo: barrido a los 6 s pase lo que pase
  setTimeout(function () {
    for (var j = 0; j < grupos.length; j++) { mostrar(grupos[j]); }
  }, 6000);

  /* ── Header fantasma ──────────────────────────────────────────────
     Estado por defecto (sin JS) = sólido legible; el JS agrega la
     transparencia sobre la portada. Umbral 120 px, deltas < 8 px
     ignorados, jamás se esconde con el foco dentro. */
  var cab = document.getElementById('cab');
  if (cab) {
    var ultimo = window.pageYOffset || 0;
    var pedido = false;

    function pinta() {
      pedido = false;
      var y = window.pageYOffset || 0;
      var delta = y - ultimo;

      if (y <= 8) {
        cab.classList.add('cab--top');
        cab.classList.remove('cab--oculta');
      } else {
        cab.classList.remove('cab--top');
        if (Math.abs(delta) >= 8 && y > 120 && !cab.contains(document.activeElement)) {
          if (delta > 0) { cab.classList.add('cab--oculta'); }
          else { cab.classList.remove('cab--oculta'); }
        }
      }
      ultimo = y;
    }

    // rAF sólo como throttle de scroll — permitido: es UI, no la portada
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; window.requestAnimationFrame(pinta); }
    }, { passive: true });

    pinta();
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
    /* estado inicial calculado a mano: si el observador no llegara a
       dispararse, el boton no se queda pegado en un estado equivocado */
    var mirar = function () {
      var r = port.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      wapp.classList.toggle('wapp--arriba', visible > r.height * 0.55);
    };
    mirar();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { wapp.classList.toggle('wapp--arriba', e.intersectionRatio > 0.55); });
      }, { threshold: [0, 0.55, 1] }).observe(port);
    } else {
      window.addEventListener('scroll', mirar, { passive: true });
    }
  }

  void reduce;
})();
