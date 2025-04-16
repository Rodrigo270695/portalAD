import CrudModal, { ModalSize } from '@/components/ui/crud-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import classNames from 'classnames';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, DollarSign, Package2, BadgeCheck, Activity } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Circuit {
    id: number;
    name: string;
    zonal: {
        id: number;
        name: string;
        short_name: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    dni: string;
    circuit: Circuit;
    zonificador?: User;
}

interface WebProduct {
    id: number;
    name: string;
    product: {
        id: number;
        name: string;
    };
}

export interface Sale {
    id: number;
    date: string;
    telefono: string;
    cluster_quality: string;
    recharge_date: string;
    recharge_amount: number;
    accumulated_amount: number;
    commissionable_charge: boolean;
    action: string;
    user_id: number;
    webproduct_id: number;
    user: User;
    webProduct: WebProduct;
}

interface SaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale?: Sale;
    size?: ModalSize;
    users: User[];
    webProducts: WebProduct[];
}

const getLimaDate = () => {
    const date = new Date();
    return new Date(date.toLocaleString('en-US', { timeZone: 'America/Lima' })).toISOString().split('T')[0];
};

const clusterQualities = ['Cluster 1: IMEI nuevo', 'Cluster 2: IMEI reutilizado', 'Cluster 3: IMEI en 2 alta', 'Cluster 4: IMEI sospechoso', 'Cluster 5: Sin trafico', 'PENDIENTE CLUSTERIZAR'];
const actions = ['MULTIMARCA', 'PDV PREMIUM', 'PDV REGULAR', 'NO GESTIONABLE'];

const SaleModal = ({ isOpen, onClose, sale, size = 'md', users, webProducts }: SaleModalProps) => {
    const isEditing = !!sale;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        date: string;
        telefono: string;
        cluster_quality: string;
        recharge_date: string;
        recharge_amount: string;
        accumulated_amount: string;
        commissionable_charge: boolean;
        action: string;
        user_id: number;
        webproduct_id: number;
    }>({
        date: getLimaDate(),
        telefono: '',
        cluster_quality: '',
        recharge_date: getLimaDate(),
        recharge_amount: '',
        accumulated_amount: '',
        commissionable_charge: true,
        action: '',
        user_id: users[0]?.id || 0,
        webproduct_id: webProducts[0]?.id || 0,
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                date: sale?.date || getLimaDate(),
                telefono: sale?.telefono || '',
                cluster_quality: sale?.cluster_quality || '',
                recharge_date: sale?.recharge_date || getLimaDate(),
                recharge_amount: sale?.recharge_amount?.toString() || '',
                accumulated_amount: sale?.accumulated_amount?.toString() || '',
                commissionable_charge: sale?.commissionable_charge ?? true,
                action: sale?.action || '',
                user_id: sale?.user_id || users[0]?.id || 0,
                webproduct_id: sale?.webproduct_id || webProducts[0]?.id || 0,
            });
        } else {
            reset();
            clearErrors();
        }
    }, [isOpen, sale, setData, reset, clearErrors, users, webProducts]);

    const handleSubmit = (e?: FormEvent) => {
        if (e) e.preventDefault();

        const submitForm = isEditing ? put : post;
        const url = isEditing ? `/sales/${sale.id}` : '/sales';

        submitForm(url, {
            preserveScroll: true,
            preserveState: true,
            only: ['sales', 'filters', 'totals'],
            onSuccess: () => {
                toast.success({
                    title: isEditing ? "Venta actualizada" : "Venta creada",
                    description: `La venta ha sido ${isEditing ? 'actualizada' : 'creada'} correctamente.`
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
            title={isEditing ? 'Editar Venta' : 'Crear Venta'}
            description={isEditing ? 'Modifica los datos de la venta seleccionada.' : 'Ingresa los datos para crear una nueva venta.'}
            size={size}
            isProcessing={processing}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Actualizar' : 'Guardar'}
            preventCloseOnClickOutside={true}
        >
            <form id="saleForm" className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="date" className={classNames({ 'text-destructive': errors.date })} required>
                                    Fecha
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                    <Calendar size={18} />
                                </div>
                                <Input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className={classNames('pl-10', { 'border-destructive': errors.date })}
                                />
                            </div>
                            {errors.date && (
                                <p className="text-sm text-destructive mt-1">{errors.date}</p>
                            )}
                        </div>

                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="telefono" className={classNames({ 'text-destructive': errors.telefono })} required>
                                    Teléfono
                                </Label>
                            </div>
                            <Input
                                id="telefono"
                                type="text"
                                value={data.telefono}
                                onChange={(e) => setData('telefono', e.target.value)}
                                className={classNames({ 'border-destructive': errors.telefono })}
                                maxLength={9}
                                placeholder="Ingrese el teléfono"
                            />
                            {errors.telefono && (
                                <p className="text-sm text-destructive mt-1">{errors.telefono}</p>
                            )}
                        </div>

                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="recharge_date" className={classNames({ 'text-destructive': errors.recharge_date })}>
                                    Fecha de Recarga (Opcional)
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                    <Calendar size={18} />
                                </div>
                                <Input
                                    id="recharge_date"
                                    type="date"
                                    value={data.recharge_date}
                                    onChange={(e) => setData('recharge_date', e.target.value)}
                                    className={classNames('pl-10', { 'border-destructive': errors.recharge_date })}
                                />
                            </div>
                            {errors.recharge_date && (
                                <p className="text-sm text-destructive mt-1">{errors.recharge_date}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="cluster_quality" className={classNames({ 'text-destructive': errors.cluster_quality })}>
                                    Calidad de Cluster (Opcional)
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 z-10">
                                    <BadgeCheck size={18} />
                                </div>
                                <Select
                                    value={data.cluster_quality}
                                    onValueChange={(value) => setData('cluster_quality', value)}
                                >
                                    <SelectTrigger className={classNames('pl-10', { 'border-destructive': errors.cluster_quality })}>
                                        <SelectValue placeholder="Seleccione un cluster" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clusterQualities.map((quality) => (
                                            <SelectItem key={quality} value={quality}>
                                                {quality}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.cluster_quality && (
                                <p className="text-sm text-destructive mt-1">{errors.cluster_quality}</p>
                            )}
                        </div>

                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="action" className={classNames({ 'text-destructive': errors.action })}>
                                    Acción (Opcional)
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 z-10">
                                    <Activity size={18} />
                                </div>
                                <Select
                                    value={data.action}
                                    onValueChange={(value) => setData('action', value)}
                                >
                                    <SelectTrigger className={classNames('pl-10', { 'border-destructive': errors.action })}>
                                        <SelectValue placeholder="Seleccione una acción" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {actions.map((action) => (
                                            <SelectItem key={action} value={action}>
                                                {action}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.action && (
                                <p className="text-sm text-destructive mt-1">{errors.action}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="recharge_amount" className={classNames({ 'text-destructive': errors.recharge_amount })}>
                                    Monto de Recarga (Opcional)
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                    <DollarSign size={18} />
                                </div>
                                <Input
                                    id="recharge_amount"
                                    type="number"
                                    min="0"
                                    value={data.recharge_amount}
                                    onChange={(e) => setData('recharge_amount', e.target.value)}
                                    className={classNames('pl-10', { 'border-destructive': errors.recharge_amount })}
                                    placeholder="Monto de la recarga"
                                />
                            </div>
                            {errors.recharge_amount && (
                                <p className="text-sm text-destructive mt-1">{errors.recharge_amount}</p>
                            )}
                        </div>

                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="accumulated_amount" className={classNames({ 'text-destructive': errors.accumulated_amount })}>
                                    Monto Acumulado (Opcional)
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                    <DollarSign size={18} />
                                </div>
                                <Input
                                    id="accumulated_amount"
                                    type="number"
                                    min="0"
                                    value={data.accumulated_amount}
                                    onChange={(e) => setData('accumulated_amount', e.target.value)}
                                    className={classNames('pl-10', { 'border-destructive': errors.accumulated_amount })}
                                    placeholder="Monto acumulado"
                                />
                            </div>
                            {errors.accumulated_amount && (
                                <p className="text-sm text-destructive mt-1">{errors.accumulated_amount}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        <SelectValue placeholder="Seleccione un PDV" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name} ({user.dni})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.user_id && (
                                <p className="text-sm text-destructive mt-1">{errors.user_id}</p>
                            )}
                        </div>

                        <div className="col-span-1">
                            <div className="mb-1">
                                <Label htmlFor="webproduct_id" className={classNames({ 'text-destructive': errors.webproduct_id })} required>
                                    Producto Web
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 z-10">
                                    <Package2 size={18} />
                                </div>
                                <Select
                                    value={data.webproduct_id.toString()}
                                    onValueChange={(value) => setData('webproduct_id', parseInt(value))}
                                >
                                    <SelectTrigger className={classNames('pl-10', { 'border-destructive': errors.webproduct_id })}>
                                        <SelectValue placeholder="Seleccione un producto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {webProducts?.map((webProduct) => (
                                            <SelectItem key={webProduct.id} value={webProduct.id.toString()}>
                                                {webProduct.product?.name || 'Producto sin nombre'} - {webProduct.name || 'Sin nombre'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.webproduct_id && (
                                <p className="text-sm text-destructive mt-1">{errors.webproduct_id}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="commissionable_charge"
                            checked={data.commissionable_charge}
                            onCheckedChange={(checked: boolean) => setData('commissionable_charge', checked)}
                        />
                        <Label htmlFor="commissionable_charge" required>Cargo Comisionable</Label>
                        {errors.commissionable_charge && (
                            <p className="text-sm text-destructive mt-1">{errors.commissionable_charge}</p>
                        )}
                    </div>
                </div>
            </form>
        </CrudModal>
    );
}

export default SaleModal;
