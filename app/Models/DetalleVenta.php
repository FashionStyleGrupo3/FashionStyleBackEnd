<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleVenta extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'detalle_venta';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'venta_id',
        'producto_id',
        'cantidad',
        'precio_unitario',
        'subtotal',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'cantidad' => 'integer',
        'precio_unitario' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    // ==================== RELACIONES ====================

    /**
     * Get the sale (venta) that owns this detail.
     */
    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class, 'venta_id', 'ID_Venta');
    }

    /**
     * Get the product associated with this detail.
     */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'id_producto');
    }

    // ==================== MÉTODOS DE CÁLCULO ====================

    /**
     * Get the formatted unit price.
     */
    public function getPrecioUnitarioFormateadoAttribute(): string
    {
        return '$ ' . number_format($this->precio_unitario, 2);
    }

    /**
     * Get the formatted subtotal.
     */
    public function getSubtotalFormateadoAttribute(): string
    {
        return '$ ' . number_format($this->subtotal, 2);
    }

    /**
     * Get a short summary of the detail.
     */
    public function getResumenAttribute(): string
    {
        $producto = $this->producto->nombre ?? 'Producto #' . $this->producto_id;
        return "{$this->cantidad} x {$producto} - {$this->getSubtotalFormateadoAttribute()}";
    }
}