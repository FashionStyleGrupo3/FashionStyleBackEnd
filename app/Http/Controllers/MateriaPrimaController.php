<?php

namespace App\Http\Controllers;

use App\Models\MateriaPrima;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MateriaPrimaController extends Controller
{
    /**
     * Display a listing of the materials.
     */
    public function index(Request $request)
    {
        $query = MateriaPrima::with(['categoria', 'unidadMedida']);

        // Filtros
        if ($request->has('activo')) {
            $query->where('activo', $request->boolean('activo'));
        }

        if ($request->has('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }

        if ($request->has('clasificacion')) {
            $query->where('clasificacion', $request->clasificacion);
        }

        if ($request->has('stock_bajo') && $request->boolean('stock_bajo')) {
            $query->stockBajo();
        }

        if ($request->has('buscar')) {
            $query->buscar($request->buscar);
        }

        $ordenarPor = $request->get('ordenar_por', 'id_material');
        $orden = $request->get('orden', 'desc');
        $query->orderBy($ordenarPor, $orden);

        $perPage = $request->get('per_page', 15);
        $materiales = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $materiales,
            'message' => 'Materiales obtenidos exitosamente'
        ], 200);
    }

    /**
     * Store a newly created material in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'codigo' => 'required|string|max:50|unique:materiales,codigo',
            'nombre' => 'required|string|max:100',
            'clasificacion' => 'required|in:materia_prima,insumo,producto_terminado,herramienta,equipo',
            'categoria_id' => 'required|exists:categorias,id',
            'stock' => 'required|integer|min:0',
            'stock_min' => 'required|integer|min:0',
            'costo_unitario' => 'required|numeric|min:0',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'unidad_medida_id' => 'required|exists:unidad_medidas,id',
            'activo' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Error de validación'
            ], 422);
        }

        $data = $request->except('imagen');

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('materiales', 'public');
            $data['imagen'] = $path;
        }

        $material = MateriaPrima::create($data);

        return response()->json([
            'success' => true,
            'data' => $material->load(['categoria', 'unidadMedida']),
            'message' => 'Material creado exitosamente'
        ], 201);
    }

    /**
     * Display the specified material.
     */
    public function show(int $id)
    {
        $material = MateriaPrima::with(['categoria', 'unidadMedida'])->find($id);

        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $material,
            'message' => 'Material obtenido exitosamente'
        ], 200);
    }

    /**
     * Update the specified material in storage.
     */
    public function update(Request $request, int $id)
    {
        $material = MateriaPrima::find($id);

        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'codigo' => 'sometimes|required|string|max:50|unique:materiales,codigo,' . $id . ',id_material',
            'nombre' => 'sometimes|required|string|max:100',
            'clasificacion' => 'sometimes|required|in:materia_prima,insumo,producto_terminado,herramienta,equipo',
            'categoria_id' => 'sometimes|required|exists:categorias,id',
            'stock' => 'sometimes|required|integer|min:0',
            'stock_min' => 'sometimes|required|integer|min:0',
            'costo_unitario' => 'sometimes|required|numeric|min:0',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'unidad_medida_id' => 'sometimes|required|exists:unidad_medidas,id',
            'activo' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Error de validación'
            ], 422);
        }

        $data = $request->except('imagen');

        if ($request->hasFile('imagen')) {
            if ($material->imagen && Storage::disk('public')->exists($material->imagen)) {
                Storage::disk('public')->delete($material->imagen);
            }
            
            $path = $request->file('imagen')->store('materiales', 'public');
            $data['imagen'] = $path;
        }

        $material->update($data);

        return response()->json([
            'success' => true,
            'data' => $material->load(['categoria', 'unidadMedida']),
            'message' => 'Material actualizado exitosamente'
        ], 200);
    }

    /**
     * Remove the specified material from storage.
     */
    public function destroy(int $id)
    {
        $material = MateriaPrima::find($id);

        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material no encontrado'
            ], 404);
        }

        if ($material->detallesVenta()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar el material porque tiene ventas asociadas'
            ], 400);
        }

        if ($material->imagen && Storage::disk('public')->exists($material->imagen)) {
            Storage::disk('public')->delete($material->imagen);
        }

        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Material eliminado exitosamente'
        ], 200);
    }

    /**
     * Update the stock of a material.
     */
    public function actualizarStock(Request $request, int $id)
    {
        $material = MateriaPrima::find($id);

        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'cantidad' => 'required|integer|not_in:0',
            'operacion' => 'required|in:aumentar,disminuir',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Error de validación'
            ], 422);
        }

        $cantidad = $request->cantidad;
        $operacion = $request->operacion;

        if ($operacion === 'disminuir') {
            if (!$material->hasStockDisponible($cantidad)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock insuficiente para realizar la operación'
                ], 400);
            }
            $material->disminuirStock($cantidad);
        } else {
            $material->aumentarStock($cantidad);
        }

        return response()->json([
            'success' => true,
            'data' => $material,
            'message' => "Stock {$operacion}do exitosamente"
        ], 200);
    }

    /**
     * Toggle the active status of a material.
     */
    public function toggleActivo(int $id)
    {
        $material = MateriaPrima::find($id);

        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material no encontrado'
            ], 404);
        }

        $material->activo = !$material->activo;
        $material->save();

        $estado = $material->activo ? 'activado' : 'desactivado';

        return response()->json([
            'success' => true,
            'data' => $material,
            'message' => "Material {$estado} exitosamente"
        ], 200);
    }

    /**
     * Get materials with low stock.
     */
    public function stockBajo()
    {
        $materiales = MateriaPrima::with(['categoria', 'unidadMedida'])
            ->stockBajo()
            ->activos()
            ->orderBy('stock', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $materiales,
            'message' => 'Materiales con stock bajo obtenidos exitosamente'
        ], 200);
    }

    /**
     * Get materials without stock.
     */
    public function sinStock()
    {
        $materiales = MateriaPrima::with(['categoria', 'unidadMedida'])
            ->where('stock', 0)
            ->activos()
            ->orderBy('nombre', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $materiales,
            'message' => 'Materiales sin stock obtenidos exitosamente'
        ], 200);
    }

    /**
     * Get materials by classification.
     */
    public function porClasificacion(string $clasificacion)
    {
        $materiales = MateriaPrima::with(['categoria', 'unidadMedida'])
            ->porClasificacion($clasificacion)
            ->activos()
            ->orderBy('nombre', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $materiales,
            'message' => "Materiales de clasificación {$clasificacion} obtenidos exitosamente"
        ], 200);
    }

    /**
     * Search materials.
     */
    public function buscar(Request $request)
    {
        $termino = $request->get('q', '');

        if (empty($termino)) {
            return response()->json([
                'success' => false,
                'message' => 'Término de búsqueda requerido'
            ], 400);
        }

        $materiales = MateriaPrima::with(['categoria', 'unidadMedida'])
            ->buscar($termino)
            ->activos()
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $materiales,
            'message' => 'Resultados de búsqueda obtenidos exitosamente'
        ], 200);
    }

    /**
     * Export materials to CSV.
     */
    public function exportarCSV()
    {
        $materiales = MateriaPrima::with(['categoria', 'unidadMedida'])->get();
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="materiales_' . date('Y-m-d') . '.csv"',
        ];

        $callback = function() use ($materiales) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, [
                'ID', 'Código', 'Nombre', 'Clasificación', 
                'Categoría', 'Stock', 'Stock Mínimo', 
                'Costo Unitario', 'Unidad Medida', 'Activo'
            ]);

            foreach ($materiales as $material) {
                fputcsv($file, [
                    $material->id_material,
                    $material->codigo,
                    $material->nombre,
                    $material->clasificacion,
                    $material->categoria->nombre ?? 'N/A',
                    $material->stock,
                    $material->stock_min,
                    $material->costo_unitario,
                    $material->unidadMedida->nombre ?? 'N/A',
                    $material->activo ? 'Sí' : 'No'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}