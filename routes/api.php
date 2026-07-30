// Andres Mauricio Carvajal Vera
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductoController;
// Import your new Cart controllers
use App\Http\Controllers\api\CarritoController;
use App\Http\Controllers\api\DetalleCarritoController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

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

// Rutas públicas
Route::apiResource('productos', ProductoController::class);