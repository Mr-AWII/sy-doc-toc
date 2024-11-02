# Package the project into package.zip
# Exclude scripts directory and .git directory

# Get plugin name from plugin.json
$pluginJson = Get-Content -Path "plugin.json" -Raw | ConvertFrom-Json
$pluginName = $pluginJson.name

# Create temp directory for packaging
$tempDir = "temp_package"
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -Path $tempDir -ItemType Directory

# Copy all files except scripts and .git
Get-ChildItem -Path "." -Exclude @("scripts", ".git", "temp_package", "*.zip") | Copy-Item -Destination $tempDir -Recurse

# Create zip file
$zipPath = "package.zip"
if (Test-Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}
Compress-Archive -Path "$tempDir/*" -DestinationPath $zipPath

# Clean up temp directory
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Package created successfully: $zipPath"
Write-Host "Plugin name: $pluginName"

