import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md p-1">
                <AppLogoIcon className="size-full object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold bg-gradient-to-r from-[#0062CC] to-[#00B8D9] bg-clip-text text-transparent">Portal Comercial AD</span>
            </div>
        </>
    );
}
