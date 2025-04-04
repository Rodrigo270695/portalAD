import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Cuotas',
        href: '/shares',
    },
    {
        title: 'Carga Masiva',
        href: '/shares/bulk',
    },
];

interface Props {
    success?: string;
    error?: string;
    results?: {
        total: number;
        success: number;
        errors: { row: number; message: string }[];
    };
}

export default function Bulk() {
    const { success, error, results } = usePage().props as Props;
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (results) {
            setShowResults(true);
        }
    }, [results]);

    const handleDownloadTemplate = () => {
        window.location.href = '/shares/bulk/template';
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setProgress(0);
        setShowProgress(true);
        setIsProcessing(false);

        router.post('/shares/bulk/upload', formData, {
            preserveScroll: true,
            preserveState: true,
            onProgress: (event) => {
                if (event.lengthComputable) {
                    setProgress((event.loaded * 100) / event.total);
                }
            },
            onSuccess: () => {
                event.target.value = '';
                setUploading(false);
                setProgress(100);
                setIsProcessing(true);
                setTimeout(() => {
                    setShowProgress(false);
                    setShowResults(true);
                }, 1000);
            },
            onError: () => {
                event.target.value = '';
                setUploading(false);
                setProgress(0);
                setShowProgress(false);
            },
            onFinish: () => {
                setTimeout(() => {
                    setProgress(0);
                }, 2000);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Carga Masiva de Cuotas" />

            <div className="flex flex-col gap-6 p-4">
                <h1 className="text-2xl font-bold">Carga Masiva de Cuotas</h1>

                <div className="grid gap-6">
                    {/* Sección de Descarga */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Descargar Plantilla</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Descarga la plantilla Excel para cargar las cuotas. La plantilla incluye:
                            </p>
                            <ul className="mb-4 list-disc pl-5 text-sm text-muted-foreground">
                                <li>Lista de todos los DNIs válidos</li>
                                <li>Formato correcto para el año y mes</li>
                                <li>Validaciones básicas para los campos</li>
                            </ul>
                            <Button onClick={handleDownloadTemplate}>
                                <Download className="mr-2 h-4 w-4" />
                                Descargar Plantilla Excel
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Sección de Carga */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cargar Cuotas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Selecciona el archivo Excel con las cuotas a cargar. El sistema validará:
                            </p>
                            <ul className="mb-4 list-disc pl-5 text-sm text-muted-foreground">
                                <li>Formato del archivo</li>
                                <li>DNIs existentes en el sistema</li>
                                <li>Cuotas duplicadas</li>
                                <li>Valores válidos para los campos</li>
                            </ul>
                            <div className="space-y-4">
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-34 border-2 border-dashed rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-4 text-neutral-500" />
                                            <p className="mb-2 text-sm text-neutral-500">
                                                <span className="font-semibold">Haz clic para seleccionar</span> o arrastra y suelta
                                            </p>
                                            <p className="text-xs text-neutral-500">Excel (XLSX) hasta 10MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".xlsx"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Modal de Resultados */}
                    <Dialog open={showResults} onOpenChange={setShowResults}>
                        <DialogContent className="max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Resultados de la Importación</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 overflow-y-auto">
                                {success && (
                                    <Alert>
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertTitle>Éxito</AlertTitle>
                                        <AlertDescription>{success}</AlertDescription>
                                    </Alert>
                                )}

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                {results && (
                                    <div className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">Total de registros</p>
                                                <p className="text-2xl font-bold">{results.total}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">Registros exitosos</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {results.success}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">Registros con error</p>
                                                <p className="text-2xl font-bold text-red-600">
                                                    {results.errors.length}
                                                </p>
                                            </div>
                                        </div>

                                        {results.errors.length > 0 && (
                                            <Alert variant="destructive">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertTitle>Errores encontrados</AlertTitle>
                                                <AlertDescription>
                                                    <ul className="mt-2 list-inside list-disc space-y-1 max-h-[40vh] overflow-y-auto pr-2">
                                                        {results.errors.map((error, index) => (
                                                            <li key={index}>
                                                                Fila {error.row}: {error.message}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Modal de Progreso */}
                    <Dialog open={showProgress} onOpenChange={() => { }}>
                        <DialogContent className="sm:max-w-md bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
                            <DialogHeader className="pb-6">
                                <DialogTitle className="flex items-center gap-3 text-xl">
                                {isProcessing ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="relative h-8 w-8 flex items-center justify-center">
                                                <div className="absolute inset-0 rounded-full bg-[#00B8D9]/20 dark:bg-[#00B8D9]/40 animate-pulse opacity-75"></div>
                                                <Loader2 className="h-6 w-6 text-[#0062CC] dark:text-[#00B8D9] relative animate-spin" />
                                            </div>
                                            <span className="bg-gradient-to-r from-[#0062CC] to-[#00B8D9] text-transparent bg-clip-text font-semibold">
                                                Procesando archivo
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="absolute inset-0 rounded-full bg-[#00B8D9]/20 dark:bg-[#00B8D9]/40 animate-pulse opacity-75"></div>
                                                <Upload className="h-6 w-6 text-[#0062CC] dark:text-[#00B8D9] relative" />
                                            </div>
                                            <span className="bg-gradient-to-r from-[#0062CC] to-[#00B8D9] text-transparent bg-clip-text font-semibold">
                                                Subiendo archivo
                                            </span>
                                        </div>
                                    )}
                                </DialogTitle>
                                <DialogDescription className="text-neutral-600 dark:text-neutral-400 mt-2 text-center">
                                    {isProcessing
                                        ? "Analizando y validando los registros del archivo..."
                                        : "Subiendo el archivo al servidor..."}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                <div className="relative pt-4 pb-8">
                                    <Progress
                                        value={progress}
                                        className={`w-full h-4 transition-all duration-300 ${isProcessing ? 'bg-[#00B8D9]/20 dark:bg-[#00B8D9]/20' : 'bg-[#00B8D9]/20 dark:bg-[#00B8D9]/20'}`}
                                        indicatorClassName={`${isProcessing
                                            ? 'bg-gradient-to-r from-[#0062CC] to-[#00B8D9]'
                                            : 'bg-gradient-to-r from-[#0062CC] to-[#00B8D9]'}
                                            ${isProcessing ? 'animate-pulse' : ''}`}
                                    />
                                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-neutral-900 px-4 py-2 rounded-full border-2 border-[#00B8D9]/20 shadow-sm">
                                        <span className="text-lg font-bold bg-gradient-to-r from-[#0062CC] to-[#00B8D9] text-transparent bg-clip-text">
                                            {Math.round(progress)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-center items-center gap-2">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full
                                        ${isProcessing
                                            ? 'bg-[#00B8D9]/10 text-[#0062CC] dark:bg-[#00B8D9]/20 dark:text-[#00B8D9]'
                                            : 'bg-[#00B8D9]/10 text-[#0062CC] dark:bg-[#00B8D9]/20 dark:text-[#00B8D9]'}`}>
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm font-medium">Validando registros</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4" />
                                                <span className="text-sm font-medium">Subiendo archivo</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
