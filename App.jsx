import { useState, useRef, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Camera, 
  MapPin, 
  Send, 
  History, 
  Home, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  X,
  Plus
} from 'lucide-react'
import './App.css'

// Componente principal de navegação
function Navigation() {
  const location = useLocation()
  
  return (
    <nav className="nav-glass backdrop-blur-xl sticky top-0 z-50 p-4 animate-fade-in">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-lg">
            <Home size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Reporte Estradas
          </h1>
        </div>
        <div className="flex space-x-2">
          <Link 
            to="/" 
            className={`p-3 rounded-2xl transition-all duration-300 ${
              location.pathname === '/' 
                ? 'gradient-primary text-white shadow-lg transform scale-105' 
                : 'bg-white/70 hover:bg-white/90 text-gray-700 hover:scale-105'
            }`}
          >
            <Home size={18} />
          </Link>
          <Link 
            to="/historico" 
            className={`p-3 rounded-2xl transition-all duration-300 ${
              location.pathname === '/historico' 
                ? 'gradient-primary text-white shadow-lg transform scale-105' 
                : 'bg-white/70 hover:bg-white/90 text-gray-700 hover:scale-105'
            }`}
          >
            <History size={18} />
          </Link>
        </div>
      </div>
    </nav>
  )
}

// Componente para captura de fotos
function CameraCapture({ onPhotoCapture, photos, onRemovePhoto }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState('')

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Câmera traseira preferencial
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
        setError('')
      }
    } catch (err) {
      setError('Erro ao acessar a câmera. Verifique as permissões.')
      console.error('Erro ao acessar câmera:', err)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      setIsStreaming(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        const photoUrl = URL.createObjectURL(blob)
        onPhotoCapture({
          id: Date.now(),
          url: photoUrl,
          blob: blob,
          timestamp: new Date().toLocaleString()
        })
      }, 'image/jpeg', 0.8)
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center">
          📸 Fotos do Problema
        </h3>
        <Badge className="badge-modern gradient-primary text-white px-3 py-1">
          {photos.length} foto(s)
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {!isStreaming ? (
        <Button 
          onClick={startCamera} 
          className="w-full btn-modern gradient-primary text-white py-4 text-lg"
        >
          <Camera className="mr-2 h-5 w-5" />
          📷 Abrir Câmera
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="relative card-glass p-4">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full rounded-2xl shadow-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              🎥 Câmera Ativa
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={capturePhoto} 
              className="flex-1 btn-modern gradient-success text-white py-3"
            >
              <Camera className="mr-2 h-4 w-4" />
              ✨ Capturar Foto
            </Button>
            <Button 
              onClick={stopCamera} 
              className="btn-modern bg-gray-100 text-gray-700 hover:bg-gray-200 px-6"
            >
              ❌ Fechar
            </Button>
          </div>
        </div>
      )}

      {photos.length > 0 && (
        <div className="card-glass p-4">
          <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
            🖼️ Fotos Capturadas ({photos.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <div key={photo.id} className="relative photo-preview group">
                <img 
                  src={photo.url} 
                  alt={`Foto do problema ${index + 1}`}
                  className="w-full h-32 object-cover rounded-2xl shadow-lg"
                />
                <Button
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full gradient-danger text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                  onClick={() => onRemovePhoto(photo.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  📅 {photo.timestamp}
                </div>
                <div className="absolute top-2 left-2 bg-blue-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para geolocalização
function LocationCapture({ location, onLocationCapture }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getCurrentLocation = () => {
    setLoading(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada neste navegador.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationCapture({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toLocaleString()
        })
        setLoading(false)
      },
      (err) => {
        setError('Erro ao obter localização. Verifique as permissões.')
        setLoading(false)
        console.error('Erro de geolocalização:', err)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center">
          📍 Localização
        </h3>
        {location && (
          <Badge className="badge-modern gradient-success text-white px-3 py-1">
            ✅ Capturada
          </Badge>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {!location ? (
        <Button 
          onClick={getCurrentLocation} 
          disabled={loading}
          className="w-full btn-modern gradient-primary text-white py-4 text-lg"
        >
          <MapPin className="mr-2 h-5 w-5" />
          {loading ? '🔄 Obtendo localização...' : '🌍 Capturar Localização'}
        </Button>
      ) : (
        <Card className="card-glass location-info">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full gradient-success flex items-center justify-center shadow-lg">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-lg text-gray-800">📍 Localização Capturada</h4>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-600">🗺️ Latitude:</span>
                  <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded-lg">
                    {location.latitude.toFixed(6)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-600">🧭 Longitude:</span>
                  <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded-lg">
                    {location.longitude.toFixed(6)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-600">🎯 Precisão:</span>
                  <Badge className="badge-modern bg-green-100 text-green-800">
                    ±{Math.round(location.accuracy)}m
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-600">⏰ Capturada em:</span>
                  <span className="text-gray-700 text-xs">
                    {location.timestamp}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={getCurrentLocation} 
                className="w-full btn-modern bg-gray-100 text-gray-700 hover:bg-gray-200 py-3"
                disabled={loading}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {loading ? '🔄 Atualizando...' : '🔄 Atualizar Localização'}
              </Button>
            </div>  
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Tela principal de reporte
function ReportScreen() {
  const [photos, setPhotos] = useState([])
  const [location, setLocation] = useState(null)
  const [formData, setFormData] = useState({
    tipo: '',
    descricao: '',
    urgencia: 'media'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handlePhotoCapture = (photo) => {
    setPhotos(prev => [...prev, photo])
  }

  const handleRemovePhoto = (photoId) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId))
  }

  const handleLocationCapture = (loc) => {
    setLocation(loc)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simular envio do reporte
    try {
      // Aqui seria feita a integração com a API da prefeitura
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Salvar no localStorage para histórico
      const reporte = {
        id: Date.now(),
        ...formData,
        photos: photos.length,
        location: location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Não informada',
        status: 'enviado',
        timestamp: new Date().toLocaleString()
      }
      
      const historico = JSON.parse(localStorage.getItem('reportes') || '[]')
      historico.unshift(reporte)
      localStorage.setItem('reportes', JSON.stringify(historico))
      
      setSubmitSuccess(true)
      
      // Limpar formulário
      setTimeout(() => {
        setPhotos([])
        setLocation(null)
        setFormData({ tipo: '', descricao: '', urgencia: 'media' })
        setSubmitSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error('Erro ao enviar reporte:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
        <Card className="card-glass max-w-md w-full text-center animate-bounce-in">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-success flex items-center justify-center shadow-xl">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              🎉 Reporte Enviado!
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Seu reporte foi enviado com sucesso para a prefeitura. 
              Você receberá atualizações sobre o andamento do reparo.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-4">
              <Badge className="badge-modern gradient-primary text-white">
                📋 Protocolo: #{Date.now()}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              ⏱️ Tempo médio de resposta: 2-5 dias úteis
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="gradient-bg min-h-screen">
      <div className="max-w-md mx-auto p-4 space-y-6 animate-fade-in">
        <Card className="card-glass hover-lift">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reportar Problema
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              🛣️ Documente problemas nas vias públicas para que a prefeitura possa tomar as devidas providências
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tipo do problema */}
            <div className="space-y-3">
              <Label htmlFor="tipo" className="text-lg font-semibold text-gray-700 flex items-center">
                🔧 Tipo do Problema
              </Label>
              <select 
                id="tipo"
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
                className="input-modern w-full p-4 text-lg focus:ring-4 focus:ring-blue-200 transition-all duration-300"
                required
              >
                <option value="">📋 Selecione o tipo de problema</option>
                <option value="buraco">🕳️ Buraco na pista</option>
                <option value="rachadura">⚡ Rachadura no asfalto</option>
                <option value="sinalizacao">🚦 Problema de sinalização</option>
                <option value="drenagem">🌊 Problema de drenagem</option>
                <option value="iluminacao">💡 Iluminação pública</option>
                <option value="outros">📝 Outros</option>
              </select>
            </div>

            {/* Descrição */}
            <div className="space-y-3">
              <Label htmlFor="descricao" className="text-lg font-semibold text-gray-700 flex items-center">
                📝 Descrição do Problema
              </Label>
              <Textarea
                id="descricao"
                placeholder="💬 Descreva detalhadamente o problema encontrado... Ex: Buraco de aproximadamente 50cm localizado próximo ao posto de gasolina."
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                className="input-modern w-full p-4 text-lg resize-none focus:ring-4 focus:ring-blue-200"
                required
                rows={4}
              />
            </div>

            {/* Urgência */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-700 flex items-center">
                ⚡ Nível de Urgência
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'baixa', label: '🟢 Baixa', emoji: '🚶', desc: 'Pode aguardar', gradient: 'gradient-success' },
                  { value: 'media', label: '🟡 Média', emoji: '🚗', desc: 'Atenção necessária', gradient: 'gradient-warning' },
                  { value: 'alta', label: '🔴 Alta', emoji: '🚨', desc: 'Urgente!', gradient: 'gradient-danger' }
                ].map((urgencia) => (
                  <button
                    key={urgencia.value}
                    type="button"
                    onClick={() => handleInputChange('urgencia', urgencia.value)}
                    className={`p-4 rounded-2xl text-center font-semibold transition-all duration-300 hover:scale-105 ${
                      formData.urgencia === urgencia.value 
                        ? `${urgencia.gradient} text-white shadow-xl scale-105 ring-2 ring-white` 
                        : 'bg-white/70 text-gray-700 hover:bg-white/90 shadow-lg'
                    }`}
                  >
                    <div className="text-2xl mb-1">{urgencia.emoji}</div>
                    <div className="text-sm font-bold">{urgencia.label}</div>
                    <div className="text-xs opacity-75 mt-1">{urgencia.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Captura de fotos */}
            <CameraCapture 
              onPhotoCapture={handlePhotoCapture}
              photos={photos}
              onRemovePhoto={handleRemovePhoto}
            />

            {/* Captura de localização */}
            <LocationCapture 
              location={location}
              onLocationCapture={handleLocationCapture}
            />

            {/* Botão de envio */}
            <Button 
              type="submit" 
              className="w-full btn-modern gradient-primary text-white py-4 text-lg shadow-xl" 
              disabled={isSubmitting || !formData.tipo || !formData.descricao}
            >
              <Send className="mr-2 h-5 w-5" />
              {isSubmitting ? '📤 Enviando...' : '🚀 Enviar Reporte'}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

// Tela de histórico
function HistoryScreen() {
  const [reportes, setReportes] = useState([])

  useEffect(() => {
    const historico = JSON.parse(localStorage.getItem('reportes') || '[]')
    setReportes(historico)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'enviado': return 'bg-blue-100 text-blue-800'
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800'
      case 'concluido': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgenciaColor = (urgencia) => {
    switch (urgencia) {
      case 'baixa': return 'bg-green-100 text-green-800'
      case 'media': return 'bg-yellow-100 text-yellow-800'
      case 'alta': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="gradient-bg min-h-screen">
      <div className="max-w-md mx-auto p-4 space-y-6 animate-fade-in">
        <Card className="card-glass hover-lift">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center shadow-lg">
              <History className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📋 Histórico de Reportes
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              🔍 Acompanhe o status dos seus reportes enviados
            </CardDescription>
          </CardHeader>
        </Card>

        {reportes.length === 0 ? (
          <Card className="card-glass hover-lift">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center shadow-lg">
                <History className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-3">
                📝 Nenhum reporte ainda
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Você ainda não fez nenhum reporte. Comece reportando um problema nas estradas!
              </p>
              <Link to="/">
                <Button className="btn-modern gradient-primary text-white px-6 py-3">
                  <Plus className="mr-2 h-4 w-4" />
                  🚀 Fazer Primeiro Reporte
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reportes.map((reporte, index) => (
              <Card key={reporte.id} className="card-glass hover-lift animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg capitalize text-gray-800">
                          {reporte.tipo.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          📅 {reporte.timestamp}
                        </p>
                      </div>
                    </div>
                    <Badge className={`badge-modern ${getStatusColor(reporte.status)} px-3 py-1`}>
                      {reporte.status === 'enviado' ? '📤 Enviado' : 
                       reporte.status === 'em_andamento' ? '⚙️ Em andamento' : 
                       '✅ Concluído'}
                    </Badge>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {reporte.descricao}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Badge className={`badge-modern ${getUrgenciaColor(reporte.urgencia)} text-xs`}>
                        {reporte.urgencia === 'baixa' ? '🟢 Baixa' : 
                         reporte.urgencia === 'media' ? '🟡 Média' : 
                         '🔴 Alta'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-end space-x-2 text-gray-500">
                      <Camera className="h-4 w-4" />
                      <span>{reporte.photos} foto(s)</span>
                    </div>
                  </div>
                  
                  {reporte.location && reporte.location !== 'Não informada' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>📍 {reporte.location}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para prompt de instalação PWA
function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false)
    }
    
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Não mostrar novamente por 24 horas
    localStorage.setItem('installPromptDismissed', Date.now().toString())
  }

  // Não mostrar se já foi dispensado recentemente
  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const hoursAgo = (Date.now() - dismissedTime) / (1000 * 60 * 60)
      if (hoursAgo < 24) {
        setShowInstallPrompt(false)
      }
    }
  }, [])

  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Card className="border-2 border-blue-500 shadow-lg">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-blue-700 mb-1">
                📱 Instalar App
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Instale o Reporte Estradas em seu celular para acesso rápido e uso offline!
              </p>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleInstallClick}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Instalar
                </Button>
                <Button 
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                >
                  Agora não
                </Button>
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente principal da aplicação
function App() {
  return (
    <Router>
      <div className="min-h-screen gradient-bg">
        <Navigation />
        <main className="pb-4">
          <Routes>
            <Route path="/" element={<ReportScreen />} />
            <Route path="/historico" element={<HistoryScreen />} />
          </Routes>
        </main>
        <InstallPrompt />
      </div>
    </Router>
  )
}

export default App

