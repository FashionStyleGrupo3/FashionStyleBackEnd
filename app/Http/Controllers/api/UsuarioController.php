<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\api\Controller;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index()
    {
        return User::all();
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:255',
            'correo' => 'required|email|max:255|unique:usuarios,correo',
            'password_hash' => 'required|string|min:8',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
            'ciudad' => 'nullable|string|max:255',
            'activo' => 'boolean',
        ]);

        $datos['password_hash'] = Hash::make($datos['password_hash']);

        $usuario = User::create($datos);

        return response()->json($usuario, 201);
    }

    public function show($id)
    {
        return User::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $usuario = User::findOrFail($id);

        $datos = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'correo' => 'sometimes|required|email|max:255|unique:usuarios,correo,' . $id . ',id_usuario',
            'password_hash' => 'nullable|string|min:8',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
            'ciudad' => 'nullable|string|max:255',
            'activo' => 'boolean',
        ]);

        if (isset($datos['password_hash'])) {
            $datos['password_hash'] = Hash::make($datos['password_hash']);
        }

        $usuario->update($datos);

        return response()->json($usuario);
    }

    public function destroy($id)
    {
        $usuario = User::findOrFail($id);
        $usuario->delete();

        return response()->json([
            'mensaje' => 'Usuario eliminado correctamente',
        ]);
    }
}