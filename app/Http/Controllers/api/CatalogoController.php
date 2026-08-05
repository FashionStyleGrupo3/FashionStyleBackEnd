<?php

namespace App\Http\Controllers\api;

use App\Models\Catalogo;
use Illuminate\Http\Request;

class CatalogoController extends Controller
{
    public function index()
    {
        return Catalogo::with('productos')->get();
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:255|unique:catalogos,nombre',
            'descripcion' => 'nullable|string',
            'activo' => 'boolean',
        ]);

        $catalogo = Catalogo::create($datos);

        return response()->json($catalogo->load('productos'), 201);
    }

    public function show(Catalogo $catalogo)
    {
        return $catalogo->load('productos');
    }

    public function update(Request $request, Catalogo $catalogo)
    {
        $datos = $request->validate([
            'nombre' => 'sometimes|required|string|max:255|unique:catalogos,nombre,' . $catalogo->id_catalogo . ',id_catalogo',
            'descripcion' => 'nullable|string',
            'activo' => 'boolean',
        ]);

        $catalogo->update($datos);

        return response()->json($catalogo->load('productos'));
    }

    public function destroy(Catalogo $catalogo)
    {
        $catalogo->delete();

        return response()->json([
            'mensaje' => 'Catálogo eliminado correctamente',
        ]);
    }
}