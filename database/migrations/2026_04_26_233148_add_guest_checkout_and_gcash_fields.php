<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Venues — store the venue's GCash receiving account so the public
        // checkout page can show "Send ₱X to this account".
        Schema::table('venues', function (Blueprint $table) {
            $table->string('gcash_account_name')->nullable()->after('contact_email');
            $table->string('gcash_mobile_number', 20)->nullable()->after('gcash_account_name');
        });

        // Bookings — allow guest bookings (user_id can be null) and capture
        // the contact info we'll need to send confirmations / reach out.
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('guest_name')->nullable()->after('user_id');
            $table->string('guest_email')->nullable()->after('guest_name');
            $table->string('guest_phone', 32)->nullable()->after('guest_email');
            $table->foreignId('user_id')->nullable()->change();
        });

        // Payments — guest checkouts have no user, so user_id must be nullable.
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('venues', function (Blueprint $table) {
            $table->dropColumn(['gcash_account_name', 'gcash_mobile_number']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['guest_name', 'guest_email', 'guest_phone']);
        });
    }
};
