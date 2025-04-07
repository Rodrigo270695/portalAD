import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const menuItemVariants = {
    initial: { opacity: 0, y: -5 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -5 }
};

const submenuVariants = {
    initial: { opacity: 0, scaleX: 0.5, x: -20 },
    animate: { opacity: 1, scaleX: 1, x: 0 },
    exit: { opacity: 0, scaleX: 0.5, x: -20 }
};

const childVariants = {
    initial: { x: -10, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -10, opacity: 0 }
};

interface NavMainProps {
    items: Array<NavItem>;
    collapsed?: boolean;
}

const STORAGE_KEY = 'sidebar_expanded_items';

export function NavMain({ items = [], collapsed = false }: NavMainProps) {
    const page = usePage();
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    });

    // Actualizar localStorage cuando cambia expandedItems
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedItems));
    }, [expandedItems]);

    // Auto-expandir el ítem padre cuando la página actual es un hijo
    useEffect(() => {
        items.forEach(item => {
            if (item.children?.some(child => page.url.startsWith(child.href || ''))) {
                setExpandedItems(prev => ({
                    ...prev,
                    [item.title]: true
                }));
            }
        });
    }, [page.url, items]);

    const toggleExpanded = (title: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const renderMenuItem = (item: NavItem) => {
        const isExpanded = expandedItems[item.title] ?? false;
        const hasChildren = item.children && item.children.length > 0;
        const isActive = hasChildren
            ? item.children?.some(child => page.url.startsWith(child.href || ''))
            : item.href === '/sales-history'
                ? page.url === item.href // Ventas PDV debe coincidir exactamente
                : page.url.startsWith(item.href || '');

        if (hasChildren) {
            return (
                <motion.div
                    key={item.title}
                    variants={menuItemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="group relative"
                >
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => toggleExpanded(item.title)}
                            isActive={isActive}
                            tooltip={{ children: item.title, side: collapsed ? "right" : "top" }}
                            className={cn(
                                "transition-colors duration-200",
                                collapsed ? "w-full flex items-center justify-center p-2" : "flex items-center gap-2"
                            )}
                        >
                            <div className={cn(
                                "flex items-center justify-center",
                                !collapsed && "mr-2"
                            )}>
                                {item.icon && (
                                    <item.icon className={cn(
                                        "h-4 w-4 shrink-0 transition-transform duration-200",
                                        collapsed && "h-5 w-5"
                                    )} />
                                )}
                            </div>
                            {!collapsed && (
                                <>
                                    <span>{item.title}</span>
                                    <motion.div
                                        initial={false}
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                        className="ml-auto"
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </motion.div>
                                </>
                            )}
                        </SidebarMenuButton>
                        <AnimatePresence initial={false}>
                            {((isExpanded && !collapsed) || (collapsed && (isExpanded || isActive))) && item.children && (
                                <motion.div
                                    variants={submenuVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className={cn(
                                        "overflow-hidden",
                                        collapsed ? [
                                            "absolute left-12 top-0 z-50 min-w-[180px]",
                                            "rounded-md border bg-background/95 p-1 shadow-md",
                                            "backdrop-blur-sm"
                                        ] : "ml-0.5 mt-1"
                                    )}
                                    style={{
                                        transformOrigin: collapsed ? "0 0" : "center center"
                                    }}
                                >
                                    <SidebarMenu className={cn(
                                        "space-y-1",
                                        !collapsed && "pl-3"
                                    )}>
                                        {item.children?.map((child: NavItem) => (
                                            <motion.div
                                                key={child.title}
                                                variants={childVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                transition={{ duration: 0.2 }}
                                            >
                                                <SidebarMenuItem>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={page.url === child.href}
                                                        tooltip={{ children: child.title, side: "right" }}
                                                        className="transition-colors duration-200 hover:bg-accent/80"
                                                    >
                                                        <Link
                                                            href={child.href || ''}
                                                            prefetch
                                                            className={cn(
                                                                collapsed ? "w-full flex items-center justify-center p-2" : "flex w-full items-center gap-2 p-2"
                                                            )}
                                                            preserveScroll
                                                            preserveState
                                                        >
                                                            <div className={cn(
                                                                "flex items-center justify-center",
                                                                !collapsed && "mr-2"
                                                            )}>
                                                                {child.icon && <child.icon className={cn(
                                                                    "h-4 w-4 shrink-0 transition-transform duration-200",
                                                                    collapsed && "h-5 w-5"
                                                                )} />}
                                                            </div>
                                                            {!collapsed && <span>{child.title}</span>}
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            </motion.div>
                                        ))}
                                    </SidebarMenu>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </SidebarMenuItem>
                </motion.div>
            );
        }

        return (
            <motion.div
                key={item.title}
                variants={menuItemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={{ children: item.title, side: collapsed ? "right" : "top" }}
                        className={cn(
                            "transition-colors duration-200 hover:bg-accent/80",
                            collapsed ? "w-full flex items-center justify-center p-2" : "flex w-full items-center gap-2 p-2"
                        )}
                    >
                        <Link
                            href={item.href || ''}
                            prefetch
                            className={cn(
                                collapsed ? "w-full flex items-center justify-center p-2" : "flex w-full items-center gap-2 p-2"
                            )}
                            preserveScroll
                            preserveState
                        >
                            <div className={cn(
                                "flex items-center justify-center",
                                !collapsed && "mr-2"
                            )}>
                                {item.icon && (
                                    <item.icon className={cn(
                                        "h-4 w-4 shrink-0 transition-transform duration-200",
                                        collapsed && "h-5 w-5"
                                    )} />
                                )}
                            </div>
                            {!collapsed && <span>{item.title}</span>}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </motion.div>
        );
    };

    return (
        <SidebarGroup className="px-2 py-0">
            {!collapsed && <SidebarGroupLabel>Platform</SidebarGroupLabel>}
            <SidebarMenu>
                <AnimatePresence>
                    {items.map(renderMenuItem)}
                </AnimatePresence>
            </SidebarMenu>
        </SidebarGroup>
    );
}
