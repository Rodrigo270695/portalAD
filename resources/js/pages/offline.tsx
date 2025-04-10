import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function Offline() {
    const [isRetrying, setIsRetrying] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (isRetrying) {
            const timer = setTimeout(() => {
                window.location.reload();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isRetrying]);

    const handleRetry = () => {
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card principal */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-cyan-500/20">
                    {/* Ícono animado */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <WifiOff className="w-16 h-16 text-cyan-400 animate-pulse" />
                            <div className="absolute -top-1 -right-1">
                                <div className="w-4 h-4 bg-cyan-500 rounded-full animate-ping" />
                            </div>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl font-bold text-cyan-50 mb-2">
                            Sin conexión
                        </h1>
                        <p className="text-cyan-200 text-lg">
                            Parece que has perdido la conexión a internet
                        </p>
                        <p className="text-cyan-300 text-sm">
                            Verifica tu conexión y vuelve a intentarlo
                        </p>
                    </div>

                    {/* Botón de reintento con estado */}
                    <div className="mt-8">
                        <button
                            onClick={handleRetry}
                            disabled={isRetrying}
                            className={`
                                w-full py-3 px-4 rounded-xl font-medium text-sm
                                transition-all duration-300 transform
                                ${isRetrying
                                    ? 'bg-emerald-500/20 text-emerald-300 cursor-wait'
                                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white hover:scale-105 shadow-lg shadow-cyan-500/25'
                                }
                                flex items-center justify-center gap-2
                            `}
                        >
                            {isRetrying ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Reconectando...
                                </>
                            ) : (
                                <>
                                    <Wifi className="w-4 h-4" />
                                    Reintentar conexión
                                </>
                            )}
                        </button>
                    </div>

                    {/* Indicador de intentos */}
                    {retryCount > 0 && (
                        <div className="mt-4 text-center">
                            <span className="text-sm text-cyan-400">
                                Intentos: {retryCount}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer con estado de la aplicación */}
                <div className="mt-6 text-center">
                    <p className="text-cyan-200 text-sm">
                        La aplicación continuará funcionando con funcionalidades limitadas
                    </p>
                    <p className="text-cyan-400/60 text-xs mt-2">
                        Tus cambios se sincronizarán cuando vuelvas a estar en línea
                    </p>
                </div>
            </div>
        </div>
    );
}
