import CrudModal, { ModalSize } from '@/components/ui/crud-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import classNames from 'classnames';
import { Button } from '@/components/ui/button';

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

    const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
        setData('dni', value);
    };

    const handleCelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 9);
        setData('cel', value);
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
                    <div className="grid gap-2">
                        <Label htmlFor="name" className={classNames({ 'text-destructive': errors.name })}>
                            Nombre
                        </Label>
                        <Input
                            id="name"
                            value={data.name || ''}
                            onChange={(e) => setData('name', e.target.value)}
                            className={classNames({ 'border-destructive': errors.name })}
                            maxLength={60}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="dni" className={classNames({ 'text-destructive': errors.dni })} required>
                            DNI
                        </Label>
                        <Input
                            id="dni"
                            value={data.dni}
                            onChange={handleDniChange}
                            className={classNames({ 'border-destructive': errors.dni })}
                            maxLength={8}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="12345678"
                        />
                        {errors.dni && (
                            <p className="text-sm text-destructive">{errors.dni}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="cel" className={classNames({ 'text-destructive': errors.cel })}>
                            Celular
                        </Label>
                        <Input
                            id="cel"
                            value={data.cel || ''}
                            onChange={handleCelChange}
                            className={classNames({ 'border-destructive': errors.cel })}
                            maxLength={9}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="987654321"
                        />
                        {errors.cel && (
                            <p className="text-sm text-destructive">{errors.cel}</p>
                        )}
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
