<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductoController;
<<<<<<< HEAD
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\PromocionController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\UsuarioController;
=======
use App\Http\Controllers\InventarioController;
>>>>>>> origin/ErickBackEnd
use App\Http\Controllers\VentaController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);

// ============================================
// RUTAS DE INVENTARIO (TODAS)
// ============================================
Route::get('/inventario', [InventarioController::class, 'index']);           // GET - Listar
Route::post('/inventario', [InventarioController::class, 'store']);          // POST - Crear
Route::get('/inventario/{id}', [InventarioController::class, 'show']);       // GET - Ver uno
Route::put('/inventario/{id}', [InventarioController::class, 'update']);     // PUT - Actualizar
Route::delete('/inventario/{id}', [InventarioController::class, 'destroy']); // DELETE - Eliminar
Route::get('/inventario/resumen', [InventarioController::class, 'resumen']); // GET - Resumen
Route::get('/inventario/tipo/{tipo}', [InventarioController::class, 'porTipo']); // GET - Por tipo

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

Route::apiResource('productos', ProductoController::class);
<<<<<<< HEAD
Route::apiResource('clientes', ClienteController::class);
Route::apiResource('categorias', CategoriaController::class);
Route::apiResource('catalogos', CatalogoController::class);
Route::apiResource('inventarios', InventarioController::class);
Route::apiResource('pedidos', PedidoController::class);
Route::apiResource('promociones', PromocionController::class);
Route::apiResource('proveedores', ProveedorController::class);
Route::apiResource('usuarios', UsuarioController::class);
=======
>>>>>>> origin/ErickBackEnd
Route::apiResource('ventas', VentaController::class);