import React from 'react';
import { Store, UserCircle, Phone, Building2, Users2, Calendar, Award, CreditCard, PhoneCall } from 'lucide-react';

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

const formatPeruPhone = (phone: string) => {
    if (!phone) return "";
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // If it starts with 51, remove it
    const withoutCountry = cleaned.startsWith('51') ? cleaned.slice(2) : cleaned;
    // Ensure it's 9 digits
    if (withoutCountry.length !== 9) return cleaned;
    // Format as XXX XXX XXX
    return withoutCountry.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
};

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
    const formattedPhone = formatPeruPhone(vendorPhone);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon={<Store className="text-blue-500" size={18} />} label="Nombre PDV" value={name} />
            <InfoCard icon={<CreditCard className="text-blue-500" size={18} />} label="DNI PDV" value={dni} />
            <InfoCard icon={<UserCircle className="text-blue-500" size={18} />} label="Zonificado" value={vendorName} />
            <InfoCard icon={<CreditCard className="text-blue-500" size={18} />} label="DNI Zonificado" value={vendorDNI} />
            <InfoCard
                icon={<Phone className="text-blue-500" size={18} />}
                label="Celular Zonificado"
                value={
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center gap-1 min-w-0 flex-shrink">
                            <span className="truncate">{formattedPhone || "No asignado"}</span>
                        </div>
                        {vendorPhone && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={() => window.open(`tel:+51${vendorPhone.replace(/\D/g, '')}`, '_blank')}
                                    className="cursor-pointer p-1 rounded-lg text-blue-600 hover:bg-blue-50 active:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                                    title="Llamar"
                                >
                                    <PhoneCall size={16} />
                                </button>
                                <button
                                    onClick={() => window.open(`https://wa.me/51${vendorPhone.replace(/\D/g, '')}`, '_blank')}
                                    className="cursor-pointer p-1 rounded-lg text-green-600 hover:bg-green-50 active:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors"
                                    title="Enviar WhatsApp"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="size-4"
                                        fill="currentColor"
                                    >
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                }
            />
            <InfoCard icon={<Building2 className="text-blue-500" size={18} />} label="Canal" value={channel} />
            <InfoCard icon={<Users2 className="text-blue-500" size={18} />} label="Circuito" value={group} />
            <InfoCard icon={<Calendar className="text-blue-500" size={18} />} label="Fecha de Actualización" value={updateDate} />
            <InfoCard icon={<Award className="text-blue-500" size={18} />} label="Nivel PDV" value={pdvLevel}
                className="md:col-span-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20" />
        </div>
    );
};

interface InfoCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | React.ReactNode;
    className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value, className = "" }) => {
    return (
        <div className={`bg-white dark:bg-gray-800/50 backdrop-blur rounded-lg border border-gray-100 dark:border-gray-700/50 p-3 flex flex-col gap-1 ${className}`}>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                {icon}
                <span>{label}</span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-0">
                {value}
            </div>
        </div>
    );
};

export default PDVInfo;
