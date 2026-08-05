<?php

namespace Database\Seeders;

use App\Models\MateriaPrima;
use Illuminate\Database\Seeder;

class MateriaPrimaSeeder extends Seeder
{
    public function run()
    {
        $materiales = [
            [
                'codigo' => 'MAT001',
                'nombre' => 'Tela Algodón',
                'clasificacion' => 'materia_prima',
                'categoria_id' => 1,
                'unidad_medida_id' => 1,
                'stock' => 100,
                'stock_min' => 10,
                'costo_unitario' => 15.50,
                'activo' => true,
            ],
            [
                'codigo' => 'MAT002',
                'nombre' => 'Tinta Negra',
                'clasificacion' => 'insumo',
                'categoria_id' => 1,
                'unidad_medida_id' => 4,
                'stock' => 50,
                'stock_min' => 5,
                'costo_unitario' => 25.00,
                'activo' => true,
            ],
            [
                'codigo' => 'MAT003',
                'nombre' => 'Hilo de Coser',
                'clasificacion' => 'insumo',
                'categoria_id' => 1,
                'unidad_medida_id' => 5,
                'stock' => 200,
                'stock_min' => 20,
                'costo_unitario' => 5.00,
                'activo' => true,
            ],
            [
                'codigo' => 'MAT004',
                'nombre' => 'Botones Metálicos',
                'clasificacion' => 'insumo',
                'categoria_id' => 1,
                'unidad_medida_id' => 2,
                'stock' => 500,
                'stock_min' => 50,
                'costo_unitario' => 0.50,
                'activo' => true,
            ],
            [
                'codigo' => 'MAT005',
                'nombre' => 'Piel Sintética',
                'clasificacion' => 'materia_prima',
                'categoria_id' => 1,
                'unidad_medida_id' => 3,
                'stock' => 30,
                'stock_min' => 5,
                'costo_unitario' => 45.00,
                'activo' => true,
            ],
        ];

        foreach ($materiales as $material) {
            MateriaPrima::create($material);
        }
    }
}