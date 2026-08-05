<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Importaciones de Controladores
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\PromocionController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\VentaController;
use App\Http\Controllers\CarritoController;
use App\Http\Controllers\DetalleCarritoController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [UsuarioController::class, 'register']);
Route::get('/productos', [ProductoController::class, 'index']);
Route::get('/productos/{id}', [ProductoController::class, 'show']);
Route::get('/categorias', [CategoriaController::class, 'index']);

// --- 2. RUTAS PROTEGIDAS (Requieren Login) ---
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Perfil del usuario
    Route::get('/me', function (Request $request) {
        $user = $request->user();
        return [
            'user' => $user,
            'roles' => $user->getRoleNames(),
        ];
    });

    // Gestión de Usuarios y Clientes
    Route::apiResource('usuarios', UsuarioController::class);
    Route::apiResource('clientes', ClienteController::class);
    
    // Carrito de compras
    Route::get('/carrito', [CarritoController::class, 'index']);
    Route::post('/carrito', [CarritoController::class, 'store']);
    Route::put('/detalle-carrito/{id}', [DetalleCarritoController::class, 'update']);
    Route::delete('/detalle-carrito/{id}', [DetalleCarritoController::class, 'destroy']);

    // Pedidos y Ventas
    Route::apiResource('pedidos', PedidoController::class);
    Route::apiResource('ventas', VentaController::class);

    // --- 3. RUTAS DE ADMINISTRADOR / EMPLEADO ---
    Route::middleware('role:admin|empleado')->group(function () {
        Route::apiResource('inventarios', InventarioController::class);
        Route::apiResource('proveedores', ProveedorController::class);
        Route::apiResource('promociones', PromocionController::class);
        Route::apiResource('catalogos', CatalogoController::class);
        
        // Asignación manual de roles
        Route::post('/usuarios/{id}/asignar-rol', function (Request $request, $id) {
            $request->validate(['rol' => 'required|string|exists:roles,name']);
            $user = App\Models\User::findOrFail($id);
            $user->syncRoles([$request->rol]);
            return ['message' => 'Rol asignado correctamente', 'roles' => $user->getRoleNames()];
        });
    });
});
