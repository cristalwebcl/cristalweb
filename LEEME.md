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

## Lo que falta

1. **La foto de los dos socios.** Va en `assets/socios.jpg`, proporción 3:2
   horizontal, ideal 1800 × 1200 px. Las instrucciones para sacarla están en
   un comentario dentro de `index.html`, justo encima del marcador.
2. **El WhatsApp de la sociedad.** El bloque está escrito y comentado en la
   sección de contacto de `index.html`; solo hay que poner el número en
   formato internacional y descomentarlo. No se puso uno inventado.
3. **Revisar el rol de Guillermo.** Quedó como "Desarrollo y soporte", que es
   un supuesto; ajustarlo cuando lo definan entre los dos.

## Publicación

Va a una organización de GitHub aparte (`cristalweb-cl`), no a la cuenta
personal, para que los dos socios puedan editar con su propio usuario sin
compartir contraseña.

```
gh repo create cristalweb-cl/cristalweb-cl.github.io --public --source=. --remote=origin --push
```

La rama por defecto acá es `master`, no `main`.
