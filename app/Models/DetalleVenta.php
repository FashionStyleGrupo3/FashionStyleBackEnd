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
    protected $table = 'detalle_ventas';

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'id';

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = true;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'venta_id',
        'producto_id',
        'materia_prima_id',
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
        'venta_id' => 'integer',
        'producto_id' => 'integer',
        'materia_prima_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];


    /**
     * Get the sale that owns the detail.
     */
    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class, 'venta_id', 'id_venta');
    }

    /**
     * Get the product that owns the detail.
     */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'id_producto');
    }

    /**
     * Get the material that owns the detail.
     */
    public function materiaPrima(): BelongsTo
    {
        return $this->belongsTo(MateriaPrima::class, 'materia_prima_id', 'id_material');
    }


    /**
     * Scope to get details by sale.
     */
    public function scopePorVenta($query, $ventaId)
    {
        return $query->where('venta_id', $ventaId);
    }

    /**
     * Scope to get details by product.
     */
    public function scopePorProducto($query, $productoId)
    {
        return $query->where('producto_id', $productoId);
    }

    /**
     * Scope to get details by material.
     */
    public function scopePorMateriaPrima($query, $materiaPrimaId)
    {
        return $query->where('materia_prima_id', $materiaPrimaId);
    }

    /**
     * Calculate subtotal automatically.
     */
    public function calcularSubtotal(): float
    {
        return $this->cantidad * $this->precio_unitario;
    }

    /**
     * Get the formatted subtotal.
     */
    public function getSubtotalFormateadoAttribute(): string
    {
        return '$ ' . number_format($this->subtotal, 2);
    }

    /**
     * Get the formatted price.
     */
    public function getPrecioFormateadoAttribute(): string
    {
        return '$ ' . number_format($this->precio_unitario, 2);
    }

    /**
     * Get the item type (product or material).
     */
    public function getTipoItemAttribute(): string
    {
        if ($this->producto_id) {
            return 'producto';
        } elseif ($this->materia_prima_id) {
            return 'materia_prima';
        }
        return 'desconocido';
    }

    /**
     * Get the item name.
     */
    public function getNombreItemAttribute(): string
    {
        if ($this->producto_id && $this->producto) {
            return $this->producto->nombre;
        } elseif ($this->materia_prima_id && $this->materiaPrima) {
            return $this->materiaPrima->nombre;
        }
        return 'N/A';
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($detalle) {

            if (isset($detalle->cantidad) && isset($detalle->precio_unitario)) {
                $detalle->subtotal = $detalle->cantidad * $detalle->precio_unitario;
            }
        });

        static::updating(function ($detalle) {

            if (isset($detalle->cantidad) && isset($detalle->precio_unitario)) {
                $detalle->subtotal = $detalle->cantidad * $detalle->precio_unitario;
            }
        });
    }
}