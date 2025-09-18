<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Bon de réservation #{{ $reservation->id }}</title>
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
  .grid2{ display:grid; grid-template-columns:1.3fr .7fr; gap:12px }
  .tbl{ width:100%; border-collapse:collapse; }
  .tbl th,.tbl td{ border:1px solid #9ca3af; padding:6px 8px; vertical-align:top }
  .tbl th{ background:#eef2ff; font-weight:700; text-align:left }
  .muted{ color:#555 }
  .totals td{ font-weight:700 }
  .pill{ display:inline-block; border:1px solid #9ca3af; padding:4px 8px; border-radius:14px; margin-right:6px }
  .check{ display:inline-block; width:12px; height:12px; border:1px solid #111; margin-right:6px; vertical-align:middle }
  .foot{ display:flex; justify-content:space-between; margin-top:26px; gap:12px }
  .sig{ border-top:1px solid #9ca3af; text-align:center; padding-top:8px; height:60px }
  .place-date{ display:flex; gap:18px; margin-top:10px }
  .small{ font-size:11px }
  .page-break{ page-break-after: always; }
  .logo{ height:54px }
</style>
</head>
<body>
<div class="wrap">
  {{-- EN-TÊTE --}}
  <div class="header">
    <div><img class="logo" src="{{ public_path('logo-ent.jpg') }}" alt="Logo"></div>
    <h1>BON DE RÉSERVATION</h1>
    <div class="order small">N° d’ordre : <strong>{{ $reservation->id }}</strong></div>
  </div>

  {{-- ENTREPRISE / CLIENT --}}
  <div class="row">
    <div class="col card">
      <div class="hd">Entreprise</div>
      <div class="bd">
        <div><strong>HF Car Rental</strong></div>
        <div>Adresse : …</div>
        <div>RC/IF/Patente : …</div>
        <div>Tél : … | Email : contact@hfcar.ma</div>
      </div>
    </div>
    <div class="col card">
      <div class="hd">Client(s)</div>
      <div class="bd">
        <div><strong>{{ $reservation->user->name ?? 'Client' }}</strong></div>
        <div>Tél : {{ $reservation->user->phone ?? '—' }}</div>
        <div>Email : {{ $reservation->user->email ?? '—' }}</div>
        <div>CIN / Passeport : {{ $reservation->user->cin ?? '—' }}</div>
      </div>
    </div>
  </div>

  {{-- VÉHICULE COMMANDÉ --}}
  <div class="card" style="margin-bottom:10px">
    <div class="hd">Véhicule commandé</div>
    <div class="bd">
      <table class="tbl">
        <tr>
          <th>Marque</th><td>{{ $reservation->car->brand ?? '—' }}</td>
          <th>Modèle</th><td>{{ $reservation->car->model ?? '—' }}</td>
        </tr>
        <tr>
          <th>Immat.</th><td>{{ $reservation->car->plate ?? '—' }}</td>
          <th>Énergie</th><td>{{ $reservation->car->fuel_type ?? '—' }}</td>
        </tr>
        <tr>
          <th>Date de début</th><td>{{ \Carbon\Carbon::parse($reservation->start_date)->format('d/m/Y') }}</td>
          <th>Date de fin</th><td>{{ \Carbon\Carbon::parse($reservation->end_date)->format('d/m/Y') }}</td>
        </tr>
      </table>
      <div class="pill muted" style="margin-top:8px;">Lieu départ : {{ $reservation->pickup_location ?? '—' }}</div>
      <div class="pill muted">Lieu retour : {{ $reservation->dropoff_location ?? '—' }}</div>
    </div>
  </div>

  {{-- PRIX & RÈGLEMENT --}}
  <div class="card">
    <div class="hd">Prix et règlement</div>
    <div class="bd">
      <table class="tbl">
        <tr>
          <th>Prix par jour</th>
          <th>Montant estimé</th>
          <th>Monnaie</th>
          <th>Observation</th>
        </tr>
        <tr>
          <td>{{ number_format($reservation->car->price_per_day ?? 0, 2) }}</td>
          <td>{{ number_format($payment->amount ?? 0, 2) }}</td>
          <td>{{ strtoupper($payment->currency ?? 'MAD') }}</td>
          <td class="small">À régler à la réception en espèces.</td>
        </tr>
        <tr class="totals">
          <td colspan="3" style="text-align:right">TOTAL À PAYER À LA RÉCEPTION</td>
          <td>{{ number_format($payment->amount ?? 0, 2) }} {{ strtoupper($payment->currency ?? 'MAD') }}</td>
        </tr>
      </table>

      <div style="margin-top:8px">
        <span class="check"></span> À crédit
        <span style="margin-left:16px" class="check" >
          {{-- vide sur proforma cash --}}
        </span> Au comptant
        <span class="small muted" style="margin-left:8px">(règlement en espèces à la remise du véhicule)</span>
      </div>

      <div class="place-date small">
        <div>Fait à : <strong>{{ $reservation->city ?? '—' }}</strong></div>
        <div>Date : <strong>{{ now()->format('d/m/Y') }}</strong></div>
        <div>Prévision de remise : <strong>{{ \Carbon\Carbon::parse($reservation->start_date)->format('d/m/Y') }}</strong></div>
      </div>
    </div>
  </div>

  {{-- SIGNATURES --}}
  <div class="foot">
    <div class="col">
      <div class="sig small">Vendeur</div>
    </div>
    <div class="col">
      <div class="sig small">Acheteur</div>
    </div>
  </div>

  <p class="small muted" style="margin-top:12px">
    Document non fiscal – bon de réservation (pro forma). Les conditions générales figurent en page suivante.
  </p>

  <div class="page-break"></div>

  {{-- PAGE 2 : CGV (extrait – adapte ton texte) --}}
  <h2 style="text-align:center; margin:0 0 6px">CONDITIONS GÉNÉRALES DE VENTE</h2>
  <ol class="small" style="line-height:1.5">
    <li><strong>Commande.</strong> La présente commande est ferme et définitive pour le véhicule désigné ci-dessus.</li>
    <li><strong>Responsabilité de l’acheteur.</strong> À la livraison, l’acheteur prend à sa charge tous risques…</li>
    <li><strong>Prestations comprises.</strong> Le montant total comprend les frais d’immatriculation éventuels…</li>
    <li><strong>Livraison.</strong> Le véhicule sera livré au lieu et à la date indiqués…</li>
    <li><strong>Contrôle technique.</strong> …</li>
    <li><strong>Garantie légale / contractuelle.</strong> …</li>
    <li><strong>Réserve de propriété.</strong> …</li>
    <li><strong>Annulation – Résiliation.</strong> …</li>
    <li><strong>Données personnelles.</strong> …</li>
    <li><strong>Compétence.</strong> …</li>
  </ol>
</div>
</body>
</html>
