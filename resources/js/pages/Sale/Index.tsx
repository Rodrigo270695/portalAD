import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { Head, router, Link } from '@inertiajs/react';
import { Edit, Download, Trash2, Upload, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import SaleModal, { type Sale as ModalSale } from './SaleModal';
import { ModalSize } from '@/components/ui/crud-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Swal from 'sweetalert2';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDebounce } from '@/hooks/useDebounce';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Calendar } from 'lucide-react';

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

interface Product {
    id: number;
    name: string;
    description?: string;
    active?: boolean;
    created_at?: string;
    updated_at?: string;
}

type WebProduct = {
    id: number;
    name: string;
    description?: string;
    product_id: number;
    product?: {
        id: number;
        name: string;
    } | null;
    created_at?: string;
    updated_at?: string;
};

type Sale = Omit<ModalSale, 'webproduct'> & {
    webproduct: {
        id: number;
        name: string;
        product?: {
            id: number;
            name: string;
        } | null;
    };
};

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
        page?: number;
        per_page?: number;
        date?: string;
        startDate?: string;
        endDate?: string;
        pdv?: string;
        zonificado?: string;
        product?: string;
        webproduct?: string;
        commissionable?: string;
    };
    totals: {
        recharge_amount: number;
        accumulated_amount: number;
        commissionable_charges: number;
    };
}

const getLimaDate = () => {
    const date = new Date();
    return new Date(date.toLocaleString('en-US', { timeZone: 'America/Lima' })).toISOString().split('T')[0];
};

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

export default function Index({ sales, users, webProducts, filters, totals }: Props) {
    const [perPage, setPerPage] = useState(filters.per_page?.toString() || '10');
    const [startDate, setStartDate] = useState(filters.startDate || getLimaDate());
    const [endDate, setEndDate] = useState(filters.endDate || getLimaDate());
    const [pdv, setPdv] = useState(filters.pdv || '');
    const [zonificado, setZonificado] = useState(filters.zonificado || '');
    const [product, setProduct] = useState(filters.product || 'all');
    const [webproduct, setWebproduct] = useState(filters.webproduct || 'all');
    const [commissionable, setCommissionable] = useState(filters.commissionable || 'all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<ModalSale | undefined>(undefined);
    const [modalSize, setModalSize] = useState<ModalSize>('md');
    const [selectedSales, setSelectedSales] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const exportTimeoutRef = useRef<number | null>(null);
    const [selectAll, setSelectAll] = useState(false);

    const debouncedPdv = useDebounce(pdv, 300);
    const debouncedZonificado = useDebounce(zonificado, 300);

    const handleFilters = () => {
        router.visit('/sales', {
            data: {
                page: 1,
                per_page: perPage,
                startDate,
                endDate,
                pdv: debouncedPdv,
                zonificado: debouncedZonificado,
                product,
                webproduct,
                commissionable,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        handleFilters();
    }, [startDate, endDate, debouncedPdv, debouncedZonificado, product, webproduct, commissionable, perPage]);

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
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
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" asChild>
                            <Link href="/sales/bulk">
                                <Upload className="mr-2 h-4 w-4" />
                                Carga Masiva
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 hover:border-green-300"
                            onClick={() => {
                                // Limpiar cualquier timeout anterior si existe
                                if (exportTimeoutRef.current) {
                                    clearTimeout(exportTimeoutRef.current);
                                }

                                setIsExporting(true);

                                // Crear la URL de exportación
                                const exportUrl = `/sales/export?startDate=${startDate}&endDate=${endDate}&pdv=${pdv}&zonificado=${zonificado}&product=${product}&webproduct=${webproduct}&commissionable=${commissionable}`;

                                // Usar XMLHttpRequest para monitorear el progreso de la descarga
                                const xhr = new XMLHttpRequest();
                                xhr.open('GET', exportUrl, true);
                                xhr.responseType = 'blob';

                                // Configurar un timeout de seguridad (15 segundos)
                                exportTimeoutRef.current = window.setTimeout(() => {
                                    setIsExporting(false);
                                    console.log('Timeout de seguridad activado para la exportación');
                                }, 15000);

                                xhr.onload = function() {
                                    // Limpiar el timeout de seguridad
                                    if (exportTimeoutRef.current) {
                                        clearTimeout(exportTimeoutRef.current);
                                        exportTimeoutRef.current = null;
                                    }

                                    if (this.status === 200) {
                                        // Crear un objeto URL para el blob
                                        const blob = new Blob([this.response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                                        const url = window.URL.createObjectURL(blob);

                                        // Crear un enlace para la descarga
                                        const a = document.createElement('a');
                                        a.style.display = 'none';
                                        a.href = url;
                                        
                                        a.download = `ventas_${startDate}_a_${endDate}.xlsx`;
                                        document.body.appendChild(a);

                                        // Descargar el archivo
                                        a.click();

                                        // Limpiar
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);

                                        // Desactivar el estado de carga
                                        setIsExporting(false);
                                    } else {
                                        console.error('Error al exportar:', this.status);
                                        setIsExporting(false);
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error',
                                            text: 'Hubo un problema al exportar los datos. Inténtalo de nuevo.',
                                        });
                                    }
                                };

                                xhr.onerror = function() {
                                    // Limpiar el timeout de seguridad
                                    if (exportTimeoutRef.current) {
                                        clearTimeout(exportTimeoutRef.current);
                                        exportTimeoutRef.current = null;
                                    }

                                    console.error('Error de red al exportar');
                                    setIsExporting(false);
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error de conexión',
                                        text: 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.',
                                    });
                                };

                                // Iniciar la solicitud
                                xhr.send();
                            }}
                            disabled={isExporting}
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Exportando...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar Excel
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="space-y-4 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground block">Total de Ventas</span>
                                        <span className="text-lg font-bold">{sales.total?.toLocaleString() ?? '0'}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground block">Monto de Recargas</span>
                                        <span className="text-lg font-bold">{totals.recharge_amount?.toLocaleString() ?? '0'}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground block">Monto Acumulado</span>
                                        <span className="text-lg font-bold">{totals.accumulated_amount?.toLocaleString() ?? '0'}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground block">Cargos Comisionables</span>
                                        <span className="text-lg font-bold">{totals.commissionable_charges?.toLocaleString() ?? '0'}</span>
                                    </div>
                                </div>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <div>
                            <Label htmlFor="startDate">Fecha Inicio</Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    id="startDate"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="pl-10"
                                />
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="endDate">Fecha Fin</Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    id="endDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="pl-10"
                                />
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
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
                            <Label htmlFor="product">Producto</Label>
                            <Select
                                value={product}
                                onValueChange={setProduct}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione producto" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {webProducts.reduce((uniqueProducts: Product[], wp) => {
                                        if (wp.product && !uniqueProducts.some(p => p.id === wp.product?.id)) {
                                            uniqueProducts.push(wp.product);
                                        }
                                        return uniqueProducts;
                                    }, []).map((product) => (
                                        <SelectItem key={product.id} value={product.id.toString()}>
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="webproduct">Web Producto</Label>
                            <Select
                                value={webproduct}
                                onValueChange={setWebproduct}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione web producto" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {webProducts
                                        .filter(wp => product === 'all' || wp.product_id.toString() === product)
                                        .map((webProduct) => (
                                            <SelectItem key={webProduct.id} value={webProduct.id.toString()}>
                                                {webProduct.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="commissionable">Comisionable</Label>
                            <Select
                                value={commissionable}
                                onValueChange={setCommissionable}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione comisionable" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="true">Sí</SelectItem>
                                    <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="per_page">Registros por página</Label>
                            <Select
                                value={perPage}
                                onValueChange={handlePerPageChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione registros por página" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
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
                                    <div className="flex flex-col">
                                        <CardTitle className="text-lg font-bold">
                                            {new Date(sale.date).toLocaleDateString()}
                                        </CardTitle>
                                        <div className="text-sm text-muted-foreground">
                                            Teléfono: {sale.telefono}
                                        </div>
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
                                                {sale.user.zonificador.name}
                                            </p>
                                        )}
                                        <p className="text-sm">
                                            <span className="font-medium">Producto:</span>{' '}
                                            {sale.webproduct?.product?.name || 'Producto sin nombre'} - {sale.webproduct?.name || 'Sin nombre'}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Monto de recarga:</span>{' '}
                                            {sale.recharge_amount?.toLocaleString() ?? '0'}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Monto acumulado:</span>{' '}
                                            {sale.accumulated_amount?.toLocaleString() ?? '0'}
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
                                <TableHead>Teléfono</TableHead>
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
                                        colSpan={9}
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
                                        <TableCell>{sale.telefono}</TableCell>
                                        <TableCell>{sale.user.name} ({sale.user.dni})</TableCell>
                                        <TableCell>
                                            {sale.user.zonificador && (
                                                <span>
                                                    {sale.user.zonificador.name}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {sale.webproduct ? (
                                                <div className="flex flex-col space-y-1">
                                                    <span className="font-medium text-sm">
                                                        {sale.webproduct.product?.name || 'Producto sin nombre'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {sale.webproduct.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Sin producto web</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{sale.recharge_amount?.toLocaleString() ?? '0'}</TableCell>
                                        <TableCell>{sale.accumulated_amount?.toLocaleString() ?? '0'}</TableCell>
                                        <TableCell>{sale.commissionable_charge ? 'Sí' : 'No'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">

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
