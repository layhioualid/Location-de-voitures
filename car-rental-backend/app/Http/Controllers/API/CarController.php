<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;

class CarController extends Controller
{
    public function index(Request $request)
{
    // Validation légère des filtres
    $request->validate([
        'brand'      => 'nullable|string',
        'max_price'  => 'nullable|numeric|min:0',
        'start_date' => 'nullable|date|date_format:Y-m-d',
        'end_date'   => 'nullable|date|date_format:Y-m-d|after_or_equal:start_date',
    ]);

    $q = Car::query();

    // 1) Marque / Modèle
    if ($request->filled('brand')) {
        $kw = trim($request->brand);
        $q->where(function ($qq) use ($kw) {
            $qq->where('brand', 'like', "%{$kw}%")
               ->orWhere('model', 'like', "%{$kw}%");
        });
    }

    // 2) Prix max
    if ($request->filled('max_price')) {
        $q->where('price_per_day', '<=', (float) $request->max_price);
    }

    // 3) Disponibilité (exclure les voitures avec chevauchement)
    if ($request->filled('start_date') && $request->filled('end_date')) {
        $start = $request->start_date;
        $end   = $request->end_date;

        // On exclut toute voiture ayant AU MOINS une réservation qui chevauche [start,end]
        // Condition de chevauchement (bornes incluses) :
        //   res.start_date <= end  ET  res.end_date >= start
        $q->whereNotExists(function ($sub) use ($start, $end) {
            $sub->from('reservations')
                ->whereColumn('reservations.car_id', 'cars.id')
                ->where('reservations.start_date', '<=', $end)
                ->where('reservations.end_date', '>=', $start);
        });
    }

    // Tu peux garder la pagination comme avant
    return $q->orderBy('brand')->paginate(100);
}


    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand' => 'required|string',
            'model' => 'required|string',
            'year' => 'required|integer',
            'price_per_day' => 'required|numeric',
            'available' => 'boolean',
            'image_url' => 'nullable|string',
            'fuel_type' => 'nullable|string|in:essence,diesel,électrique',
            'transmission' => 'nullable|string|in:automatique,manuelle',
            'color' => 'nullable|string',
            'seats' => 'nullable|integer|min:1|max:9',
            'trunk_size' => 'nullable|string', // tu peux aussi faire numeric si besoin
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('cars', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        $car = Car::create($validated);

        return response()->json($car, 201);
    }

    public function show($id)
{
    $car = Car::find($id);

    if (!$car) {
        return response()->json(['message' => 'Voiture non trouvée'], 404);
    }

    return response()->json(['data' => $car]);
}


    public function update(Request $request, Car $car)
    {
        $validated = $request->validate([
            'brand' => 'sometimes|required|string',
            'model' => 'sometimes|required|string',
            'year' => 'sometimes|required|integer',
            'price_per_day' => 'sometimes|required|numeric',
            'available' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'fuel_type' => 'nullable|string|in:essence,diesel,électrique',
            'transmission' => 'nullable|string|in:automatique,manuelle',
            'color' => 'nullable|string',
            'seats' => 'nullable|integer|min:1|max:9',
            'trunk_size' => 'nullable|string',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('cars', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        $car->update($validated);

        return response()->json($car);
    }

    public function destroy(Car $car)
    {
        $car->delete();
        return response()->noContent();
    }

        
}
