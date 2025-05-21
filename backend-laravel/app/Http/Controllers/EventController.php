<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::with('creator')
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_date', 'asc')
            ->get();
        return response()->json($events);
    }

    public function show($id)
    {
        $event = Event::with(['creator', 'participants'])->findOrFail($id);
        return response()->json($event);
    }

    public function store(Request $request)
    {
        $request->validate([
            'activity_name' => 'required|string',
            'description' => 'required|string',
            'event_type' => 'required|in:workshop,pitch,networking,conference,hackathon',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'location' => 'nullable|string',
            'virtual_link' => 'nullable|url',
            'max_participants' => 'nullable|integer|min:1',
            'registration_deadline' => 'required|date|before:start_date'
        ]);

        $event = Event::create([
            ...$request->all(),
            'created_by' => $request->user()->id
        ]);

        return response()->json([
            'message' => 'Event created successfully',
            'event' => $event
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $request->validate([
            'activity_name' => 'string',
            'description' => 'string',
            'event_type' => 'in:workshop,pitch,networking,conference,hackathon',
            'start_date' => 'date',
            'end_date' => 'date|after:start_date',
            'location' => 'nullable|string',
            'virtual_link' => 'nullable|url',
            'max_participants' => 'nullable|integer|min:1',
            'registration_deadline' => 'date|before:start_date',
            'status' => 'in:upcoming,ongoing,completed,cancelled'
        ]);

        $event->update($request->all());

        return response()->json([
            'message' => 'Event updated successfully',
            'event' => $event
        ]);
    }

    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $event->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Event cancelled successfully'
        ]);
    }

    public function register(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        // Check if registration is still open
        if (now()->isAfter($event->registration_deadline)) {
            return response()->json([
                'message' => 'Registration deadline has passed'
            ], 400);
        }

        // Check if event is full
        if ($event->max_participants && $event->participants()->count() >= $event->max_participants) {
            return response()->json([
                'message' => 'Event is full'
            ], 400);
        }

        // Check if user is already registered
        if ($event->participants()->where('user_id', $request->user()->id)->exists()) {
            return response()->json([
                'message' => 'You are already registered for this event'
            ], 400);
        }

        $event->participants()->attach($request->user()->id, [
            'registration_date' => now(),
            'status' => 'registered'
        ]);

        return response()->json([
            'message' => 'Successfully registered for the event'
        ]);
    }

    public function unregister(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        
        $event->participants()->updateExistingPivot($request->user()->id, [
            'status' => 'cancelled'
        ]);

        return response()->json([
            'message' => 'Successfully unregistered from the event'
        ]);
    }
} 