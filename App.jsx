import { useState, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
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
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Reporte Estradas</h1>
        <div className="flex space-x-4">
          <Link 
            to="/" 
            className={`p-2 rounded ${location.pathname === '/' ? 'bg-blue-700' : 'hover:bg-blue-500'}`}
          >
            <Home size={20} />
          </Link>
          <Link 
            to="/historico" 
            className={`p-2 rounded ${location.pathname === '/historico' ? 'bg-blue-700' : 'hover:bg-blue-500'}`}
          >
            <History size={20} />
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Fotos do Problema</h3>
        <Badge variant="secondary">{photos.length} foto(s)</Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isStreaming ? (
        <Button onClick={startCamera} className="w-full">
          <Camera className="mr-2 h-4 w-4" />
          Abrir Câmera
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex space-x-2">
            <Button onClick={capturePhoto} className="flex-1">
              <Camera className="mr-2 h-4 w-4" />
              Capturar Foto
            </Button>
            <Button onClick={stopCamera} variant="outline">
              Fechar
            </Button>
          </div>
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative">
              <img 
                src={photo.url} 
                alt="Foto do problema" 
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-1 right-1 h-6 w-6 p-0"
                onClick={() => onRemovePhoto(photo.id)}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                {photo.timestamp}
              </div>
            </div>
          ))}
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Localização</h3>
        {location && <Badge variant="secondary">Capturada</Badge>}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!location ? (
        <Button 
          onClick={getCurrentLocation} 
          disabled={loading}
          className="w-full"
        >
          <MapPin className="mr-2 h-4 w-4" />
          {loading ? 'Obtendo localização...' : 'Capturar Localização'}
        </Button>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2 text-sm">
              <div><strong>Latitude:</strong> {location.latitude.toFixed(6)}</div>
              <div><strong>Longitude:</strong> {location.longitude.toFixed(6)}</div>
              <div><strong>Precisão:</strong> ±{Math.round(location.accuracy)}m</div>
              <div><strong>Capturada em:</strong> {location.timestamp}</div>
            </div>
            <Button 
              onClick={getCurrentLocation} 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
              disabled={loading}
            >
              Atualizar Localização
            </Button>
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
      <div className="max-w-md mx-auto p-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-green-700 mb-2">Reporte Enviado!</h2>
            <p className="text-gray-600 mb-4">
              Seu reporte foi enviado com sucesso para a prefeitura. 
              Você receberá atualizações sobre o andamento do reparo.
            </p>
            <Badge variant="secondary">Protocolo: #{Date.now()}</Badge>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reportar Problema na Estrada</CardTitle>
          <CardDescription>
            Documente problemas nas vias públicas para que a prefeitura possa tomar as devidas providências.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo do problema */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo do Problema</Label>
              <select 
                id="tipo"
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Selecione o tipo</option>
                <option value="buraco">Buraco na pista</option>
                <option value="rachadura">Rachadura no asfalto</option>
                <option value="sinalizacao">Problema de sinalização</option>
                <option value="drenagem">Problema de drenagem</option>
                <option value="iluminacao">Iluminação pública</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição do Problema</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva detalhadamente o problema encontrado..."
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                required
                rows={3}
              />
            </div>

            {/* Urgência */}
            <div className="space-y-2">
              <Label>Nível de Urgência</Label>
              <div className="flex space-x-2">
                {[
                  { value: 'baixa', label: 'Baixa', color: 'bg-green-100 text-green-800' },
                  { value: 'media', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
                  { value: 'alta', label: 'Alta', color: 'bg-red-100 text-red-800' }
                ].map((urgencia) => (
                  <button
                    key={urgencia.value}
                    type="button"
                    onClick={() => handleInputChange('urgencia', urgencia.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      formData.urgencia === urgencia.value 
                        ? urgencia.color 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {urgencia.label}
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
              className="w-full" 
              disabled={isSubmitting || !formData.tipo || !formData.descricao}
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
            </Button>
          </form>
        </CardContent>
      </Card>
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
    <div className="max-w-md mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Reportes</CardTitle>
          <CardDescription>
            Acompanhe o status dos seus reportes enviados
          </CardDescription>
        </CardHeader>
      </Card>

      {reportes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhum reporte enviado ainda.</p>
            <Link to="/">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Fazer Primeiro Reporte
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reportes.map((reporte) => (
            <Card key={reporte.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold capitalize">{reporte.tipo.replace('_', ' ')}</h3>
                  <Badge className={getStatusColor(reporte.status)}>
                    {reporte.status === 'enviado' ? 'Enviado' : 
                     reporte.status === 'em_andamento' ? 'Em Andamento' : 'Concluído'}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{reporte.descricao}</p>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getUrgenciaColor(reporte.urgencia)}>
                      {reporte.urgencia}
                    </Badge>
                    {reporte.photos > 0 && (
                      <span className="flex items-center">
                        <Camera className="h-3 w-3 mr-1" />
                        {reporte.photos}
                      </span>
                    )}
                    {reporte.location !== 'Não informada' && (
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        GPS
                      </span>
                    )}
                  </div>
                  <span>{reporte.timestamp}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Componente principal da aplicação
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="pb-4">
          <Routes>
            <Route path="/" element={<ReportScreen />} />
            <Route path="/historico" element={<HistoryScreen />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

