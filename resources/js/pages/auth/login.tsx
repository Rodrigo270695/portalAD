import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, CreditCard, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    dni: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        dni: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Bienvenido al Portal AD" description="Tu plataforma centralizada para gestión y administración">
            <Head title="Iniciar sesión" />

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-center text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {status}
                </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="dni" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            DNI
                        </Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0062CC]">
                                <CreditCard size={18} />
                            </div>
                            <Input
                                id="dni"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                maxLength={8}
                                pattern="[0-9]{8}"
                                title="El DNI debe contener 8 dígitos numéricos"
                                value={data.dni}
                                onChange={(e) => setData('dni', e.target.value.replace(/\D/g, ''))}
                                placeholder="Ingresa tu DNI (8 dígitos)"
                                className="pl-10 pr-16 transition-all border-2 border-gray-200 focus:border-[#00B8D9] rounded-lg h-12 focus:ring-2 focus:ring-[#00B8D9]/20 dark:border-gray-700 dark:focus:border-[#00B8D9]"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                {data.dni.length}/8
                            </div>
                        </div>
                        <InputError message={errors.dni} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Contraseña
                            </Label>
                            {canResetPassword && (
                                <TextLink
                                    href={route('password.request')}
                                    className="text-xs font-medium text-[#0062CC] hover:text-[#00B8D9] hover:underline transition-colors"
                                    tabIndex={5}
                                >
                                    ¿Olvidaste tu contraseña?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0062CC]">
                                <Lock size={18} />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                className="pl-10 pr-12 transition-all border-2 border-gray-200 focus:border-[#00B8D9] rounded-lg h-12 focus:ring-2 focus:ring-[#00B8D9]/20 dark:border-gray-700 dark:focus:border-[#00B8D9]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0062CC] transition-colors focus:outline-none"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3 pt-1">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                            className="h-5 w-5 border-gray-300 text-[#0062CC] focus:ring-[#00B8D9]/25 dark:border-gray-600"
                        />
                        <Label htmlFor="remember" className="text-sm font-normal text-gray-600 dark:text-gray-400">
                            Recordarme
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full gap-2 bg-gradient-to-r from-[#0062CC] to-[#00B8D9] py-7 text-base font-semibold hover:from-[#0062CC]/90 hover:to-[#00B8D9]/90 focus:ring-2 focus:ring-[#00B8D9]/25 rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-lg text-white"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing ? (
                            <LoaderCircle className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <LogIn size={20} />
                                Iniciar sesión
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
