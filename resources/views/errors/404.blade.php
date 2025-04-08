<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Página no encontrada</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #6366f1;
            --error-color: #6b7280;
            --text-primary: #1f2937;
            --text-secondary: #4b5563;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(-45deg, #f3f4f6, #dbeafe, #ede9fe, #e5e7eb);
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
            background: 
                radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.03) 0%, transparent 25%),
                radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.03) 0%, transparent 25%),
                url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            pointer-events: none;
            opacity: 0.5;
        }

        @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
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
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            animation: morph 8s ease-in-out infinite;
        }

        .shape:nth-child(1) {
            width: 400px;
            height: 400px;
            top: -200px;
            left: -200px;
            animation-delay: -2s;
        }

        .shape:nth-child(2) {
            width: 300px;
            height: 300px;
            bottom: -150px;
            right: -150px;
        }

        @keyframes morph {
            0%, 100% {
                border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            }
            50% {
                border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
            }
        }

        .error-container {
            background: rgba(255, 255, 255, 0.95);
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
            background: radial-gradient(circle at center, rgba(99, 102, 241, 0.05) 0%, transparent 50%);
            animation: pulse 5s ease-out infinite;
            z-index: -1;
        }

        @keyframes pulse {
            0% { transform: translate(0, 0) scale(1); opacity: 0.5; }
            50% { transform: translate(-5%, -5%) scale(1.05); opacity: 0.7; }
            100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .error-illustration {
            width: 200px;
            height: 200px;
            margin: 0 auto 2rem;
            position: relative;
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0); }
            25% { transform: translateY(-10px) rotate(-2deg); }
            75% { transform: translateY(-5px) rotate(2deg); }
        }

        .error-illustration::before {
            content: '404';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            font-weight: bold;
            background: linear-gradient(135deg, var(--error-color) 0%, #4b5563 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            opacity: 0.2;
        }

        .error-illustration::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpath d='M16 16s-1.5-2-4-2-4 2-4 2'%3E%3C/path%3E%3Cline x1='9' y1='9' x2='9.01' y2='9'%3E%3C/line%3E%3Cline x1='15' y1='9' x2='15.01' y2='9'%3E%3C/line%3E%3C/svg%3E") no-repeat center;
            opacity: 0.5;
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.05); opacity: 0.7; }
        }

        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
            line-height: 1.2;
        }

        p {
            color: var(--text-secondary);
            margin: 1rem 0 2rem;
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
            transition: transform 0.3s ease;
        }

        .btn:hover svg {
            transform: translateX(-2px);
        }

        .btn svg {
            width: 20px;
            height: 20px;
        }

        @media (max-width: 640px) {
            .error-container {
                padding: 2rem;
            }

            .error-illustration {
                width: 150px;
                height: 150px;
            }

            h1 {
                font-size: 2rem;
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
        <div class="error-illustration"></div>
        <h1>Página no encontrada</h1>
        <p>Lo sentimos, parece que la página que estás buscando se ha perdido en el ciberespacio. ¿Qué tal si volvemos al inicio?</p>
        <a href="{{ url('/') }}" class="btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Volver al Inicio
        </a>
    </div>
</body>
</html>
