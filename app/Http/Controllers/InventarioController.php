<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use Illuminate\Http\Request;   

class InventarioController extends Controller
{
    /**
     * Display a listing of the inventory movements.
     */
    public function index(Request $request)
    {
        try {
            $movimientos = Inventario::with(['producto', 'materiaPrima', 'usuario'])
                ->when($request->tipo, function($query, $tipo) {
                    return $query->where('tipo_movimiento', $tipo);
                })
                ->when($request->fecha_inicio, function($query, $fecha) use ($request) {
                    return $query->whereBetween('fecha_registro', [$fecha, $request->fecha_fin ?? now()]);
                })
                ->orderBy('fecha_registro', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $movimientos,
                'message' => 'Movimientos de inventario obtenidos correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener movimientos de inventario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created inventory movement.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'producto_id' => 'nullable|exists:productos,id_producto',
                'materia_prima_id' => 'nullable|exists:materiales,id_material',
                'tipo_movimiento' => 'required|in:entrada,salida,ajuste',
                'concepto' => 'required|string|max:100',
                'observaciones' => 'nullable|string',
                'cantidad' => 'required|integer|min:1',
                'costo_unitario' => 'nullable|numeric|min:0',
            ]);

            if (is_null($validated['producto_id']) && is_null($validated['materia_prima_id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Debe especificar un producto o una materia prima'
                ], 422);
            }

            
            $validated['usuario_id'] = auth()->user() ? auth()->user()->id : 1;
            $validated['fecha_registro'] = now();

            if (isset($validated['costo_unitario'])) {
                $validated['costo_total'] = $validated['costo_unitario'] * $validated['cantidad'];
            }

            $movimiento = Inventario::create($validated);

            return response()->json([
                'success' => true,
                'data' => $movimiento->load(['producto', 'materiaPrima', 'usuario']),
                'message' => 'Movimiento de inventario creado correctamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear movimiento de inventario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified inventory movement.
     */
    public function show(int $id)
    {
        try {
            $movimiento = Inventario::with(['producto', 'materiaPrima', 'usuario'])
                ->find($id);

            if (!$movimiento) {
                return response()->json([
                    'success' => false,
                    'message' => 'Movimiento de inventario no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $movimiento,
                'message' => 'Movimiento de inventario obtenido correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener movimiento de inventario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified inventory movement.
     */
    public function update(Request $request, int $id)
    {
        try {
            $movimiento = Inventario::find($id);

            if (!$movimiento) {
                return response()->json([
                    'success' => false,
                    'message' => 'Movimiento de inventario no encontrado'
                ], 404);
            }

            $validated = $request->validate([
                'producto_id' => 'nullable|exists:productos,id_producto',
                'materia_prima_id' => 'nullable|exists:materiales,id_material',
                'tipo_movimiento' => 'sometimes|in:entrada,salida,ajuste',
                'concepto' => 'sometimes|string|max:100',
                'observaciones' => 'nullable|string',
                'cantidad' => 'sometimes|integer|min:1',
                'costo_unitario' => 'nullable|numeric|min:0',
            ]);

            if (isset($validated['costo_unitario']) && isset($validated['cantidad'])) {
                $validated['costo_total'] = $validated['costo_unitario'] * $validated['cantidad'];
            } elseif (isset($validated['costo_unitario']) && $movimiento->cantidad) {
                $validated['costo_total'] = $validated['costo_unitario'] * $movimiento->cantidad;
            } elseif (isset($validated['cantidad']) && $movimiento->costo_unitario) {
                $validated['costo_total'] = $movimiento->costo_unitario * $validated['cantidad'];
            }

            $movimiento->update($validated);

            return response()->json([
                'success' => true,
                'data' => $movimiento->load(['producto', 'materiaPrima', 'usuario']),
                'message' => 'Movimiento de inventario actualizado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar movimiento de inventario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified inventory movement.
     */
    public function destroy(int $id)
    {
        try {
            $movimiento = Inventario::find($id);

            if (!$movimiento) {
                return response()->json([
                    'success' => false,
                    'message' => 'Movimiento de inventario no encontrado'
                ], 404);
            }

            $movimiento->delete();

            return response()->json([
                'success' => true,
                'message' => 'Movimiento de inventario eliminado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar movimiento de inventario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory summary.
     */
    public function resumen()
    {
        try {
            $resumen = [
                'total_movimientos' => Inventario::count(),
                'entradas' => Inventario::where('tipo_movimiento', 'entrada')->count(),
                'salidas' => Inventario::where('tipo_movimiento', 'salida')->count(),
                'ajustes' => Inventario::where('tipo_movimiento', 'ajuste')->count(),
                'total_costo' => Inventario::sum('costo_total'),
                'por_producto' => Inventario::whereNotNull('producto_id')->sum('costo_total'),
                'por_materia_prima' => Inventario::whereNotNull('materia_prima_id')->sum('costo_total'),
                'ultimos_movimientos' => Inventario::with(['producto', 'materiaPrima', 'usuario'])
                    ->orderBy('fecha_registro', 'desc')
                    ->limit(10)
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $resumen,
                'message' => 'Resumen de inventario obtenido correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener resumen de inventario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory movements by type.
     */
    public function porTipo(string $tipo)
    {
        try {
            if (!in_array($tipo, ['entrada', 'salida', 'ajuste'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tipo de movimiento no válido. Use: entrada, salida, ajuste'
                ], 400);
            }

            $movimientos = Inventario::with(['producto', 'materiaPrima', 'usuario'])
                ->where('tipo_movimiento', $tipo)
                ->orderBy('fecha_registro', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $movimientos,
                'message' => "Movimientos de tipo {$tipo} obtenidos correctamente"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener movimientos por tipo: ' . $e->getMessage()
            ], 500);
        }
    }
}