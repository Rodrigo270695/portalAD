import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import CampaignModal from './CampaignModal';
import { ModalSize } from '@/components/ui/crud-modal';
import Swal from 'sweetalert2';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Campaign {
    id: number;
    name: string;
    description: string;
    type: 'Esquema' | 'Acelerador' | 'Información';
    image: string;
    image_url: string;
    date_start: string;
    date_end: string;
    date_start_display: string;
    date_end_display: string;
    status: boolean;
}

interface Props {
    campaigns: {
        data: Campaign[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        from: number;
        to: number;
        total: number;
    };
    filters: {
        year: string;
        month: string;
        page: number;
        per_page: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Campañas',
        href: '/campaigns',
    },
];

const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i)
}));

export default function Index({ campaigns, filters }: Props) {
    const [perPage, setPerPage] = useState(filters.per_page?.toString() || '10');
    const [year, setYear] = useState(filters.year || '');
    const [month, setMonth] = useState(filters.month || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [modalSize, setModalSize] = useState<ModalSize>('lg');

    useEffect(() => {
        router.get(
            '/campaigns',
            {
                year,
                month,
                per_page: perPage,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    }, [year, month, perPage]);

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        router.get(
            '/campaigns',
            {
                year,
                month,
                per_page: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Realmente deseas eliminar la campaña "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/campaigns/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Eliminada',
                            text: `La campaña "${name}" ha sido eliminada correctamente.`,
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Error',
                            text: 'No se pudo eliminar la campaña.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    };

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const openCreateModal = (size: ModalSize = 'lg') => {
        setSelectedCampaign(null);
        setModalSize(size);
        setIsModalOpen(true);
    };

    const openEditModal = (campaign: Campaign, size: ModalSize = 'lg') => {
        setSelectedCampaign(campaign);
        setModalSize(size);
        setIsModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Campañas" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Campañas</h2>
                    <Button onClick={() => openCreateModal()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Campaña
                    </Button>
                </div>
                <div className="mb-4 flex flex-col sm:flex-row gap-4">
                    <div className="flex gap-4">
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Año" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {years.map((y) => (
                                    <SelectItem key={y.value} value={y.value}>
                                        {y.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Mes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {months.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={perPage} onValueChange={handlePerPageChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Registros por página" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 por página</SelectItem>
                                <SelectItem value="25">25 por página</SelectItem>
                                <SelectItem value="50">50 por página</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Vista de tabla para pantallas grandes */}
                <div className="hidden md:block">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Imagen</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Fecha Inicio</TableHead>
                                    <TableHead>Fecha Fin</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center">
                                            No hay campañas registradas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    campaigns.data.map((campaign) => (
                                        <TableRow key={campaign.id}>
                                            <TableCell>
                                                <img
                                                    src={campaign.image_url}
                                                    alt={campaign.name}
                                                    className="w-12 h-12 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => handleImageClick(campaign.image_url)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {campaign.name}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`}>
                                                    {campaign.type}
                                                </span>
                                            </TableCell>
                                            <TableCell>{campaign.date_start_display}</TableCell>
                                            <TableCell>{campaign.date_end_display}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                        campaign.status
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}
                                                >
                                                    {campaign.status ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghostYellow"
                                                                size="icon"
                                                                onClick={() => openEditModal(campaign)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Editar campaña</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghostRed"
                                                                size="icon"
                                                                onClick={() => handleDelete(campaign.id, campaign.name)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Eliminar campaña</p>
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
                </div>

                {/* Vista de cards para pantallas pequeñas */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {campaigns.data.length === 0 ? (
                        <div className="text-center p-4 border rounded-lg">
                            No hay campañas registradas
                        </div>
                    ) : (
                        campaigns.data.map((campaign) => (
                            <div key={campaign.id} className="bg-card border rounded-lg shadow-sm">
                                <div className="relative">
                                    <img
                                        src={campaign.image_url}
                                        alt={campaign.name}
                                        className="w-full h-48 object-cover rounded-t-lg cursor-pointer"
                                        onClick={() => handleImageClick(campaign.image_url)}
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <Button
                                            variant="ghostYellow"
                                            size="icon"
                                            className="bg-white/80 backdrop-blur-sm"
                                            onClick={() => openEditModal(campaign)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghostRed"
                                            size="icon"
                                            className="bg-white/80 backdrop-blur-sm"
                                            onClick={() => handleDelete(campaign.id, campaign.name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            {campaign.type}
                                        </span>
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                campaign.status
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}
                                        >
                                            {campaign.status ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Inicio:</span>
                                            <br />
                                            {campaign.date_start_display}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Fin:</span>
                                            <br />
                                            {campaign.date_end_display}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {campaigns.data.length > 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {campaigns.from} a {campaigns.to} de {campaigns.total} registros
                        </div>
                        <Pagination links={campaigns.links} className="mt-0" />
                    </div>
                )}
            </div>

            {/* Modal para ver imagen en grande */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-4xl p-0">
                    <img
                        src={selectedImage || ''}
                        alt="Imagen de campaña"
                        className="w-full h-auto rounded-lg"
                    />
                </DialogContent>
            </Dialog>

            <CampaignModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedCampaign(null);
                }}
                campaign={selectedCampaign || undefined}
                size={modalSize}
            />
        </AppLayout>
    );
}
