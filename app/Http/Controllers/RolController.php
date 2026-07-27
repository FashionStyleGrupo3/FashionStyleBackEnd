<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use Illuminate\Http\Request;

class RolController extends Controller
{
    public function index()
    {
        return Rol::all();
    }

    public function store(Request $request)
    {
        return Rol::create($request->all());
    }

    public function show($id)
    {
        return Rol::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $rol = Rol::findOrFail($id);

        $rol->update($request->all());

        return $rol;
    }

    public function destroy($id)
    {
        Rol::destroy($id);

        return response()->json([
            "mensaje" => "Rol eliminado"
        ]);
    }
}