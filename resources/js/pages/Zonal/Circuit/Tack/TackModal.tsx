import CrudModal, { ModalSize } from '@/components/ui/crud-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import classNames from 'classnames';
import { Button } from '@/components/ui/button';

interface Circuit {
    id: number;
    name: string;
}

interface Tack {
    id: number;
    name: string;
    active: boolean;
    circuit_id: number;
    circuit?: Circuit;
}

interface TackModalProps {
    isOpen: boolean;
    onClose: () => void;
    tack?: Tack | null;
    size?: ModalSize;
    circuit_id: number;
}

export default function TackModal({ isOpen, onClose, tack, size = 'md', circuit_id }: TackModalProps) {
    const isEditing = !!tack;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        name: string;
        active: boolean;
        circuit_id: number;
    }>({
        name: '',
        active: true,
        circuit_id: circuit_id,
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                name: tack?.name || '',
                active: tack?.active ?? true,
                circuit_id: circuit_id,
            });
        } else {
            reset();
            clearErrors();
        }
    }, [isOpen, tack, setData, reset, clearErrors, circuit_id]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setData('name', value);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (isEditing && tack) {
            put(`/tacks/${tack.id}`, {
                onSuccess: () => {
                    toast.success({
                        title: "Ruta actualizada",
                        description: `La ruta "${data.name}" ha sido actualizada correctamente.`
                    });
                    reset();
                    clearErrors();
                    onClose();
                }
            });
        } else {
            post('/tacks', {
                onSuccess: () => {
                    toast.success({
                        title: "Ruta creada",
                        description: `La ruta "${data.name}" ha sido creada correctamente.`
                    });
                    reset();
                    clearErrors();
                    onClose();
                }
            });
        }
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
            title={isEditing ? 'Editar Ruta' : 'Nueva Ruta'}
            description={isEditing ? 'Actualiza los datos de la ruta.' : 'Ingresa los datos de la nueva ruta.'}
            size={size}
            preventCloseOnClickOutside={true}
        >
            <form id="tackForm" className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className={classNames({ 'text-destructive': errors.name })} required>
                            Nombre
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={handleNameChange}
                            className={classNames({ 'border-destructive': errors.name })}
                            maxLength={20}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
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

                <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={processing}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing}
                    >
                        {isEditing ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </CrudModal>
    );
}
