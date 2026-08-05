<?php

namespace App\Http\Controllers\api;

use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index()
    {
        return Categoria::with('productos')->get();
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:50|unique:categorias,nombre',
            'descripcion' => 'nullable|string',
            'activa' => 'boolean',
        ]);

        $categoria = Categoria::create($datos);

        return response()->json($categoria->load('productos'), 201);
    }

    public function show(Categoria $categoria)
    {
        return $categoria->load('productos');
    }

    public function update(Request $request, Categoria $categoria)
    {
        $datos = $request->validate([
            'nombre' => 'sometimes|required|string|max:50|unique:categorias,nombre,' . $categoria->id_categoria . ',id_categoria',
            'descripcion' => 'nullable|string',
            'activa' => 'boolean',
        ]);

        $categoria->update($datos);

        return response()->json($categoria->load('productos'));
    }

    public function destroy(Categoria $categoria)
    {
        $categoria->delete();

        return response()->json([
            'mensaje' => 'Categoría eliminada correctamente',
        ]);
    }
}