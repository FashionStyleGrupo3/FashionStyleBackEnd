<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductoImagen extends Model
{
    protected $table = 'productos_imagenes';

    protected $primaryKey = 'id_imagen';

    public $timestamps = false;

    protected $fillable = [
        'producto_id',
        'color',
        'ruta',
        'es_principal',
        'orden',
    ];

    protected $casts = [
        'es_principal' => 'boolean',
    ];

    protected $appends = ['url'];

    
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->ruta);
    }
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'id_producto');
    }

    public function scopeDeColor($query, $color)
    {
        return $query->where(function ($q) use ($color) {
            $q->where('color', $color)
              ->orWhereNull('color');
        });
    }

    public function scopeGenerales($query)
    {
        return $query->whereNull('color');
    }

    public function scopeOrdenadas($query)
    {
        return $query->orderByDesc('es_principal')->orderBy('orden');
    }
}