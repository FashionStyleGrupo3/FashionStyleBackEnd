<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; 
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';

    protected $guard_name = 'web';

    const UPDATED_AT = null;
    public function getAuthPasswordName()
    {
        return 'password_hash';
    }

    protected $fillable = [
        'nombre',
        'correo',
        'password_hash',
        'telefono',
        'direccion',
        'ciudad',
        'activo',
        
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password_hash' => 'hashed',
        ];
    }
}
