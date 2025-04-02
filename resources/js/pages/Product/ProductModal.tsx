import CrudModal, { ModalSize } from '@/components/ui/crud-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import classNames from 'classnames';
import { Box, FileText } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    description: string | null;
    active: boolean;
}

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product;
    size?: ModalSize;
}

export default function ProductModal({ isOpen, onClose, product, size = 'md' }: ProductModalProps) {
    const isEditing = !!product;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        name: string;
        description: string;
        active: boolean;
    }>({
        name: '',
        description: '',
        active: true,
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                name: product?.name || '',
                description: product?.description || '',
                active: product?.active ?? true,
            });
        } else {
            reset();
            clearErrors();
        }
    }, [isOpen, product, setData, reset, clearErrors]);

    const capitalizeFirstLetter = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = capitalizeFirstLetter(e.target.value);
        setData('name', value);
    };

    const handleSubmit = (e?: FormEvent) => {
        if (e) e.preventDefault();

        const submitForm = isEditing ? put : post;
        const url = isEditing ? `/products/${product.id}` : '/products';

        submitForm(url, {
            onSuccess: () => {
                toast.success({
                    title: isEditing ? "Producto actualizado" : "Producto creado",
                    description: `El producto "${data.name}" ha sido ${isEditing ? 'actualizado' : 'creado'} correctamente.`
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
            title={isEditing ? 'Editar Producto' : 'Crear Producto'}
            description={isEditing ? 'Modifica los datos del producto seleccionado.' : 'Ingresa los datos para crear un nuevo producto.'}
            size={size}
            isProcessing={processing}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Actualizar' : 'Guardar'}
            preventCloseOnClickOutside={true}
        >
            <form id="productForm" className="space-y-4" onSubmit={handleSubmit}>
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
                                placeholder="Nombre del producto"
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
                                <FileText size={18} />
                            </div>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                className={classNames('pl-10', { 'border-destructive': errors.description })}
                                placeholder="Descripción del producto"
                                rows={4}
                            />
                        </div>
                        {errors.description && (
                            <p className="text-sm text-destructive mt-1">{errors.description}</p>
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
