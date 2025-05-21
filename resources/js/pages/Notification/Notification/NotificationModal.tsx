import CrudModal, { ModalSize } from '@/components/ui/crud-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import classNames from 'classnames';
import { AlertTriangle, MessageSquare, CalendarDays } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Notification {
    id: number;
    title: string;
    description: string;
    type: 'URGENT' | 'ALERT';
    status: boolean;
    start_date: string;
    end_date: string | null;
}

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    notification?: Notification;
    size?: ModalSize;
}

export default function NotificationModal({ isOpen, onClose, notification, size = 'lg' }: NotificationModalProps) {
    const isEditing = !!notification;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        title: string;
        description: string;
        type: 'URGENT' | 'ALERT';
        status: boolean;
        start_date: string;
        end_date: string | null;
    }>({
        title: '',
        description: '',
        type: 'ALERT',
        status: true,
        start_date: '',
        end_date: null,
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                title: notification?.title || '',
                description: notification?.description || '',
                type: notification?.type || 'ALERT',
                status: notification?.status ?? true,
                start_date: notification?.start_date || '',
                end_date: notification?.end_date || null,
            });
        } else {
            reset();
            clearErrors();
        }
    }, [isOpen, notification, setData, reset, clearErrors]);

    const capitalizeFirstLetter = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = capitalizeFirstLetter(e.target.value);
        setData('title', value);
    };

    const handleSubmit = (e?: FormEvent) => {
        if (e) e.preventDefault();

        const submitForm = isEditing ? put : post;
        const url = isEditing ? `/notifications/${notification.id}` : '/notifications';

        submitForm(url, {
            onSuccess: () => {
                toast.success({
                    title: isEditing ? "Notificación actualizada" : "Notificación creada",
                    description: `La notificación "${data.title}" ha sido ${isEditing ? 'actualizada' : 'creada'} correctamente.`
                });
                reset();
                clearErrors();
                onClose();
            }
        });
    };

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    return (
        <CrudModal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? 'Editar Notificación' : 'Crear Notificación'}
            description={isEditing ? 'Modifica los datos de la notificación seleccionada.' : 'Ingresa los datos para crear una nueva notificación.'}
            size={size}
            isProcessing={processing}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Actualizar' : 'Guardar'}
            preventCloseOnClickOutside={true}
        >
            <form id="notificationForm" className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    <div>
                        <div className="mb-1">
                            <Label htmlFor="title" className={classNames({ 'text-destructive': errors.title })} required>
                                Título
                            </Label>
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                <MessageSquare size={18} />
                            </div>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={handleTitleChange}
                                className={classNames('pl-10', { 'border-destructive': errors.title })}
                                placeholder="Título de la notificación"
                            />
                        </div>
                        {errors.title && (
                            <p className="text-sm text-destructive mt-1">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <div className="mb-1">
                            <Label htmlFor="description" className={classNames({ 'text-destructive': errors.description })} required>
                                Descripción
                            </Label>
                        </div>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className={classNames({ 'border-destructive': errors.description })}
                            placeholder="Descripción detallada de la notificación"
                            rows={4}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive mt-1">{errors.description}</p>
                        )}
                    </div>

                    <div>
                        <div className="mb-1">
                            <Label htmlFor="type" className={classNames({ 'text-destructive': errors.type })} required>
                                Tipo
                            </Label>
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 z-10">
                                <AlertTriangle size={18} />
                            </div>
                            <Select
                                value={data.type}
                                onValueChange={(value: 'URGENT' | 'ALERT') => setData('type', value)}
                            >
                                <SelectTrigger className={classNames('pl-10', { 'border-destructive': errors.type })}>
                                    <SelectValue placeholder="Selecciona el tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="URGENT">URGENTE</SelectItem>
                                    <SelectItem value="ALERT">ALERTA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {errors.type && (
                            <p className="text-sm text-destructive mt-1">{errors.type}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="mb-1">
                                <Label htmlFor="start_date" className={classNames({ 'text-destructive': errors.start_date })} required>
                                    Fecha de inicio
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                    <CalendarDays size={18} />
                                </div>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className={classNames('pl-10', { 'border-destructive': errors.start_date })}
                                />
                            </div>
                            {errors.start_date && (
                                <p className="text-sm text-destructive mt-1">{errors.start_date}</p>
                            )}
                        </div>

                        <div>
                            <div className="mb-1">
                                <Label htmlFor="end_date" className={classNames({ 'text-destructive': errors.end_date })}>
                                    Fecha de fin
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                    <CalendarDays size={18} />
                                </div>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={data.end_date || ''}
                                    onChange={(e) => setData('end_date', e.target.value || null)}
                                    className={classNames('pl-10', { 'border-destructive': errors.end_date })}
                                />
                            </div>
                            {errors.end_date && (
                                <p className="text-sm text-destructive mt-1">{errors.end_date}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="status"
                            checked={data.status}
                            onCheckedChange={(checked) => setData('status', checked as boolean)}
                        />
                        <Label htmlFor="status">Activa</Label>
                    </div>
                </div>
            </form>
        </CrudModal>
    );
}
