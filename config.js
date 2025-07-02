// Configurações do aplicativo Reporte Estradas

export const API_CONFIG = {
  // ENDPOINT PRINCIPAL - Altere para o servidor da sua prefeitura
  BASE_URL: 'https://sua-prefeitura.gov.br/api',
  
  // Endpoints específicos
  ENDPOINTS: {
    REPORTES: '/reportes',
    UPLOAD: '/upload',
    STATUS: '/status'
  },
  
  // Configurações de upload
  UPLOAD_CONFIG: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB por foto
    MAX_PHOTOS: 5,
    ACCEPTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
    TIMEOUT: 30000 // 30 segundos
  },
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'multipart/form-data',
    // 'Authorization': 'Bearer SEU_TOKEN_AQUI', // Adicione se necessário
  },
  
  // Configurações para desenvolvimento local
  DEV_MODE: {
    ENABLED: true, // Mude para false em produção
    LOCAL_URL: 'http://localhost:3001/api',
    MOCK_DELAY: 2000 // Simula delay de rede
  }
}

// Função para obter a URL completa do endpoint
export function getEndpointUrl(endpoint) {
  const baseUrl = API_CONFIG.DEV_MODE.ENABLED 
    ? API_CONFIG.DEV_MODE.LOCAL_URL 
    : API_CONFIG.BASE_URL
    
  return baseUrl + endpoint
}

// Função para validar arquivo de imagem
export function validateImageFile(file) {
  const errors = []
  
  // Verificar tipo de arquivo
  if (!API_CONFIG.UPLOAD_CONFIG.ACCEPTED_FORMATS.includes(file.type)) {
    errors.push(`Formato não suportado: ${file.type}`)
  }
  
  // Verificar tamanho
  if (file.size > API_CONFIG.UPLOAD_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = API_CONFIG.UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
    errors.push(`Arquivo muito grande: ${(file.size / (1024 * 1024)).toFixed(1)}MB (máximo: ${maxSizeMB}MB)`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
