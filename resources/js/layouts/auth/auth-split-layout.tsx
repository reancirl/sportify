import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import type { AuthLayoutProps } from '@/types';

/**
 * Sportify auth pages all use the same editorial split panel — this is just
 * an alias of `AuthSimpleLayout` for any caller still importing the split
 * variant by name.
 */
export default function AuthSplitLayout(props: AuthLayoutProps) {
    return <AuthSimpleLayout {...props} />;
}
