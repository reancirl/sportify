<?php

use App\Enums\PaymentProvider;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create the new normalized table.
        Schema::create('venue_payment_methods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('venue_id')->constrained('venues')->cascadeOnDelete()->index();
            $table->string('provider');                        // PaymentProvider enum value
            $table->string('account_name', 120);
            $table->string('mobile_number', 20);
            $table->string('qr_code_path')->nullable();       // future QR upload — schema ready
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            // A venue may have at most one record per provider.
            $table->unique(['venue_id', 'provider']);
        });

        // 2. Migrate existing GCash data from venues into the new table.
        //    Skip rows missing either field — both are NOT NULL on the new table.
        DB::table('venues')
            ->whereNotNull('gcash_account_name')
            ->whereNotNull('gcash_mobile_number')
            ->select('id', 'gcash_account_name', 'gcash_mobile_number')
            ->orderBy('id')
            ->each(function (object $venue) {
                DB::table('venue_payment_methods')->insert([
                    'id' => (string) Str::uuid(),
                    'venue_id' => $venue->id,
                    'provider' => PaymentProvider::Gcash->value,
                    'account_name' => $venue->gcash_account_name,
                    'mobile_number' => $venue->gcash_mobile_number,
                    'qr_code_path' => null,
                    'is_active' => true,
                    'sort_order' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });

        // 3. Drop the now-redundant columns from venues.
        Schema::table('venues', function (Blueprint $table) {
            $table->dropColumn(['gcash_account_name', 'gcash_mobile_number']);
        });
    }

    public function down(): void
    {
        // 1. Re-add the gcash columns to venues.
        Schema::table('venues', function (Blueprint $table) {
            $table->string('gcash_account_name')->nullable()->after('contact_email');
            $table->string('gcash_mobile_number', 20)->nullable()->after('gcash_account_name');
        });

        // 2. Copy the first gcash row per venue back into venues.
        DB::table('venue_payment_methods')
            ->where('provider', PaymentProvider::Gcash->value)
            ->orderBy('sort_order')
            ->orderBy('created_at')
            ->get()
            ->unique('venue_id')
            ->each(function (object $row) {
                DB::table('venues')
                    ->where('id', $row->venue_id)
                    ->update([
                        'gcash_account_name' => $row->account_name,
                        'gcash_mobile_number' => $row->mobile_number,
                    ]);
            });

        // 3. Drop the new table.
        Schema::dropIfExists('venue_payment_methods');
    }
};
