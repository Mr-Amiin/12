$ErrorActionPreference = 'Stop'
$root = 'c:\Users\Think Station\Documents\Codex\2026-06-25\create-a-modern-responsive-utility-conversion\outputs'
$oldId = 'ca-pub-4632693492035799'
$oldPub = 'pub-4632693492035799'
$newId = 'ca-pub-4632693492035799'
$newPub = 'pub-4632693492035799'
$metaTag = '<meta name="google-adsense-account" content="' + $newId + '">'
$scriptTag = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + $newId + '" crossorigin="anonymous"></script>'

$files = Get-ChildItem -Path $root -Recurse -File | Where-Object {
  $_.Extension -in @('.html', '.js', '.ps1', '.txt', '.md', '.json', '.py')
}

foreach ($file in $files) {
  $text = [System.IO.File]::ReadAllText($file.FullName, [System.Text.UTF8Encoding]::new($false))
  $original = $text

  $text = $text.Replace($oldId, $newId).Replace($oldPub, $newPub)

  if ($file.Extension -eq '.html') {
    $text = [regex]::Replace($text, '(?is)<meta\s+name=["'']google-adsense-account["''][^>]*>', '')
    $text = [regex]::Replace($text, '(?is)<script\b[^>]*src=["'']https://pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js[^"'']*["''][^>]*></script>', '')
    if ($text -match '</head>') {
      if ($text -notmatch 'google-adsense-account') {
        $text = $text -replace '</head>', "  $metaTag`n</head>"
      }
      if ($text -notmatch 'pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js\?client=') {
        $text = $text -replace '</head>', "  $scriptTag`n</head>"
      }
    }
  }

  if ($file.Name -eq 'ads.txt') {
    $text = 'google.com, pub-4632693492035799, DIRECT, f08c47fec0942fa0'
  }

  if ($text -ne $original) {
    [System.IO.File]::WriteAllText($file.FullName, $text, [System.Text.UTF8Encoding]::new($false))
  }
}

Set-Content -Path (Join-Path $root 'adsense-update.log') -Value "Updated files with publisher ID $newId" -Encoding utf8
