@echo off
title TECHNOMANCER-Lightweight
echo Starting TECHNOMANCER-Lightweight...
echo.
cd /d "%~dp0game"
echo Starting local server...
node server.js
pause