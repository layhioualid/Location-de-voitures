<?php

// App/Http/Controllers/API/AuthController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    // ✅ Inscription
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role'     => 'user',
        ]);

        // Création du token directement après inscription
        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'message' => 'Utilisateur créé avec succès.',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    // ✅ Connexion
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les informations d’identification sont incorrectes.'],
            ]);
        }

        // 🔑 Génération du token Sanctum
        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user'    => $user,
            'token'   => $token,
        ]);
    }

    // ✅ Info profil
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // ✅ Déconnexion
    public function logout(Request $request)
    {
        // Supprime tous les tokens de l’utilisateur
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    // ✅ Mise à jour du profil (utilisateur connecté)
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'             => ['sometimes','string','max:255'],
            'email'            => ['sometimes','email', Rule::unique('users','email')->ignore($user->id)],
            // Changement de mot de passe (optionnel)
            'current_password' => ['nullable','string'],
            'new_password'     => ['nullable','string','min:6','confirmed'], // nécessite new_password_confirmation
        ]);

        $rotatedToken = false;

        // name / email
        if (array_key_exists('name', $validated))  { $user->name  = $validated['name']; }
        if (array_key_exists('email',$validated))  { $user->email = $validated['email']; }

        // Mot de passe
        if (!empty($validated['new_password'])) {
            // Vérif de l’ancien
            if (!$request->filled('current_password') || !Hash::check($request->input('current_password'), $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Le mot de passe actuel est incorrect.'],
                ]);
            }

            $user->password = bcrypt($validated['new_password']);
            $rotatedToken = true;
        }

        $user->save();

        // Si mdp changé: on révoque tous les tokens et on renvoie un nouveau
        $newToken = null;
        if ($rotatedToken) {
            $user->tokens()->delete();
            $newToken = $user->createToken('api_token')->plainTextToken;
        }

        return response()->json([
            'message' => 'Profil mis à jour.',
            'user'    => $user,
            'token'   => $newToken, // côté front: si présent, remplace l’ancien
        ]);
    }

    /* ===========================
     |   🔐 ADMIN — USERS CRUD   |
     =========================== */

    // Liste des utilisateurs
    public function indexUsers(Request $request)
    {
        if ($resp = $this->ensureAdmin($request)) return $resp;

        return response()->json([
            'data' => User::query()->latest()->get(['id','name','email','role','created_at'])
        ]);
    }

    // Création d’un utilisateur
    public function storeUser(Request $request)
    {
        if ($resp = $this->ensureAdmin($request)) return $resp;

        $validated = $request->validate([
            'name'     => ['required','string','max:255'],
            'email'    => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6'],
            'role'     => ['required', Rule::in(['user','admin'])],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => $validated['role'],
        ]);

        return response()->json($user->only(['id','name','email','role']), 201);
    }

    // Affichage d’un utilisateur
    public function showUser(Request $request, User $user)
    {
        if ($resp = $this->ensureAdmin($request)) return $resp;

        return response()->json($user->only(['id','name','email','role','created_at']));
    }

    // Mise à jour d’un utilisateur
    public function updateUser(Request $request, User $user)
    {
        if ($resp = $this->ensureAdmin($request)) return $resp;

        $validated = $request->validate([
            'name'     => ['sometimes','string','max:255'],
            'email'    => ['sometimes','email','max:255', Rule::unique('users','email')->ignore($user->id)],
            'role'     => ['sometimes', Rule::in(['user','admin'])],
            'password' => ['nullable','string','min:6'], // optionnel
        ]);

        if (array_key_exists('name', $validated))  $user->name  = $validated['name'];
        if (array_key_exists('email', $validated)) $user->email = $validated['email'];
        if (array_key_exists('role', $validated))  $user->role  = $validated['role'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json($user->only(['id','name','email','role']));
    }

    // Suppression d’un utilisateur
    public function destroyUser(Request $request, User $user)
    {
        if ($resp = $this->ensureAdmin($request)) return $resp;

        // (Option) empêcher de supprimer son propre compte admin
        // if ($request->user()->id === $user->id) {
        //     return response()->json(['message' => 'Impossible de supprimer votre propre compte.'], 422);
        // }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé']);
    }

    /* Helper privé : refuse 403 si non-admin */
    private function ensureAdmin(Request $request)
    {
        $me = $request->user();
        if (!$me || $me->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return null;
    }
}
