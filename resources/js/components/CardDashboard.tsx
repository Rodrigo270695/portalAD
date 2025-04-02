import React from 'react';

interface CardDashboardProps {
    title: string;
    children: React.ReactNode;
}

const CardDashboard: React.FC<CardDashboardProps> = ({
    title,
    children
}) => {
    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border bg-white dark:bg-sidebar-background shadow-sm">
            <div className="bg-blue-500 p-3 text-white font-medium text-lg">
                {title}
            </div>
            <div className="p-4 flex flex-col space-y-3">
                {children}
            </div>
        </div>
    );
};

export default CardDashboard;
