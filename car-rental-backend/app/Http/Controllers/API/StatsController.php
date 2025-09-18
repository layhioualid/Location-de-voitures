<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Car;
use App\Models\Reservation;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    /**
     * 🔹 Statistiques globales pour le dashboard
     */
    public function globalStats()
    {
        $users = User::count();
        $cars = Car::count();
        $reservations = Reservation::count();
        $revenue = Reservation::where('payment_status', 'paid')->sum('total_amount');

        return response()->json([
            'users' => $users,
            'cars' => $cars,
            'reservations' => $reservations,
            'revenue' => $revenue,
        ]);
    }

    /**
     * 🔹 Données pour graphiques mensuels (réservations et revenus)
     */
    public function monthlyData()
    {
        $year = date('Y');
        $months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];

        // Compte des réservations par mois
        $reservations = Reservation::selectRaw('MONTH(created_at) as month, COUNT(*) as total')
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->get();

        // Somme des revenus payés par mois
        $revenues = Reservation::selectRaw('MONTH(created_at) as month, SUM(total_amount) as total')
            ->whereYear('created_at', $year)
            ->where('payment_status', 'paid')
            ->groupBy('month')
            ->get();

        $data = [];
        for ($i = 1; $i <= 12; $i++) {
            $resMonth = $reservations->firstWhere('month', $i);
            $revMonth = $revenues->firstWhere('month', $i);

            $data[] = [
                'month' => $months[$i-1],
                'reservations' => $resMonth ? $resMonth->total : 0,
                'revenue' => $revMonth ? (float) $revMonth->total : 0,
            ];
        }

        return response()->json($data);
    }
}
