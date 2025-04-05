import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import ShareModal from './ShareModal';
import { ModalSize } from '@/components/ui/crud-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Swal from 'sweetalert2';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDebounce } from '@/hooks/useDebounce';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

interface Circuit {
    id: number;
    name: string;
    zonal: {
        id: number;
        name: string;
        short_name: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    dni: string;
    circuit: Circuit;
    zonificador?: User;
}

interface Share {
    id: number;
    year: number;
    month: number;
    amount: number;
    user_id: number;
    user: User;
}

interface Props {
    shares: {
        data: Share[];
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
    users: User[];
    filters: {
        search?: string;
        page?: number;
        per_page?: number;
        year?: number;
        month?: number;
        pdv?: string;
        zonificado?: string;
    };
    years: number[];
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Cuotas',
        href: '/shares',
    },
];

const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function Index({ shares, users, filters, years, total }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page?.toString() || '10');
    const [year, setYear] = useState(filters.year?.toString() || new Date().getFullYear().toString());
    const [month, setMonth] = useState(filters.month?.toString() || (new Date().getMonth() + 1).toString());
    const [pdv, setPdv] = useState(filters.pdv || '');
    const [zonificado, setZonificado] = useState(filters.zonificado || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedShare, setSelectedShare] = useState<Share | undefined>(undefined);
    const [modalSize, setModalSize] = useState<ModalSize>('md');
    const [selectedShares, setSelectedShares] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    const debouncedSearch = useDebounce(search, 300);
    const debouncedPdv = useDebounce(pdv, 300);
    const debouncedZonificado = useDebounce(zonificado, 300);

    useEffect(() => {
        router.reload({
            data: {
                search: debouncedSearch,
                per_page: perPage,
                year,
                month,
                pdv: debouncedPdv,
                zonificado: debouncedZonificado,
            },
            preserveState: true,
            preserveScroll: true,
            only: ['shares', 'filters', 'total']
        });
    }, [debouncedSearch, perPage, year, month, debouncedPdv, debouncedZonificado]);

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        router.reload({
            data: {
                search,
                page: 1,
                per_page: value,
                year,
                month,
                pdv,
                zonificado,
            },
            preserveState: true,
            preserveScroll: true,
            only: ['shares', 'filters', 'total']
        });
    };

    const handleBulkDelete = async () => {
        if (selectedShares.length === 0) return;

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar ${selectedShares.length} cuotas seleccionadas?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            router.delete('/shares/bulk-delete', {
                data: { ids: selectedShares },
                onSuccess: () => {
                    setSelectedShares([]);
                    setSelectAll(false);
                    Swal.fire({
                        title: 'Eliminado',
                        text: 'Las cuotas seleccionadas han sido eliminadas correctamente.',
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                },
                onError: () => {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudieron eliminar las cuotas. Intenta nuevamente.',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                },
                preserveScroll: true
            });
        }
    };

    const handleDelete = async (id: number, year: number, month: number) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la cuota de ${monthNames[month - 1]} ${year}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            router.delete(`/shares/${id}`, {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Eliminado',
                        text: `La cuota de ${monthNames[month - 1]} ${year} ha sido eliminada correctamente.`,
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                },
                onError: () => {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar la cuota. Intenta nuevamente.',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                },
                preserveScroll: true
            });
        }
    };

    const openCreateModal = (size: ModalSize = 'lg') => {
        setSelectedShare(undefined);
        setModalSize(size);
        setIsModalOpen(true);
    };

    const openEditModal = (share: Share, size: ModalSize = 'md') => {
        setSelectedShare(share);
        setModalSize(size);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedShare(undefined);
    };

    return (
        <AppLayout
            title="Cuotas"
            breadcrumbs={breadcrumbs}
        >
            <Head title="Cuotas" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">Cuotas</h1>
                        {selectedShares.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar ({selectedShares.length})
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => router.get('/shares/bulk')}
                            variant="outline"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Carga Masiva
                        </Button>
                        <Button onClick={() => openCreateModal()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Cuota
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="space-y-4 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total de Cuotas: {total.toLocaleString()}</CardTitle>
                        </CardHeader>
                    </Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <div>
                            <Label htmlFor="year">Año</Label>
                            <Select
                                value={year}
                                onValueChange={(value) => setYear(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione año" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="month">Mes</Label>
                            <Select
                                value={month}
                                onValueChange={(value) => setMonth(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione mes" />
                                </SelectTrigger>
                                <SelectContent>
                                    {monthNames.map((name, index) => (
                                        <SelectItem
                                            key={index + 1}
                                            value={(index + 1).toString()}
                                        >
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="pdv">PDV</Label>
                            <Input
                                type="text"
                                value={pdv}
                                onChange={(e) => setPdv(e.target.value)}
                                placeholder="Buscar por PDV..."
                            />
                        </div>
                        <div>
                            <Label htmlFor="zonificado">Zonificado</Label>
                            <Input
                                type="text"
                                value={zonificado}
                                onChange={(e) => setZonificado(e.target.value)}
                                placeholder="Buscar por zonificado..."
                            />
                        </div>
                        <div className="xl:col-span-2">
                            <Label htmlFor="search">Búsqueda general</Label>
                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
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
                                <SelectItem value="1000">1,000 registros</SelectItem>
                                <SelectItem value="5000">5,000 registros</SelectItem>
                                <SelectItem value="10000">10,000 registros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Vista móvil: Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {shares.data.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No se encontraron cuotas</p>
                        </div>
                    ) : (
                        shares.data.map((share) => (
                            <Card key={share.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-bold">
                                        {monthNames[share.month - 1]} {share.year}
                                    </CardTitle>
                                    <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                        {share.amount.toLocaleString()}
                                    </span>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm">
                                            <span className="font-medium">PDV:</span>{' '}
                                            {share.user.name} ({share.user.dni})
                                        </p>
                                        {share.user.zonificador && (
                                            <p className="text-sm">
                                                <span className="font-medium">Zonificado:</span>{' '}
                                                {share.user.zonificador.circuit?.zonal.short_name} {share.user.zonificador.name}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="yellow"
                                                size="sm"
                                                onClick={() => openEditModal(share)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Editar cuota</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(share.id, share.year, share.month)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Eliminar cuota</p>
                                        </TooltipContent>
                                    </Tooltip>
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
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={selectAll}
                                        onCheckedChange={(checked) => {
                                            setSelectAll(!!checked);
                                            if (checked) {
                                                setSelectedShares(shares.data.map(share => share.id));
                                            } else {
                                                setSelectedShares([]);
                                            }
                                        }}
                                    />
                                </TableHead>
                                <TableHead>Año</TableHead>
                                <TableHead>Mes</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>PDV</TableHead>
                                <TableHead>Zonificado</TableHead>
                                <TableHead className="w-[100px] text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shares.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center py-6"
                                    >
                                        No se encontraron cuotas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                shares.data.map((share) => (
                                    <TableRow key={share.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedShares.includes(share.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedShares([...selectedShares, share.id]);
                                                        if (selectedShares.length + 1 === shares.data.length) {
                                                            setSelectAll(true);
                                                        }
                                                    } else {
                                                        setSelectedShares(selectedShares.filter(id => id !== share.id));
                                                        setSelectAll(false);
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{share.year}</TableCell>
                                        <TableCell>{monthNames[share.month - 1]}</TableCell>
                                        <TableCell>{share.amount.toLocaleString()}</TableCell>
                                        <TableCell>{share.user.name} ({share.user.dni})</TableCell>
                                        <TableCell>
                                            {share.user.zonificador && (
                                                <span>
                                                    {share.user.zonificador.circuit?.zonal.short_name} {share.user.zonificador.name}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghostRed"
                                                                size="icon"
                                                                onClick={() => handleDelete(share.id, share.year, share.month)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Eliminar cuota</p>
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

                {/* Paginación */}
                {shares.data.length > 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {shares.from} a {shares.to} de {shares.total} registros
                        </div>
                        <Pagination links={shares.links} className="mt-0" />
                    </div>
                )}

                {/* Modal de Cuota */}
                <ShareModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    share={selectedShare}
                    users={users}
                    size={modalSize}
                />
            </div>
        </AppLayout>
    );
}
