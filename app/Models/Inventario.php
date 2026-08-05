<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
<<<<<<< HEAD
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventario extends Model
{
    use HasFactory;

    protected $table = 'inventarios';
    protected $primaryKey = 'ID_Inventario'; 
    public $timestamps = false;

    protected $fillable = [
        'producto_id',
        'materia_prima_id',
=======

class Inventario extends Model
{
    /** @use HasFactory<\Database\Factories\InventarioFactory> */
    use HasFactory;

    protected $fillable = [
        'producto_id',
>>>>>>> a0ccae56a2448c859b8df04148bb599b4068acab
        'usuario_id',
        'tipo_movimiento',
        'concepto',
        'observaciones',
        'cantidad',
        'fecha_registro',
        'costo_unitario',
        'costo_total',
        'estado',
        'diferencia',
<<<<<<< HEAD
];

    protected $casts = [
        'fecha_registro' => 'datetime',
        'cantidad' => 'integer',
        'producto_id' => 'integer',
        'materia_prima_id' => 'integer',
        'usuario_id' => 'integer',
        'costo_unitario' => 'decimal:2',
        'costo_total' => 'decimal:2',
        'diferencia' => 'integer',
    ];

    // ==================== RELACIONES ====================

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'id_producto');
        // Ajusta 'id_producto' según tu tabla productos
    }

    public function materiaPrima(): BelongsTo
    {
        return $this->belongsTo(MateriaPrima::class, 'materia_prima_id', 'id_material');
        
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id', 'id_usuario');
        
    }

    // ==================== SCOPES ====================

    public function scopeTipoMovimiento($query, $tipo)
    {
        return $query->where('tipo_movimiento', $tipo); 
    }

    public function scopeFechaEntre($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('fecha_registro', [$fechaInicio, $fechaFin]); 
    }

    
=======
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'id_producto');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id', 'id_usuario');
    }
>>>>>>> a0ccae56a2448c859b8df04148bb599b4068acab
}