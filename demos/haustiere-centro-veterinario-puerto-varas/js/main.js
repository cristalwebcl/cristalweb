/* ══════════════════════════════════════════════════════════════════
   HAUSTIERE · Centro veterinario, Puerto Varas — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: el diccionario de los ocho términos
   está escrito, las señales son dos listas y la
   dirección es texto. El JS sólo agrega las apariciones al scroll y
   arma el mensaje del caso.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 0 · Video de fondo ──────────────────────────────────────────
     La foto es la base; el video va encima. Sólo se carga si el
     visitante no pidió menos movimiento ni va ahorrando datos, se pide
     recién cuando la sección se acerca (240 px antes) y se pausa fuera
     de vista para no gastar batería. Si el navegador bloquea el
     autoplay, se queda la foto y no se nota nada. ── */
  var vids = document.querySelectorAll('video[data-src]');
  if (vids.length) {
    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorra = con && (con.saveData === true || /2g/.test(con.effectiveType || ''));
    if (!reduce && !ahorra) {
      var activar = function (v) {
        if (v.getAttribute('src')) { return; }          /* idempotencia: el observer vuelve a disparar */
        v.muted = true; v.loop = true; v.setAttribute('muted', '');  /* Safari iOS mira el ATRIBUTO */
        v.addEventListener('canplay', function () {
          var p = v.play();
          /* La clase sólo dentro del .then(): si se pusiera antes, se
             vería un rectángulo negro fundiéndose sobre la foto. */
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
         reanuda sólo el que estaba a la vista. Se compara con !== false
         a propósito — si el observer todavía no corrió, enVista es
         undefined y el clip igual tiene que reanudarse. */
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

  /* ── 2 · Apariciones ──
     Observer agregado desde acá, nunca la clase en el HTML; lo que ya
     está a la vista se muestra al tiro y hay barrido a los 6 s. */
  /* ── 1b · Seguro de la portada ───────────────────────────────────
     La entrada de la portada es CSS puro con animation-fill-mode both:
     si el navegador no corre esas animaciones —pestaña de fondo, motor
     sin cabeza, throttling— la bajada y los botones se quedan en
     opacity 0 para siempre. A los 2,2 s, cuando la entrada ya tendría
     que haber terminado (0,36 s de retardo + 0,8 s), se pone el estado
     final a la fuerza. Es el mismo criterio del rescate de .js. */
  setTimeout(function () {
    var p = document.querySelector('.portada');
    if (p) { p.classList.add('puesta'); }
  }, 2200);

  /* ── 2a · La cifra que cuenta ────────────────────────────────────
     Cuenta UNA sola de las cuatro, y es la que costó verificar: los
     seguidores del Instagram. Las otras tres se quedan quietas —dos
     son aritmética de esta misma página y la cuarta es el cero de la
     herida, que subiendo se leería como chiste—.
     El valor final está escrito dentro del <b>, así que sin JS o con
     reduced-motion se lee igual. Y como viene con formato («5.362»),
     al terminar hay que RESTAURAR el textContent original: si no, el
     punto de los miles se pierde. */
  var contado = false;
  var contar = function (caja) {
    if (contado || reduce || !window.requestAnimationFrame) { return; }
    var el = caja.querySelector('[data-cuenta]');
    if (!el) { return; }
    contado = true;
    var fin = parseInt(el.getAttribute('data-cuenta'), 10);
    var texto = el.textContent;
    var dur = 1000, t0 = 0, listo = false;
    var paso = function (t) {
      if (listo) { return; }                 /* ya lo cerró el seguro: no pisarlo */
      if (!t0) { t0 = t; }
      var k = Math.min((t - t0) / dur, 1);
      var e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);   /* expo-out */
      el.textContent = String(Math.round(fin * e));
      if (k < 1) { requestAnimationFrame(paso); } else { listo = true; el.textContent = texto; }
    };
    requestAnimationFrame(paso);
    /* Seguro para la pestaña oculta, donde el rAF se congela: si los
       frames vuelven DESPUÉS del seguro, la guarda de arriba impide que
       reescriban un número a medio contar. Sin ella el número se queda
       colgado en «4168» — medido en Edge sin cabeza. */
    setTimeout(function () { listo = true; el.textContent = texto; }, dur + 600);
  };

  var piezas = [];
  ['.cifras__lista', '.cifras__pie',
   '.dicc .ancho', '.terminos', '.tajo__txt', '.servicios .ancho',
   '.mit__txt > :not(.traer)', '.traer',
   '.cuando .ancho', '.cita__txt', '.mos .ancho', '.mos__grilla',
   '.pasos .ancho > :not(.pasos__lista)', '.pasos__lista',
   '.esquina__cols > *', '.dueno__cols', '.dueno__cierre']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });
  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras__lista')) { contar(el); }
  };

  /* El observer NO se corta por reduced-motion: cortarlo destaparía
     todo de golpe y mataría el fundido, que es justo lo que la regla
     de la casa manda conservar. Lo que se apaga es el desplazamiento,
     y eso ya está en el CSS. */
  if (!('IntersectionObserver' in window)) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (es, o) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        var el = e.target;                       /* fuera del setTimeout: la entrada se recicla */
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
     también cubre el caso de que el observer exista pero falle. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 3 · Contar el caso ──
     El 08-09-2026 apareció el teléfono del centro en su propia agenda en
     línea, así que el flujo ya no termina en el portapapeles: arma el
     mensaje, lo muestra ANTES de mandarlo y escribe el ?text= en el href
     de wa.me. El href base ya está escrito en el HTML y funciona sin
     JavaScript; el botón de copiar se queda para quien prefiera pegarlo
     en otra parte. No se envía nada desde la página: no hay un solo
     fetch, y connect-src de la CSP sigue en 'self'. */
  var form = document.getElementById('form-caso');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');
  var wsp = document.getElementById('btn-wsp');
  var WSP_BASE = 'https://wa.me/56986327447';

  if (form && salida && btn) {
    var ids = ['f-animal', 'f-especie', 'f-que', 'f-desde'];
    var rot = ['Nombre', 'Especie y edad', 'Qué le pasa', 'Desde cuándo'];
    var campos = ids.map(function (id) { return document.getElementById(id); });

    var armar = function () {
      var partes = [];
      campos.forEach(function (c, i) {
        var v = c && c.value ? c.value.trim() : '';
        if (v) { partes.push(rot[i] + ': ' + v); }
      });
      if (!partes.length) {
        salida.textContent = '';
        /* Sin nada escrito, el enlace vuelve a su mensaje base: nunca
           queda apuntando a un ?text= a medio armar. */
        if (wsp) { wsp.setAttribute('href', WSP_BASE + '?text=' + encodeURIComponent('Hola, vi la página y necesito una hora para mi mascota.')); }
        return '';
      }
      var t = 'Hola, necesito atención veterinaria.\n' + partes.join('\n');
      salida.textContent = t;                       /* textContent, nunca innerHTML */
      if (wsp) { wsp.setAttribute('href', WSP_BASE + '?text=' + encodeURIComponent(t)); }
      return t;
    };

    campos.forEach(function (c) { if (c) { c.addEventListener('input', armar); } });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos el nombre del animal y qué le pasa.'; campos[0].focus(); return; }
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

  /* ── 4 · WhatsApp flotante ───────────────────────────────────────
     El botón ya está visible por CSS. Acá sólo se lo aparta mientras el
     visitante mira la portada, para no tapar el titular. Se observa la
     PORTADA, no el botón: el botón es fixed y un elemento fixed no entra
     ni sale de la ventana, así que observarlo no dispararía nunca. */
  var wapp = document.querySelector('.wapp');
  var port = document.querySelector('.portada');
  if (wapp && port) {
    /* Estado inicial calculado a mano: si el observador no llegara a
       dispararse, el botón no se queda pegado en un estado equivocado. */
    var mirarPort = function () {
      var r = port.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      wapp.classList.toggle('wapp--arriba', visible > r.height * 0.55);
    };
    mirarPort();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { wapp.classList.toggle('wapp--arriba', e.intersectionRatio > 0.55); });
      }, { threshold: [0, 0.55, 1] }).observe(port);
    } else {
      window.addEventListener('scroll', mirarPort, { passive: true });
    }
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