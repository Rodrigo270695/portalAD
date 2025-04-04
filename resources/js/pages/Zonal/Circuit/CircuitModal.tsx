import CrudModal, { ModalSize } from '@/components/ui/crud-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import classNames from 'classnames';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Route, MapPin, Building2 } from 'lucide-react';

interface Zonal {
    id: number;
    name: string;
    short_name: string;
}

interface Circuit {
    id: number;
    name: string;
    address: string | null;
    active: boolean;
    zonal_id: number;
    zonal?: Zonal;
}

interface CircuitModalProps {
    isOpen: boolean;
    onClose: () => void;
    circuit?: Circuit | null;
    size?: ModalSize;
    zonals: Zonal[];
}

export default function CircuitModal({ isOpen, onClose, circuit, size = 'md', zonals }: CircuitModalProps) {
    const isEditing = !!circuit;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        name: string;
        address: string;
        active: boolean;
        zonal_id: number;
    }>({
        name: '',
        address: '',
        active: true,
        zonal_id: zonals[0]?.id || 0,
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                name: circuit?.name || '',
                address: circuit?.address || '',
                active: circuit?.active ?? true,
                zonal_id: circuit?.zonal_id || zonals[0]?.id || 0,
            });
        } else {
            reset();
            clearErrors();
        }
    }, [isOpen, circuit, setData, reset, clearErrors, zonals]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setData('name', value);
    };

    const handleSubmit = (e?: FormEvent) => {
        if (e) e.preventDefault();

        const submitForm = isEditing ? put : post;
        const url = isEditing ? `/circuits/${circuit.id}` : '/circuits';

        submitForm(url, {
            onSuccess: () => {
                toast.success({
                    title: isEditing ? "Circuito actualizado" : "Circuito creado",
                    description: `El circuito "${data.name}" ha sido ${isEditing ? 'actualizado' : 'creado'} correctamente.`
                });
                reset();
                clearErrors();
                onClose();
            }
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
            title={isEditing ? 'Editar Circuito' : 'Crear Circuito'}
            description={isEditing ? 'Modifica los datos del circuito seleccionado.' : 'Ingresa los datos para crear un nuevo circuito.'}
            size={size}
            isProcessing={processing}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Actualizar' : 'Guardar'}
            preventCloseOnClickOutside={true}
        >
            <form id="circuitForm" className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="zonal_id" className={classNames({ 'text-destructive': errors.zonal_id })} required>
                                    Zonal
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 z-10">
                                    <Building2 size={18} />
                                </div>
                                <Select
                                    value={data.zonal_id.toString()}
                                    onValueChange={(value) => setData('zonal_id', parseInt(value))}
                                >
                                    <SelectTrigger className={classNames('pl-10', { 'border-destructive': errors.zonal_id })}>
                                        <SelectValue placeholder="Seleccione un Zonal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {zonals.map((zonal) => (
                                            <SelectItem key={zonal.id} value={zonal.id.toString()}>
                                                {zonal.name} ({zonal.short_name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.zonal_id && (
                                <p className="text-sm text-destructive mt-1">{errors.zonal_id}</p>
                            )}
                        </div>

                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="name" className={classNames({ 'text-destructive': errors.name })} required>
                                    Nombre
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                    <Route size={18} />
                                </div>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    className={classNames('pl-10', { 'border-destructive': errors.name })}
                                    placeholder="Nombre del circuito"
                                />
                            </div>
                            {errors.name && (
                                <p className="text-sm text-destructive mt-1">{errors.name}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="address" className={classNames({ 'text-destructive': errors.address })}>
                                    Dirección
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-2.5 text-blue-600">
                                    <MapPin size={18} />
                                </div>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('address', e.target.value)}
                                    className={classNames('pl-10', { 'border-destructive': errors.address })}
                                    placeholder="Dirección del circuito"
                                    rows={4}
                                />
                            </div>
                            {errors.address && (
                                <p className="text-sm text-destructive mt-1">{errors.address}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="active"
                            checked={data.active}
                            onCheckedChange={(checked) => setData('active', checked as boolean)}
                        />
                        <Label htmlFor="active">Activo</Label>
                    </div>
                </div>
            </form>
        </CrudModal>
    );
}
