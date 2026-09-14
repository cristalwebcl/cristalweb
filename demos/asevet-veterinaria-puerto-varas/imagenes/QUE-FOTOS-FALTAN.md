# Qué fotos faltan — Asevet, Puerto Varas

Estado al 09-09-2026. Ninguna imagen de esta página es de Asevet: son
fotos de rubro de bancos libres. Esta lista es lo que cambiaría si la
clínica manda material propio, y lo que hoy está resuelto con un apaño.

## Lo que está resuelto con un apaño, y por qué

**`port-01.jpg` y `cita-01.jpg` van a 1280 px, no a 2560 y 2200.**
Son fotogramas de `video/port.mp4` y `video/cita.mp4`. Se hace así a
propósito: la foto es la base y el clip se funde encima, así que si la
foto fuera de otra escena el fundido cambiaría de imagen y se vería el
salto. Un fotograma del propio clip hace que el video «cobre vida»
sobre la misma imagen. La licencia del clip cubre el fotograma.
El costo es la resolución: el banco no entrega el clip a más de
1280×720 sin la versión 4K, y bajar la 4K a un fotograma no arregla el
encuadre, que es lo que importa acá.
Si Asevet manda una foto de su fachada o de su box, `port-01.jpg` se
reemplaza por esa **y el clip se queda igual**: sólo hay que rehacer
el `object-position` de `.portada__foto img, .portada__video` para que
las dos coincidan.

## Lo que falta y sólo lo puede dar la clínica

| Slot | Qué habría que poner | Qué mejora |
|---|---|---|
| `port-01` | La fachada de Av. Colón 0461, de tarde | Se reconoce el local desde la calle |
| `mit-01` | La sala de espera real | Hoy es un beagle genérico; la sala vende «lo atienden hoy» |
| `mos1`…`mos7` | Los pacientes de verdad, con permiso del dueño | El mosaico es la prueba social; hoy es catálogo |
| `telon-01` | El box de consulta | El telón ya funciona, pero con el box propio deja de ser stock |
| — | El equipo, con nombre y título | No hay sección de equipo porque no hay ni un dato real |

## Lo que NO se puso a propósito

- **Nada de rayos X, ecografías ni heridas.** La página no es
  instructiva y no muestra procedimientos.
- **Ningún menor identificable, ningún rostro sin licencia de banco.**
- **Ninguna marca legible.** Se revisaron los grabados de los frascos
  de `mos3-01` y `mos7-01` al tamaño real de pantalla: no se leen.
- **Ninguna foto que prometa otro lugar.** El 09-09-2026 se sacó la que
  era un perro echado en un pastizal con montañas al fondo: ambiente sí,
  pero no era una clínica ni era Puerto Varas.

## Deuda de papeles

Siete archivos del lote del 02-09-2026 perdieron su línea de origen en
`FUENTES.txt` (está explicado ahí). No se inventó el crédito. Antes de
publicar hay que reponerlo o cambiar esas siete fotos.
