<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    /** @use HasFactory<\Database\Factories\PedidoFactory> */
    use HasFactory;

    protected $fillable = [
        'usuario_id',
        'carrito_id',
        'fecha_pedido',
        'estado',
        'monto_subtotal',
        'costo_envio',
        'monto_total',
        'direccion_envio',
        'ciudad_envio',
        'departamento_envio',
        'telefono_contacto',
        'empresa_transportadora',
        'numero_guia',
        'metodo_pago',
        'referencia_pasarela',
        'notas_cliente',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id', 'id_usuario');
    }

    public function detalles()
    {
        return $this->hasMany(DetallePedido::class, 'pedido_id');
    }
}