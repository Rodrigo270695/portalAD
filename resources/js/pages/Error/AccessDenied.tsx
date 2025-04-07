import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

interface Props {
    title: string;
    message: string;
    code: number;
}

export default function AccessDenied({ title, message, code }: Props) {
    return (
        <AppLayout>
            <Head title={title} />
            
            <div className="flex items-center justify-center min-h-[80vh]">
                <Card className="w-full max-w-lg p-8">
                    <div className="flex flex-col items-center gap-6 text-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            <p className="text-gray-500">{message}</p>
                            <p className="text-sm text-gray-400">Código de error: {code}</p>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                onClick={() => window.history.back()}
                                variant="outline"
                            >
                                Volver atrás
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/dashboard'}
                                variant="default"
                            >
                                Ir al Dashboard
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
