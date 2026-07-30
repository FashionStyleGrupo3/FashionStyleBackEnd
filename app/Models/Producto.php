<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'productos';

    protected $primaryKey = 'id_producto';

    public $timestamps = false; // la tabla solo tiene created_at, no updated_at

    protected $fillable = [
        'nombre',
        'descripcion',
        'precio_venta',
        'categoria_id',
        'catalogo_id',
        'activo',
        'publicado',
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id', 'id_categoria');
    }

    public function catalogo()
    {
        return $this->belongsTo(Catalogo::class, 'catalogo_id', 'id_catalogo');
    }

    public function variantes()
    {
        return $this->hasMany(ProductoVariante::class, 'producto_id', 'id_producto');
    }

    public function imagenes()
    {
        return $this->hasMany(ProductoImagen::class, 'producto_id', 'id_producto');
    }

    public function colores()
    {
        return $this->variantes()->select('color')->distinct();
    }
}