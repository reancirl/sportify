import type { Auth } from '@/types/auth';
import type { SportifyConfig } from '@/types/sportify';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            flash: { success: string | null; error: string | null };
            sidebarOpen: boolean;
            sportify: SportifyConfig;
            [key: string]: unknown;
        };
    }
}
