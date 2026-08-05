<?php
// Andres Mauricio Carvajal Vera - 30/07/2026
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CarritoDeCompras extends Model
{
    // Include SoftDeletes if you added it to your migration
    use SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'carrito_de_compras';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'usuario_id',
        'session_id',
        'estado',
        'total'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'fecha_creacion' => 'datetime',
        'total' => 'decimal:2',
    ];

    /**
     * Get the details (items) associated with the shopping cart.
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleCarrito::class, 'carrito_id');
    }

    /**
     * Get the user that owns the shopping cart.
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}