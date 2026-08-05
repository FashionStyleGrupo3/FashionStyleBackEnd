<?php

namespace App\Http\Controllers\api;

use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function index()
    {
        return Cliente::with('usuario')->get();
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'usuario_id' => 'required|exists:usuarios,id_usuario',
            'nombre_completo' => 'required|string|max:255',
            'correo' => 'required|email|max:255|unique:clientes,correo',
            'telefono' => 'nullable|string|max:20',
        ]);

        $cliente = Cliente::create($datos);

        return response()->json($cliente->load('usuario'), 201);
    }

    public function show(Cliente $cliente)
    {
        return $cliente->load('usuario');
    }

    public function update(Request $request, Cliente $cliente)
    {
        $datos = $request->validate([
            'usuario_id' => 'sometimes|required|exists:usuarios,id_usuario',
            'nombre_completo' => 'sometimes|required|string|max:255',
            'correo' => 'sometimes|required|email|max:255|unique:clientes,correo,' . $cliente->id,
            'telefono' => 'nullable|string|max:20',
        ]);

        $cliente->update($datos);

        return response()->json($cliente->load('usuario'));
    }

    public function destroy(Cliente $cliente)
    {
        $cliente->delete();

        return response()->json([
            'mensaje' => 'Cliente eliminado correctamente',
        ]);
    }
}