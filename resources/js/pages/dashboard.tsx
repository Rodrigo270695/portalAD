import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { FileText, TrendingUp, DollarSign, PieChart, AlertCircle, ChevronDown, ChevronRight, ShoppingCart, Info, Plus, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import CardDashboard from '@/components/CardDashboard';
import PDVInfo from '@/components/PDVInfo';

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
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ userData }: DashboardProps) {
    const [showDailyDetails, setShowDailyDetails] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Primera fila - 3 tarjetas principales */}
                <div className="grid auto-rows-min gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <CardDashboard title="Información del PDV">
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
                    <CardDashboard title="Avance de Ventas">
                        <div className="bg-emerald-500 p-3 text-white font-medium text-lg">
                            Avance de Ventas
                        </div>
                        <div className="p-4 flex flex-col space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-200 rounded-lg p-3">
                                    <div className="text-blue-700 font-medium mb-1">Cuota prepago</div>
                                    <div className="flex items-center">
                                        <FileText className="text-blue-800 mr-2" size={20} />
                                        <span className="text-blue-900 text-2xl font-bold">97</span>
                                    </div>
                                </div>

                                <div className="bg-blue-200 rounded-lg p-3">
                                    <div className="text-blue-700 font-medium mb-1">Avance prepago</div>
                                    <div className="flex items-center">
                                        <TrendingUp className="text-blue-800 mr-2" size={20} />
                                        <span className="text-blue-900 text-2xl font-bold">41</span>
                                    </div>
                                </div>

                                <div className="bg-amber-200 rounded-lg p-3">
                                    <div className="text-amber-700 font-medium mb-1">Recargas totales</div>
                                    <div className="flex items-center">
                                        <DollarSign className="text-amber-800 mr-2" size={20} />
                                        <span className="text-amber-900 text-2xl font-bold">20</span>
                                    </div>
                                </div>

                                <div className="bg-blue-200 rounded-lg p-3">
                                    <div className="text-blue-700 font-medium mb-1">Ratio</div>
                                    <div className="flex items-center">
                                        <PieChart className="text-blue-800 mr-2" size={20} />
                                        <span className="text-blue-900 text-2xl font-bold">49%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center">
                                <AlertCircle className="text-amber-500 mr-2" size={18} />
                                <span className="text-amber-800">Faltan 1 recargas para llegar al 50% de ratio.</span>
                            </div>
                        </div>
                    </CardDashboard>
                    <CardDashboard title="Bonos PDV con ratio de 49%">
                        <div className="bg-amber-400 p-3 text-gray-800 font-medium text-lg flex justify-between items-center">
                            <span>Bonos PDV con ratio de</span>
                            <span className="bg-white px-2 py-1 rounded font-bold">49%</span>
                        </div>
                        <div className="p-0 flex flex-col">
                            <div className="p-3 border-b flex items-center">
                                <ChevronDown className="text-gray-500 mr-2" size={20} />
                                <span className="text-gray-700 flex-grow">Al día 23/03 vas ganando</span>
                                <span className="font-bold text-gray-800">S/. 187.50</span>
                            </div>

                            <div className="p-3 border-b flex items-center bg-gray-50">
                                <ChevronDown className="text-emerald-500 mr-2" size={20} />
                                <span className="text-emerald-500 font-medium flex-grow">Bono Total Efectivo:</span>
                                <span className="font-bold text-emerald-500">S/. 146.5</span>
                            </div>

                            <div className="px-3 py-2 border-b">
                                <div className="font-medium text-gray-700 mb-1">BONO PRE</div>
                                <div className="flex items-center">
                                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md flex items-center">
                                        <ShoppingCart size={16} className="mr-1" />
                                        <span>41</span>
                                    </div>
                                    <span className="mx-2 text-gray-500">×</span>
                                    <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                                        S/. 2.5
                                    </div>
                                    <span className="mx-2 text-gray-500">=</span>
                                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                                        S/. 102.50
                                    </div>
                                </div>
                            </div>

                            <div className="px-3 py-2 border-b">
                                <div className="font-medium text-gray-700 mb-1">BONO RECARGA PRE</div>
                                <div className="flex items-center">
                                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md flex items-center">
                                        <ShoppingCart size={16} className="mr-1" />
                                        <span>20</span>
                                    </div>
                                    <span className="mx-2 text-gray-500">×</span>
                                    <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                                        S/. 2
                                    </div>
                                    <span className="mx-2 text-gray-500">=</span>
                                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                                        S/. 40.00
                                    </div>
                                </div>
                            </div>

                            <div className="px-3 py-2 border-b">
                                <div className="font-medium text-gray-700 mb-1">BONO PORTA PRE</div>
                                <div className="flex items-center">
                                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md flex items-center">
                                        <ShoppingCart size={16} className="mr-1" />
                                        <span>1</span>
                                    </div>
                                    <span className="mx-2 text-gray-500">×</span>
                                    <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                                        S/. 4
                                    </div>
                                    <span className="mx-2 text-gray-500">=</span>
                                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                                        S/. 4.00
                                    </div>
                                </div>
                            </div>

                            <div className="px-3 py-2 border-b">
                                <div className="font-medium text-gray-700 mb-1">BONO ALTA POST</div>
                                <div className="flex items-center">
                                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md flex items-center">
                                        <ShoppingCart size={16} className="mr-1" />
                                        <span>0</span>
                                    </div>
                                    <span className="mx-2 text-gray-500">×</span>
                                    <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                                        S/. 0
                                    </div>
                                    <span className="mx-2 text-gray-500">=</span>
                                    <div className="bg-red-100 text-red-800 px-2 py-1 rounded-md font-medium">
                                        S/. 0.00
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 border-b flex items-center">
                                <ChevronRight className="text-blue-600 mr-2" size={20} />
                                <span className="text-blue-600 font-medium flex-grow">Bono Chips:</span>
                                <span className="font-bold text-blue-600">S/. 41</span>
                            </div>
                        </div>
                    </CardDashboard>
                </div>

                {/* Segunda fila - Avance Diario (tabla completa) */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border bg-white dark:bg-sidebar-background shadow-sm">
                    <div className="bg-amber-300 p-3 text-gray-800 font-medium text-lg">
                        AVANCE DIARIO
                    </div>
                    <div className="p-0 flex flex-col">
                        <div className="p-3 border-b bg-amber-50 flex items-center">
                            <Info className="text-amber-500 mr-2" size={18} />
                            <span className="text-gray-700">Sólo se muestran días con ventas</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800">
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Fecha
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Alta Pre
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Alta Post
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            Porta Pre
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            Porta Post. O. Pre
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            Porta Post. O. Pos
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <tr className="bg-white dark:bg-gray-900">
                                        <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                            <button
                                                onClick={() => setShowDailyDetails(!showDailyDetails)}
                                                className="text-blue-500 size-5 bg-blue-100 rounded-full p-1 hover:bg-blue-200 transition-colors"
                                            >
                                                {showDailyDetails ? <ChevronUp size={16} /> : <Plus size={16} />}
                                            </button>
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                            40
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                            0
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                            1
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                            0
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                            0
                                        </td>
                                    </tr>

                                    {showDailyDetails && (
                                        <>
                                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                                <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                    2025-03-29
                                                </td>
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    15
                                                </td>
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    0
                                                </td>
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    0
                                                </td>
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    0
                                                </td>
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    0
                                                </td>
                                            </tr>
                                            <tr className="bg-white dark:bg-gray-900">
                                                <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                    2025-03-30
                                                </td>
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    25
                                                </td>
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    0
                                                </td>
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    1
                                                </td>
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    0
                                                </td>
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    0
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 dark:bg-gray-800">
                                        <td className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Total
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                            40
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                            0
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                            1
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                            0
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                            0
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Tercera fila - Detalle de Abonos */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border bg-white dark:bg-sidebar-background shadow-sm">
                    <div className="bg-blue-200 p-3 text-gray-800 font-medium text-lg">
                        DETALLE DE ABONOS
                    </div>
                    <div className="p-0 flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800">
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Detalle
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Tipo de Abono
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                            DNI Ganador
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Fechas de Abono
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <tr className="bg-white dark:bg-gray-900">
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            Incentivo Pdv Regular 6-9 Marzo
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            Transferencia
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            46567032
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            11 de Mar
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                            50
                                        </td>
                                    </tr>
                                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            Incentivo PDV Grupo 1 y 2 11-13 Marzo
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            Transferencia
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            46567032
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            18 y 19 Mar
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                            24
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="bg-emerald-100 dark:bg-emerald-800/30">
                                        <td colSpan={4} className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 text-right">
                                            Total:
                                        </td>
                                        <td className="px-3 py-2 text-sm font-bold text-gray-900 dark:text-white">
                                            74
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
