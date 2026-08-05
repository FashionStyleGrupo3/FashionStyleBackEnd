<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{

<<<<<<< HEAD
    protected $table = "proveedors";

    protected $primaryKey = "id";
=======
    protected $table = "proveedores";

    protected $primaryKey = "id_proveedor";
>>>>>>> a0ccae56a2448c859b8df04148bb599b4068acab

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'contacto',
        'telefono',
        'email',
        'direccion',
        'notas',
        'activo'
    ];

    public function productos()
    {
        return $this->hasMany(Producto::class, 'id_proveedor');
    }

}