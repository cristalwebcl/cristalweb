<#
    procesar-imagenes.ps1
    ------------------------------------------------------------------
    Deja las imagenes crudas de imagenes/ listas para el sitio, en assets/.

    Esta maquina no tiene Python, ImageMagick ni ffmpeg: todo se hace con
    WIC (decodifica webp y avif en Win11) y un poco de C# compilado en
    memoria para tocar los pixeles.

    QUE HACE Y POR QUE

    1. RETRATOS (yordy, guillermo). Ninguno de los dos viene limpio:
       yordy.jpg trae el damero de "fondo transparente" PINTADO en los
       pixeles (es Bgr32, sin canal alfa de verdad) y guillermo.png trae
       fondo blanco. Se recortan con un relleno por inundacion desde los
       bordes, no por umbral de color: asi la camisa blanca de Guillermo
       —que esta rodeada por el sweater oscuro y no toca ningun borde—
       no se convierte en un agujero.
       Despues se componen sobre el azul-noche del sitio y se guardan
       como JPEG. Un PNG con alfa de este tamano pesa cerca de 1 MB y
       estas paginas se abren con 4G rural.

    2. LOGOS. Tambien traen damero pintado, y ahi si conviene el umbral
       de color: el damero atraviesa los huecos interiores del logo (los
       dos ojos del logo de Python, por ejemplo), a donde la inundacion
       desde los bordes no llega nunca.

    3. FONDOS. Se bajan a 480 px y se guardan con calidad baja. Van a
       verse estirados y desenfocados detras del contenido: agrandar una
       imagen chica ya produce el desenfoque gratis, sin costar un filtro
       de GPU en cada scroll ni 900 KB de descarga.
#>

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$raiz    = Split-Path -Parent $MyInvocation.MyCommand.Path
$entrada = Join-Path $raiz 'imagenes'
$salida  = Join-Path $raiz 'assets'
foreach ($d in @('retratos', 'logos', 'fondos')) {
  $p = Join-Path $salida $d
  if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p | Out-Null }
}

Add-Type -TypeDefinition @"
using System;
using System.Collections.Generic;

public static class Pixeles
{
    // Es "fondo" si es claro y desaturado: cubre tanto el blanco liso
    // como los dos grises del damero de transparencia.
    static bool EsClaro(byte[] p, int i, int luz, int sat)
    {
        byte b = p[i], g = p[i + 1], r = p[i + 2];
        int max = Math.Max(r, Math.Max(g, b));
        int min = Math.Min(r, Math.Min(g, b));
        return max >= luz && (max - min) <= sat;
    }

    // Relleno por inundacion desde los cuatro bordes. Solo borra el fondo
    // conectado al exterior; lo que este rodeado de sujeto se conserva.
    public static void FloodBordes(byte[] p, int w, int h, int luz, int sat)
    {
        bool[] visto = new bool[w * h];
        Stack<int> pila = new Stack<int>();

        for (int x = 0; x < w; x++) { pila.Push(x); pila.Push((h - 1) * w + x); }
        for (int y = 0; y < h; y++) { pila.Push(y * w); pila.Push(y * w + w - 1); }

        while (pila.Count > 0)
        {
            int idx = pila.Pop();
            if (idx < 0 || idx >= w * h || visto[idx]) continue;
            int i = idx * 4;
            if (!EsClaro(p, i, luz, sat)) continue;

            visto[idx] = true;
            p[i + 3] = 0;

            int x = idx % w, y = idx / w;
            if (x > 0)     pila.Push(idx - 1);
            if (x < w - 1) pila.Push(idx + 1);
            if (y > 0)     pila.Push(idx - w);
            if (y < h - 1) pila.Push(idx + w);
        }
    }

    // Come el halo claro que rodea al sujeto, hacia adentro y de a un pixel.
    // La regla es "claro, desaturado y con un vecino ya transparente"; al
    // repetirla se propaga por el halo y se detiene sola al topar con el pelo
    // oscuro. Es auto-limitante, por eso no toca la camisa blanca: esa esta a
    // decenas de pixeles de cualquier transparencia.
    public static void DesHalo(byte[] p, int w, int h, int pasos, int luz, int sat)
    {
        for (int paso = 0; paso < pasos; paso++)
        {
            bool[] borrar = new bool[w * h];
            bool alguno = false;

            for (int y = 1; y < h - 1; y++)
                for (int x = 1; x < w - 1; x++)
                {
                    int idx = y * w + x, i = idx * 4;
                    if (p[i + 3] == 0) continue;
                    if (!EsClaro(p, i, luz, sat)) continue;
                    if (p[(idx - 1) * 4 + 3] == 0 || p[(idx + 1) * 4 + 3] == 0 ||
                        p[(idx - w) * 4 + 3] == 0 || p[(idx + w) * 4 + 3] == 0)
                    { borrar[idx] = true; alguno = true; }
                }

            if (!alguno) break;
            for (int idx = 0; idx < w * h; idx++) if (borrar[idx]) p[idx * 4 + 3] = 0;
        }
    }

    // El fondo blanco que se colo ENTRE los mechones queda como islas claras
    // rodeadas de pelo, sin tocar el contorno, asi que DesHalo no las alcanza.
    // Se borran por umbral, pero solo hasta cierta altura: mas abajo esta la
    // camisa blanca, que con esta misma regla desapareceria. La piel no corre
    // riesgo ni arriba, porque es clara pero saturada (R muy por encima de B).
    public static void BorrarClarosArriba(byte[] p, int w, int h, int hasta, int luz, int sat)
    {
        for (int y = 0; y < hasta && y < h; y++)
            for (int x = 0; x < w; x++)
            {
                int i = (y * w + x) * 4;
                if (p[i + 3] != 0 && EsClaro(p, i, luz, sat)) p[i + 3] = 0;
            }
    }

    // Umbral global, para los logos.
    public static void PorColor(byte[] p, int w, int h, int luz, int sat)
    {
        for (int idx = 0; idx < w * h; idx++)
        {
            int i = idx * 4;
            if (EsClaro(p, i, luz, sat)) p[i + 3] = 0;
        }
    }

    // El pixel del contorno quedo con color mezclado con el fondo claro y
    // se ve como un halo blanco. Se come un pixel del borde y se suaviza
    // el alfa del siguiente segun cuantos vecinos transparentes tenga.
    public static void LimpiarBorde(byte[] p, int w, int h) { LimpiarBorde(p, w, h, 1); }

    // "veces" es cuantos pixeles del contorno se comen. Una foto que ya
    // venia recortada por un removedor automatico y aplanada sobre blanco
    // trae un halo de varios pixeles, y con uno solo no alcanza.
    public static void LimpiarBorde(byte[] p, int w, int h, int veces)
    {
        byte[] alfa = new byte[w * h];
        for (int i = 0; i < w * h; i++) alfa[i] = p[i * 4 + 3];

        byte[] erosion = (byte[])alfa.Clone();
        for (int paso = 0; paso < veces; paso++)
        {
            byte[] previo = (byte[])erosion.Clone();
            for (int y = 1; y < h - 1; y++)
                for (int x = 1; x < w - 1; x++)
                {
                    int idx = y * w + x;
                    if (previo[idx] == 0) continue;
                    if (previo[idx - 1] == 0 || previo[idx + 1] == 0 ||
                        previo[idx - w] == 0 || previo[idx + w] == 0) erosion[idx] = 0;
                }
        }

        for (int y = 1; y < h - 1; y++)
            for (int x = 1; x < w - 1; x++)
            {
                int idx = y * w + x;
                if (erosion[idx] == 0) { p[idx * 4 + 3] = 0; continue; }
                int vecinos = 0;
                if (erosion[idx - 1] > 0) vecinos++;
                if (erosion[idx + 1] > 0) vecinos++;
                if (erosion[idx - w] > 0) vecinos++;
                if (erosion[idx + w] > 0) vecinos++;
                p[idx * 4 + 3] = (byte)(vecinos == 4 ? 255 : 64 * vecinos);
            }
    }

    // Desenfoque de caja separable. Tres pasadas se aproximan a un
    // gaussiano y cuestan O(1) por pixel gracias al acumulador deslizante,
    // asi que una foto de 1280 px se procesa en menos de un segundo.
    //
    // Va acá y no en CSS a proposito: filter: blur() obliga al navegador a
    // recalcular el desenfoque en cada frame de scroll, y estas paginas se
    // abren en celulares de gama baja. Ademas una imagen ya desenfocada
    // comprime muchisimo mejor en JPEG, porque no le queda alta frecuencia
    // que codificar: el fondo pesa menos desenfocado que nitido.
    public static void Desenfocar(byte[] p, int w, int h, int radio, int pasadas)
    {
        for (int paso = 0; paso < pasadas; paso++)
        {
            CajaHorizontal(p, w, h, radio);
            CajaVertical(p, w, h, radio);
        }
    }

    static void CajaHorizontal(byte[] p, int w, int h, int r)
    {
        byte[] fila = new byte[w * 4];
        for (int y = 0; y < h; y++)
        {
            int baseY = y * w * 4;
            Buffer.BlockCopy(p, baseY, fila, 0, w * 4);
            for (int c = 0; c < 3; c++)
            {
                int suma = 0, n = 0;
                for (int x = -r; x <= r; x++)
                {
                    int xi = x < 0 ? 0 : (x >= w ? w - 1 : x);
                    suma += fila[xi * 4 + c]; n++;
                }
                for (int x = 0; x < w; x++)
                {
                    p[baseY + x * 4 + c] = (byte)(suma / n);
                    int sale = x - r, entra = x + r + 1;
                    suma -= fila[(sale < 0 ? 0 : sale) * 4 + c];
                    suma += fila[(entra >= w ? w - 1 : entra) * 4 + c];
                }
            }
        }
    }

    static void CajaVertical(byte[] p, int w, int h, int r)
    {
        byte[] col = new byte[h * 4];
        for (int x = 0; x < w; x++)
        {
            for (int y = 0; y < h; y++)
                Buffer.BlockCopy(p, (y * w + x) * 4, col, y * 4, 4);

            for (int c = 0; c < 3; c++)
            {
                int suma = 0, n = 0;
                for (int y = -r; y <= r; y++)
                {
                    int yi = y < 0 ? 0 : (y >= h ? h - 1 : y);
                    suma += col[yi * 4 + c]; n++;
                }
                for (int y = 0; y < h; y++)
                {
                    p[(y * w + x) * 4 + c] = (byte)(suma / n);
                    int sale = y - r, entra = y + r + 1;
                    suma -= col[(sale < 0 ? 0 : sale) * 4 + c];
                    suma += col[(entra >= h ? h - 1 : entra) * 4 + c];
                }
            }
        }
    }

    // Compone sobre un color plano y deja el alfa opaco.
    public static void SobreFondo(byte[] p, int w, int h, byte fb, byte fg, byte fr)
    {
        for (int idx = 0; idx < w * h; idx++)
        {
            int i = idx * 4;
            double a = p[i + 3] / 255.0;
            p[i]     = (byte)(p[i]     * a + fb * (1 - a));
            p[i + 1] = (byte)(p[i + 1] * a + fg * (1 - a));
            p[i + 2] = (byte)(p[i + 2] * a + fr * (1 - a));
            p[i + 3] = 255;
        }
    }
}
"@

function Leer($ruta) {
  $s = [System.IO.File]::OpenRead($ruta)
  try {
    $dec = [System.Windows.Media.Imaging.BitmapDecoder]::Create(
      $s, 'None', 'OnLoad')
    $conv = New-Object System.Windows.Media.Imaging.FormatConvertedBitmap(
      $dec.Frames[0], [System.Windows.Media.PixelFormats]::Bgra32, $null, 0)
    $conv.Freeze()
    return $conv
  } finally { $s.Close() }
}

function Bytes($bmp) {
  $stride = $bmp.PixelWidth * 4
  $buf = New-Object byte[] ($stride * $bmp.PixelHeight)
  $bmp.CopyPixels($buf, $stride, 0)
  # La coma es obligatoria: sin ella PowerShell desenvuelve el arreglo en la
  # tuberia y lo devuelve como Object[], que BitmapSource.Create rechaza.
  return ,$buf
}

function DesdeBytes($buf, $w, $h) {
  $b = [byte[]]$buf
  return [System.Windows.Media.Imaging.BitmapSource]::Create(
    $w, $h, 96, 96, [System.Windows.Media.PixelFormats]::Bgra32, $null, $b, $w * 4)
}

# Recorta por fracciones (0..1) del ancho y alto originales.
function Recortar($bmp, $x0, $y0, $x1, $y1) {
  $rect = New-Object System.Windows.Int32Rect(
    [int]($bmp.PixelWidth * $x0),
    [int]($bmp.PixelHeight * $y0),
    [int]($bmp.PixelWidth * ($x1 - $x0)),
    [int]($bmp.PixelHeight * ($y1 - $y0)))
  $c = New-Object System.Windows.Media.Imaging.CroppedBitmap($bmp, $rect)
  $c.Freeze()
  return $c
}

function Escalar($bmp, $ladoMax) {
  $f = [Math]::Min(1.0, $ladoMax / [Math]::Max($bmp.PixelWidth, $bmp.PixelHeight))
  if ($f -ge 1.0) { return $bmp }
  $t = New-Object System.Windows.Media.Imaging.TransformedBitmap(
    $bmp, (New-Object System.Windows.Media.ScaleTransform($f, $f)))
  $t.Freeze()
  return $t
}

function GuardarJpeg($bmp, $ruta, $calidad) {
  $enc = New-Object System.Windows.Media.Imaging.JpegBitmapEncoder
  $enc.QualityLevel = $calidad
  $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bmp))
  $fs = [System.IO.File]::Create($ruta)
  try { $enc.Save($fs) } finally { $fs.Close() }
}

function GuardarPng($bmp, $ruta) {
  $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
  $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bmp))
  $fs = [System.IO.File]::Create($ruta)
  try { $enc.Save($fs) } finally { $fs.Close() }
}

function Peso($ruta) { return [math]::Round((Get-Item $ruta).Length / 1KB) }

# ── 1. Retratos ──────────────────────────────────────────────────
# Azul-noche #0A1421 = 10,20,33 (el --fondo-alto del sitio)
Write-Host "`nRETRATOS" -ForegroundColor Cyan
# El umbral de Guillermo es mucho mas estricto (246) que el de Yordy (170)
# a proposito: su fondo es blanco puro y lleva una camisa blanca. Con un
# umbral flojo, la inundacion se cuela por encima del hombro y le come el
# cuello. La erosion en cambio es mayor (3 px), porque su foto ya venia
# recortada por un removedor automatico y arrastra un halo claro en el pelo.
# x0/y0/x1/y1 son el recorte 3:4 al busto, en fracciones de la foto original.
$retratos = @(
  @{ src = 'yordy.jpg';     out = 'yordy.jpg';     luz = 170; sat = 42; erosion = 1; deshalo = 0;
     x0 = .16; y0 = .21; x1 = .81; y1 = .86 },
  @{ src = 'guillermo.png'; out = 'guillermo.jpg'; luz = 246; sat = 14; erosion = 2; deshalo = 14;
     x0 = .17; y0 = .10; x1 = .83; y1 = .85 }
)
foreach ($r in $retratos) {
  $bmp = Leer (Join-Path $entrada $r.src)
  $w = $bmp.PixelWidth; $h = $bmp.PixelHeight
  $px = Bytes $bmp
  [Pixeles]::FloodBordes($px, $w, $h, $r.luz, $r.sat)
  if ($r.deshalo -gt 0) {
    [Pixeles]::DesHalo($px, $w, $h, $r.deshalo, 200, 30)
    # 45% de la altura: el pelo termina cerca del 40% y la camisa empieza al 63%.
    [Pixeles]::BorrarClarosArriba($px, $w, $h, [int]($h * 0.45), 194, 26)
  }
  [Pixeles]::LimpiarBorde($px, $w, $h, $r.erosion)
  [Pixeles]::SobreFondo($px, $w, $h, 33, 20, 10)   # B,G,R

  # Se recorta al busto ANTES de escalar. En la pagina el retrato es un
  # cuadrito de 92x122, como el del portafolio personal: si se guardara la
  # foto entera, dentro de ese recuadro la cara quedaria del tamano de una
  # arveja. El recorte 3:4 encuadra cabeza y hombros.
  # 800 px de alto para un cuadrito que se muestra a 122: sobra resolucion
  # incluso en pantallas de alta densidad, y asi no se pierde nitidez.
  $rec = Recortar (DesdeBytes $px $w $h) $r.x0 $r.y0 $r.x1 $r.y1
  $final = Escalar $rec 800
  $ruta = Join-Path $salida "retratos\$($r.out)"
  GuardarJpeg $final $ruta 92
  "  {0,-16} {1}x{2} -> {3} KB" -f $r.out, $final.PixelWidth, $final.PixelHeight, (Peso $ruta)
}

# ── 2. Logos ─────────────────────────────────────────────────────
Write-Host "`nLOGOS" -ForegroundColor Cyan
$logos = @(
  @{ src = 'png-transparent-html-logo-html-web-design-scalable-graphics-world-wide-web-markup-language-html5-icon-hd-miscellaneous-angle-text.png'; out = 'html5.png' },
  @{ src = 'css-logo-png-svg.webp';    out = 'css.png' },
  @{ src = 'images.png';               out = 'python.png' },
  @{ src = 'png-clipart-visual-studio-code-logo-thumbnail-tech-companies-thumbnail.png'; out = 'vscode.png' },
  @{ src = 'github-computer-icons-logo-repository-png-favpng-3D6iEY0b391hz9PYJZqnvKTLT.jpg'; out = 'github.png' },
  @{ src = 'claude-icon-logo.png';     out = 'claude.png' },
  @{ src = 'png-clipart-logo-internet-of-things-narrowband-iot-universal-windows-platform-brand-iot-angle-text-thumbnail.png'; out = 'iot.png' },
  @{ src = 'escudo-seguridad-cibernetica-wi-fi_78370-7897.avif'; out = 'ciberseguridad.png' }
)
foreach ($l in $logos) {
  $bmp = Leer (Join-Path $entrada $l.src)
  $w = $bmp.PixelWidth; $h = $bmp.PixelHeight
  $px = Bytes $bmp
  [Pixeles]::PorColor($px, $w, $h, 200, 26)
  [Pixeles]::LimpiarBorde($px, $w, $h)
  $final = Escalar (DesdeBytes $px $w $h) 190
  $ruta = Join-Path $salida "logos\$($l.out)"
  GuardarPng $final $ruta
  "  {0,-18} {1}x{2} -> {3} KB" -f $l.out, $final.PixelWidth, $final.PixelHeight, (Peso $ruta)
}

# ── 3. Fondos ────────────────────────────────────────────────────
Write-Host "`nFONDOS" -ForegroundColor Cyan
$fondos = @(
  @{ src = 'gotas-de-agua-en-fondo-azul-11861.webp'; out = 'gotas.jpg' },
  @{ src = 'premium_photo-1678917827802-721b5f5b4bf0.avif'; out = 'textura.jpg' },
  @{ src = '709137.jpg';              out = 'abstracto.jpg' },
  @{ src = '17209487079619.jpg';      out = 'oficina.jpg' },
  @{ src = 'eef9cc31640aa9fa8790c8a4d02718e3.jpg'; out = 'codigo.jpg' }
)
# Resolucion nativa y calidad alta, sin tocar un pixel. Se probaron dos
# caminos peores antes de llegar acá:
#   · reducirlas a 480 px esperando que el estirado hiciera de desenfoque:
#     lo que se ve estirado son los bloques de compresion, o sea pixeladas.
#   · desenfocarlas de verdad a resolucion completa: con radio 2,5% del
#     ancho (96 px en la de 4K) las gotas desaparecian y quedaba un
#     degradado plano. Se perdia justamente el motivo de la foto.
# Lo que las vuelve fondo es la opacidad baja y la mascara de cada seccion,
# no el desenfoque. Asi conservan todo su detalle.
foreach ($f in $fondos) {
  $bmp = Leer (Join-Path $entrada $f.src)
  $ruta = Join-Path $salida "fondos\$($f.out)"
  # 82 y no 94: a esta calidad la diferencia no se ve ni comparando lado a
  # lado, y el archivo pesa cuatro veces menos. Con 94 los cinco fondos
  # sumaban 3,8 MB, que contradice el "tiene que abrir con senal de campo"
  # escrito en la seccion de valores de esta misma pagina.
  GuardarJpeg $bmp $ruta 82
  "  {0,-16} {1}x{2} -> {3} KB" -f $f.out, $bmp.PixelWidth, $bmp.PixelHeight, (Peso $ruta)
}

Write-Host "`nListo.`n" -ForegroundColor Green
