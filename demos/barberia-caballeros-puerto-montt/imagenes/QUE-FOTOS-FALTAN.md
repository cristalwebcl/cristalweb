# Qué fotos faltan — Caballeros, Av. Angelmó 2138, Puerto Montt

Actualizado el 08-09-2026. Ordenado por lo que más cambia la página.

Hoy la demo funciona con fotos de banco: son de rubro, no del local. Se
nota, y está dicho en el pie y en la sección «Para el dueño». Cada foto
que mande la barbería reemplaza una de éstas y sube la página un
escalón, sin tocar una línea de código: se guardan con el mismo nombre.

---

## 1 · Las tres fotos de los barberos — `imagenes/barbero-1.jpg` … `-3.jpg`

**Es la que más vale de toda la lista.** Los tres huecos punteados de la
sección «Ocho años de oficio, cada uno» están vacíos a propósito: un
cliente elige barbería por el barbero, y con nombre y cara pide hora
*con alguien* en vez de con un local.

- Vertical, 3:4, mínimo 900 px de ancho.
- Cada barbero en su puesto, mirando a la cámara, luz de la ventana o
  del espejo. Nada de contraluz.
- Con el nombre y los años de oficio de cada uno.
- **Hace falta que cada uno diga que sí a salir en la página.**

## 2 · La portada — `imagenes/port-01.jpg`

Hoy va un **fotograma del clip de fondo a 1280 px**, porque el banco no
da ese mismo local en foto y una foto distinta debajo del video haría
saltar la escena en el fundido. Funciona, pero es el único punto de la
página donde la imagen no llega a 2560 px.

Lo que la reemplaza bien: **el local de Angelmó de lado a lado**, con la
puerta o la vitrina a la derecha del cuadro y espacio vacío a la
izquierda (ahí va el titular; la mitad izquierda de la foto se borra con
una máscara, así que lo importante tiene que estar a la derecha).

- Horizontal, mínimo 2560 px de ancho.
- Sin clientes reconocibles, o con su permiso.
- De día, con la luz entrando; o de noche con el local encendido.

## 3 · Un clip del local — `video/port.mp4`

Hoy son sillones de barbería de un banco libre. Un clip del propio local
—aunque sea del teléfono— vale diez veces más.

- Horizontal 16:9, 10 segundos parejos, teléfono apoyado o en trípode.
- Sin zoom y sin mover la cámara de golpe: un barrido lento basta.
- Sin música: la pista de audio se saca igual.
- Sirve el sillón vacío al abrir, la máquina sobre el mesón, el letrero.

## 4 · El mosaico — `imagenes/mos1-01.jpg` … `mos6-01.jpg`

Seis fotos del oficio. Las de ahora son de banco y se ven bien, pero son
de otra parte. Del local sirven:

1. La máquina y la tijera sobre el mesón, de cerca.
2. El sillón vacío con la luz de la mañana.
3. Un degradado recién terminado (la nuca, sin cara).
4. La navaja y la toalla caliente.
5. La vitrina o el letrero desde la vereda de Angelmó.
6. El mesón completo, con los frascos y el espejo.

Cuadradas o apaisadas, mínimo 1200 px. Se recortan solas a 3:2.

## 5 · La foto de la banda clara — `imagenes/mit-01.jpg`

Acompaña a «El mismo corte tiene cinco nombres». Hoy va una navaja con
brocha sobre fondo claro. Del local sirve cualquier plano de herramientas
**sobre fondo claro** (mesón blanco, mármol, toalla): esa banda es la
única clara de la página y necesita masa oscura sobre fondo claro.

## 6 · Cerrar los papeles de las cinco fotos heredadas

Tarea interna, no del cliente. `telon-01`, `mos1-01`, `mos4-01`,
`mos6-01` y `mit-01` vienen de la primera versión de la demo, que no dejó
registro de banco, autor y página. Se revisaron a tamaño real y ninguna
tiene rostros, marcas ni precios; falta la línea de procedencia. Volver a
bajarlas con el flujo normal y anotarlas en `FUENTES.txt`.

**Ojo con cómo se hace esa revisión.** El 08-09-2026, en una segunda
pasada, dos de las siete heredadas no pasaron el filtro: el `tajo-01`
tenía dos personas con la cara reconocible reflejadas en el espejo del
fondo, y el `mos2-01` tenía la marca del fabricante del sillón grabada en
el metal del apoyacabezas. Las dos se reemplazaron (están anotadas en
`FUENTES.txt`). En la página renderizada no se notaba ninguna de las dos:
la revisión hay que hacerla sobre el JPEG abierto a resolución completa.

## 7 · El número de WhatsApp — no es una foto, pero es lo que falta

El botón flotante de abajo a la derecha va, en todas las demás demos, al
WhatsApp del negocio. Acá no puede: Caballeros no publica ningún número
—ni en su Instagram ni en la ficha del buscador—, y un número inventado
mandaría a sus clientes al teléfono equivocado. Hoy el botón va al
Instagram, que es el único canal verificado.

Con un número publicado cambian tres cosas de una línea cada una: el
`href` del botón flotante, el `href` del botón «Abrir el Instagram» del
formulario, y la última línea de `main.js`, que en vez de copiar el
mensaje al portapapeles abriría el chat con el texto ya puesto. El código
ya está escrito para eso.

---

## Reglas para cualquier foto o clip que se mande

- **Sin marcas de otras empresas legibles**: frascos, cajas, envases. Si
  se lee la etiqueta, la foto no entra.
- **Sin precios dentro del cuadro** — la página no publica ninguno.
- **Sin menores identificables.** Sin rostros de clientes sin su permiso.
- Del teléfono está bien: mejor una foto real del local que una de banco.
  Limpiar el mesón antes y abrir la cortina; eso hace más que el equipo.
- Mandarlas **sin recortar y sin filtro**: el recorte lo hace la página.
