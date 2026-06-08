# Voidium Code Build Script
# Run with: .\build.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Voidium Code Build Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Find Git Bash
$gitBash = $null
$possiblePaths = @(
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files (x86)\Git\bin\bash.exe",
    "C:\ProgramData\chocolatey\lib\git.portable\tools\git\bin\bash.exe",
    "C:\Users\$env:USERNAME\AppData\Local\Programs\Git\bin\bash.exe",
    "C:\Users\$env:USERNAME\scoop\apps\git\current\bin\bash.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $gitBash = $path
        break
    }
}

# Try to find via Get-Command if not found
if (-not $gitBash) {
    try {
        $bashCmd = Get-Command bash -ErrorAction Stop
        $gitBash = $bashCmd.Source
    } catch {
        # Not found in PATH
    }
}

if (-not $gitBash) {
    Write-Host "ERROR: Git Bash not found!" -ForegroundColor Red
    Write-Host "Please install Git for Windows from https://git-scm.com/download/win" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Found Git Bash at: $gitBash" -ForegroundColor Green
Write-Host ""

# Set environment variables
$env:OS_NAME = "windows"
$env:VSCODE_ARCH = "x64"
$env:RELEASE_VERSION = "0.1.2"
$env:SHOULD_BUILD = "yes"
$env:CI_BUILD = "no"

Write-Host "Build Configuration:" -ForegroundColor Cyan
Write-Host "  OS: $($env:OS_NAME)"
Write-Host "  Arch: $($env:VSCODE_ARCH)"
Write-Host "  Version: $($env:RELEASE_VERSION)"
Write-Host ""

# Check if vscode directory exists, if not prepare it first
if (-not (Test-Path "vscode")) {
    Write-Host "vscode/ directory not found. Preparing VS Code source first..." -ForegroundColor Yellow
    Write-Host "This will clone Microsoft's VS Code repository." -ForegroundColor Yellow
    Write-Host ""
    
    & $gitBash "-c", "./prepare_vscode.sh"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Red
        Write-Host "PREPARE FAILED" -ForegroundColor Red
        Write-Host "==========================================" -ForegroundColor Red
        pause
        exit $LASTEXITCODE
    }
}

# Run build
Write-Host "Starting build... This may take 15-30 minutes." -ForegroundColor Cyan
Write-Host ""

& $gitBash "-c", "./build.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "BUILD FAILED" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    pause
    exit $LASTEXITCODE
} else {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your build is in: VSCode-win32-x64\" -ForegroundColor Yellow
    Write-Host ""
    pause
}
