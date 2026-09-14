/* ══════════════════════════════════════════════════════════════════
   CLÍNICA ODONTHOS · Puerto Varas — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: los seis tramos de la
   primera cita son una lista ordenada normal, las especialidades son
   texto y el enlace al Instagram sigue abriendo. El JS sólo agrega las
   apariciones al scroll y arma el mensaje para agendar.

   La página compite contra una plantilla: por eso este archivo no
   carga nada, no mide nada y no manda nada a ninguna parte.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 0 · Video de fondo ──────────────────────────────────────────
     La foto es la base; el clip va encima. Sólo se carga si el
     visitante no pidió menos movimiento ni ahorra datos, se pide
     recién cuando la sección se acerca (240 px antes) y se pausa
     fuera de vista para no gastar batería. Si el navegador bloquea el
     autoplay, se queda la foto y no se nota nada: el <img> hermano
     nunca se va, así que no hay rectángulo negro en ningún caso. ── */
  var vids = document.querySelectorAll('video[data-src]');
  if (vids.length) {
    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorra = con && (con.saveData === true || /2g/.test(con.effectiveType || ''));
    if (!reduce && !ahorra) {
      var activar = function (v) {
        if (v.getAttribute('src')) { return; }   /* guarda de idempotencia */
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
         reanuda sólo el que estaba a la vista. */
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

  /* ── 2 · Apariciones ── */
  var piezas = [];
  ['.cifras__lista', '.cita-s .ancho', '.reloj-l', '.tajo__txt', '.espec .ancho',
   '.equipo .ancho', '.ficha', '.propia .ancho', '.cita__txt',
   '.mos .ancho', '.mos__grilla', '.specs', '.agenda__cols > *', '.dueno__cols', '.dueno__cierre']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });
  /* ── La cifra que cuenta (regla 7 de movimiento-web) ──
     El valor final está ESCRITO en el HTML: sin JavaScript, con
     reduced-motion o si algo falla, el 100 % se lee igual. Es la única
     excepción al «sin reloj» de la casa, y por eso el reloj es tiempo
     TRANSCURRIDO y no un contador de cuadros.
     Sólo cuenta UNA cifra en toda la página, y es la que costó
     verificar: los 8.249 seguidores. Las otras tres de la banda —60
     minutos, 6 tramos y el 0 de la herida— son aritmética de esta misma
     página, y un contador que sube un «6» de una grilla se lee como
     truco. El sufijo y los puntos de millar se guardan aparte y el
     textContent original se restaura al terminar: sin eso el «8.249»
     quedaría convertido en «8249». */
  var cuentaHecha = false;
  var arrancarCuentas = function (caja) {
    if (cuentaHecha || reduce || !window.requestAnimationFrame) { return; }
    var numeros = caja.querySelectorAll('[data-cuenta]');
    if (!numeros.length) { return; }
    cuentaHecha = true;

    setTimeout(function () {
      Array.prototype.forEach.call(numeros, function (el) {
        var fin = parseInt(el.getAttribute('data-cuenta'), 10);
        if (!(fin > 0)) { return; }
        var texto = el.textContent;
        var sufijo = texto.replace(/^[\d.,\s]+/, '');
        /* Si el número escrito lleva punto de millar, el conteo también:
           saltar de «8249» a «8.249» en el último cuadro se ve como un
           parpadeo de ancho. */
        var conMillar = /\d\.\d{3}/.test(texto);
        var miles = function (n) {
          var s = String(n);
          return conMillar ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : s;
        };
        var dur = 1000, t0 = 0, listo = false;
        var paso = function (t) {
          /* Si el seguro de abajo ya restauró la cifra, el cuadro que
             llegue tarde NO la vuelve a pisar. Pasa de verdad: con la
             pestaña en segundo plano, o en una captura sin cabeza, el
             requestAnimationFrame se congela, el temporizador no, y la
             banda se quedaba mostrando el «0» del primer cuadro. */
          if (listo) { return; }
          if (!t0) { t0 = t; }
          var p = Math.min((t - t0) / dur, 1);
          /* expo.out escrita a mano: la misma curva --salida del CSS. */
          var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          el.textContent = miles(Math.round(fin * e)) + sufijo;
          if (p < 1) { requestAnimationFrame(paso); }
          else { listo = true; el.textContent = texto; }
        };
        /* El pellizco de escala: crece un 4 % y VUELVE. Va por la Web
           Animations API y no escribiendo el.style.transform cuadro a
           cuadro, por dos razones: el navegador lo corre en el
           compositor, y —sobre todo— no deja ningún style="" en el DOM.
           El checklist de la casa cuenta los [style] y exige cero, y con
           el transform escrito a mano el número aparecía marcado durante
           el segundo que dura el conteo. */
        if (el.animate) {
          el.animate(
            [{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }],
            { duration: dur, easing: 'ease-out' }
          );
        }
        /* El 0 NO se escribe antes del primer cuadro: si rAF nunca corre
           —pestaña en segundo plano— la cifra real se queda en pantalla
           en vez de congelarse en cero. */
        requestAnimationFrame(paso);
        setTimeout(function () { listo = true; el.textContent = texto; }, dur + 500);
      });
    }, 200);
  };

  var destapar = function (el) {
    el.classList.add('ok');
    if (el.querySelector('[data-cuenta]')) { arrancarCuentas(el); }
  };

  /* El observer NO se corta por reduced-motion: cortarlo destaparía todo
     de golpe y mataría el fundido, que es justo lo que la regla de la
     casa manda conservar. El CSS ya quita el desplazamiento. */
  if (!('IntersectionObserver' in window)) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        var el = e.target;              /* fuera del setTimeout: la entrada se recicla */
        obs.unobserve(el);
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); } else { obs.observe(el); }
    });
  }
  /* Barrido a los 6 s, incondicional y fuera de la rama del observer:
     cubre también el caso de que el observer exista pero falle. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 3 · Armar el mensaje ──
     Dos salidas para el mismo texto: el botón principal lo escribe en el
     ?text= del enlace a wa.me —por eso el rótulo dice «con esto»— y el
     secundario lo copia, para quien prefiera pegarlo en Instagram.
     El href base ya está escrito en el HTML y funciona sin JavaScript:
     acá sólo se le añade el mensaje. Nunca innerHTML, y el texto se lee
     de los campos, no de una copia en un objeto. */
  var form = document.getElementById('form-ag');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');
  var irWsp = document.getElementById('ir-wsp');
  var wspBase = irWsp ? irWsp.getAttribute('href').split('?')[0] : '';

  if (form && salida && btn) {
    var nombre = document.getElementById('f-nombre');
    var motivo = document.getElementById('f-motivo');
    var prev   = document.getElementById('f-prev');
    var cuando = document.getElementById('f-cuando');

    /* Si todavía no escribió el nombre, el enlace vuelve al mensaje base
       del HTML: nunca queda apuntando a un texto a medio armar. */
    var ponerHref = function (t) {
      if (!irWsp || !wspBase) { return; }
      var mensaje = t || 'Hola, vi la página y quiero agendar una hora en Odonthos.';
      irWsp.setAttribute('href', wspBase + '?text=' + encodeURIComponent(mensaje));
    };

    var armar = function () {
      var n = nombre && nombre.value ? nombre.value.trim() : '';
      if (!n) { salida.textContent = ''; ponerHref(''); return ''; }
      var t = 'Hola, quiero agendar una hora.';
      t += '\nNombre: ' + n;
      if (motivo && motivo.value) { t += '\nMotivo: ' + motivo.value; }
      if (prev && prev.value)     { t += '\nPrevisión: ' + prev.value; }
      if (cuando && cuando.value.trim()) { t += '\nMe acomoda: ' + cuando.value.trim(); }
      salida.textContent = t;
      ponerHref(t);
      return t;
    };

    [nombre, motivo, prev, cuando].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos su nombre.'; nombre.focus(); return; }
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

  /* ── 4 · WhatsApp flotante ───────────────────────────────────────
     El botón ya está visible por CSS y escrito en el HTML. Acá sólo se
     lo aparta mientras el visitante mira la portada, para no tapar el
     titular. Se observa la PORTADA, no el botón: el botón es fixed y un
     elemento fixed no entra ni sale de la ventana, así que observarlo no
     dispararía nunca. ── */
  var wapp = document.querySelector('.wapp');
  var port = document.querySelector('.portada');
  if (wapp && port) {
    /* estado inicial calculado a mano, por si el observador no llegara a
       dispararse: así el botón no se queda pegado en un estado falso */
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