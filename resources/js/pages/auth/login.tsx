import { Form, Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            {status && (
                <div className="mb-6 border border-[#166534]/25 bg-[#dcfce7]/60 px-4 py-3 text-sm font-medium text-[#166534]">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-7"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-6">
                            <Field
                                label="Email address"
                                htmlFor="email"
                                error={errors.email}
                            >
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="rounded-none border-0 border-b border-[#3e2817]/25 bg-transparent px-0 pb-2 font-serif text-base text-[#3e2817] shadow-none placeholder:text-[#5c3a21]/45 focus-visible:border-[#f37021] focus-visible:ring-0"
                                />
                            </Field>

                            <Field
                                label="Password"
                                htmlFor="password"
                                error={errors.password}
                                trailing={
                                    canResetPassword && (
                                        <Link
                                            href={request().url}
                                            tabIndex={5}
                                            className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21] transition hover:text-[#f37021]"
                                        >
                                            Forgot?
                                        </Link>
                                    )
                                }
                            >
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="rounded-none border-0 border-b border-[#3e2817]/25 bg-transparent px-0 pb-2 pr-10 font-serif text-base text-[#3e2817] shadow-none placeholder:text-[#5c3a21]/45 focus-visible:border-[#f37021] focus-visible:ring-0"
                                />
                            </Field>

                            <label className="flex items-center gap-3 text-sm text-[#3e2817]">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="size-4 rounded-[2px] border-[#3e2817]/35 data-[state=checked]:border-[#3e2817] data-[state=checked]:bg-[#3e2817]"
                                />
                                <span className="font-serif">
                                    Keep me signed in
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            tabIndex={4}
                            disabled={processing}
                            data-test="login-button"
                            className="group inline-flex h-auto w-full items-center justify-center gap-2 bg-[#3e2817] px-7 py-4 text-xs font-medium uppercase tracking-[0.24em] text-[#faf5ec] transition hover:bg-[#2a1a0e] disabled:opacity-60"
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <>
                                    Log in
                                    <ArrowRight
                                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                                        aria-hidden
                                    />
                                </>
                            )}
                        </button>

                        {canRegister && (
                            <p className="text-center font-serif text-sm text-[#5c3a21]">
                                New to sportify
                                <span className="italic text-[#f37021]">
                                    .ph
                                </span>
                                ?{' '}
                                <Link
                                    href={register().url}
                                    tabIndex={5}
                                    className="font-medium text-[#3e2817] underline-offset-4 transition hover:text-[#f37021] hover:underline"
                                >
                                    Become a member
                                </Link>
                            </p>
                        )}
                    </>
                )}
            </Form>
        </>
    );
}

type FieldProps = {
    label: string;
    htmlFor: string;
    error?: string;
    children: React.ReactNode;
    trailing?: React.ReactNode;
};

function Field({ label, htmlFor, error, children, trailing }: FieldProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label
                    htmlFor={htmlFor}
                    className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21]"
                >
                    {label}
                </label>
                {trailing}
            </div>
            {children}
            <InputError message={error} className="text-xs text-red-700" />
        </div>
    );
}

Login.layout = {
    title: 'Welcome back',
    description: 'Sign in to reserve courts, track your bookings, and rejoin the rally',
};
