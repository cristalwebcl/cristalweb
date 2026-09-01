<#
    hacer-miniaturas.ps1 - saca la imagen de tarjeta de cada demo.

    Toma la foto de portada de la demo (la misma que se ve al abrirla),
    la recorta al centro en 800x563 y la deja en assets/demos/<slug>.jpg.
    Ese formato es el que ya usan las ocho tarjetas de clientes, asi que
    la grilla no cambia de proporcion a mitad de pagina.

    Es ASCII a proposito: PowerShell 5.1 corrompe los acentos si el .ps1
    no lleva BOM, y este se escribe desde Bash.
#>
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName PresentationCore

$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$destDir = Join-Path $dir "assets\demos"
$TW = 800; $TH = 563

$hechas = 0; $saltadas = 0
foreach ($demo in (Get-ChildItem (Join-Path $dir "demos") -Directory)) {
    $slug = $demo.Name
    $img = Join-Path $demo.FullName "imagenes\port-01.jpg"
    if (-not (Test-Path $img)) {
        # 186 no tiene portada con foto: su portada es dibujo CSS y la
        # primera foto de la pagina es el fondo.
        $img = Get-ChildItem (Join-Path $demo.FullName "imagenes\*.jpg") |
               Sort-Object Name | Select-Object -First 1 -ExpandProperty FullName
    }
    if (-not $img -or -not (Test-Path $img)) { $saltadas++; continue }

    $bytes = [System.IO.File]::ReadAllBytes($img)
    $ms = New-Object System.IO.MemoryStream(,$bytes)
    $dec = [System.Windows.Media.Imaging.BitmapDecoder]::Create($ms, "None", "OnLoad")
    $src = $dec.Frames[0]
    $w = $src.PixelWidth; $h = $src.PixelHeight

    # Recorte centrado a la proporcion de la tarjeta, y despues escala.
    $ratio = $TW / [double]$TH
    if (($w / [double]$h) -gt $ratio) {
        $cw = [int]([Math]::Round($h * $ratio)); $ch = $h
    } else {
        $cw = $w; $ch = [int]([Math]::Round($w / $ratio))
    }
    $x = [int](($w - $cw) / 2)
    # Vertical: 40% en vez de 50%. En una foto de local o de fachada lo
    # que importa esta arriba del centro; recortar al medio corta cabezas.
    $y = [int](($h - $ch) * 0.40)
    $rect = New-Object System.Windows.Int32Rect($x, $y, $cw, $ch)
    $crop = New-Object System.Windows.Media.Imaging.CroppedBitmap($src, $rect)

    $esc = $TW / [double]$cw
    $fin = New-Object System.Windows.Media.Imaging.TransformedBitmap(
        $crop, (New-Object System.Windows.Media.ScaleTransform($esc, $esc)))

    $enc = New-Object System.Windows.Media.Imaging.JpegBitmapEncoder
    $enc.QualityLevel = 76
    $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($fin))
    $out = Join-Path $destDir "$slug.jpg"
    $fs = [System.IO.File]::Create($out)
    $enc.Save($fs); $fs.Close()

    $ms.Dispose(); $dec = $null; $bytes = $null
    $hechas++
}
"{0} miniaturas, {1} saltadas" -f $hechas, $saltadas
$suma = (Get-ChildItem (Join-Path $destDir "*.jpg") | Measure-Object Length -Sum).Sum
"peso total: {0} KB" -f [int]($suma / 1024)
