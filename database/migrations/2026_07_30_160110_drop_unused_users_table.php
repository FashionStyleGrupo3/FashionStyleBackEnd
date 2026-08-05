<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabla estándar de Laravel, sin usar: el proyecto autentica contra "usuarios"
        Schema::dropIfExists('users');
    }

    public function down(): void
    {
        // No se recrea automáticamente; no se necesita para el proyecto.
    }
};
