<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Catalogo extends Model
{
    protected $table = "catalogos";

    protected $primaryKey = "id_catalogo";

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'descripcion',
        'activo'
    ];

    public function productos()
    {
        return $this->hasMany(Producto::class, 'catalogo_id');
    }
}
