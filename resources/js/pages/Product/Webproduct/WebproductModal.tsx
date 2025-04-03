import { useForm } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Box } from 'lucide-react';
import classNames from 'classnames';
import CrudModal from '@/components/ui/crud-modal';
import { FormEvent, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface Webproduct {
    id: number;
    name: string;
    description: string | null;
    product_id: number;
}

interface WebproductModalProps {
    isOpen: boolean;
    onClose: () => void;
    webproduct?: Webproduct;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
    product_id: number;
}

interface WebproductFormData {
    [key: string]: string | number | null;
    id: number | string;
    name: string;
    description: string | null;
    product_id: number;
}

export default function WebproductModal({ isOpen, onClose, webproduct, size = 'md', product_id }: WebproductModalProps) {
    const isEditing = !!webproduct;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<WebproductFormData>({
        id: webproduct?.id,
        name: webproduct?.name || '',
        description: webproduct?.description || '',
        product_id: product_id,
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                id: webproduct?.id,
                name: webproduct?.name || '',
                description: webproduct?.description || '',
                product_id: product_id,
            });
            clearErrors();
        } else {
            reset();
            clearErrors();
        }
    }, [isOpen, webproduct, setData, reset, clearErrors, product_id]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').toUpperCase();
        setData('name', value);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('webproducts.update', webproduct.id), {
                onSuccess: () => {
                    toast.success({
                        title: "Producto web actualizado",
                        description: `El producto web "${data.name}" ha sido actualizado correctamente.`
                    });
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('webproducts.store'), {
                onSuccess: () => {
                    toast.success({
                        title: "Producto web creado",
                        description: `El producto web "${data.name}" ha sido creado correctamente.`
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
            title={isEditing ? 'Editar Producto Web' : 'Crear Producto Web'}
            description={isEditing ? 'Actualiza los datos del producto web.' : 'Ingresa los datos del nuevo producto web.'}
            size={size}
            preventCloseOnClickOutside={true}
        >
            <form id="webproductForm" className="space-y-4" onSubmit={handleSubmit}>
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
                                    <Box size={18} />
                                </div>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    className={classNames('pl-10', { 'border-destructive': errors.name })}
                                    placeholder="Nombre del producto web"
                                    maxLength={255}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-sm text-destructive mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <div className="mb-1">
                                <Label htmlFor="description" className={classNames({ 'text-destructive': errors.description })}>
                                    Descripción
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-2.5 text-blue-600">
                                    <Box size={18} />
                                </div>
                                <Textarea
                                    id="description"
                                    value={data.description || ''}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={classNames('pl-10', { 'border-destructive': errors.description })}
                                    placeholder="Descripción del producto web"
                                    rows={4}
                                />
                            </div>
                            {errors.description && (
                                <p className="text-sm text-destructive mt-1">{errors.description}</p>
                            )}
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
