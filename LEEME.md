# CristalWeb — portafolio de la sociedad

Sitio de la sociedad de desarrollo web de **Yordy Serna** y **Guillermo
Contreras**. Loncoche, Región de la Araucanía. Dominio previsto:
`cristalweb.cl`.

## Cómo verlo

```
powershell -ExecutionPolicy Bypass -File serve.ps1 -Root . -Port 8778
```

Y abrir <http://localhost:8778>. También funciona abriendo `index.html`
directamente con doble clic (`file://`), porque no hay módulos ES.

## Cómo está hecho

HTML + CSS + JavaScript clásico. **Cero librerías**: ni GSAP, ni Lenis, ni
una sola petición a un CDN. Las tres fuentes están self-hosteadas en
`assets/fuentes/` (73 KB entre las tres).

El cristal de la portada es SVG dibujado a mano y animado con `@keyframes`
puros. Un modelo 3D real habría costado ~1 MB para verse igual.

La justificación de la paleta y del trío tipográfico está escrita en la
cabecera de `styles.css` — leerla antes de cambiar colores.

## Las imágenes

Los originales viven en `imagenes/` (fuera del repo, ver `.gitignore`) y las
versiones que usa el sitio salen de `procesar-imagenes.ps1`:

- **Retratos**: se les quitó el fondo (inundación desde los bordes + limpieza
  de halo) y se compusieron sobre el azul-noche del sitio, a JPEG de ~100 KB.
- **Logos**: recortados por umbral y unificados a PNG de 190 px; en la página
  van teñidos de blanco por CSS y recuperan su color al pasar el cursor.
- **Fondos**: bajados a 480 px con calidad 62 — se muestran estirados y muy
  tenues, así que el desenfoque sale gratis del propio estirado.
- **Capturas de proyectos**: copiadas de `../portafolio/assets/capturas/`.

Si llega una imagen nueva, se deja en `imagenes/`, se agrega a la lista del
script y se corre de nuevo.

## Lo que falta

1. **El WhatsApp de la sociedad.** El bloque está escrito y comentado en la
   sección de contacto de `index.html`; solo hay que poner el número en
   formato internacional y descomentarlo. No se puso uno inventado.
2. **Revisar el rol de Guillermo.** Quedó como "Desarrollo y soporte", que es
   un supuesto; ajustarlo cuando lo definan entre los dos.

## Publicación

Va a una organización de GitHub aparte (`cristalweb-cl`), no a la cuenta
personal, para que los dos socios puedan editar con su propio usuario sin
compartir contraseña.

```
gh repo create cristalweb-cl/cristalweb-cl.github.io --public --source=. --remote=origin --push
```

La rama por defecto acá es `master`, no `main`.
