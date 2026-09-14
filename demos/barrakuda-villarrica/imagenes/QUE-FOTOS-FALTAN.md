# Qué fotos faltan — BarraKuda

Actualizado el 09-09-2026. Hoy la página se sostiene con tres fotos
propias (recortadas en cinco piezas) y nueve de banco libre que son
sólo ambiente. Todo lo que se come en la página es de ellos, y así
tiene que seguir: la comida de banco es lo único que un cliente nota
como mentira.

Van por orden de lo que más cambia la página.

## 1 · La barra encendida, de noche y sin gente
Es la mitad del negocio y hoy no hay ni una foto suya. La página tiene
dos huecos dibujados esperándola, uno en la sección clara («La barra»)
y otro en el texto para el dueño. Horizontal, 1600 px de ancho como
mínimo, sin flash: la luz de la barra es la que tiene que verse.
Reemplaza a `tajo-01.jpg` y llena la ficha del hueco.

## 2 · Una tabla de picoteo servida, vista desde arriba
Es lo que promete la sección firma («¿Pedimos una o dos?») y hoy esa
sección no tiene ninguna foto de las tablas. Con la mesa puesta, en
una mesa del local, no en la cocina. Horizontal o cuadrada, 1600 px.
Sería la primera foto de las tres tablas y permitiría poner una por
armado.

## 3 · La parrilla propia
En su ficha de Google hay una parrillada, pero lleva estampado el logo
de otro restaurante: no se puede usar y así está dicho en la página.
Una foto de la parrilla de ellos cierra ese hueco.

## 4 · La fachada de noche, con el letrero encendido
Para reconocer el local desde la vereda. Hoy la portada usa una barra
de banco libre: si tienen letrero luminoso, esa foto la reemplaza y la
página gana el doble, porque la identidad entera es un letrero de neón.
Horizontal, 1600 px, de noche.

## 5 · El salón lleno, con permiso
Si algún día consiguen permiso de las personas que salen, una foto del
local lleno un viernes vale por todo el mosaico. Sin permiso firmado,
no.

## Lo que NO sirve
- Fotos de día de un local que se llena de noche: contradicen la página.
- Tragos y platos de banco de imágenes: la regla de la casa es que la
  comida sea del negocio.
- Verticales para el letrero y para el tajo (son franjas apaisadas).
- Cualquier foto con una marca de tercero legible, con un precio
  dentro, con menores o con rostros sin permiso.

## Lo que NO es una foto y falta más que las fotos
Los horarios. La cocina hasta qué hora, la barra hasta qué hora, hasta
qué hora conviene llegar y qué días abre. Están puestos y vacíos en la
página, marcados con «falta», esperando cuatro líneas. Y el teléfono:
su ficha de Google no publica ninguno, y acá no se inventa uno — por
eso el botón flotante lleva al armador de mensaje de la misma página en
vez de a un WhatsApp.

## Nota técnica
HEIC del iPhone → JPEG con PowerShell + WIC. No hay encoder WebP en
esta máquina: todo se normaliza a JPEG. Los prefijos de archivo son el
tratamiento, no el contenido: `port-`, `tajo-`, `cita-`, `telon-`,
`aura-`, `mit-`, `tira-`, `mos1-`…`mos6-`. Una foto nueva entra
reemplazando al archivo del tratamiento que le toca y conservando el
nombre, o entrando como `-02`.
