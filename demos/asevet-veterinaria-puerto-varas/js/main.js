/* ══════════════════════════════════════════════════════════════════
   ASEVET · Clínica veterinaria, Puerto Varas — CristalWeb

   Todo lo que hace este archivo es adorno o comodidad: el video de
   fondo de la portada y de la cita, el botón flotante que se aparta
   mientras se mira el titular, la cabecera que se despega, las
   apariciones al scroll, el conteo de los 52 domingos y el mensaje del
   caso que se arma solo para copiarlo.

   No carga nada de terceros, no mide nada, no manda nada a ninguna
   parte. Si este archivo no llega, rescate.js quita la clase .js a los
   4 s y la página se lee entera: el contenido está escrito en el HTML.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Video de fondo ──────────────────────────────────────────────
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

  /* ── 1 · El botón flotante se aparta sobre la portada ─────────────
     El botón está escrito en el HTML y es VISIBLE por defecto: acá
     sólo se esconde mientras más de la mitad de la portada está en
     pantalla, para no tapar el titular. Se mide una vez a mano antes
     de montar el observador, así no queda pegado en el estado
     equivocado durante el primer scroll. ── */
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

  /* ── 2 · Cabecera que se despega ── */
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

  /* ── 3 · Los 52 domingos ──────────────────────────────────────────
     Cuenta una sola cifra de las cuatro, y es la que costó razonar.
     El 7, el 0 y el 404 se quedan quietos a propósito: un contador
     que sube «el 404 que devuelve su dominio» se lee como truco.
     El valor final ya está escrito en el <b>, así que sin JS o con
     menos movimiento pedido se lee igual. La restauración final del
     textContent y el temporizador de seguro cubren la pestaña oculta,
     donde requestAnimationFrame se congela. ── */
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
      el.textContent = String(Math.round(fin * (1 - Math.pow(1 - k, 3))));
      if (k < 1) { requestAnimationFrame(paso); }
      else { el.textContent = texto; }
    };
    requestAnimationFrame(paso);
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  };

  /* ── 4 · Apariciones ──────────────────────────────────────────────
     El observador va sobre el CONTENEDOR, nunca sobre un elemento
     recortado: el rótulo del botón flotante bajo 520 px lleva
     clip-path a área cero y no dispararía jamás.
     Las piezas sueltas entran con el escalonado del lote (i % 4); las
     grillas —el tablero de los siete días, las tres columnas de
     urgencia, los cuatro momentos, los seis servicios, el mosaico—
     cascadean por dentro con la clase .cascada y el --i del CSS. ── */
  var piezas = [];
  ['.cifras__lista',
   '.semana__txt', '.tablero', '.semana > .nota',
   '.tajo__txt',
   '.urgencia__txt', '.urg', '.urgencia .nota--fuerte',
   '.primera__txt', '.momentos', '.primera .nota--deslinde',
   '.cita__txt',
   '.consulta__txt', '.servicios',
   '.mit__txt',
   '.mos .ancho', '.mos__grilla',
   '.donde__cols > *',
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
    var ob = new IntersectionObserver(function (es, o) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        var el = e.target;
        o.unobserve(el);
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    piezas.forEach(function (el) {
      /* Lo que ya está en pantalla al cargar se destapa de inmediato:
         esperar un evento de scroll que en una pantalla apaisada puede
         no llegar nunca deja media página invisible. */
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { ob.observe(el); }
    });
  }
  /* Barrido a los 6 s, incondicional: si algo no se mostró, se muestra
     igual. classList.add es idempotente y contar() tiene su guarda. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 5 · El mensaje del caso ──────────────────────────────────────
     Asevet no publica ningún teléfono —ni en asevet.cl, que responde
     404, ni en su ficha— así que acá NO hay wa.me: inventar un número
     mandaría a sus clientes a un teléfono equivocado. Lo que hace este
     bloque es armar el texto en pantalla para leerlo por teléfono o
     copiarlo. No hay fetch, no sale nada de la página.
     Siempre textContent, nunca innerHTML. ── */
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');
  var campos = [];
  ['f-animal', 'f-especie', 'f-que', 'f-desde'].forEach(function (id) {
    var c = document.getElementById(id);
    if (c) { campos.push(c); }
  });

  if (salida && campos.length) {
    /* El rótulo de cada línea sale del <label> del propio campo, no de
       una lista repetida acá: si mañana cambia el texto del formulario,
       el mensaje cambia solo. */
    var rotulo = function (campo) {
      var lab = campo.closest ? campo.closest('label') : null;
      if (!lab) { return campo.id; }
      var n = lab.firstChild;
      while (n) {
        if (n.nodeType === 3 && n.nodeValue.trim()) { return n.nodeValue.trim(); }
        n = n.nextSibling;
      }
      return campo.id;
    };
    var armar = function () {
      var partes = [];
      campos.forEach(function (c) {
        var val = c.value ? c.value.trim() : '';
        if (val) { partes.push(rotulo(c) + ': ' + val); }
      });
      if (!partes.length) { salida.textContent = ''; return ''; }
      /* Va en líneas y no en una frase corrida porque quien lo recibe lo
         lee por teléfono mientras anota. El .form__salida tiene
         white-space: pre-wrap para respetar los saltos. */
      var t = 'Hola, necesito atención veterinaria.\n' + partes.join('\n');
      salida.textContent = t;
      return t;
    };
    campos.forEach(function (c) {
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    if (btn) {
      var textoBoton = btn.textContent;
      var reponer = null;
      var avisar = function (m) {
        btn.textContent = m;
        clearTimeout(reponer);
        reponer = setTimeout(function () { btn.textContent = textoBoton; }, 2400);
      };
      /* Copia con respaldo: navigator.clipboard necesita contexto
         seguro y permiso; donde no lo haya, cae al textarea temporal
         con execCommand. Las medidas del textarea se ponen por
         propiedad de estilo desde JS —la CSP prohíbe el atributo
         style="" en el HTML, no la propiedad. */
      var alaAntigua = function (t) {
        var ta = document.createElement('textarea');
        ta.value = t;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        avisar(ok ? 'Copiado' : 'Seleccione el texto y cópielo');
      };
      btn.addEventListener('click', function () {
        var t = armar();
        if (!t) {
          salida.textContent = 'Escriba al menos el nombre del animal y qué le pasa.';
          if (campos[0]) { campos[0].focus(); }
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(t)
            .then(function () { avisar('Copiado'); })
            .catch(function () { alaAntigua(t); });
        } else { alaAntigua(t); }
      });
    }
  }
})();
