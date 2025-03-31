import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ModalSize } from '@/components/ui/crud-modal';
import UserModal from './UserModal';
import Swal from 'sweetalert2';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Circuit {
    id: number;
    name: string;
    zonal?: {
        id: number;
        short_name: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    dni: string;
    cel: string;
    circuit_id: number;
    zonificado_id: number | null;
    circuit: Circuit;
    zonificador: User | null;
    roles: { id: number; name: string }[];
}

interface Role {
    id: number;
    name: string;
}

interface Props {
    users: {
        data: User[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
        from: number;
        to: number;
    };
    circuits: Circuit[];
    zonificadores: User[];
    roles: Role[];
    filters: {
        search: string;
        page?: number;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Usuarios',
        href: '/users',
    },
];

export default function Index({ users, circuits, zonificadores, roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page?.toString() || '10');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
    const [modalSize, setModalSize] = useState<ModalSize>('md');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search !== filters.search) {
                // Mantener la página actual si solo cambia la búsqueda
                const currentPage = filters.page || users.current_page;
                router.get('/users', {
                    search,
                    page: currentPage,
                    per_page: perPage
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['users', 'filters']
                });
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, filters.search, filters.page, users.current_page, perPage]);

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        // Al cambiar registros por página, volvemos a la página 1
        router.get('/users', {
            search,
            page: 1,
            per_page: value
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['users', 'filters']
        });
    };

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Realmente deseas eliminar al usuario "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/users/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Eliminado',
                            text: `El usuario "${name}" ha sido eliminado correctamente.`,
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Error',
                            text: 'No se pudo eliminar el usuario. Intenta nuevamente.',
                            icon: 'error',
                            confirmButtonText: 'Aceptar'
                        });
                    }
                });
            }
        });
    };

    const openCreateModal = (size: ModalSize = 'lg') => {
        setSelectedUser(undefined);
        setModalSize(size);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User, size: ModalSize = 'lg') => {
        setSelectedUser(user);
        setModalSize(size);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(undefined);
    };

    const getRoleBadgeColor = (roleName: string) => {
        const colors: Record<string, string> = {
            'admin': 'bg-red-500',
            'pdv': 'bg-blue-500',
            'zonificador': 'bg-green-500',
            'supervisor': 'bg-yellow-500'
        };
        return colors[roleName] || 'bg-gray-500';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Usuarios</h1>
                    <Button onClick={() => openCreateModal()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Usuario
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        <Input
                            placeholder="Buscar usuarios..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <Select
                            value={perPage}
                            onValueChange={handlePerPageChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Registros por página" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 registros</SelectItem>
                                <SelectItem value="20">20 registros</SelectItem>
                                <SelectItem value="50">50 registros</SelectItem>
                                <SelectItem value="100">100 registros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Vista móvil: Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {users.data.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No se encontraron usuarios</p>
                        </div>
                    ) : (
                        users.data.map((user) => (
                            <Card key={user.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-bold">
                                        {user.name}
                                    </CardTitle>
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles && user.roles.length > 0 && user.roles.map(role => (
                                            <Badge key={role.id} className={getRoleBadgeColor(role.name)}>
                                                {role.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm">
                                            <span className="font-medium">DNI:</span>{' '}
                                            {user.dni}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Email:</span>{' '}
                                            {user.email}
                                        </p>
                                        <p className="text-sm flex items-center">
                                            <span className="font-medium mr-1">Celular:</span>{' '}
                                            <Phone className="h-3 w-3 mr-1" />
                                            {user.cel}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Circuito:</span>{' '}
                                            {user.circuit && user.circuit.zonal ? (
                                                <span>
                                                    <strong>{user.circuit.zonal.short_name}</strong> {user.circuit.name}
                                                </span>
                                            ) : (
                                                user.circuit?.name || 'No asignado'
                                            )}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Zonificado:</span>{' '}
                                            {user.zonificador?.name || 'No asignado'}
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="yellow"
                                                size="sm"
                                                onClick={() => openEditModal(user)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Editar usuario</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(user.id, user.name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Eliminar usuario</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                {/* Vista desktop: Tabla */}
                <div className="hidden md:block rounded-lg border border-sidebar-border/70">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>DNI</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Celular</TableHead>
                                <TableHead>Circuito</TableHead>
                                <TableHead>Zonificado</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead className="w-[100px] text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="text-center py-6"
                                    >
                                        No se encontraron usuarios
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.dni}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Phone className="h-4 w-4 mr-1" />
                                                {user.cel}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.circuit && user.circuit.zonal ? (
                                                <span>
                                                    <strong>{user.circuit.zonal.short_name}</strong> {user.circuit.name}
                                                </span>
                                            ) : (
                                                user.circuit?.name || 'No asignado'
                                            )}
                                        </TableCell>
                                        <TableCell>{user.zonificador?.name || 'No asignado'}</TableCell>
                                        <TableCell>
                                            {user.roles && user.roles.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map(role => (
                                                        <Badge key={role.id} className={getRoleBadgeColor(role.name)}>
                                                            {role.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghostYellow"
                                                            size="icon"
                                                            onClick={() => openEditModal(user)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Editar usuario</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghostRed"
                                                            size="icon"
                                                            onClick={() => handleDelete(user.id, user.name)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Eliminar usuario</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación */}
                {users.data.length > 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {users.from} a {users.to} de {users.total} registros
                        </div>
                        <Pagination links={users.links} className="mt-0" />
                    </div>
                )}
                {isModalOpen && (
                    <UserModal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        user={selectedUser}
                        size={modalSize}
                        circuits={circuits}
                        zonificadores={zonificadores}
                        roles={roles}
                    />
                )}
            </div>
        </AppLayout>
    );
}
