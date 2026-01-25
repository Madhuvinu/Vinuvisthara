<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApiTokenController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'permissions' => 'nullable|array',
        ]);

        $user = $request->user();
        
        $token = $user->createToken(
            $request->name,
            $request->permissions ?? ['*']
        );

        return response()->json([
            'token' => $token->plainTextToken,
            'token_id' => $token->accessToken->id,
            'name' => $request->name,
            'permissions' => $request->permissions ?? ['*'],
        ], 201);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $tokens = $user->tokens;

        return response()->json($tokens->map(function ($token) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'abilities' => $token->abilities,
                'last_used_at' => $token->last_used_at,
                'created_at' => $token->created_at,
            ];
        }));
    }

    public function revoke(Request $request, $id)
    {
        $user = $request->user();
        $token = $user->tokens()->findOrFail($id);
        $token->delete();

        return response()->json(['message' => 'Token revoked successfully']);
    }
}
