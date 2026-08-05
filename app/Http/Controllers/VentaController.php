<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use Illuminate\Http\Request;

class VentaController extends Controller
{
    public function index()
    {
        return Venta::with(['pedido', 'usuario', 'detalles'])->get();
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'numero_comprobante' => 'required|string|max:30|unique:ventas,numero_comprobante',
            'pedido_id' => 'nullable|exists:pedidos,id',
            'usuario_id' => 'required|exists:usuarios,id_usuario',
            'descripcion' => 'nullable|string|max:255',
            'categoria' => 'nullable|string|max:50',
            'notas' => 'nullable|string',
            'fecha_venta' => 'nullable|date',
            'monto_total' => 'required|numeric|min:0',
            'medio_pago' => 'nullable|string|max:50',
            'estado' => 'nullable|string|max:20',
            'cancelada' => 'boolean',
        ]);

        $venta = Venta::create($datos);

        return response()->json($venta->load(['pedido', 'usuario', 'detalles']), 201);
    }

    public function show(Venta $venta)
    {
        return $venta->load(['pedido', 'usuario', 'detalles']);
    }

    public function update(Request $request, Venta $venta)
    {
        $datos = $request->validate([
            'numero_comprobante' => 'sometimes|required|string|max:30|unique:ventas,numero_comprobante,' . $venta->id,
            'pedido_id' => 'nullable|exists:pedidos,id',
            'usuario_id' => 'sometimes|required|exists:usuarios,id_usuario',
            'descripcion' => 'nullable|string|max:255',
            'categoria' => 'nullable|string|max:50',
            'notas' => 'nullable|string',
            'fecha_venta' => 'nullable|date',
            'monto_total' => 'sometimes|required|numeric|min:0',
            'medio_pago' => 'nullable|string|max:50',
            'estado' => 'nullable|string|max:20',
            'cancelada' => 'boolean',
        ]);

        $venta->update($datos);

        return response()->json($venta->load(['pedido', 'usuario', 'detalles']));
    }

    public function destroy(Venta $venta)
    {
        $venta->delete();

        return response()->json([
            'mensaje' => 'Venta eliminada correctamente',
        ]);
    }
}