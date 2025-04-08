import CrudModal, { ModalSize } from '@/components/ui/crud-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import classNames from 'classnames';
import { CalendarDays, FileImage, MessageSquare, Type } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Campaign {
    id: number;
    name: string;
    description: string;
    type: 'Esquema' | 'Acelerador' | 'Información';
    image: string;
    image_url: string;
    date_start: string;
    date_end: string;
    status: boolean;
}

interface CampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign?: Campaign;
    size?: ModalSize;
}

const campaignTypes = ['Esquema', 'Acelerador', 'Información'] as const;

export default function CampaignModal({ isOpen, onClose, campaign, size = 'lg' }: CampaignModalProps) {
    const isEditing = !!campaign;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: isEditing ? 'PUT' : 'POST',
        name: '',
        description: '',
        type: 'Esquema',
        image: null as File | null,
        date_start: '',
        date_end: '',
        status: true,
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                _method: isEditing ? 'PUT' : 'POST',
                name: campaign?.name || '',
                description: campaign?.description || '',
                type: campaign?.type || 'Esquema',
                image: null,
                date_start: campaign?.date_start || '',
                date_end: campaign?.date_end || '',
                status: campaign?.status ?? true,
            });
        } else {
            reset();
            clearErrors();
        }
    }, [isOpen, campaign, isEditing, setData, reset, clearErrors]);

    const handleSubmit = (e?: FormEvent) => {
        if (e) e.preventDefault();

        const url = isEditing ? `/campaigns/${campaign.id}` : '/campaigns';

        post(url, {
            onSuccess: () => {
                toast.success({
                    title: isEditing ? "Campaña actualizada" : "Campaña creada",
                    description: `La campaña "${data.name}" ha sido ${isEditing ? 'actualizada' : 'creada'} correctamente.`
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
            title={isEditing ? 'Editar Campaña' : 'Crear Campaña'}
            description={isEditing ? 'Modifica los datos de la campaña seleccionada.' : 'Ingresa los datos para crear una nueva campaña.'}
            size={size}
            isProcessing={processing}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Actualizar' : 'Guardar'}
            preventCloseOnClickOutside={true}
        >
            <form id="campaignForm" className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    <div>
                        <div className="mb-1">
                            <Label htmlFor="name" className={classNames({ 'text-destructive': errors.name })} required>
                                Nombre
                            </Label>
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                <Type size={18} />
                            </div>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={classNames('pl-10', { 'border-destructive': errors.name })}
                                placeholder="Nombre de la campaña"
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
                            <div className="absolute left-3 top-3 text-blue-600">
                                <MessageSquare size={18} />
                            </div>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className={classNames('pl-10 min-h-[100px]', { 'border-destructive': errors.description })}
                                placeholder="Descripción de la campaña"
                            />
                        </div>
                        {errors.description && (
                            <p className="text-sm text-destructive mt-1">{errors.description}</p>
                        )}
                    </div>

                    <div>
                        <div className="mb-1">
                            <Label htmlFor="type" className={classNames({ 'text-destructive': errors.type })} required>
                                Tipo
                            </Label>
                        </div>
                        <Select
                            value={data.type}
                            onValueChange={(value) => setData('type', value as typeof campaignTypes[number])}
                        >
                            <SelectTrigger className={classNames({ 'border-destructive': errors.type })}>
                                <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {campaignTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.type && (
                            <p className="text-sm text-destructive mt-1">{errors.type}</p>
                        )}
                    </div>

                    <div>
                        <div className="mb-1">
                            <Label htmlFor="image" className={classNames({ 'text-destructive': errors.image })} required={!isEditing}>
                                Imagen
                            </Label>
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                <FileImage size={18} />
                            </div>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('image', e.target.files?.[0] || null)}
                                className={classNames('pl-10', { 'border-destructive': errors.image })}
                            />
                        </div>
                        {errors.image && (
                            <p className="text-sm text-destructive mt-1">{errors.image}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="mb-1">
                                <Label htmlFor="date_start" className={classNames({ 'text-destructive': errors.date_start })} required>
                                    Fecha Inicio
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                    <CalendarDays size={18} />
                                </div>
                                <Input
                                    id="date_start"
                                    type="date"
                                    value={data.date_start}
                                    onChange={(e) => setData('date_start', e.target.value)}
                                    className={classNames('pl-10', { 'border-destructive': errors.date_start })}
                                />
                            </div>
                            {errors.date_start && (
                                <p className="text-sm text-destructive mt-1">{errors.date_start}</p>
                            )}
                        </div>

                        <div>
                            <div className="mb-1">
                                <Label htmlFor="date_end" className={classNames({ 'text-destructive': errors.date_end })} required>
                                    Fecha Fin
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                                    <CalendarDays size={18} />
                                </div>
                                <Input
                                    id="date_end"
                                    type="date"
                                    value={data.date_end}
                                    onChange={(e) => setData('date_end', e.target.value)}
                                    className={classNames('pl-10', { 'border-destructive': errors.date_end })}
                                />
                            </div>
                            {errors.date_end && (
                                <p className="text-sm text-destructive mt-1">{errors.date_end}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="status"
                            checked={data.status}
                            onCheckedChange={(checked) => setData('status', checked as boolean)}
                        />
                        <Label htmlFor="status">Activo</Label>
                    </div>
                </div>
            </form>
        </CrudModal>
    );
}
