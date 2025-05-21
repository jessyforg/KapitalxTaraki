<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('startups', function (Blueprint $table) {
            $table->id('startup_id');
            $table->string('startup_name');
            $table->text('description');
            $table->string('logo')->nullable();
            $table->string('website_url')->nullable();
            $table->string('location');
            $table->string('registration_number')->unique();
            $table->string('industry');
            $table->enum('stage', ['idea', 'mvp', 'early_traction', 'growth', 'scaling']);
            $table->integer('jobs_created')->default(0);
            $table->decimal('total_donations', 15, 2)->default(0.00);
            $table->decimal('total_investment', 15, 2)->default(0.00);
            $table->decimal('total_revenue', 15, 2)->default(0.00);
            $table->boolean('is_verified')->default(false);
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('startups');
    }
}; 