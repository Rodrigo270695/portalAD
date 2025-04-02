import React from 'react';

type ColorVariant = 'blue' | 'emerald' | 'purple' | 'orange' | 'red';

interface CardDashboardProps {
    title: string;
    children: React.ReactNode;
    variant?: ColorVariant;
}

const getHeaderColorClasses = (variant: ColorVariant = 'blue') => {
    const colors = {
        blue: 'bg-blue-500',
        emerald: 'bg-emerald-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
        red: 'bg-red-500'
    };
    return colors[variant];
};

const CardDashboard: React.FC<CardDashboardProps> = ({
    title,
    children,
    variant = 'blue'
}) => {
    const headerColorClass = getHeaderColorClasses(variant);

    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border bg-white dark:bg-sidebar-background shadow-sm">
            <div className={`${headerColorClass} p-3 text-white font-medium text-lg`}>
                {title}
            </div>
            <div className="p-4 flex flex-col space-y-3">
                {children}
            </div>
        </div>
    );
};

export default CardDashboard;
