<?php

namespace App\Http\Controllers;

use App\Models\Proveedor;
use Illuminate\Http\Request;

class ProveedorController extends Controller
{
    public function index()
    {
        return Proveedor::with('productos')->get();
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:255',
            'contacto' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'direccion' => 'nullable|string',
            'notas' => 'nullable|string',
            'activo' => 'boolean',
        ]);

        $proveedor = Proveedor::create($datos);

        return response()->json($proveedor->load('productos'), 201);
    }

    public function show(Proveedor $proveedor)
    {
        return $proveedor->load('productos');
    }

    public function update(Request $request, Proveedor $proveedor)
    {
        $datos = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'contacto' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'direccion' => 'nullable|string',
            'notas' => 'nullable|string',
            'activo' => 'boolean',
        ]);

        $proveedor->update($datos);

        return response()->json($proveedor->load('productos'));
    }

    public function destroy(Proveedor $proveedor)
    {
        $proveedor->delete();

        return response()->json([
            'mensaje' => 'Proveedor eliminado correctamente',
        ]);
    }
}