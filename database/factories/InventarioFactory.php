<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Inventario;
use App\Models\Producto;
use App\Models\MateriaPrima;
use App\Models\User;
use Carbon\Carbon;

class InventarioFactory extends Factory
{
    protected $model = Inventario::class;

    public function definition(): array
    {
        $tipos = ['entrada', 'salida', 'ajuste'];
        $tipo = $this->faker->randomElement($tipos);

        $conceptos = [
            'entrada' => [
                'Compra inicial de productos',
                'Reabastecimiento de stock',
                'Nuevo lote de temporada',
                'Compra a proveedor mayorista',
                'Reposición de productos',
            ],
            'salida' => [
                'Venta al cliente mayorista',
                'Venta en tienda física',
                'Venta por e-commerce',
                'Salida por producción',
                'Envío a cliente',
            ],
            'ajuste' => [
                'Ajuste por inventario físico',
                'Corrección de stock',
                'Reclasificación de productos',
                'Ajuste por merma',
                'Regularización de inventario',
            ]
        ];

        $concepto = $this->faker->randomElement($conceptos[$tipo]);

        $cantidad = match($tipo) {
            'entrada' => $this->faker->numberBetween(10, 500),
            'salida' => $this->faker->numberBetween(1, 100),
            'ajuste' => $this->faker->numberBetween(1, 50),
        };

        $costo_unitario = $this->faker->randomFloat(2, 5, 150);
        $esProducto = $this->faker->boolean(70);

        return [
            'producto_id' => $esProducto ? Producto::inRandomOrder()->first()?->id_producto ?? 1 : null,
            'materia_prima_id' => !$esProducto ? MateriaPrima::inRandomOrder()->first()?->id ?? 1 : null,
            'usuario_id' => User::inRandomOrder()->first()?->id ?? 1,
            'tipo_movimiento' => $tipo,
            'concepto' => $concepto,
            'observaciones' => $this->faker->optional(0.7)->sentence(10),
            'cantidad' => $cantidad,
            'fecha_registro' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'costo_unitario' => $costo_unitario,
            'costo_total' => $cantidad * $costo_unitario,
            'estado' => $this->faker->randomElement(['Activo', 'Procesado']),
            'diferencia' => $tipo === 'ajuste' ? $this->faker->numberBetween(-20, 20) : 0,
        ];
    }


    public function entrada(): static
    {
        return $this->state([
            'tipo_movimiento' => 'entrada',
            'cantidad' => $this->faker->numberBetween(10, 500),
            'diferencia' => 0,
        ]);
    }

    public function salida(): static
    {
        return $this->state([
            'tipo_movimiento' => 'salida',
            'cantidad' => $this->faker->numberBetween(1, 100),
            'diferencia' => 0,
        ]);
    }

    public function ajuste(): static
    {
        return $this->state([
            'tipo_movimiento' => 'ajuste',
            'cantidad' => $this->faker->numberBetween(1, 50),
            'diferencia' => $this->faker->numberBetween(-20, 20),
        ]);
    }

    public function conProducto(): static
    {
        return $this->state([
            'producto_id' => Producto::inRandomOrder()->first()?->id_producto ?? 1,
            'materia_prima_id' => null,
        ]);
    }

    public function conMateriaPrima(): static
    {
        return $this->state([
            'producto_id' => null,
            'materia_prima_id' => MateriaPrima::inRandomOrder()->first()?->id ?? 1,
        ]);
    }

    public function fecha($fecha): static
    {
        return $this->state([
            'fecha_registro' => $fecha,
        ]);
    }

    public function reciente(): static
    {
        return $this->state([
            'fecha_registro' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    public function altoCosto(): static
    {
        return $this->state(function () {
            $costo = $this->faker->randomFloat(2, 500, 1000);
            $cantidad = $this->faker->numberBetween(1, 50);
            return [
                'costo_unitario' => $costo,
                'costo_total' => $cantidad * $costo,
            ];
        });
    }

    public function bajoCosto(): static
    {
        return $this->state(function () {
            $costo = $this->faker->randomFloat(2, 1, 10);
            $cantidad = $this->faker->numberBetween(10, 100);
            return [
                'costo_unitario' => $costo,
                'costo_total' => $cantidad * $costo,
            ];
        });
    }
}