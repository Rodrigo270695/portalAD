import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <>
            <Head title="404 - Página no encontrada" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full px-6 py-8 text-center">
                    <div className="mb-8">
                        <h1 className="text-9xl font-bold text-blue-600">404</h1>
                        <p className="mt-4 text-2xl font-semibold text-gray-800">Página no encontrada</p>
                        <p className="mt-2 text-gray-600">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
                    </div>
                    <div className="space-y-4">
                        <Button
                            onClick={() => window.history.back()}
                            variant="outline"
                            className="mr-4"
                        >
                            Volver atrás
                        </Button>
                        <Link href="/">
                            <Button
                                variant="default"
                            >
                                Ir al inicio
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
