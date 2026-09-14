/* ══════════════════════════════════════════════════════════════════
   HAIRDOG · Peluquería canina, Puerto Montt — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: los cuatro mantos, los tres
   servicios y los pasos de la sesión están escritos, y el WhatsApp del
   bloque de contacto es un enlace normal que abre el chat. El JS sólo
   arma el texto del mensaje y lo manda ya escrito.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var WSP = '56974676721';   /* el que publica su Facebook — confirmar antes de publicar */

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 0 · Video de fondo ──────────────────────────────────────────
     La foto es la base; el video va encima. Sólo se carga si el
     visitante no pidió menos movimiento ni ahorra datos, se pide
     recién cuando la sección se acerca (240 px antes) y se pausa
     fuera de vista para no gastar batería. Si el navegador bloquea el
     autoplay, se queda la foto y no se nota nada.
     Con reduced-motion o saveData no se descarga NI UN BYTE: en el
     panel de red no aparece ningún .mp4. ── */
  var vids = document.querySelectorAll('video[data-src]');
  if (vids.length) {
    var con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var ahorra = con && (con.saveData === true || /2g/.test(con.effectiveType || ''));
    if (!reduce && !ahorra) {
      var activar = function (v) {
        /* Guarda de idempotencia: el observer vuelve a disparar cada
           vez que el elemento entra, y sin esto el clip reiniciaría. */
        if (v.getAttribute('src')) { return; }
        v.muted = true; v.loop = true; v.setAttribute('muted', '');
        v.addEventListener('canplay', function () {
          var p = v.play();
          /* La clase que funde va DENTRO del then: puesta antes se
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
         undefined y el clip igual tiene que arrancar. */
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
     El botón ya está escrito en el HTML y visible por CSS. Acá sólo se
     lo aparta mientras el visitante mira la portada, para no tapar el
     titular ni pelear con los dos botones que ya hay ahí.
     Se observa LA PORTADA, no el botón: el botón es fixed, y un
     elemento fixed no entra ni sale nunca de la ventana, así que
     observarlo no dispararía jamás.
     El estado inicial se calcula a mano antes de armar el observador,
     por si éste tardara en disparar la primera vez. ── */
  var wapp = document.querySelector('.wapp');
  var port = document.querySelector('.portada');
  if (wapp && port) {
    var mirarW = function () {
      var r = port.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      wapp.classList.toggle('wapp--arriba', visible > r.height * 0.55);
    };
    mirarW();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          wapp.classList.toggle('wapp--arriba', e.intersectionRatio > 0.55);
        });
      }, { threshold: [0, 0.55, 1] }).observe(port);
    } else {
      window.addEventListener('scroll', mirarW, { passive: true });
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

  /* ── 2 · La cifra que cuenta ─────────────────────────────────────
     Sólo cuenta UNA de las cuatro, y es la que costó verificar: las
     otras son aritmética de la propia página, y un contador que sube
     el «4» de una grilla de cuatro fichas se lee como truco. El valor
     final está ESCRITO dentro del <b>, así que sin JavaScript o con
     menos movimiento se lee igual.
     1-(1-k)³ es una cúbica de salida a mano: sube rápido y frena
     largo. Se restaura el texto original al terminar y hay un segundo
     seguro por si el rAF se congela con la pestaña oculta.

     EL CIERRE ES UNA PUERTA, NO UNA ASIGNACIÓN MÁS (08-09-2026).
     Antes el temporizador de seguro escribía el valor final y el bucle
     de rAF seguía vivo: si el navegador estaba estrangulando los
     fotogramas —pestaña de fondo, captura sin cabeza, máquina cargada—
     un fotograma rezagado llegaba DESPUÉS del seguro, pisaba el 5 con
     un 3 y no volvía a correr nunca más. La cifra quedaba mal para
     siempre. Se vio en tres capturas seguidas de esta misma página.
     Ahora hay un pestillo: quien llegue primero cierra, y el que llega
     tarde se devuelve sin tocar el texto. ── */
  var contado = false;
  var contar = function (caja) {
    if (contado || reduce || !window.requestAnimationFrame) { return; }
    var el = caja.querySelector('[data-cuenta]');
    if (!el) { return; }
    contado = true;
    var fin = parseInt(el.getAttribute('data-cuenta'), 10);
    var texto = el.textContent;
    var dur = 900, t0 = 0, cerrado = false;
    var cerrar = function () {
      if (cerrado) { return; }
      cerrado = true;
      el.textContent = texto;
    };
    var paso = function (t) {
      if (cerrado) { return; }
      if (!t0) { t0 = t; }
      var k = (t - t0) / dur;
      if (k >= 1) { cerrar(); return; }
      el.textContent = String(Math.round(fin * (1 - Math.pow(1 - k, 3))));
      requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
    setTimeout(cerrar, dur + 600);
  };

  /* ── 3 · Apariciones ──
     El observer va sobre el CONTENEDOR, nunca sobre el elemento
     recortado: algo con clip-path a área cero no dispara jamás y se
     queda invisible para siempre. Y NO se corta por reduced-motion —
     cortarlo destaparía todo de golpe y mataría el fundido, que es
     justo lo que no hay que apagar. ── */
  var piezas = [];
  ['.cifras__lista', '.cifras__pie', '.manto .ancho', '.mantos', '.tajo__txt',
   '.servicios .ancho', '.serv__c', '.sesion .ancho', '.pasos li',
   '.mit__foto', '.mit__txt', '.cita__txt', '.mos .ancho', '.mos__grilla',
   '.pedirh__cols > *', '.dueno__cols', '.dueno__cierre']
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
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        var el = e.target;
        obs.unobserve(el);
        /* Stagger por lote, no global: el módulo 4 impide que un lote
           grande acumule dos segundos de retardo. */
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    piezas.forEach(function (el) {
      /* Lo que YA está en pantalla al cargar se destapa sin esperar un
         evento de scroll que en una pantalla apaisada puede no llegar
         nunca. */
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); } else { obs.observe(el); }
    });
  }
  /* Barrido a los 6 s, incondicional y fuera de la rama del observer:
     cubre también que el observer exista pero falle. add es
     idempotente y contar() tiene su propia guarda. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 4 · Armar el mensaje de la hora ──
     Acá SÍ hay número publicado, así que el botón principal es un
     ENLACE con el wa.me ya escrito en el HTML: sin JavaScript abre el
     chat con un mensaje base, y con JavaScript lo único que cambia es
     el ?text=, que pasa a llevar lo que se llenó arriba. El de copiar
     queda de respaldo para quien prefiera pegarlo en otra parte. */
  var form = document.getElementById('form-hora');
  var salida = document.getElementById('salida');
  var btnW = document.getElementById('btn-wsp');
  var btnC = document.getElementById('btn-copiar');

  if (form && salida && btnW && btnC) {
    var perro = document.getElementById('f-perro');
    var tam   = document.getElementById('f-tam');
    var manto = document.getElementById('f-manto');
    var serv  = document.getElementById('f-serv');
    var nudos = document.getElementById('f-nudos');

    /* El mensaje base es EL MISMO que ya viaja escrito en el href del
       HTML: si el visitante no llena nada, el enlace vuelve a ése y
       nunca queda apuntando a un texto a medio armar. */
    var BASE = 'Hola, quiero pedir hora para mi perro.';
    var enlace = function (t) {
      btnW.setAttribute('href', 'https://wa.me/' + WSP + '?text=' + encodeURIComponent(t));
    };
    var armar = function () {
      var n = perro && perro.value ? perro.value.trim() : '';
      if (!n) { salida.textContent = ''; enlace(BASE); return ''; }
      var t = 'Hola, quiero pedir hora para ' + n + '.';
      if (tam && tam.value)   { t += '\nTamaño: ' + tam.value; }
      if (manto && manto.value) { t += '\nManto: ' + manto.value; }
      if (serv && serv.value) { t += '\nServicio: ' + serv.value; }
      if (nudos && nudos.value.trim()) { t += '\nNudos: ' + nudos.value.trim(); }
      salida.textContent = t;
      enlace(t);
      return t;
    };

    [perro, tam, manto, serv, nudos].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    /* No se cancela la navegación: se recalcula el href ANTES de que el
       navegador lo siga, por si alguien pegó texto sin disparar
       'input'. Si no hay nombre, el href ya vale el mensaje base. */
    btnW.addEventListener('click', function () { armar(); });

    btnC.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos el nombre del perro.'; perro.focus(); return; }
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