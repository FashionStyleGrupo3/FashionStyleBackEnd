<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventario extends Model
{
    use HasFactory;

    protected $table = 'inventarios';
    protected $primaryKey = 'id'; 
    public $timestamps = false;

    protected $fillable = [
        'producto_id',
        'materia_prima_id',
        'usuario_id',
        'tipo_movimiento',
        'concepto',
        'observaciones',
        'cantidad',
        'fecha_registro',
        'costo_unitario',
        'costo_total',
        'estado'
    ];

    protected $casts = [
        'fecha_registro' => 'datetime',
        'cantidad' => 'integer',
        'producto_id' => 'integer',
        'materia_prima_id' => 'integer',
        'usuario_id' => 'integer',
        'costo_unitario' => 'decimal:2',
        'costo_total' => 'decimal:2',
    ];


    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'id_producto');
    }

    public function materiaPrima(): BelongsTo
    {
        return $this->belongsTo(MateriaPrima::class, 'materia_prima_id', 'id_material');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id', 'id_usuario');
    }


    public function scopeTipoMovimiento($query, $tipo)
    {
        return $query->where('tipo_movimiento', $tipo); 
    }

    public function scopeFechaEntre($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('fecha_registro', [$fechaInicio, $fechaFin]); 
    }
}