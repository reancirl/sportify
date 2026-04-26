import type { PropsWithChildren } from 'react';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';

/**
 * Sportify auth pages all use the same editorial split panel — this card
 * variant is kept as an alias for any caller still importing it by name.
 */
export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <AuthSimpleLayout title={title} description={description}>
            {children}
        </AuthSimpleLayout>
    );
}
