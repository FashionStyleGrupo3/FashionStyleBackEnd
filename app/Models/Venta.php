<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venta extends Model
{
    use HasFactory;

<<<<<<< HEAD
    protected $fillable = [
        'numero_comprobante',
        'pedido_id',
        'usuario_id',
        'descripcion',
        'categoria',
        'notas',
        'fecha_venta',
        'monto_total',
        'medio_pago',
        'estado',
        'cancelada',
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id', 'id_usuario');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleVenta::class, 'venta_id');
=======
    /**
     * The table associated with the model.
     */
    protected $table = 'ventas';

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'ID_Venta';

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'Numero_Comprobante',
        'ID_Usuario',
        'Descripcion',
        'Categoria',
        'Notas',
        'Fecha_Venta',
        'Monto_Total',
        'Medio_Pago',
        'Estado',
        'Cancelada',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'Fecha_Venta' => 'datetime',
        'Monto_Total' => 'decimal:2',
        'Cancelada' => 'boolean',
        'ID_Usuario' => 'integer',
    ];

    // ==================== RELACIONES ====================

    /**
     * Get the user who made the sale.
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ID_Usuario', 'id');
    }

    /**
     * Get the sale details (items sold).
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleVenta::class, 'ID_Venta', 'ID_Venta');
    }

    // ==================== SCOPES ====================

    /**
     * Scope to filter by status.
     */
    public function scopeEstado($query, $estado)
    {
        return $query->where('Estado', $estado);
    }

    /**
     * Scope to filter by payment method.
     */
    public function scopeMedioPago($query, $medio)
    {
        return $query->where('Medio_Pago', $medio);
    }

    /**
     * Scope to filter by date range.
     */
    public function scopeFechaEntre($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('Fecha_Venta', [$fechaInicio, $fechaFin]);
    }

    /**
     * Scope to get only active sales (not canceled).
     */
    public function scopeActivas($query)
    {
        return $query->where('Cancelada', false);
    }

    /**
     * Scope to get canceled sales.
     */
    public function scopeCanceladas($query)
    {
        return $query->where('Cancelada', true);
    }

    /**
     * Scope to filter by category.
     */
    public function scopeCategoria($query, $categoria)
    {
        return $query->where('Categoria', $categoria);
    }

    // ==================== MÉTODOS DE VERIFICACIÓN ====================

    /**
     * Check if the sale is canceled.
     */
    public function isCancelada(): bool
    {
        return (bool) $this->Cancelada;
    }

    /**
     * Check if the sale is active.
     */
    public function isActiva(): bool
    {
        return !$this->isCancelada();
    }

    /**
     * Check if the sale is pending.
     */
    public function isPendiente(): bool
    {
        return $this->Estado === 'pendiente';
    }

    /**
     * Check if the sale is completed.
     */
    public function isCompletada(): bool
    {
        return $this->Estado === 'completada';
    }

    /**
     * Check if the sale is in process.
     */
    public function isEnProceso(): bool
    {
        return $this->Estado === 'en_proceso';
    }

    // ==================== MÉTODOS DE CÁLCULO ====================

    /**
     * Get the status label in Spanish.
     */
    public function getEstadoTextoAttribute(): string
    {
        $estados = [
            'pendiente' => 'Pendiente',
            'en_proceso' => 'En Proceso',
            'completada' => 'Completada',
            'cancelada' => 'Cancelada',
        ];
        return $estados[$this->Estado] ?? $this->Estado;
    }

    /**
     * Get the payment method label in Spanish.
     */
    public function getMedioPagoTextoAttribute(): string
    {
        $medios = [
            'efectivo' => 'Efectivo',
            'tarjeta' => 'Tarjeta',
            'transferencia' => 'Transferencia',
            'credito' => 'Crédito',
            'debito' => 'Débito',
        ];
        return $medios[$this->Medio_Pago] ?? $this->Medio_Pago;
    }

    /**
     * Get formatted total.
     */
    public function getMontoTotalFormateadoAttribute(): string
    {
        return '$ ' . number_format($this->Monto_Total, 2);
    }

    /**
     * Get a short summary of the sale.
     */
    public function getResumenAttribute(): string
    {
        return "Venta #{$this->Numero_Comprobante} - {$this->getEstadoTextoAttribute()} - {$this->getMontoTotalFormateadoAttribute()}";
>>>>>>> origin/ErickBackEnd
    }
}