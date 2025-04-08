import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Campaign {
    id: number;
    name: string;
    description: string;
    type: 'Esquema' | 'Acelerador' | 'Información';
    image_url: string;
    date_start_display: string;
    date_end_display: string;
    status: boolean;
}

interface Props {
    campaignsByType: {
        Esquema: Campaign[];
        Acelerador: Campaign[];
        Información: Campaign[];
    };
    currentYear: string;
    currentMonth: string;
    availableYears: number[];
    availableMonths: Array<{
        value: string;
        label: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Historial de Campañas',
        href: '/history-campaign',
    },
];

const History = ({ campaignsByType, currentYear, currentMonth, availableYears, availableMonths }: Props) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleYearChange = (value: string) => {
        router.get('/history-campaign', {
            year: value,
            month: currentMonth
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleMonthChange = (value: string) => {
        router.get('/history-campaign', {
            year: currentYear,
            month: value
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial de Campañas" />

            <div className="p-4 sm:p-6 lg:p-8 bg-background">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">Historial de Campañas</h2>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Select defaultValue={currentYear.toString()} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Año">{currentYear}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={currentMonth} onValueChange={handleMonthChange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Mes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {availableMonths.map((month) => (
                                    <SelectItem key={month.value} value={month.value}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(campaignsByType).map(([type, campaigns]) => (
                            <div key={type} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">{type}</h3>
                                    <span className="text-sm text-muted-foreground">{campaigns.length} campañas</span>
                                </div>
                                <div className="grid gap-4">
                                    {campaigns.map((campaign) => (
                                        <div key={campaign.id} className="group relative overflow-hidden rounded-lg border bg-background p-2">
                                            <div className="aspect-[16/9] overflow-hidden rounded-md">
                                                {campaign.image_url ? (
                                                    <img
                                                        src={campaign.image_url}
                                                        alt={campaign.name}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                                        onClick={() => setSelectedImage(campaign.image_url)}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                                        <span className="text-muted-foreground">Sin imagen</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2 pt-2">
                                                <h4 className="font-semibold truncate">{campaign.name}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Inicio:</span>
                                                        <br />
                                                        {campaign.date_start_display}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Fin:</span>
                                                        <br />
                                                        {campaign.date_end_display}
                                                    </div>
                                                </div>
                                                <div className="flex justify-end">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                            campaign.status
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                        }`}
                                                    >
                                                        {campaign.status ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-4xl">
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Vista ampliada"
                            className="w-full h-auto"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default History;
