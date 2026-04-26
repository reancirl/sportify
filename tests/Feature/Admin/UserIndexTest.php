<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_user_index_returns_roles_as_string_array(): void
    {
        $this->seed(RoleSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('super_admin');

        $player = User::factory()->create();
        $player->assignRole('player');

        $response = $this->actingAs($admin)->get('/admin/users');

        $response->assertOk();

        $props = $response->viewData('page')['props'];
        $rows = $props['users']['data'];

        $this->assertCount(2, $rows);

        foreach ($rows as $row) {
            $this->assertIsArray($row['roles'], 'roles must be a string[]');

            foreach ($row['roles'] as $role) {
                $this->assertIsString(
                    $role,
                    'each role must be a plain string, not a Role object'
                );
            }
        }
    }
}
