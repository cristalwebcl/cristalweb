/* ═══════════════════════════════════════════════════════════════════
   Serviteca AVF · demo 133 (tanda P3)

   JS clásico, IIFE, sin librerías. Cuatro cosas:
   1. Cancela el temporizador de rescate de la clase .js.
   2. El botón flotante de WhatsApp: ya está visible por CSS; acá sólo
      se lo aparta mientras se mira la portada.
   3. Cabecera fantasma (por defecto es sólida; acá se agrega la
      transparencia sobre la portada y el esconder al bajar).
   4. Apariciones con IntersectionObserver y sus dos resguardos.

   POR QUÉ ESTE ARCHIVO SE REESCRIBIÓ (10-09-2026)
   El CSS esconde bajo .js tres cosas que se destapan con la clase .ok
   —la foto de portada, el tajo y las seis piezas del mosaico— y este
   script ponía .on, que no existe en ninguna regla, y ni siquiera las
   tenía en su lista. Como además cancela el rescate de la clase .js,
   la foto de la portada, la franja a sangre y el mosaico entero
   quedaban en opacidad 0 PARA SIEMPRE: la página se veía vacía
   justamente en los tres sitios donde estaba el gasto. Ahora hay una
   sola clase de destape, .ok, y toda pieza que el CSS esconde está en
   la lista de abajo. Regla: si se agrega una regla `.js X { opacity: 0 }`
   al CSS, X va en este archivo el mismo día.

   Y ninguna animación se declara desde acá: el escalonado va por
   nth-child en el CSS. Un `el.style.transitionDelay` deja un atributo
   style en el DOM y la CSP de la casa no admite estilos en línea.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* 1 · el rescate ya no hace falta: main.js llegó */
  clearTimeout(window.__rescate);

  var cab     = document.getElementById('cab');
  var portada = document.getElementById('portada');
  var reduce  = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════════════════════════
     2 · WHATSAPP FLOTANTE
     El botón ya está escrito en el HTML y ya es visible por CSS. Acá
     sólo se lo aparta mientras el visitante mira la portada, para no
     tapar el titular.
     Se observa la PORTADA, no el botón: el botón es position: fixed y
     un elemento fijo no entra ni sale nunca de la ventana, así que
     observarlo no dispararía jamás.
     El cálculo a mano va SIEMPRE, en cada scroll y en cada resize, y
     no como respaldo del navegador sin observador: si el observador
     quedara mudo después de disparar una vez, la clase .wapp--arriba
     no se quitaría nunca y el CTA obligatorio se quedaría invisible de
     punta a punta de la página.
     ═══════════════════════════════════════════════════════════════ */
  var wapp = document.querySelector('.wapp');
  if (wapp && portada) {
    var apartado = null;
    var ponerWapp = function (v) {
      if (v === apartado) { return; }
      apartado = v;
      wapp.classList.toggle('wapp--arriba', v);
    };
    var mirarWapp = function () {
      var r = portada.getBoundingClientRect();
      var visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      ponerWapp(visible > r.height * 0.55);
    };
    mirarWapp();
    window.addEventListener('scroll', mirarWapp, { passive: true });
    window.addEventListener('resize', mirarWapp, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { ponerWapp(e.intersectionRatio > 0.55); });
      }, { threshold: [0, 0.55, 1] }).observe(portada);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     3 · CABECERA FANTASMA
     Umbral de 120 px y deltas menores a 8 px ignorados, para que no
     tirite con el scroll fino del trackpad. Nunca se esconde si el
     foco del teclado está dentro de ella.
     ═══════════════════════════════════════════════════════════════ */
  if (cab) {
    var ultimo = window.pageYOffset || 0;
    var pedido = false;
    var UMBRAL = 120;
    var MINIMO = 8;

    var pintar = function () {
      pedido = false;
      var y = window.pageYOffset || 0;
      var delta = y - ultimo;

      var altoPortada = portada ? portada.offsetHeight : 0;
      if (y < altoPortada - 80) { cab.classList.add('cab--ghost'); }
      else                      { cab.classList.remove('cab--ghost'); }

      if (Math.abs(delta) < MINIMO) { return; }
      if (y < UMBRAL) {
        cab.classList.remove('cab--oculta');
      } else if (delta > 0 && !cab.contains(document.activeElement)) {
        cab.classList.add('cab--oculta');
      } else if (delta < 0) {
        cab.classList.remove('cab--oculta');
      }
      ultimo = y;
    };

    /* rAF sólo como throttle del scroll: permitido, es UI */
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; window.requestAnimationFrame(pintar); }
    }, { passive: true });

    pintar();
  }

  /* ═══════════════════════════════════════════════════════════════
     4 · APARICIONES
     Dos familias, y la diferencia importa:
     · CON .rev — piezas de texto que no se esconden solas. La clase la
       agrega este script, nunca el HTML: con el JS caído no queda nada
       oculto que rescatar.
     · SIN .rev — la foto de portada, el tajo y las piezas del mosaico,
       que el CSS ya esconde bajo .js con su propia regla. Ponerles
       .rev encima les sumaría un desplazamiento de 18 px que en un
       elemento a sangre se ve como un salto.
     Las dos familias se destapan con la MISMA clase, .ok.
     ═══════════════════════════════════════════════════════════════ */
  var juntar = function (lista) {
    var fuera = [];
    lista.forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        if (fuera.indexOf(el) === -1) { fuera.push(el); }
      });
    });
    return fuera;
  };

  var conRev = juntar([
    '.portada__texto > *',
    '.cifras__lista',
    '.casos__cabecera > *', '.fila',
    '.mitades__foto', '.mitades__texto',
    '.servicios__cab > *', '.ficha', '.servicios__nota',
    '.presion__cuerpo > *', '.clave',
    '.cita__texto',
    '.tira__pieza',
    '.galeria > :not(.galeria__grilla)', '.gal',
    '.mos__titulo', '.mos__nota',
    '.contacto__datos > *', '.mapa',
    '.dueno__cols > div'
  ]);

  var sinRev = juntar(['.portada--foto', '.tajo', '.mos__p']);

  var piezas = conRev.concat(sinRev);
  if (!piezas.length) { return; }

  conRev.forEach(function (el) { el.classList.add('rev'); });

  var mostrar = function (el) { el.classList.add('ok'); };

  /* Resguardo 1 · lo que ya se ve al cargar se muestra de inmediato.
     Va antes de observar: sin esto, en una pantalla alta el observador
     puede no disparar nunca porque la pieza jamás «entra». */
  var alto = window.innerHeight || 800;
  var faltan = [];
  piezas.forEach(function (el) {
    if (el.getBoundingClientRect().top < alto * 0.92) { mostrar(el); }
    else { faltan.push(el); }
  });

  if (!('IntersectionObserver' in window)) {
    faltan.forEach(mostrar);
    return;
  }

  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) { mostrar(e.target); obs.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });

  faltan.forEach(function (el) { obs.observe(el); });

  /* Resguardo 2 · barrido a los 6 s por si el observador nunca dispara.
     No se corta por reduced-motion: apagar el observador destaparía
     todo de golpe y mataría el fundido, que es lo único que la regla
     de la casa prohíbe apagar. */
  setTimeout(function () { piezas.forEach(mostrar); }, 6000);

  /* reduce se lee arriba y se usa sólo para no encender nada que sea
     un bucle; las apariciones siguen fundiendo. */
  if (reduce) { return; }
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