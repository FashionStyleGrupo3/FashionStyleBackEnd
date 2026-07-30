<?php

namespace App\Http\Controllers;

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
        return Producto::with(['categoria', 'catalogo', 'variantes', 'imagenes'])->get();
    }

    public function store(Request $request)
    {
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

        return response()->json(
            $producto->load('variantes', 'imagenes'),
            201
        );
    }

    public function show($id)
    {
        return Producto::with(['categoria', 'catalogo', 'variantes', 'imagenes'])
            ->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
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

        return response()->json($producto->load('variantes', 'imagenes'));
    }

    public function destroy($id)
    {
        $producto = Producto::findOrFail($id);


        foreach ($producto->imagenes as $imagen) {
            Storage::disk('public')->delete($imagen->ruta);
        }

        $producto->delete(); 

        return response()->json([
            'mensaje' => 'Producto eliminado',
        ]);
    }

   

    public function storeVariante(Request $request, $productoId)
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

    public function updateVariante(Request $request, $varianteId)
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

    public function destroyVariante($varianteId)
    {
        ProductoVariante::findOrFail($varianteId)->delete();

        return response()->json(['mensaje' => 'Variante eliminada']);
    }


    public function storeImagen(Request $request, $productoId)
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

    public function destroyImagen($imagenId)
    {
        $imagen = ProductoImagen::findOrFail($imagenId);

        Storage::disk('public')->delete($imagen->ruta);
        $imagen->delete();

        return response()->json(['mensaje' => 'Imagen eliminada']);
    }
}