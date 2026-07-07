// Service Worker for PWA
const CACHE_NAME = 'music-platform-v1';
const RUNTIME_CACHE = 'music-platform-runtime';

// الملفات الأساسية للتخزين المؤقت
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// التثبيت - تخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// التفعيل - تنظيف الذاكرة المؤقتة القديمة
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('Service Worker: Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
    .then(() => self.clients.claim())
  );
});

// استراتيجية التخزين المؤقت: Network First مع Fallback للذاكرة المؤقتة
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تخطي الطلبات غير GET
  if (request.method !== 'GET') return;

  // تخطي الطلبات الخارجية (APIs)
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // استراتيجية: Cache First للأصول الثابتة
        if (cachedResponse) {
          // تحديث الذاكرة المؤقتة في الخلفية
          fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                caches.open(RUNTIME_CACHE).then((cache) => {
                  cache.put(request, response.clone());
                });
              }
            })
            .catch(() => {
              // تجاهل الأخطاء في التحديث الخلفي
            });
          
          return cachedResponse;
        }

        // إذا لم يكن في الذاكرة المؤقتة، جلب من الشبكة
        return fetch(request)
          .then((response) => {
            // تخزين الاستجابة الناجحة
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
          .catch((error) => {
            console.log('Service Worker: Fetch failed:', error);
            
            // إرجاع صفحة offline مخصصة للملاحة
            if (request.destination === 'document') {
              return caches.match('/offline.html') || new Response(
                '<h1>أنت غير متصل بالإنترنت</h1><p>يرجى التحقق من اتصالك بالإنترنت</p>',
                {
                  headers: { 'Content-Type': 'text/html; charset=utf-8' }
                }
              );
            }
            
            throw error;
          });
      })
  );
});

// التعامل مع الرسائل من التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    });
  }
});

// Background Sync - لمزامنة البيانات عند العودة للاتصال
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync');
  
  if (event.tag === 'sync-playlists') {
    event.waitUntil(
      // مزامنة قوائم التشغيل
      syncPlaylists()
    );
  }
});

async function syncPlaylists() {
  // تنفيذ منطق المزامنة
  console.log('Syncing playlists...');
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'إشعار جديد';
  const options = {
    body: data.body || 'لديك إشعار جديد',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1
    },
    actions: [
      {
        action: 'explore',
        title: 'افتح',
      },
      {
        action: 'close',
        title: 'إغلاق',
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
