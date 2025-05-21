<?php

namespace App\Http\Controllers;

use App\Models\Startup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StartupController extends Controller
{
    public function index()
    {
        $startups = Startup::with('founders')->where('status', 'active')->get();
        return response()->json($startups);
    }

    public function show($id)
    {
        $startup = Startup::with(['founders', 'investors', 'jobs', 'updates'])
            ->findOrFail($id);
        return response()->json($startup);
    }

    public function store(Request $request)
    {
        $request->validate([
            'startup_name' => 'required|string',
            'description' => 'required|string',
            'location' => 'required|string',
            'registration_number' => 'required|string|unique:startups',
            'industry' => 'required|string',
            'stage' => 'required|in:idea,mvp,early_traction,growth,scaling',
            'logo' => 'nullable|image|max:2048'
        ]);

        $data = $request->all();

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('startup-logos', 'public');
            $data['logo'] = $path;
        }

        $startup = Startup::create($data);

        if ($request->has('founders')) {
            $startup->founders()->attach($request->founders, [
                'role' => 'founder',
                'joined_date' => now()
            ]);
        }

        return response()->json([
            'message' => 'Startup created successfully',
            'startup' => $startup
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $startup = Startup::findOrFail($id);

        $request->validate([
            'startup_name' => 'string',
            'description' => 'string',
            'location' => 'string',
            'industry' => 'string',
            'stage' => 'in:idea,mvp,early_traction,growth,scaling',
            'logo' => 'nullable|image|max:2048'
        ]);

        $data = $request->all();

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($startup->logo) {
                Storage::disk('public')->delete($startup->logo);
            }
            $path = $request->file('logo')->store('startup-logos', 'public');
            $data['logo'] = $path;
        }

        $startup->update($data);

        return response()->json([
            'message' => 'Startup updated successfully',
            'startup' => $startup
        ]);
    }

    public function destroy($id)
    {
        $startup = Startup::findOrFail($id);
        $startup->update(['status' => 'inactive']);

        return response()->json([
            'message' => 'Startup deleted successfully'
        ]);
    }

    public function addFounder(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string',
            'equity_percentage' => 'nullable|numeric|min:0|max:100'
        ]);

        $startup = Startup::findOrFail($id);
        $startup->founders()->attach($request->user_id, [
            'role' => $request->role,
            'equity_percentage' => $request->equity_percentage,
            'joined_date' => now()
        ]);

        return response()->json([
            'message' => 'Founder added successfully'
        ]);
    }

    public function addInvestment(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'investment_amount' => 'required|numeric|min:0',
            'equity_percentage' => 'nullable|numeric|min:0|max:100',
            'investment_round' => 'required|string'
        ]);

        $startup = Startup::findOrFail($id);
        $startup->investors()->attach($request->user_id, [
            'investment_amount' => $request->investment_amount,
            'equity_percentage' => $request->equity_percentage,
            'investment_round' => $request->investment_round,
            'investment_date' => now()
        ]);

        // Update total investment
        $startup->increment('total_investment', $request->investment_amount);

        return response()->json([
            'message' => 'Investment recorded successfully'
        ]);
    }
} 