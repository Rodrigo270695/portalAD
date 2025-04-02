import CrudModal, { ModalSize } from '@/components/ui/crud-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import classNames from 'classnames';
import { Building2, Hash } from 'lucide-react';

interface Zonal {
    id: number;
    name: string;
    short_name: string;
    active: boolean;
}

interface ZonalModalProps {
    isOpen: boolean;
    onClose: () => void;
    zonal?: Zonal;
    size?: ModalSize;
}

export default function ZonalModal({ isOpen, onClose, zonal, size = 'md' }: ZonalModalProps) {
    const isEditing = !!zonal;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        name: string;
        short_name: string;
        active: boolean;
    }>({
        name: '',
        short_name: '',
        active: true,
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                name: zonal?.name || '',
                short_name: zonal?.short_name || '',
                active: zonal?.active ?? true,
            });
        } else {
            reset();
            clearErrors();
        }
    }, [isOpen, zonal, setData, reset, clearErrors]);

    const capitalizeFirstLetter = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = capitalizeFirstLetter(e.target.value);
        setData('name', value);
    };

    const handleShortNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setData('short_name', value);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const submitForm = isEditing ? put : post;
        const url = isEditing ? `/zonals/${zonal.id}` : '/zonals';

        submitForm(url, {
            onSuccess: () => {
                toast.success({
                    title: isEditing ? "Zonal actualizado" : "Zonal creado",
                    description: `El zonal "${data.name}" ha sido ${isEditing ? 'actualizado' : 'creado'} correctamente.`
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
            title={isEditing ? 'Editar Zonal' : 'Crear Zonal'}
            description={isEditing ? 'Modifica los datos del zonal seleccionado.' : 'Ingresa los datos para crear un nuevo zonal.'}
            size={size}
            isProcessing={processing}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Actualizar' : 'Guardar'}
            preventCloseOnClickOutside={true}
        >
            <form id="zonalForm" className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    <div>
                        <div className="mb-1">
                            <Label htmlFor="name" className={classNames({ 'text-destructive': errors.name })} required>
                                Nombre
                            </Label>
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                <Building2 size={18} />
                            </div>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={handleNameChange}
                                className={classNames('pl-10', { 'border-destructive': errors.name })}
                                placeholder="Nombre de la zonal"
                            />
                        </div>
                        {errors.name && (
                            <p className="text-sm text-destructive mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <div className="mb-1">
                            <Label htmlFor="short_name" className={classNames({ 'text-destructive': errors.short_name })} required>
                                Nombre corto
                            </Label>
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                <Hash size={18} />
                            </div>
                            <Input
                                id="short_name"
                                value={data.short_name}
                                onChange={handleShortNameChange}
                                className={classNames('pl-10', { 'border-destructive': errors.short_name })}
                                placeholder="Nombre corto de la zonal"
                            />
                        </div>
                        {errors.short_name && (
                            <p className="text-sm text-destructive mt-1">{errors.short_name}</p>
                        )}
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
