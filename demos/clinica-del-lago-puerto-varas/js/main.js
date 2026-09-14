/* ══════════════════════════════════════════════════════════════════
   CLÍNICA DEL LAGO · Odontología, Puerto Varas — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: el esquema de placas es SVG
   escrito en el HTML, las seis etapas del tratamiento son texto y el
   teléfono es un enlace normal. El JS sólo agrega las apariciones al
   scroll y arma el mensaje de la evaluación.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var TEL = '56966020873';   /* el que publican sus redes — confirmar */

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 0 · Video de fondo ──────────────────────────────────────────
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

  /* ── 0b · WhatsApp flotante ──────────────────────────────────────
     El botón ya está visible por CSS y escrito en el HTML. Acá sólo se
     lo aparta mientras el visitante mira la portada, para no tapar el
     titular. Se observa la PORTADA, no el botón: el botón es fixed y un
     elemento fixed no entra ni sale de la ventana, así que observarlo
     no dispararía nunca. ── */
  var wapp = document.querySelector('.wapp');
  var port = document.querySelector('.portada');
  if (wapp && port) {
    /* Estado inicial calculado a mano: si el observador no llegara a
       dispararse, el botón no se queda pegado en un estado equivocado. */
    var mirarWapp = function () {
      var r = port.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      wapp.classList.toggle('wapp--arriba', visible > r.height * 0.55);
    };
    mirarWapp();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { wapp.classList.toggle('wapp--arriba', e.intersectionRatio > 0.55); });
      }, { threshold: [0, 0.55, 1] }).observe(port);
    } else {
      window.addEventListener('scroll', mirarWapp, { passive: true });
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

  /* ── 2 · Apariciones ──
     Observer agregado desde acá, nunca la clase en el HTML; se observa
     el contenedor y hay barrido de seguridad a los 6 s. */
  var piezas = [];
  ['.cifras__lista',
   '.mapa .ancho:not(.etapas)', '.etapas',
   '.tajo__txt',
   '.armonia .ancho > :not(.arm)', '.arm',
   '.espec .ancho > :not(.esp)', '.esp',
   '.cita__txt',
   '.mos .ancho', '.mos__grilla',
   '.mit__caja',
   '.evalua__cols > *', '.dueno__cols', '.dueno__cierre']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });

  /* ── La cifra que cuenta ──
     Sólo una de las cuatro, y es la que sostiene el argumento. El valor
     final está escrito dentro del <b>: sin JS o con menos movimiento se
     lee igual. Cúbica de salida a mano: sube rápido y frena largo. */
  var contado = false;
  var contar = function (caja) {
    if (contado || reduce || !window.requestAnimationFrame) { return; }
    var el = caja.querySelector('[data-cuenta]');
    if (!el) { return; }
    contado = true;
    var fin = parseInt(el.getAttribute('data-cuenta'), 10);
    var texto = el.textContent;          /* el string original, con su formato */
    var dur = 900, t0 = 0;
    var paso = function (t) {
      if (!t0) { t0 = t; }
      var k = Math.min((t - t0) / dur, 1);
      el.textContent = String(Math.round(fin * (1 - Math.pow(1 - k, 3))));
      if (k < 1) { requestAnimationFrame(paso); }
      else { el.textContent = texto; }   /* restaura el formato al terminar */
    };
    requestAnimationFrame(paso);
    /* Seguro por si el rAF se congela con la pestaña oculta. */
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  };

  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras__lista')) { contar(el); }
  };

  /* El observer NO se corta por reduced-motion: cortarlo destapa todo
     de golpe y mata el fundido, que es lo único que no se apaga. */
  if (!('IntersectionObserver' in window)) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (es, o) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        var el = e.target;            /* fuera del setTimeout: la entrada se recicla */
        o.unobserve(el);
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); } else { obs.observe(el); }
    });
  }
  /* Barrido a los 6 s, incondicional y fuera de la rama del observer:
     si algo no se mostró, se muestra igual. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 3 · Pedir la evaluación ── */
  var form = document.getElementById('form-eva');
  var salida = document.getElementById('salida');
  var btnW = document.getElementById('btn-wsp');
  var btnC = document.getElementById('btn-copiar');

  if (form && salida && btnW && btnC) {
    var nombre = document.getElementById('f-nombre');
    var tema   = document.getElementById('f-tema');
    var antes  = document.getElementById('f-antes');
    var cuando = document.getElementById('f-cuando');

    var armar = function () {
      var n = nombre && nombre.value ? nombre.value.trim() : '';
      if (!n) { salida.textContent = ''; return ''; }
      var t = 'Hola, quiero pedir una primera evaluación.';
      t += '\nNombre: ' + n;
      if (tema && tema.value)   { t += '\nMe interesa: ' + tema.value; }
      if (antes && antes.value) { t += '\nTratamiento previo: ' + antes.value; }
      if (cuando && cuando.value.trim()) { t += '\nMe acomoda: ' + cuando.value.trim(); }
      salida.textContent = t;
      return t;
    };

    [nombre, tema, antes, cuando].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btnW.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos su nombre.'; nombre.focus(); return; }
      window.open('https://wa.me/' + TEL + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
    });

    btnC.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos su nombre.'; nombre.focus(); return; }
      var avisar = function (ok) {
        btnC.textContent = ok ? 'Copiado' : 'No se pudo copiar — selecciónelo arriba';
        setTimeout(function () { btnC.textContent = 'Copiar el mensaje'; }, 2600);
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

  /* ── Boton flotante de contacto ───────────────────────────────────
     El boton ya se ve por CSS. Aca solo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA, no el boton: un elemento fixed nunca entra ni sale de la
     ventana, asi que observarlo no dispararia jamas. ── */
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