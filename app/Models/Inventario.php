<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventario extends Model
{
    /** @use HasFactory<\Database\Factories\InventarioFactory> */
    use HasFactory;

    protected $fillable = [
        'producto_id',
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
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'id_producto');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id', 'id_usuario');
    }
}