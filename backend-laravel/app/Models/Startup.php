<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Startup extends Model
{
    use HasFactory;

    protected $fillable = [
        'startup_name',
        'description',
        'logo',
        'website_url',
        'location',
        'registration_number',
        'industry',
        'stage',
        'jobs_created',
        'total_donations',
        'total_investment',
        'total_revenue',
        'is_verified',
        'status'
    ];

    protected $casts = [
        'jobs_created' => 'integer',
        'total_donations' => 'decimal:2',
        'total_investment' => 'decimal:2',
        'total_revenue' => 'decimal:2',
        'is_verified' => 'boolean'
    ];

    public function founders()
    {
        return $this->belongsToMany(User::class, 'startup_founders')
            ->withPivot('role', 'equity_percentage', 'joined_date');
    }

    public function investors()
    {
        return $this->belongsToMany(User::class, 'startup_investors')
            ->withPivot('investment_amount', 'investment_date', 'equity_percentage', 'investment_round');
    }

    public function jobs()
    {
        return $this->hasMany(StartupJob::class);
    }

    public function updates()
    {
        return $this->hasMany(StartupUpdate::class);
    }

    public function documents()
    {
        return $this->hasMany(VerificationDocument::class);
    }
} 