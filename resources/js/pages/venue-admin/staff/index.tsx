import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { VenueSubNav } from '@/components/venue/venue-sub-nav';
import type { Models } from '@/types';

type Props = {
    venue: Models.Venue;
    staff: Models.VenueStaffMember[];
};

type StaffForm = {
    email: string;
    role: Models.VenueStaffRole;
};

const ROLES: Models.VenueStaffRole[] = ['owner', 'manager', 'staff'];

export default function VenueAdminStaffIndex({ venue, staff }: Props) {
    const form = useForm<StaffForm>({
        email: '',
        role: 'staff',
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/venue-admin/venues/${venue.id}/staff`, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <>
            <Head title={`${venue.name} — staff`} />

            <div className="flex flex-1 flex-col gap-8 p-6">
                <VenueSubNav venue={venue} />

                <p className="font-serif text-sm text-[#5c3a21]">
                    Manage who can administer this venue.
                </p>

                <Card>
                    <CardHeader>
                        <CardTitle>Current staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {staff.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No staff members assigned.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staff.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                {member.user?.name ?? `User #${member.user_id}`}
                                            </TableCell>
                                            <TableCell>{member.user?.email ?? '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{member.role}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Add staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="staff-email">User email</Label>
                                <Input
                                    id="staff-email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) => form.setData('email', event.target.value)}
                                    required
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="staff-role">Role</Label>
                                <Select
                                    value={form.data.role}
                                    onValueChange={(value) =>
                                        form.setData('role', value as Models.VenueStaffRole)
                                    }
                                >
                                    <SelectTrigger id="staff-role">
                                        <SelectValue placeholder="Pick a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLES.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.role} />
                            </div>

                            <Button type="submit" disabled={form.processing}>
                                {form.processing && <Spinner />}
                                Add staff member
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
