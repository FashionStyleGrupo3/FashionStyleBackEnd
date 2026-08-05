<?php
// database/factories/MaterialFactory.php

namespace Database\Factories;

use App\Models\Categoria;
use App\Models\UnidadMedida;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MateriaPrima>
 */
class MateriasPrimasFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $clasificaciones = [
            'materia_prima',
            'insumo',
            'producto_terminado',
            'herramienta',
            'equipo'
        ];

        $nombres = [
            'materia_prima' => ['Madera', 'Metal', 'Plástico', 'Vidrio', 'Tela'],
            'insumo' => ['Tornillos', 'Clavos', 'Pegamento', 'Pintura', 'Cinta'],
            'producto_terminado' => ['Silla', 'Mesa', 'Armario', 'Estante', 'Escritorio'],
            'herramienta' => ['Martillo', 'Destornillador', 'Sierra', 'Taladro', 'Lijadora'],
            'equipo' => ['Compresor', 'Generador', 'Soldadora', 'Cortadora', 'Prensa']
        ];

        $clasificacion = $this->faker->randomElement($clasificaciones);
        $nombre = $this->faker->randomElement($nombres[$clasificacion]);

        return [
            'codigo' => $this->faker->unique()->bothify('MAT-####'),
            'nombre' => $nombre . ' ' . $this->faker->randomElement(['Premium', 'Standard', 'Económico', 'Profesional']),
            'clasificacion' => $clasificacion,
            'categoria_id' => Categoria::inRandomOrder()->first()?->id ?? Categoria::factory(),
            'stock' => $this->faker->numberBetween(0, 100),
            'stock_min' => $this->faker->numberBetween(1, 10),
            'costo_unitario' => $this->faker->randomFloat(2, 0.50, 100),
            'imagen' => $this->faker->optional(0.3)->imageUrl(200, 200, 'products'),
            'unidad_medida_id' => UnidadMedida::inRandomOrder()->first()?->id ?? UnidadMedida::factory(),
            'activo' => $this->faker->boolean(80), // 80% activos
        ];
    }

    /**
     * Indicate that the material is active.
     */
    public function activo(): static
    {
        return $this->state(fn (array $attributes) => [
            'activo' => true,
        ]);
    }

    /**
     * Indicate that the material is inactive.
     */
    public function inactivo(): static
    {
        return $this->state(fn (array $attributes) => [
            'activo' => false,
        ]);
    }

    /**
     * Indicate that the material has low stock.
     */
    public function stockBajo(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock' => $this->faker->numberBetween(0, 4),
            'stock_min' => $this->faker->numberBetween(5, 10),
        ]);
    }

    /**
     * Indicate that the material has no stock.
     */
    public function sinStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock' => 0,
            'stock_min' => $this->faker->numberBetween(1, 10),
        ]);
    }
}