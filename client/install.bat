@echo off
echo Setting up frontend installation...

echo Setting PowerShell execution policy to allow scripts...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"

echo Installing dependencies...
pnpm install

echo Installation complete!
echo You can now run: pnpm run dev
pause 