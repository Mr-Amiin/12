param(
  [string]$SampleSlug = "kg-to-lbs"
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BaseUrl = "https://theuniversalconverter.com"

function Slugify { param([string]$Value) return ($Value.ToLowerInvariant() -replace "[^a-z0-9]+", "-" -replace "^-+", "" -replace "-+$", "") }
function Escape-Html { param([string]$Value) return ($Value -replace "&", "&amp;" -replace "<", "&lt;" -replace ">", "&gt;" -replace '"', "&quot;" -replace "'", "&#039;") }

function Get-PageTemplates {
  $templates = @{}

  $conversion = @(
    '<!doctype html>',
    '<html lang="en" data-theme="light">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    '  <title>{{TITLE_ESCAPED}} | Universal Converter</title>',
    '  <meta name="description" content="{{DESCRIPTION}}">',
    '  <meta name="robots" content="index, follow">',
    '  <link rel="canonical" href="{{CANONICAL}}">',
    '  <link rel="stylesheet" href="{{ASSET_BASE}}/styles.css">',
    '  <script src="{{ASSET_BASE}}/app.js" defer></script>',
    '  <script type="application/ld+json">{{BREADCRUMB_SCHEMA}}</script>',
    '  <script type="application/ld+json">{{FAQ_SCHEMA}}</script>',
    '</head>',
    '<body class="seo-page">',
    '  <header class="site-header" id="siteHeader"></header>',
    '  <div class="mobile-drawer-overlay" id="mobileDrawerOverlay" hidden></div><nav class="mobile-drawer" id="mobileDrawer" aria-hidden="true" aria-label="Mobile navigation"></nav>',
    '  <main class="page-shell">',
    '    <nav class="breadcrumb">',
    '      <a href="/">Home</a> <span>/</span> <a href="{{CATEGORY_LINK}}">{{CATEGORY_LABEL}}</a> <span>/</span> <span>{{TITLE_ESCAPED}}</span>',
    '    </nav>',
    '    <section class="tool-section">',
    '      <h1>{{TITLE_ESCAPED}}</h1>',
    '      <p>{{DESCRIPTION}}</p>',
    '      <div class="tool-layout">',
    '        {{SEO_CONVERTER_PLACEHOLDER}}',
    '      </div>',
    '    </section>',
    '    <section class="page-grid">',
    '      <article class="page-card">',
    '        <h2>Formula</h2>',
    '        <p>{{FORMULA_TEXT}}</p>',
    '      </article>',
    '      <article class="page-card">',
    '        <h2>Conversion table</h2>',
    '        <table class="conversion-table"><tbody>{{TABLE_ROWS}}</tbody></table>',
    '      </article>',
    '    </section>',
    '  </main>',
    '  <script src="{{ASSET_BASE}}/analytics-config.js" defer></script>',
    '</body>',
    '</html>'
  ) -join "`n"

  $templates['conversion'] = $conversion
  $templates['root'] = $conversion
  $templates['category'] = $conversion
  return $templates
}

function Build-FromTemplate {
  param(
    [string]$Template,
    [hashtable]$Replacements
  )
  $out = $Template
  foreach ($k in $Replacements.Keys) {
    $out = $out.Replace("{{${k}}}", [string]$Replacements[$k])
  }
  return $out
}

function Get-SeoConverterPlaceholder {
  param(
    [string]$Slug,
    [string]$CategoryId,
    [string]$FromId,
    [string]$ToId,
    [string]$Value = "1"
  )
  return '<div id="seoConverter" class="seo-converter-shell" data-slug="' + $Slug + '" data-category="' + $CategoryId + '" data-from="' + $FromId + '" data-to="' + $ToId + '" data-value="' + $Value + '"></div>'
}

function Write-ConversionPage {
  param(
    [string]$Slug,
    [string]$FromPlural,
    [string]$ToPlural,
    [double]$Factor,
    [string]$CategoryId = "general",
    [string]$DefaultValue = "1"
  )

  $folder = Join-Path $Root $Slug
  New-Item -ItemType Directory -Force -Path $folder | Out-Null
  $pagePath = Join-Path $folder "index.html"

  $title = "$FromPlural to $ToPlural Converter"
  $description = "Convert $($FromPlural.ToLower()) to $($ToPlural.ToLower()) instantly."
  $canonical = "$BaseUrl/$Slug/"
  # For pages written to `outputs/<slug>/index.html` the assets live at the parent folder
  $assetBase = "../"

  $tableRows = (1,5,10,25,100 | ForEach-Object { $result = [math]::Round($_ * $Factor, 10); "<tr><td>$_</td><td>$result $ToPlural</td></tr>" }) -join ""
  $breadcrumbSchema = ([pscustomobject]@{ "@context" = "https://schema.org"; "@type" = "BreadcrumbList"; itemListElement = @([pscustomobject]@{ "@type" = "ListItem"; position = 1; name = "Home"; item = "$BaseUrl/" }, [pscustomobject]@{ "@type" = "ListItem"; position = 2; name = "$FromPlural"; item = "$BaseUrl/$Slug/" }, [pscustomobject]@{ "@type" = "ListItem"; position = 3; name = $title; item = $canonical }) } | ConvertTo-Json -Depth 6 -Compress)
  $faqSchema = ([pscustomobject]@{ "@context" = "https://schema.org"; "@type" = "FAQPage"; mainEntity = @([pscustomobject]@{ "@type" = "Question"; name = "How do you convert $($FromPlural.ToLower()) to $($ToPlural.ToLower())?"; acceptedAnswer = [pscustomobject]@{ "@type" = "Answer"; text = "Multiply by $Factor." } }) } | ConvertTo-Json -Depth 6 -Compress)

  $templates = Get-PageTemplates
  $template = $templates['conversion']

  $replacements = @{
    TITLE = $title
    TITLE_ESCAPED = (Escape-Html $title)
    DESCRIPTION = (Escape-Html $description)
    CANONICAL = $canonical
    ASSET_BASE = $assetBase
    BREADCRUMB_SCHEMA = $breadcrumbSchema
    FAQ_SCHEMA = $faqSchema
    CATEGORY_LINK = "/"
    CATEGORY_LABEL = "$FromPlural"
    FORMULA_TEXT = "1 $FromPlural = $Factor $ToPlural"
    TABLE_ROWS = $tableRows
    SEO_CONVERTER_PLACEHOLDER = (Get-SeoConverterPlaceholder -Slug $Slug -CategoryId $CategoryId -FromId (Slugify $FromPlural) -ToId (Slugify $ToPlural) -Value $DefaultValue)
  }

  $html = Build-FromTemplate -Template $template -Replacements $replacements
  [System.IO.File]::WriteAllText($pagePath, $html, [System.Text.UTF8Encoding]::new($false))
}

################################################################################
# Unit lists and pair-generation helpers (reconstructing original architecture)
################################################################################

function Build-WeightUnits {
  return @(
    [pscustomobject]@{ Id = 'kilograms'; Label = 'Kilograms'; Abbr = 'kg'; Factor = 1.0 },
    [pscustomobject]@{ Id = 'pounds'; Label = 'Pounds'; Abbr = 'lbs'; Factor = 0.45359237 }
  )
}

function Build-AreaUnits {
  return @(
    [pscustomobject]@{ Id = 'acres'; Label = 'Acres'; Abbr = 'ac'; Factor = 4046.8564224 },
    [pscustomobject]@{ Id = 'square-centimeters'; Label = 'Square centimeters'; Abbr = 'cm²'; Factor = 0.0001 }
  )
}

function Make-OrderedPairs($units) {
  $pairs = @()
  for ($i=0; $i -lt $units.Count; $i++) {
    for ($j=0; $j -lt $units.Count; $j++) {
      if ($i -ne $j) {
        $pairs += [pscustomobject]@{ From = $units[$i]; To = $units[$j] }
      }
    }
  }
  return $pairs
}

################################################################################
# Sample-generation driver
################################################################################

# Define a small map of sample pages to generate so we can validate the template/system
$sampleIndex = @{
  'kg-to-lbs' = [pscustomobject]@{ Slug='kg-to-lbs'; Category='weight'; From='Kilograms'; To='Pounds'; Factor=2.2046226218; Default='1' }
  'acres-to-square-centimeters' = [pscustomobject]@{ Slug='acres-to-square-centimeters'; Category='area'; From='Acres'; To='Square centimeters'; Factor=40468564.224; Default='1' }
}

if (-not $sampleIndex.ContainsKey($SampleSlug)) {
  Write-Error "Unknown sample slug '$SampleSlug'. Known: $($sampleIndex.Keys -join ', ')"
  exit 1
}

$sample = $sampleIndex[$SampleSlug]

Write-Output "Generating sample page for: $($sample.Slug)"
Write-ConversionPage -Slug $sample.Slug -FromPlural $sample.From -ToPlural $sample.To -Factor $sample.Factor -CategoryId $sample.Category -DefaultValue $sample.Default

Write-Output "Generated sample page: $Root\$($sample.Slug)\index.html"
