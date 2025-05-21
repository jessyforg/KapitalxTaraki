<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id('event_id');
            $table->string('activity_name', 100);
            $table->text('description')->nullable();
            $table->enum('event_type', ['workshop', 'pitch', 'networking', 'conference', 'hackathon']);
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->string('location', 100)->nullable();
            $table->string('virtual_link', 255)->nullable();
            $table->integer('max_participants')->nullable();
            $table->dateTime('registration_deadline')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('admins', 'admin_id');
            $table->enum('status', ['upcoming', 'ongoing', 'completed', 'cancelled'])->default('upcoming');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
}; 