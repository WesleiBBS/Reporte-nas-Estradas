import { useState, useRef, useEffect } from 'react'
import { API_CONFIG, getEndpointUrl, validateImageFile } from './config.js'
import { saveNewReport, convertPhotosToBase64, notifyReportsUpdated } from './reportStorage.js'
import PainelPrefeitura from './PainelPrefeitura.jsx'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('cidadao') // 'cidadao' ou 'prefeitura'
  const [selectedType, setSelectedType] = useState('')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState('')
  const [photos, setPhotos] = useState([])
  const [location, setLocation] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Dados opcionais do cidadão
  const [citizenName, setCitizenName] = useState('')
  const [citizenContact, setCitizenContact] = useState('')
  const [customAddress, setCustomAddress] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  
  const fileInputRef = useRef(null)
  
  // PWA Installation
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  const problemTypes = [
    'Buraco na via',
    'Sinalização danificada',
    'Iluminação pública',
    'Drenagem/Alagamento',
    'Vegetação na via',
    'Outros'
  ]

  const urgencyLevels = [
    { level: 'low', label: 'Baixa', icon: '🟢', description: 'Pode aguardar' },
    { level: 'medium', label: 'Média', icon: '🟡', description: 'Atenção necessária' },
    { level: 'high', label: 'Alta', icon: '🔴', description: 'Urgente!' }
  ]

  const handlePhotoCapture = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files)
    const validFiles = []
    const errors = []
    
    // Validar cada arquivo
    files.forEach((file, index) => {
      const validation = validateImageFile(file)
      if (validation.isValid) {
        validFiles.push(file)
      } else {
        errors.push(`Arquivo ${index + 1}: ${validation.errors.join(', ')}`)
      }
    })
    
    // Verificar limite total de fotos
    const totalPhotos = photos.length + validFiles.length
    if (totalPhotos > API_CONFIG.UPLOAD_CONFIG.MAX_PHOTOS) {
      const allowed = API_CONFIG.UPLOAD_CONFIG.MAX_PHOTOS - photos.length
      errors.push(`Máximo ${API_CONFIG.UPLOAD_CONFIG.MAX_PHOTOS} fotos permitidas. Você pode adicionar apenas ${allowed} fotos.`)
      validFiles.splice(allowed) // Remover excesso
    }
    
    if (errors.length > 0) {
      alert('⚠️ Alguns arquivos não foram adicionados:\n\n' + errors.join('\n'))
    }
    
    if (validFiles.length > 0) {
      setPhotos(prev => [...prev, ...validFiles])
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
          alert('Não foi possível obter sua localização. Verifique as permissões.')
        }
      )
    } else {
      alert('Geolocalização não é suportada neste navegador.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedType || !description || !urgency) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // ===== SALVAR OCORRÊNCIA LOCALMENTE =====
      console.log('� Iniciando processamento das fotos...')
      
      // Converter fotos para base64 para armazenamento
      const photosBase64 = await convertPhotosToBase64(photos)
      
      console.log(`📸 ${photosBase64.length} foto(s) processada(s)`)
      
      // Preparar dados da ocorrência
      const reportData = {
        type: selectedType,
        description,
        urgency,
        location: location ? {
          lat: location.lat,
          lng: location.lng,
          address: customAddress || 'Localização obtida via GPS'
        } : (customAddress ? {
          lat: null,
          lng: null,
          address: customAddress
        } : null),
        photos: photosBase64,
        citizen: {
          name: isAnonymous ? 'Cidadão Anônimo' : (citizenName || 'Cidadão'),
          contact: isAnonymous ? 'Não informado' : (citizenContact || 'Não informado'),
          isAnonymous: isAnonymous
        }
      }
      
      console.log('💾 Salvando ocorrência no localStorage...')
      
      // Salvar no localStorage
      const savedReport = saveNewReport(reportData)
      
      // Notificar outras abas/componentes sobre a atualização
      notifyReportsUpdated()
      
      console.log('✅ Ocorrência salva localmente:', savedReport.id)
      
      // ENVIO REAL - Descomente quando tiver o servidor configurado
      if (!API_CONFIG.DEV_MODE.ENABLED) {
        console.log('📤 Enviando para servidor...')
        const response = await fetch(ENDPOINT_URL, {
          method: 'POST',
          body: formData,
          headers: {
            // Note: Não incluir Content-Type para FormData
            'Authorization': 'Bearer SEU_TOKEN_AQUI', // Configure se necessário
          }
        })

        if (!response.ok) {
          throw new Error(`Erro no servidor: ${response.status} - ${response.statusText}`)
        }

        const result = await response.json()
        console.log('✅ Resposta do servidor:', result)
      } else {
        // MODO DESENVOLVIMENTO - Simulação
        console.log('🧪 Modo desenvolvimento - Simulando envio...')
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.DEV_MODE.MOCK_DELAY))
      }
      
      // Mensagem de sucesso personalizada
      const photosInfo = photos.length > 0 
        ? `\n📸 ${photos.length} foto(s) anexada(s)`
        : '\n📷 Nenhuma foto anexada'
      
      const locationInfo = location 
        ? '\n📍 Localização GPS capturada'
        : customAddress 
          ? '\n🏠 Endereço personalizado informado'
          : '\n📍 Localização não informada'
      
      alert(`✅ Ocorrência registrada com sucesso! 
      
📋 Resumo:
• ID: ${savedReport.id}
• Tipo: ${selectedType}
• Urgência: ${urgency}${photosInfo}${locationInfo}
• Cidadão: ${isAnonymous ? 'Anônimo' : citizenName || 'Identificado'}
      
🏛️ A prefeitura foi notificada e sua ocorrência já aparece no painel de controle!

${API_CONFIG.DEV_MODE.ENABLED 
  ? '🧪 MODO DESENVOLVIMENTO: Dados salvos localmente'
  : '📤 ENVIADO: Dados também foram enviados para o servidor'
}`)
      
      // Limpar formulário
      setSelectedType('')
      setDescription('')
      setUrgency('')
      setPhotos([])
      setLocation(null)
      if (!isAnonymous) {
        setCitizenName('')
        setCitizenContact('')
      }
      setCustomAddress('')
      
    } catch (error) {
      console.error('❌ Erro ao enviar reporte:', error)
      
      // Mensagem de erro mais específica
      let errorMessage = '❌ Erro ao registrar ocorrência:\n\n'
      
      if (error.message.includes('localStorage') || error.message.includes('quota')) {
        errorMessage += '💾 Problema de armazenamento:\n' +
          '• Seu navegador está com pouco espaço\n' +
          '• Tente reduzir o número/tamanho das fotos\n' +
          '• Ou limpe dados antigos do navegador\n\n' +
          '🔄 Você pode tentar novamente com menos fotos.'
      } else if (error.message.includes('Não foi possível salvar')) {
        errorMessage += error.message + '\n\n' +
          '💡 Sugestões:\n' +
          '• Tente sem fotos primeiro\n' +
          '• Verifique sua conexão\n' +
          '• Recarregue a página'
      } else {
        errorMessage += error.message + '\n\n🔄 Tente novamente em alguns minutos.'
      }
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // PWA Installation handlers
  useEffect(() => {
    // Detectar quando o prompt de instalação está disponível
    const handleBeforeInstallPrompt = (e) => {
      console.log('👋 beforeinstallprompt event captured')
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    // Detectar quando o app foi instalado
    const handleAppInstalled = () => {
      console.log('✅ PWA foi instalado')
      setDeferredPrompt(null)
      setShowInstallButton(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Verificar se já está rodando como PWA standalone
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      console.log('📱 App rodando como PWA')
      setShowInstallButton(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      // Fallback para browsers que não suportam o prompt automático
      alert('📱 Para instalar o app:\n\n• Chrome: Menu → "Instalar Reporte Estradas"\n• Safari: Compartilhar → "Adicionar à Tela Inicial"\n• Firefox: Menu → "Instalar"')
      return
    }

    try {
      // Mostrar o prompt de instalação
      const promptResult = await deferredPrompt.prompt()
      console.log('📲 Resultado do prompt:', promptResult)

      // Aguardar a escolha do usuário
      const result = await deferredPrompt.userChoice
      console.log('👤 Escolha do usuário:', result.outcome)

      if (result.outcome === 'accepted') {
        console.log('✅ Usuário aceitou instalar o PWA')
      } else {
        console.log('❌ Usuário rejeitou instalar o PWA')
      }

      // Limpar o prompt
      setDeferredPrompt(null)
      setShowInstallButton(false)
    } catch (error) {
      console.error('❌ Erro ao instalar PWA:', error)
      alert('Erro ao instalar o app. Tente novamente ou instale manualmente pelo menu do navegador.')
    }
  }

  // Se estiver na view da prefeitura, mostrar o painel
  if (currentView === 'prefeitura') {
    return <PainelPrefeitura onBackToCitizen={() => setCurrentView('cidadao')} />
  }

  // View do cidadão (padrão)
  return (
    <div className="app-container">
      {/* Botão para acessar painel da prefeitura */}
      <div className="admin-access">
        <button 
          className="admin-button"
          onClick={() => setCurrentView('prefeitura')}
          title="Acesso restrito - Prefeitura"
        >
          🏛️ Painel Prefeitura
        </button>
      </div>

      <header className="app-header">
        <h1>🛣️ Reporte Estradas</h1>
        <p>📍 Prefeitura Municipal</p>
        
        {/* Botão de instalação PWA */}
        {showInstallButton && (
          <button
            className="install-pwa-button"
            onClick={handleInstallPWA}
            title="Instalar aplicativo no seu dispositivo"
          >
            <span className="icon">📱</span>
            Instalar App
          </button>
        )}
      </header>

      <main className="card-glass-form">
        <div className="form-section">
          <h3>
            <span className="icon">⚠️</span>
            Reportar Problema
          </h3>
          <p style={{ color: '#6b7280', textAlign: 'center', margin: '0 0 24px 0' }}>
            🏛️ Documente problemas nas vias públicas para que a prefeitura possa tomar as devidas providências
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* ...existing form content... */}
          <div className="form-section">
            <h3>
              <span className="icon">🔧</span>
              Tipo do Problema
            </h3>
            <select 
              className="select-modern"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              required
            >
              <option value="">Selecione o tipo de problema</option>
              {problemTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <h3>
              <span className="icon">📝</span>
              Descrição do Problema
            </h3>
            <textarea
              className="input-modern"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente o problema encontrado... Ex: Buraco de aproximadamente 2m na Rua X"
              rows={4}
              style={{ resize: 'vertical', minHeight: '120px' }}
              required
            />
          </div>

          <div className="form-section">
            <h3>
              <span className="icon">🚨</span>
              Nível de Urgência
            </h3>
            <div className="urgency-buttons">
              {urgencyLevels.map((level) => (
                <button
                  key={level.level}
                  type="button"
                  className={`urgency-button ${urgency === level.level ? 'selected' : ''}`}
                  onClick={() => setUrgency(level.level)}
                >
                  <span className="icon">{level.icon}</span>
                  <span>{level.label}</span>
                  <small style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                    {level.description}
                  </small>
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>
              <span className="icon">📷</span>
              Fotos do Problema
            </h3>
            <div className="photo-counter">
              <span>📸</span>
              <span>{photos.length} FOTO(S)</span>
            </div>
            <button
              type="button"
              className="feature-button"
              onClick={handlePhotoCapture}
            >
              <span className="icon">📷</span>
              Abrir Câmera
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-section">
            <h3>
              <span className="icon">📍</span>
              Localização
            </h3>
            <button
              type="button"
              className="feature-button"
              onClick={getLocation}
              style={{
                background: location 
                  ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' 
                  : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
              }}
            >
              <span className="icon">📍</span>
              {location ? '✅ Localização Capturada' : 'Capturar Localização'}
            </button>
          </div>

          <div className="form-section">
            <h3>
              <span className="icon">🏠</span>
              Endereço Personalizado (Opcional)
            </h3>
            <input
              className="input-modern"
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="Ex: Rua das Flores, 123 - Bairro Centro"
              style={{ width: '100%' }}
            />
            <small style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', textAlign: 'center', display: 'block', marginTop: '8px' }}>
              Informe um endereço específico se preferir
            </small>
          </div>

          <div className="form-section">
            <h3>
              <span className="icon">👤</span>
              Dados Pessoais (Opcional)
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    accentColor: '#3b82f6',
                    cursor: 'pointer'
                  }}
                />
                <span>🕶️ Permanecer anônimo</span>
              </label>
            </div>

            {!isAnonymous && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <input
                  className="input-modern"
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="Seu nome completo"
                  style={{ width: '100%' }}
                />
                <input
                  className="input-modern"
                  type="text"
                  value={citizenContact}
                  onChange={(e) => setCitizenContact(e.target.value)}
                  placeholder="Telefone ou email para contato"
                  style={{ width: '100%' }}
                />
              </div>
            )}
            
            <small style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', textAlign: 'center', display: 'block', marginTop: '8px' }}>
              {isAnonymous 
                ? '🔒 Sua identidade será mantida em sigilo' 
                : '📞 A prefeitura poderá entrar em contato para mais informações'
              }
            </small>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                Enviando...
              </>
            ) : (
              <>
                <span>📤</span>
                Enviar Reporte
              </>
            )}
          </button>
        </form>
      </main>

      {/* Botão de instalação do PWA */}
      {showInstallButton && (
        <div className="install-pwa-banner">
          <p>📱 Instale o app para acesso rápido e offline!</p>
          <button className="install-pwa-button" onClick={handleInstallPWA}>
            <span className="icon">⬇️</span>
            Instalar App
          </button>
        </div>
      )}
    </div>
  )
}

export default App
