import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../layouts/app-layout';
import { AlertCircle, ChevronDown, PieChart, User, Activity, BarChart3 } from 'lucide-react';
import CardDashboard from '../components/CardDashboard';
import PDVInfo from '../components/PDVInfo';
import { useIsMobile } from '../hooks/use-mobile';
import clsx from 'clsx';
import * as Collapsible from '@radix-ui/react-collapsible';
import { type BreadcrumbItem } from '../types';
import { Link } from '@inertiajs/react';

interface DashboardProps {
    userData: {
        name: string;
        dni: string;
        vendorName: string;
        vendorDNI: string;
        vendorPhone: string;
        channel: string;
        group: string;
        updateDate: string;
        pdvLevel: string;
        totalShare: number;
        pdvCount: number;
        isZonificado: boolean;
        salesData: {
            totalSales: number;
            totalRecharges: number;
            ratio: number;
            quotaMetrics: {
                remaining: number;
                progress: number;
                status: 'green' | 'yellow' | 'red';
            };
            ratioMetrics: {
                rechargesNeeded: number;
                status: 'green' | 'yellow' | 'red';
            };
            webProducts: Array<{
                id: number;
                name: string;
                product_name: string;
            }>;
            dailySales: Array<{
                pdv_id: number;
                pdv_name: string;
                sales: {
                    byDate: {
                        [key: string]: {
                            [key: number]: number;
                        };
                    };
                    totals: {
                        [key: number]: number;
                    };
                };
            }>;
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ userData }: DashboardProps) {
    const isMobile = useIsMobile();
    const isAdmin = userData.dni === '77344506';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4">
                {/* Enlaces de Administración */}
                {isAdmin && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/activity-logs">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50 hover:bg-neutral-50/80 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
                                        <Activity className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral-900">Registros de Actividad</h3>
                                        <p className="text-sm text-neutral-500">Ver todas las actividades del sistema</p>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link href="/activity-analytics">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50 hover:bg-neutral-50/80 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-emerald-100 rounded-lg p-3 group-hover:bg-emerald-200 transition-colors">
                                        <BarChart3 className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral-900">Análisis de Actividad</h3>
                                        <p className="text-sm text-neutral-500">Estadísticas y métricas detalladas</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Primera fila - Información PDV y Avance de Ventas */}
                <div className="grid auto-rows-min gap-4 grid-cols-1 md:grid-cols-2">
                    <CardDashboard title="Información del PDV">
                        <div className="flex justify-center mb-2">
                            <div className="size-16 sm:size-20 rounded-full border-4 border-blue-300 flex items-center justify-center bg-blue-100">
                                <User className="size-8 sm:size-10 text-blue-500" />
                            </div>
                        </div>
                        <PDVInfo
                            name={userData.name}
                            dni={userData.dni}
                            vendorName={userData.vendorName}
                            vendorDNI={userData.vendorDNI}
                            vendorPhone={userData.vendorPhone}
                            channel={userData.channel}
                            group={userData.group}
                            updateDate={userData.updateDate}
                            pdvLevel={userData.pdvLevel}
                        />
                    </CardDashboard>

                    <CardDashboard title="Avance de Ventas" variant="emerald">
                        <div className="p-2 sm:p-4 flex flex-col space-y-3">
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    <div className="bg-orange-200 rounded-lg p-2 sm:p-3">
                                        <div className="text-blue-700 font-medium text-sm sm:text-base mb-1">Recargas totales</div>
                                        <div className="flex items-center">
                                            <span className="text-blue-800 mr-2 font-medium">S/</span>
                                            <span className="text-blue-900 text-xl sm:text-2xl font-bold">{userData.salesData.totalRecharges}</span>
                                        </div>
                                    </div>

                                    <div className="bg-green-200 rounded-lg p-2 sm:p-3">
                                        <div className="text-blue-700 font-medium text-sm sm:text-base mb-1">Porcentaje de Recarga</div>
                                        <div className="flex items-center">
                                            <PieChart className="text-blue-800 mr-2" size={isMobile ? 16 : 20} />
                                            <span className="text-blue-900 text-xl sm:text-2xl font-bold">{userData.salesData.ratio.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md">
                                    <div className="relative space-y-4">
                                        {/* Encabezado con título y valores */}
                                        <div className="flex flex-col space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-amber-950 font-semibold tracking-tight text-base sm:text-lg">Avance de Cuota Prepago</h3>
                                                <div className="bg-amber-100/80 px-3 py-1.5 rounded-lg">
                                                    <span className="text-amber-900 font-medium text-sm sm:text-base">
                                                        {userData.salesData.totalSales} / {userData.salesData.quotaMetrics.remaining + userData.salesData.totalSales}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-baseline space-x-2">
                                                <span className="text-2xl sm:text-3xl font-bold text-amber-800">
                                                    {userData.salesData.quotaMetrics.progress.toFixed(1)}%
                                                </span>
                                                <span className="text-amber-700 text-sm">completado</span>
                                            </div>
                                        </div>

                                        {/* Barra de progreso mejorada */}
                                        <div className="relative pt-2">
                                            <div className="w-full h-3 sm:h-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg overflow-hidden">
                                                <div
                                                    className={clsx(
                                                        "h-full rounded-lg",
                                                        {
                                                            'bg-gradient-to-r from-emerald-400 to-teal-500': userData.salesData.quotaMetrics.progress >= 100,
                                                            'bg-gradient-to-r from-amber-400 to-orange-500': userData.salesData.quotaMetrics.progress >= 75 && userData.salesData.quotaMetrics.progress < 100,
                                                            'bg-gradient-to-r from-rose-400 to-red-500': userData.salesData.quotaMetrics.progress < 75
                                                        }
                                                    )}
                                                    style={{
                                                        width: `${userData.salesData.quotaMetrics.progress}%`
                                                    }}
                                                />
                                            </div>

                                            {/* Marcadores de progreso */}
                                            <div className="mt-2 flex justify-between text-xs text-amber-800/60 font-medium px-1">
                                                <div className="flex flex-col items-start">
                                                    <div className="h-1 w-0.5 bg-amber-300 mb-1"></div>
                                                    <span>0%</span>
                                                </div>
                                                {[25, 50, 75].map((mark) => (
                                                    <div key={mark} className="flex flex-col items-center">
                                                        <div className="h-1 w-0.5 bg-amber-300 mb-1"></div>
                                                        <span>{mark}%</span>
                                                    </div>
                                                ))}
                                                <div className="flex flex-col items-end">
                                                    <div className="h-1 w-0.5 bg-amber-300 mb-1"></div>
                                                    <span>100%</span>
                                                </div>
                                            </div>

                                            {/* Detalles de avance y cuota */}
                                            <div className="mt-4 grid grid-cols-2 gap-4">
                                                <div className="bg-blue-100 rounded-lg p-3">
                                                    <div className="text-amber-800/70 text-xs font-medium mb-1">Avance actual</div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-amber-900 text-lg font-bold">{userData.salesData.totalSales}</span>
                                                        <span className="text-amber-700 text-sm">ventas</span>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-100 rounded-lg p-3">
                                                    <div className="text-amber-800/70 text-xs font-medium mb-1">Cuota objetivo</div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-amber-900 text-lg font-bold">{userData.salesData.quotaMetrics.remaining + userData.salesData.totalSales}</span>
                                                        <span className="text-amber-700 text-sm">ventas</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {/* Información de Cuota */}
                                <div className={clsx(
                                    "border rounded-lg p-2 sm:p-3 flex items-center",
                                    {
                                        'bg-green-50 border-green-200': userData.salesData.quotaMetrics.status === 'green',
                                        'bg-amber-50 border-amber-200': userData.salesData.quotaMetrics.status === 'yellow',
                                        'bg-red-50 border-red-200': userData.salesData.quotaMetrics.status === 'red',
                                    }
                                )}>
                                    <AlertCircle className={clsx("mr-2", {
                                        'text-green-500': userData.salesData.quotaMetrics.status === 'green',
                                        'text-amber-500': userData.salesData.quotaMetrics.status === 'yellow',
                                        'text-red-500': userData.salesData.quotaMetrics.status === 'red',
                                    })} size={isMobile ? 16 : 20} />
                                    <span className={clsx("text-sm sm:text-base", {
                                        'text-green-700': userData.salesData.quotaMetrics.status === 'green',
                                        'text-amber-700': userData.salesData.quotaMetrics.status === 'yellow',
                                        'text-red-700': userData.salesData.quotaMetrics.status === 'red',
                                    })}>
                                        {userData.salesData.quotaMetrics.status === 'green'
                                            ? '¡Felicitaciones! Has alcanzado la cuota de ventas'
                                            : `Necesitas ${userData.salesData.quotaMetrics.remaining} ventas más para alcanzar la cuota`}
                                    </span>
                                </div>

                                {/* Información de Ratio */}
                                <div className={clsx(
                                    "border rounded-lg p-2 sm:p-3 flex items-center",
                                    {
                                        'bg-green-50 border-green-200': userData.salesData.ratioMetrics.status === 'green',
                                        'bg-amber-50 border-amber-200': userData.salesData.ratioMetrics.status === 'yellow',
                                        'bg-red-50 border-red-200': userData.salesData.ratioMetrics.status === 'red',
                                    }
                                )}>
                                    <AlertCircle className={clsx("mr-2", {
                                        'text-green-500': userData.salesData.ratioMetrics.status === 'green',
                                        'text-amber-500': userData.salesData.ratioMetrics.status === 'yellow',
                                        'text-red-500': userData.salesData.ratioMetrics.status === 'red',
                                    })} size={isMobile ? 16 : 20} />
                                    <span className={clsx("text-sm sm:text-base", {
                                        'text-green-700': userData.salesData.ratioMetrics.status === 'green',
                                        'text-amber-700': userData.salesData.ratioMetrics.status === 'yellow',
                                        'text-red-700': userData.salesData.ratioMetrics.status === 'red',
                                    })}>
                                        {userData.salesData.ratioMetrics.status === 'green'
                                            ? '¡Excelente! Tu ratio de recargas está por encima del 50%'
                                            : `Necesitas ${userData.salesData.ratioMetrics.rechargesNeeded} recargas más para ${
                                                userData.salesData.ratioMetrics.status === 'yellow'
                                                    ? 'alcanzar el 50% de ratio'
                                                    : 'alcanzar el 40% de ratio'
                                            }`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardDashboard>
                </div>

                {/* Detalle diario - Ancho completo */}
                <div className="grid gap-4 grid-cols-1">
                    <CardDashboard title="Detalle Diario" variant="orange">
                        <div className="p-2 sm:p-4">
                            {userData.salesData.dailySales.map((pdvData) => (
                                <div key={pdvData.pdv_id} className="mb-4">
                                    {userData.isZonificado && (
                                        <div className="text-lg font-semibold mb-2 text-gray-700">
                                            PDV: {pdvData.pdv_name}
                                        </div>
                                    )}

                                    {/* Botón para expandir detalles diarios */}
                                    <Collapsible.Root>
                                        <Collapsible.Trigger asChild>
                                            <button className="w-full mt-2 flex items-center justify-between bg-blue-50 p-2 sm:p-3 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors">
                                                <span className="text-sm sm:text-base font-medium">
                                                    Ver ventas diarias
                                                </span>
                                                <ChevronDown size={isMobile ? 16 : 20} />
                                            </button>
                                        </Collapsible.Trigger>

                                        <Collapsible.Content>
                                            <div className="mt-2">
                                                <div className="bg-white rounded-lg shadow overflow-x-auto">
                                                    <div className="mb-2 flex items-center text-sm text-amber-600">
                                                        <AlertCircle className="mr-2 h-4 w-4" />
                                                        Sólo se muestran días con ventas
                                                    </div>
                                                    <div className="relative overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white">
                                                        <table className="w-full text-sm text-left rtl:text-right">
                                                            <thead className="text-xs uppercase bg-gray-50 border-b border-gray-200">
                                                                <tr>
                                                                    <th scope="col" className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                                                                        Fecha
                                                                    </th>
                                                                    {userData.salesData.webProducts.map((product) => (
                                                                        <th key={product.id} scope="col" className="px-2 py-2 text-center font-semibold text-gray-600 md:px-4 md:whitespace-nowrap">
                                                                            <div className="md:hidden text-[10px] leading-tight min-h-[40px] flex items-center justify-center">
                                                                                {product.name.split(' ').map((word, i) => (
                                                                                    <React.Fragment key={i}>
                                                                                        {word}
                                                                                        <br />
                                                                                    </React.Fragment>
                                                                                ))}
                                                                            </div>
                                                                            <div className="hidden md:block">
                                                                                {product.name}
                                                                            </div>
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200">
                                                                <tr className="bg-blue-50/50 font-medium sticky top-0 shadow-sm z-10">
                                                                    <td className="px-4 py-3 text-sm text-blue-700 whitespace-nowrap font-semibold">
                                                                        Total
                                                                    </td>
                                                                    {userData.salesData.webProducts.map((product) => (
                                                                        <td key={product.id} className="px-2 py-3 text-sm text-center text-blue-700 whitespace-nowrap font-semibold md:px-4">
                                                                            {pdvData.sales.totals[product.id] || 0}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                                {Object.entries(pdvData.sales.byDate)
                                                                    .filter(([date]) => pdvData.sales.byDate[date] && Object.values(pdvData.sales.byDate[date]).some(value => value > 0))
                                                                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                                                                    .map(([date, sales]) => (
                                                                        <tr key={`${pdvData.pdv_id}-${date}`}
                                                                            className="bg-white hover:bg-gray-50/80 transition-colors duration-200">
                                                                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap font-medium">
                                                                                <div className="md:hidden">
                                                                                    {new Date(`${date}T00:00:00-05:00`).toLocaleDateString('es-PE', {
                                                                                        day: 'numeric',
                                                                                        month: 'short'
                                                                                    }).replace('.', '')}
                                                                                </div>
                                                                                <div className="hidden md:block">
                                                                                    {new Date(`${date}T00:00:00-05:00`).toLocaleDateString('es-PE', {
                                                                                        weekday: 'long',
                                                                                        day: 'numeric',
                                                                                        month: 'long'
                                                                                    }).replace(/^\w/, (c) => c.toUpperCase())}
                                                                                </div>
                                                                            </td>
                                                                            {userData.salesData.webProducts.map((product) => (
                                                                                <td key={product.id} className="px-2 py-3 text-sm text-center text-gray-600 whitespace-nowrap md:px-4">
                                                                                    {sales[product.id] || 0}
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                    ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                </div>
                                            </div>
                                        </Collapsible.Content>
                                    </Collapsible.Root>
                                </div>
                            ))}
                        </div>
                    </CardDashboard>
                </div>
            </div>
        </AppLayout>
    );
}
