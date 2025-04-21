import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, RefreshCw } from 'lucide-react';

import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

interface Props {
    success?: string;
    error?: string;
    results?: {
        total: number;
        success: number;
        errors: { row: number; message: string; dni?: string }[];
    };
}

export default function Bulk() {
    const { success, error, results } = usePage().props as Props;
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Estados para la actualización masiva
    const [updatingFile, setUpdatingFile] = useState<File | null>(null);
    const [updatingProgress, setUpdatingProgress] = useState(0);
    const [showUpdateProgress, setShowUpdateProgress] = useState(false);
    const [showUpdateResults, setShowUpdateResults] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateResults, setUpdateResults] = useState<Props['results'] | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);

    const uploadFileForUpdate = (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        setUpdatingFile(file);
        setUpdatingProgress(0);
        setShowUpdateProgress(true);
        setIsUpdating(false);
        setUpdateResults(null);
        setUpdateSuccess(null);
        setUpdateError(null);

        router.post('/sales/bulk/update', formData, {
            preserveScroll: true,
            preserveState: true,
            onProgress: (event) => {
                if (event.lengthComputable) {
                    setUpdatingProgress((event.loaded * 100) / event.total);
                }
            },
            onSuccess: () => {
                setUpdatingProgress(100);
                setIsUpdating(true);
                
                // Obtener los resultados de la respuesta
                const success = router.page.props.success;
                const error = router.page.props.error;
                const results = router.page.props.results;
                
                // Guardar los resultados específicos de la actualización
                if (success) {
                    setUpdateSuccess(success);
                }
                if (error) {
                    setUpdateError(error);
                }
                if (results) {
                    setUpdateResults(results);
                }

                // Aseguramos que el modal de progreso se cierre antes de mostrar los resultados
                setShowUpdateProgress(false);
                // Pequeño retraso para mostrar los resultados
                setTimeout(() => {
                    setShowUpdateResults(true);
                }, 500);
            },
            onError: () => {
                setUpdatingProgress(0);
                setShowUpdateProgress(false);
                setUpdateError('Error al procesar el archivo de actualización');
                setShowUpdateResults(true);
            },
            onFinish: () => {
                setTimeout(() => {
                    setUpdatingProgress(0);
                }, 2000);
            },
        });
    };

    useEffect(() => {
        if (success || error || results) {
            setShowResults(true);
        }
    }, [success, error, results]);

    const handleDownloadTemplate = () => {
        window.location.href = '/sales/bulk/template';
    };

    const handleCreateUsers = () => {
        if (!results?.errors) return;

        const dnis = results.errors
            .filter(error => error.dni)
            .map(error => error.dni);

        if (dnis.length === 0) return;

        router.post('/users/bulk/create',
            { dnis },
            {
                onSuccess: () => {
                    if (selectedFile) {
                        uploadFile(selectedFile, false);
                    }
                },
                onError: (errors) => {
                    console.error('Error creating users:', errors);
                }
            }
        );
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, isUpdate: boolean = false) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        if (isUpdate) {
            uploadFileForUpdate(file);
        } else {
            uploadFile(file);
        }
    };

    // Esta función ha sido reemplazada por la nueva implementación en la parte superior

    const uploadFile = (file: File, onlySuccessful: boolean = false) => {
        const formData = new FormData();
        formData.append('file', file);
        if (onlySuccessful) {
            formData.append('only_successful', 'true');
        }

        setUploading(true);
        setProgress(0);
        setShowProgress(true);
        setIsProcessing(false);

        router.post('/sales/bulk/upload', formData, {
            preserveScroll: true,
            preserveState: true,
            onProgress: (event) => {
                if (event.lengthComputable) {
                    setProgress((event.loaded * 100) / event.total);
                }
            },
            onSuccess: () => {
                setUploading(false);
                setProgress(100);
                setIsProcessing(true);
                // Aseguramos que el modal de progreso se cierre antes de mostrar los resultados
                setShowProgress(false);
                // Pequeño retraso para mostrar los resultados
                setTimeout(() => {
                    setShowResults(true);
                }, 500);
            },
            onError: () => {
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
            <Head title="Carga Masiva de Ventas" />

            <div className="flex flex-col gap-6 p-4">
                <h1 className="text-2xl font-bold">Carga Masiva de Ventas</h1>

                <div className="grid gap-6">
                    {/* Sección de Descarga */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Descargar Plantilla</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Descarga la plantilla Excel para cargar las ventas. La plantilla incluye:
                            </p>
                            <ul className="mb-4 list-disc pl-5 text-sm text-muted-foreground">
                                <li>Instrucciones detalladas</li>
                                <li>Ejemplo de cómo llenar la plantilla</li>
                            </ul>
                            <Button onClick={handleDownloadTemplate}>
                                <Download className="mr-2 h-4 w-4" />
                                Descargar Plantilla
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Sección de Carga */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cargar Archivo</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Carga el archivo Excel con las ventas. El archivo debe:
                                    </p>
                                    <ul className="mb-4 list-disc pl-5 text-sm text-muted-foreground">
                                        <li>Ser un archivo Excel (.xlsx)</li>
                                        <li>Seguir el formato de la plantilla</li>
                                        <li>No exceder 10MB de tamaño</li>
                                    </ul>
                                </CardContent>
                                <label
                                    htmlFor="file-upload"
                                    className="flex flex-col items-center justify-center gap-4 p-8 m-4 border-2 border-dashed rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                                >
                                    <input
                                        type="file"
                                        accept=".xlsx"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="file-upload"
                                        disabled={uploading}
                                    />
                                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                        <div className="grid gap-1 text-center">
                                            <p className="text-sm font-medium">
                                                Haz clic para seleccionar
                                                <span className="text-muted-foreground"> o arrastra y suelta</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Excel (XLSX) hasta 10MB
                                            </p>
                                        </div>
                                    </div>
                                </label>
                            </Card>
                        </div>
                        <div>
                            {/* Card de Actualización Masiva */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actualización Masiva de Ventas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Actualiza masivamente las ventas existentes usando el teléfono y la fecha como identificadores.
                                    </p>
                                    <ul className="mb-4 list-disc pl-5 text-sm text-muted-foreground">
                                        <li>Usa el mismo formato de la plantilla</li>
                                        <li>El teléfono y la fecha son obligatorios para identificar la venta</li>
                                        <li>Solo se actualizarán los campos que contengan información</li>
                                    </ul>
                                </CardContent>
                                <label
                                    htmlFor="update-file"
                                    className="flex flex-col items-center justify-center gap-4 p-8 m-4 border-2 border-dashed rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                                >
                                    <input
                                        type="file"
                                        accept=".xlsx"
                                        onChange={(e) => handleFileUpload(e, true)}
                                        className="hidden"
                                        id="update-file"
                                        disabled={isUpdating}
                                    />
                                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                                        <RefreshCw className="h-6 w-6 text-muted-foreground" />
                                        <div className="grid gap-1 text-center">
                                            <p className="text-sm font-medium">
                                                Haz clic para seleccionar
                                                <span className="text-muted-foreground"> o arrastra y suelta</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Excel (XLSX) hasta 10MB
                                            </p>
                                        </div>
                                    </div>
                                </label>
                            </Card>
                        </div>
                    </div>

                    {/* Modal de Resultados */}
                    <Dialog open={showResults} onOpenChange={setShowResults}>
                        <DialogContent className="max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Resultados de la Importación</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 overflow-y-auto px-6">
                                {results && results.errors.length > 0 && (
                                    <div className="flex flex-col sm:flex-row gap-2 -mx-2 mb-4">
                                        <Button
                                            onClick={handleCreateUsers}
                                            variant="outline"
                                            className="flex-1 h-auto py-2 text-xs sm:text-sm font-medium bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 whitespace-normal text-center min-h-[2.5rem]"
                                        >
                                            Registrar DNIs no encontrados
                                        </Button>
                                        <Button
                                            onClick={() => selectedFile && uploadFile(selectedFile, true)}
                                            variant="outline"
                                            className="flex-1 h-auto py-2 text-xs sm:text-sm font-medium bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 whitespace-normal text-center min-h-[2.5rem]"
                                        >
                                            Subir solo registros exitosos
                                        </Button>
                                    </div>
                                )}

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
                                                    {results.errors?.length || 0}
                                                </p>
                                            </div>
                                        </div>

                                        {results.errors && results.errors.length > 0 && (
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
                    <Dialog open={showProgress} onOpenChange={setShowProgress}>
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

                    {/* Modal de progreso para actualización */}
                    <Dialog open={showUpdateProgress} onOpenChange={setShowUpdateProgress}>
                        <DialogContent className="sm:max-w-md bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
                            <DialogHeader>
                                <DialogTitle className="text-center flex flex-col items-center gap-2">
                                    {isUpdating ? (
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <div className="absolute inset-0 rounded-full bg-[#00B8D9]/20 dark:bg-[#00B8D9]/40 animate-pulse opacity-75"></div>
                                                <RefreshCw className="h-6 w-6 text-[#0062CC] dark:text-[#00B8D9] relative animate-spin" />
                                            </div>
                                            <span className="bg-gradient-to-r from-[#0062CC] to-[#00B8D9] text-transparent bg-clip-text font-semibold">
                                                Actualizando ventas
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <div className="absolute inset-0 rounded-full bg-[#00B8D9]/20 dark:bg-[#00B8D9]/40 animate-pulse opacity-75"></div>
                                                <Upload className="h-6 w-6 text-[#0062CC] dark:text-[#00B8D9] relative" />
                                            </div>
                                            <span className="bg-gradient-to-r from-[#0062CC] to-[#00B8D9] text-transparent bg-clip-text font-semibold">
                                                Subiendo archivo de actualización
                                            </span>
                                        </div>
                                    )}
                                </DialogTitle>
                                <DialogDescription className="text-neutral-600 dark:text-neutral-400 mt-2 text-center">
                                    {isUpdating
                                        ? "Actualizando registros de ventas según el teléfono y fecha..."
                                        : "Subiendo el archivo de actualización al servidor..."}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                <div className="relative pt-4 pb-8">
                                    <Progress
                                        value={updatingProgress}
                                        className={`w-full h-4 transition-all duration-300 ${isUpdating ? 'bg-[#00B8D9]/20 dark:bg-[#00B8D9]/20' : 'bg-[#00B8D9]/20 dark:bg-[#00B8D9]/20'}`}
                                        indicatorClassName={`${isUpdating
                                            ? 'bg-gradient-to-r from-[#0062CC] to-[#00B8D9]'
                                            : 'bg-gradient-to-r from-[#0062CC] to-[#00B8D9]'}
                        ${isUpdating ? 'animate-pulse' : ''}`}
                                    />
                                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-neutral-900 px-4 py-2 rounded-full border-2 border-[#00B8D9]/20 shadow-sm">
                                        <span className="text-lg font-bold bg-gradient-to-r from-[#0062CC] to-[#00B8D9] text-transparent bg-clip-text">
                                            {Math.round(updatingProgress)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-center items-center gap-2">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full
                    ${isUpdating
                                            ? 'bg-[#00B8D9]/10 text-[#0062CC] dark:bg-[#00B8D9]/20 dark:text-[#00B8D9]'
                                            : 'bg-[#00B8D9]/10 text-[#0062CC] dark:bg-[#00B8D9]/20 dark:text-[#00B8D9]'}`}>
                                        {isUpdating ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm font-medium">Actualizando ventas</span>
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

                    {/* Modal de resultados para actualización */}
                    <Dialog open={showUpdateResults} onOpenChange={setShowUpdateResults}>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-center">
                                    Resultados de la Actualización
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                {updateSuccess && (
                                    <Alert className="border-green-500/50 bg-green-500/10">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <AlertTitle className="text-green-600 dark:text-green-400">Actualización Exitosa</AlertTitle>
                                        <AlertDescription className="text-green-600/90 dark:text-green-400/90">
                                            {updateSuccess}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {updateError && (
                                    <Alert className="border-red-500/50 bg-red-500/10">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                        <AlertTitle className="text-red-600 dark:text-red-400">Error en la Actualización</AlertTitle>
                                        <AlertDescription className="text-red-600/90 dark:text-red-400/90">
                                            {updateError}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {updateResults && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                                                <p className="text-sm text-blue-600 dark:text-blue-400">Total</p>
                                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{updateResults.total}</p>
                                            </div>
                                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                                                <p className="text-sm text-green-600 dark:text-green-400">Actualizados</p>
                                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{updateResults.success}</p>
                                            </div>
                                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-center">
                                                <p className="text-sm text-amber-600 dark:text-amber-400">Errores</p>
                                                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{updateResults.errors?.length || 0}</p>
                                            </div>
                                        </div>

                                        {updateResults.errors && updateResults.errors.length > 0 && (
                                            <div className="mt-4">
                                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                                        <h3 className="font-medium text-amber-700 dark:text-amber-300">Detalles de los errores</h3>
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                                        {updateResults.errors.map((error, index) => (
                                                            <div key={index} className="text-sm bg-white dark:bg-neutral-800 p-2 rounded border border-amber-200 dark:border-amber-800">
                                                                <span className="font-medium">Fila {error.row}: </span>
                                                                <span className="text-neutral-700 dark:text-neutral-300">{error.message}</span>
                                                                {error.dni && (
                                                                    <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                                        DNI: {error.dni}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowUpdateResults(false)}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
