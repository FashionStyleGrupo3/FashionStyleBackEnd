<?php

namespace App\Http\Controllers;

use App\Models\UnidadMedida;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UnidadMedidaController extends Controller
{
    /**
     * Display a listing of the units of measure.
     */
    public function index(Request $request)
    {
        try {
            $query = UnidadMedida::query();

            if ($request->has('activa')) {
                $query->where('activa', $request->boolean('activa'));
            }

            if ($request->has('buscar')) {
                $query->buscar($request->buscar);
            }

            $ordenarPor = $request->get('ordenar_por', 'nombre');
            $orden = $request->get('orden', 'asc');
            $query->orderBy($ordenarPor, $orden);

            $perPage = $request->get('per_page', 15);
            $unidades = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $unidades,
                'message' => 'Unidades de medida obtenidas correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener unidades de medida: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created unit of measure.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:50|unique:unidades_medida,nombre',
                'abreviatura' => 'required|string|max:10|unique:unidades_medida,abreviatura',
                'activa' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Error de validación'
                ], 422);
            }

            $unidad = UnidadMedida::create([
                'nombre' => $request->nombre,
                'abreviatura' => $request->abreviatura,
                'activa' => $request->get('activa', true),
            ]);

            return response()->json([
                'success' => true,
                'data' => $unidad,
                'message' => 'Unidad de medida creada correctamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear unidad de medida: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified unit of measure.
     */
    public function show($id)
    {
        try {
            $unidad = UnidadMedida::find($id);

            if (!$unidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unidad de medida no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $unidad,
                'message' => 'Unidad de medida obtenida correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener unidad de medida: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified unit of measure.
     */
    public function update(Request $request, $id)
    {
        try {
            $unidad = UnidadMedida::find($id);

            if (!$unidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unidad de medida no encontrada'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'sometimes|required|string|max:50|unique:unidades_medida,nombre,' . $id,
                'abreviatura' => 'sometimes|required|string|max:10|unique:unidades_medida,abreviatura,' . $id,
                'activa' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Error de validación'
                ], 422);
            }

            $unidad->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $unidad,
                'message' => 'Unidad de medida actualizada correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar unidad de medida: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified unit of measure.
     */
    public function destroy($id)
    {
        try {
            $unidad = UnidadMedida::find($id);

            if (!$unidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unidad de medida no encontrada'
                ], 404);
            }

            if ($unidad->materiales()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar la unidad de medida porque tiene materiales asociados'
                ], 400);
            }

            $unidad->delete();

            return response()->json([
                'success' => true,
                'message' => 'Unidad de medida eliminada correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar unidad de medida: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle the active status of a unit of measure.
     */
    public function toggleActiva($id)
    {
        try {
            $unidad = UnidadMedida::find($id);

            if (!$unidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unidad de medida no encontrada'
                ], 404);
            }

            $unidad->toggleActiva();
            $estado = $unidad->activa ? 'activada' : 'desactivada';

            return response()->json([
                'success' => true,
                'data' => $unidad,
                'message' => "Unidad de medida {$estado} correctamente"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado de unidad de medida: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all active units (for dropdowns).
     */
    public function activas()
    {
        try {
            $unidades = UnidadMedida::activas()
                ->orderBy('nombre', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $unidades,
                'message' => 'Unidades de medida activas obtenidas correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener unidades de medida activas: ' . $e->getMessage()
            ], 500);
        }
    }
}
