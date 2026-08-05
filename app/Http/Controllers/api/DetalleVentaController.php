<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\api\Controller;
use App\Models\DetalleVenta;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DetalleVentaController extends Controller
{
    /**
     * Display a listing of sale details.
     */
    public function index(Request $request)
    {
        try {
            $detalles = DetalleVenta::with(['venta', 'producto'])
                ->when($request->venta_id, fn($q) => $q->where('venta_id', $request->venta_id))
                ->when($request->producto_id, fn($q) => $q->where('producto_id', $request->producto_id))
                ->when($request->fecha_inicio, fn($q) => $q->whereDate('created_at', '>=', $request->fecha_inicio))
                ->when($request->fecha_fin, fn($q) => $q->whereDate('created_at', '<=', $request->fecha_fin))
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $detalles,
                'message' => 'Detalles de venta obtenidos correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalles de venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created sale detail.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'venta_id' => 'required|exists:ventas,ID_Venta',
                'producto_id' => 'required|exists:productos,id_producto',
                'cantidad' => 'required|integer|min:1',
                'precio_unitario' => 'required|numeric|min:0',
            ]);

            // Calcular subtotal
            $validated['subtotal'] = $validated['cantidad'] * $validated['precio_unitario'];

            $detalle = DetalleVenta::create($validated);

            // Actualizar el monto total de la venta
            $this->actualizarMontoTotalVenta($validated['venta_id']);

            return response()->json([
                'success' => true,
                'data' => $detalle->load(['venta', 'producto']),
                'message' => 'Detalle de venta creado correctamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear detalle de venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified sale detail.
     */
    public function show($id)
    {
        try {
            $detalle = DetalleVenta::with(['venta', 'producto'])->find($id);

            if (!$detalle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Detalle de venta no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $detalle,
                'message' => 'Detalle de venta obtenido correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalle de venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified sale detail.
     */
    public function update(Request $request, $id)
    {
        try {
            $detalle = DetalleVenta::find($id);

            if (!$detalle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Detalle de venta no encontrado'
                ], 404);
            }

            $validated = $request->validate([
                'venta_id' => 'sometimes|exists:ventas,ID_Venta',
                'producto_id' => 'sometimes|exists:productos,id_producto',
                'cantidad' => 'sometimes|integer|min:1',
                'precio_unitario' => 'sometimes|numeric|min:0',
            ]);

            // Recalcular subtotal si cantidad o precio_unitario cambian
            $cantidad = $validated['cantidad'] ?? $detalle->cantidad;
            $precioUnitario = $validated['precio_unitario'] ?? $detalle->precio_unitario;
            $validated['subtotal'] = $cantidad * $precioUnitario;

            $detalle->update($validated);

            // Actualizar el monto total de la venta
            $this->actualizarMontoTotalVenta($detalle->venta_id);

            return response()->json([
                'success' => true,
                'data' => $detalle->fresh()->load(['venta', 'producto']),
                'message' => 'Detalle de venta actualizado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar detalle de venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified sale detail.
     */
    public function destroy($id)
    {
        try {
            $detalle = DetalleVenta::find($id);

            if (!$detalle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Detalle de venta no encontrado'
                ], 404);
            }

            $ventaId = $detalle->venta_id;
            $detalle->delete();

            // Actualizar el monto total de la venta
            $this->actualizarMontoTotalVenta($ventaId);

            return response()->json([
                'success' => true,
                'message' => 'Detalle de venta eliminado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar detalle de venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sale details by sale ID.
     */
    public function porVenta($ventaId)
    {
        try {
            $venta = Venta::find($ventaId);

            if (!$venta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Venta no encontrada'
                ], 404);
            }

            $detalles = DetalleVenta::with('producto')
                ->where('venta_id', $ventaId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $detalles,
                'message' => 'Detalles de la venta obtenidos correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalles de la venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sales summary for details.
     */
    public function resumen()
    {
        try {
            $resumen = [
                'total_detalles' => DetalleVenta::count(),
                'total_productos_vendidos' => DetalleVenta::sum('cantidad'),
                'monto_total' => DetalleVenta::sum('subtotal'),
                'detalles_hoy' => DetalleVenta::whereDate('created_at', today())->count(),
                'monto_hoy' => DetalleVenta::whereDate('created_at', today())->sum('subtotal'),
                'productos_mas_vendidos' => DetalleVenta::select('producto_id',
                    DB::raw('sum(cantidad) as total_cantidad'),
                    DB::raw('sum(subtotal) as total_monto'))
                    ->with('producto')
                    ->groupBy('producto_id')
                    ->orderByDesc('total_cantidad')
                    ->limit(10)
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $resumen,
                'message' => 'Resumen de detalles de venta obtenido correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener resumen de detalles de venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Recalculate and update the total amount of a sale.
     */
    private function actualizarMontoTotalVenta($ventaId)
    {
        $montoTotal = DetalleVenta::where('venta_id', $ventaId)->sum('subtotal');
        Venta::where('ID_Venta', $ventaId)->update(['Monto_Total' => $montoTotal]);
    }
}