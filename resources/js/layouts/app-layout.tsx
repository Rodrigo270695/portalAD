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
    const { notifications } = usePage().props;
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (!notifications || notifications.length === 0) return;

        // Obtener las notificaciones ya vistas del día
        const today = new Date().toISOString().split('T')[0];
        const viewedNotifications = JSON.parse(localStorage.getItem(`viewed_notifications_${today}`) || '[]');

        // Filtrar las notificaciones que no se han visto hoy
        const unviewedNotifications = notifications.filter(
            notification => !viewedNotifications.includes(notification.id)
        );

        if (unviewedNotifications.length > 0) {
            setShowNotifications(true);
            // Guardar las notificaciones actuales como vistas
            const allNotificationIds = notifications.map(n => n.id);
            localStorage.setItem(`viewed_notifications_${today}`, JSON.stringify(allNotificationIds));
        }
    }, [notifications]);

    const handleClose = () => {
        setShowNotifications(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <AppLayoutTemplate breadcrumbs={breadcrumbs} title={title}>
                {children}
            </AppLayoutTemplate>

            {/* Modal de notificaciones */}
            <NotificationLoginModal
                isOpen={showNotifications}
                onClose={handleClose}
                notifications={notifications || []}
            />
        </div>
    );
}
