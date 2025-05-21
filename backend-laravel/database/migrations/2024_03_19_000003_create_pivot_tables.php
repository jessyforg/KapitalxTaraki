<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Startup Founders
        Schema::create('startup_founders', function (Blueprint $table) {
            $table->foreignId('startup_id')->constrained('startups', 'startup_id')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->string('role');
            $table->decimal('equity_percentage', 5, 2)->nullable();
            $table->date('joined_date');
            $table->primary(['startup_id', 'user_id']);
        });

        // Event Registrations
        Schema::create('event_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events', 'event_id')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->timestamp('registration_date');
            $table->enum('status', ['registered', 'attended', 'cancelled'])->default('registered');
            $table->unique(['event_id', 'user_id']);
        });

        // Startup Investors
        Schema::create('startup_investors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('startup_id')->constrained('startups', 'startup_id')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->decimal('investment_amount', 15, 2);
            $table->date('investment_date');
            $table->decimal('equity_percentage', 5, 2)->nullable();
            $table->string('investment_round');
        });

        // Messages
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->text('message_text');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        // Verification Documents
        Schema::create('verification_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users', 'user_id')->onDelete('cascade');
            $table->foreignId('startup_id')->nullable()->constrained('startups', 'startup_id')->onDelete('cascade');
            $table->enum('document_type', ['id', 'business_registration', 'tax_certificate', 'financial_statement']);
            $table->string('document_url');
            $table->foreignId('verified_by')->nullable()->constrained('admins', 'admin_id');
            $table->enum('verification_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('verification_date')->nullable();
            $table->timestamps();
        });

        // Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->enum('notification_type', ['event', 'message', 'verification', 'system', 'startup_update']);
            $table->string('title');
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        // Startup Updates
        Schema::create('startup_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('startup_id')->constrained('startups', 'startup_id')->onDelete('cascade');
            $table->enum('update_type', ['funding', 'milestone', 'job_creation', 'revenue', 'other']);
            $table->text('description');
            $table->decimal('amount', 15, 2)->nullable();
            $table->timestamps();
        });

        // Startup Jobs
        Schema::create('startup_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('startup_id')->constrained('startups', 'startup_id')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->string('location')->nullable();
            $table->enum('job_type', ['full_time', 'part_time', 'internship', 'contract']);
            $table->string('salary_range')->nullable();
            $table->enum('status', ['open', 'closed', 'draft'])->default('open');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('startup_jobs');
        Schema::dropIfExists('startup_updates');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('verification_documents');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('startup_investors');
        Schema::dropIfExists('event_registrations');
        Schema::dropIfExists('startup_founders');
    }
}; 