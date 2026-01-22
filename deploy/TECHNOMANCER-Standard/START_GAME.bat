@echo off
title TECHNOMANCER-Standard
echo Starting TECHNOMANCER-Standard...
echo.
cd /d "%~dp0game"
echo Starting local server...
node server.js
pause