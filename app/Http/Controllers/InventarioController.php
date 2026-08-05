<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use Illuminate\Http\Request;

class InventarioController extends Controller
{
    public function index()
    {
        return Inventario::with(['producto', 'usuario'])->get();
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'producto_id' => 'nullable|exists:productos,id_producto',
            'usuario_id' => 'required|exists:usuarios,id_usuario',
            'tipo_movimiento' => 'required|string|max:50',
            'concepto' => 'nullable|string|max:100',
            'observaciones' => 'nullable|string',
            'cantidad' => 'required|integer',
            'fecha_registro' => 'nullable|date',
            'costo_unitario' => 'nullable|numeric|min:0',
            'costo_total' => 'nullable|numeric|min:0',
            'estado' => 'nullable|string|max:20',
            'diferencia' => 'nullable|integer',
        ]);

        $inventario = Inventario::create($datos);

        return response()->json($inventario->load(['producto', 'usuario']), 201);
    }

    public function show(Inventario $inventario)
    {
        return $inventario->load(['producto', 'usuario']);
    }

    public function update(Request $request, Inventario $inventario)
    {
        $datos = $request->validate([
            'producto_id' => 'nullable|exists:productos,id_producto',
            'usuario_id' => 'sometimes|required|exists:usuarios,id_usuario',
            'tipo_movimiento' => 'sometimes|required|string|max:50',
            'concepto' => 'nullable|string|max:100',
            'observaciones' => 'nullable|string',
            'cantidad' => 'sometimes|required|integer',
            'fecha_registro' => 'nullable|date',
            'costo_unitario' => 'nullable|numeric|min:0',
            'costo_total' => 'nullable|numeric|min:0',
            'estado' => 'nullable|string|max:20',
            'diferencia' => 'nullable|integer',
        ]);

        $inventario->update($datos);

        return response()->json($inventario->load(['producto', 'usuario']));
    }

    public function destroy(Inventario $inventario)
    {
        $inventario->delete();

        return response()->json([
            'mensaje' => 'Movimiento de inventario eliminado correctamente',
        ]);
    }
}