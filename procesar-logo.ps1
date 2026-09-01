<#
    procesar-logo.ps1 — saca el logo oficial de CristalWeb desde el JPEG
    original (imagenes/logo-cw-original.jpg) y genera los PNG del sitio.

    El original es el logo NEGRO sobre fondo gris claro. El sitio es
    oscuro, asi que un logo negro no se ve: aca se hace lo mismo que con
    los logos del carrusel, pero en el archivo y no en CSS — el trazo se
    tine del hueso de la paleta (#E8F1F6) y el fondo se vuelve
    transparente con una rampa de alfa, para que el borde no quede
    serruchado.

    Salidas:
      assets/logos/cw-marca.png   solo el emblema (para la cabecera)
      assets/logos/cw-lockup.png  emblema + texto (para el contacto)
#>
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName PresentationCore

$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $dir "imagenes\logo-cw-original.jpg"

$bytes = [System.IO.File]::ReadAllBytes($src)
$ms = New-Object System.IO.MemoryStream(,$bytes)
$dec = [System.Windows.Media.Imaging.BitmapDecoder]::Create($ms, "None", "OnLoad")
$frame = $dec.Frames[0]
$conv = New-Object System.Windows.Media.Imaging.FormatConvertedBitmap($frame, [System.Windows.Media.PixelFormats]::Bgra32, $null, 0)
$w = $conv.PixelWidth; $h = $conv.PixelHeight
$stride = $w * 4
$px = New-Object byte[] ($stride * $h)
$conv.CopyPixels($px, $stride, 0)

# Tinte: el hueso de la paleta
$tR = 0xE8; $tG = 0xF1; $tB = 0xF6

# Rampa de alfa por luminancia: bajo 170 el pixel es trazo pleno, sobre
# 225 es fondo, y entre medio se degrada para que el borde quede suave.
$lo = 170.0; $hi = 225.0
for ($i = 0; $i -lt $px.Length; $i += 4) {
    $b = $px[$i]; $g = $px[$i+1]; $r = $px[$i+2]
    $lum = 0.2126*$r + 0.7152*$g + 0.0722*$b
    if ($lum -ge $hi) { $a = 0 }
    elseif ($lum -le $lo) { $a = 255 }
    else { $a = [int](255.0 * ($hi - $lum) / ($hi - $lo)) }
    # el PNG va premultiplicado no: Bgra32 es alfa recto. Color = tinte.
    $px[$i]   = [byte]$tB
    $px[$i+1] = [byte]$tG
    $px[$i+2] = [byte]$tR
    $px[$i+3] = [byte]$a
}

function Get-BBox([byte[]]$p, [int]$w, [int]$h, [int]$stride, [int]$y0, [int]$y1) {
    $minX = $w; $maxX = -1; $minY = $h; $maxY = -1
    for ($y = $y0; $y -lt $y1; $y++) {
        $row = $y * $stride
        for ($x = 0; $x -lt $w; $x++) {
            if ($p[$row + $x*4 + 3] -gt 40) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    @($minX, $minY, $maxX, $maxY)
}

function Save-Crop([byte[]]$p, [int]$w, [int]$stride, [int[]]$bb, [int]$pad, [double]$escala, [string]$salida) {
    $x0 = [Math]::Max(0, $bb[0] - $pad); $y0 = [Math]::Max(0, $bb[1] - $pad)
    $x1 = [Math]::Min($w - 1, $bb[2] + $pad); $y1 = $bb[3] + $pad
    $cw = $x1 - $x0 + 1; $ch = $y1 - $y0 + 1
    $cstride = $cw * 4
    $cp = New-Object byte[] ($cstride * $ch)
    for ($y = 0; $y -lt $ch; $y++) {
        [Array]::Copy($p, ($y0 + $y) * $stride + $x0 * 4, $cp, $y * $cstride, $cstride)
    }
    $bmp = [System.Windows.Media.Imaging.BitmapSource]::Create($cw, $ch, 96, 96, [System.Windows.Media.PixelFormats]::Bgra32, $null, $cp, $cstride)
    $final = if ($escala -lt 1.0) {
        New-Object System.Windows.Media.Imaging.TransformedBitmap($bmp, (New-Object System.Windows.Media.ScaleTransform($escala, $escala)))
    } else { $bmp }
    $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
    $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($final))
    $fs = [System.IO.File]::Create($salida)
    $enc.Save($fs); $fs.Close()
    "{0}  {1}x{2}  {3} KB" -f (Split-Path -Leaf $salida), $final.PixelWidth, $final.PixelHeight, [int]((Get-Item $salida).Length / 1024)
}

# El emblema es lo que hay en el 72% superior; el lockup es todo.
$bbEmblema = Get-BBox $px $w $h $stride 0 ([int]($h * 0.72))
$bbTodo    = Get-BBox $px $w $h $stride 0 $h

$pad = [int]($w * 0.02)
$outM = Join-Path $dir "assets\logos\cw-marca.png"
$outL = Join-Path $dir "assets\logos\cw-lockup.png"

# marca: alto final ~160 px (la cabecera la muestra a 40, queda 4x)
$altoEmb = $bbEmblema[3] - $bbEmblema[1] + 2*$pad
Save-Crop $px $w $stride $bbEmblema $pad ([Math]::Min(1.0, 160.0 / $altoEmb)) $outM
# lockup: ancho final ~720 px
$anchoTodo = $bbTodo[2] - $bbTodo[0] + 2*$pad
Save-Crop $px $w $stride $bbTodo $pad ([Math]::Min(1.0, 720.0 / $anchoTodo)) $outL
