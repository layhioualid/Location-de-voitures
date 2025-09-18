<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    // ===== Helpers =====
    /** Retourne le dernier paiement de la réservation (ou null) */
    private function latestPayment(Reservation $reservation): ?Payment
    {
        return Payment::where('reservation_id', $reservation->id)
            ->latest('id')
            ->first();
    }

    /** Précharge les relations utiles (car, user) */
    private function withRelations(Reservation $reservation): Reservation
    {
        return $reservation->loadMissing(['car', 'user']);
    }

    // ===== Facture (carte/Stripe) =====
    public function downloadInvoice(Reservation $reservation)
    {
        $reservation = $this->withRelations($reservation);
        $payment = $this->latestPayment($reservation);

        if (!$payment) {
            abort(404, 'Aucun paiement trouvé pour cette réservation.');
        }

        // Carte = stripe ou card ET statut succeeded
        $method = strtolower($payment->payment_method);
        $status = strtolower($payment->status);
        $isCard = in_array($method, ['stripe', 'card']);
        $isPaid = $status === 'succeeded';

        if (!($isCard && $isPaid)) {
            abort(403, "Facture non disponible : paiement={$method}, statut={$status}.");
        }

        // Générer PDF facture
        $pdf = Pdf::loadView('pdf.invoice', [
            'reservation' => $reservation,
            'payment'     => $payment,
        ]);

        return $pdf->download("facture-{$reservation->id}.pdf");
    }

    // ===== Bon de réservation (cash/pending) =====
    public function downloadProforma(Reservation $reservation)
    {
        $reservation = $this->withRelations($reservation);
        $payment = $this->latestPayment($reservation);

        if (!$payment) {
            abort(404, 'Aucun paiement trouvé pour cette réservation.');
        }

        // Cash + pending
        $method = strtolower($payment->payment_method);
        $status = strtolower($payment->status);
        $isCash = $method === 'cash';
        $isPending = $status === 'pending';

        if (!($isCash && $isPending)) {
            abort(403, "Bon de réservation non disponible : paiement={$method}, statut={$status}.");
        }

        // Générer PDF pro forma
        $pdf = Pdf::loadView('pdf.proforma', [
            'reservation' => $reservation,
            'payment'     => $payment,
        ]);

        return $pdf->download("bon-reservation-{$reservation->id}.pdf");
    }
}
