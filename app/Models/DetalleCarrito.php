<?php
// Andres Mauricio Carvajal Vera - 30/07/2026
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleCarrito extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'detalle_carrito';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'carrito_id',
        'producto_id',
        'producto_variante_id',
        'cantidad',
        'precio'
    ];

    /**
     * Get the shopping cart that owns this detail.
     */
    public function carrito(): BelongsTo
    {
        return $this->belongsTo(CarritoDeCompras::class, 'carrito_id');
    }

    /**
     * Get the product associated with this cart detail.
     */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    /**
     * Get the specific product variant (if any) associated with this cart detail.
     */
    public function variante(): BelongsTo
    {
        return $this->belongsTo(ProductoVariante::class, 'producto_variante_id');
    }
}