@echo off
echo 🧹 Limpando Cache do Projeto - App Reporte nas Estradas
echo.

echo 📁 Removendo pasta dist...
rmdir /s /q dist 2>nul

echo 📁 Removendo cache do Vite...
rmdir /s /q node_modules\.vite 2>nul

echo 📁 Removendo cache do node_modules...
rmdir /s /q node_modules\.cache 2>nul

echo 🔨 Fazendo novo build...
npm run build

echo ✨ Cache limpo com sucesso!
echo.
echo 💡 Dicas para limpar cache do navegador:
echo    - Chrome/Edge: Ctrl + Shift + R
echo    - Firefox: Ctrl + F5
echo    - Ou abra DevTools (F12) ^> Network ^> Disable cache
echo.
echo 🚀 Para iniciar o servidor: npm run dev
pause
