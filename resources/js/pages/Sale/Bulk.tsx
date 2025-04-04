import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Head, useForm } from '@inertiajs/react';
import { Download, Upload } from 'lucide-react';
import { FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/',
    },
    {
        title: 'Ventas',
        href: '/sales',
    },
    {
        title: 'Carga Masiva',
        href: '/sales/bulk',
    },
];

export default function Bulk() {
    const { toast } = useToast();
    const { data, setData, post, processing, reset } = useForm({
        file: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('file', file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!data.file) {
            toast({
                title: 'Error',
                description: 'Por favor seleccione un archivo',
                variant: 'destructive',
            });
            return;
        }

        const formData = new FormData();
        formData.append('file', data.file);

        post('/sales/upload', {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: 'Éxito',
                    description: 'Archivo procesado correctamente',
                });
                reset();
            },
            onError: (errors) => {
                toast({
                    title: 'Error',
                    description: Object.values(errors)[0] as string,
                    variant: 'destructive',
                });
            },
        });
    };

    const downloadTemplate = () => {
        window.location.href = '/sales/template';
    };

    return (
        <AppLayout title="Carga Masiva de Ventas" breadcrumbs={breadcrumbs}>
            <Head title="Carga Masiva de Ventas" />

            <div className="container mx-auto py-6">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Descargar Plantilla</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Descargue la plantilla Excel para la carga masiva de ventas. La plantilla incluye instrucciones detalladas sobre cómo llenarla correctamente.
                            </p>
                            <Button onClick={downloadTemplate}>
                                <Download className="mr-2 h-4 w-4" />
                                Descargar Plantilla
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cargar Archivo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <input
                                            type="file"
                                            accept=".xlsx"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Seleccionar Archivo
                                        </label>
                                        {data.file && (
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Archivo seleccionado: {data.file.name}
                                            </p>
                                        )}
                                    </div>

                                    <Button type="submit" disabled={processing || !data.file}>
                                        {processing ? 'Procesando...' : 'Cargar Archivo'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
