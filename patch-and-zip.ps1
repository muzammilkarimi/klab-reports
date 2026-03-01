# patch-and-zip.ps1
# Updates the app.asar in win-unpacked with the latest source files, then creates a zip for sharing.

$ErrorActionPreference = "Stop"
$WinUnpacked = "release\win-unpacked"
$Asar = "$WinUnpacked\resources\app.asar"
$AsarUnpacked = "$WinUnpacked\resources\app.asar.unpacked"
$TempDir = "release\asar_temp_patch"
$ZipOut = "release\kLab-Reports-portable.zip"

Write-Host "=== kLab Reports - Patch & Zip ===" -ForegroundColor Cyan

# Step 1: Extract the current asar
Write-Host "`n[1/5] Extracting app.asar..." -ForegroundColor Yellow
if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
npx asar extract $Asar $TempDir

# Step 2: Overwrite with latest source files
Write-Host "[2/5] Patching with latest source files..." -ForegroundColor Yellow
Copy-Item -Path "electron\*" -Destination "$TempDir\electron\" -Recurse -Force
Copy-Item -Path "backend\*"  -Destination "$TempDir\backend\"  -Recurse -Force
Copy-Item -Path "dist\*"     -Destination "$TempDir\dist\"     -Recurse -Force

# Step 3: Repack the asar
Write-Host "[3/5] Repacking app.asar..." -ForegroundColor Yellow
npx asar pack $TempDir $Asar

# Step 4: Also update app.asar.unpacked\backend (it's outside the asar)
Write-Host "[4/5] Updating app.asar.unpacked\backend..." -ForegroundColor Yellow
Get-ChildItem "backend" -Recurse | ForEach-Object {
    $dest = Join-Path "$AsarUnpacked\backend" $_.FullName.Substring((Resolve-Path "backend").Path.Length)
    if ($_.PSIsContainer) {
        New-Item -ItemType Directory -Force -Path $dest | Out-Null
    } else {
        Copy-Item $_.FullName -Destination $dest -Force
    }
}

# Step 5: Zip the win-unpacked folder
Write-Host "[5/5] Creating zip: $ZipOut ..." -ForegroundColor Yellow
if (Test-Path $ZipOut) { Remove-Item $ZipOut -Force }
Compress-Archive -Path "$WinUnpacked\*" -DestinationPath $ZipOut

Write-Host "`n✅ Done! Zip created at: $ZipOut" -ForegroundColor Green
Write-Host "Share this zip file with the other PC." -ForegroundColor Green
Write-Host "On the other PC: extract the zip, then run 'kLab Reports.exe'" -ForegroundColor Green

# Cleanup
Remove-Item $TempDir -Recurse -Force
