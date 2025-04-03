import CrudModal, { ModalSize } from '@/components/ui/crud-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import classNames from 'classnames';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, DollarSign } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Share {
    id: number;
    year: number;
    month: number;
    amount: number;
    user_id: number;
    user: User;
}

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    share?: Share;
    size?: ModalSize;
    users: User[];
}

const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export default function ShareModal({ isOpen, onClose, share, size = 'md', users }: ShareModalProps) {
    const isEditing = !!share;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        year: string;
        month: string;
        amount: string;
        user_id: number;
    }>({
        year: '',
        month: '',
        amount: '',
        user_id: users[0]?.id || 0,
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                year: share?.year.toString() || '',
                month: share?.month.toString() || '',
                amount: share?.amount.toString() || '',
                user_id: share?.user_id || users[0]?.id || 0,
            });
        } else {
            reset();
            clearErrors();
        }
    }, [isOpen, share, setData, reset, clearErrors, users]);

    const handleSubmit = (e?: FormEvent) => {
        if (e) e.preventDefault();

        const submitForm = isEditing ? put : post;
        const url = isEditing ? `/shares/${share.id}` : '/shares';

        submitForm(url, {
            onSuccess: () => {
                toast.success({
                    title: isEditing ? "Cuota actualizada" : "Cuota creada",
                    description: `La cuota ha sido ${isEditing ? 'actualizada' : 'creada'} correctamente.`
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
            title={isEditing ? 'Editar Cuota' : 'Crear Cuota'}
            description={isEditing ? 'Modifica los datos de la cuota seleccionada.' : 'Ingresa los datos para crear una nueva cuota.'}
            size={size}
            isProcessing={processing}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Actualizar' : 'Guardar'}
            preventCloseOnClickOutside={true}
        >
            <form id="shareForm" className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="year" className={classNames({ 'text-destructive': errors.year })} required>
                                    Año
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 z-10">
                                    <Calendar size={18} />
                                </div>
                                <Select
                                    value={data.year}
                                    onValueChange={(value) => setData('year', value)}
                                >
                                    <SelectTrigger className={classNames('pl-10', { 'border-destructive': errors.year })}>
                                        <SelectValue placeholder="Seleccione un año" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.year && (
                                <p className="text-sm text-destructive mt-1">{errors.year}</p>
                            )}
                        </div>

                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="month" className={classNames({ 'text-destructive': errors.month })} required>
                                    Mes
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 z-10">
                                    <Calendar size={18} />
                                </div>
                                <Select
                                    value={data.month}
                                    onValueChange={(value) => setData('month', value)}
                                >
                                    <SelectTrigger className={classNames('pl-10', { 'border-destructive': errors.month })}>
                                        <SelectValue placeholder="Seleccione un mes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {monthNames.map((month, index) => (
                                            <SelectItem key={index + 1} value={(index + 1).toString()}>
                                                {month}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.month && (
                                <p className="text-sm text-destructive mt-1">{errors.month}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="amount" className={classNames({ 'text-destructive': errors.amount })} required>
                                    Monto
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                    <DollarSign size={18} />
                                </div>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="0"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className={classNames('pl-10', { 'border-destructive': errors.amount })}
                                    placeholder="Monto de la cuota"
                                />
                            </div>
                            {errors.amount && (
                                <p className="text-sm text-destructive mt-1">{errors.amount}</p>
                            )}
                        </div>

                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="user_id" className={classNames({ 'text-destructive': errors.user_id })} required>
                                    PDV
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 z-10">
                                    <User size={18} />
                                </div>
                                <Select
                                    value={data.user_id.toString()}
                                    onValueChange={(value) => setData('user_id', parseInt(value))}
                                >
                                    <SelectTrigger className={classNames('pl-10', { 'border-destructive': errors.user_id })}>
                                        <SelectValue placeholder="Seleccione un usuario" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.user_id && (
                                <p className="text-sm text-destructive mt-1">{errors.user_id}</p>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </CrudModal>
    );
}
