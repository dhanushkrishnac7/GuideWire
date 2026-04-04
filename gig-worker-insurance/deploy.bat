@echo off
REM GigShield Vercel Deployment Script for Windows

echo.
echo 🛡️  GigShield - Vercel Deployment Script
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
) else (
    echo ✅ Vercel CLI found
)

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🔨 Building web version...
call npm run build:web

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Build successful!
    echo.
    echo 🚀 Deploying to Vercel...
    echo.
    
    REM Deploy to Vercel
    call vercel --prod
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo 🎉 Deployment successful!
        echo.
        echo Your app is now live on Vercel!
    ) else (
        echo.
        echo ❌ Deployment failed. Check the error messages above.
        exit /b 1
    )
) else (
    echo.
    echo ❌ Build failed. Please fix the errors and try again.
    exit /b 1
)
