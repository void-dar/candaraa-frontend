// Cache version names
const STATIC_CACHE = 'static-assets-v2';
const DYNAMIC_CACHE = 'dynamic-pages-v2';

// List of static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',   // optional offline fallback
  '/favicon.png',
  '/candaraa.css',
  'stock-vector-quiz-and-question-marks-trivia-night-quiz-symbol-neon-sign-night-online-game-with-questions-2052894734.jpg',
  '/soundEffects/correct-6033.mp3',
  '/soundEffects/wrong-47985.mp3',
  '/bg-audio/calm-soft-background-music-398280.mp3',
  '/bg-audio/soft-background-music-401914.mp3',
  '/bg-audio/soft-piano-music-398426.mp3',
  '/audio/quiz-background-loop-thinking-news-275636.mp3',
  '/audio/quiz-countdown-194417.mp3',
  '/audio/quiz-music-158558.mp3',

];

// Install event: cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // activate immediately
});

// Activate event: clean old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch event: dynamic caching for visited pages
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then(async (cache) => {
        try {
          const response = await fetch(request); // try network first
          cache.put(request, response.clone());   // cache the online page
          return response;
        } catch (err) {
          const cached = await cache.match(request);
          return cached || caches.match('/offline.html'); // fallback
        }
      })
    );
  } else {
    // For other requests (CSS, JS, images)
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});
