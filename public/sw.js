const CACHE_NAME = 'reporte-estradas-v3'

// Detectar se está em desenvolvimento ou produção
const isProduction = self.location.hostname !== 'localhost'
const BASE_URL = isProduction ? '/Reporte-nas-Estradas' : '/Reporte-nas-Estradas'

const urlsToCache = [
  `${BASE_URL}/`,
  `${BASE_URL}/index.html`,
  `${BASE_URL}/manifest.json`,
  `${BASE_URL}/icon-192.png`,
  `${BASE_URL}/icon-512.png`,
  `${BASE_URL}/favicon.ico`,
  `${BASE_URL}/favicon.svg`
]

console.log('🔧 Service Worker iniciando...')
console.log('🌐 Ambiente:', isProduction ? 'Produção' : 'Desenvolvimento')
console.log('📁 Base URL:', BASE_URL)
console.log('💾 Cache Name:', CACHE_NAME)

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker instalando...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('💾 Cache aberto:', CACHE_NAME)
        console.log('📋 URLs para cache:', urlsToCache)
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('✅ Todos os recursos foram cacheados')
          })
          .catch((error) => {
            console.error('❌ Erro ao cachear recursos:', error)
            // Tentar cachear recursos individuais
            return Promise.allSettled(
              urlsToCache.map(url => 
                cache.add(url).catch(err => {
                  console.warn('⚠️ Falha ao cachear:', url, err)
                })
              )
            )
          })
      })
      .then(() => {
        console.log('✅ Service Worker instalado com sucesso')
        // Forçar ativação imediata
        return self.skipWaiting()
      })
  )
})

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não são GET
  if (event.request.method !== 'GET') {
    return
  }
  
  // Ignorar requisições para APIs externas
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna cache se disponível
        if (response) {
          console.log('📱 Servindo do cache:', event.request.url)
          return response
        }
        
        // Buscar na rede
        console.log('🌐 Buscando na rede:', event.request.url)
        return fetch(event.request)
          .then((response) => {
            // Verificar se é uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clonar resposta para cache
            const responseToCache = response.clone()
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch((error) => {
            console.error('❌ Erro na rede:', error)
            // Retornar página offline se disponível
            if (event.request.destination === 'document') {
              return caches.match(`${BASE_URL}/`)
            }
          })
      })
  )
})

// Atualizar service worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker ativando...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('✅ Service Worker ativado e controlando todas as abas')
      // Tomar controle imediato de todas as abas
      return self.clients.claim()
    })
  )
})

// Mensagem do cliente
self.addEventListener('message', (event) => {
  console.log('📨 Mensagem recebida:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Notificar quando há uma atualização disponível
self.addEventListener('updatefound', () => {
  console.log('🆕 Nova versão do Service Worker encontrada')
})

console.log('🎉 Service Worker carregado com sucesso!')

// Sincronização em background para envio de reportes offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-reportes') {
    event.waitUntil(
      // Aqui seria implementada a lógica para enviar reportes salvos offline
      console.log('Sincronizando reportes em background')
    )
  }
})

// Notificações push (para atualizações de status dos reportes)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Atualização sobre seu reporte',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalhes',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Reporte Estradas', options)
  )
})

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/historico')
    )
  }
})

