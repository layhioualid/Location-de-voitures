<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Facture #{{ $reservation->id }}</title>
<style>
  *{ box-sizing:border-box }
  body{ font-family: DejaVu Sans, sans-serif; font-size:12px; color:#111; }
  .wrap{ padding:16px 20px }
  .row{ display:flex; gap:12px; margin-bottom:10px }
  .col{ flex:1 }
  .card{ border:1px solid #9ca3af; border-radius:4px; }
  .card .hd{ background:#e5e7eb; padding:6px 8px; font-weight:700; text-transform:uppercase; }
  .card .bd{ padding:8px }
  h1{ text-align:center; font-size:22px; letter-spacing:.5px; margin:6px 0 10px }
  .header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:8px }
  .header .order{ border:1px solid #9ca3af; padding:6px 10px; border-radius:4px }
  .tbl{ width:100%; border-collapse:collapse; }
  .tbl th,.tbl td{ border:1px solid #9ca3af; padding:6px 8px; vertical-align:top }
  .tbl th{ background:#eef2ff; font-weight:700; text-align:left }
  .small{ font-size:11px }
  .totals td{ font-weight:700 }
  .page-break{ page-break-after: always; }
  .logo{ height:54px }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div><img class="logo" src="{{ public_path('logo-ent.jpg') }}" alt="Logo"></div>
    <h1>FACTURE</h1>
    <div class="order small">N° : <strong>{{ $reservation->id }}</strong><br>Émise le : {{ now()->format('d/m/Y') }}</div>
  </div>

  <div class="row">
    <div class="col card">
      <div class="hd">Vendeur</div>
      <div class="bd">
        <div><strong>HF Car Rental</strong></div>
        <div>Adresse : …</div>
        <div>IF / ICE / RC : …</div>
        <div>Tél : … | Email : contact@hfcar.ma</div>
      </div>
    </div>
    <div class="col card">
      <div class="hd">Client</div>
      <div class="bd">
        <div><strong>{{ $reservation->user->name ?? 'Client' }}</strong></div>
        <div>Tél : {{ $reservation->user->phone ?? '—' }}</div>
        <div>Email : {{ $reservation->user->email ?? '—' }}</div>
        <div>Adresse : {{ $reservation->user->address ?? '—' }}</div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-bottom:10px">
    <div class="hd">Détails de location</div>
    <div class="bd">
      <table class="tbl">
        <tr>
          <th>Véhicule</th><th>Prix/Jour</th><th>Date de début</th><th>Date de fin</th><th>Montant</th>
        </tr>
        <tr>
          <td>{{ ($reservation->car->brand ?? '').' '.($reservation->car->model ?? '') }}</td>
          <td>{{ number_format($reservation->car->price_per_day ?? 0, 2) }} {{ strtoupper($payment->currency ?? 'MAD') }}</td>
          <td>{{ \Carbon\Carbon::parse($reservation->start_date)->format('d/m/Y') }}</td>
          <td>{{ \Carbon\Carbon::parse($reservation->end_date)->format('d/m/Y') }}</td>
          <td>{{ number_format($payment->amount ?? 0, 2) }} {{ strtoupper($payment->currency ?? 'MAD') }}</td>
        </tr>
      </table>
      <p class="small" style="margin-top:6px">Lieu départ : {{ $reservation->pickup_location ?? '—' }} — Lieu retour : {{ $reservation->dropoff_location ?? '—' }}</p>
    </div>
  </div>

  <table class="tbl" style="margin-top:6px">
    <tr>
      <th style="width:70%">Mode de paiement</th>
      <th style="width:30%">Total TTC</th>
    </tr>
    <tr class="totals">
      <td>Carte bancaire ({{ strtoupper($payment->payment_method) }}), transaction : {{ $payment->transaction_id ?? '—' }} — Statut : {{ ucfirst($payment->status) }}</td>
      <td>{{ number_format($payment->amount ?? 0, 2) }} {{ strtoupper($payment->currency ?? 'MAD') }}</td>
    </tr>
  </table>

  <p class="small" style="margin-top:10px">
    Facture acquittée. TVA incluse si applicable. Merci de votre confiance.
  </p>

  <div class="page-break"></div>

  <h2 style="text-align:center; margin:0 0 6px">CONDITIONS GÉNÉRALES</h2>
  <p class="small" style="line-height:1.5">
    (Tes CGV / conditions de location ici — restitutions, carburant, franchise, retards, dépôt de garantie, assurances, etc.)
  </p>
</div>
</body>
</html>
