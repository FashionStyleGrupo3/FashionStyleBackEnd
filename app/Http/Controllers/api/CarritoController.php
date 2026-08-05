<?php

// Andres Mauricio Carvajal Vera 30/07/2026
namespace App\Http\Controllers\api;

use App\Http\Controllers\api\Controller;
use App\Models\CarritoDeCompras;
use App\Models\DetalleCarrito;
use App\Models\Producto;
use Illuminate\Http\Request;

class CarritoController extends Controller
{
    /**
     * Display the active cart for the authenticated user (Research/Retrieve).
     */
    public function index(Request $request)
    {
        // Find the user's active cart or create one if it doesn't exist
        $carrito = CarritoDeCompras::with(['detalles.producto', 'detalles.variante'])
            ->firstOrCreate(
                ['usuario_id' => $request->user()->id_usuario, 'estado' => 'Created'],
                ['sesion_id' => $request->session()->getId() ?? null]
            );

        // Cargar el total calculado
        $carrito->total = $this->calcularTotal($carrito);

        return response()->json([
            'success' => true,
            'carrito' => $carrito
        ]);
    }

    /**
     * Add a product to the cart (Add).
     */
    public function store(Request $request)
    {
        $request->validate([
            'producto_id' => 'required|exists:productos,id_producto',
            'producto_variante_id' => 'nullable|exists:productos_variantes,id_variante',
            'cantidad' => 'integer|min:1'
        ]);

        // Get the active cart
        $carrito = CarritoDeCompras::firstOrCreate(
            ['usuario_id' => $request->user()->id_usuario, 'estado' => 'Created'],
            ['sesion_id' => $request->session()->getId() ?? null]
        );

        // Check if this exact product (and variant) is already in the cart
        $detalle = DetalleCarrito::where('carrito_id', $carrito->id)
            ->where('producto_id', $request->producto_id)
            ->where('producto_variante_id', $request->producto_variante_id)
            ->first();

        // Get the product price
        $producto = Producto::find($request->producto_id);
        $precio = $producto->precio_venta;

        if ($detalle) {
            // Update existing detail
            $detalle->cantidad += $request->cantidad ?? 1;
            $detalle->save();
        } else {
            // Create new detail
            $carrito->detalles()->create([
                'producto_id' => $request->producto_id,
                'producto_variante_id' => $request->producto_variante_id,
                'cantidad' => $request->cantidad ?? 1,
                'precio' => $precio
            ]);
        }

        // Update the cart total
        $this->updateCartTotal($carrito);

        $carrito->load(['detalles.producto', 'detalles.variante']);

        return response()->json([
            'success' => true,
            'message' => 'Producto agregado al carrito exitosamente.',
            'carrito' => $carrito
        ]);
    }

    /**
     * Remove a specific item from the cart (Delete).
     */
    public function destroy(Request $request, $detalle_id)
    {
        $carrito = CarritoDeCompras::where('usuario_id', $request->user()->id_usuario)
            ->where('estado', 'Created')
            ->firstOrFail();

        // Find the specific item in the user's cart and delete it
        $detalle = DetalleCarrito::where('carrito_id', $carrito->id)
            ->where('id', $detalle_id)
            ->firstOrFail();
            
        $detalle->delete();

        // Update the cart total after removal
        $this->updateCartTotal($carrito);

        $carrito->load(['detalles.producto', 'detalles.variante']);

        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado del carrito.',
            'carrito' => $carrito
        ]);
    }

    /**
     * Helper function to recalculate the total price of the cart.
     */
    private function updateCartTotal(CarritoDeCompras $carrito)
    {
        $total = $carrito->detalles()->get()->sum(function ($detalle) {
            return $detalle->precio * $detalle->cantidad;
        });

        $carrito->update(['total' => $total]);
    }

    /**
     * Calculate the cart total without persisting.
     */
    private function calcularTotal(CarritoDeCompras $carrito)
    {
        return $carrito->detalles()->get()->sum(function ($detalle) {
            return $detalle->precio * $detalle->cantidad;
        });
    }
}