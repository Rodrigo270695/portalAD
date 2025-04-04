import CrudModal, { ModalSize } from '@/components/ui/crud-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Phone, User2, Mail, Lock, Route, Users } from 'lucide-react';

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
    roles: { id: number; name: string }[];
}

interface Role {
    id: number;
    name: string;
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
    size?: ModalSize;
    circuits: Circuit[];
    zonificadores: User[];
    roles: Role[];
}

export default function UserModal({ isOpen, onClose, user, size = 'lg', circuits, zonificadores, roles }: UserModalProps) {
    const isEditing = !!user;
    const [activeTab, setActiveTab] = useState('general');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        name: string;
        email: string;
        dni: string;
        cel: string;
        password: string;
        password_confirmation: string;
        circuit_id: number;
        zonificado_id: number | null;
        role: string;
    }>({
        name: '',
        email: '',
        dni: '',
        cel: '',
        password: '',
        password_confirmation: '',
        circuit_id: circuits[0]?.id || 0,
        zonificado_id: null,
        role: 'pdv',
    });

    useEffect(() => {
        if (isOpen) {
            // Solo inicializar el formulario si no hay errores previos
            if (Object.keys(errors).length === 0) {
                if (isEditing && user) {
                    setData({
                        name: user.name || '',
                        email: user.email || '',
                        dni: user.dni || '',
                        cel: user.cel || '',
                        password: '',
                        password_confirmation: '',
                        circuit_id: user.circuit_id || circuits[0]?.id || 0,
                        zonificado_id: user.zonificado_id || null,
                        role: user.roles && user.roles.length > 0 ? user.roles[0].name : 'pdv',
                    });
                } else if (!isEditing) {
                    reset();
                    setData({
                        name: '',
                        email: '',
                        dni: '',
                        cel: '',
                        password: '',
                        password_confirmation: '',
                        circuit_id: circuits[0]?.id || 0,
                        zonificado_id: null,
                        role: 'pdv',
                    });
                }
            }
            setActiveTab('general');
        } else {
            reset();
            clearErrors();
        }
    }, [isOpen, user, setData, reset, clearErrors, circuits, isEditing, errors]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        setData('name', value);
    };

    const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
        setData('dni', value);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value === '' || value.startsWith('9')) {
            setData('cel', value.slice(0, 9));
        }
    };

    const handleSubmit = (e?: FormEvent) => {
        if (e) e.preventDefault();

        const submitForm = isEditing ? put : post;
        const url = isEditing ? `/users/${user.id}` : '/users';

        submitForm(url, {
            onSuccess: () => {
                toast.success({
                    title: isEditing ? "Usuario actualizado" : "Usuario creado",
                    description: `El usuario "${data.name}" ha sido ${isEditing ? 'actualizado' : 'creado'} correctamente.`
                });
                reset();
                clearErrors();
                onClose();
            },
            onError: () => {
                // Mostrar un toast de error general
                toast.error({
                    title: "Error",
                    description: "Ha ocurrido un error al procesar el formulario. Por favor, verifica los datos ingresados."
                });
                // Los errores específicos se manejan automáticamente por Inertia
            },
            // Preservar el estado del formulario cuando hay errores
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    return (
        <CrudModal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? 'Editar Usuario' : 'Crear Usuario'}
            description={isEditing ? 'Modifica los datos del usuario seleccionado.' : 'Ingresa los datos para crear un nuevo usuario.'}
            size={size}
            isProcessing={processing}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Actualizar' : 'Guardar'}
            preventCloseOnClickOutside={true}
        >
            <form id="userForm" className="space-y-4" onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="general">Información General</TabsTrigger>
                        <TabsTrigger value="security">Seguridad y Acceso</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <div className="mb-1">
                                    <Label htmlFor="name" className={classNames({ 'text-destructive': errors.name })} required>
                                        Nombre Completo
                                    </Label>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                        <User2 size={18} />
                                    </div>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={handleNameChange}
                                        className={classNames('pl-10', { 'border-destructive': errors.name })}
                                        placeholder="Nombre completo"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <div className="mb-1">
                                    <Label htmlFor="email" className={classNames({ 'text-destructive': errors.email })}>
                                        Correo Electrónico
                                    </Label>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                        <Mail size={18} />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={classNames('pl-10', { 'border-destructive': errors.email })}
                                        placeholder="Correo electrónico"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <div className="mb-1">
                                    <Label htmlFor="dni" className={classNames({ 'text-destructive': errors.dni })} required>
                                        DNI
                                    </Label>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                        <CreditCard size={18} />
                                    </div>
                                    <Input
                                        id="dni"
                                        value={data.dni}
                                        onChange={handleDniChange}
                                        className={classNames('pl-10 pr-16', { 'border-destructive': errors.dni })}
                                        placeholder="Ingresa DNI (8 dígitos)"
                                        maxLength={8}
                                        pattern="[0-9]{8}"
                                        title="El DNI debe contener 8 dígitos numéricos"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                                        {data.dni.length}/8
                                    </div>
                                </div>
                                {errors.dni && (
                                    <p className="text-sm text-destructive mt-1">{errors.dni}</p>
                                )}
                            </div>

                            <div>
                                <div className="mb-1">
                                    <Label htmlFor="cel" className={classNames({ 'text-destructive': errors.cel })} required>
                                        Celular
                                    </Label>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                        <Phone size={18} />
                                    </div>
                                    <Input
                                        id="cel"
                                        value={data.cel}
                                        onChange={handlePhoneChange}
                                        className={classNames('pl-10 pr-16', { 'border-destructive': errors.cel })}
                                        placeholder="Ingresa celular (9 dígitos)"
                                        maxLength={9}
                                        pattern="9[0-9]{8}"
                                        title="El celular debe empezar con 9 y tener 9 dígitos"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                                        {data.cel.length}/9
                                    </div>
                                </div>
                                {errors.cel && (
                                    <p className="text-sm text-destructive mt-1">{errors.cel}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="col-span-1 sm:col-span-2">
                                <div className="mb-1">
                                    <Label htmlFor="circuit_id" className={classNames({ 'text-destructive': errors.circuit_id })} required>
                                        Circuito
                                    </Label>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 z-10">
                                        <Route size={18} />
                                    </div>
                                    <Select
                                        value={data.circuit_id.toString()}
                                        onValueChange={(value) => setData('circuit_id', parseInt(value))}
                                    >
                                        <SelectTrigger className={classNames('pl-10', { 'border-destructive': errors.circuit_id })}>
                                            <SelectValue placeholder="Seleccione un Circuito" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {circuits.map((circuit) => (
                                                <SelectItem key={circuit.id} value={circuit.id.toString()}>
                                                    {circuit.name} {circuit.zonal && `(${circuit.zonal.short_name})`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {errors.circuit_id && (
                                    <p className="text-sm text-destructive mt-1">{errors.circuit_id}</p>
                                )}
                            </div>

                            <div className="col-span-1 sm:col-span-2">
                                <div className="mb-1">
                                    <Label htmlFor="zonificado_id" className={classNames({ 'text-destructive': errors.zonificado_id })}>
                                        Zonificador
                                    </Label>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 z-10">
                                        <Users size={18} />
                                    </div>
                                    <Select
                                        value={data.zonificado_id?.toString() || 'null'}
                                        onValueChange={(value) => setData('zonificado_id', value === 'null' ? null : parseInt(value))}
                                    >
                                        <SelectTrigger className={classNames('pl-10', { 'border-destructive': errors.zonificado_id })}>
                                            <SelectValue placeholder="Seleccione un Zonificador" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="null">Ninguno</SelectItem>
                                            {zonificadores.map((zonificador) => (
                                                <SelectItem key={zonificador.id} value={zonificador.id.toString()}>
                                                    {zonificador.name} ({zonificador.dni})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {errors.zonificado_id && (
                                    <p className="text-sm text-destructive mt-1">{errors.zonificado_id}</p>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4 pt-4">
                        <div>
                            <div className="mb-1">
                                <Label htmlFor="role" className={classNames({ 'text-destructive': errors.role })} required>
                                    Rol de Usuario
                                </Label>
                            </div>
                            <RadioGroup
                                value={data.role}
                                onValueChange={(value) => setData('role', value)}
                                className="grid grid-cols-2 gap-4"
                            >
                                {roles.map((role) => (
                                    <div key={role.id} className="flex items-center space-x-2 border p-3 rounded-md">
                                        <RadioGroupItem value={role.name} id={`role-${role.id}`} />
                                        <Label htmlFor={`role-${role.id}`} className="cursor-pointer">
                                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                            {errors.role && (
                                <p className="text-sm text-destructive mt-1">{errors.role}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <div className="mb-1">
                                    <Label htmlFor="password" className={classNames({ 'text-destructive': errors.password })} required={!isEditing}>
                                        Contraseña {isEditing && "(dejar en blanco para mantener)"}
                                    </Label>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                        <Lock size={18} />
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={classNames('pl-10', { 'border-destructive': errors.password })}
                                        placeholder={isEditing ? "••••••••" : 'Ingresa contraseña'}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-destructive mt-1">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <div className="mb-1">
                                    <Label htmlFor="password_confirmation" className={classNames({ 'text-destructive': errors.password_confirmation })} required={!isEditing}>
                                        Confirmar Contraseña
                                    </Label>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                        <Lock size={18} />
                                    </div>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={classNames('pl-10', { 'border-destructive': errors.password_confirmation })}
                                        placeholder={isEditing ? "••••••••" : 'Confirma contraseña'}
                                    />
                                </div>
                                {errors.password_confirmation && (
                                    <p className="text-sm text-destructive mt-1">{errors.password_confirmation}</p>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </CrudModal>
    );
}
