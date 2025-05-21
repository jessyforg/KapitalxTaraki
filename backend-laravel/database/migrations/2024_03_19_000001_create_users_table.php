<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id('user_id');
            $table->string('username', 50)->unique();
            $table->string('email', 100)->unique();
            $table->string('password_hash');
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('profile_picture', 255)->nullable();
            $table->text('bio')->nullable();
            $table->string('location', 100)->nullable();
            $table->string('contact_number', 20)->nullable();
            $table->enum('user_type', ['member', 'startup_owner', 'investor', 'mentor']);
            $table->timestamp('email_verified_at')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}; 