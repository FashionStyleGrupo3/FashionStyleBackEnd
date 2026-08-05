<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\ProductoController;
use App\Http\Controllers\api\ClienteController;
use App\Http\Controllers\api\CategoriaController;
use App\Http\Controllers\api\CatalogoController;
use App\Http\Controllers\api\PedidoController;
use App\Http\Controllers\api\PromocionController;
use App\Http\Controllers\api\ProveedorController;
use App\Http\Controllers\api\UsuarioController;
use App\Http\Controllers\api\InventarioController;
use App\Http\Controllers\api\VentaController;
use App\Http\Controllers\api\CarritoController;
use App\Http\Controllers\api\DetalleCarritoController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);
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
                'rol' => 'required|string|exists:roles,name'
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


    // Ver el carrito y sus detalles (Research / Retrieve)
    Route::get('/carrito', [CarritoController::class, 'index']);
    
    // Agregar un nuevo producto al carrito (Add)
    Route::post('/carrito', [CarritoController::class, 'store']);
    
    // Actualizar la cantidad de un producto que ya está en el carrito
    Route::put('/detalle-carrito/{id}', [DetalleCarritoController::class, 'update']);
    
    // Eliminar un producto específico del carrito (Delete)
    Route::delete('/detalle-carrito/{id}', [DetalleCarritoController::class, 'destroy']);
    
});

Route::apiResource('productos', ProductoController::class);
Route::apiResource('clientes', ClienteController::class);
Route::apiResource('categorias', CategoriaController::class);
Route::apiResource('catalogos', CatalogoController::class);
Route::apiResource('inventarios', InventarioController::class);
Route::apiResource('pedidos', PedidoController::class);
Route::apiResource('promociones', PromocionController::class);
Route::apiResource('proveedores', ProveedorController::class);
Route::apiResource('usuarios', UsuarioController::class);
Route::apiResource('ventas', VentaController::class);

// Rutas públicas
Route::apiResource('productos', ProductoController::class);

