# 🧹 Script de Limpeza de Cache - PowerShell

Write-Host "🧹 Limpando Cache do Projeto - App Reporte nas Estradas" -ForegroundColor Cyan
Write-Host ""

# Navegar para o diretório do projeto
Set-Location -Path "c:\Users\wesle\Downloads\App Reporte nas Estradas"

Write-Host "📁 Removendo pasta dist..." -ForegroundColor Yellow
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

Write-Host "📁 Removendo cache do Vite..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

Write-Host "📁 Removendo cache do node_modules..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

Write-Host "📁 Removendo arquivos temporários..." -ForegroundColor Yellow
Get-ChildItem -Path . -Recurse -Name "*.tmp" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "🔨 Fazendo novo build..." -ForegroundColor Green
npm run build

Write-Host ""
Write-Host "✨ Cache limpo com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Dicas para limpar cache do navegador:" -ForegroundColor Cyan
Write-Host "   - Chrome/Edge: Ctrl + Shift + R" -ForegroundColor White
Write-Host "   - Firefox: Ctrl + F5" -ForegroundColor White
Write-Host "   - Ou abra DevTools (F12) > Network > Disable cache" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Para iniciar o servidor: npm run dev" -ForegroundColor Green
Write-Host ""

# Opcional: Iniciar o servidor automaticamente
$startServer = Read-Host "Deseja iniciar o servidor de desenvolvimento agora? (y/n)"
if ($startServer -eq "y" -or $startServer -eq "Y") {
    Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green
    npm run dev
}
