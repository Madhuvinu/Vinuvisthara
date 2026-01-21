<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:customers',
            'password' => 'required|min:6',
            'firstName' => 'nullable|string',
            'lastName' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        $customer = Customer::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'first_name' => $request->firstName,
            'last_name' => $request->lastName,
            'phone' => $request->phone,
        ]);

        $token = $customer->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $customer->id,
                'email' => $customer->email,
                'firstName' => $customer->first_name,
                'lastName' => $customer->last_name,
                'phone' => $customer->phone,
                'role' => 'customer',
            ],
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $customer = Customer::where('email', $request->email)->first();

        if (!$customer || !Hash::check($request->password, $customer->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $customer->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $customer->id,
                'email' => $customer->email,
                'firstName' => $customer->first_name,
                'lastName' => $customer->last_name,
                'phone' => $customer->phone,
                'role' => 'customer',
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        $customer = $request->user();

        return response()->json([
            'id' => $customer->id,
            'email' => $customer->email,
            'firstName' => $customer->first_name,
            'lastName' => $customer->last_name,
            'phone' => $customer->phone,
            'role' => 'customer',
        ]);
    }
}
