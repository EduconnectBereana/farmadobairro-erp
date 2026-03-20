// ══════════════════════════════════════════════════════════
// FARMACLUB — SERVICE WORKER
// Gerencia cache para funcionamento offline dos apps
// ══════════════════════════════════════════════════════════

const CACHE_VERSION = 'farmaclub-v1.2';

// Arquivos que ficam em cache (funcionam sem internet)
const CACHE_ESTATICO = [
  '/',
  '/farmaclub_central.html',
  '/farmaclub_app_cliente.html',
  '/farmaclub_app_motoboy.html',
  '/farmaclub_erp_central.html',
  '/farmaclub_erp_farmacia.html',
  '/farmaclub_compra_coletiva.html',
  '/farmaclub_contabilidade.html',
  '/farmaclub_frete.html',
  '/farmaclub_dados.js',
  '/farmaclub_logo.png',
  '/manifest-cliente.json',
  '/manifest-motoboy.json',
];

// ── INSTALAÇÃO — baixa e salva todos os arquivos ──
self.addEventListener('install', event => {
  console.log('[SW FarmaClub] Instalando versão:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => {
        console.log('[SW FarmaClub] Salvando arquivos em cache...');
        // Salvar um por um para não falhar tudo se um arquivo não existir
        return Promise.allSettled(
          CACHE_ESTATICO.map(url =>
            cache.add(url).catch(err => console.warn('[SW] Não cacheado:', url, err.message))
          )
        );
      })
      .then(() => {
        console.log('[SW FarmaClub] Cache instalado!');
        return self.skipWaiting(); // ativa imediatamente sem esperar reload
      })
  );
});

// ── ATIVAÇÃO — remove caches antigos ──
self.addEventListener('activate', event => {
  console.log('[SW FarmaClub] Ativando versão:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_VERSION)
          .map(name => {
            console.log('[SW FarmaClub] Removendo cache antigo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim()) // assume controle imediatamente
  );
});

// ── FETCH — estratégia: cache primeiro, rede como fallback ──
self.addEventListener('fetch', event => {
  // Ignora requisições não-GET e extensões externas
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Retorna do cache se disponível
        if (cachedResponse) {
          // Em background, tenta atualizar o cache
          fetch(event.request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_VERSION).then(cache => {
                  cache.put(event.request, networkResponse.clone());
                });
              }
            })
            .catch(() => {}); // Silencia erro de rede em background
          return cachedResponse;
        }

        // Não está em cache — busca da rede
        return fetch(event.request)
          .then(networkResponse => {
            // Salva no cache para próxima vez
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_VERSION).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Sem cache e sem rede — retorna página offline
            if (event.request.destination === 'document') {
              return caches.match('/farmaclub_app_cliente.html')
                || new Response(
                  `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FarmaClub — Offline</title>
                  <style>body{font-family:system-ui,sans-serif;background:#f4f4f2;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:20px}
                  .box{background:#fff;border-radius:16px;padding:32px;max-width:320px}
                  h1{font-size:20px;color:#3BAA35;margin-bottom:8px}p{color:#666;font-size:14px;line-height:1.6}
                  button{margin-top:16px;padding:12px 24px;background:#3BAA35;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer}</style>
                  </head><body><div class="box">
                  <div style="font-size:48px;margin-bottom:12px">📡</div>
                  <h1>Sem conexão</h1>
                  <p>Você está offline. Algumas funções podem estar indisponíveis, mas seu carrinho e histórico estão salvos.</p>
                  <button onclick="location.reload()">Tentar novamente</button>
                  </div></body></html>`,
                  { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                );
            }
          });
      })
  );
});

// ── SINCRONIZAÇÃO EM BACKGROUND (quando voltar internet) ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pedidos') {
    console.log('[SW FarmaClub] Sincronizando pedidos com o servidor...');
    // Quando integrar com Supabase:
    // event.waitUntil(sincronizarPedidosPendentes());
  }
});

// ── NOTIFICAÇÕES PUSH (preparado para quando ativar) ──
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || 'Nova atualização do FarmaClub',
    icon: '/icons/cliente-192.png',
    badge: '/icons/cliente-72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: data.actions || []
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'FarmaClub', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        const existing = clientList.find(c => c.url === url && 'focus' in c);
        if (existing) return existing.focus();
        return clients.openWindow(url);
      })
  );
});

console.log('[SW FarmaClub] Service Worker carregado — versão', CACHE_VERSION);
