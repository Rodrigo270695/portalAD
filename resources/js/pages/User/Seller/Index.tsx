import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, Users } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Swal from 'sweetalert2';
import SellerModal from './SellerModal';
import { ModalSize } from '@/components/ui/crud-modal';

interface User {
    id: number;
    name: string;
}

interface Seller {
    id: number;
    name: string | null;
    dni: string;
    cel: string | null;
    pdv_id: number;
    pdv?: User;
}

interface Props {
    sellers: {
        data: Seller[];
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
    pdv: User;
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
        title: 'Usuarios',
        href: '/users',
    },
    {
        title: 'Vendedores',
        href: '#',
    },
];

export default function Index({ sellers, pdv, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page?.toString() || '10');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState<Seller | undefined>(undefined);
    const [modalSize, setModalSize] = useState<ModalSize>('md');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search !== filters.search) {
                // Mantener la página actual si solo cambia la búsqueda
                const currentPage = filters.page || sellers.current_page;
                router.get(`/users/${pdv.id}/sellers`, {
                    search,
                    page: currentPage,
                    per_page: perPage
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['sellers', 'filters']
                });
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, filters.search, filters.page, sellers.current_page, perPage, pdv.id]);

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        // Al cambiar registros por página, volvemos a la página 1
        router.get(`/users/${pdv.id}/sellers`, {
            search,
            page: 1,
            per_page: value
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['sellers', 'filters']
        });
    };

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Realmente deseas eliminar al vendedor "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/sellers/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Eliminado',
                            text: `El vendedor "${name}" ha sido eliminado correctamente.`,
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Error',
                            text: 'No se pudo eliminar el vendedor. Intenta nuevamente.',
                            icon: 'error',
                            confirmButtonText: 'Aceptar'
                        });
                    }
                });
            }
        });
    };

    const openCreateModal = (size: ModalSize = 'md') => {
        setSelectedSeller(undefined);
        setModalSize(size);
        setIsModalOpen(true);
    };

    const openEditModal = (seller: Seller, size: ModalSize = 'md') => {
        setSelectedSeller(seller);
        setModalSize(size);
        setIsModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Vendedores de ${pdv.name}`} />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Vendedores</h1>
                        <p className="text-muted-foreground">
                            Administra los vendedores de {pdv.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.get('/users')}
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <Button onClick={() => openCreateModal()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Vendedor
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Input
                                placeholder="Buscar vendedores..."
                                value={search}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                className="pl-8"
                            />
                            <Search className="w-4 h-4 absolute left-2.5 top-3 text-muted-foreground" />
                        </div>
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
                                <SelectItem value="25">25 registros</SelectItem>
                                <SelectItem value="50">50 registros</SelectItem>
                                <SelectItem value="100">100 registros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Vista móvil: Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {sellers.data.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No se encontraron vendedores</p>
                        </div>
                    ) : (
                        sellers.data.map((seller) => (
                            <Card key={seller.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-bold">
                                        {seller.name || 'Sin nombre'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm">
                                            <span className="font-medium">DNI:</span>{' '}
                                            {seller.dni}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Celular:</span>{' '}
                                            {seller.cel || 'No registrado'}
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="yellow"
                                                size="sm"
                                                onClick={() => openEditModal(seller)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Editar vendedor</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(seller.id, seller.name || 'Sin nombre')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Eliminar vendedor</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                {/* Vista escritorio: Tabla */}
                <div className="hidden md:block">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>DNI</TableHead>
                                    <TableHead>Celular</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sellers.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center h-32"
                                        >
                                            No se encontraron vendedores
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sellers.data.map((seller) => (
                                        <TableRow key={seller.id}>
                                            <TableCell>{seller.name || 'Sin nombre'}</TableCell>
                                            <TableCell>{seller.dni}</TableCell>
                                            <TableCell>{seller.cel || 'No registrado'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghostYellow"
                                                                size="icon"
                                                                onClick={() => openEditModal(seller)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Editar vendedor</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghostRed"
                                                                size="icon"
                                                                onClick={() => handleDelete(seller.id, seller.name || 'Sin nombre')}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Eliminar vendedor</p>
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

                {/* Paginación y selector de registros por página */}
                {sellers.data.length > 0 && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Mostrando {sellers.from} a {sellers.to} de {sellers.total} registros
                            </span>
                        </div>
                        <Pagination links={sellers.links} />
                    </div>
                )}
            </div>

            <SellerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                seller={selectedSeller}
                size={modalSize}
                pdv={pdv}
            />
        </AppLayout>
    );
}
