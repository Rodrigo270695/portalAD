<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso Denegado</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #6366f1;
            --error-color: #ef4444;
            --text-primary: #1f2937;
            --text-secondary: #4b5563;
            --gradient-start: #f0f7ff;
            --gradient-end: #e8f0fe;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(-45deg, var(--gradient-start), #dbeafe, #ede9fe, var(--gradient-end));
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            position: relative;
            overflow: hidden;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            pointer-events: none;
            opacity: 0.5;
        }

        .background-shapes {
            position: fixed;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
        }

        .shape {
            position: absolute;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
            backdrop-filter: blur(5px);
            border-radius: 50%;
            animation: float 8s ease-in-out infinite;
        }

        .shape:nth-child(1) {
            width: 300px;
            height: 300px;
            top: -150px;
            left: -150px;
        }

        .shape:nth-child(2) {
            width: 200px;
            height: 200px;
            bottom: -100px;
            right: -100px;
            animation-delay: -2s;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
        }

        .error-container {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 3rem;
            text-align: center;
            box-shadow: 
                0 8px 32px rgba(0, 0, 0, 0.1),
                inset 0 0 0 1px rgba(255, 255, 255, 0.5),
                inset 0 0 30px rgba(99, 102, 241, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.5);
            max-width: 500px;
            width: 90%;
            position: relative;
            z-index: 1;
            animation: fadeIn 0.5s ease-out;
            overflow: hidden;
        }

        .error-container::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 50%);
            animation: pulse 5s ease-out infinite;
            z-index: -1;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .error-icon {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, var(--error-color), #dc2626);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
            position: relative;
            box-shadow: 
                0 8px 16px rgba(239, 68, 68, 0.2),
                inset 0 -4px 8px rgba(0, 0, 0, 0.1),
                inset 0 4px 8px rgba(255, 255, 255, 0.1);
            animation: iconPulse 2s ease-in-out infinite;
        }

        @keyframes iconPulse {
            0%, 100% {
                transform: scale(1);
                box-shadow: 
                    0 8px 16px rgba(239, 68, 68, 0.2),
                    inset 0 -4px 8px rgba(0, 0, 0, 0.1),
                    inset 0 4px 8px rgba(255, 255, 255, 0.1);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 
                    0 12px 24px rgba(239, 68, 68, 0.3),
                    inset 0 -6px 12px rgba(0, 0, 0, 0.15),
                    inset 0 6px 12px rgba(255, 255, 255, 0.15);
            }
        }

        .error-icon::before {
            content: '!';
            color: white;
            font-size: 3rem;
            font-weight: bold;
        }

        h1 {
            font-size: 5rem;
            font-weight: 800;
            margin: 0;
            line-height: 1;
            background: linear-gradient(135deg, var(--error-color) 0%, #dc2626 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            position: relative;
            text-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
            letter-spacing: -0.02em;
        }

        h1::after {
            content: '403';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            font-size: 8rem;
            opacity: 0.03;
            z-index: -1;
            filter: blur(8px);
            letter-spacing: 0.5rem;
            color: var(--error-color);
        }

        h2 {
            font-size: 1.5rem;
            color: var(--text-primary);
            margin: 1rem 0;
            font-weight: 600;
        }

        p {
            color: var(--text-secondary);
            margin-bottom: 2rem;
            font-size: 1.1rem;
            line-height: 1.5;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, var(--primary-color) 0%, #4f46e5 100%);
            color: white;
            text-decoration: none;
            border-radius: 16px;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            gap: 0.75rem;
            position: relative;
            overflow: hidden;
            box-shadow: 
                0 4px 12px rgba(99, 102, 241, 0.25),
                inset 0 2px 4px rgba(255, 255, 255, 0.25);
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: 0.5s;
        }

        .btn:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 
                0 6px 20px rgba(99, 102, 241, 0.35),
                inset 0 2px 4px rgba(255, 255, 255, 0.25);
        }

        .btn:hover::before {
            left: 100%;
        }

        .btn svg {
            width: 20px;
            height: 20px;
        }

        @media (max-width: 640px) {
            .error-container {
                padding: 2rem;
            }

            h1 {
                font-size: 4rem;
            }

            h2 {
                font-size: 1.25rem;
            }

            p {
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="background-shapes">
        <div class="shape"></div>
        <div class="shape"></div>
    </div>
    <div class="error-container">
        <div class="error-icon"></div>
        <h1>403</h1>
        <h2>Acceso Denegado</h2>
        <p>Lo sentimos, no tienes los permisos necesarios para acceder a esta página. Por favor, verifica tus credenciales o contacta al administrador.</p>
        <a href="{{ url('/') }}" class="btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Volver al Inicio
        </a>
    </div>
</body>
</html>
