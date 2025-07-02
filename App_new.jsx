import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [selectedType, setSelectedType] = useState('')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState('')
  const [photos, setPhotos] = useState([])
  const [location, setLocation] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

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
    setPhotos(prev => [...prev, ...files].slice(0, 5)) // Máximo 5 fotos
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
      // Aqui seria implementada a lógica de envio para a prefeitura
      console.log('Dados do reporte:', {
        type: selectedType,
        description,
        urgency,
        photos: photos.length,
        location
      })
      
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('✅ Reporte enviado com sucesso! A prefeitura foi notificada.')
      
      // Limpar formulário
      setSelectedType('')
      setDescription('')
      setUrgency('')
      setPhotos([])
      setLocation(null)
      
    } catch (error) {
      console.error('Erro ao enviar reporte:', error)
      alert('❌ Erro ao enviar reporte. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🛣️ Reporte Estradas</h1>
        <p>📍 Prefeitura Municipal</p>
      </header>

      <main className="card-glass">
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
    </div>
  )
}

export default App
