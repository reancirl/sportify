export default function AppLogo() {
    return (
        <>
            {/* Collapsed icon mode — show only the favicon */}
            <img
                src="/logo/sportify-favicon.svg"
                alt="sportify.ph"
                className="hidden size-7 shrink-0 select-none group-data-[collapsible=icon]:block"
                draggable={false}
            />
            {/* Expanded mode — show full horizontal wordmark */}
            <img
                src="/logo/sportify-logo-horizontal.svg"
                alt="sportify.ph"
                className="h-9 w-auto select-none group-data-[collapsible=icon]:hidden"
                draggable={false}
            />
        </>
    );
}
