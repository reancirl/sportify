import { Form, Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

const FIELD_INPUT_CLASS =
    'rounded-none border-0 border-b border-[#3e2817]/25 bg-transparent px-0 pb-2 font-serif text-base text-[#3e2817] shadow-none placeholder:text-[#5c3a21]/45 focus-visible:border-[#f37021] focus-visible:ring-0';

const PASSWORD_INPUT_CLASS = `${FIELD_INPUT_CLASS} pr-10`;

export default function Register() {
    return (
        <>
            <Head title="Create an account" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-7"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-6">
                            <Field
                                label="Full name"
                                htmlFor="name"
                                error={errors.name}
                            >
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Maria Santos"
                                    className={FIELD_INPUT_CLASS}
                                />
                            </Field>

                            <Field
                                label="Email address"
                                htmlFor="email"
                                error={errors.email}
                            >
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    className={FIELD_INPUT_CLASS}
                                />
                            </Field>

                            <Field
                                label="Password"
                                htmlFor="password"
                                error={errors.password}
                            >
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="At least 8 characters"
                                    className={PASSWORD_INPUT_CLASS}
                                />
                            </Field>

                            <Field
                                label="Confirm password"
                                htmlFor="password_confirmation"
                                error={errors.password_confirmation}
                            >
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Repeat password"
                                    className={PASSWORD_INPUT_CLASS}
                                />
                            </Field>
                        </div>

                        <button
                            type="submit"
                            tabIndex={5}
                            disabled={processing}
                            data-test="register-user-button"
                            className="group inline-flex h-auto w-full items-center justify-center gap-2 bg-[#3e2817] px-7 py-4 text-xs font-medium uppercase tracking-[0.24em] text-[#faf5ec] transition hover:bg-[#2a1a0e] disabled:opacity-60"
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <>
                                    Become a member
                                    <ArrowRight
                                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                                        aria-hidden
                                    />
                                </>
                            )}
                        </button>

                        <p className="text-center font-serif text-sm text-[#5c3a21]">
                            Already a member?{' '}
                            <Link
                                href={login().url}
                                tabIndex={6}
                                className="font-medium text-[#3e2817] underline-offset-4 transition hover:text-[#f37021] hover:underline"
                            >
                                Log in
                            </Link>
                        </p>

                        <p className="border-t border-[#3e2817]/12 pt-5 text-center text-[10px] uppercase tracking-[0.22em] text-[#5c3a21]/70">
                            By joining, you agree to our terms &amp; the spirit
                            of fair play
                        </p>
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
};

function Field({ label, htmlFor, error, children }: FieldProps) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={htmlFor}
                className="block text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21]"
            >
                {label}
            </label>
            {children}
            <InputError message={error} className="text-xs text-red-700" />
        </div>
    );
}

Register.layout = {
    title: 'Become a member',
    description: 'Join sportify.ph to reserve courts, join open play, and meet players in your city',
};
