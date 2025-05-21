<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_name',
        'description',
        'event_type',
        'start_date',
        'end_date',
        'location',
        'virtual_link',
        'max_participants',
        'registration_deadline',
        'created_by',
        'status'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'registration_deadline' => 'datetime',
        'max_participants' => 'integer'
    ];

    public function participants()
    {
        return $this->belongsToMany(User::class, 'event_registrations')
            ->withPivot('registration_date', 'status');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
} 