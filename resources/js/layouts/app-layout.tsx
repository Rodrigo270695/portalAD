import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import NotificationLoginModal from '@/components/NotificationLoginModal';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

export default function AppLayout({ children, breadcrumbs = [], title }: AppLayoutProps) {
    const { notifications = [] } = usePage().props as { notifications?: any[] };
    const [showNotifications, setShowNotifications] = useState(false);
    const { url } = usePage();

    useEffect(() => {
        // No mostrar notificaciones en la página de gestión de notificaciones
        if (url === '/notifications') return;

        // Asegurarse de que notifications sea un array
        const notificationsArray = Array.isArray(notifications) ? notifications : [];

        if (notificationsArray.length === 0) return;

        // Obtener las notificaciones ya vistas del día
        const today = new Date().toISOString().split('T')[0];
        const viewedNotifications = JSON.parse(localStorage.getItem(`viewed_notifications_${today}`) || '[]');

        // Filtrar las notificaciones que no se han visto hoy
        const unviewedNotifications = notificationsArray.filter(
            notification => !viewedNotifications.includes(notification.id)
        );

        if (unviewedNotifications.length > 0) {
            setShowNotifications(true);
            // Guardar las notificaciones actuales como vistas
            const allNotificationIds = notificationsArray.map(n => n.id);
            localStorage.setItem(`viewed_notifications_${today}`, JSON.stringify(allNotificationIds));
        }
    }, [notifications, url]);

    const handleClose = () => {
        setShowNotifications(false);
    };

    // Asegurarse de que notifications sea un array antes de pasarlo al modal
    const safeNotifications = Array.isArray(notifications) ? notifications : [];

    return (
        <div className="min-h-screen bg-background">
            <AppLayoutTemplate breadcrumbs={breadcrumbs} title={title}>
                {children}
            </AppLayoutTemplate>

            {/* Modal de notificaciones */}
            <NotificationLoginModal
                isOpen={showNotifications}
                onClose={handleClose}
                notifications={safeNotifications}
            />
        </div>
    );
}
