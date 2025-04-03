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
import SaleModal from './SaleModal';
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

interface WebProduct {
    id: number;
    name: string;
    product: {
        id: number;
        name: string;
    };
}

interface Sale {
    id: number;
    date: string;
    cluster_quality: string;
    recharge_date: string;
    recharge_amount: number;
    accumulated_amount: number;
    commissionable_charge: boolean;
    action: string;
    user_id: number;
    webproduct_id: number;
    user: User;
    webProduct: WebProduct;
}

interface Props {
    sales: {
        data: Sale[];
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
    webProducts: WebProduct[];
    filters: {
        search?: string;
        page?: number;
        per_page?: number;
        date?: string;
        pdv?: string;
        zonificado?: string;
        cluster_quality?: string;
        action?: string;
    };
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Ventas',
        href: '/sales',
    },
];

const clusterQualities = ['A+', 'A', 'B', 'C'];
const actions = ['REGULAR', 'PREMIUM'];

export default function Index({ sales, users, webProducts, filters, total }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page?.toString() || '10');
    const [date, setDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [pdv, setPdv] = useState(filters.pdv || '');
    const [zonificado, setZonificado] = useState(filters.zonificado || '');
    const [clusterQuality, setClusterQuality] = useState(filters.cluster_quality || '');
    const [action, setAction] = useState(filters.action || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale | undefined>(undefined);
    const [modalSize, setModalSize] = useState<ModalSize>('md');
    const [selectedSales, setSelectedSales] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    const debouncedSearch = useDebounce(search, 300);
    const debouncedPdv = useDebounce(pdv, 300);
    const debouncedZonificado = useDebounce(zonificado, 300);

    useEffect(() => {
        router.reload({
            data: {
                search: debouncedSearch,
                per_page: perPage,
                date,
                pdv: debouncedPdv,
                zonificado: debouncedZonificado,
                cluster_quality: clusterQuality,
                action,
            },
            preserveState: true,
            preserveScroll: true,
            only: ['sales', 'filters', 'total']
        });
    }, [debouncedSearch, perPage, date, debouncedPdv, debouncedZonificado, clusterQuality, action]);

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        router.reload({
            data: {
                search,
                page: 1,
                per_page: value,
                date,
                pdv,
                zonificado,
                cluster_quality: clusterQuality,
                action,
            },
            preserveState: true,
            preserveScroll: true,
            only: ['sales', 'filters', 'total']
        });
    };

    const handleBulkDelete = async () => {
        if (selectedSales.length === 0) return;

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar ${selectedSales.length} ventas seleccionadas?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            router.delete('/sales/bulk-delete', {
                data: { ids: selectedSales },
                onSuccess: () => {
                    setSelectedSales([]);
                    setSelectAll(false);
                    Swal.fire({
                        title: 'Eliminado',
                        text: 'Las ventas seleccionadas han sido eliminadas correctamente.',
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                },
                onError: () => {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudieron eliminar las ventas. Intenta nuevamente.',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                },
                preserveScroll: true
            });
        }
    };

    const handleDelete = async (id: number, date: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la venta del ${new Date(date).toLocaleDateString()}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            router.delete(`/sales/${id}`, {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Eliminado',
                        text: `La venta del ${new Date(date).toLocaleDateString()} ha sido eliminada correctamente.`,
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                },
                onError: () => {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar la venta. Intenta nuevamente.',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                },
                preserveScroll: true
            });
        }
    };

    const openCreateModal = (size: ModalSize = 'lg') => {
        setSelectedSale(undefined);
        setModalSize(size);
        setIsModalOpen(true);
    };

    const openEditModal = (sale: Sale, size: ModalSize = 'md') => {
        setSelectedSale(sale);
        setModalSize(size);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSale(undefined);
    };

    return (
        <AppLayout
            title="Ventas"
            breadcrumbs={breadcrumbs}
        >
            <Head title="Ventas" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">Ventas</h1>
                        {selectedSales.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar ({selectedSales.length})
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => router.get('/sales/bulk')}
                            variant="outline"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Carga Masiva
                        </Button>
                        <Button onClick={() => openCreateModal()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Venta
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="space-y-4 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total de Ventas: {total.toLocaleString()}</CardTitle>
                        </CardHeader>
                    </Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <div>
                            <Label htmlFor="date">Fecha</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="cluster_quality">Calidad de Cluster</Label>
                            <Select
                                value={clusterQuality}
                                onValueChange={(value) => setClusterQuality(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione calidad" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Todos</SelectItem>
                                    {clusterQualities.map((quality) => (
                                        <SelectItem key={quality} value={quality}>
                                            {quality}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="action">Acción</Label>
                            <Select
                                value={action}
                                onValueChange={(value) => setAction(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione acción" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Todas</SelectItem>
                                    {actions.map((act) => (
                                        <SelectItem key={act} value={act}>
                                            {act}
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
                        <div>
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

                {/* Vista móvil: Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {sales.data.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No se encontraron ventas</p>
                        </div>
                    ) : (
                        sales.data.map((sale) => (
                            <Card key={sale.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-bold">
                                        {new Date(sale.date).toLocaleDateString()}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                            sale.cluster_quality === 'A+' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                            sale.cluster_quality === 'A' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                            sale.cluster_quality === 'B' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                        }`}>
                                            {sale.cluster_quality}
                                        </span>
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                            sale.action === 'PREMIUM' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                                        }`}>
                                            {sale.action}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm">
                                            <span className="font-medium">PDV:</span>{' '}
                                            {sale.user.name} ({sale.user.dni})
                                        </p>
                                        {sale.user.zonificador && (
                                            <p className="text-sm">
                                                <span className="font-medium">Zonificado:</span>{' '}
                                                {sale.user.zonificador.circuit?.zonal.short_name} {sale.user.zonificador.name}
                                            </p>
                                        )}
                                        <p className="text-sm">
                                            <span className="font-medium">Producto:</span>{' '}
                                            {sale.webProduct.product.name} - {sale.webProduct.name}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Monto de recarga:</span>{' '}
                                            {sale.recharge_amount.toLocaleString()}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Monto acumulado:</span>{' '}
                                            {sale.accumulated_amount.toLocaleString()}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Cargo comisionable:</span>{' '}
                                            {sale.commissionable_charge ? 'Sí' : 'No'}
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="yellow"
                                                size="sm"
                                                onClick={() => openEditModal(sale)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Editar venta</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(sale.id, sale.date)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Eliminar venta</p>
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
                                                setSelectedSales(sales.data.map(sale => sale.id));
                                            } else {
                                                setSelectedSales([]);
                                            }
                                        }}
                                    />
                                </TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Calidad</TableHead>
                                <TableHead>Acción</TableHead>
                                <TableHead>PDV</TableHead>
                                <TableHead>Zonificado</TableHead>
                                <TableHead>Producto</TableHead>
                                <TableHead>Monto Recarga</TableHead>
                                <TableHead>Monto Acumulado</TableHead>
                                <TableHead>Comisionable</TableHead>
                                <TableHead className="w-[100px] text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={11}
                                        className="text-center py-6"
                                    >
                                        No se encontraron ventas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sales.data.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedSales.includes(sale.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedSales([...selectedSales, sale.id]);
                                                        if (selectedSales.length + 1 === sales.data.length) {
                                                            setSelectAll(true);
                                                        }
                                                    } else {
                                                        setSelectedSales(selectedSales.filter(id => id !== sale.id));
                                                        setSelectAll(false);
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                sale.cluster_quality === 'A+' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                sale.cluster_quality === 'A' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                sale.cluster_quality === 'B' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                                {sale.cluster_quality}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                sale.action === 'PREMIUM' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                                            }`}>
                                                {sale.action}
                                            </span>
                                        </TableCell>
                                        <TableCell>{sale.user.name} ({sale.user.dni})</TableCell>
                                        <TableCell>
                                            {sale.user.zonificador && (
                                                <span>
                                                    {sale.user.zonificador.circuit?.zonal.short_name} {sale.user.zonificador.name}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{sale.webProduct.product.name} - {sale.webProduct.name}</TableCell>
                                        <TableCell>{sale.recharge_amount.toLocaleString()}</TableCell>
                                        <TableCell>{sale.accumulated_amount.toLocaleString()}</TableCell>
                                        <TableCell>{sale.commissionable_charge ? 'Sí' : 'No'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="yellow"
                                                            size="icon"
                                                            onClick={() => openEditModal(sale)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Editar venta</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghostRed"
                                                            size="icon"
                                                            onClick={() => handleDelete(sale.id, sale.date)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Eliminar venta</p>
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
                {sales.data.length > 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {sales.from} a {sales.to} de {sales.total} registros
                        </div>
                        <Pagination links={sales.links} className="mt-0" />
                    </div>
                )}

                {/* Modal de Venta */}
                <SaleModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    sale={selectedSale}
                    users={users}
                    webProducts={webProducts}
                    size={modalSize}
                />
            </div>
        </AppLayout>
    );
}
