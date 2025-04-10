import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { usePWAUpdate } from './hooks/usePWAUpdate';
import { requestNotificationPermission } from './notifications';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { registerSW } from 'virtual:pwa-register';
import axios from 'axios';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Configurar axios para incluir el token CSRF en todas las solicitudes
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

// Solicitar permiso para notificaciones al inicio
requestNotificationPermission();

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        // Envolver la aplicación con los hooks de PWA
        function PWAWrapper({ children }: { children: React.ReactNode }) {
            usePWAUpdate();
            const isOnline = useNetworkStatus();

            if (!isOnline) {
                return <div>Sin conexión</div>;
            }

            return <>{children}</>;
        }

        const root = createRoot(el);

        root.render(
            <PWAWrapper>
                <App {...props} />
            </PWAWrapper>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Register service worker
if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
        onNeedRefresh() {
            if (confirm('¿Hay nuevo contenido disponible. ¿Deseas recargar?')) {
                updateSW(true);
            }
        },
        onOfflineReady() {
            console.log('La aplicación está lista para funcionar sin conexión');
        },
        immediate: true
    });
}
