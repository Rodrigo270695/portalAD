// Función para enviar logs al servidor
function logActivity(action, description, additionalData = {}) {
    fetch('/api/log-activity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({
            action,
            description,
            additional_data: {
                ...additionalData,
                timestamp: new Date().toISOString(),
                screen_size: `${window.innerWidth}x${window.innerHeight}`,
                is_pwa: window.matchMedia('(display-mode: standalone)').matches,
                platform: navigator.platform,
                connection_type: navigator?.connection?.effectiveType || 'unknown',
                memory_usage: performance?.memory?.usedJSHeapSize ?
                    Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB' : 'unknown'
            }
        })
    });
}

// Rastrear cambios de visibilidad
let lastVisibilityChange = new Date();
document.addEventListener('visibilitychange', function() {
    const now = new Date();
    const timeInPreviousState = now - lastVisibilityChange;

    logActivity(
        'visibility_change',
        document.hidden ? 'Aplicación en segundo plano' : 'Aplicación en primer plano',
        {
            visibility_state: document.hidden ? 'hidden' : 'visible',
            time_in_previous_state: Math.round(timeInPreviousState / 1000) + 's'
        }
    );

    lastVisibilityChange = now;
});

// Rastrear inicio de la aplicación
window.addEventListener('load', () => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    logActivity(
        'app_start',
        isPWA ? 'Aplicación iniciada desde homescreen' : 'Aplicación iniciada en navegador',
        {
            launch_type: isPWA ? 'pwa' : 'browser',
            referrer: document.referrer || 'direct',
            cached: performance?.getEntriesByType('navigation')[0]?.transferSize === 0
        }
    );
});

// Rastrear cuando el usuario vuelve a la aplicación después de un tiempo
let lastActivity = new Date();
const INACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutos

function updateLastActivity() {
    const now = new Date();
    const timeSinceLastActivity = now - lastActivity;

    if (timeSinceLastActivity > INACTIVE_THRESHOLD) {
        logActivity(
            'user_return',
            'Usuario regresó después de inactividad',
            {
                inactive_time: Math.round(timeSinceLastActivity / 1000) + 's'
            }
        );
    }

    lastActivity = now;
}

// Eventos para detectar actividad del usuario
['click', 'touchstart', 'mousemove', 'keypress', 'scroll'].forEach(event => {
    document.addEventListener(event, updateLastActivity, { passive: true });
});

// Rastrear estado de la conexión
if ('connection' in navigator) {
    navigator.connection.addEventListener('change', function() {
        logActivity(
            'connection_change',
            'Cambio en la conexión del usuario',
            {
                effective_type: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink + 'Mbps',
                rtt: navigator.connection.rtt + 'ms'
            }
        );
    });
}

// Rastrear errores de la aplicación
window.addEventListener('error', function(event) {
    logActivity(
        'app_error',
        'Error en la aplicación',
        {
            error_message: event.message,
            error_source: event.filename,
            error_line: event.lineno,
            error_column: event.colno
        }
    );
});

// Rastrear uso de memoria cada 5 minutos si está disponible
if (performance?.memory) {
    setInterval(() => {
        logActivity(
            'memory_usage',
            'Medición de uso de memoria',
            {
                used_heap_size: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
                total_heap_size: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB'
            }
        );
    }, 5 * 60 * 1000);
}

// Rastrear cuando el usuario cierra/recarga la página
window.addEventListener('beforeunload', () => {
    logActivity(
        'app_exit',
        'Usuario cerró o recargó la aplicación',
        {
            session_duration: Math.round((new Date() - performance.timing.navigationStart) / 1000) + 's'
        }
    );
});
