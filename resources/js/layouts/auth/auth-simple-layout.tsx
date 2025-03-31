import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-svh flex items-center justify-center p-0 bg-gradient-to-br from-[#0062CC]/5 via-[#00B8D9]/10 to-[#0062CC]/5 dark:from-gray-950 dark:via-[#0062CC]/20 dark:to-[#00B8D9]/10">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-[#0062CC]/10 dark:bg-[#0062CC]/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#00B8D9]/10 dark:bg-[#00B8D9]/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#0062CC]/10 dark:bg-[#0062CC]/20 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Tarjeta principal */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    {/* Barra superior decorativa */}
                    <div className="h-2 bg-gradient-to-r from-[#0062CC] to-[#00B8D9]"></div>

                    <div className="p-8 md:p-10">
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col items-center gap-6">
                                <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium transition-transform hover:scale-105">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0062CC] to-[#00B8D9] shadow-lg shadow-[#0062CC]/20">
                                        <AppLogoIcon className="size-10 fill-current text-white" />
                                    </div>
                                    <span className="sr-only">{title}</span>
                                </Link>

                                <div className="space-y-3 text-center">
                                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#0062CC] to-[#00B8D9] bg-clip-text text-transparent dark:from-[#0062CC] dark:to-[#00B8D9]">
                                        {title}
                                    </h1>
                                    <p className="text-muted-foreground text-center text-sm max-w-xs mx-auto">
                                        {description}
                                    </p>
                                </div>
                            </div>
                            {children}
                        </div>
                    </div>
                </div>

                {/* Efecto de brillo inferior */}
                <div className="absolute -z-10 h-32 w-full blur-3xl bg-gradient-to-r from-[#0062CC]/30 to-[#00B8D9]/30 -bottom-10 rounded-full opacity-60"></div>

                {/* Pie de página */}
                <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    {new Date().getFullYear()} MACGA - Portal AD. Todos los derechos reservados.
                </div>
            </div>
        </div>
    );
}
