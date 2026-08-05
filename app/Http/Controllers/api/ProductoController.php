<?php

namespace App\Http\Controllers\api;

use App\Models\Producto;
use App\Models\ProductoImagen;
use App\Models\ProductoVariante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductoController extends Controller
{
    public function index()
    {
        try {
            $productos = Producto::with(['categoria', 'catalogo', 'variantes', 'imagenes'])->get();
            return response()->json([
                'success' => true,
                'message' => 'Productos obtenidos correctamente',
                'data' => $productos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener productos: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $datos = $request->validate([
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'precio_venta' => 'required|numeric|min:0',
                'categoria_id' => 'nullable|exists:categorias,id_categoria',
                'catalogo_id' => 'nullable|exists:catalogos,id_catalogo',
                'activo' => 'boolean',
                'publicado' => 'boolean',

                'variantes' => 'array',
                'variantes.*.talla' => 'required_with:variantes|string|max:20',
                'variantes.*.color' => 'required_with:variantes|string|max:50',
                'variantes.*.stock' => 'integer|min:0',
                'variantes.*.sku' => 'nullable|string|max:100|unique:productos_variantes,sku',
            ]);

            $producto = DB::transaction(function () use ($datos) {
                $producto = Producto::create(collect($datos)->except('variantes')->toArray());

                foreach ($datos['variantes'] ?? [] as $variante) {
                    $producto->variantes()->create($variante);
                }

                return $producto;
            });

            return response()->json([
                'success' => true,
                'message' => 'Producto creado exitosamente',
                'data' => $producto->load('variantes', 'imagenes')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear producto: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(int $id)
    {
        try {
            $producto = Producto::with(['categoria', 'catalogo', 'variantes', 'imagenes'])
                ->findOrFail($id);
            return response()->json([
                'success' => true,
                'message' => 'Producto obtenido correctamente',
                'data' => $producto
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener producto: ' . $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, int $id)
    {
        try {
            $producto = Producto::findOrFail($id);

            $datos = $request->validate([
                'nombre' => 'sometimes|required|string|max:255',
                'descripcion' => 'nullable|string',
                'precio_venta' => 'sometimes|required|numeric|min:0',
                'categoria_id' => 'nullable|exists:categorias,id_categoria',
                'catalogo_id' => 'nullable|exists:catalogos,id_catalogo',
                'activo' => 'boolean',
                'publicado' => 'boolean',
            ]);

            $producto->update($datos);

            return response()->json([
                'success' => true,
                'message' => 'Producto actualizado correctamente',
                'data' => $producto->load('variantes', 'imagenes')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar producto: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $producto = Producto::findOrFail($id);


            foreach ($producto->imagenes as $imagen) {
                Storage::disk('public')->delete($imagen->ruta);
            }

            $producto->delete();

            return response()->json([
                'success' => true,
                'message' => 'Producto eliminado correctamente'
            ]);
        }
        catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar producto: ' . $e->getMessage()
            ], 500);
        }
    }


    public function storeVariante(Request $request, int $productoId)
    {
        $producto = Producto::findOrFail($productoId);

        $datos = $request->validate([
            'talla' => 'required|string|max:20',
            'color' => 'required|string|max:50',
            'stock' => 'integer|min:0',
            'sku' => 'nullable|string|max:100|unique:productos_variantes,sku',
        ]);

        $variante = $producto->variantes()->create($datos);

        return response()->json($variante, 201);
    }

    public function updateVariante(Request $request, int $varianteId)
    {
        $variante = ProductoVariante::findOrFail($varianteId);

        $datos = $request->validate([
            'talla' => 'sometimes|required|string|max:20',
            'color' => 'sometimes|required|string|max:50',
            'stock' => 'integer|min:0',
            'sku' => 'nullable|string|max:100|unique:productos_variantes,sku,' . $variante->id_variante . ',id_variante',
        ]);

        $variante->update($datos);

        return response()->json($variante);
    }

    public function destroyVariante(int $varianteId)
    {
        ProductoVariante::findOrFail($varianteId)->delete();

        return response()->json(['mensaje' => 'Variante eliminada']);
    }


    public function storeImagen(Request $request, int $productoId)
    {
        $producto = Producto::findOrFail($productoId);

        $request->validate([
            'imagen' => 'required|image|max:4096',
            'color' => 'nullable|string|max:50',
            'es_principal' => 'boolean',
            'orden' => 'integer|min:0',
        ]);

        $ruta = $request->file('imagen')->store('productos', 'public');

        $imagen = $producto->imagenes()->create([
            'color' => $request->color,
            'ruta' => $ruta,
            'es_principal' => $request->boolean('es_principal'),
            'orden' => $request->integer('orden', 0),
        ]);

        return response()->json($imagen, 201);
    }

    public function destroyImagen(int $imagenId)
    {
        $imagen = ProductoImagen::findOrFail($imagenId);

        Storage::disk('public')->delete($imagen->ruta);
        $imagen->delete();

        return response()->json(['mensaje' => 'Imagen eliminada']);
    }
}