<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * future-proofing for ranking; not used in MVP
     */
    public function up(): void
    {
        // future-proofing for ranking; not used in MVP
        Schema::create('match_results', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('open_play_session_id')->nullable()->constrained('open_play_sessions')->nullOnDelete();
            $table->foreignUuid('court_id')->constrained('courts')->restrictOnDelete();
            $table->timestamp('played_at');
            $table->json('team_a_player_ids');
            $table->json('team_b_player_ids');
            $table->integer('team_a_score');
            $table->integer('team_b_score');
            $table->string('winner');
            $table->json('elo_changes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('match_results');
    }
};
