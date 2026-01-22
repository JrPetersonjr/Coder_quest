@echo off
title TECHNOMANCER-Premium
echo Starting TECHNOMANCER-Premium...
echo.
cd /d "%~dp0game"
echo Starting local server...
node server.js
pause