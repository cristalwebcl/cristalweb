/* ══════════════════════════════════════════════════════════════════
   CLINICA VETERINARIA TEMUCO — demo 160
   JS clasico, un IIFE, sin dependencias, sin peticiones.

   Todo lo que se lee en la pagina esta escrito en el HTML. Este
   archivo solo agrega comodidad: aparta el boton flotante sobre la
   portada, despega la cabecera, escalona lo que entra en pantalla,
   cuenta una sola cifra y arma el recado. Si no llega, la tabla se lee
   completa — y en una pagina que ayuda a decidir cuando llevar un
   animal, eso no es negociable.

   OJO CON LA CSP: `el.textContent = ...` y `el.style.x = ...` desde
   JavaScript SI funcionan con style-src 'self'. Lo que la CSP bloquea
   es el ATRIBUTO style escrito en el HTML, no el CSSOM.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · El boton flotante se aparta sobre la portada ──────────────
     El boton esta escrito en el HTML y es VISIBLE por defecto: aca
     solo se esconde mientras mas de la mitad de la portada esta en
     pantalla, para no tapar el titular. Se observa la PORTADA y no el
     boton: el boton es fixed y un elemento fixed nunca entra ni sale
     de la ventana, asi que observarlo no dispararia jamas. Se mide una
     vez a mano antes de montar el observador, para que no quede pegado
     en el estado equivocado durante el primer scroll. ── */
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

  /* ── 2 · Cabecera fantasma ──
     La clase se toca solo cuando cambia: cero trabajo por frame. */
  var cab = document.getElementById('cab');
  if (cab) {
    var flotando = false;
    var mirarCab = function () {
      var abajo = window.pageYOffset > 40;
      if (abajo !== flotando) {
        flotando = abajo;
        cab.classList.toggle('cab--flota', abajo);
      }
    };
    window.addEventListener('scroll', mirarCab, { passive: true });
    mirarCab();
  }

  /* ── 3 · La cifra que cuenta ──────────────────────────────────────
     Una sola de las cuatro, y es la que costo verificar: las 177
     resenas. El 4,6 y el 15 son aritmetica de la propia pagina y el 0
     es la herida — un contador que sube el 0 se lee como truco.
     El valor final ya esta escrito dentro del <b>, asi que sin JS o
     con reduced-motion se lee igual. La restauracion del texto al
     final es obligatoria: sin ella un formato con coma o con punto
     queda convertido en el entero calculado. ── */
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
    /* Seguro por si el rAF se congela con la pestana oculta. */
    setTimeout(function () { el.textContent = texto; }, dur + 600);
  };

  /* ── 4 · Apariciones al entrar en pantalla ────────────────────────
     El observador va siempre sobre el CONTENEDOR, nunca sobre un
     elemento recortado: algo con clip-path a area cero no dispara
     IntersectionObserver jamas y se queda invisible para siempre.
     Las grillas entran como UNA pieza y sus hijos cascadean por CSS
     con --i (clase .cascada); las piezas sueltas escalonan aca. ── */
  var piezas = [];
  ['.cifras__lista', '.cifras__pie',
   '.triage__cabecera', '.tabla-envoltura', '.firma',
   '.tajo',
   '.antes__cabecera', '.fichas', '.antes__nota',
   '.cita__texto',
   '.noche__cuerpo',
   '.mitades__texto', '.mitades__foto',
   '.nombre__cuerpo',
   '.tira__pieza',
   '.mos__titulo', '.mos__nota', '.mos__p',
   '.contacto__uno', '.datos',
   '.dueno__cols']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        piezas.push(el);
      });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });

  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras__lista')) { contar(el); }
  };

  if (!('IntersectionObserver' in window)) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (entradas, o) {
      entradas.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        var el = e.target;
        o.unobserve(el);
        setTimeout(function () { destapar(el); }, (i % 4) * 60);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    /* Lo que ya esta en pantalla al cargar se destapa de inmediato: en
       una pantalla apaisada o en una pagina corta el evento de scroll
       que lo destaparia puede no llegar nunca. */
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { obs.observe(el); }
    });
  }
  /* Barrido a los 6 s, incondicional: si algo no se mostro, se muestra
     igual. classList.add es idempotente y contar() tiene su guarda. */
  setTimeout(function () { piezas.forEach(destapar); }, 6000);

  /* ── 5 · La entrada de la portada ──
     No espera al scroll: la portada ya esta en pantalla. `forwards` y
     nunca `both`: `both` pisa lo que venia antes.
     El .ok de la SECCION es el que funde la foto de fondo (la clase
     .js la deja en opacidad 0). Va aca y no en la lista de arriba: la
     portada no se revela al entrar en pantalla, ya esta puesta. */
  var txt = document.querySelector('.portada__texto');
  var secPort = document.querySelector('.portada--foto');
  setTimeout(function () {
    if (txt) { txt.classList.add('ok'); }
    if (secPort) { secPort.classList.add('ok'); }
  }, 120);

  /* ── 6 · El recado ────────────────────────────────────────────────
     No manda nada a ninguna parte: no hay fetch, no hay accion de
     formulario, no hay servidor. Arma la frase en pantalla para que se
     lea por telefono. La frase base viaja escrita en el HTML, asi que
     sin JavaScript se lee el ejemplo completo.
     La clinica no publica WhatsApp — solo el fijo verificado — y no se
     inventa uno: por eso esto compone texto y no un enlace wa.me. ── */
  var salida = document.getElementById('r-salida');
  var campos = [document.getElementById('r-animal'),
                document.getElementById('r-desde'),
                document.getElementById('r-que')];
  if (salida && campos[0] && campos[1] && campos[2]) {
    var limpio = function (c) { return (c.value || '').replace(/\s+/g, ' ').trim(); };
    var armar = function () {
      var animal = limpio(campos[0]) || campos[0].placeholder;
      var desde  = limpio(campos[1]) || campos[1].placeholder;
      var que    = limpio(campos[2]) || campos[2].placeholder;
      var t = 'Hola. Llamo por ' + animal + '. ' +
              desde.charAt(0).toUpperCase() + desde.slice(1) + ' ' + que + '. ' +
              'Quiero saber si lo llevo ahora o si puede esperar.';
      salida.textContent = t;   /* textContent, nunca innerHTML */
    };
    campos.forEach(function (c) {
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();   /* una vez al cargar, para dejar la frase coherente */
  }

})();
