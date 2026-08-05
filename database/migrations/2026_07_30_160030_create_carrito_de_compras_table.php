<?php
<<<<<<< HEAD
// Andres Mauricio Carvajal Vera - 30/07/2026
=======

>>>>>>> a0ccae56a2448c859b8df04148bb599b4068acab
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carrito_de_compras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios', 'id_usuario')->onDelete('cascade');
<<<<<<< HEAD
            $table->string('sesion_id', 255)->nullable();
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->string('estado', 20)->default('Created');
            $table->timestamps();
            $table->softDeletes();
=======
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->string('estado', 20)->default('Created');
            $table->timestamps();
>>>>>>> a0ccae56a2448c859b8df04148bb599b4068acab
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carrito_de_compras');
    }
};
