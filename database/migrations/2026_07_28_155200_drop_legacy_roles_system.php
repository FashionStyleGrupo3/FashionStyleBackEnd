<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('usuarios') && Schema::hasColumn('usuarios', 'rol_id')) {
            // Busca si realmente existe una foreign key sobre rol_id, sin adivinar el nombre
            $foreignKeys = DB::select("
                SELECT CONSTRAINT_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'usuarios'
                AND COLUMN_NAME = 'rol_id'
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ");

            foreach ($foreignKeys as $fk) {
                DB::statement("ALTER TABLE usuarios DROP FOREIGN KEY `{$fk->CONSTRAINT_NAME}`");
            }

            Schema::table('usuarios', function (Blueprint $table) {
                $table->dropColumn('rol_id');
            });
        }

        Schema::dropIfExists('roles');
        Schema::dropIfExists('rols');
    }

    public function down(): void
    {
        // Migración de limpieza: no se revierte automáticamente.
    }
};