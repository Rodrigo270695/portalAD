import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Map, Dot, ChartLine, DollarSign, Megaphone, Users, LineChart } from 'lucide-react';
import AppLogo from './app-logo';

interface AppSidebarProps {
    collapsed?: boolean;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

interface PageProps {
    auth: {
        user: User | null;
    };
    [key: string]: unknown;
}

const allNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Zonales',
        icon: Map,
        children: [
            {
                title: 'Zonal',
                href: '/zonals',
                icon: Dot,
            },
            {
                title: 'Circuito',
                href: '/circuits',
                icon: Dot,
            }
        ]
    },
    {
        title: 'Usuarios',
        icon: Users,
        children: [
            {
                title: 'Usuario',
                href: '/users',
                icon: Dot,
            }
        ]
    },
    {
        title: 'Ventas',
        icon: ChartLine,
        children: [
            {
                title: 'Producto',
                href: '/products',
                icon: Dot,
            },
            {
                title: 'Campaña',
                href: '/campaigns',
                icon: Dot,
            },
            {
                title: 'Notificaciones',
                href: '/notifications',
                icon: Dot,
            },
            {
                title: 'Cuota',
                href: '/shares',
                icon: Dot,
            },
            {
                title: 'Venta',
                href: '/sales',
                icon: Dot,
            }
        ]
    },
    {
        title: 'Ventas PDV',
        href: '/history-sales',
        icon: LineChart,
    },
    {
        title: 'Abonos',
        href: '/payments',
        icon: DollarSign,
    },
    {
        title: 'Campañas',
        href: '/history-campaign',
        icon: Megaphone,
    }
];

export function AppSidebar({ collapsed = false }: AppSidebarProps) {
    const { props: { auth: { user } } } = usePage<PageProps>();

    // Si no hay usuario, solo mostrar el dashboard
    if (!user) {
        return (
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/dashboard" prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
            </Sidebar>
        );
    }

    // Filtrar elementos del menú según el rol del usuario
    const mainNavItems = allNavItems.filter(item => {
        // El administrador tiene acceso a todo
        if (user.roles.includes('admin')) return true;

        // QA solo tiene acceso al dashboard y grupo de ventas
        if (user.roles.includes('qa')) {
            return item.title === 'Dashboard' ||
                item.title === 'Ventas';
        }

        // PDV y zonificado solo tienen acceso a dashboard, ventas pdv, abonos y campañas
        if (user.roles.includes('pdv') || user.roles.includes('zonificado')) {
            return item.title === 'Dashboard' ||
                item.title === 'Ventas PDV' ||
                item.title === 'Abonos' ||
                item.title === 'Campañas';
        }

        return false;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} collapsed={collapsed} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
