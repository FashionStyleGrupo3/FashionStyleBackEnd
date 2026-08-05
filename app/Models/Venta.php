<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venta extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'ventas';

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'id_venta';

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = true;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'cliente_id',
        'usuario_id',
        'fecha_venta',
        'total',
        'estado',
        'metodo_pago',
        'observaciones',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'total' => 'decimal:2',
        'fecha_venta' => 'datetime',
        'cliente_id' => 'integer',
        'usuario_id' => 'integer',
    ];

    // ==================== RELACIONES ====================

    /**
     * Get the client that owns the sale.
     */
    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cliente_id', 'id_cliente');
    }

    /**
     * Get the user that created the sale.
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id', 'id_usuario');
    }

    /**
     * Get the details of the sale.
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleVenta::class, 'venta_id', 'id_venta');
    }

    // ==================== SCOPES ====================

    /**
     * Scope to filter by status.
     */
    public function scopePorEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Scope to filter by date range.
     */
    public function scopeFechaEntre($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('fecha_venta', [$fechaInicio, $fechaFin]);
    }

    /**
     * Scope to filter by client.
     */
    public function scopePorCliente($query, $clienteId)
    {
        return $query->where('cliente_id', $clienteId);
    }

    /**
     * Scope to filter by payment method.
     */
    public function scopePorMetodoPago($query, $metodoPago)
    {
        return $query->where('metodo_pago', $metodoPago);
    }

    // ==================== MÉTODOS DE UTILIDAD ====================

    /**
     * Calculate total from details.
     */
    public function calcularTotal(): float
    {
        return $this->detalles()->sum('subtotal');
    }

    /**
     * Update total from details.
     */
    public function actualizarTotal(): bool
    {
        $this->total = $this->calcularTotal();
        return $this->save();
    }

    /**
     * Get the formatted total.
     */
    public function getTotalFormateadoAttribute(): string
    {
        return '$ ' . number_format($this->total, 2);
    }

    /**
     * Get the status label.
     */
    public function getEstadoTextoAttribute(): string
    {
        $estados = [
            'pendiente' => 'Pendiente',
            'completada' => 'Completada',
            'cancelada' => 'Cancelada',
            'entregada' => 'Entregada',
        ];
        return $estados[$this->estado] ?? $this->estado;
    }

    /**
     * Get the payment method label.
     */
    public function getMetodoPagoTextoAttribute(): string
    {
        $metodos = [
            'efectivo' => 'Efectivo',
            'tarjeta' => 'Tarjeta',
            'transferencia' => 'Transferencia',
            'credito' => 'Crédito',
        ];
        return $metodos[$this->metodo_pago] ?? $this->metodo_pago;
    }

    /**
     * Check if sale is completable (has details).
     */
    public function isCompletable(): bool
    {
        return $this->detalles()->count() > 0;
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($venta) {
            if (empty($venta->fecha_venta)) {
                $venta->fecha_venta = now();
            }
            if (empty($venta->estado)) {
                $venta->estado = 'pendiente';
            }
        });
    }
}