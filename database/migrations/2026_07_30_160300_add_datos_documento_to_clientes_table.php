<?php
 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
 
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            if (!Schema::hasColumn('clientes', 'apellido')) {
                $table->string('apellido')->nullable()->after('nombre_completo');
            }
            if (!Schema::hasColumn('clientes', 'tipo_documento')) {
                $table->enum('tipo_documento', ['CC', 'NIT', 'CE', 'PP'])->nullable()->after('telefono');
            }
            if (!Schema::hasColumn('clientes', 'numero_documento')) {
                $table->string('numero_documento')->nullable()->unique()->after('tipo_documento');
            }
            if (!Schema::hasColumn('clientes', 'direccion')) {
                $table->string('direccion')->nullable()->after('numero_documento');
            }
            if (!Schema::hasColumn('clientes', 'ciudad')) {
                $table->string('ciudad')->nullable()->after('direccion');
            }
        });
    }
 
    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn(['apellido', 'tipo_documento', 'numero_documento', 'direccion', 'ciudad']);
        });
    }
};