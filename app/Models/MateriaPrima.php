<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MateriaPrima extends Model
{
    use HasFactory;

    protected $table = 'materiales';
    protected $primaryKey = 'id_material';
    public $timestamps = true;

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
        'categoria_id' => 'integer',
        'unidad_medida_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_id', 'id');
    }

    public function unidadMedida(): BelongsTo
    {
        return $this->belongsTo(UnidadMedida::class, 'unidad_medida_id', 'id');
    }

    public function inventarios(): HasMany
    {
        return $this->hasMany(Inventario::class, 'materia_prima_id', 'id_material');
    }

    public function detallesVenta(): HasMany
    {
        return $this->hasMany(DetalleVenta::class, 'materia_prima_id', 'id_material');
    }

    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopeInactivos($query)
    {
        return $query->where('activo', false);
    }

    public function scopeStockBajo($query)
    {
        return $query->whereColumn('stock', '<=', 'stock_min');
    }

    public function scopePorCategoria($query, $categoriaId)
    {
        return $query->where('categoria_id', $categoriaId);
    }

    public function scopePorClasificacion($query, $clasificacion)
    {
        return $query->where('clasificacion', $clasificacion);
    }

    public function scopePorUnidadMedida($query, $unidadMedidaId)
    {
        return $query->where('unidad_medida_id', $unidadMedidaId);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where('codigo', 'LIKE', "%{$termino}%")
                     ->orWhere('nombre', 'LIKE', "%{$termino}%");
    }

    public function isActivo(): bool
    {
        return (bool) $this->activo;
    }

    public function hasStockBajo(): bool
    {
        return $this->stock <= $this->stock_min;
    }

    public function hasStockDisponible(int $cantidad = 1): bool
    {
        return $this->stock >= $cantidad;
    }

    public function disminuirStock(int $cantidad): bool
    {
        if (!$this->hasStockDisponible($cantidad)) {
            return false;
        }

        $this->stock -= $cantidad;
        return $this->save();
    }

    public function aumentarStock(int $cantidad): bool
    {
        $this->stock += $cantidad;
        return $this->save();
    }

    public function getEstadoStockAttribute(): string
    {
        if ($this->stock <= 0) {
            return 'Agotado';
        } elseif ($this->hasStockBajo()) {
            return 'Stock Bajo';
        } else {
            return 'Disponible';
        }
    }

    public function getCostoFormateadoAttribute(): string
    {
        return '$ ' . number_format($this->costo_unitario, 2);
    }

    public function getClasificacionTextoAttribute(): string
    {
        $clasificaciones = [
            'materia_prima' => 'Materia Prima',
            'insumo' => 'Insumo',
            'producto_terminado' => 'Producto Terminado',
            'herramienta' => 'Herramienta',
            'equipo' => 'Equipo',
        ];
        return $clasificaciones[$this->clasificacion] ?? $this->clasificacion;
    }

    public function getUnidadMedidaTextoAttribute(): string
    {
        if ($this->unidadMedida) {
            return $this->unidadMedida->nombre_completo;
        }
        return 'N/A';
    }
}