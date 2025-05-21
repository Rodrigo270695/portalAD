import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationModal from './NotificationModal';
import { ModalSize } from '@/components/ui/crud-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Swal from 'sweetalert2';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

interface Props {
    notifications: {
        data: Notification[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
        from: number;
        to: number;
    };
    filters: {
        search: string;
        page?: number;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Notificaciones',
        href: '/notifications',
    },
];

export default function Index({ notifications, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page?.toString() || '10');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | undefined>(undefined);
    const [modalSize, setModalSize] = useState<ModalSize>('lg');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search !== filters.search) {
                const currentPage = filters.page || notifications.current_page;
                router.get('/notifications', {
                    search,
                    page: currentPage,
                    per_page: perPage
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['notifications', 'filters']
                });
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, filters.search, filters.page, notifications.current_page, perPage]);

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        router.get('/notifications', {
            search,
            page: 1,
            per_page: value
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['notifications', 'filters']
        });
    };

    const handleDelete = (id: number, title: string) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Realmente deseas eliminar la notificación "${title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/notifications/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Eliminada',
                            text: `La notificación "${title}" ha sido eliminada correctamente.`,
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Error',
                            text: 'No se pudo eliminar la notificación. Intenta nuevamente.',
                            icon: 'error',
                            confirmButtonText: 'Aceptar'
                        });
                    }
                });
            }
        });
    };

    const openCreateModal = (size: ModalSize = 'lg') => {
        setSelectedNotification(undefined);
        setModalSize(size);
        setIsModalOpen(true);
    };

    const openEditModal = (notification: Notification, size: ModalSize = 'lg') => {
        setSelectedNotification(notification);
        setModalSize(size);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedNotification(undefined);
    };

    const getTypeIcon = (type: 'URGENT' | 'ALERT') => {
        return type === 'URGENT' ? (
            <AlertOctagon className="h-4 w-4 text-red-500" />
        ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
        );
    };

    const getTypeClass = (type: 'URGENT' | 'ALERT') => {
        return type === 'URGENT'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notificaciones" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Notificaciones</h1>
                    <Button onClick={() => openCreateModal()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Notificación
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        <Input
                            placeholder="Buscar notificaciones..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <Select
                            value={perPage}
                            onValueChange={handlePerPageChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Registros por página" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 registros</SelectItem>
                                <SelectItem value="20">20 registros</SelectItem>
                                <SelectItem value="50">50 registros</SelectItem>
                                <SelectItem value="100">100 registros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Vista móvil: Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {notifications.data.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No se encontraron notificaciones</p>
                        </div>
                    ) : (
                        notifications.data.map((notification) => (
                            <Card key={notification.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        {getTypeIcon(notification.type)}
                                        {notification.title}
                                    </CardTitle>
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                            notification.status
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                        }`}
                                    >
                                        {notification.status ? 'Activa' : 'Inactiva'}
                                    </span>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {notification.description}
                                    </p>
                                    <div className="text-sm text-muted-foreground">
                                        <p>Inicio: {format(new Date(notification.start_date), 'PPP', { locale: es })}</p>
                                        {notification.end_date && (
                                            <p>Fin: {format(new Date(notification.end_date), 'PPP', { locale: es })}</p>
                                        )}
                                    </div>
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getTypeClass(notification.type)}`}>
                                        {notification.type}
                                    </span>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Button
                                        variant="yellow"
                                        size="sm"
                                        onClick={() => openEditModal(notification)}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(notification.id, notification.title)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                {/* Vista escritorio: Tabla */}
                <div className="hidden md:block rounded-lg border border-sidebar-border/70">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Fecha Inicio</TableHead>
                                <TableHead>Fecha Fin</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-[100px] text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notifications.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-6">
                                        No se encontraron notificaciones
                                    </TableCell>
                                </TableRow>
                            ) : (
                                notifications.data.map((notification) => (
                                    <TableRow key={notification.id}>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${getTypeClass(notification.type)}`}>
                                                {getTypeIcon(notification.type)}
                                                {notification.type}
                                            </span>
                                        </TableCell>
                                        <TableCell>{notification.title}</TableCell>
                                        <TableCell className="max-w-xs">
                                            <p className="truncate">{notification.description}</p>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(notification.start_date), 'PPP', { locale: es })}
                                        </TableCell>
                                        <TableCell>
                                            {notification.end_date
                                                ? format(new Date(notification.end_date), 'PPP', { locale: es })
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                    notification.status
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}
                                            >
                                                {notification.status ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghostYellow"
                                                            size="icon"
                                                            onClick={() => openEditModal(notification)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Editar notificación</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghostRed"
                                                            size="icon"
                                                            onClick={() => handleDelete(notification.id, notification.title)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Eliminar notificación</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {notifications.data.length > 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {notifications.from} a {notifications.to} de {notifications.total} registros
                        </div>
                        <Pagination links={notifications.links} className="mt-0" />
                    </div>
                )}
            </div>

            <NotificationModal
                isOpen={isModalOpen}
                onClose={closeModal}
                notification={selectedNotification}
                size={modalSize}
            />
        </AppLayout>
    );
}
