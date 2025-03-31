// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthLayout title="Recuperar contraseña" description="Ingresa tu correo electrónico para recibir un enlace de restablecimiento de contraseña">
            <Head title="Recuperar contraseña" />

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <div className="space-y-6">
                <form onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="correo@ejemplo.com"
                        />

                        <InputError message={errors.email} />
                    </div>

                    <div className="my-6 flex items-center justify-start">
                        <Button 
                            className="w-full gap-2 bg-gradient-to-r from-[#0062CC] to-[#00B8D9] py-6 text-base font-semibold hover:from-[#0062CC]/90 hover:to-[#00B8D9]/90 focus:ring-2 focus:ring-[#00B8D9]/25 rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-lg text-white"
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                            Enviar enlace de recuperación
                        </Button>
                    </div>
                </form>

                <div className="text-muted-foreground space-x-1 text-center text-sm">
                    <span>O, volver a</span>
                    <TextLink href={route('login')}>iniciar sesión</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
