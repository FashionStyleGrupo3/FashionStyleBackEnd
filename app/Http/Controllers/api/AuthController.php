<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\api\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{

    public function register(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'correo' => 'required|string|email|max:100|unique:usuarios,correo',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'nombre' => $request->nombre,
            'correo' => $request->correo,
            'password_hash' => Hash::make($request->password),
            'telefono' => $request->telefono ?? '0000000000',
            'direccion' => $request->direccion ?? 'Sin direccion',
            'ciudad' => $request->ciudad ?? 'Sin ciudad',
            'activo' => 1,
        ]);

        // Asigna el rol vía Spatie (por defecto 'cliente' si no se especifica)
        $user->assignRole('cliente');

        if ($user->hasRole('cliente')) {
            DB::table('clientes')->insert([
                'usuario_id' => $user->id_usuario, // Asocia el ID del usuario recién creado (ej: 3)
                'nombre_completo' => $user->nombre,
                'correo' => $user->correo,
                'telefono' => $user->telefono,
                'created_at' => now(),
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }


    public function login(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('correo', $request->correo)->first();

        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            throw ValidationException::withMessages([
                'correo' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }


        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente',
        ]);
    }
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'correo' => 'required|email|exists:usuarios,correo',
        ]);

        
        $codigo = random_int(100000, 999999);

        
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->correo],
            [
                'token' => $codigo,
                'created_at' => now(),
            ]
        );

        
        return response()->json([
            'message' => 'Código de recuperación generado correctamente.',
            'codigo_prueba' => $codigo /*Eliminar esta línea cuando ingrese un correo real*/
        ]);
    }


    public function resetPassword(Request $request)
    {
        $request->validate([
            'correo' => 'required|email|exists:usuarios,correo',
            'codigo' => 'required',
            'nueva_password' => 'required|min:6',
        ]);

        /*Buscar si existe la solicitud en la tabla de tokens*/
        $registro = DB::table('password_reset_tokens')
            ->where('email', $request->correo)
            ->where('token', $request->codigo)
            ->first();

        if (!$registro) {
            return response()->json(['error' => 'El código es inválido o el correo es incorrecto.'], 400);
        }

        /*Actualizar la contraseña en la tabla usuarios*/
        $user = User::where('correo', $request->correo)->first();
        $user->password_hash = Hash::make($request->nueva_password);
        $user->save();

        /*Eliminar el token usado para que no se vuelva a utilizar*/
        DB::table('password_reset_tokens')->where('email', $request->correo)->delete();

        return response()->json([
            'message' => 'Contraseña actualizada con éxito. Ya puedes iniciar sesión.'
        ]);
    }
}