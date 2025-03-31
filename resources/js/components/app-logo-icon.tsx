import { HTMLAttributes } from 'react';

export default function AppLogoIcon({ className, ...props }: HTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/img/LOGO.png"
            alt="Logo Portal Comercial AD"
            className={className}
            {...props}
        />
    );
}
