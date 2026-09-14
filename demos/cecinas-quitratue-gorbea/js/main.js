/* ═══════════════════════════════════════════════════════════════════
   CECINAS QUITRATUÉ · Gorbea
   JavaScript clásico, patrón IIFE. Sin módulos, sin librerías, sin
   build. La página funciona COMPLETA sin este archivo: acá vive el
   movimiento y la calculadora, nunca el contenido.

   El rollo de papel de la portada y la cinta de la cabecera NO están
   acá: son @keyframes de CSS, que no se congelan en pestañas de fondo
   y no cuestan un solo evento.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';


  /* ── 0 · cancelar el rescate ──────────────────────────────────────
     El script inline del <head> programó un temporizador que quita la
     clase .js a los 4 s por si este archivo nunca llegaba. Llegó: se
     cancela para que los estados ocultos sigan vivos. */
  if (window.__rescate) {
    clearTimeout(window.__rescate);
    window.__rescate = null;
  }

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ═══════════════════════════════════════════════════════════════
     1 · LA CALCULADORA DEL ASADO
     Multiplica lo que va por persona —escrito en el HTML, en los
     atributos data- de cada línea— por la cantidad de gente, y arma
     un pedido listo para mandar.

     Tres decisiones que importan más que la cuenta:

     · Las cantidades viven en el HTML (`data-por`, `data-unidad`), no
       acá. Cuando la fábrica corrija cuánto rinde lo suyo, se toca el
       HTML y este archivo no se abre.
     · Cada línea trae escrito su texto original en `data-base`. Si el
       script no corre, la lista igual dice «2 por persona». Y si el
       visitante borra el número, se vuelve a ese texto en vez de
       mostrar «NaN».
     · Los gramos se redondean hacia arriba al medio kilo más cercano
       cuando pasan de un kilo. Nadie pide 1.350 gramos de costillar
       en un mesón: pide kilo y medio.
     ═══════════════════════════════════════════════════════════════ */
  (function calculadora() {
    var input  = document.getElementById('personas');
    var lista  = document.getElementById('lista');
    var salida = document.getElementById('salida');
    var wa     = document.getElementById('wa');
    var copiar = document.getElementById('copiar');
    var avisoCopiado = document.getElementById('copiado');
    if (!input || !lista) return;

    var lineas = [].slice.call(lista.children);

    /* Redondeo de mesón: bajo un kilo, a los 50 g; sobre un kilo, al
       medio kilo. Siempre hacia arriba — que sobre, no que falte. */
    function pesoLindo(gramos) {
      if (gramos >= 1000) {
        var kilos = Math.ceil(gramos / 500) / 2;
        return (kilos % 1 === 0 ? kilos : kilos.toFixed(1).replace('.', ',')) + ' kg';
      }
      return (Math.ceil(gramos / 50) * 50) + ' g';
    }

    function pintar() {
      var n = parseInt(input.value, 10);
      var valido = !isNaN(n) && n >= 1;
      var partes = [];

      lineas.forEach(function (li) {
        var caja = li.querySelector('.lista-n');
        if (!caja) return;

        if (!valido) {                       // vuelta al texto escrito
          caja.textContent = caja.getAttribute('data-base');
          return;
        }

        var por = parseFloat(li.getAttribute('data-por'));
        var unidad = li.getAttribute('data-unidad');
        var total = por * n;
        var texto;

        if (unidad === 'g') {
          texto = pesoLindo(total);
        } else {
          texto = Math.ceil(total) + (Math.ceil(total) === 1 ? ' unidad' : ' unidades');
        }

        caja.textContent = texto;
        partes.push('- ' + li.getAttribute('data-item') + ': ' + texto);
      });

      if (!salida) return;

      if (!valido) {
        salida.hidden = true;
        if (wa) wa.href = 'https://wa.me/56990500979';
        return;
      }

      salida.hidden = false;
      salida.textContent = 'Para ' + n + (n === 1 ? ' persona' : ' personas') +
        ', el pedido queda así:';

      var mensaje = 'Hola, quiero hacer un pedido para ' + n +
        (n === 1 ? ' persona' : ' personas') + ':\n' + partes.join('\n');

      if (wa) wa.href = 'https://wa.me/56990500979?text=' + encodeURIComponent(mensaje);
      pintar.mensaje = mensaje;
    }

    input.addEventListener('input', pintar);
    input.addEventListener('change', pintar);
    pintar();

    /* Copiar al portapapeles.
       La API moderna necesita HTTPS o localhost, y estas demos se
       abren muchas veces con doble clic sobre el archivo (file://),
       donde no existe. Por eso queda el camino viejo con un textarea
       y execCommand: feo, pero es el que funciona en los dos casos. */
    if (copiar) {
      copiar.addEventListener('click', function () {
        var texto = pintar.mensaje;
        if (!texto) return;

        function listo() {
          if (!avisoCopiado) return;
          avisoCopiado.hidden = false;
          setTimeout(function () { avisoCopiado.hidden = true; }, 4000);
        }

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(texto).then(listo, viejo);
        } else {
          viejo();
        }

        function viejo() {
          var ta = document.createElement('textarea');
          ta.value = texto;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.top = '-1000px';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); listo(); } catch (e) { /* nada */ }
          document.body.removeChild(ta);
        }
      });
    }
  })();


  /* ═══════════════════════════════════════════════════════════════
     2 · REVEALS AL SCROLL
     Con DOS resguardos, porque un reveal que no dispara deja texto
     invisible para siempre:
       a) lo que ya está en pantalla al cargar se muestra de inmediato
       b) barrido a los 6 s que revela todo lo que quedó pendiente
     ═══════════════════════════════════════════════════════════════ */
  (function reveals() {
    var elems = [].slice.call(document.querySelectorAll('.reveal'));
    if (!elems.length) return;

    function mostrar(el) { el.classList.add('visible'); }

    var alto = window.innerHeight || document.documentElement.clientHeight;
    elems.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < alto * 0.92) mostrar(el);
    });

    if (!('IntersectionObserver' in window)) { elems.forEach(mostrar); return; }

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { mostrar(e.target); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    elems.forEach(function (el) {
      if (!el.classList.contains('visible')) obs.observe(el);
    });

    setTimeout(function () { elems.forEach(mostrar); }, 6000);
  })();


  /* ═══════════════════════════════════════════════════════════════
     3 · LA FOTO DE LA LÁMINA SE DESPLAZA AL SCROLL
     La capa es un 24% más alta que su marco, así que le sobra
     recorrido y nunca se ve el borde.
     ═══════════════════════════════════════════════════════════════ */
  (function parallax() {
    if (reduceMotion) return;

    var capas = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if (!capas.length) return;

    var FUERZA = 0.12;
    var pedido = false;

    function pintar() {
      pedido = false;
      var alto = window.innerHeight;
      capas.forEach(function (capa) {
        var marco = capa.parentElement;
        var r = marco.getBoundingClientRect();
        if (r.bottom < -100 || r.top > alto + 100) return;
        var centro = r.top + r.height / 2;
        var avance = (centro - alto / 2) / (alto / 2 + r.height / 2);
        capa.style.transform =
          'translate3d(0,' + (avance * r.height * FUERZA).toFixed(1) + 'px,0)';
      });
    }

    // rAF como throttle: acá SÍ está permitido, es UI de scroll.
    window.addEventListener('scroll', function () {
      if (!pedido) { pedido = true; window.requestAnimationFrame(pintar); }
    }, { passive: true });
    window.addEventListener('resize', pintar, { passive: true });
    pintar();
  })();


  /* ═══════════════════════════════════════════════════════════════
     4 · HUECOS DE FOTO
     Si un hueco ya tiene background-image puesto desde el CSS, se le
     marca .tiene-foto y la nota desaparece sola. Integrar una imagen
     es descomentar una regla y nada más.
     ═══════════════════════════════════════════════════════════════ */
  (function huecos() {
    var lista = [].slice.call(document.querySelectorAll('[data-foto]'));
    lista.forEach(function (h) {
      var img = window.getComputedStyle(h).backgroundImage;
      if (img && img.indexOf('url(') !== -1) h.classList.add('tiene-foto');
    });
  })();

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