<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function register(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string',
            'apellido' => 'required|string',
            'email' => 'required|email|unique:usuarios,correo|unique:clientes,correo',
            'password' => 'required|min:6',
            'tipo_documento' => 'required|in:CC,NIT,CE,PP',
            'numero_documento' => 'required|string|max:255|unique:clientes,numero_documento',
            'telefono' => 'required|string|max:255',
            'direccion' => 'required|string|max:255',
            'ciudad' => 'required|string|max:255',
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'nombre' => $request->nombre . ' ' . $request->apellido,
                'correo' => $request->email,
                'password_hash' => Hash::make($request->password),
                'telefono' => $request->telefono,
                'direccion' => $request->direccion,
                'ciudad' => $request->ciudad,
                'activo' => 1,
            ]);

            // IMPORTANTE: Aquí el rol es fijo como 'cliente' por seguridad
            $user->assignRole('cliente');

            $cliente = Cliente::create([
                'usuario_id' => $user->id_usuario,
                'nombre_completo' => $request->nombre . ' ' . $request->apellido,
                'tipo_documento' => $request->tipo_documento,
                'numero_documento' => $request->numero_documento,
                'telefono' => $request->telefono,
                'correo' => $request->email,
                'direccion' => $request->direccion,
                'ciudad' => $request->ciudad,
            ]);

            return response()->json([
                'message' => '¡Cuenta de cliente creada con éxito!',
                'cliente' => $cliente,
                'user' => $user->load('roles'),
            ], 201);
        });
    }

    /**
     * CREACIÓN ADMINISTRATIVA: Solo un admin puede usar esto para crear admin/empleados.
     */
    public function store(Request $request)
    {
        // 1. Verificación de seguridad: solo administradores
        /** @var \App\Models\User|null $authUser */
            $authUser = Auth::user();
        if (!auth()->user() || !auth()->user()->hasRole('admin')) {
            return response()->json(['message' => 'Acceso denegado. Se requieren permisos de administrador.'], 403);
        }

        $request->validate([
            'nombre' => 'required|string',
            'apellido' => 'required|string',
            'email' => 'required|email|unique:usuarios,correo',
            'password' => 'required|min:6',
            'rol' => 'required|in:admin,empleado,cliente', // Aquí sí permitimos elegir
            'tipo_documento' => 'nullable|in:CC,NIT,CE,PP',
            'numero_documento' => 'nullable|string|unique:clientes,numero_documento',
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'nombre' => $request->nombre . ' ' . $request->apellido,
                'correo' => $request->email,
                'password_hash' => Hash::make($request->password),
                'telefono' => $request->telefono,
                'direccion' => $request->direccion,
                'ciudad' => $request->ciudad,
                'activo' => 1,
            ]);

            $user->assignRole($request->rol);

            // Si el rol es cliente, también le creamos su ficha de cliente
            if ($request->rol === 'cliente') {
                Cliente::create([
                    'usuario_id' => $user->id_usuario,
                    'nombre_completo' => $user->nombre,
                    'correo' => $user->correo,
                    'tipo_documento' => $request->tipo_documento,
                    'numero_documento' => $request->numero_documento,
                ]);
            }

            return response()->json([
                'message' => "Usuario con rol {$request->rol} creado por el administrador.",
                'user' => $user->load('roles'),
            ], 201);
        });
    }
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        if ($user->hasRole('admin')) {
            $clientes = Cliente::with('usuario.roles')->get();
            return response()->json($clientes);
        }

        $clientes = Cliente::with('usuario.roles')
            ->where('usuario_id', $user->id_usuario)
            ->get();

        return response()->json($clientes);
    }

    /**
     * Store a newly created resource in storage.
     */
    

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $cliente = Cliente::with('usuario.roles')->findOrFail($id);
        return response()->json($cliente, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $cliente = Cliente::findOrFail($id);

        $authUser = $request->user();

        if ($cliente->usuario_id !== $authUser->id_usuario && !$authUser->hasRole('admin')) {
            return response()->json(['message' => 'No tienes permiso para actualizar estos datos'], 403);
        }

        $userAccount = User::find($cliente->usuario_id);

        if (!$userAccount) {
            return response()->json(['message' => 'Usuario de autenticación no encontrado'], 404);
        }

        $request->validate([
            'email' => 'sometimes|email|unique:usuarios,correo,' . $userAccount->id_usuario . ',id_usuario|unique:clientes,correo,' . $cliente->id . ',id',
            'numero_documento' => 'sometimes|string|max:255|unique:clientes,numero_documento,' . $cliente->id . ',id',
            'rol' => 'sometimes|in:admin,cliente',
        ]);

        $cliente->update($request->only([
            'tipo_documento',
            'numero_documento',
            'telefono',
            'direccion',
            'ciudad',
        ]));

        if ($request->has('nombre') || $request->has('apellido')) {
            $cliente->nombre_completo = trim(($request->nombre ?? '') . ' ' . ($request->apellido ?? '')) ?: $cliente->nombre_completo;
            $cliente->save();
        }

        $userAccount->update([
            'nombre' => ($request->nombre || $request->apellido)
                ? $cliente->nombre_completo
                : $userAccount->nombre,
            'correo' => $request->email ?? $userAccount->correo,
            'telefono' => $request->telefono ?? $userAccount->telefono,
            'direccion' => $request->direccion ?? $userAccount->direccion,
            'ciudad' => $request->ciudad ?? $userAccount->ciudad,
        ]);

        if ($request->has('email')) {
            $cliente->correo = $request->email;
            $cliente->save();
        }

        if ($request->has('password')) {
            $userAccount->password_hash = Hash::make($request->password);
            $userAccount->save();
        }

        if ($request->has('rol')) {
            $userAccount->syncRoles($request->rol);
        }

        return response()->json([
            'message' => 'Cliente y cuenta de usuario actualizados con éxito',
            'cliente' => $cliente->load('usuario.roles'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $cliente = Cliente::findOrFail($id);

        if ($cliente->usuario_id) {
            User::where('id_usuario', $cliente->usuario_id)->delete();
        }

        $cliente->delete();

        return response()->json(['message' => 'Cliente eliminado'], 200);
    }
}