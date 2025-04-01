import React from 'react';
import { User } from 'lucide-react';

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
                <div className="flex justify-center mb-2">
                    <div className="size-20 rounded-full border-4 border-blue-300 flex items-center justify-center bg-blue-100">
                        <User className="size-10 text-blue-500" />
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
};

export default CardDashboard;
