import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ZonalModal from './ZonalModal';
import { ModalSize } from '@/components/ui/crud-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Swal from 'sweetalert2';

interface Zonal {
    id: number;
    name: string;
    short_name: string;
    active: boolean;
}

interface Props {
    zonals: {
        data: Zonal[];
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
        title: 'Zonales',
        href: '/zonals',
    },
];

export default function Index({ zonals, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page?.toString() || '10');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedZonal, setSelectedZonal] = useState<Zonal | undefined>(undefined);
    const [modalSize, setModalSize] = useState<ModalSize>('md');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search !== filters.search) {
                // Mantener la página actual si solo cambia la búsqueda
                const currentPage = filters.page || zonals.current_page;
                router.get('/zonals', {
                    search,
                    page: currentPage,
                    per_page: perPage
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['zonals', 'filters']
                });
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, filters.search, filters.page, zonals.current_page, perPage]);

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        // Al cambiar registros por página, volvemos a la página 1
        router.get('/zonals', {
            search,
            page: 1,
            per_page: value
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['zonals', 'filters']
        });
    };

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Realmente deseas eliminar el zonal "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/zonals/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Eliminado',
                            text: `El zonal "${name}" ha sido eliminado correctamente.`,
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Error',
                            text: 'No se pudo eliminar el zonal. Intenta nuevamente.',
                            icon: 'error',
                            confirmButtonText: 'Aceptar'
                        });
                    }
                });
            }
        });
    };

    const openCreateModal = (size: ModalSize = 'md') => {
        setSelectedZonal(undefined);
        setModalSize(size);
        setIsModalOpen(true);
    };

    const openEditModal = (zonal: Zonal, size: ModalSize = 'md') => {
        setSelectedZonal(zonal);
        setModalSize(size);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedZonal(undefined);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zonales" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Zonales</h1>
                    <Button onClick={() => openCreateModal()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Zonal
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        <Input
                            placeholder="Buscar zonales..."
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
                    {zonals.data.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No se encontraron zonales</p>
                        </div>
                    ) : (
                        zonals.data.map((zonal) => (
                            <Card key={zonal.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-bold">
                                        {zonal.name}
                                    </CardTitle>
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                            zonal.active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                        }`}
                                    >
                                        {zonal.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Nombre corto: <span className="font-medium">{zonal.short_name}</span>
                                    </p>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Button
                                        variant="yellow"
                                        size="sm"
                                        onClick={() => openEditModal(zonal)}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(zonal.id, zonal.name)}
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
                                <TableHead>Nombre</TableHead>
                                <TableHead>Nombre Corto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-[100px] text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {zonals.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-6">
                                        No se encontraron zonales
                                    </TableCell>
                                </TableRow>
                            ) : (
                                zonals.data.map((zonal) => (
                                    <TableRow key={zonal.id}>
                                        <TableCell>{zonal.name}</TableCell>
                                        <TableCell>{zonal.short_name}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                    zonal.active
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}
                                            >
                                                {zonal.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghostYellow"
                                                    size="icon"
                                                    onClick={() => openEditModal(zonal)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghostRed"
                                                    size="icon"
                                                    onClick={() => handleDelete(zonal.id, zonal.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {zonals.data.length > 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {zonals.from} a {zonals.to} de {zonals.total} registros
                        </div>
                        <Pagination links={zonals.links} className="mt-0" />
                    </div>
                )}
            </div>

            <ZonalModal
                isOpen={isModalOpen}
                onClose={closeModal}
                zonal={selectedZonal}
                size={modalSize}
            />
        </AppLayout>
    );
}
