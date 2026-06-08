@echo off
chcp 65001 >nul
echo ==========================================
echo Voidium Code Build Script
echo ==========================================
echo.

:: Find Git Bash
set "GIT_BASH="
if exist "C:\Program Files\Git\bin\bash.exe" (
    set "GIT_BASH=C:\Program Files\Git\bin\bash.exe"
) else if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
    set "GIT_BASH=C:\Program Files (x86)\Git\bin\bash.exe"
) else (
    for /f "delims=" %%i in ('where bash 2^>nul') do set "GIT_BASH=%%i"
)

if not defined GIT_BASH (
    echo ERROR: Git Bash not found!
    echo Please install Git for Windows from https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Found Git Bash at: %GIT_BASH%
echo.

:: Set environment variables
set OS_NAME=windows
set VSCODE_ARCH=x64
set RELEASE_VERSION=0.1.2
set SHOULD_BUILD=yes
set CI_BUILD=no

echo Build Configuration:
echo   OS: %OS_NAME%
echo   Arch: %VSCODE_ARCH%
echo   Version: %RELEASE_VERSION%
echo.

:: Run build
echo Starting build... This may take 15-30 minutes.
echo.

"%GIT_BASH%" build.sh

if %errorlevel% neq 0 (
    echo.
    echo ==========================================
    echo BUILD FAILED
    echo ==========================================
    pause
    exit /b %errorlevel%
) else (
    echo.
    echo ==========================================
    echo BUILD SUCCESSFUL!
    echo ==========================================
    echo.
    echo Your build is in: VSCode-win32-x64\
    echo.
    pause
)
