<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UnidadMedida extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'unidades_medida';

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'id';

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'nombre',
        'abreviatura',
        'activa',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'activa' => 'boolean',
    ];

    /**
     * Get the materials for this unit of measure.
     */
    public function materiales(): HasMany
    {
        return $this->hasMany(MateriaPrima::class, 'unidad_medida_id', 'id');
    }

    /**
     * Get the products for this unit of measure (si aplica).
     */
    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'unidad_medida_id', 'id');
    }

    /**
     * Scope to get only active units.
     */
    public function scopeActivas($query)
    {
        return $query->where('activa', true);
    }

    /**
     * Scope to get only inactive units.
     */
    public function scopeInactivas($query)
    {
        return $query->where('activa', false);
    }

    /**
     * Scope to search units by name or abbreviation.
     */
    public function scopeBuscar($query, $termino)
    {
        return $query->where('nombre', 'LIKE', "%{$termino}%")
                     ->orWhere('abreviatura', 'LIKE', "%{$termino}%");
    }

    /**
     * Check if unit is active.
     */
    public function isActiva(): bool
    {
        return (bool) $this->activa;
    }

    /**
     * Get the formatted name with abbreviation.
     */
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->nombre} ({$this->abreviatura})";
    }

    /**
     * Toggle active status.
     */
    public function toggleActiva(): bool
    {
        $this->activa = !$this->activa;
        return $this->save();
    }
}