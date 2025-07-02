# Reporte Estradas - PWA

Um aplicativo Progressive Web App (PWA) para reportar problemas nas estradas do município à prefeitura.

## 📱 Funcionalidades

### Principais
- **Captura de Fotos**: Use a câmera do dispositivo para documentar problemas
- **Geolocalização**: Capture automaticamente a localização do problema
- **Formulário de Reporte**: Categorize e descreva detalhadamente o problema
- **Histórico**: Acompanhe o status dos reportes enviados
- **Notificações**: Receba atualizações sobre o andamento dos reparos

### PWA Features
- **Instalável**: Pode ser instalado como app nativo
- **Offline**: Funciona mesmo sem conexão (cache básico)
- **Responsivo**: Otimizado para dispositivos móveis e desktop
- **Push Notifications**: Notificações sobre status dos reportes

## 🛠️ Tecnologias Utilizadas

- **React 19**: Framework principal
- **Vite**: Build tool e dev server
- **Tailwind CSS**: Estilização
- **shadcn/ui**: Componentes UI
- **Lucide React**: Ícones
- **React Router**: Navegação
- **Service Worker**: Funcionalidades PWA

## 📋 Tipos de Problemas Suportados

1. **Buraco na pista**
2. **Rachadura no asfalto**
3. **Problema de sinalização**
4. **Problema de drenagem**
5. **Iluminação pública**
6. **Outros**

## 🚀 Como Usar

### Para Usuários
1. Acesse o aplicativo no navegador
2. Permita acesso à câmera e localização
3. Selecione o tipo de problema
4. Descreva o problema detalhadamente
5. Tire fotos do problema
6. Capture a localização
7. Envie o reporte
8. Acompanhe o status no histórico

### Para Desenvolvedores

#### Instalação
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd reporte-estradas

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

#### Estrutura do Projeto
```
reporte-estradas/
├── public/
│   ├── manifest.json      # Configuração PWA
│   ├── sw.js             # Service Worker
│   └── icon.svg          # Ícone do app
├── src/
│   ├── components/       # Componentes UI
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Entry point
│   └── App.css          # Estilos customizados
└── README.md
```

## 🔧 Configuração PWA

### Manifest.json
- Nome: "Reporte Estradas - Prefeitura"
- Tema: Azul (#2563eb)
- Modo: Standalone
- Orientação: Portrait
- Ícones: 192x192 e 512x512

### Service Worker
- Cache de recursos estáticos
- Funcionalidade offline básica
- Background sync para reportes
- Push notifications

## 📱 Compatibilidade

### Navegadores Suportados
- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Opera 67+

### Recursos Necessários
- **Câmera**: Para captura de fotos
- **Geolocalização**: Para localização automática
- **Service Worker**: Para funcionalidades PWA
- **Local Storage**: Para histórico offline

## 🔒 Privacidade e Segurança

- **Fotos**: Armazenadas localmente até o envio
- **Localização**: Capturada apenas quando solicitado
- **Dados**: Enviados via HTTPS para a prefeitura
- **Cache**: Apenas recursos estáticos são armazenados

## 🎨 Design e UX

### Princípios
- **Mobile First**: Otimizado para dispositivos móveis
- **Acessibilidade**: Suporte a leitores de tela
- **Performance**: Carregamento rápido e responsivo
- **Intuitividade**: Interface simples e clara

### Cores
- **Primária**: Azul (#2563eb)
- **Secundária**: Cinza (#6b7280)
- **Sucesso**: Verde (#10b981)
- **Erro**: Vermelho (#ef4444)
- **Aviso**: Amarelo (#f59e0b)

## 📊 Status dos Reportes

1. **Enviado**: Reporte recebido pela prefeitura
2. **Em Andamento**: Equipe designada para reparo
3. **Concluído**: Problema resolvido

## 🔄 Atualizações Futuras

### Planejadas
- [ ] Integração com API real da prefeitura
- [ ] Sistema de autenticação
- [ ] Chat com atendimento
- [ ] Mapa com problemas reportados
- [ ] Estatísticas de resolução
- [ ] Avaliação do serviço

### Melhorias Técnicas
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Monitoramento de performance
- [ ] Analytics de uso
- [ ] Backup automático

## 📞 Suporte

Para dúvidas ou problemas:
- Email: suporte@prefeitura.gov.br
- Telefone: (11) 3000-0000
- Horário: Segunda a Sexta, 8h às 17h

## 📄 Licença

Este projeto é de domínio público e pode ser usado livremente por qualquer município.

---

**Desenvolvido para melhorar a infraestrutura urbana através da participação cidadã.**

