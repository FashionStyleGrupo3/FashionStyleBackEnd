<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\MateriaPrima;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class VentaController extends Controller
{
    /**
     * Display a listing of the sales.
     */
    public function index(Request $request)
    {
        try {
            $ventas = Venta::with(['cliente', 'usuario', 'detalles.producto', 'detalles.materiaPrima'])
                ->when($request->estado, function($query, $estado) {
                    return $query->porEstado($estado);
                })
                ->when($request->fecha_inicio, function($query, $fecha) use ($request) {
                    return $query->fechaEntre($fecha, $request->fecha_fin ?? now());
                })
                ->when($request->cliente_id, function($query, $clienteId) {
                    return $query->porCliente($clienteId);
                })
                ->orderBy('fecha_venta', 'desc')
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
        DB::beginTransaction();

        try {
            $validated = $request->validate([
                'cliente_id' => 'required|exists:clientes,id_cliente',
                'metodo_pago' => 'required|in:efectivo,tarjeta,transferencia,credito',
                'observaciones' => 'nullable|string',
                'detalles' => 'required|array|min:1',
                'detalles.*.producto_id' => 'nullable|exists:productos,id_producto',
                'detalles.*.materia_prima_id' => 'nullable|exists:materiales,id_material',
                'detalles.*.cantidad' => 'required|integer|min:1',
                'detalles.*.precio_unitario' => 'required|numeric|min:0',
            ]);

            foreach ($validated['detalles'] as $detalle) {
                if (is_null($detalle['producto_id'] ?? null) && is_null($detalle['materia_prima_id'] ?? null)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cada detalle debe tener un producto o una materia prima'
                    ], 422);
                }
            }

            $venta = Venta::create([
                'cliente_id' => $validated['cliente_id'],
                'usuario_id' => auth()->id() ?? 1,
                'fecha_venta' => now(),
                'estado' => 'pendiente',
                'metodo_pago' => $validated['metodo_pago'],
                'observaciones' => $validated['observaciones'] ?? null,
                'total' => 0,
            ]);

            $total = 0;

            foreach ($validated['detalles'] as $detalleData) {
                $subtotal = $detalleData['cantidad'] * $detalleData['precio_unitario'];
                $total += $subtotal;

                $detalle = DetalleVenta::create([
                    'venta_id' => $venta->id_venta,
                    'producto_id' => $detalleData['producto_id'] ?? null,
                    'materia_prima_id' => $detalleData['materia_prima_id'] ?? null,
                    'cantidad' => $detalleData['cantidad'],
                    'precio_unitario' => $detalleData['precio_unitario'],
                    'subtotal' => $subtotal,
                ]);

                if (isset($detalleData['producto_id'])) {
                    $producto = Producto::find($detalleData['producto_id']);
                    if ($producto) {
                        if (!$producto->hasStockDisponible($detalleData['cantidad'])) {
                            DB::rollBack();
                            return response()->json([
                                'success' => false,
                                'message' => "Stock insuficiente para el producto: {$producto->nombre}"
                            ], 400);
                        }
                        $producto->disminuirStock($detalleData['cantidad']);
                    }
                } elseif (isset($detalleData['materia_prima_id'])) {
                    $materiaPrima = MateriaPrima::find($detalleData['materia_prima_id']);
                    if ($materiaPrima) {
                        if (!$materiaPrima->hasStockDisponible($detalleData['cantidad'])) {
                            DB::rollBack();
                            return response()->json([
                                'success' => false,
                                'message' => "Stock insuficiente para la materia prima: {$materiaPrima->nombre}"
                            ], 400);
                        }
                        $materiaPrima->disminuirStock($detalleData['cantidad']);
                    }
                }
            }

            $venta->total = $total;
            $venta->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $venta->load(['cliente', 'usuario', 'detalles.producto', 'detalles.materiaPrima']),
                'message' => 'Venta creada correctamente'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified sale.
     */
    public function show(int $id)
    {
        try {
            $venta = Venta::with(['cliente', 'usuario', 'detalles.producto', 'detalles.materiaPrima'])
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
                'message' => 'Error al obtener la venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified sale.
     */
    public function update(Request $request, int $id) 
    {
        DB::beginTransaction();

        try {
            $venta = Venta::find($id);

            if (!$venta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Venta no encontrada'
                ], 404);
            }

            $validated = $request->validate([
                'estado' => 'sometimes|in:pendiente,completada,cancelada,entregada',
                'metodo_pago' => 'sometimes|in:efectivo,tarjeta,transferencia,credito',
                'observaciones' => 'nullable|string',
            ]);

            $venta->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $venta->load(['cliente', 'usuario', 'detalles.producto', 'detalles.materiaPrima']),
                'message' => 'Venta actualizada correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified sale.
     */
    public function destroy(int $id) 
    {
        DB::beginTransaction();

        try {
            $venta = Venta::find($id);

            if (!$venta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Venta no encontrada'
                ], 404);
            }

            if (in_array($venta->estado, ['completada', 'entregada'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar una venta completada o entregada'
                ], 400);
            }

            $venta->detalles()->delete();
            $venta->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Venta eliminada correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la venta: ' . $e->getMessage()
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
                'total_completadas' => Venta::porEstado('completada')->count(),
                'total_pendientes' => Venta::porEstado('pendiente')->count(),
                'total_canceladas' => Venta::porEstado('cancelada')->count(),
                'total_entregadas' => Venta::porEstado('entregada')->count(),
                'total_ingresos' => Venta::sum('total'),
                'total_ingresos_completadas' => Venta::porEstado('completada')->sum('total'),
                'promedio_venta' => Venta::avg('total'),
                'venta_maxima' => Venta::max('total'),
                'venta_minima' => Venta::min('total'),
                'ultimas_ventas' => Venta::with(['cliente', 'usuario'])
                    ->orderBy('fecha_venta', 'desc')
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