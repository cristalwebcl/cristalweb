/* ══════════════════════════════════════════════════════════════════
   CIRUS BAR · Puerto Montt — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: la línea de tiempo, la carta
   y los datos de contacto están escritos en el HTML. Lo único que se
   pierde es el armado automático del mensaje de reserva — y el
   teléfono de al lado es un enlace normal que sigue funcionando.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 0 · Vídeo de fondo ─────────────────────────────────────────
     La foto es la base; el clip va encima. Sólo se carga si el
     visitante no pidió menos movimiento ni va ahorrando datos, se pide
     recién cuando la sección se acerca (240 px antes) y se pausa fuera
     de vista para no gastar batería. Si el navegador bloquea el
     arranque automático, se queda la foto y no se nota nada. ── */
  var vids = document.querySelectorAll('video[data-src]');
  if (vids.length) {
    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorra = con && (con.saveData === true || /2g/.test(con.effectiveType || ''));
    if (!reduce && !ahorra) {
      var activar = function (v) {
        /* Guarda de idempotencia: el observer dispara cada vez que el
           elemento vuelve a entrar y sin esto el clip reiniciaría. */
        if (v.getAttribute('src')) { return; }
        /* Por propiedad Y por atributo: Safari de iPhone mira el
           atributo para autorizar el arranque sin sonido. */
        v.muted = true; v.loop = true; v.setAttribute('muted', '');
        v.addEventListener('canplay', function () {
          var p = v.play();
          /* La clase que funde el clip se pone DENTRO del .then(): si se
             pusiera antes se vería un rectángulo negro fundiéndose sobre
             la foto. Si el arranque está bloqueado, la promesa rechaza,
             el .catch vacío se lo traga y queda la foto. */
          if (p && p.then) { p.then(function () { v.classList.add('video--ver'); })
                              .catch(function () {}); }
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
              v.enVista = true;
              activar(v);
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
          if (v.enVista !== false && v.paused && v.classList.contains('video--ver')) {
            v.play().catch(function () {});
          }
        });
      });
    }
  }

  /* ── 0b · WhatsApp flotante ─────────────────────────────────────
     El botón ya está visible por CSS y escrito en el HTML. Acá sólo se
     lo aparta mientras el visitante mira la portada, para no taparle el
     titular. Se observa la PORTADA, no el botón: el botón es fixed y un
     elemento fixed no entra ni sale de la ventana, así que observarlo
     no dispararía nunca. ── */
  var wapp = document.querySelector('.wapp');
  var port = document.querySelector('.portada');
  if (wapp && port) {
    /* Estado inicial calculado a mano: si el observador no llegara a
       dispararse, el botón no se queda pegado en el estado equivocado. */
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

  /* ── 1 · Cabecera que se despega al bajar ── */
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

  /* ── 2 · Apariciones al entrar en pantalla ──
     El observer se agrega desde acá, nunca la clase en el HTML. Y se
     observa el CONTENEDOR: un elemento recortado a área cero jamás
     dispara IntersectionObserver y se bloquea solo. */
  var piezas = [];
  ['.cifras__lista', '.linea .ancho', '.hitos', '.tajo__txt',
   '.carta .ancho', '.platos', '.cita__txt', '.mit__foto', '.mit__txt',
   '.barrio .ancho', '.mos .ancho', '.mos__grilla',
   '.llegar__cols > *', '.dueno__cols', '.dueno__cierre']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        piezas.push(el);
      });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });
  /* ── 3 · La cifra que cuenta (regla 7 de movimiento-web) ──
     El valor final está ESCRITO en el HTML: sin JavaScript, con
     reduced-motion o si algo falla, el 80 se lee igual. Es la única
     excepción al «sin reloj» de la casa, y por eso el reloj es tiempo
     TRANSCURRIDO y no un contador de cuadros: en un teléfono lento la
     cuenta dura lo mismo que en un escritorio.
     Arranca 250 ms después de que la banda de cifras se destapa — a
     esa altura el titular ya terminó de entrar y no compiten. */
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
        var dur = 1100, t0 = 0, rendido = false;
        var paso = function (t) {
          /* Si el seguro de abajo ya escribió el valor final, este bucle
             se calla. Sin esta guarda, un cuadro que llegara tarde
             —pestaña que vuelve del segundo plano, navegador que dejó de
             pintar— reescribiría el número con un valor a medias
             ENCIMA del definitivo. */
          if (rendido) { return; }
          if (!t0) { t0 = t; }
          var p = Math.min((t - t0) / dur, 1);
          /* expo.out escrita a mano: la misma curva que --salida usa en
             el CSS, para que la cifra y los reveals frenen igual. */
          var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          /* En el PRIMER cuadro no se escribe nada. Si el reloj se
             congela ahí —pestaña oculta, panel cerrado, navegador sin
             cuadros— la cifra real se queda en pantalla en vez de
             quedarse pegada en cero, que es como se veía antes. */
          if (p > 0) { el.textContent = String(Math.round(fin * e)); }
          /* Crece un 5 % en el camino y vuelve a su tamaño al llegar. */
          el.style.transform = 'scale(' + (1 + 0.05 * Math.sin(Math.PI * p)).toFixed(4) + ')';
          if (p < 1) { requestAnimationFrame(paso); }
          else { rendido = true; el.textContent = String(fin); el.removeAttribute('style'); }
        };
        /* El '0' NO se escribe antes del primer cuadro: si rAF nunca corre
           —pestaña en segundo plano, panel oculto— la cifra real se queda
           en pantalla en vez de congelarse en cero. */
        requestAnimationFrame(paso);
        /* Y si aun así se queda a medias, a los 1,6 s el valor final gana
           y el bucle queda cerrado. removeAttribute y no style='' : un
           style vacío deja el atributo puesto en el DOM y el control de
           «cero estilos en línea» lo cuenta. */
        setTimeout(function () { rendido = true; el.textContent = String(fin); el.removeAttribute('style'); }, dur + 500);
      });
    }, 250);
  };

  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras__lista')) { arrancarCuentas(el); }
  };

  /* El observer NO se corta por reduced-motion: cortarlo destaparía
     todo de golpe y mataría el fundido, que es justo lo que la regla de
     la casa prohíbe apagar. Lo que se apaga es el desplazamiento, y eso
     lo hace el CSS. */
  if (!('IntersectionObserver' in window)) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        /* El elemento se guarda FUERA del temporizador: la entrada del
           observer se puede reciclar y e.target quedaría en el aire. */
        var el = e.target;
        obs.unobserve(el);
        /* Escalonado por lote, 0-60-120-180 y vuelve a empezar: el
           módulo 4 impide que un lote grande acumule dos segundos. */
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    piezas.forEach(function (el) {
      /* Lo que ya está en pantalla al cargar se destapa de inmediato,
         sin esperar un evento de scroll que en una pantalla apaisada
         puede no llegar nunca. */
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { obs.observe(el); }
    });
  }
  /* Barrido de seguridad, incondicional y fuera de la rama del
     observer: si algo no se mostró, a los 6 s se muestra igual.
     classList.add es idempotente y arrancarCuentas tiene su guarda. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 4 · Reserva: armar el mensaje, abrirlo en WhatsApp y copiarlo ──
     El canal es el mismo que el del botón flotante: el 9 6231 7070, que
     es el número publicado DEL LOCAL. El href base ya está escrito en el
     HTML y funciona sin JavaScript; acá sólo se le reescribe el ?text=
     con lo que la persona puso en el formulario. El botón de copiar se
     queda como salida alternativa (para quien no use WhatsApp o quiera
     leerlo por teléfono) y no hay ni un fetch: de esta página no sale
     nada hacia ningún servidor. */
  var form = document.getElementById('form-reserva');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');
  var wsp = document.getElementById('f-wsp');
  var wspBase = 'https://wa.me/56962317070';
  var wspTextoBase = 'Hola, quiero reservar una mesa en Cirus Bar.';

  if (form && salida && btn) {
    var campos = ['f-nombre', 'f-cuando', 'f-personas', 'f-nota'].map(function (id) {
      return document.getElementById(id);
    });

    var armar = function () {
      var nombre = (campos[0].value || '').trim();
      var cuando = (campos[1].value || '').trim();
      var personas = (campos[2].value || '').trim();
      var nota = (campos[3].value || '').trim();
      if (!nombre && !cuando) {
        salida.textContent = '';
        /* Sin datos, el enlace vuelve al mensaje base del HTML: nunca
           se queda con el texto de una escritura anterior. */
        if (wsp) { wsp.setAttribute('href', wspBase + '?text=' + encodeURIComponent(wspTextoBase)); }
        return '';
      }

      var t = wspTextoBase;
      if (nombre)   { t += '\nNombre: ' + nombre; }
      if (cuando)   { t += '\nDía y hora: ' + cuando; }
      if (personas) { t += '\nPersonas: ' + personas; }
      if (nota)     { t += '\nAviso: ' + nota; }
      salida.textContent = t;                 /* textContent, jamás innerHTML */
      if (wsp) { wsp.setAttribute('href', wspBase + '?text=' + encodeURIComponent(t)); }
      return t;
    };

    campos.forEach(function (c) {
      if (c) { c.addEventListener('input', armar); }
    });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) {
        salida.textContent = 'Escriba al menos el nombre y el día.';
        campos[0].focus();
        return;
      }
      var avisar = function (ok) {
        btn.textContent = ok ? 'Copiado' : 'No se pudo copiar — selecciónelo arriba';
        setTimeout(function () { btn.textContent = 'Copiar el mensaje'; }, 2600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { avisar(true); },
                                             function () { avisar(false); });
      } else {
        /* Respaldo para navegadores viejos y para file:// */
        var ta = document.createElement('textarea');
        ta.value = t;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
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