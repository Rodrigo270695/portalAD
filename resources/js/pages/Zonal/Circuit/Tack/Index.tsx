import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import TackModal from './TackModal';
import { ModalSize } from '@/components/ui/crud-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Swal from 'sweetalert2';

interface Circuit {
    id: number;
    name: string;
}

interface Tack {
    id: number;
    name: string;
    active: boolean;
    circuit_id: number;
    circuit?: Circuit;
}

interface Props {
    tacks: {
        data: Tack[];
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
    circuit: Circuit;
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
        title: 'Circuitos',
        href: '/circuits',
    },
    {
        title: 'Rutas',
        href: '#',
    },
];

export default function Index({ tacks, circuit, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page?.toString() || '10');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTack, setSelectedTack] = useState<Tack | undefined>(undefined);
    const [modalSize, setModalSize] = useState<ModalSize>('md');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search !== filters.search) {
                // Mantener la página actual si solo cambia la búsqueda
                const currentPage = filters.page || tacks.current_page;
                router.get(`/circuits/${circuit.id}/tacks`, {
                    search,
                    page: currentPage,
                    per_page: perPage
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['tacks', 'filters']
                });
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, filters.search, filters.page, tacks.current_page, perPage, circuit.id]);

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        // Al cambiar registros por página, volvemos a la página 1
        router.get(`/circuits/${circuit.id}/tacks`, {
            search,
            page: 1,
            per_page: value
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['tacks', 'filters']
        });
    };

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Realmente deseas eliminar la ruta "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/tacks/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Eliminado',
                            text: `La ruta "${name}" ha sido eliminada correctamente.`,
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Error',
                            text: 'No se pudo eliminar la ruta. Intenta nuevamente.',
                            icon: 'error',
                            confirmButtonText: 'Aceptar'
                        });
                    }
                });
            }
        });
    };

    const openCreateModal = (size: ModalSize = 'md') => {
        setSelectedTack(undefined);
        setModalSize(size);
        setIsModalOpen(true);
    };

    const openEditModal = (tack: Tack, size: ModalSize = 'md') => {
        setSelectedTack(tack);
        setModalSize(size);
        setIsModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rutas" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Rutas</h1>
                        <p className="text-muted-foreground">
                            Administra las rutas del circuito {circuit.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.get('/circuits')}
                        >
                            <MapPin className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <Button onClick={() => openCreateModal()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Ruta
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        <Input
                            placeholder="Buscar rutas..."
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
                    {tacks.data.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No se encontraron rutas</p>
                        </div>
                    ) : (
                        tacks.data.map((tack) => (
                            <Card key={tack.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-bold">
                                        {tack.name}
                                    </CardTitle>
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                            tack.active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                        }`}
                                    >
                                        {tack.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </CardHeader>
                                <CardFooter className="flex justify-end gap-2">
                                    <Button
                                        variant="yellow"
                                        size="sm"
                                        onClick={() => openEditModal(tack)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(tack.id, tack.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                {/* Vista desktop: Tabla */}
                <div className="hidden md:block rounded-lg border border-sidebar-border/70">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-[100px] text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tacks.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-center py-6"
                                    >
                                        No se encontraron rutas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tacks.data.map((tack) => (
                                    <TableRow key={tack.id}>
                                        <TableCell>{tack.name}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                    tack.active
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}
                                            >
                                                {tack.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghostYellow"
                                                    size="icon"
                                                    onClick={() => openEditModal(tack)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghostRed"
                                                    size="icon"
                                                    onClick={() => handleDelete(tack.id, tack.name)}
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

                {/* Paginación */}
                {tacks.data.length > 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {tacks.from} a {tacks.to} de {tacks.total} registros
                        </div>
                        <Pagination links={tacks.links} className="mt-0" />
                    </div>
                )}
            </div>

            <TackModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                tack={selectedTack}
                size={modalSize}
                circuit_id={circuit.id}
            />
        </AppLayout>
    );
}
