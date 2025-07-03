# 🎨 Guia de Estilos Modernos - Design Escuro

Este arquivo documenta os novos estilos aplicados ao projeto, inspirados no design moderno e escuro da imagem de referência.

## ✨ Principais Elementos Aplicados

### 🔘 Botões de Instalação PWA
```html
<button className="install-pwa-button">
  <span className="icon">📱</span>
  Instalar App
</button>
```

### 📊 Cards de Métricas
```html
<div className="metric-card">
  <div className="metric-value">$2,540</div>
  <div className="metric-label">Total Balance</div>
  <div className="metric-change positive">+12.5%</div>
</div>
```

### 🎯 Indicadores de Status
```html
<span className="status-indicator active">Ativo</span>
<span className="status-indicator pending">Pendente</span>
<span className="status-indicator inactive">Inativo</span>
```

### 📈 Barras de Progresso
```html
<div className="progress-container">
  <div className="progress-bar orange" style="width: 75%;"></div>
</div>
```

### ⭕ Progresso Circular
```html
<div className="circular-progress">
  <svg>
    <circle className="circular-progress-bg" cx="60" cy="60" r="52"></circle>
    <circle className="circular-progress-fill" cx="60" cy="60" r="52"></circle>
  </svg>
  <div className="circular-progress-text">75%</div>
</div>
```

### 🎛️ Botões de Urgência Modernos
```html
<div className="urgency-buttons">
  <button className="urgency-button low">🟢 Baixa</button>
  <button className="urgency-button medium">🟡 Média</button>
  <button className="urgency-button high selected">🔴 Alta</button>
</div>
```

### 📱 Alternador de Visualização
```html
<div className="view-toggle">
  <button className="active">Cidadão</button>
  <button>Prefeitura</button>
</div>
```

### 📋 Lista de Transações/Reportes
```html
<div className="transaction-list">
  <div className="transaction-item">
    <div className="transaction-info">
      <div className="transaction-icon income">💰</div>
      <div className="transaction-details">
        <h4>Reporte Resolvido</h4>
        <p>Buraco na Rua A</p>
      </div>
    </div>
    <div className="transaction-amount positive">+1</div>
  </div>
</div>
```

### 🔔 Notificações Toast
```html
<div className="toast-container">
  <div className="toast success">
    ✅ Reporte enviado com sucesso!
  </div>
</div>
```

### 📊 Estatísticas Rápidas
```html
<div className="quick-stats">
  <div className="quick-stat-card">
    <div className="quick-stat-icon">📍</div>
    <div className="quick-stat-number">127</div>
    <div className="quick-stat-label">Reportes</div>
  </div>
</div>
```

## 🎨 Paleta de Cores Aplicada

### Cores Principais
- **Fundo Principal**: `linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #334155 100%)`
- **Cards**: `linear-gradient(145deg, #1e293b 0%, #334155 100%)`
- **Elementos Secundários**: `linear-gradient(145deg, #334155 0%, #475569 100%)`

### Cores de Destaque
- **Vermelho/Laranja**: `linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)`
- **Azul**: `linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)`
- **Verde**: `linear-gradient(135deg, #66bb6a 0%, #43a047 100%)`

### Sombras Neumórficas
- **Sombra Escura**: `0 20px 40px rgba(0, 0, 0, 0.3)`
- **Sombra Interna**: `inset 0 1px 0 rgba(71, 85, 105, 0.1)`
- **Bordas**: `1px solid rgba(71, 85, 105, 0.3)`

## 📱 Responsividade

Todos os elementos são totalmente responsivos com:
- **Desktop**: Design completo com todas as animações
- **Tablet (768px)**: Ajustes de padding e tamanhos
- **Mobile (480px)**: Layout otimizado para toque

## ⚡ Animações Incluídas

1. **slideUpFadeIn**: Para elementos que aparecem
2. **gradientShift**: Para gradientes animados
3. **shimmer**: Para efeitos de brilho
4. **pulse**: Para badges de notificação
5. **rotate**: Para elementos circulares
6. **spin**: Para loading spinners

## 🔧 Como Usar

1. **Para PWA**: Use `install-pwa-button` e `install-pwa-banner`
2. **Para Dashboard**: Use `dashboard-container` e `metric-card`
3. **Para Formulários**: Use `form-input`, `form-select`, `urgency-button`
4. **Para Notificações**: Use `toast` com classes de tipo
5. **Para Progresso**: Use `progress-bar` ou `circular-progress`

## 💡 Dicas de Implementação

- **Performance**: Animações usam `transform` e `opacity` para melhor performance
- **Acessibilidade**: Tamanhos mínimos de 44px para elementos tocáveis
- **UX**: Feedback visual imediato em todas as interações
- **Dark Mode**: Design otimizado para visualização noturna
- **Modern**: Inspirado em designs de fintech e dashboards modernos

Todos os estilos seguem as melhores práticas de CSS moderno e são compatíveis com todos os navegadores atuais.
