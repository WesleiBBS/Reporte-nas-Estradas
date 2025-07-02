const CACHE_NAME = 'reporte-estradas-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

// Instalar service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto')
        return cache.addAll(urlsToCache)
      })
  )
})

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna cache se disponível, senão busca na rede
        if (response) {
          return response
        }
        return fetch(event.request)
      })
  )
})

// Atualizar service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

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

