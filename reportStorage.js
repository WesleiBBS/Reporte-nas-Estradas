// Sistema de gerenciamento de ocorrências reais
// Integra o que o usuário registra com o painel da prefeitura
import { useState, useEffect } from 'react'

// Chaves do localStorage
const STORAGE_KEYS = {
  REPORTES: 'reporte_estradas_ocorrencias',
  COUNTER: 'reporte_estradas_counter'
}

// Configurações de limite
const STORAGE_LIMITS = {
  MAX_REPORTS: 100, // Máximo de relatórios armazenados
  MAX_PHOTO_SIZE: 500 * 1024, // 500KB por foto
  MAX_TOTAL_SIZE: 5 * 1024 * 1024 // 5MB total
}

// Função para verificar tamanho do localStorage
const getStorageSize = () => {
  let total = 0
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length
    }
  }
  return total
}

// Função para limpar relatórios antigos se necessário
const cleanOldReportsIfNeeded = () => {
  try {
    const reports = getAllReports()
    if (reports.length > STORAGE_LIMITS.MAX_REPORTS) {
      const reportsToKeep = reports.slice(0, STORAGE_LIMITS.MAX_REPORTS)
      localStorage.setItem(STORAGE_KEYS.REPORTES, JSON.stringify(reportsToKeep))
      console.log(`🧹 Mantendo apenas os ${STORAGE_LIMITS.MAX_REPORTS} relatórios mais recentes`)
    }
  } catch (error) {
    console.error('Erro ao limpar relatórios antigos:', error)
  }
}

// Função para gerar ID único com tratamento de erro
const generateReportId = () => {
  try {
    const currentYear = new Date().getFullYear()
    let counter = parseInt(localStorage.getItem(STORAGE_KEYS.COUNTER) || '0')
    counter += 1
    localStorage.setItem(STORAGE_KEYS.COUNTER, counter.toString())
    return `REP-${currentYear}-${counter.toString().padStart(3, '0')}`
  } catch (error) {
    console.error('Erro ao gerar ID:', error)
    // Fallback: usar timestamp
    return `REP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
  }
}

// Função para salvar uma nova ocorrência com tratamento de erro
export const saveNewReport = (reportData) => {
  try {
    // Verificar saúde do localStorage primeiro
    if (!checkStorageHealth()) {
      console.warn('⚠️ localStorage com problemas, tentando limpeza de emergência...')
      emergencyCleanStorage()
      
      // Tentar novamente após limpeza
      if (!checkStorageHealth()) {
        throw new Error('localStorage não está funcionando. Tente recarregar a página ou usar um navegador diferente.')
      }
    }

    // Verificar espaço disponível
    const currentSize = getStorageSize()
    if (currentSize > STORAGE_LIMITS.MAX_TOTAL_SIZE * 0.8) { // 80% do limite
      console.warn('⚠️ localStorage quase cheio, limpando dados antigos...')
      cleanOldReportsIfNeeded()
    }

    const reports = getAllReports()
    
    // Processar fotos com limitação de tamanho
    const processedPhotos = (reportData.photos || []).map((photo, index) => {
      if (photo.data && photo.data.length > STORAGE_LIMITS.MAX_PHOTO_SIZE) {
        console.warn(`⚠️ Foto ${index + 1} muito grande, será comprimida`)
        // Remover foto muito grande em vez de comprimir por simplicidade
        return {
          id: photo.id || Date.now() + index,
          data: '', // Remover dados da foto
          name: photo.name || `foto_${index + 1}.jpg`,
          size: 0,
          type: photo.type || 'image/jpeg',
          description: `Foto removida - tamanho muito grande (${(photo.size / 1024).toFixed(1)}KB)`
        }
      }
      return photo
    })
    
    const newReport = {
      id: generateReportId(),
      type: reportData.type,
      description: reportData.description,
      urgency: reportData.urgency,
      status: 'pendente',
      timestamp: new Date().toISOString(),
      location: reportData.location ? {
        lat: reportData.location.lat,
        lng: reportData.location.lng,
        address: reportData.location.address || 'Endereço não disponível'
      } : null,
      photos: processedPhotos,
      citizen: {
        name: reportData.citizen?.name || 'Cidadão Anônimo',
        contact: reportData.citizen?.contact || 'Não informado',
        isAnonymous: reportData.citizen?.isAnonymous || true
      },
      assignedTo: null,
      estimatedRepair: null,
      completedDate: null,
      notes: []
    }
    
    reports.unshift(newReport) // Adiciona no início (mais recente primeiro)
    
    // Tentar salvar com tratamento de quota exceeded
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTES, JSON.stringify(reports))
      console.log('✅ Nova ocorrência salva:', newReport.id)
      return newReport
    } catch (quotaError) {
      if (quotaError.name === 'QuotaExceededError' || quotaError.code === 22) {
        console.warn('💾 Quota do localStorage excedida, limpando dados antigos...')
        
        // Limpar metade dos relatórios mais antigos
        const reportsToKeep = reports.slice(0, Math.floor(reports.length / 2))
        localStorage.setItem(STORAGE_KEYS.REPORTES, JSON.stringify(reportsToKeep))
        
        console.log(`🧹 Mantendo apenas ${reportsToKeep.length} relatórios`)
        return newReport
      }
      throw quotaError
    }
    
  } catch (error) {
    console.error('❌ Erro ao salvar ocorrência:', error)
    
    // Fallback: salvar sem fotos
    try {
      const reports = getAllReports()
      const fallbackReport = {
        id: generateReportId(),
        type: reportData.type,
        description: reportData.description,
        urgency: reportData.urgency,
        status: 'pendente',
        timestamp: new Date().toISOString(),
        location: reportData.location,
        photos: [], // Sem fotos no fallback
        citizen: {
          name: reportData.citizen?.name || 'Cidadão Anônimo',
          contact: reportData.citizen?.contact || 'Não informado',
          isAnonymous: reportData.citizen?.isAnonymous || true
        },
        assignedTo: null,
        estimatedRepair: null,
        completedDate: null,
        notes: ['⚠️ Fotos não foram salvas devido a limitações de armazenamento']
      }
      
      reports.unshift(fallbackReport)
      localStorage.setItem(STORAGE_KEYS.REPORTES, JSON.stringify(reports))
      
      console.log('⚠️ Ocorrência salva sem fotos:', fallbackReport.id)
      return fallbackReport
      
    } catch (fallbackError) {
      console.error('❌ Erro crítico ao salvar:', fallbackError)
      throw new Error('Não foi possível salvar a ocorrência. Tente novamente ou limpe o armazenamento do navegador.')
    }
  }
}

// Função para obter todas as ocorrências
export const getAllReports = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.REPORTES)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Erro ao carregar ocorrências:', error)
    return []
  }
}

// Função para atualizar uma ocorrência com tratamento de erro
export const updateReport = (reportId, updates) => {
  try {
    const reports = getAllReports()
    const updatedReports = reports.map(report => 
      report.id === reportId 
        ? { ...report, ...updates }
        : report
    )
    
    localStorage.setItem(STORAGE_KEYS.REPORTES, JSON.stringify(updatedReports))
    console.log('✅ Ocorrência atualizada:', reportId, updates)
    return updatedReports
  } catch (error) {
    console.error('❌ Erro ao atualizar ocorrência:', error)
    throw new Error('Não foi possível atualizar a ocorrência')
  }
}

// Função para deletar uma ocorrência com tratamento de erro
export const deleteReport = (reportId) => {
  try {
    const reports = getAllReports()
    const filteredReports = reports.filter(report => report.id !== reportId)
    localStorage.setItem(STORAGE_KEYS.REPORTES, JSON.stringify(filteredReports))
    console.log('✅ Ocorrência deletada:', reportId)
    return filteredReports
  } catch (error) {
    console.error('❌ Erro ao deletar ocorrência:', error)
    throw new Error('Não foi possível deletar a ocorrência')
  }
}

// Função para deletar múltiplas ocorrências com tratamento de erro
export const deleteMultipleReports = (reportIds) => {
  try {
    const reports = getAllReports()
    const filteredReports = reports.filter(report => !reportIds.includes(report.id))
    localStorage.setItem(STORAGE_KEYS.REPORTES, JSON.stringify(filteredReports))
    console.log('✅ Ocorrências deletadas:', reportIds)
    return filteredReports
  } catch (error) {
    console.error('❌ Erro ao deletar múltiplas ocorrências:', error)
    throw new Error('Não foi possível deletar as ocorrências')
  }
}

// Função para limpar todas as ocorrências (usar com cuidado)
export const clearAllReports = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.REPORTES)
    localStorage.removeItem(STORAGE_KEYS.COUNTER)
    console.log('🗑️ Todas as ocorrências foram deletadas')
    return []
  } catch (error) {
    console.error('❌ Erro ao limpar todas as ocorrências:', error)
    throw new Error('Não foi possível limpar as ocorrências')
  }
}

// Função para obter estatísticas
export const getReportsStats = () => {
  const reports = getAllReports()
  
  return {
    total: reports.length,
    pendentes: reports.filter(r => r.status === 'pendente').length,
    emAndamento: reports.filter(r => r.status === 'em_andamento').length,
    concluidos: reports.filter(r => r.status === 'concluido').length,
    urgentes: reports.filter(r => r.urgency === 'high').length,
    hoje: reports.filter(r => {
      const today = new Date().toDateString()
      const reportDate = new Date(r.timestamp).toDateString()
      return today === reportDate
    }).length
  }
}

// Função para comprimir imagem se necessário
const compressImage = (file, maxSizeKB = 300) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calcular novo tamanho mantendo proporção
      let { width, height } = img
      const maxDimension = 800 // Máximo 800px em qualquer direção
      
      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width
        width = maxDimension
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height
        height = maxDimension
      }
      
      canvas.width = width
      canvas.height = height
      
      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height)
      
      // Converter para base64 com qualidade ajustável
      let quality = 0.8
      let base64 = canvas.toDataURL('image/jpeg', quality)
      
      // Reduzir qualidade até atingir tamanho desejado
      while (base64.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) { // 1.37 = overhead do base64
        quality -= 0.1
        base64 = canvas.toDataURL('image/jpeg', quality)
      }
      
      resolve(base64)
    }
    
    img.onerror = () => {
      console.error('Erro ao carregar imagem para compressão')
      resolve(null)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Função para converter foto File para base64 com compressão
export const fileToBase64 = (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Se arquivo é muito grande, comprimir primeiro
      let imageData
      if (file.size > STORAGE_LIMITS.MAX_PHOTO_SIZE) {
        console.log(`📸 Comprimindo foto ${file.name} (${(file.size / 1024).toFixed(1)}KB)`)
        imageData = await compressImage(file, 300) // 300KB max
        
        if (!imageData) {
          throw new Error('Falha na compressão da imagem')
        }
      } else {
        // Usar FileReader para arquivos menores
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          imageData = reader.result
          resolve({
            id: Date.now() + Math.random(),
            data: imageData,
            name: file.name,
            size: file.size,
            type: file.type,
            description: `Foto anexada em ${new Date().toLocaleString('pt-BR')}`
          })
        }
        reader.onerror = error => reject(error)
        return
      }
      
      // Para imagens comprimidas
      resolve({
        id: Date.now() + Math.random(),
        data: imageData,
        name: file.name,
        size: Math.round(imageData.length * 0.75), // Estimativa do tamanho
        type: 'image/jpeg',
        description: `Foto comprimida anexada em ${new Date().toLocaleString('pt-BR')}`
      })
      
    } catch (error) {
      console.error('Erro ao processar foto:', error)
      // Fallback: retornar placeholder
      resolve({
        id: Date.now() + Math.random(),
        data: '',
        name: file.name,
        size: 0,
        type: file.type,
        description: `Erro ao processar foto: ${file.name}`
      })
    }
  })
}

// Função para converter múltiplas fotos para base64 com progresso
export const convertPhotosToBase64 = async (photoFiles) => {
  const photos = []
  console.log(`📸 Processando ${photoFiles.length} foto(s)...`)
  
  for (let i = 0; i < photoFiles.length; i++) {
    const file = photoFiles[i]
    try {
      console.log(`📸 Processando foto ${i + 1}/${photoFiles.length}: ${file.name}`)
      const base64Photo = await fileToBase64(file)
      
      if (base64Photo && base64Photo.data) {
        photos.push(base64Photo)
        console.log(`✅ Foto ${i + 1} processada com sucesso`)
      } else {
        console.warn(`⚠️ Foto ${i + 1} não pôde ser processada`)
      }
    } catch (error) {
      console.error(`❌ Erro ao converter foto ${i + 1}:`, error)
      // Adicionar placeholder para foto com erro
      photos.push({
        id: Date.now() + Math.random(),
        data: '',
        name: file.name,
        size: 0,
        type: file.type,
        description: `Erro ao processar foto: ${file.name}`
      })
    }
  }
  
  console.log(`📸 Processamento concluído: ${photos.length} foto(s)`)
  return photos
}

// Função para inicializar dados de exemplo (apenas na primeira vez)
export const initializeWithSampleData = () => {
  const existingReports = getAllReports()
  
  // Se não há ocorrências, adiciona algumas de exemplo
  if (existingReports.length === 0) {
    const sampleReports = [
      {
        id: 'REP-2024-999',
        type: 'Buraco na via',
        description: 'Exemplo de ocorrência inicial - Buraco na via principal',
        urgency: 'medium',
        status: 'concluido',
        timestamp: '2024-12-15T10:30:00Z',
        location: {
          lat: -23.5505,
          lng: -46.6333,
          address: 'Rua Exemplo, 123 - Centro'
        },
        photos: [],
        citizen: {
          name: 'Sistema',
          contact: 'sistema@prefeitura.gov.br'
        },
        assignedTo: 'Equipe de Manutenção',
        estimatedRepair: null,
        completedDate: '2024-12-20T15:00:00Z',
        notes: ['Ocorrência de exemplo criada pelo sistema']
      }
    ]
    
    localStorage.setItem(STORAGE_KEYS.REPORTES, JSON.stringify(sampleReports))
    localStorage.setItem(STORAGE_KEYS.COUNTER, '999')
    console.log('📋 Dados de exemplo inicializados')
  }
}

// Labels e configurações (mesmo que estava no mockData.js)
export const statusLabels = {
  'pendente': { label: 'Pendente', color: 'bg-yellow-500', icon: '⏳' },
  'em_andamento': { label: 'Em Andamento', color: 'bg-blue-500', icon: '🔧' },
  'concluido': { label: 'Concluído', color: 'bg-green-500', icon: '✅' }
}

export const urgencyLabels = {
  'low': { label: 'Baixa', color: 'bg-green-500', icon: '🟢' },
  'medium': { label: 'Média', color: 'bg-yellow-500', icon: '🟡' },
  'high': { label: 'Alta', color: 'bg-red-500', icon: '🔴' }
}

export const teamOptions = [
  'Equipe de Manutenção',
  'Equipe de Sinalização', 
  'Equipe de Iluminação',
  'Equipe de Drenagem',
  'Equipe de Paisagismo'
]

// Hook para usar no React - força re-render quando dados mudam
export const useReports = () => {
  const [reports, setReports] = useState(getAllReports())
  
  const refreshReports = () => {
    setReports(getAllReports())
  }
  
  useEffect(() => {
    // Escuta mudanças no localStorage
    const handleStorageChange = () => {
      refreshReports()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Escuta eventos customizados para mudanças na mesma aba
    window.addEventListener('reportsUpdated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('reportsUpdated', handleStorageChange)
    }
  }, [])
  
  return { reports, refreshReports }
}

// Função para disparar evento de atualização
export const notifyReportsUpdated = () => {
  window.dispatchEvent(new CustomEvent('reportsUpdated'))
}

// Função de emergência para limpar localStorage se estiver corrompido
export const emergencyCleanStorage = () => {
  try {
    // Tentar limpar apenas nossas chaves
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('reporte_estradas_') || key.includes('reporte')
    )
    
    keys.forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        console.warn('Erro ao remover chave:', key)
      }
    })
    
    console.log('🧹 Limpeza de emergência concluída')
    return true
  } catch (error) {
    console.error('❌ Erro na limpeza de emergência:', error)
    return false
  }
}

// Verificar saúde do localStorage
export const checkStorageHealth = () => {
  try {
    const testKey = 'storage_test_' + Date.now()
    const testValue = 'test'
    
    localStorage.setItem(testKey, testValue)
    const retrieved = localStorage.getItem(testKey)
    localStorage.removeItem(testKey)
    
    return retrieved === testValue
  } catch (error) {
    console.error('❌ localStorage não está funcionando:', error)
    return false
  }
}
