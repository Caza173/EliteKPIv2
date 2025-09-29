@echo off
cd /d "c:\Users\corey\Desktop\KPI App v2\elitekpi-code"
git add .
git status
echo.
echo Committing changes...
git commit -m "Improve convert CMA to listing functionality with enhanced error logging and validation"
echo.
echo Pushing to GitHub...
git push origin admin-controls
echo.
echo Done!
pause
