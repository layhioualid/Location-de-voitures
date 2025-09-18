<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use App\Models\Payment;
use App\Models\Reservation;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\CardException;
use Stripe\Exception\InvalidRequestException;
use Stripe\Exception\ApiErrorException;

class PaymentController extends Controller
{
    /**
     * Store a payment (card or cash).
     * Route: POST /api/payments
     */
    public function store(Request $request)
    {
        $request->validate([
            'reservation_id'  => 'required|exists:reservations,id',
            'amount'          => 'required|integer|min:50',     // en centimes
            'currency'        => 'required|string|size:3',      // ex: MAD, EUR, USD
            'payment_method'  => 'required|in:card,cash',
            'token'           => 'required_if:payment_method,card|string', // tok_... si carte
        ]);

        try {
            // Verrou pour éviter les doubles MAJ en parallèle
            $reservation = Reservation::lockForUpdate()->findOrFail($request->reservation_id);

            // TODO prod : recalcul serveur
            $serverAmountCents = (int) $request->amount;
            $currency = strtolower($request->currency ?? 'mad');
            $amountMajor = $serverAmountCents / 100;

            // CAS 1 : CASH
            if ($request->payment_method === 'cash') {
                return DB::transaction(function () use ($reservation, $amountMajor, $currency) {
                    $payment = Payment::create([
                        'reservation_id' => $reservation->id,
                        'amount'         => $amountMajor,
                        'currency'       => strtoupper($currency),
                        'payment_method' => 'cash',
                        'status'         => 'pending',
                        'transaction_id' => null,
                    ]);

                    // ➜ On marque la réservation comme "en attente de règlement"
                    $this->syncReservationFromPayment($reservation, $payment, [
                        'force_status' => 'pending',      // pending car cash non encore encaissé
                        'paid_amount'  => 0.0,            // rien encaissé pour l’instant
                        'reference'    => null,
                    ]);

                    return response()->json(['success' => true, 'payment' => $payment], 200);
                });
            }

            // CAS 2 : CARTE (Stripe)
            Stripe::setApiKey(config('services.stripe.secret'));

            // 1) Créer le PI
            $pi = PaymentIntent::create([
                'amount'               => $serverAmountCents,
                'currency'             => $currency,
                'payment_method_types' => ['card'],
                'description'          => 'Paiement réservation #'.$reservation->id,
            ]);

            // 2) Attacher le token
            $pi = PaymentIntent::update($pi->id, [
                'payment_method_data' => [
                    'type' => 'card',
                    'card' => ['token' => $request->token],
                ],
            ]);

            // 3) Confirmer
            $pi = $pi->confirm();

            if ($pi->status === 'succeeded') {
                return DB::transaction(function () use ($reservation, $pi) {
                    $payment = Payment::create([
                        'reservation_id' => $reservation->id,
                        'amount'         => $pi->amount / 100,
                        'currency'       => strtoupper($pi->currency),
                        'payment_method' => 'card',
                        'status'         => 'succeeded',
                        'transaction_id' => $pi->id,
                    ]);

                    // ➜ MAJ réservation : payé
                    $this->syncReservationFromPayment($reservation, $payment);

                    return response()->json(['success' => true, 'payment' => $payment], 200);
                });
            }

            // 3DS requis
            if ($pi->status === 'requires_action') {
                return response()->json([
                    'success'         => false,
                    'requires_action' => true,
                    'client_secret'   => $pi->client_secret,
                    'payment_intent'  => $pi->id,
                ], 200);
            }

            return response()->json(['success' => false, 'message' => 'Paiement non finalisé: '.$pi->status], 400);

        } catch (CardException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getError()->message ?? 'Carte refusée.',
                'code'    => $e->getError()->code ?? null
            ], 402);
        } catch (InvalidRequestException $e) {
            return response()->json(['success' => false, 'message' => 'Requête Stripe invalide : '.$e->getMessage()], 400);
        } catch (ApiErrorException $e) {
            return response()->json(['success' => false, 'message' => 'Erreur Stripe : '.$e->getMessage()], 502);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Erreur serveur : '.$e->getMessage()], 500);
        }
    }

    /**
     * Confirmation finale après 3DS.
     * Route: POST /api/pay/confirm
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'payment_intent_id' => 'required|string', // pi_...
            'reservation_id'    => 'required|exists:reservations,id',
        ]);

        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            $reservation = Reservation::lockForUpdate()->findOrFail($request->reservation_id);

            $pi = PaymentIntent::retrieve($request->payment_intent_id);
            $pi = $pi->confirm(); // finalise

            if ($pi->status === 'succeeded') {
                return DB::transaction(function () use ($reservation, $pi) {
                    $payment = Payment::updateOrCreate(
                        ['transaction_id' => $pi->id],
                        [
                            'reservation_id' => $reservation->id,
                            'amount'         => $pi->amount / 100,
                            'currency'       => strtoupper($pi->currency),
                            'payment_method' => 'card',
                            'status'         => 'succeeded',
                        ]
                    );

                    // ➜ MAJ réservation : payé
                    $this->syncReservationFromPayment($reservation, $payment);

                    return response()->json(['success' => true, 'pi' => $pi->id], 200);
                });
            }

            return response()->json(['success' => false, 'message' => 'PI non finalisé: '.$pi->status], 400);

        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Confirmer un paiement cash (quand l'encaissement est fait au comptoir).
     * Route: POST /api/payments/cash/confirm
     */
    public function confirmCash(Request $request)
    {
        $request->validate([
            'payment_id' => 'required|exists:payments,id',
        ]);

        return DB::transaction(function () use ($request) {
            $payment = Payment::lockForUpdate()->findOrFail($request->payment_id);
            $reservation = Reservation::lockForUpdate()->findOrFail($payment->reservation_id);

            $payment->update([
                'status'         => 'succeeded',
                'payment_method' => 'cash',
                'transaction_id' => null,
            ]);

            // ➜ MAJ réservation : payé
            $this->syncReservationFromPayment($reservation, $payment);

            return response()->json(['success' => true], 200);
        });
    }

    /**
     * Synchronise la réservation depuis un Payment donné.
     */
    private function syncReservationFromPayment(Reservation $reservation, Payment $payment, array $opts = []): void
    {
        $forceStatus = $opts['force_status'] ?? null;    // 'pending' pour cash non encaissé
        $paidAmount  = $opts['paid_amount']  ?? $payment->amount;
        $reference   = $opts['reference']    ?? $payment->transaction_id;

        $reservation->update([
            'payment_method'    => $payment->payment_method,                         // 'card' | 'cash'
            'payment_status'    => $forceStatus ?? ($payment->status === 'succeeded' ? 'paid' : 'pending'),
            'total_amount'      => $payment->amount,                                 // total (affichage)
            'amount_paid'       => ($forceStatus === 'pending') ? 0.0 : $paidAmount, // payé
            'paid_at'           => ($forceStatus === 'pending')
                                   ? null
                                   : Carbon::now(),
            'payment_reference' => $reference,
        ]);
    }
}
