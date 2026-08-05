<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\api\Controller;

use App\Models\Promocion;
use Illuminate\Http\Request;

class PromocionController extends Controller
{
    public function index()
    {
        return Promocion::with(['producto', 'usuario'])->get();
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'tipo' => 'nullable|string|max:50',
            'valor' => 'nullable|numeric|min:0',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'activa' => 'boolean',
            'producto_id' => 'nullable|exists:productos,id_producto',
            'usuario_id' => 'required|exists:usuarios,id_usuario',
        ]);

        $promocion = Promocion::create($datos);

        return response()->json($promocion->load(['producto', 'usuario']), 201);
    }

    public function show(Promocion $promocion)
    {
        return $promocion->load(['producto', 'usuario']);
    }

    public function update(Request $request, Promocion $promocion)
    {
        $datos = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'descripcion' => 'nullable|string',
            'tipo' => 'nullable|string|max:50',
            'valor' => 'nullable|numeric|min:0',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'activa' => 'boolean',
            'producto_id' => 'nullable|exists:productos,id_producto',
            'usuario_id' => 'sometimes|required|exists:usuarios,id_usuario',
        ]);

        $promocion->update($datos);

        return response()->json($promocion->load(['producto', 'usuario']));
    }

    public function destroy(Promocion $promocion)
    {
        $promocion->delete();

        return response()->json([
            'mensaje' => 'Promoción eliminada correctamente',
        ]);
    }
}