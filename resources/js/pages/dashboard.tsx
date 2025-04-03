import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { FileText, TrendingUp, DollarSign, PieChart, AlertCircle, ChevronDown, ChevronRight, ShoppingCart, Info, Plus, ChevronUp, User } from 'lucide-react';
import { useState } from 'react';
import CardDashboard from '@/components/CardDashboard';
import PDVInfo from '@/components/PDVInfo';
import { useIsMobile } from '@/hooks/use-mobile';

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
    const isMobile = useIsMobile();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4">
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
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                <div className="bg-blue-200 rounded-lg p-2 sm:p-3">
                                    <div className="text-blue-700 font-medium text-sm sm:text-base mb-1">Cuota prepago</div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center">
                                            <FileText className="text-blue-800 mr-2" size={isMobile ? 16 : 20} />
                                            <span className="text-blue-900 text-xl sm:text-2xl font-bold">{userData.totalShare}</span>
                                        </div>
                                        {userData.isZonificado && (
                                            <div className="flex items-center text-sm text-blue-600">
                                                <User className="mr-1" size={16} />
                                                <span>{userData.pdvCount} PDV{userData.pdvCount !== 1 ? 's' : ''}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-blue-200 rounded-lg p-2 sm:p-3">
                                    <div className="text-blue-700 font-medium text-sm sm:text-base mb-1">Avance prepago</div>
                                    <div className="flex items-center">
                                        <TrendingUp className="text-blue-800 mr-2" size={isMobile ? 16 : 20} />
                                        <span className="text-blue-900 text-xl sm:text-2xl font-bold">41</span>
                                    </div>
                                </div>

                                <div className="bg-amber-200 rounded-lg p-2 sm:p-3">
                                    <div className="text-amber-700 font-medium text-sm sm:text-base mb-1">Recargas totales</div>
                                    <div className="flex items-center">
                                        <DollarSign className="text-amber-800 mr-2" size={isMobile ? 16 : 20} />
                                        <span className="text-amber-900 text-xl sm:text-2xl font-bold">20</span>
                                    </div>
                                </div>

                                <div className="bg-blue-200 rounded-lg p-2 sm:p-3">
                                    <div className="text-blue-700 font-medium text-sm sm:text-base mb-1">Ratio</div>
                                    <div className="flex items-center">
                                        <PieChart className="text-blue-800 mr-2" size={isMobile ? 16 : 20} />
                                        <span className="text-blue-900 text-xl sm:text-2xl font-bold">49%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-3 flex items-center">
                                <AlertCircle className="text-amber-500 mr-2" size={isMobile ? 16 : 20} />
                                <span className="text-amber-700 text-sm sm:text-base">Necesitas vender 56 recargas más para alcanzar la cuota</span>
                            </div>
                        </div>
                    </CardDashboard>
                </div>

                {/* Detalle diario - Ancho completo */}
                <div className="grid gap-4 grid-cols-1">
                <CardDashboard title="Detalle Diario" variant="orange">
                        <div className="p-2 sm:p-4">
                            <button
                                onClick={() => setShowDailyDetails(!showDailyDetails)}
                                className="w-full flex items-center justify-between bg-blue-50 p-2 sm:p-3 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                                <span className="text-sm sm:text-base font-medium">Ver detalle diario</span>
                                {showDailyDetails ? (
                                    <ChevronUp size={isMobile ? 16 : 20} />
                                ) : (
                                    <ChevronDown size={isMobile ? 16 : 20} />
                                )}
                            </button>

                            {showDailyDetails && (
                                <div className="mt-3 space-y-2 sm:space-y-3">
                                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                        <div className="flex items-center justify-between text-gray-600 mb-2">
                                            <span className="text-sm sm:text-base font-medium">Lunes, 25 de Marzo</span>
                                            <ChevronRight size={isMobile ? 16 : 20} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                            <div className="flex items-center">
                                                <ShoppingCart className="text-blue-500 mr-2" size={isMobile ? 16 : 20} />
                                                <div>
                                                    <div className="text-xs sm:text-sm text-gray-500">Ventas</div>
                                                    <div className="text-base sm:text-lg font-semibold">12</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <DollarSign className="text-green-500 mr-2" size={isMobile ? 16 : 20} />
                                                <div>
                                                    <div className="text-xs sm:text-sm text-gray-500">Monto</div>
                                                    <div className="text-base sm:text-lg font-semibold">S/ 240</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                        <div className="flex items-center justify-between text-gray-600 mb-2">
                                            <span className="text-sm sm:text-base font-medium">Martes, 26 de Marzo</span>
                                            <ChevronRight size={isMobile ? 16 : 20} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                            <div className="flex items-center">
                                                <ShoppingCart className="text-blue-500 mr-2" size={isMobile ? 16 : 20} />
                                                <div>
                                                    <div className="text-xs sm:text-sm text-gray-500">Ventas</div>
                                                    <div className="text-base sm:text-lg font-semibold">8</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <DollarSign className="text-green-500 mr-2" size={isMobile ? 16 : 20} />
                                                <div>
                                                    <div className="text-xs sm:text-sm text-gray-500">Monto</div>
                                                    <div className="text-base sm:text-lg font-semibold">S/ 160</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardDashboard>
                    <CardDashboard title="Información Importante" variant="purple">
                        <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
                            <div className="flex items-start gap-2 sm:gap-3 bg-blue-50 p-2 sm:p-3 rounded-lg">
                                <Info className="text-blue-500 mt-0.5" size={isMobile ? 16 : 20} />
                                <div>
                                    <h4 className="text-sm sm:text-base font-medium text-blue-700">Actualización de sistema</h4>
                                    <p className="text-xs sm:text-sm text-blue-600 mt-1">
                                        El sistema estará en mantenimiento el día 30 de marzo de 2:00 AM a 4:00 AM
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 sm:gap-3 bg-amber-50 p-2 sm:p-3 rounded-lg">
                                <AlertCircle className="text-amber-500 mt-0.5" size={isMobile ? 16 : 20} />
                                <div>
                                    <h4 className="text-sm sm:text-base font-medium text-amber-700">Recordatorio de cuota</h4>
                                    <p className="text-xs sm:text-sm text-amber-600 mt-1">
                                        Faltan 5 días para alcanzar la cuota mensual
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardDashboard>

                    <CardDashboard title="Acciones Rápidas" variant="red">
                        <div className="p-2 sm:p-4 grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                            <button className="flex items-center gap-2 sm:gap-3 bg-blue-50 p-2 sm:p-3 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors">
                                <Plus size={isMobile ? 16 : 20} />
                                <span className="text-sm sm:text-base font-medium">Nueva venta</span>
                            </button>

                            <button className="flex items-center gap-2 sm:gap-3 bg-emerald-50 p-2 sm:p-3 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors">
                                <DollarSign size={isMobile ? 16 : 20} />
                                <span className="text-sm sm:text-base font-medium">Registrar abono</span>
                            </button>
                        </div>
                    </CardDashboard>
                </div>
            </div>
        </AppLayout>
    );
}
