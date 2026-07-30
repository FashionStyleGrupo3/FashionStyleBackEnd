<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{

    protected $table = "proveedores";

    protected $primaryKey = "id_proveedor";

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'telefono',
        'correo'
    ];

    public function productos()
    {
        return $this->hasMany(Producto::class, 'id_proveedor');
    }

}
