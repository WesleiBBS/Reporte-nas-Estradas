# 🔄 GitHub Pages Cache Busting Guide

## Problemas de Cache no GitHub Pages

Se suas mudanças de CSS não estão aparecendo no GitHub Pages, siga estes passos:

### 1. **Clear Browser Cache**
```
Ctrl + Shift + R (Chrome/Edge/Firefox)
Cmd + Shift + R (Mac)
```

### 2. **Force GitHub Pages Rebuild**
```bash
# Adicione uma mudança pequena para forçar rebuild
git commit --allow-empty -m "🔄 Force GitHub Pages rebuild"
git push origin main
```

### 3. **Verificar Cache Headers**
O arquivo `vite.config.js` foi configurado com:
- Hash único para cada build
- Cache busting automático
- Nomes de arquivo únicos

### 4. **URLs para Testar**
- **Desenvolvimento**: http://localhost:3001/Reporte-nas-Estradas/
- **GitHub Pages**: https://[seu-usuario].github.io/Reporte-nas-Estradas/

### 5. **Forçar Atualização no GitHub**
1. Vá em Settings > Pages
2. Mude a branch para outra e salve
3. Volte para `main` e salve novamente
4. Aguarde 5-10 minutos

### 6. **Verificar Deploy Status**
- Acesse: Actions tab no GitHub
- Verifique se o workflow "pages-build-deployment" foi executado
- Status deve estar verde ✅

### 7. **Headers Cache Control**
Adicione no `.github/workflows/` se necessário:
```yaml
- name: Deploy with cache headers
  run: |
    echo "Cache-Control: no-cache, no-store, must-revalidate" >> dist/.htaccess
```

### 8. **Comandos de Debug Local**
```bash
# Limpar tudo
npm run build
.\limpar-cache.ps1

# Verificar build
npx serve dist -l 3002
```

### 9. **CSS Debugging**
O CSS tem comentários de versão no topo:
- Versão atual: 2.1.0
- Timestamp: 2025-07-02
- Isso força o browser a reconhecer mudanças

### 10. **Última Solução**
Se nada funcionar:
1. Renomeie o arquivo CSS
2. Atualize a importação no `main.jsx`
3. Faça commit e push
