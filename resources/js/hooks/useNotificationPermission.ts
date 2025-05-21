import { useState, useEffect } from 'react';

export const useNotificationPermission = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        // Verificar si las notificaciones están soportadas
        if (!('Notification' in window)) {
            console.log('Este navegador no soporta notificaciones de escritorio');
            return;
        }

        // Actualizar el estado inicial del permiso
        setPermission(Notification.permission);

        // Si el permiso está en 'default', solicitar permiso
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(newPermission => {
                setPermission(newPermission);
            });
        }
    }, []);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            return false;
        }

        try {
            const newPermission = await Notification.requestPermission();
            setPermission(newPermission);
            return newPermission === 'granted';
        } catch (error) {
            console.error('Error al solicitar permiso de notificaciones:', error);
            return false;
        }
    };

    return {
        permission,
        requestPermission,
        isSupported: 'Notification' in window
    };
};
