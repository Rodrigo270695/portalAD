import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function Forbidden() {
    return (
        <AppLayout>
            <Head title="Acceso No Autorizado" />
            
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-4xl w-full overflow-hidden">
                    <div className="md:flex">
                        {/* Sección izquierda con el fondo de color */}
                        <div className="bg-red-600 p-8 md:w-1/3 flex items-center justify-center">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10">
                                    <ShieldAlert className="w-12 h-12 text-white" />
                                </div>
                                <div className="mt-4">
                                    <h2 className="text-white text-4xl font-bold">403</h2>
                                    <p className="text-red-100 mt-2">Acceso Denegado</p>
                                </div>
                            </div>
                        </div>

                        {/* Sección derecha con el contenido */}
                        <div className="p-8 md:w-2/3">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                No tienes permiso para ver esta página
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Lo sentimos, pero no tienes los permisos necesarios para acceder a esta sección. 
                                Si crees que esto es un error, por favor contacta a tu supervisor o al administrador del sistema.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={() => window.history.back()}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Volver atrás
                                </Button>
                                <Button
                                    onClick={() => window.location.href = '/dashboard'}
                                    variant="default"
                                    className="flex items-center gap-2"
                                >
                                    <Home className="w-4 h-4" />
                                    Ir al Dashboard
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
