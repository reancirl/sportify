<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('venues', function (Blueprint $table) {
            $table->string('barangay')->nullable()->after('address_line');
            $table->string('postal_code', 10)->nullable()->after('region');
            $table->string('google_maps_url')->nullable()->after('postal_code');
            $table->string('facebook_url')->nullable()->after('contact_email');
            $table->string('instagram_url')->nullable()->after('facebook_url');
            $table->string('twitter_url')->nullable()->after('instagram_url');
            $table->string('tiktok_url')->nullable()->after('twitter_url');
            $table->string('website_url')->nullable()->after('tiktok_url');
            $table->json('amenities')->nullable()->after('website_url');
            $table->unsignedTinyInteger('advance_booking_weeks')->default(4)->after('amenities');
        });

        Schema::table('courts', function (Blueprint $table) {
            $table->string('surface_type', 24)->nullable()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('venues', function (Blueprint $table) {
            $table->dropColumn([
                'barangay',
                'postal_code',
                'google_maps_url',
                'facebook_url',
                'instagram_url',
                'twitter_url',
                'tiktok_url',
                'website_url',
                'amenities',
                'advance_booking_weeks',
            ]);
        });

        Schema::table('courts', function (Blueprint $table) {
            $table->dropColumn('surface_type');
        });
    }
};
