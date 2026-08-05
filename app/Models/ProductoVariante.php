<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductoVariante extends Model
{
    protected $table = 'productos_variantes';

    protected $primaryKey = 'id_variante';

    

    protected $fillable = [
        'producto_id',
        'talla',
        'color',
        'stock',
        'sku',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'id_producto');
    }

   
    public function imagenes()
    {
        return $this->hasMany(ProductoImagen::class, 'producto_id', 'producto_id')
            ->where(function ($query) {
                $query->where('color', $this->color)
                      ->orWhereNull('color');
            });
    }

   
    public function getDisponibleAttribute()
    {
        return $this->stock > 0;
    }
}