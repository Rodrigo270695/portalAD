import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { type PageProps } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props extends PageProps {
    auth: {
        user: User;
    };
}

export function NavUser() {
    const { props } = usePage<Props>();
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <SidebarMenu>
            <SidebarMenuItem className={isMobile ? "w-full" : ""}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton 
                            size="lg" 
                            className={cn(
                                "text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group w-full",
                                isMobile && "sticky bottom-0"
                            )}
                        >
                            <UserInfo user={props.auth.user} />
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={isMobile ? 'top' : state === 'collapsed' ? 'left' : 'top'}
                    >
                        <UserMenuContent user={props.auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
