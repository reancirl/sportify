import { useForm } from '@inertiajs/react';
import { useState   } from 'react';
import type {ChangeEvent, FormEvent} from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    paymentId: string;
};

type UploadForm = {
    proof: File | null;
    reference_number: string;
};

export function PaymentProofUpload({ paymentId }: Props) {
    const [fileName, setFileName] = useState<string | null>(null);
    const form = useForm<UploadForm>({
        proof: null,
        reference_number: '',
    });

    const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        form.setData('proof', file);
        setFileName(file?.name ?? null);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/payments/${paymentId}/upload-proof`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setFileName(null);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <div className="grid gap-2">
                <Label htmlFor={`payment-proof-${paymentId}`}>Payment proof image</Label>
                <Input
                    id={`payment-proof-${paymentId}`}
                    name="proof"
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                />
                {fileName && (
                    <p className="text-xs text-muted-foreground">{fileName}</p>
                )}
                <InputError message={form.errors.proof} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`payment-reference-${paymentId}`}>Reference number</Label>
                <Input
                    id={`payment-reference-${paymentId}`}
                    name="reference_number"
                    value={form.data.reference_number}
                    onChange={(event) =>
                        form.setData('reference_number', event.target.value)
                    }
                    placeholder="GCash / Maya / bank reference"
                />
                <InputError message={form.errors.reference_number} />
            </div>

            <Button type="submit" disabled={form.processing || !form.data.proof}>
                {form.processing && <Spinner />}
                Upload proof
            </Button>
        </form>
    );
}
