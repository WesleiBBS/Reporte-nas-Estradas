import { useState, useEffect } from 'react'
import { getAllReports, updateReport, deleteReport, deleteMultipleReports, clearAllReports, notifyReportsUpdated, statusLabels, urgencyLabels, teamOptions, initializeWithSampleData } from './reportStorage.js'
import './App.css'

function PainelPrefeitura({ onBackToCitizen }) {
  const [reportes, setReportes] = useState([])
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroUrgencia, setFiltroUrgencia] = useState('todos')
  const [selectedReporte, setSelectedReporte] = useState(null)
  const [showModal, setShowModal] = useState(false)
  
  // Estados para seleção múltipla e exclusão
  const [selectedReports, setSelectedReports] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  // Carregar ocorrências reais do localStorage
  useEffect(() => {
    // Inicializar dados de exemplo se necessário
    initializeWithSampleData()
    
    // Carregar ocorrências
    loadReports()
    
    // Escutar mudanças nas ocorrências
    const handleReportsUpdate = () => {
      loadReports()
    }
    
    window.addEventListener('reportsUpdated', handleReportsUpdate)
    
    return () => {
      window.removeEventListener('reportsUpdated', handleReportsUpdate)
    }
  }, [])

  const loadReports = () => {
    const reports = getAllReports()
    setReportes(reports)
    console.log('📊 Painel carregou', reports.length, 'ocorrências')
  }

  // Filtrar reportes
  const reportesFiltrados = reportes.filter(reporte => {
    const statusMatch = filtroStatus === 'todos' || reporte.status === filtroStatus
    const urgencyMatch = filtroUrgencia === 'todos' || reporte.urgency === filtroUrgencia
    return statusMatch && urgencyMatch
  })

  // Estatísticas
  const stats = {
    total: reportes.length,
    pendentes: reportes.filter(r => r.status === 'pendente').length,
    emAndamento: reportes.filter(r => r.status === 'em_andamento').length,
    concluidos: reportes.filter(r => r.status === 'concluido').length,
    urgentes: reportes.filter(r => r.urgency === 'high').length
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const handleStatusChange = (reporteId, newStatus) => {
    const updates = {
      status: newStatus,
      completedDate: newStatus === 'concluido' ? new Date().toISOString() : null
    }
    
    updateReport(reporteId, updates)
    loadReports() // Recarregar dados
    notifyReportsUpdated() // Notificar outras abas
  }

  const handleAssignTeam = (reporteId, team) => {
    const updates = {
      assignedTo: team,
      status: team && reportes.find(r => r.id === reporteId)?.status === 'pendente' ? 'em_andamento' : reportes.find(r => r.id === reporteId)?.status
    }
    
    updateReport(reporteId, updates)
    loadReports() // Recarregar dados
    notifyReportsUpdated() // Notificar outras abas
  }

  const openModal = (reporte) => {
    setSelectedReporte(reporte)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedReporte(null)
  }

  // Funções para gerenciar exclusões
  const handleDeleteSingle = (reporteId) => {
    if (confirm('⚠️ Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita.')) {
      deleteReport(reporteId)
      loadReports()
      notifyReportsUpdated()
      setShowModal(false)
    }
  }

  const handleDeleteMultiple = () => {
    if (selectedReports.length === 0) return
    
    const confirmMsg = `⚠️ Tem certeza que deseja excluir ${selectedReports.length} ocorrência(s)? Esta ação não pode ser desfeita.`
    if (confirm(confirmMsg)) {
      deleteMultipleReports(selectedReports)
      loadReports()
      notifyReportsUpdated()
      setSelectedReports([])
      setIsSelectionMode(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleClearAll = () => {
    const confirmMsg = '🚨 ATENÇÃO: Deseja excluir TODAS as ocorrências? Esta ação é irreversível!'
    if (confirm(confirmMsg)) {
      const doubleConfirm = 'Digite "EXCLUIR TUDO" para confirmar:'
      const userInput = prompt(doubleConfirm)
      if (userInput === 'EXCLUIR TUDO') {
        clearAllReports()
        loadReports()
        notifyReportsUpdated()
        setSelectedReports([])
        setIsSelectionMode(false)
        alert('🗑️ Todas as ocorrências foram excluídas!')
      }
    }
  }

  const toggleSelection = (reporteId) => {
    setSelectedReports(prev => 
      prev.includes(reporteId)
        ? prev.filter(id => id !== reporteId)
        : [...prev, reporteId]
    )
  }

  const selectAll = () => {
    if (selectedReports.length === reportesFiltrados.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(reportesFiltrados.map(r => r.id))
    }
  }

  return (
    <div className="painel-container">
      {/* Header da Prefeitura */}
      <header className="painel-header">
        <div className="header-content">
          <div className="logo-prefeitura">
            <span className="logo-icon">🏛️</span>
            <div>
              <h1>Prefeitura Municipal</h1>
              <p>Sistema de Gestão de Reportes de Estradas</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="back-to-citizen-btn"
              onClick={onBackToCitizen}
              title="Voltar para área do cidadão"
            >
              <span className="btn-icon">👤</span>
              <span className="btn-text">Área do Cidadão</span>
            </button>
            
            {/* Botões de gerenciamento */}
            <div className="management-buttons">
              <button 
                className={`selection-mode-btn ${isSelectionMode ? 'active' : ''}`}
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode)
                  setSelectedReports([])
                }}
                title="Modo de seleção múltipla"
              >
                <span className="btn-icon">☑️</span>
                <span className="btn-text">{isSelectionMode ? 'Cancelar' : 'Selecionar'}</span>
              </button>
              
              {isSelectionMode && (
                <>
                  <button 
                    className="select-all-btn"
                    onClick={selectAll}
                    title="Selecionar todas as ocorrências visíveis"
                  >
                    <span className="btn-icon">📋</span>
                    <span className="btn-text">
                      {selectedReports.length === reportesFiltrados.length ? 'Desmarcar' : 'Todas'}
                    </span>
                  </button>
                  
                  {selectedReports.length > 0 && (
                    <button 
                      className="delete-selected-btn"
                      onClick={handleDeleteMultiple}
                      title={`Excluir ${selectedReports.length} ocorrência(s) selecionada(s)`}
                    >
                      <span className="btn-icon">🗑️</span>
                      <span className="btn-text">Excluir ({selectedReports.length})</span>
                    </button>
                  )}
                </>
              )}
              
              <button 
                className="danger-btn"
                onClick={handleClearAll}
                title="PERIGO: Excluir todas as ocorrências"
              >
                <span className="btn-icon">🚨</span>
                <span className="btn-text">Limpar Tudo</span>
              </button>
            </div>
            
            <div className="header-stats">
              <div className="stat-card urgent">
                <span className="stat-number">{stats.urgentes}</span>
                <span className="stat-label">Urgentes</span>
              </div>
              <div className="stat-card pending">
                <span className="stat-number">{stats.pendentes}</span>
                <span className="stat-label">Pendentes</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Stats */}
      <section className="dashboard-stats">
        <div className="stats-grid">
          <div className="stat-card total">
            <span className="stat-icon">📊</span>
            <div>
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total de Reportes</span>
            </div>
          </div>
          <div className="stat-card pending">
            <span className="stat-icon">⏳</span>
            <div>
              <span className="stat-number">{stats.pendentes}</span>
              <span className="stat-label">Pendentes</span>
            </div>
          </div>
          <div className="stat-card progress">
            <span className="stat-icon">🔧</span>
            <div>
              <span className="stat-number">{stats.emAndamento}</span>
              <span className="stat-label">Em Andamento</span>
            </div>
          </div>
          <div className="stat-card completed">
            <span className="stat-icon">✅</span>
            <div>
              <span className="stat-number">{stats.concluidos}</span>
              <span className="stat-label">Concluídos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label>📋 Status:</label>
            <select 
              value={filtroStatus} 
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluídos</option>
            </select>
          </div>
          <div className="filter-group">
            <label>🚨 Urgência:</label>
            <select 
              value={filtroUrgencia} 
              onChange={(e) => setFiltroUrgencia(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todas</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </div>
        </div>
      </section>

      {/* Lista de Reportes */}
      <section className="reportes-section">
        <h2>📋 Reportes ({reportesFiltrados.length})</h2>
        <div className="reportes-grid">
          {reportesFiltrados.map(reporte => (
            <div key={reporte.id} className={`reporte-card ${selectedReports.includes(reporte.id) ? 'selected' : ''}`}>
              
              {/* Checkbox de seleção */}
              {isSelectionMode && (
                <div className="selection-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(reporte.id)}
                    onChange={() => toggleSelection(reporte.id)}
                    className="selection-input"
                  />
                </div>
              )}
              
              <div className="reporte-header">
                <div className="reporte-id">
                  <strong>{reporte.id}</strong>
                  <span className="reporte-date">{formatDate(reporte.timestamp)}</span>
                </div>
                <div className="reporte-badges">
                  <span 
                    className="badge-status"
                    style={{ background: statusLabels[reporte.status].color }}
                  >
                    {statusLabels[reporte.status].icon} {statusLabels[reporte.status].label}
                  </span>
                  <span 
                    className="badge-urgency"
                    style={{ background: urgencyLabels[reporte.urgency].color }}
                  >
                    {urgencyLabels[reporte.urgency].icon} {urgencyLabels[reporte.urgency].label}
                  </span>
                </div>
              </div>

              <div className="reporte-content">
                <h3>{reporte.type}</h3>
                <p className="reporte-description">
                  {reporte.description.substring(0, 120)}
                  {reporte.description.length > 120 ? '...' : ''}
                </p>
                
                {/* Informações do cidadão */}
                <div className="citizen-info">
                  <span>👤 {reporte.citizen.name}</span>
                  {!reporte.citizen.isAnonymous && reporte.citizen.contact !== 'Não informado' && (
                    <span>📞 {reporte.citizen.contact}</span>
                  )}
                </div>
                
                {reporte.location && (
                  <div className="reporte-location">
                    📍 {reporte.location.address}
                    {reporte.location.lat && reporte.location.lng && (
                      <small> ({reporte.location.lat.toFixed(4)}, {reporte.location.lng.toFixed(4)})</small>
                    )}
                  </div>
                )}
              </div>

              <div className="reporte-actions">
                <div className="reporte-info">
                  <span>📷 {reporte.photos.length} foto(s)</span>
                  {reporte.assignedTo && (
                    <span>👥 {reporte.assignedTo}</span>
                  )}
                </div>
                <div className="action-buttons">
                  <button 
                    className="btn-view"
                    onClick={() => openModal(reporte)}
                  >
                    👁️ Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal de Detalhes */}
      {showModal && selectedReporte && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>📋 Detalhes do Reporte</h2>
              <div className="modal-header-actions">
                <button 
                  className="btn-delete-single"
                  onClick={() => handleDeleteSingle(selectedReporte.id)}
                  title="Excluir esta ocorrência"
                >
                  🗑️ Excluir
                </button>
                <button className="btn-close" onClick={closeModal}>❌</button>
              </div>
            </header>

            <div className="modal-body">
              <div className="reporte-details">
                <div className="detail-row">
                  <strong>ID:</strong> {selectedReporte.id}
                </div>
                <div className="detail-row">
                  <strong>Tipo:</strong> {selectedReporte.type}
                </div>
                <div className="detail-row">
                  <strong>Status:</strong>
                  <select 
                    value={selectedReporte.status}
                    onChange={(e) => handleStatusChange(selectedReporte.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pendente">⏳ Pendente</option>
                    <option value="em_andamento">🔧 Em Andamento</option>
                    <option value="concluido">✅ Concluído</option>
                  </select>
                </div>
                <div className="detail-row">
                  <strong>Urgência:</strong>
                  <span style={{ color: urgencyLabels[selectedReporte.urgency].color }}>
                    {urgencyLabels[selectedReporte.urgency].icon} {urgencyLabels[selectedReporte.urgency].label}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Data/Hora:</strong> {formatDate(selectedReporte.timestamp)}
                </div>
                <div className="detail-row">
                  <strong>Localização:</strong> 
                  <div>
                    <p>{selectedReporte.location?.address || 'Não informado'}</p>
                    {selectedReporte.location?.lat && selectedReporte.location?.lng && (
                      <small style={{ color: '#6b7280' }}>
                        GPS: {selectedReporte.location.lat.toFixed(6)}, {selectedReporte.location.lng.toFixed(6)}
                      </small>
                    )}
                  </div>
                </div>
                <div className="detail-row">
                  <strong>Cidadão:</strong>
                  <div>
                    <p>
                      👤 {selectedReporte.citizen.name}
                      {selectedReporte.citizen.isAnonymous && <span style={{ color: '#6b7280' }}> (Anônimo)</span>}
                    </p>
                    {!selectedReporte.citizen.isAnonymous && selectedReporte.citizen.contact !== 'Não informado' && (
                      <p>📞 {selectedReporte.citizen.contact}</p>
                    )}
                  </div>
                </div>
                <div className="detail-row">
                  <strong>Equipe Responsável:</strong>
                  <select 
                    value={selectedReporte.assignedTo || ''}
                    onChange={(e) => handleAssignTeam(selectedReporte.id, e.target.value)}
                    className="team-select"
                  >
                    <option value="">Selecionar equipe...</option>
                    {teamOptions.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
                <div className="detail-description">
                  <strong>Descrição:</strong>
                  <p>{selectedReporte.description}</p>
                </div>
                <div className="detail-photos">
                  <strong>Fotos ({selectedReporte.photos.length}):</strong>
                  {selectedReporte.photos.length > 0 ? (
                    <div className="photos-grid">
                      {selectedReporte.photos.map(photo => (
                        <div key={photo.id} className="photo-item">
                          <div className="photo-display">
                            {photo.data ? (
                              <img 
                                src={photo.data} 
                                alt={photo.description || 'Foto da ocorrência'}
                                className="photo-thumbnail"
                                onClick={() => {
                                  // Abrir foto em nova aba para visualização completa
                                  const newWindow = window.open()
                                  newWindow.document.write(`
                                    <html>
                                      <head><title>Foto - ${selectedReporte.id}</title></head>
                                      <body style="margin:0;background:#000;display:flex;justify-content:center;align-items:center;min-height:100vh;">
                                        <img src="${photo.data}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                                      </body>
                                    </html>
                                  `)
                                }}
                              />
                            ) : (
                              <div className="photo-placeholder">
                                📷 Foto não disponível
                              </div>
                            )}
                          </div>
                          <span className="photo-info">
                            {photo.description || `Foto ${photo.id}`}
                            {photo.size && (
                              <small> ({(photo.size / 1024).toFixed(1)}KB)</small>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Nenhuma foto anexada</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PainelPrefeitura
