import { useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';

export function usePWAUpdate() {
    useEffect(() => {
        const updateSW = registerSW({
            onNeedRefresh() {
                if (confirm('¿Hay una nueva versión disponible. ¿Deseas actualizar?')) {
                    updateSW(true);
                }
            },
            onOfflineReady() {
                console.log('La aplicación está lista para uso offline');
            },
            onRegistered(registration) {
                // Verificar actualizaciones cada hora
                setInterval(() => {
                    registration?.update();
                }, 60 * 60 * 1000);
            },
        });
    }, []);
}
