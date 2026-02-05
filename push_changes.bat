@echo off
echo ==========================================
echo      DodoHabit Web - One-Click Push
echo ==========================================
echo.

echo 1. Adding all changes...
git add .
if %errorlevel% neq 0 (
    echo Error adding files.
    pause
    exit /b %errorlevel%
)

set /p CommitMessage="Enter commit message (Press Enter for 'update'): "
if "%CommitMessage%"=="" set CommitMessage=update

echo.
echo 2. Committing changes with message: "%CommitMessage%"...
git commit -m "%CommitMessage%"

echo.
echo 3. Pushing to GitHub...
git push
if %errorlevel% neq 0 (
    echo Error pushing to GitHub.
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================
echo           SUCCESS! Changes Pushed
echo ==========================================
echo.
echo Press any key to close...
pause >nul
