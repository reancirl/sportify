<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * queueing tables (future) will reference session_players. Keep stable.
     */
    public function up(): void
    {
        // queueing tables (future) will reference session_players. Keep stable.
        Schema::create('session_players', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('session_id')->constrained('open_play_sessions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->timestamp('joined_at');
            $table->string('status')->default('registered');
            $table->foreignUuid('payment_id')->nullable()->constrained('payments')->nullOnDelete();
            $table->timestamps();

            $table->unique(['session_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_players');
    }
};
