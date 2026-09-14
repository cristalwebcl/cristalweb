/* ══════════════════════════════════════════════════════════════════
   CABALLEROS · Barbería en Angelmó, Puerto Montt — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: el tablero de cortes es una
   <table> normal, las cuatro maneras de pedir el corte son una <ol>,
   el horario y la dirección son texto, las cifras traen su valor
   escrito dentro y el enlace al Instagram sigue abriendo. Lo único que
   agrega el JS es el video de fondo, las apariciones al scroll, el
   conteo de una cifra y armar el mensaje de reserva para copiarlo.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · Video de fondo ──────────────────────────────────────────
     La foto es la base; el video va encima. Sólo se carga si el
     visitante no pidió menos movimiento ni ahorra datos, se pide
     recién cuando la sección se acerca (240 px antes) y se pausa
     fuera de vista para no gastar batería. Si el navegador bloquea el
     autoplay, se queda la foto y no se nota nada. */
  var vids = document.querySelectorAll('video[data-src]');
  if (vids.length) {
    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorra = con && (con.saveData === true || /2g/.test(con.effectiveType || ''));
    if (!reduce && !ahorra) {
      var activar = function (v) {
        if (v.getAttribute('src')) { return; }          /* idempotencia: el observer dispara varias veces */
        v.muted = true; v.loop = true; v.setAttribute('muted', '');   /* Safari iOS mira el ATRIBUTO */
        v.addEventListener('canplay', function () {
          var p = v.play();
          /* La clase de fundido sólo dentro del .then(): si se pusiera
             antes, se vería un rectángulo negro fundiéndose sobre la
             foto. El .catch vacío se traga el autoplay bloqueado, que
             es un caso normal y no un error. */
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
         reanuda sólo el que estaba a la vista. Se usa !== false a
         propósito —si el observer todavía no corrió, enVista es
         undefined y el clip igual debe reanudarse—. */
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'visible') { return; }
        Array.prototype.forEach.call(vids, function (v) {
          if (v.enVista !== false && v.paused && v.classList.contains('video--ver')) { v.play().catch(function () {}); }
        });
      });
    }
  }

  /* ── 2 · Cabecera ── */
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

  /* ── 3 · La cifra que cuenta ─────────────────────────────────────
     Cuenta UNA sola de las cuatro, y es la que costó verificar: los
     años de oficio. El «DM» y el horario se quedan quietos porque un
     contador sobre la herida se lee como truco. El valor final está
     escrito dentro del <b>, así que sin JS o con menos movimiento se
     lee igual.
     Dos seguros para no perder el formato: el conteo sólo toca el
     <span class="cuenta"> —el «+» vive fuera y no se puede borrar— y
     al terminar se restaura igual el texto original. Con sólo lo
     segundo, cualquier captura tomada a mitad del conteo muestra «8»
     en vez de «+8», y ésa es justamente la que va a la miniatura del
     catálogo. */
  var contado = false;
  var contar = function (caja) {
    if (contado || reduce || !window.requestAnimationFrame) { return; }
    var caj = caja.querySelector('[data-cuenta]');
    if (!caj) { return; }
    var el = caj.querySelector('.cuenta') || caj;
    contado = true;
    var fin = parseInt(caj.getAttribute('data-cuenta'), 10);
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
    /* Seguro para la pestaña oculta, donde el rAF se congela. */
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  };

  /* ── 4 · Apariciones ─────────────────────────────────────────────
     La clase .rev la pone el JS, nunca el HTML: si el script no llega,
     no hay ninguna clase escondiendo nada. El observer va sobre el
     CONTENEDOR —un elemento recortado a área cero no dispara jamás—,
     lo que ya está en pantalla se destapa sin esperar scroll, y a los
     6 s hay un barrido incondicional por si el observer falla. */
  var piezas = [];
  ['.cifras__lista',
   '.tablero .ancho > :not(.tab)', '.tab tbody',
   '.tajo__txt',
   '.barberos .ancho > :not(.fichas)', '.fichas',
   '.corte__txt > :not(.pasos)', '.pasos', '.corte__foto',
   '.local .ancho > *',
   '.cita__txt',
   '.mos .ancho > *', '.mos__grilla',
   '.hora__cols > *',
   '.dueno .ancho > :not(.dueno__cols)', '.dueno__cols']
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
    var obs = new IntersectionObserver(function (es, o) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        var el = e.target;                 /* fuera del setTimeout: la entrada se recicla */
        o.unobserve(el);
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); } else { obs.observe(el); }
    });
  }
  /* Barrido incondicional y fuera de la rama del observer: cubre
     también el caso de que el observer exista pero falle. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 5 · Botón flotante de contacto ──────────────────────────────
     El botón ya está visible por CSS. Acá sólo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA y no el botón: el botón es fixed y un elemento fixed nunca
     entra ni sale de la ventana, así que observarlo no dispararía
     jamás. El estado inicial se calcula a mano por si el observador no
     alcanza a dispararse antes del primer pintado. */
  var wapp = document.querySelector('.wapp');
  var port = document.querySelector('.portada');
  if (wapp && port) {
    var mirarWapp = function () {
      var r = port.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      wapp.classList.toggle('wapp--arriba', visible > r.height * 0.55);
    };
    mirarWapp();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          wapp.classList.toggle('wapp--arriba', e.intersectionRatio > 0.55);
        });
      }, { threshold: [0, 0.55, 1] }).observe(port);
    } else {
      window.addEventListener('scroll', mirarWapp, { passive: true });
    }
  }

  /* ── 6 · Armar el mensaje de la hora ─────────────────────────────
     Instagram no acepta texto precargado en un enlace, así que se
     copia al portapapeles y se pega en el chat. Cuando la barbería
     publique un WhatsApp, esta función cambia de UNA línea:
       location.href = 'https://wa.me/<numero>?text=' + encodeURIComponent(t);
     El resto ya está escrito. */
  var form = document.getElementById('form-hora');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');

  if (form && salida && btn) {
    var nombre = document.getElementById('f-nombre');
    var serv   = document.getElementById('f-serv');
    var cuando = document.getElementById('f-cuando');
    var quien  = document.getElementById('f-quien');

    var armar = function () {
      var n = nombre && nombre.value ? nombre.value.trim() : '';
      var c = cuando && cuando.value ? cuando.value.trim() : '';
      if (!n && !c) { salida.textContent = ''; return ''; }
      var t = 'Hola, quiero pedir una hora.';
      if (n) { t += '\nNombre: ' + n; }
      if (serv && serv.value) { t += '\nServicio: ' + serv.value; }
      if (c) { t += '\nCuándo: ' + c; }
      if (quien && quien.value.trim()) { t += '\nCon: ' + quien.value.trim(); }
      salida.textContent = t;              /* textContent, nunca innerHTML */
      return t;
    };

    [nombre, serv, cuando, quien].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos su nombre y cuándo le acomoda.'; nombre.focus(); return; }
      var avisar = function (ok) {
        btn.textContent = ok ? 'Copiado — péguelo en el chat' : 'No se pudo copiar — selecciónelo arriba';
        setTimeout(function () { btn.textContent = 'Copiar el mensaje'; }, 3000);
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