@echo off
echo Starting React app on your network IP address...
set HOST=192.168.45.44
set PORT=3000
echo Your website will be available at: http://%HOST%:%PORT%
echo.
echo Access this URL from your mobile device to view the website.
echo Make sure your mobile device is connected to the same WiFi network.
echo.
cd %~dp0
npm start -- --host %HOST% --port %PORT%
