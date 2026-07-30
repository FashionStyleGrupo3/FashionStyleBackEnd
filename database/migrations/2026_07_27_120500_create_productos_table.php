<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->id('id_producto');
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->decimal('precio_venta', 12, 2)->default(0);
            $table->unsignedBigInteger('categoria_id')->nullable();
            $table->unsignedBigInteger('catalogo_id')->nullable();
            $table->boolean('activo')->default(true);
            $table->boolean('publicado')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('categoria_id')
                ->references('id_categoria')->on('categorias')
                ->nullOnDelete();

            $table->foreign('catalogo_id')
                ->references('id_catalogo')->on('catalogos')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};