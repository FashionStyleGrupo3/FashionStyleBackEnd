<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MateriaPrima extends Model
{
    protected $table = 'materias_primas';

    protected $primaryKey = 'id_material';

    protected $fillable = [
        'codigo',
        'nombre',
        'clasificacion',
        'categoria_id',
        'stock',
        'stock_min',
        'costo_unitario',
        'imagen',
        'unidad_medida_id',
        'activo',
    ];

    protected $casts = [
        'stock' => 'integer',
        'stock_min' => 'integer',
        'costo_unitario' => 'decimal:2',
        'activo' => 'boolean',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_id', 'id_categoria');
    }

    public function unidadMedida(): BelongsTo
    {
        return $this->belongsTo(UnidadMedida::class, 'unidad_medida_id', 'id');
    }
}