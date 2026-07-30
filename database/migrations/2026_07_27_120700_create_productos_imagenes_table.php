<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos_imagenes', function (Blueprint $table) {
            $table->id('id_imagen');
            $table->unsignedBigInteger('producto_id');
            $table->string('color', 50)->nullable();
            $table->string('ruta', 500);
            $table->boolean('es_principal')->default(false);
            $table->integer('orden')->default(0);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('producto_id')
                ->references('id_producto')->on('productos')
                ->cascadeOnDelete();

            $table->index(['producto_id', 'color']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos_imagenes');
    }
};