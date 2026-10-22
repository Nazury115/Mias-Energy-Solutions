@echo off
rem Double-click to run the Mias website locally. Close this window (or press Ctrl+C) to stop it.
cd /d "%~dp0"
title Mias website (local)

rem Use Node from PATH if there is one, otherwise the copy bundled with the Codex app on this computer.
where node >nul 2>nul || set "PATH=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%"
where node >nul 2>nul || (echo Node.js was not found. Install it from https://nodejs.org and try again. & pause & exit /b 1)

if not exist "node_modules\next\dist\bin\next" (
  echo The website's packages are missing. Run "pnpm install --frozen-lockfile --ignore-scripts" in this folder first.
  pause & exit /b 1
)

netstat -ano | findstr /r /c:":3000 .*LISTENING" >nul && (
  echo Something is already running on port 3000 - probably the website itself.
  echo Open http://127.0.0.1:3000 in your browser, or close the other copy before starting this one.
  pause & exit /b 1
)

echo Starting the Mias website. When you see "Ready", open http://127.0.0.1:3000
echo Test inbox: http://127.0.0.1:3000/dev/inbox      Sign in: http://127.0.0.1:3000/sign-in
echo.
node node_modules\next\dist\bin\next dev --webpack --hostname 127.0.0.1 --port 3000
pause
