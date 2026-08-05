<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\VentaController;
use App\Http\Controllers\MateriaPrimaController;
use App\Http\Controllers\UnidadMedidaController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);

Route::prefix('inventario')->group(function () {
    Route::get('/', [InventarioController::class, 'index']);
    Route::post('/', [InventarioController::class, 'store']);
    Route::get('/{id}', [InventarioController::class, 'show']);
    Route::put('/{id}', [InventarioController::class, 'update']);
    Route::delete('/{id}', [InventarioController::class, 'destroy']);
    Route::get('/resumen', [InventarioController::class, 'resumen']);
    Route::get('/tipo/{tipo}', [InventarioController::class, 'porTipo']);
});

Route::prefix('materia-prima')->group(function () {
    Route::get('/', [MateriaPrimaController::class, 'index']);
    Route::post('/', [MateriaPrimaController::class, 'store']);
    Route::get('/{id}', [MateriaPrimaController::class, 'show']);
    Route::put('/{id}', [MateriaPrimaController::class, 'update']);
    Route::delete('/{id}', [MateriaPrimaController::class, 'destroy']);
    Route::patch('/{id}/stock', [MateriaPrimaController::class, 'actualizarStock']);
    Route::patch('/{id}/toggle', [MateriaPrimaController::class, 'toggleActivo']);
    Route::get('/stock/bajo', [MateriaPrimaController::class, 'stockBajo']);
    Route::get('/stock/cero', [MateriaPrimaController::class, 'sinStock']);
    Route::get('/clasificacion/{clasificacion}', [MateriaPrimaController::class, 'porClasificacion']);
    Route::get('/buscar', [MateriaPrimaController::class, 'buscar']);
    Route::get('/exportar/csv', [MateriaPrimaController::class, 'exportarCSV']);
});

Route::prefix('productos')->group(function () {
    Route::get('/', [ProductoController::class, 'index']);
    Route::post('/', [ProductoController::class, 'store']);
    Route::get('/{id}', [ProductoController::class, 'show']);
    Route::put('/{id}', [ProductoController::class, 'update']);
    Route::delete('/{id}', [ProductoController::class, 'destroy']);
    Route::patch('/{id}/stock', [ProductoController::class, 'actualizarStock']);
    Route::patch('/{id}/toggle', [ProductoController::class, 'toggleActivo']);
    Route::get('/stock/bajo', [ProductoController::class, 'stockBajo']);
});

Route::prefix('unidades-medida')->group(function () {
    Route::get('/', [UnidadMedidaController::class, 'index']);
    Route::post('/', [UnidadMedidaController::class, 'store']);
    Route::get('/activas', [UnidadMedidaController::class, 'activas']);
    Route::get('/{id}', [UnidadMedidaController::class, 'show']);
    Route::put('/{id}', [UnidadMedidaController::class, 'update']);
    Route::delete('/{id}', [UnidadMedidaController::class, 'destroy']);
    Route::patch('/{id}/toggle', [UnidadMedidaController::class, 'toggleActiva']);
});

Route::prefix('ventas')->group(function () {
    Route::get('/', [VentaController::class, 'index']);
    Route::post('/', [VentaController::class, 'store']);
    Route::get('/{id}', [VentaController::class, 'show']);
    Route::put('/{id}', [VentaController::class, 'update']);
    Route::delete('/{id}', [VentaController::class, 'destroy']);
    Route::get('/resumen', [VentaController::class, 'resumen']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', function (Request $request) {
        $user = $request->user();
        $roles = $user->getRoleNames();
        $user->makeHidden('roles');

        return [
            'user' => $user,
            'roles' => $roles,
        ];
    });
    
    Route::middleware('role:admin')->group(function () {
        Route::post('/usuarios/{id}/asignar-rol', function (Request $request, $id) {
            $request->validate([
                'rol' => 'required|string|exists:roles,name',
            ]);

            $user = App\Models\User::findOrFail($id);
            $user->syncRoles([$request->rol]);

            return [
                'message' => 'Rol asignado correctamente',
                'usuario' => $user->nombre,
                'roles' => $user->getRoleNames(),
            ];
        });
    });
});