$ErrorActionPreference = "Stop"

$BaseUrl = "https://theuniversalconverter.com"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$SitemapPath = Join-Path $Root "sitemap.xml"

$urls = New-Object System.Collections.Generic.List[string]

Get-ChildItem $Root -Recurse -File | Where-Object {
  $_.Extension -eq ".html"
} | Sort-Object FullName | ForEach-Object {
  $relative = $_.FullName.Substring($Root.Length).TrimStart([char[]]@("\", "/")) -replace "\\", "/"
  if ($relative -eq "404.html" -or $relative.StartsWith("convert/")) {
    return
  }
  if ($relative -eq "index.html") {
    $urls.Add("$BaseUrl/")
  } elseif ($relative.EndsWith("/index.html")) {
    $urls.Add("$BaseUrl/" + $relative.Substring(0, $relative.Length - "index.html".Length))
  } else {
    $urls.Add("$BaseUrl/$relative")
  }
}

$xml = New-Object System.Text.StringBuilder
[void]$xml.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$xml.AppendLine('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
$urls | Sort-Object -Unique | ForEach-Object {
  [void]$xml.AppendLine("  <url><loc>$([System.Security.SecurityElement]::Escape($_))</loc><lastmod>2026-07-01</lastmod><changefreq>weekly</changefreq></url>")
}
[void]$xml.AppendLine('</urlset>')
[System.IO.File]::WriteAllText($SitemapPath, $xml.ToString(), [System.Text.UTF8Encoding]::new($false))
Write-Host "Generated sitemap.xml with $(($urls | Sort-Object -Unique).Count) URLs."
