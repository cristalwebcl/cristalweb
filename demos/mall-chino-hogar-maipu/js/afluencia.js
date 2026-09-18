/* Mall Chino Hogar — cuándo hay menos gente.
   Los tres días están escritos en el HTML y se leen sin este archivo.
   Esto agrega las pestañas (semana, sábado, domingo) y muestra un día a
   la vez, con flechas del teclado. No guarda nada. Sin librerías. */
(function () {
  'use strict';
  var dias = document.querySelectorAll('[data-dia]');
  var lista = document.querySelector('[data-pestanas]');
  if (!dias.length || !lista) return;
  var botones = [];

  function mostrar(n) {
    Array.prototype.forEach.call(dias, function (d, i) {
      d.hidden = i !== n;
      botones[i].setAttribute('aria-selected', i === n ? 'true' : 'false');
      botones[i].tabIndex = i === n ? 0 : -1;
    });
  }

  Array.prototype.forEach.call(dias, function (d, i) {
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', d.id);
    b.textContent = d.getAttribute('data-dia');
    b.addEventListener('click', function () { mostrar(i); b.focus(); });
    b.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!k) return;
      e.preventDefault();
      var j = (i + k + dias.length) % dias.length;
      mostrar(j); botones[j].focus();
    });
    li.appendChild(b);
    lista.appendChild(li);
    botones.push(b);
  });
  lista.setAttribute('role', 'tablist');
  mostrar(0);
})();
