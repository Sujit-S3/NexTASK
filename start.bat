@echo off
echo Starting NexTASK servers...
start "NexTASK Backend" cmd /k "cd /d c:\NexTASK\backend && node server.js"
timeout /t 2 >nul
start "NexTASK Frontend" cmd /k "cd /d c:\NexTASK\frontend && npm run dev"
timeout /t 3 >nul
start http://localhost:5176
echo Done! Browser will open automatically.
