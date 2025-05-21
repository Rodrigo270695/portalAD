import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, AlertOctagon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
    id: number;
    title: string;
    description: string;
    type: 'URGENT' | 'ALERT';
    status: boolean;
    start_date: string;
    end_date: string | null;
}

interface NotificationLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
}

export default function NotificationLoginModal({ isOpen, onClose, notifications }: NotificationLoginModalProps) {
    const getTypeIcon = (type: 'URGENT' | 'ALERT') => {
        return type === 'URGENT' ? (
            <AlertOctagon className="h-5 w-5 text-red-500" />
        ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
        );
    };

    const getTypeClass = (type: 'URGENT' | 'ALERT') => {
        return type === 'URGENT'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Notificaciones Importantes</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="rounded-lg border p-4 shadow-sm transition-colors hover:bg-muted/50"
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    {getTypeIcon(notification.type)}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <h3 className="font-semibold leading-none">
                                            {notification.title}
                                        </h3>
                                        <span
                                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getTypeClass(notification.type)}`}
                                        >
                                            {notification.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {notification.description}
                                    </p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <span>
                                            Desde: {format(new Date(notification.start_date), 'PPP', { locale: es })}
                                        </span>
                                        {notification.end_date && (
                                            <span>
                                                Hasta: {format(new Date(notification.end_date), 'PPP', { locale: es })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
