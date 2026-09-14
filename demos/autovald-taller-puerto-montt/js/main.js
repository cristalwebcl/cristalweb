/* ══════════════════════════════════════════════════════════════════
   AUTOVALD TALLER AUTOMOTRIZ · Puerto Montt — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: los CINCO paneles del auto
   están escritos y visibles uno tras otro, el esquema SVG se ve igual,
   la tabla de mantención es HTML y los datos de contacto son texto.
   Lo único que el JS agrega es convertir los paneles en pestañas,
   armar el mensaje de la falla, pedir los dos clips de fondo cuando
   corresponde y escalonar las apariciones.
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
     fuera de vista para no gastar batería. Si el navegador bloquea
     el autoplay, se queda la foto y no se nota nada. ── */
  var vids = document.querySelectorAll('video[data-src]');
  if (vids.length) {
    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorra = con && (con.saveData === true || /2g/.test(con.effectiveType || ''));
    if (!reduce && !ahorra) {
      var activar = function (v) {
        if (v.getAttribute('src')) { return; }          /* guarda de idempotencia */
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
              v.enVista = false; if (!v.paused) { v.pause(); }
            }
          });
        }, { rootMargin: '240px 0px', threshold: 0.01 });
        Array.prototype.forEach.call(vids, function (v) { ov.observe(v); });
      } else {
        Array.prototype.forEach.call(vids, activar);
      }
      /* Al volver a la pestaña el navegador deja el clip en pausa: se
         reanuda sólo el que estaba a la vista. Se compara con !== false
         y no con === true a propósito: si el observer todavía no corrió,
         enVista es undefined y el clip igual se reanuda. */
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

  /* ── 2 · La escena de portada arranca ──
     No espera al scroll: la portada ya está en pantalla. El retardo de
     120 ms va acá y no en un animation-delay para que el estado inicial
     —el auto fuera del cuadro— dure exactamente lo que dura la clase, y
     no quede aplicado si la animación no llega a correr. */
  var esc = document.querySelector('.escena');
  var txtPortada = document.querySelector('.portada__texto');
  if (esc || txtPortada) {
    setTimeout(function () {
      if (esc) { esc.classList.add('ok'); }
      /* El texto de la portada entra por la misma puerta: su estado
         oculto cuelga de .js y de esta clase, nunca de un `both` en la
         animación. Así, si el script no llega, rescate.js quita .js y el
         titular se ve; y si llega pero el compositor no corre la
         animación, el barrido de los 6 s lo destapa igual. */
      if (txtPortada) { txtPortada.classList.add('ok'); }
    }, 120);
  }

  /* ── 3 · Cabecera ── */
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

  /* ── 4 · El auto por dentro: paneles → pestañas ──
     El HTML trae los cinco paneles abiertos. Acá se cierra a uno solo
     y el esquema pasa a mandar. Es mejora, no contenido. */
  var auto = document.getElementById('auto');
  if (auto) {
    var zonas = Array.prototype.slice.call(auto.querySelectorAll('.zona'));
    var paneles = Array.prototype.slice.call(auto.querySelectorAll('.panel'));

    if (zonas.length && paneles.length) {
      auto.classList.add('auto--tabs');

      var elegir = function (z) {
        zonas.forEach(function (g) {
          var on = g.getAttribute('data-z') === z;
          g.classList.toggle('zona--on', on);
          g.setAttribute('aria-selected', on ? 'true' : 'false');
          g.setAttribute('tabindex', on ? '0' : '-1');
        });
        paneles.forEach(function (p) {
          p.classList.toggle('panel--on', p.getAttribute('data-z') === z);
        });
      };

      zonas.forEach(function (g, i) {
        g.setAttribute('role', 'tab');
        g.setAttribute('tabindex', i === 0 ? '0' : '-1');
        var z = g.getAttribute('data-z');
        g.addEventListener('click', function () { elegir(z); });
        /* Teclado: las zonas son SVG, así que el rol de pestaña y el
           manejo de flechas hay que ponerlos a mano. */
        g.addEventListener('keydown', function (e) {
          var k = e.key;
          if (k === 'Enter' || k === ' ') { e.preventDefault(); elegir(z); return; }
          var paso = (k === 'ArrowRight' || k === 'ArrowDown') ? 1 :
                     (k === 'ArrowLeft'  || k === 'ArrowUp')   ? -1 : 0;
          if (!paso) { return; }
          e.preventDefault();
          var j = (i + paso + zonas.length) % zonas.length;
          elegir(zonas[j].getAttribute('data-z'));
          zonas[j].focus();
        });
      });

      auto.querySelector('.esquema').setAttribute('role', 'tablist');
      elegir(zonas[0].getAttribute('data-z'));
    }
  }

  /* ── 5 · El corte se dibuja solo (regla 6 de movimiento-web) ──
     Cada trazo necesita saber cuánto mide para poder «dibujarse» con
     stroke-dashoffset. getTotalLength() lo dice, y el valor se escribe
     como propiedad de estilo DESDE JS —CSSOM— que es lo único que la
     CSP de esta página permite: un atributo style="" en el HTML lo
     bloquearía sin decir una palabra.
     Si un navegador no sabe medir un rect, ese trazo se queda sin
     --largo y se dibuja entero de una vez: mejor un trazo sin animar
     que un trazo invisible para siempre. */
  if (auto) {
    var trazos = auto.querySelectorAll(
      '.carro, .vidrio, .rueda, .rueda-in, .suelo, .zona rect');
    Array.prototype.forEach.call(trazos, function (el) {
      var largo = 0;
      try { largo = el.getTotalLength ? el.getTotalLength() : 0; }
      catch (e) { largo = 0; }
      if (largo > 0) { el.style.setProperty('--largo', largo.toFixed(1)); }
    });
  }

  /* ── 6 · La cifra que cuenta ──
     UNA sola de las cuatro sube, y es la que costó verificar: los 23
     años. El 5 y el 1 son aritmética de la propia página y el 0 es la
     herida — un contador que sube un cero se lee como truco. El valor
     final está ESCRITO dentro del <b>, así que sin JavaScript o con
     menos movimiento se lee igual. Cúbica de salida a mano: sube
     rápido y frena largo. */
  var contado = false;
  var contar = function (caja) {
    if (contado || reduce || !window.requestAnimationFrame) { return; }
    var el = caja.querySelector('[data-cuenta]');
    if (!el) { return; }
    contado = true;
    var fin = parseInt(el.getAttribute('data-cuenta'), 10);
    var texto = el.textContent;          /* el string original, con su formato */
    var dur = 900, t0 = 0, listo = false;
    /* `listo` es la guarda que faltaba. Sin ella el seguro de abajo
       restaura el 23 y el rAF, que sigue vivo, lo vuelve a pisar con el
       valor interpolado: la cifra se queda congelada en un número que no
       es el verdadero. Pasa donde el reloj del rAF no avanza al ritmo de
       los temporizadores —una pestaña en segundo plano, un render sin
       cabeza, una captura del catálogo— y es justo donde más se nota,
       porque es la foto que ve el dueño. Ahora el primero que llega
       cierra la puerta y el otro no escribe nada. */
    var paso = function (t) {
      if (listo) { return; }
      if (!t0) { t0 = t; }
      var k = Math.min((t - t0) / dur, 1);
      if (k < 1) {
        el.textContent = String(Math.round(fin * (1 - Math.pow(1 - k, 3))));
        requestAnimationFrame(paso);
      } else {
        listo = true; el.textContent = texto;   /* restaura el formato al terminar */
      }
    };
    requestAnimationFrame(paso);
    setTimeout(function () { listo = true; el.textContent = texto; }, dur + 600);
  };

  /* ── 7 · Apariciones ──
     El observer se agrega desde acá, nunca la clase en el HTML, y se
     observa el CONTENEDOR: un elemento recortado a área cero jamás
     dispara IntersectionObserver — por eso el <thead> de la tabla, que
     en teléfono va con clip-path a área cero, no está en esta lista y
     sí lo está su caja.
     El patrón :not() revela los párrafos sueltos de una sección como
     piezas y la grilla como UNA sola pieza; sin él habría que enumerar
     hijos a mano y se rompería al agregar un párrafo. */
  var piezas = [];
  ['.cifras__lista',
   '.dentro .ancho', '.auto',
   '.tajo__txt',
   '.hace .ancho > :not(.servicios)', '.servicios',
   '.pauta .ancho > :not(.tabla-caja)', '.tabla-caja',
   '.anios .ancho',
   '.mit__txt',
   '.cita__txt',
   '.mos .ancho', '.mos__grilla',
   '.donde__cols > *', '.dueno__cols', '.dueno__cierre']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });

  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras__lista')) { contar(el); }
    /* Red de seguridad del esquema, hermana del barrido de los 6 s. El
       corte tarda como mucho 1,94 s en trazarse (1,1 s de animación más
       840 ms de escalonado) y los cinco rótulos aparecen antes. A los
       2,6 s de destaparlo se fija el estado final a mano: si la
       animación no llegó a correr entera —pestaña en segundo plano,
       navegador que congela el compositor, captura sin cabeza— el
       esquema queda igual dibujado y con sus cinco rótulos, que es la
       pieza que sostiene la página. Va atado al destape y no a la carga,
       porque si se disparara a los 3,5 s de cargar mataría la animación
       de quien llega scrolleando un minuto después. */
    if (el.classList.contains('auto')) {
      setTimeout(function () { el.classList.add('trazado'); }, 2600);
    }
  };

  /* El observer NO se corta por reduced-motion: cortarlo destaparía
     todo de golpe y mataría el fundido, que es justo lo que la regla
     de la casa prohíbe apagar. El desplazamiento ya se apagó en CSS. */
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
      /* Lo que ya está en pantalla al cargar se destapa de inmediato,
         sin esperar un evento de scroll que en una pantalla apaisada
         puede no llegar nunca. */
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); } else { obs.observe(el); }
    });
  }
  /* Barrido a los 6 s, incondicional y fuera de la rama del observer:
     si algo no se mostró —o el observer existe pero falla— se muestra
     igual. classList.add es idempotente y contar() tiene su guarda.

     Y además .listo en el <html>, que apaga los estados ocultos y las
     transiciones de golpe. Sin eso, el barrido sólo DISPARA los fundidos
     y a los 6 s la página sigue medio transparente durante otro segundo:
     cualquier navegador que no esté corriendo transiciones en ese
     momento —una pestaña de fondo, un render sin cabeza, la captura del
     catálogo— congela media página a media opacidad. El barrido tiene
     que dejar el estado FINAL, no empezar a llegar a él. */
  setTimeout(function () {
    piezas.forEach(destapar);
    document.documentElement.classList.add('listo');
  }, 6000);

  /* ── 8 · Contar la falla ──
     CristalWeb todavía no tiene WhatsApp propio y el taller no publica
     teléfono, así que el flujo entrega TEXTO listo para pegar. Cuando
     el número exista se cambia una línea. Los valores se leen del DOM
     y se escriben con textContent, nunca con innerHTML. */
  var form = document.getElementById('form-falla');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');

  if (form && salida && btn) {
    var ids = ['f-auto', 'f-falla', 'f-desde', 'f-km'];
    var rot = ['Auto', 'Qué hace', 'Desde cuándo', 'Kilometraje'];
    var campos = ids.map(function (id) { return document.getElementById(id); });

    var armar = function () {
      var partes = [];
      campos.forEach(function (c, i) {
        var v = c && c.value ? c.value.trim() : '';
        if (v) { partes.push(rot[i] + ': ' + v); }
      });
      if (!partes.length) { salida.textContent = ''; return ''; }
      var t = 'Hola, quiero llevar el auto al taller.\n' + partes.join('\n');
      salida.textContent = t;
      return t;
    };

    campos.forEach(function (c) { if (c) { c.addEventListener('input', armar); } });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos el auto y qué hace.'; campos[0].focus(); return; }
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

  /* ── 9 · WhatsApp flotante ──────────────────────────────────────
     El botón ya está escrito en el HTML y ya se ve por CSS. Acá sólo se
     lo aparta mientras el visitante mira la portada, para no tapar el
     titular. Se observa la PORTADA y nunca el botón: el botón es fixed,
     y un elemento fixed no entra ni sale de la ventana, así que
     observarlo no dispararía jamás.
     El primer estado se calcula a mano antes de armar el observador: si
     el observador no llegara a dispararse, el botón no se queda pegado
     en un estado equivocado. */
  var wapp = document.querySelector('.wapp');
  var portada = document.querySelector('.portada');
  if (wapp && portada) {
    /* Se mide cuánto de la VENTANA ocupa la portada, no cuánto de la
       portada se ve. Con la segunda medida, una pantalla más alta que
       la portada la deja «entera a la vista» desde el primer píxel y el
       botón se esconde para siempre. Con ésta, el botón se aparta sólo
       mientras el titular manda de verdad. Misma guarda que la
       cabecera: la clase se toca sólo cuando cambia, cero trabajo por
       cuadro. */
    var tapado = null;
    var apartar = function () {
      var r = portada.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      var manda = visible > window.innerHeight * 0.55;
      if (manda !== tapado) { tapado = manda; wapp.classList.toggle('wapp--arriba', manda); }
    };
    apartar();
    window.addEventListener('scroll', apartar, { passive: true });
    window.addEventListener('resize', apartar, { passive: true });
  }

})();
