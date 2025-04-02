import CrudModal, { ModalSize } from '@/components/ui/crud-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import classNames from 'classnames';
import { Button } from '@/components/ui/button';
import { CreditCard, Phone, User2 } from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface Seller {
    id: number;
    name: string | null;
    dni: string;
    cel: string | null;
    pdv_id: number;
    pdv?: User;
}

interface SellerModalProps {
    isOpen: boolean;
    onClose: () => void;
    seller?: Seller | null;
    size?: ModalSize;
    pdv: User;
}

export default function SellerModal({ isOpen, onClose, seller, size = 'md', pdv }: SellerModalProps) {
    const isEditing = !!seller;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        name: string | null;
        dni: string;
        cel: string | null;
        pdv_id: number;
    }>({
        name: '',
        dni: '',
        cel: '',
        pdv_id: pdv.id,
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                name: seller?.name || '',
                dni: seller?.dni || '',
                cel: seller?.cel || '',
                pdv_id: pdv.id,
            });
        } else {
            reset();
            clearErrors();
        }
    }, [isOpen, seller, setData, reset, clearErrors, pdv.id]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        setData('name', value);
    };

    const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
        setData('dni', value);
    };

    const handleCelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value === '' || value.startsWith('9')) {
            setData('cel', value.slice(0, 9));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (isEditing && seller) {
            put(`/sellers/${seller.id}`, {
                onSuccess: () => {
                    toast.success({
                        title: "Vendedor actualizado",
                        description: `El vendedor "${data.name || 'Sin nombre'}" ha sido actualizado correctamente.`
                    });
                    reset();
                    clearErrors();
                    onClose();
                }
            });
        } else {
            post('/sellers', {
                onSuccess: () => {
                    toast.success({
                        title: "Vendedor creado",
                        description: `El vendedor "${data.name || 'Sin nombre'}" ha sido creado correctamente.`
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
            title={isEditing ? 'Editar Vendedor' : 'Nuevo Vendedor'}
            description={isEditing ? 'Actualiza los datos del vendedor.' : 'Ingresa los datos del nuevo vendedor.'}
            size={size}
            preventCloseOnClickOutside={true}
        >
            <form id="sellerForm" className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="grid gap-4">
                        <div>
                            <div className="mb-1">
                                <Label htmlFor="name" className={classNames({ 'text-destructive': errors.name })}>
                                    Nombre
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                    <User2 size={18} />
                                </div>
                                <Input
                                    id="name"
                                    value={data.name || ''}
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
                                <Label htmlFor="cel" className={classNames({ 'text-destructive': errors.cel })}>
                                    Celular
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                    <Phone size={18} />
                                </div>
                                <Input
                                    id="cel"
                                    value={data.cel || ''}
                                    onChange={handleCelChange}
                                    className={classNames('pl-10 pr-16', { 'border-destructive': errors.cel })}
                                    placeholder="Ingresa celular (9 dígitos)"
                                    maxLength={9}
                                    pattern="9[0-9]{8}"
                                    title="El celular debe empezar con 9 y tener 9 dígitos"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                                    {(data.cel || '').length}/9
                                </div>
                            </div>
                            {errors.cel && (
                                <p className="text-sm text-destructive mt-1">{errors.cel}</p>
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
