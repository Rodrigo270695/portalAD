import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, CreditCard, User, Mail, Lock } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    dni: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        dni: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Crear una cuenta" description="Ingresa tus datos para crear tu cuenta">
            <Head title="Registro | Portal AD" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-sm font-medium">Nombre completo</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                <User size={18} />
                            </div>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                disabled={processing}
                                placeholder="Nombre y apellidos"
                                className="pl-10 transition-all border-2 rounded-lg h-12 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="dni" className="text-sm font-medium">DNI</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                <CreditCard size={18} />
                            </div>
                            <Input
                                id="dni"
                                type="text"
                                required
                                tabIndex={2}
                                maxLength={8}
                                pattern="[0-9]{8}"
                                title="El DNI debe contener 8 dígitos numéricos"
                                value={data.dni}
                                onChange={(e) => setData('dni', e.target.value.replace(/\D/g, ''))}
                                disabled={processing}
                                placeholder="Ingresa tu DNI (8 dígitos)"
                                className="pl-10 transition-all border-2 rounded-lg h-12 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <InputError message={errors.dni} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                <Mail size={18} />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={3}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                disabled={processing}
                                placeholder="correo@ejemplo.com"
                                className="pl-10 transition-all border-2 rounded-lg h-12 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                <Lock size={18} />
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder="••••••••"
                                className="pl-10 transition-all border-2 rounded-lg h-12 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" className="text-sm font-medium">Confirmar contraseña</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                <Lock size={18} />
                            </div>
                            <Input
                                id="password_confirmation"
                                type="password"
                                required
                                tabIndex={5}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder="••••••••"
                                className="pl-10 transition-all border-2 rounded-lg h-12 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button 
                        type="submit" 
                        className="mt-4 w-full gap-2 bg-primary py-7 text-base font-semibold hover:bg-primary/90 focus:ring-2 focus:ring-primary/25 rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-lg" 
                        tabIndex={6} 
                        disabled={processing}
                    >
                        {processing ? (
                            <LoaderCircle className="h-5 w-5 animate-spin" />
                        ) : (
                            'Crear cuenta'
                        )}
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm mt-4">
                    ¿Ya tienes una cuenta?{' '}
                    <TextLink 
                        href={route('login')} 
                        tabIndex={7}
                        className="font-medium text-primary hover:underline transition-colors"
                    >
                        Iniciar sesión
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
