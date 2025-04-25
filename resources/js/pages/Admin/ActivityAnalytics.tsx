import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';
import { Activity, AlertTriangle, Clock, Calendar } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    AreaChart, Area,
    ResponsiveContainer, PieChart, Pie, Cell,
    ScatterChart, Scatter, ZAxis, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Pagination } from '../../components/ui/pagination';

const COLORS = {
    primary: 'var(--chart-1)',
    secondary: 'var(--chart-2)',
    tertiary: 'var(--chart-3)',
    quaternary: 'var(--chart-4)',
    accent: 'var(--chart-5)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
};

interface AdditionalData {
    response_time?: number;
    session_start?: string;
    is_weekend?: boolean;
    hour_of_day?: number;
    day_of_week?: number;
    geo_location?: Record<string, unknown>;
    is_unusual?: boolean;
    device_type?: string;
}

interface ActivityLogData {
    id: number;
    user: {
        name: string;
        email: string;
        circuit?: {
            zonal?: {
                name: string;
            };
        };
    };
    action: string;
    ip_address: string;
    created_at: string;
    additional_data: AdditionalData;
}

interface PaginatedData<T> {
    data: T[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    current_page: number;
    last_page: number;
}

interface ActivityAnalyticsProps {
    averageSessionTime: Array<{
        user_id: number;
        avg_time: number;
    }>;
    weekdayPatterns: Array<{
        day: number;
        count: number;
        avg_response_time: number;
    }>;
    topRoutes: Array<{
        route: string;
        visits: number;
    }>;
    actionsByZonal: Array<{
        zonal_name: string;
        action: string;
        count: number;
    }>;
    weekendVsWeekday: {
        weekend: number;
        weekday: number;
    };
    heatmap: Array<{
        hour: number;
        day: number;
        intensity: number;
    }>;
    userTimeline: PaginatedData<ActivityLogData>;
    unusualPatterns: Array<ActivityLogData>;
    suspiciousIps: Array<{
        ip_address: string;
        attempts: number;
    }>;
    predictedLoad: Array<{
        hour: number;
        average_load: number;
    }>;
    deviceStats: Array<{
        device: string;
        count: number;
    }>;
    responseTimesByZonal: Array<{
        name: string;
        avg_response_time: number;
    }>;
    monthlyActivity: Array<{
        month: string;
        total: number;
    }>;
    userEngagement: Array<{
        name: string;
        activity_count: number;
    }>;
}

const breadcrumbs = [
    {
        title: 'Análisis de Actividad',
        href: '/activity-analytics',
    },
];

export default function ActivityAnalytics({
    averageSessionTime,
    weekdayPatterns,
    topRoutes,
    actionsByZonal,
    weekendVsWeekday,
    heatmap,
    userTimeline,
    unusualPatterns,
    suspiciousIps,
    predictedLoad,
    deviceStats,
    responseTimesByZonal,
    monthlyActivity,
    userEngagement,
}: ActivityAnalyticsProps) {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Análisis de Actividad" />

            <div className="flex flex-col gap-6 p-6">
                {/* Estadísticas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 rounded-lg p-3">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Tiempo Promedio de Sesión</p>
                                <p className="text-2xl font-semibold text-neutral-900">
                                    {Math.round(averageSessionTime.reduce((acc, curr) => acc + curr.avg_time, 0) / averageSessionTime.length)} min
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 rounded-lg p-3">
                                <Activity className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Actividades Hoy</p>
                                <p className="text-2xl font-semibold text-neutral-900">
                                    {weekdayPatterns.reduce((acc, curr) => acc + curr.count, 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50">
                        <div className="flex items-center gap-4">
                            <div className="bg-amber-100 rounded-lg p-3">
                                <Calendar className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Ratio Semana/Fin de Semana</p>
                                <p className="text-2xl font-semibold text-neutral-900">
                                    {Math.round((weekendVsWeekday.weekday / weekendVsWeekday.weekend) * 100) / 100}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-100 rounded-lg p-3">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Patrones Inusuales</p>
                                <p className="text-2xl font-semibold text-neutral-900">
                                    {unusualPatterns.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid de gráficos - 2 columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Mapa de Calor */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50">
                        <h3 className="text-lg font-semibold mb-4">Mapa de Calor de Actividad</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart
                                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="hour"
                                        type="number"
                                        name="Hora"
                                        domain={[0, 23]}
                                        tickFormatter={(hour) => `${hour}:00`}
                                    />
                                    <YAxis
                                        dataKey="day"
                                        type="number"
                                        name="Día"
                                        domain={[1, 7]}
                                        tickFormatter={(day) => dayNames[day - 1]}
                                    />
                                    <ZAxis
                                        dataKey="intensity"
                                        type="number"
                                        range={[50, 400]}
                                        name="Intensidad"
                                    />
                                    <Tooltip
                                        formatter={(value: number | string, name: string) => {
                                            if (name === 'Hora') return `${value}:00`;
                                            if (name === 'Día') return dayNames[Number(value) - 1];
                                            return value;
                                        }}
                                    />
                                    <Scatter
                                        data={heatmap}
                                        fill={COLORS.primary}
                                    />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Predicción de Carga */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50">
                        <h3 className="text-lg font-semibold mb-4">Predicción de Carga</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={predictedLoad}>
                                    <defs>
                                        <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="hour"
                                        tickFormatter={(hour) => `${hour}:00`}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="average_load"
                                        stroke={COLORS.secondary}
                                        fillOpacity={1}
                                        fill="url(#colorLoad)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Distribución de Dispositivos */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50">
                        <h3 className="text-lg font-semibold mb-4">Distribución de Dispositivos</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={deviceStats}
                                        dataKey="count"
                                        nameKey="device"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={150}
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    >
                                        {deviceStats.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${value} usuarios`, name]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Rutas */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50">
                        <h3 className="text-lg font-semibold mb-4">Rutas Más Visitadas</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topRoutes}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="route" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="visits" name="Visitas" fill={COLORS.primary} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Acciones por Zonal */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50">
                        <h3 className="text-lg font-semibold mb-4">Acciones por Zonal</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={actionsByZonal}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="zonal_name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" name="Cantidad" fill={COLORS.secondary} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Tiempos de Respuesta por Zonal */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50">
                        <h3 className="text-lg font-semibold mb-4">Rendimiento por Zonal</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart outerRadius={150} data={responseTimesByZonal}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="name" />
                                    <PolarRadiusAxis />
                                    <Radar
                                        name="Tiempo de Respuesta (ms)"
                                        dataKey="avg_response_time"
                                        stroke={COLORS.primary}
                                        fill={COLORS.primary}
                                        fillOpacity={0.6}
                                    />
                                    <Tooltip />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Actividad Mensual */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50">
                        <h3 className="text-lg font-semibold mb-4">Tendencia Mensual de Actividad</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyActivity}>
                                    <defs>
                                        <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.tertiary} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={COLORS.tertiary} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke={COLORS.tertiary}
                                        fillOpacity={1}
                                        fill="url(#colorMonthly)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Usuarios por Engagement */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50">
                        <h3 className="text-lg font-semibold mb-4">Top Usuarios por Engagement</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={userEngagement}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="activity_count" name="Actividades" fill={COLORS.quaternary} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Timeline de Actividades con Paginación */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50 lg:col-span-2 mt-6">
                    <h3 className="text-lg font-semibold mb-4">Timeline de Actividades</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Zonal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Acción</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Dispositivo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">IP</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Detalles</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/50">
                                {userTimeline.data.map((activity, index) => (
                                    <tr key={index} className="hover:bg-neutral-50/50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-neutral-900">{activity.user.name}</div>
                                            <div className="text-sm text-neutral-500">{activity.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {activity.user.circuit?.zonal?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                activity.action.includes('login') ? 'bg-green-100 text-green-800' :
                                                activity.action.includes('logout') ? 'bg-red-100 text-red-800' :
                                                activity.action.includes('created') ? 'bg-blue-100 text-blue-800' :
                                                activity.action.includes('updated') ? 'bg-yellow-100 text-yellow-800' :
                                                activity.action.includes('deleted') ? 'bg-red-100 text-red-800' :
                                                'bg-neutral-100 text-neutral-800'
                                            }`}>
                                                {activity.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {activity.additional_data?.device_type || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {activity.ip_address}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {format(new Date(activity.created_at), 'PPpp', { locale: es })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {activity.additional_data?.response_time && (
                                                <span className="text-xs text-neutral-500">
                                                    Tiempo de respuesta: {Math.round(activity.additional_data.response_time)}ms
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-center">
                        <Pagination links={userTimeline.links} />
                    </div>
                </div>

                {/* Alertas de Seguridad */}
                {suspiciousIps.length > 0 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50 lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-4 text-red-600">Alertas de Seguridad</h3>
                        <div className="space-y-4">
                            {suspiciousIps.map((ip, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="text-sm font-medium text-red-900">IP Sospechosa: {ip.ip_address}</p>
                                            <p className="text-sm text-red-700">{ip.attempts} intentos en la última hora</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
