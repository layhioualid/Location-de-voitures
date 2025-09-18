<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReservationController extends Controller
{
    /**
     * Liste des réservations.
     * - User normal : seulement les siennes
     * - Admin : toutes, avec filtre optionnel ?user_id=...
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $q = Reservation::with(['car', 'user'])->orderByDesc('created_at');

        if (($user->role ?? 'user') !== 'admin') {
            // 🔒 Un utilisateur normal ne voit QUE ses réservations
            $q->where('user_id', $user->id);
        } else {
            // Admin : peut filtrer par user_id si fourni
            if ($request->filled('user_id')) {
                $q->where('user_id', (int) $request->input('user_id'));
            }
        }

        // Si tu préfères paginer, utilise ->paginate(20)
        return response()->json(['data' => $q->get()]);
    }

    /**
     * Création d’une réservation.
     * ⚠️ N'utilise PAS user_id du front : on force user_id = auth()->id()
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Validation (sans user_id)
        $validated = $request->validate([
            'car_id'            => 'required|exists:cars,id',
            'start_date'        => 'required|date|after_or_equal:today',
            'end_date'          => 'required|date|after_or_equal:start_date',
            'pickup_location'   => 'required|string|max:255',
            'dropoff_location'  => 'required|string|max:255',
            'first_name'        => 'required|string|max:100',
            'last_name'         => 'required|string|max:100',
            'phone'             => 'required|string|max:20',
            'address'           => 'required|string|max:255',
            'license_file'      => 'required|file|mimes:jpeg,png,jpg,pdf|max:2048',
        ]);

        // Conflits de dates
        $conflict = Reservation::where('car_id', $validated['car_id'])
            ->where(function ($query) use ($validated) {
                $s = $validated['start_date'];
                $e = $validated['end_date'];
                $query->whereBetween('start_date', [$s, $e])
                      ->orWhereBetween('end_date', [$s, $e])
                      ->orWhere(function ($q) use ($s, $e) {
                          $q->where('start_date', '<=', $s)
                            ->where('end_date', '>=', $e);
                      });
            })
            ->exists();

        if ($conflict) {
            return response()->json(['message' => 'Cette voiture est déjà réservée sur cette période.'], 409);
        }

        // Upload permis
        $licensePath = $request->file('license_file')->store('licenses', 'public');

        // Création — on FORCE le propriétaire
        $reservation = Reservation::create([
            'user_id'           => $user->id,               // 🔒 pas depuis le front
            'car_id'            => $validated['car_id'],
            'start_date'        => $validated['start_date'],
            'end_date'          => $validated['end_date'],
            'pickup_location'   => $validated['pickup_location'],
            'dropoff_location'  => $validated['dropoff_location'],
            'first_name'        => $validated['first_name'],
            'last_name'         => $validated['last_name'],
            'phone'             => $validated['phone'],
            'address'           => $validated['address'],
            'license_file_path' => $licensePath,
            'status'            => 'pending',
        ]);

        return response()->json([
            'message'     => 'Réservation créée avec succès.',
            'reservation' => $reservation->load(['car', 'user']),
        ], 201);
    }

    /**
     * Afficher une réservation.
     * 🔒 Autorisation : propriétaire ou admin
     */
    public function show(Request $request, $id)
    {
        $reservation = Reservation::with(['car', 'user'])->findOrFail($id);
        $user = $request->user();

        if ($user->id !== $reservation->user_id && ($user->role ?? 'user') !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(['data' => $reservation]);
    }

    /**
     * Mettre à jour une réservation.
     * 🔒 Autorisation : propriétaire ou admin
     */
    public function update(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);
        $user = $request->user();

        if ($user->id !== $reservation->user_id && ($user->role ?? 'user') !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'start_date'        => 'sometimes|date',
            'end_date'          => 'sometimes|date|after_or_equal:start_date',
            'pickup_location'   => 'sometimes|string|max:255',
            'dropoff_location'  => 'sometimes|string|max:255',
            'status'            => 'sometimes|string|in:pending,paid,cancelled',
        ]);

        $reservation->update($data);

        return response()->json([
            'message' => 'Réservation mise à jour avec succès.',
            'data'    => $reservation->load(['car','user']),
        ]);
    }

    /**
     * Supprimer une réservation.
     * 🔒 Autorisation : propriétaire ou admin
     */
    public function destroy(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);
        $user = $request->user();

        if ($user->id !== $reservation->user_id && ($user->role ?? 'user') !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // (Optionnel) supprimer aussi le fichier permis
        if ($reservation->license_file_path && Storage::disk('public')->exists($reservation->license_file_path)) {
            Storage::disk('public')->delete($reservation->license_file_path);
        }

        $reservation->delete();

        return response()->json(['message' => 'Réservation supprimée.']);
    }
}
