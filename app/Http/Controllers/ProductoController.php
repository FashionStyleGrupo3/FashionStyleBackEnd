<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{

    public function index()
    {
        return Producto::all();
    }

    public function store(Request $request)
    {

        $producto = Producto::create($request->all());

        return response()->json($producto, 201);

    }

    public function show($id)
    {
        return Producto::findOrFail($id);
    }

    public function update(Request $request, $id)
    {

        $producto = Producto::findOrFail($id);

        $producto->update($request->all());

        return response()->json($producto);

    }

    public function destroy($id)
    {

        Producto::destroy($id);

        return response()->json([
            "mensaje" => "Producto eliminado"
        ]);

    }

}