// Dados simulados para o painel da prefeitura

export const mockReportes = [
  {
    id: 'REP-2025-001',
    type: 'Buraco na via',
    description: 'Buraco grande na Rua das Flores, altura do número 123. Aproximadamente 2m de diâmetro, causando risco aos veículos.',
    urgency: 'high',
    status: 'pendente',
    timestamp: '2025-01-15T10:30:00Z',
    location: {
      lat: -23.5505,
      lng: -46.6333,
      address: 'Rua das Flores, 123 - Centro'
    },
    photos: [
      { id: 1, url: '/api/placeholder/300/200', description: 'Vista geral do buraco' },
      { id: 2, url: '/api/placeholder/300/200', description: 'Detalhe da profundidade' }
    ],
    citizen: {
      name: 'João Silva',
      contact: 'joao.silva@email.com'
    },
    assignedTo: null,
    estimatedRepair: null
  },
  {
    id: 'REP-2025-002',
    type: 'Sinalização danificada',
    description: 'Placa de PARE danificada no cruzamento da Av. Principal com Rua Secundária. Placa está caída e pode causar acidentes.',
    urgency: 'medium',
    status: 'em_andamento',
    timestamp: '2025-01-14T14:15:00Z',
    location: {
      lat: -23.5515,
      lng: -46.6343,
      address: 'Av. Principal x Rua Secundária'
    },
    photos: [
      { id: 3, url: '/api/placeholder/300/200', description: 'Placa caída' }
    ],
    citizen: {
      name: 'Maria Santos',
      contact: 'maria.santos@email.com'
    },
    assignedTo: 'Equipe de Sinalização',
    estimatedRepair: '2025-01-20'
  },
  {
    id: 'REP-2025-003',
    type: 'Iluminação pública',
    description: 'Poste de iluminação queimado na Praça Central. Local fica muito escuro à noite, comprometendo a segurança.',
    urgency: 'medium',
    status: 'concluido',
    timestamp: '2025-01-10T09:00:00Z',
    location: {
      lat: -23.5525,
      lng: -46.6353,
      address: 'Praça Central, próximo ao banco'
    },
    photos: [
      { id: 4, url: '/api/placeholder/300/200', description: 'Poste sem iluminação' }
    ],
    citizen: {
      name: 'Pedro Costa',
      contact: 'pedro.costa@email.com'
    },
    assignedTo: 'Equipe Elétrica',
    estimatedRepair: '2025-01-12',
    completedDate: '2025-01-12T16:30:00Z'
  },
  {
    id: 'REP-2025-004',
    type: 'Drenagem/Alagamento',
    description: 'Bueiro entupido na Rua do Comércio. Sempre alaga quando chove, impedindo o trânsito de pedestres e veículos.',
    urgency: 'high',
    status: 'pendente',
    timestamp: '2025-01-16T08:45:00Z',
    location: {
      lat: -23.5535,
      lng: -46.6363,
      address: 'Rua do Comércio, 456'
    },
    photos: [
      { id: 5, url: '/api/placeholder/300/200', description: 'Rua alagada' },
      { id: 6, url: '/api/placeholder/300/200', description: 'Bueiro entupido' }
    ],
    citizen: {
      name: 'Ana Oliveira',
      contact: 'ana.oliveira@email.com'
    },
    assignedTo: null,
    estimatedRepair: null
  }
]

export const statusLabels = {
  pendente: { label: 'Pendente', color: '#ef4444', icon: '⏳' },
  em_andamento: { label: 'Em Andamento', color: '#f59e0b', icon: '🔧' },
  concluido: { label: 'Concluído', color: '#10b981', icon: '✅' }
}

export const urgencyLabels = {
  low: { label: 'Baixa', color: '#10b981', icon: '🟢' },
  medium: { label: 'Média', color: '#f59e0b', icon: '🟡' },
  high: { label: 'Alta', color: '#ef4444', icon: '🔴' }
}

export const teamOptions = [
  'Equipe de Pavimentação',
  'Equipe de Sinalização',
  'Equipe Elétrica',
  'Equipe de Limpeza',
  'Equipe de Drenagem'
]
