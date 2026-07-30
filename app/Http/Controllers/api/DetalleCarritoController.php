<?php
// Andres Mauricio Carvajal Vera
namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\DetalleCarrito;
use Illuminate\Http\Request;

class DetalleCarritoController extends Controller
{
    /**
     * Update the quantity of a specific item already in the cart.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'cantidad' => 'required|integer|min:1'
        ]);

        // Find the specific detail record and load its parent cart
        $detalle = DetalleCarrito::with('carrito')->findOrFail($id);

        // Security check: Ensure the cart actually belongs to the authenticated user
        if ($detalle->carrito->usuario_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado para modificar este carrito.'
            ], 403);
        }

        // Update the quantity
        $detalle->cantidad = $request->cantidad;
        $detalle->save();

        // Recalculate the total for the parent cart
        $this->updateCartTotal($detalle->carrito);

        return response()->json([
            'success' => true,
            'message' => 'Cantidad actualizada correctamente.',
            'detalle' => $detalle
        ]);
    }

    /**
     * Remove a specific item from the cart directly via its ID.
     * (You can use this instead of the destroy method in CarritoController).
     */
    public function destroy(Request $request, $id)
    {
        $detalle = DetalleCarrito::with('carrito')->findOrFail($id);

        // Security check
        if ($detalle->carrito->usuario_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado para modificar este carrito.'
            ], 403);
        }

        // Keep a reference to the parent cart before deleting the detail
        $carrito = $detalle->carrito;
        
        $detalle->delete();

        // Recalculate the total for the parent cart
        $this->updateCartTotal($carrito);

        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado del carrito.'
        ]);
    }

    /**
     * Helper function to recalculate the total price of the main cart.
     */
    private function updateCartTotal($carrito)
    {
        $total = $carrito->detalles()->get()->sum(function ($item) {
            return $item->precio * $item->cantidad;
        });

        $carrito->update(['total' => $total]);
    }
}