<?php

namespace App\Http\Controllers\api;

use App\Models\Venta;
use App\Models\DetalleVenta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VentaController extends Controller
{
    /**
     * Display a listing of sales.
     */
    public function index(Request $request)
    {
        try {
            $ventas = Venta::with(['usuario', 'detalles.producto'])
                ->when($request->estado, fn($q) => $q->estado($request->estado))
                ->when($request->medio_pago, fn($q) => $q->medioPago($request->medio_pago))
                ->when($request->fecha_inicio, fn($q) => $q->fechaEntre($request->fecha_inicio, $request->fecha_fin ?? now()))
                ->when($request->categoria, fn($q) => $q->categoria($request->categoria))
                ->when($request->canceladas, fn($q) => $q->canceladas())
                ->orderBy('Fecha_Venta', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $ventas,
                'message' => 'Ventas obtenidas correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener ventas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created sale.
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'ID_Usuario' => 'required|exists:users,id',
                'Descripcion' => 'nullable|string|max:255',
                'Categoria' => 'nullable|string|max:50',
                'Notas' => 'nullable|string',
                'Medio_Pago' => 'required|in:efectivo,tarjeta,transferencia,credito,debito',
                'detalles' => 'required|array|min:1',
                'detalles.*.ID_Producto' => 'required|exists:productos,ID_Producto',
                'detalles.*.Cantidad' => 'required|integer|min:1',
                'detalles.*.Precio_Unitario' => 'required|numeric|min:0',
                'detalles.*.Descuento' => 'nullable|numeric|min:0',
            ]);

            // Generar número de comprobante
            $numeroComprobante = 'VENTA-' . date('Ymd') . '-' . str_pad(Venta::count() + 1, 6, '0', STR_PAD_LEFT);

            // Calcular totales
            $montoTotal = 0;
            $detallesData = [];

            foreach ($validated['detalles'] as $detalle) {
                $subtotal = $detalle['Cantidad'] * $detalle['Precio_Unitario'];
                $descuento = $detalle['Descuento'] ?? 0;
                $total = $subtotal - $descuento;
                $montoTotal += $total;

                $detallesData[] = [
                    'ID_Producto' => $detalle['ID_Producto'],
                    'Cantidad' => $detalle['Cantidad'],
                    'Precio_Unitario' => $detalle['Precio_Unitario'],
                    'Subtotal' => $subtotal,
                    'Descuento' => $descuento,
                    'Total' => $total,
                ];
            }

            // Crear la venta
            $venta = Venta::create([
                'Numero_Comprobante' => $numeroComprobante,
                'ID_Usuario' => $validated['ID_Usuario'],
                'Descripcion' => $validated['Descripcion'] ?? null,
                'Categoria' => $validated['Categoria'] ?? null,
                'Notas' => $validated['Notas'] ?? null,
                'Fecha_Venta' => now(),
                'Monto_Total' => $montoTotal,
                'Medio_Pago' => $validated['Medio_Pago'],
                'Estado' => 'completada',
                'Cancelada' => false,
            ]);

            // Crear los detalles
            foreach ($detallesData as $detalle) {
                $detalle['ID_Venta'] = $venta->ID_Venta;
                DetalleVenta::create($detalle);
            
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $venta->load(['usuario', 'detalles.producto']),
                'message' => 'Venta creada correctamente'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified sale.
     */
    public function show(int $id)
    {
        try {
            $venta = Venta::with(['usuario', 'detalles.producto'])
                ->find($id);

            if (!$venta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Venta no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $venta,
                'message' => 'Venta obtenida correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a sale.
     */
    public function cancelar(int $id)
    {
        try {
            $venta = Venta::find($id);

            if (!$venta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Venta no encontrada'
                ], 404);
            }

            if ($venta->isCancelada()) {
                return response()->json([
                    'success' => false,
                    'message' => 'La venta ya está cancelada'
                ], 400);
            }

            $venta->update([
                'Cancelada' => true,
                'Estado' => 'cancelada'
            ]);

            return response()->json([
                'success' => true,
                'data' => $venta,
                'message' => 'Venta cancelada correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cancelar venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sales summary.
     */
    public function resumen()
    {
        try {
            $resumen = [
                'total_ventas' => Venta::count(),
                'total_activas' => Venta::activas()->count(),
                'total_canceladas' => Venta::canceladas()->count(),
                'monto_total' => Venta::sum('Monto_Total'),
                'monto_activas' => Venta::activas()->sum('Monto_Total'),
                'monto_canceladas' => Venta::canceladas()->sum('Monto_Total'),
                'ventas_hoy' => Venta::whereDate('Fecha_Venta', today())->count(),
                'monto_hoy' => Venta::whereDate('Fecha_Venta', today())->sum('Monto_Total'),
                'ventas_por_medio' => Venta::select('Medio_Pago', 
                    DB::raw('count(*) as total'),
                    DB::raw('sum(Monto_Total) as monto'))
                    ->groupBy('Medio_Pago')
                    ->get(),
                'ventas_por_categoria' => Venta::select('Categoria',
                    DB::raw('count(*) as total'),
                    DB::raw('sum(Monto_Total) as monto'))
                    ->whereNotNull('Categoria')
                    ->groupBy('Categoria')
                    ->get(),
                'ultimas_ventas' => Venta::with('usuario')
                    ->orderBy('Fecha_Venta', 'desc')
                    ->limit(10)
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $resumen,
                'message' => 'Resumen de ventas obtenido correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener resumen de ventas: ' . $e->getMessage()
            ], 500);
        }
    }
}