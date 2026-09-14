/* ══════════════════════════════════════════════════════════════════
   A&G KINESIOLOGÍA INTEGRAL · Puerto Montt — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: las TRES vías de previsión
   están escritas y visibles con todos sus pasos, y el teléfono y el
   correo son enlaces normales. El JS sólo enciende el selector y
   atenúa las vías que no eligió — nunca las esconde.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var TEL = '56973725439';   /* el que publica su Instagram — confirmar */

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 0 · Video de fondo ──────────────────────────────────────────
     La foto es la base; el clip va encima. Sólo se carga si el
     visitante no pidió menos movimiento ni ahorra datos, se pide
     recién cuando la sección se acerca (240 px antes) y se pausa
     fuera de vista para no gastar batería. Si el navegador bloquea el
     autoplay, la promesa rechaza, el catch vacío se la traga y se
     queda la foto: no se nota nada y la consola sigue limpia. */
  var vids = document.querySelectorAll('video[data-src]');
  if (vids.length) {
    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorra = con && (con.saveData === true || /2g/.test(con.effectiveType || ''));
    if (!reduce && !ahorra) {
      var activar = function (v) {
        /* Guarda de idempotencia: el observer dispara cada vez que el
           elemento vuelve a entrar y sin esto se reasignaría el src. */
        if (v.getAttribute('src')) { return; }
        v.muted = true; v.loop = true; v.setAttribute('muted', '');
        v.addEventListener('canplay', function () {
          var p = v.play();
          /* La clase de fundido se pone DENTRO del then: si se pusiera
             antes, se vería un rectángulo negro fundiéndose sobre la
             foto mientras el clip todavía no pinta. */
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
              v.enVista = false; if (!v.paused) { v.pause(); }
            }
          });
        }, { rootMargin: '240px 0px', threshold: 0.01 });
        Array.prototype.forEach.call(vids, function (v) { ov.observe(v); });
      } else {
        Array.prototype.forEach.call(vids, activar);
      }
      /* Al volver a la pestaña el navegador deja el clip en pausa: se
         reanuda sólo el que estaba a la vista. Se usa !== false y no
         === true a propósito — si el observer todavía no corrió,
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

  /* ── 0b · WhatsApp flotante ──────────────────────────────────────
     El botón ya está escrito en el HTML y ya es visible por CSS. Acá
     sólo se lo aparta mientras el visitante mira la portada, para no
     tapar el titular.
     Se observa la PORTADA, no el botón: el botón es position: fixed y
     un elemento fijo no entra ni sale nunca de la ventana, así que
     observarlo no dispararía jamás.
     El cálculo a mano NO es un respaldo del que no tiene observador: va
     SIEMPRE, en cada scroll y en cada resize. Medido sobre la página
     viva el 09-09-2026: el JS pone .wapp--arriba al arrancar (la
     portada está entera a la vista) y, si por lo que sea el observador
     no vuelve a disparar, esa clase no se quita NUNCA — el botón
     obligatorio se queda en opacidad 0 de punta a punta de la página,
     con el pie a ocho mil píxeles de la portada. Es exactamente el
     fallo que la regla de la casa prohíbe: el JS no puede ser lo único
     que decida si se ve el CTA. Con el listener puesto, un observador
     mudo ya no se lleva el botón; y la guarda de «sólo si cambia»
     deja el trabajo por frame en cero. */
  var wapp = document.querySelector('.wapp');
  var port = document.querySelector('.portada');
  if (wapp && port) {
    var apartado = null;
    var ponerWapp = function (v) {
      if (v === apartado) { return; }
      apartado = v;
      wapp.classList.toggle('wapp--arriba', v);
    };
    var mirarWapp = function () {
      var r = port.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      ponerWapp(visible > r.height * 0.55);
    };
    mirarWapp();
    window.addEventListener('scroll', mirarWapp, { passive: true });
    window.addEventListener('resize', mirarWapp, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          ponerWapp(e.intersectionRatio > 0.55);
        });
      }, { threshold: [0, 0.55, 1] }).observe(port);
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

  /* ── 2 · Elegir previsión ──
     Atenúa, no esconde: el paciente que quiere comparar Fonasa con
     reembolso sigue teniendo las dos a la vista. */
  var elige = document.getElementById('elige');
  var vias = document.getElementById('vias');
  if (elige && vias) {
    var botones = Array.prototype.slice.call(elige.querySelectorAll('.elige__b'));
    var fichas = Array.prototype.slice.call(vias.querySelectorAll('.via'));

    var marcar = function (prev) {
      vias.classList.add('vias--filtra');
      botones.forEach(function (b) {
        var on = b.getAttribute('data-prev') === prev;
        b.classList.toggle('elige__b--on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      fichas.forEach(function (f) {
        f.classList.toggle('via--on', f.getAttribute('data-prev') === prev);
      });
    };

    botones.forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { marcar(b.getAttribute('data-prev')); });
    });
  }
  /* ── 3 · El arco de la portada se dibuja (regla 6 de movimiento-web) ──
     El trazo necesita saber cuánto mide para poder «dibujarse» con
     stroke-dashoffset, y getTotalLength() es quien lo sabe.
     El largo se escribe como ATRIBUTOS DE PRESENTACIÓN del SVG y no con
     element.style: los dos los permite la CSP, pero style deja puesto un
     atributo style="" en la página viva y la comprobación de la casa
     —querySelectorAll('[style]').length— tiene que dar cero limpio, sin
     una excepción que alguien tenga que recordar dentro de seis meses.
     Un atributo de presentación pesa menos que cualquier regla CSS, así
     que la animación de más abajo le gana sin pelear.
     Si el navegador no sabe medir el trazo no se pone nada y el arco
     aparece entero: mejor un trazo sin animar que un trazo invisible. */
  var arco = document.querySelector('.escena__arco');
  if (arco) {
    var largoArco = 0;
    try { largoArco = arco.getTotalLength ? arco.getTotalLength() : 0; }
    catch (e) { largoArco = 0; }
    if (largoArco > 0) {
      var L = largoArco.toFixed(1);
      arco.setAttribute('stroke-dasharray', L);
      arco.setAttribute('stroke-dashoffset', L);
    }
  }

  /* ── 4 · La cifra que cuenta ─────────────────────────────────────
     Sólo cuenta UNA de las cuatro, y no es la herida: un contador que
     sube hasta el 0 se lee como truco. El valor final está escrito
     dentro del <b>, así que sin JS o con menos movimiento se lee
     igual; el textContent original se restaura al terminar para no
     perder el formato, y un segundo temporizador lo cubre por si el
     requestAnimationFrame se congela con la pestaña oculta. */
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
      /* Cúbica de salida escrita a mano: sube rápido y frena largo. */
      el.textContent = String(Math.round(fin * (1 - Math.pow(1 - k, 3))));
      if (k < 1) { requestAnimationFrame(paso); }
      else { el.textContent = texto; }
    };
    requestAnimationFrame(paso);
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  };

  /* ── 5 · Apariciones ──
     El observer va siempre sobre el CONTENEDOR, nunca sobre un
     elemento recortado: uno con clip-path a área cero no dispara
     jamás y se queda invisible para siempre. */
  var piezas = [];
  ['.cifras__lista', '.cuanto .ancho', '.vias', '.tajo__txt',
   '.trata .ancho', '.casos', '.primera .ancho > :not(.momentos)',
   '.momentos', '.mit__txt', '.sesion .ancho', '.cita__txt',
   '.mos .ancho', '.mos__grilla', '.horas__cols > *',
   '.dueno__cols', '.dueno__cierre']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });
  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras__lista')) { contar(el); }
  };

  /* El observer NO se corta por prefers-reduced-motion: cortarlo
     destaparía todo de golpe y mataría el fundido, que es justamente
     lo que la regla de la casa manda conservar. Lo que se apaga con
     menos movimiento es el desplazamiento, y eso vive en el CSS. */
  if (!('IntersectionObserver' in window)) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (es, o) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        /* e.target se captura FUERA del temporizador: la entrada del
           observer puede haberse reciclado cuando el timeout corra. */
        var el = e.target;
        o.unobserve(el);
        /* Escalonado por lote, con módulo 4 para que un lote grande
           no acumule dos segundos de retardo. */
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    piezas.forEach(function (el) {
      /* Lo que ya está en pantalla al cargar se destapa de inmediato,
         sin esperar un evento de scroll que puede no llegar nunca. */
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); } else { obs.observe(el); }
    });
  }
  /* Barrido a los 6 s, incondicional y fuera de la rama del observer:
     si algo no se mostró —o el observer existe pero falla—, se muestra
     igual. classList.add es idempotente y contar() tiene su guarda. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 6 · Armar el mensaje ──
     Acá sí hay teléfono publicado, así que el botón principal es un
     <a> a wa.me con el href YA escrito en el HTML: sin JavaScript abre
     WhatsApp con un mensaje base y el paciente escribe el resto. Lo
     que hace el JS es reescribirle el ?text= con lo que se teclea.
     Nada de window.open: eso convertía el botón en un botón muerto
     para quien no tiene JS. */
  var form = document.getElementById('form-hora');
  var salida = document.getElementById('salida');
  var btnW = document.getElementById('btn-wsp');
  var btnC = document.getElementById('btn-copiar');

  if (form && salida && btnW && btnC) {
    var nombre = document.getElementById('f-nombre');
    var prev   = document.getElementById('f-prev');
    var motivo = document.getElementById('f-motivo');
    var orden  = document.getElementById('f-orden');

    var BASE = 'Hola, quiero pedir hora de kinesiología.';
    var armar = function () {
      var n = nombre && nombre.value ? nombre.value.trim() : '';
      var m = motivo && motivo.value ? motivo.value.trim() : '';
      if (!n && !m) {
        salida.textContent = '';
        /* Sin datos, el enlace vuelve al mensaje base — nunca queda sin href. */
        btnW.setAttribute('href', 'https://wa.me/' + TEL + '?text=' + encodeURIComponent(BASE));
        return '';
      }
      var t = BASE;
      if (n) { t += '\nNombre: ' + n; }
      if (prev && prev.value)  { t += '\nPrevisión: ' + prev.value; }
      if (m) { t += '\nMotivo: ' + m; }
      if (orden && orden.value) { t += '\nOrden médica: ' + orden.value; }
      salida.textContent = t;
      btnW.setAttribute('href', 'https://wa.me/' + TEL + '?text=' + encodeURIComponent(t));
      return t;
    };

    [nombre, prev, motivo, orden].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btnC.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos su nombre y qué le pasa.'; nombre.focus(); return; }
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