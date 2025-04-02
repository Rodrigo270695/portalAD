import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Map, Dot, ChartLine, DollarSign, Megaphone, Users } from 'lucide-react';
import AppLogo from './app-logo';

interface AppSidebarProps {
    collapsed?: boolean;
}

const mainNavItems: NavItem[] = [
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
                title: 'Venta',
                href: '/sales',
                icon: Dot,
            }
        ]
    },
    {
        title: 'Ventas PDV',
        href: '/sales-pdv',
        icon: ChartLine,
    },
    {
        title: 'Abonos',
        href: '/payments',
        icon: DollarSign,
    },
    {
        title: 'Campañas',
        href: '/campaigns',
        icon: Megaphone,
    }
];

export function AppSidebar({ collapsed = false }: AppSidebarProps) {
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
