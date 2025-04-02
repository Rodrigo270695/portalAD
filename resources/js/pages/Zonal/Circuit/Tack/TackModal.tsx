import { useForm } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import classNames from 'classnames';
import { Checkbox } from '@/components/ui/checkbox';
import CrudModal from '@/components/ui/crud-modal';
import { FormEvent, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface Tack {
    id: number;
    name: string;
    active: boolean;
    circuit_id: number;
}

interface TackModalProps {
    isOpen: boolean;
    onClose: () => void;
    tack?: Tack;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
    circuit_id: number;
}

interface TackFormData {
    [key: string]: string | number | boolean;
    id: number | string;
    name: string;
    active: boolean;
    circuit_id: number;
}

export default function TackModal({ isOpen, onClose, tack, size = 'md', circuit_id }: TackModalProps) {
    const isEditing = !!tack;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<TackFormData>({
        id: tack?.id,
        name: tack?.name || '',
        active: tack?.active ?? true,
        circuit_id: circuit_id,
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                id: tack?.id,
                name: tack?.name || '',
                active: tack?.active ?? true,
                circuit_id: circuit_id,
            });
            clearErrors();
        } else {
            reset();
            clearErrors();
        }
    }, [isOpen, tack, setData, reset, clearErrors, circuit_id]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        setData('name', value);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('tacks.update', tack.id), {
                onSuccess: () => {
                    toast.success({
                        title: "Tack actualizado",
                        description: `El tack "${data.name}" ha sido actualizado correctamente.`
                    });
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('tacks.store'), {
                onSuccess: () => {
                    toast.success({
                        title: "Tack creado",
                        description: `El tack "${data.name}" ha sido creado correctamente.`
                    });
                    onClose();
                    reset();
                },
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
            title={isEditing ? 'Editar Tack' : 'Crear Tack'}
            description={isEditing ? 'Actualiza los datos del tack.' : 'Ingresa los datos del nuevo tack.'}
            size={size}
            preventCloseOnClickOutside={true}
        >
            <form id="tackForm" className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="grid gap-6">
                        <div>
                            <div className="mb-1">
                                <Label htmlFor="name" className={classNames({ 'text-destructive': errors.name })} required>
                                    Nombre
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                    <Target size={18} />
                                </div>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    className={classNames('pl-10', { 'border-destructive': errors.name })}
                                    placeholder="Nombre del tack"
                                    maxLength={20}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-sm text-destructive mt-1">{errors.name}</p>
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
