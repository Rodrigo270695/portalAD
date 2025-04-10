import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, NetworkOnly } from 'workbox-strategies';

// Precache todos los assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache first para archivos estáticos
registerRoute(
    ({ request }) => 
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'image' ||
        request.destination === 'font',
    new CacheFirst({
        cacheName: 'static-resources'
    })
);

// Network first para rutas de API
registerRoute(
    ({ url }) => url.pathname.startsWith('/api'),
    new NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10
    })
);

// Offline fallback
const offlineUrl = '/offline';
const networkOnly = new NetworkOnly();
const navigationHandler = async (params) => {
    try {
        // Intenta la navegación normal primero
        return await networkOnly.handle(params);
    } catch (_error) {
        // Si falla, redirige a la página offline
        return Response.redirect(offlineUrl, 302);
    }
};

// Registra el handler de navegación
registerRoute(
    new NavigationRoute(navigationHandler)
);
