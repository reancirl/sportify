<?php

namespace Tests\Feature\Venue;

use App\Enums\VenueStatus;
use App\Exceptions\Domain\VenueAlreadyApprovedException;
use App\Models\User;
use App\Models\Venue;
use App\Services\Venue\VenueApprovalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VenueApprovalTest extends TestCase
{
    use RefreshDatabase;

    private VenueApprovalService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(VenueApprovalService::class);
    }

    public function test_approves_a_pending_venue(): void
    {
        $venue = Venue::factory()->pending()->create();
        $approver = User::factory()->create();

        $approved = $this->service->approve($venue, $approver);

        $this->assertSame(VenueStatus::Approved, $approved->status);
        $this->assertSame((int) $approver->id, (int) $approved->approved_by);
        $this->assertNotNull($approved->approved_at);
        $this->assertNull($approved->rejection_reason);
    }

    public function test_rejects_a_pending_venue_with_reason(): void
    {
        $venue = Venue::factory()->pending()->create();
        $approver = User::factory()->create();

        $rejected = $this->service->reject($venue, $approver, 'Incomplete documentation.');

        $this->assertSame(VenueStatus::Rejected, $rejected->status);
        $this->assertSame('Incomplete documentation.', $rejected->rejection_reason);
        $this->assertSame((int) $approver->id, (int) $rejected->approved_by);
    }

    public function test_throws_when_approving_an_already_approved_venue(): void
    {
        $venue = Venue::factory()->approved()->create();
        $approver = User::factory()->create();

        $this->expectException(VenueAlreadyApprovedException::class);

        $this->service->approve($venue, $approver);
    }

    public function test_throws_when_rejecting_an_already_approved_venue(): void
    {
        $venue = Venue::factory()->approved()->create();
        $approver = User::factory()->create();

        $this->expectException(VenueAlreadyApprovedException::class);

        $this->service->reject($venue, $approver, 'No longer compliant.');
    }

    public function test_suspends_an_approved_venue_with_reason(): void
    {
        $venue = Venue::factory()->approved()->create();
        $admin = User::factory()->create();

        $suspended = $this->service->suspend($venue, $admin, 'Failed surface inspection.');

        $this->assertSame(VenueStatus::Suspended, $suspended->status);
        $this->assertSame('Failed surface inspection.', $suspended->rejection_reason);
        $this->assertSame((int) $admin->id, (int) $suspended->approved_by);
    }

    public function test_throws_when_suspending_a_non_approved_venue(): void
    {
        $venue = Venue::factory()->pending()->create();
        $admin = User::factory()->create();

        $this->expectException(\DomainException::class);

        $this->service->suspend($venue, $admin, 'Why');
    }

    public function test_reinstates_a_suspended_venue(): void
    {
        $venue = Venue::factory()->approved()->create();
        $admin = User::factory()->create();

        $this->service->suspend($venue, $admin, 'Temporary closure.');
        $reinstated = $this->service->reinstate($venue->refresh(), $admin);

        $this->assertSame(VenueStatus::Approved, $reinstated->status);
        $this->assertNull($reinstated->rejection_reason);
        $this->assertNotNull($reinstated->approved_at);
    }

    public function test_throws_when_reinstating_a_non_suspended_venue(): void
    {
        $venue = Venue::factory()->approved()->create();
        $admin = User::factory()->create();

        $this->expectException(\DomainException::class);

        $this->service->reinstate($venue, $admin);
    }
}
