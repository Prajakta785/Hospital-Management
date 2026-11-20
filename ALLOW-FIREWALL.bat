@echo off
TITLE Enable Mobile & iOS Wi-Fi Access for Hospital Management
COLOR 0A

:: Check for Administrative Privileges and request UAC elevation automatically
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo [i] Requesting administrator access to allow mobile phone Wi-Fi connections...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /B
)

pushd "%CD%"
CD /D "%~dp0"

echo ==========================================================
echo    CONFIGURING FIREWALL FOR MOBILE PHONE & iOS ACCESS
echo ==========================================================
echo.
echo [*] Adding inbound rule for Frontend (Port 5173)...
netsh advfirewall firewall delete rule name="Hospital_Vite_Port_5173" >nul 2>&1
netsh advfirewall firewall add rule name="Hospital_Vite_Port_5173" dir=in action=allow protocol=TCP localport=5173 profile=any >nul

echo [*] Adding inbound rule for Backend API (Port 5000)...
netsh advfirewall firewall delete rule name="Hospital_API_Port_5000" >nul 2>&1
netsh advfirewall firewall add rule name="Hospital_API_Port_5000" dir=in action=allow protocol=TCP localport=5000 profile=any >nul

echo [*] Ensuring Node.js has network permission on Private and Public Wi-Fi...
netsh advfirewall firewall set rule name="Node.js JavaScript Runtime" new profile=any >nul 2>&1

echo.
echo ==========================================================
echo [SUCCESS] Windows Firewall configured successfully!
echo iPhone (iOS) and Android phones on your Wi-Fi can now
echo connect and open the patient registration form instantly.
echo ==========================================================
echo.
pause
