import React from 'react';

interface PDVInfoProps {
    name: string;
    dni: string;
    vendorName: string;
    vendorDNI: string;
    vendorPhone: string;
    channel: string;
    group: string;
    updateDate: string;
    pdvLevel: string;
}

const PDVInfo: React.FC<PDVInfoProps> = ({
    name,
    dni,
    vendorName,
    vendorDNI,
    vendorPhone,
    channel,
    group,
    updateDate,
    pdvLevel
}) => {
    return (
        <div className="space-y-2">
            <div className="flex flex-col">
                <span className="font-medium text-gray-600 dark:text-gray-300">Nombre PDV:</span>
                <span className="text-gray-800 dark:text-white">{name}</span>
            </div>

            <div className="flex flex-col">
                <span className="font-medium text-gray-600 dark:text-gray-300">DNI Responsable:</span>
                <span className="text-gray-800 dark:text-white">{dni}</span>
            </div>

            <div className="flex flex-col">
                <span className="font-medium text-gray-600 dark:text-gray-300">Vendedor:</span>
                <span className="text-gray-800 dark:text-white">{vendorName}</span>
            </div>

            <div className="flex flex-col">
                <span className="font-medium text-gray-600 dark:text-gray-300">DNI Vendedor:</span>
                <span className="text-gray-800 dark:text-white">{vendorDNI}</span>
            </div>

            <div className="flex flex-col">
                <span className="font-medium text-gray-600 dark:text-gray-300">Celular Vendedor:</span>
                <span className="text-gray-800 dark:text-white">{vendorPhone}</span>
            </div>

            <div className="flex flex-col">
                <span className="font-medium text-gray-600 dark:text-gray-300">Canal:</span>
                <span className="text-gray-800 dark:text-white">{channel}</span>
            </div>

            <div className="flex flex-col">
                <span className="font-medium text-gray-600 dark:text-gray-300">Grupo:</span>
                <span className="text-gray-800 dark:text-white">{group}</span>
            </div>

            <div className="flex flex-col">
                <span className="font-medium text-gray-600 dark:text-gray-300">Fecha de Actualización:</span>
                <span className="text-gray-800 dark:text-white">{updateDate}</span>
            </div>

            <div className="flex flex-col">
                <span className="font-medium text-gray-600 dark:text-gray-300">Nivel PDV:</span>
                <span className="text-gray-800 dark:text-white">{pdvLevel}</span>
            </div>
        </div>
    );
};

export default PDVInfo;
