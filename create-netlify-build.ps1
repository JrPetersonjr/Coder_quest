# create-netlify-build.ps1
# Prepares the "public" folder for Netlify deployment

$sourceDir = $PSScriptRoot
$destDir = Join-Path $sourceDir "public"

# 1. Clean/Create Destination
if (Test-Path $destDir) {
    Remove-Item $destDir -Recurse -Force
}
New-Item -ItemType Directory -Path $destDir | Out-Null
Write-Host "Created public directory at $destDir"

# 2. Copy Assets
Write-Host "Copying Assets..."
Copy-Item -Path (Join-Path $sourceDir "ASSETS") -Destination $destDir -Recurse

# 3. Copy CSS
Write-Host "Copying CSS..."
Get-ChildItem -Path $sourceDir -Filter "*.css" | Copy-Item -Destination $destDir

# 4. Copy JS (Filtering out Backend/Desktop/Dev files)
Write-Host "Copying JS..."
$excludeJS = @(
    "electron-main.js",
    "electron-preload.js",
    "server.js",
    "icon.py",
    "integration-tests.js"
)

Get-ChildItem -Path $sourceDir -Filter "*.js" | ForEach-Object {
    if ($excludeJS -notcontains $_.Name -and $_.Name -notmatch "^test") {
        Copy-Item -Path $_.FullName -Destination $destDir
    } else {
        Write-Host "Skipping $($_.Name)" -ForegroundColor Gray
    }
}

# 5. Copy Misc Root Files
Write-Host "Copying Misc Files..."
Copy-Item -Path (Join-Path $sourceDir "favicon.ico") -Destination $destDir -ErrorAction SilentlyContinue
Copy-Item -Path (Join-Path $sourceDir "manifest.json") -Destination $destDir -ErrorAction SilentlyContinue

# 6. Setup Entry Points (Renaming for Web)
Write-Host "Configuring Entry Points..."

# web-intro.html becomes index.html (The Portal)
$introContent = Get-Content (Join-Path $sourceDir "web-intro.html") -Raw
# Replace link to index.html with game.html
$introContent = $introContent -replace 'href="index.html', 'href="game.html'
$introContent = $introContent -replace "href='index.html", "href='game.html"
$introContent = $introContent -replace 'window.location.href = `index.html', 'window.location.href = `game.html'
$introContent = $introContent -replace "window.location.href = 'index.html", "window.location.href = 'game.html"
Set-Content -Path (Join-Path $destDir "index.html") -Value $introContent

# index.html becomes game.html (The Game)
Copy-Item -Path (Join-Path $sourceDir "index.html") -Destination (Join-Path $destDir "game.html")

# Create a _redirects file for Netlify to handle SPA-like history if we ever add it, or just clean routing
# For now just ensuring root goes to index.html is default, but good to have.
Set-Content -Path (Join-Path $destDir "_redirects") -Value "/* /index.html 200"

Write-Host "BUILD COMPLETE."
Write-Host "Deploy the 'public' folder to Netlify."
