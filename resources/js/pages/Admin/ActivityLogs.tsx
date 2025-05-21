import React, { useState, useMemo, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';
import { Activity, BarChart3, Calendar, Clock, Laptop, Phone, PieChart, Tablet, Users, ChevronDown, DownloadCloud } from 'lucide-react';
import CardDashboard from '../../components/CardDashboard';
import { useIsMobile } from '../../hooks/use-mobile';
import clsx from 'clsx';
import * as Collapsible from '@radix-ui/react-collapsible';
import { type BreadcrumbItem } from '../../types';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { Pagination } from '@/components/ui/pagination';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart as RePieChart, Pie, Cell,
    LineChart, Line,
    AreaChart, Area,
    ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActivityLogsProps {
    activities: {
        data: Array<{
            id: number;
            user_id: number;
            action: string;
            description: string;
            ip_address: string;
            user_agent: string;
            device_type: string;
            app_state: string;
            route: string;
            additional_data: any;
            created_at: string;
            user: {
                name: string;
                email: string;
                circuit?: {
                    zonal?: {
                        name: string;
                    } | null;
                } | null;
            };
        }>;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        from?: number;
        to?: number;
        total?: number;
    };
    stats: {
        general: {
            total_users: number;
            active_today: number;
            pwa_users: number;
            total_activities: number;
        };
        zonal: Array<{
            zonal_id: number;
            zonal_name: string;
            total_users: number;
            total_activities: number;
            users_with_login: number;
            total_logins: number;
        }>;
        devices: {
            phone: number;
            tablet: number;
            desktop: number;
            unknown: number;
        };
        hourly: {
            [hour: number]: number;
        };
        mostActiveUsers: Array<{
            id: number;
            name: string;
            email: string;
            activity_count: number;
        }>;
        commonActions: Array<{
            action: string;
            count: number;
        }>;
        pwa: {
            total_launches: number;
            browser_launches: number;
            pwa_launches: number;
            background_switches: number;
        };
        daily: {
            [day: string]: number;
        };
        mostActiveByZonal: Array<{
            pdv_name: string;
            pdv_email: string;
            zonal_name: string;
            login_count: number;
        }>;
    };
    users: Array<{
        id: number;
        name: string;
        email: string;
    }>;
    zonales: Array<{
        id: number;
        name: string;
    }>;
    filters: {
        user_id?: number;
        action?: string;
        date_from?: string;
        date_to?: string;
        zonal_id?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Registros de Actividad',
        href: '/activity-logs',
    },
];

const COLORS = {
    primary: 'var(--chart-1)',
    secondary: 'var(--chart-2)',
    tertiary: 'var(--chart-3)',
    quaternary: 'var(--chart-4)',
    accent: 'var(--chart-5)',
};

const TIME_ZONE = 'America/Lima';

const DATE_RANGES = {
    today: {
        label: 'Hoy',
        getValue: () => ({
            start: new Date(),
            end: new Date()
        })
    },
    yesterday: {
        label: 'Ayer',
        getValue: () => ({
            start: new Date(new Date().setDate(new Date().getDate() - 1)),
            end: new Date(new Date().setDate(new Date().getDate() - 1))
        })
    },
    lastWeek: {
        label: 'Última semana',
        getValue: () => {
            const today = new Date();
            const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
            const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
            return {
                start: firstDay,
                end: lastDay
            };
        }
    },
    lastMonth: {
        label: 'Último mes',
        getValue: () => {
            const date = new Date();
            return {
                start: new Date(date.getFullYear(), date.getMonth(), 1),
                end: new Date(date.getFullYear(), date.getMonth() + 1, 0)
            };
        }
    }
};

interface ActivityLogData {
    id: number;
    user: {
        name: string;
        email: string;
        circuit?: {
            zonal?: {
                name: string;
            } | null;
        } | null;
    };
    action: string;
    ip_address: string;
    created_at: string;
    additional_data: {
        response_time?: number;
        device_type?: string;
    };
}

export default function ActivityLogs({ activities, stats, users, zonales, filters }: ActivityLogsProps) {
    const isMobile = useIsMobile();
    const [selectedDateRange, setSelectedDateRange] = useState('custom');
    const [dateRange, setDateRange] = useState({
        start: filters.date_from ? new Date(filters.date_from) : null,
        end: filters.date_to ? new Date(filters.date_to) : null
    });
    const [isLoading, setIsLoading] = useState(false);

    // Ordenar usuarios alfabéticamente
    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => a.name.localeCompare(b.name));
    }, [users]);

    // Preparar datos para el gráfico de usuarios por zonal con valores por defecto
    const zonalUsersData = useMemo(() => {
        return (stats?.zonal || []).map(zonal => ({
            name: zonal.zonal_name || 'Sin nombre',
            usuarios: zonal.total_users || 0,
            activos: zonal.users_with_login || 0,
            actividades: zonal.total_activities || 0
        })).sort((a, b) => b.usuarios - a.usuarios);
    }, [stats?.zonal]);

    // Preparar datos para el gráfico de dispositivos con valores por defecto
    const deviceData = useMemo(() => {
        const devices = stats?.devices || { phone: 0, tablet: 0, desktop: 0, unknown: 0 };
        return Object.entries(devices).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: value || 0
        }));
    }, [stats?.devices]);

    // Preparar datos para el gráfico de actividad por hora con valores por defecto
    const hourlyData = useMemo(() => {
        const hours = stats?.hourly || {};
        return Object.entries(hours).map(([hour, count]) => ({
            hour: `${hour.padStart(2, '0')}:00`,
            count: count || 0
        }));
    }, [stats?.hourly]);

    // Preparar datos para el gráfico de actividad diaria con valores por defecto
    const dailyActivityData = useMemo(() => {
        const daily = stats?.daily || {};
        return Object.entries(daily).map(([day, count]) => ({
            day,
            actividades: count || 0
        }));
    }, [stats?.daily]);

    // Preparar datos para el gráfico de acciones comunes con valores por defecto
    const actionsData = useMemo(() => {
        return (stats?.commonActions || []).map(action => ({
            name: action.action || 'Desconocido',
            cantidad: action.count || 0
        }));
    }, [stats?.commonActions]);

    // Preparar datos para el gráfico de uso de PWA con valores por defecto
    const pwaData = useMemo(() => {
        const pwaStats = stats?.pwa || {
            pwa_launches: 0,
            browser_launches: 0,
            total_launches: 0,
            background_switches: 0
        };
        return [
            { name: 'PWA', value: pwaStats.pwa_launches },
            { name: 'Navegador', value: pwaStats.browser_launches }
        ];
    }, [stats?.pwa]);

    // Función para actualizar los filtros
    const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
        setIsLoading(true);
        router.get('/activity-logs',
            {
                ...filters,
                ...newFilters
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false)
            }
        );
    }, [filters]);

    // Manejador para el cambio de rango de fechas
    const handleDateRangeChange = useCallback((range: string) => {
        if (range === 'custom') {
            setSelectedDateRange('custom');
            return;
        }

        const selectedRange = DATE_RANGES[range as keyof typeof DATE_RANGES];
        if (selectedRange) {
            const { start, end } = selectedRange.getValue();
            setDateRange({ start, end });
            setSelectedDateRange(range);

            updateFilters({
                date_from: format(start, 'yyyy-MM-dd'),
                date_to: format(end, 'yyyy-MM-dd')
            });
        }
    }, [updateFilters]);

    // Manejador para el cambio de fechas personalizadas
    const handleCustomDateChange = useCallback((type: 'start' | 'end', dateStr: string | null) => {
        if (!dateStr) {
            setDateRange(prev => ({
                ...prev,
                [type]: null
            }));
            return;
        }

        // Ajustamos la fecha para que sea a las 12:00 PM (mediodía) en la zona horaria local
        // Esto evita problemas con la conversión de zona horaria
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day, 12, 0, 0);

        setDateRange(prev => ({
            ...prev,
            [type]: date
        }));

        // Mantenemos el formato YYYY-MM-DD para el backend
        updateFilters({
            [`date_${type === 'start' ? 'from' : 'to'}`]: dateStr
        });
    }, [updateFilters]);

    // Manejador para el cambio de usuario
    const handleUserChange = useCallback((userId: string) => {
        updateFilters({
            user_id: userId === 'all' ? undefined : parseInt(userId)
        });
    }, [updateFilters]);

    // Manejador para el cambio de zonal
    const handleZonalChange = useCallback((zonalId: string) => {
        updateFilters({
            zonal_id: zonalId === 'all' ? undefined : parseInt(zonalId)
        });
    }, [updateFilters]);

    // Manejador para la exportación a Excel
    const handleExport = useCallback(() => {
        const params = new URLSearchParams();
        if (filters.user_id) params.append('user_id', filters.user_id.toString());
        if (filters.action) params.append('action', filters.action);
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);
        if (filters.zonal_id) params.append('zonal_id', filters.zonal_id.toString());

        window.location.href = `/activity-logs/export?${params.toString()}`;
    }, [filters]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registros de Actividad" />
            <div className="flex flex-col gap-6 p-6">
                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-neutral-200/50">
                    <div className="flex-1 flex flex-col md:flex-row gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full md:w-[240px]"
                                    disabled={isLoading}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {selectedDateRange === 'custom' ? 'Rango personalizado' : DATE_RANGES[selectedDateRange as keyof typeof DATE_RANGES]?.label}
                                    <ChevronDown className="ml-auto h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[240px]">
                                {Object.entries(DATE_RANGES).map(([key, { label }]) => (
                                    <DropdownMenuItem
                                        key={key}
                                        onClick={() => handleDateRangeChange(key)}
                                    >
                                        {label}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem onClick={() => handleDateRangeChange('custom')}>
                                    Personalizado
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {selectedDateRange === 'custom' && (
                            <div className="flex gap-4">
                                <Input
                                    type="date"
                                    value={dateRange.start ? format(dateRange.start, 'yyyy-MM-dd') : ''}
                                    onChange={(e) => handleCustomDateChange('start', e.target.value)}
                                    className="w-full md:w-auto"
                                    disabled={isLoading}
                                />
                                <Input
                                    type="date"
                                    value={dateRange.end ? format(dateRange.end, 'yyyy-MM-dd') : ''}
                                    onChange={(e) => handleCustomDateChange('end', e.target.value)}
                                    className="w-full md:w-auto"
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                    </div>

                    <Select
                        value={filters.zonal_id?.toString() || 'all'}
                        onValueChange={handleZonalChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Filtrar por zonal" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las zonales</SelectItem>
                            {zonales.map((zonal) => (
                                <SelectItem key={zonal.id} value={zonal.id.toString()}>
                                    {zonal.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.user_id?.toString() || 'all'}
                        onValueChange={handleUserChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Filtrar por usuario" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los usuarios</SelectItem>
                            {sortedUsers.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={isLoading}
                        className="w-full md:w-auto"
                    >
                        <DownloadCloud className="mr-2 h-4 w-4" />
                        Exportar Excel
                    </Button>
                </div>

                {/* Estado de carga */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="text-sm text-neutral-600">Cargando...</span>
                        </div>
                    </div>
                )}

                {/* Estadísticas Generales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 rounded-lg p-3">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Usuarios Totales</p>
                                <p className="text-2xl font-semibold text-neutral-900">{stats?.general?.total_users || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 rounded-lg p-3">
                                <Activity className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Activos Hoy</p>
                                <p className="text-2xl font-semibold text-neutral-900">{stats?.general?.active_today || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-100 rounded-lg p-3">
                                <PieChart className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Usuarios PWA</p>
                                <p className="text-2xl font-semibold text-neutral-900">{stats?.general?.pwa_users || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="bg-amber-100 rounded-lg p-3">
                                <BarChart3 className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Total Actividades</p>
                                <p className="text-2xl font-semibold text-neutral-900">{stats?.general?.total_activities || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200/50">
                        <h3 className="text-base md:text-lg font-semibold mb-4">Distribución de Dispositivos</h3>
                        <div className="w-full h-[250px] md:h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={deviceData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => isMobile ? `${(percent * 100).toFixed(0)}%` : `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={isMobile ? 60 : 80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {deviceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % Object.keys(COLORS).length as keyof typeof COLORS]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200/50">
                        <h3 className="text-base md:text-lg font-semibold mb-4">Actividad por Hora</h3>
                        <div className="w-full h-[250px] md:h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={hourlyData}
                                    margin={{
                                        top: 5,
                                        right: isMobile ? 10 : 30,
                                        left: isMobile ? 10 : 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="hour"
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                        interval={isMobile ? 2 : 0}
                                    />
                                    <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                                    <Bar dataKey="count" name="Actividades" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfico de usuarios por zonal */}
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200/50 lg:col-span-2">
                        <h3 className="text-base md:text-lg font-semibold mb-4">Usuarios por Zonal</h3>
                        <div className="w-full h-[300px] md:h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={zonalUsersData}
                                    margin={{
                                        top: 20,
                                        right: isMobile ? 10 : 30,
                                        left: isMobile ? 10 : 20,
                                        bottom: isMobile ? 90 : 70
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={70}
                                        interval={0}
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                    />
                                    <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(0, 0, 0, 0.05)',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            fontSize: isMobile ? '12px' : '14px'
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
                                        verticalAlign={isMobile ? "bottom" : "top"}
                                        height={isMobile ? 50 : 36}
                                    />
                                    <Bar
                                        dataKey="usuarios"
                                        name="Total Usuarios"
                                        fill={COLORS.primary}
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="activos"
                                        name="Usuarios Activos"
                                        fill={COLORS.secondary}
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="actividades"
                                        name="Total Actividades"
                                        fill={COLORS.tertiary}
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Nueva sección de gráficos avanzados */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {/* Gráfico de Actividad Semanal */}
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200/50">
                        <h3 className="text-base md:text-lg font-semibold mb-4">Actividad por Día de la Semana</h3>
                        <div className="h-[250px] md:h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={dailyActivityData}
                                    margin={{
                                        top: 5,
                                        right: isMobile ? 10 : 30,
                                        left: isMobile ? 10 : 20,
                                        bottom: 5,
                                    }}
                                >
                                    <defs>
                                        <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                        interval={isMobile ? 1 : 0}
                                    />
                                    <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="actividades"
                                        stroke={COLORS.primary}
                                        fillOpacity={1}
                                        fill="url(#colorActivities)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfico Radar de Acciones */}
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200/50">
                        <h3 className="text-base md:text-lg font-semibold mb-4">Distribución de Acciones</h3>
                        <div className="h-[250px] md:h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart
                                    outerRadius={isMobile ? 70 : 90}
                                    data={actionsData.slice(0, isMobile ? 6 : 8)}
                                >
                                    <PolarGrid />
                                    <PolarAngleAxis
                                        dataKey="name"
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                    />
                                    <PolarRadiusAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                                    <Radar
                                        name="Acciones"
                                        dataKey="cantidad"
                                        stroke={COLORS.secondary}
                                        fill={COLORS.secondary}
                                        fillOpacity={0.6}
                                    />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Comparativa PWA vs Navegador */}
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200/50">
                        <h3 className="text-base md:text-lg font-semibold mb-4">PWA vs Navegador</h3>
                        <div className="h-[250px] md:h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={pwaData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={isMobile ? 45 : 60}
                                        outerRadius={isMobile ? 65 : 80}
                                        fill={COLORS.tertiary}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            isMobile ?
                                            `${(percent * 100).toFixed(0)}%` :
                                            `${name} ${(percent * 100).toFixed(0)}%`
                                        }
                                    >
                                        {pwaData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index === 0 ? COLORS.primary : COLORS.secondary}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 md:gap-4">
                            <div className="text-center p-2 md:p-3 bg-neutral-50 rounded-lg">
                                <p className="text-xs md:text-sm text-neutral-600">Total Lanzamientos</p>
                                <p className="text-lg md:text-xl font-semibold text-neutral-900">
                                    {stats?.pwa.total_launches || 0}
                                </p>
                            </div>
                            <div className="text-center p-2 md:p-3 bg-neutral-50 rounded-lg">
                                <p className="text-xs md:text-sm text-neutral-600">Cambios en Segundo Plano</p>
                                <p className="text-lg md:text-xl font-semibold text-neutral-900">
                                    {stats?.pwa.background_switches || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tendencia de Actividad */}
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-neutral-200/50">
                        <h3 className="text-base md:text-lg font-semibold mb-4">Tendencia de Actividad por Hora</h3>
                        <div className="h-[250px] md:h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={hourlyData}
                                    margin={{
                                        top: 5,
                                        right: isMobile ? 10 : 30,
                                        left: isMobile ? 10 : 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="hour"
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                        interval={isMobile ? 2 : 0}
                                    />
                                    <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke={COLORS.quaternary}
                                        strokeWidth={2}
                                        dot={{ fill: COLORS.quaternary, r: isMobile ? 3 : 4 }}
                                        activeDot={{ r: isMobile ? 6 : 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Tabla de Actividades */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-neutral-200/50">
                        <h3 className="text-base md:text-lg font-semibold">Registro de Actividades</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50/50">
                                <tr>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-neutral-500">Usuario</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-neutral-500">Zonal</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-neutral-500">Acción</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-neutral-500">Dispositivo</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-neutral-500">IP</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-neutral-500">Fecha</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-neutral-500">Tiempo de respuesta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/50">
                                {(activities.data || []).map((activity, index) => (
                                    <tr key={index} className="hover:bg-neutral-50/50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-neutral-900">{activity.user?.name || '-'}</div>
                                            <div className="text-sm text-neutral-500">{activity.user?.email || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {activity.user?.circuit?.zonal?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                activity.action?.includes('login') ? 'bg-green-100 text-green-800' :
                                                activity.action?.includes('logout') ? 'bg-red-100 text-red-800' :
                                                activity.action?.includes('created') ? 'bg-blue-100 text-blue-800' :
                                                activity.action?.includes('updated') ? 'bg-yellow-100 text-yellow-800' :
                                                activity.action?.includes('deleted') ? 'bg-red-100 text-red-800' :
                                                'bg-neutral-100 text-neutral-800'
                                            }`}>
                                                {activity.action || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {activity.additional_data?.device_type || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {activity.ip_address || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {activity.created_at ? format(new Date(activity.created_at), 'PPpp', { locale: es }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {activity.additional_data?.response_time ? (
                                                <span className="text-xs text-neutral-500">
                                                    {Math.round(activity.additional_data.response_time)}ms
                                                </span>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {activities.data?.length > 0 && (
                        <div className="px-3 md:px-6 py-3 md:py-4 border-t border-neutral-200/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-xs md:text-sm text-neutral-500">
                                Mostrando {activities.from || 0} a {activities.to || 0} de {activities.total || 0} registros
                            </div>
                            <Pagination links={activities.links || []} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
