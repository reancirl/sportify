<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('avatar_path')->nullable()->after('phone');
            $table->string('skill_level')->nullable()->after('avatar_path');
            $table->integer('elo_rating')->default(1000)->nullable()->after('skill_level');
            $table->boolean('is_active')->default(true)->after('elo_rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'avatar_path',
                'skill_level',
                'elo_rating',
                'is_active',
            ]);
        });
    }
};
