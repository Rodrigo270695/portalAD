import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';


interface WebProduct {
    id: number;
    name: string;
}

interface SaleData {
    [key: string]: {
        [key: string]: number;
    }; 
}

interface SaleDetails {
    [key: string]: {
        [key: string]: {
            [key: string]: {
                user_name: string;
                count: number;
            };
        };
    };
}

interface Props {
    salesData: SaleData;
    salesDetails: SaleDetails;
    webProducts: WebProduct[];
    startDate: string;
    endDate: string;
    isZonificado: boolean;
    isPdv: boolean;
}

interface SaleRow {
    date: string;
    total: number;
    [key: number]: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Ventas PDV',
        href: '/history-sales',
    },
];

const History = ({ salesData, salesDetails, webProducts, startDate, endDate, isZonificado, isPdv }: Props) => {
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<{
        startDate: string;
        endDate: string;
    }>({ startDate, endDate });

    const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSearch = () => {
        router.get(route('history.sales'), {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const formatDate = (dateStr: string, isMobile: boolean = false) => {
        const date = new Date(`${dateStr}T00:00:00-05:00`);

        if (isMobile) {
            return date.toLocaleDateString('es-PE', {
                day: '2-digit',
                month: '2-digit',
                timeZone: 'America/Lima'
            });
        }

        return date.toLocaleDateString('es-PE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            timeZone: 'America/Lima'
        }).replace(/^\w/, (c) => c.toUpperCase());
    };

    const toggleRow = (date: string) => {
        setExpandedRows(prev =>
            prev.includes(date)
                ? prev.filter(d => d !== date)
                : [...prev, date]
        );
    };

    // Convertir los datos de ventas en un array para la tabla y ordenar por fecha ASC
    const salesRows: SaleRow[] = Object.entries(salesData)
        .map(([date, products]) => {
            const rowData = { date, ...products };
            const total = Object.values(products).reduce((sum, value) => sum + (value || 0), 0);
            return { ...rowData, total };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calcular totales por producto y total general
    const productTotals = webProducts.reduce((acc, product) => {
        const total = salesRows.reduce((sum, row) => sum + (row[product.id] || 0), 0);
        acc[product.id] = total;
        return acc;
    }, {} as { [key: number]: number });

    const grandTotal = salesRows.reduce((sum, row) => sum + row.total, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ventas PDV" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Historico de ventas</h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-48">
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-md text-sm"
                            value={dateRange.startDate}
                            onChange={(e) => handleDateChange('startDate', e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-md text-sm"
                            value={dateRange.endDate}
                            onChange={(e) => handleDateChange('endDate', e.target.value)}
                        />
                    </div>
                    <Button onClick={handleSearch}>
                        <Search className="mr-2 h-4 w-4" />
                        Buscar
                    </Button>
                </div>

                <div className="max-w-[calc(100vw-2rem)] overflow-x-auto rounded-lg border border-sidebar-border/70">
                    <div className="min-w-[400px] lg:min-w-[640px]">
                    {salesRows.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No se encontraron ventas</p>
                        </div>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {isZonificado && (
                                    <TableHead className="w-[40px] p-1 lg:p-4"></TableHead>
                                )}
                                <TableHead className="w-[50px] lg:w-[120px] uppercase text-[10px] lg:text-xs font-bold p-1 lg:p-4">Fecha</TableHead>
                                {webProducts.map((product) => (
                                    <TableHead key={product.id} className="text-center w-[60px] lg:w-[100px] uppercase text-[10px] lg:text-xs font-bold break-words p-1 lg:p-4">{product.name}</TableHead>
                                ))}
                                <TableHead className="text-center w-[50px] lg:w-[80px] uppercase text-[10px] lg:text-xs font-bold p-1 lg:p-4">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salesRows.map((row) => (
                                <React.Fragment key={row.date}>
                                    <TableRow>
                                        {isZonificado && (
                                            <TableCell className="w-[40px] p-1 lg:p-4">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => toggleRow(row.date)}
                                                >
                                                    {expandedRows.includes(row.date) ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        )}
                                        <TableCell className="whitespace-nowrap w-[50px] lg:w-[120px] p-1 lg:p-4">
                                            <span className="lg:inline hidden">{formatDate(row.date)}</span>
                                            <span className="lg:hidden inline">{formatDate(row.date, true)}</span>
                                        </TableCell>
                                        {webProducts.map((product) => (
                                            <TableCell key={product.id} className="text-center w-[60px] lg:w-[100px] p-1 lg:p-4">{row[product.id] || 0}</TableCell>
                                        ))}
                                        <TableCell className="text-center font-bold w-[50px] lg:w-[80px] p-1 lg:p-4 bg-amber-50 text-amber-900 text-base lg:text-lg">{row.total}</TableCell>
                                    </TableRow>
                                    {(isZonificado || isPdv) && expandedRows.includes(row.date) && (
                                        <TableRow>
                                            <TableCell colSpan={webProducts.length + 3} className="bg-muted/30 p-0">
                                                <div className="pl-8">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[200px] lg:w-[300px] uppercase text-[10px] lg:text-xs font-bold p-1 lg:p-4">PDV</TableHead>
                                                                {webProducts.map((product) => (
                                                                    <TableHead key={product.id} className="text-center w-[60px] lg:w-[100px] uppercase text-[10px] lg:text-xs font-bold p-1 lg:p-4">{product.name}</TableHead>
                                                                ))}
                                                                <TableHead className="text-center w-[50px] lg:w-[80px] uppercase text-[10px] lg:text-xs font-bold p-1 lg:p-4 bg-amber-100/50">Total</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {Object.entries(salesDetails[row.date] || {}).reduce((pdvRows: Array<{ userId: string; name: string; products: Record<string, number>; total: number }>, [_, productDetails]) => {
                                                                Object.entries(productDetails).forEach(([userId, details]) => {
                                                                    const existingRow = pdvRows.find(r => r.userId === userId);
                                                                    if (existingRow) {
                                                                        existingRow.products[_] = details.count;
                                                                        existingRow.total += details.count;
                                                                    } else {
                                                                        pdvRows.push({
                                                                            userId,
                                                                            name: details.user_name,
                                                                            products: { [_]: details.count },
                                                                            total: details.count
                                                                        });
                                                                    }
                                                                });
                                                                return pdvRows;
                                                            }, []).map((pdvRow) => (
                                                                <TableRow key={pdvRow.userId}>
                                                                    <TableCell className="w-[200px] lg:w-[300px] p-1 lg:p-4">{pdvRow.name}</TableCell>
                                                                    {webProducts.map((product) => (
                                                                        <TableCell key={product.id} className="text-center w-[60px] lg:w-[100px] p-1 lg:p-4">
                                                                            {pdvRow.products[product.id] || 0}
                                                                        </TableCell>
                                                                    ))}
                                                                    <TableCell className="text-center font-bold w-[50px] lg:w-[80px] p-1 lg:p-4 bg-amber-50 text-amber-900 text-base lg:text-lg">{pdvRow.total}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                            <TableRow className="bg-muted/50">
                                {isZonificado && <TableCell className="w-[40px] p-1 lg:p-4"></TableCell>}
                                <TableCell className="whitespace-nowrap w-[50px] lg:w-[120px] font-semibold p-1 lg:p-4">Total</TableCell>
                                {webProducts.map((product) => (
                                    <TableCell key={product.id} className="text-center w-[60px] lg:w-[100px] font-semibold p-1 lg:p-4">
                                        {productTotals[product.id]}
                                    </TableCell>
                                ))}
                                <TableCell className="text-center w-[50px] lg:w-[80px] font-semibold p-1 lg:p-4">{grandTotal}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default History;
