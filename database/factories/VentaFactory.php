<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Venta;
use Illuminate\Database\Eloquent\Factories\Factory;

class VentaFactory extends Factory
{
    protected $model = Venta::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        $estados = [
            Venta::PENDIENTE,
            Venta::EN_PROCESO,
            Venta::COMPLETADA,
            Venta::CANCELADA
        ];
        
        $mediosPago = [
            Venta::EFECTIVO,
            Venta::TARJETA,
            Venta::TRANSFERENCIA,
            Venta::CREDITO,
            Venta::DEBITO
        ];

        $estado = $this->faker->randomElement($estados);
        $cancelada = $estado === Venta::CANCELADA;

        return [
            'Numero_Comprobante' => $this->generateComprobante(),
            'ID_Usuario' => User::factory(),
            'Descripcion' => $this->faker->optional()->sentence(4),
            'Categoria' => $this->faker->optional()->randomElement([
                'Electrónicos', 'Ropa', 'Alimentos', 'Libros', 'Juguetes', 'Muebles'
            ]),
            'Notas' => $this->faker->optional()->paragraph(),
            'Fecha_Venta' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'Monto_Total' => $this->faker->randomFloat(2, 1000, 500000),
            'Medio_Pago' => $this->faker->randomElement($mediosPago),
            'Estado' => $estado,
            'Cancelada' => $cancelada,
        ];
    }

    /**
     * Generate a unique comprobante number.
     */
    private function generateComprobante(): string
    {
        $year = now()->format('Y');
        $number = $this->faker->unique()->numberBetween(1, 9999);
        return 'V-' . $year . '-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Indicate that the sale is pending.
     */
    public function pendiente(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'Estado' => Venta::PENDIENTE,
                'Cancelada' => false,
            ];
        });
    }

    /**
     * Indicate that the sale is in process.
     */
    public function enProceso(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'Estado' => Venta::EN_PROCESO,
                'Cancelada' => false,
            ];
        });
    }

    /**
     * Indicate that the sale is completed.
     */
    public function completada(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'Estado' => Venta::COMPLETADA,
                'Cancelada' => false,
            ];
        });
    }

    /**
     * Indicate that the sale is canceled.
     */
    public function cancelada(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'Estado' => Venta::CANCELADA,
                'Cancelada' => true,
            ];
        });
    }

    /**
     * Indicate that the sale was made with cash.
     */
    public function efectivo(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'Medio_Pago' => Venta::EFECTIVO,
            ];
        });
    }

    /**
     * Indicate that the sale was made with credit card.
     */
    public function tarjeta(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'Medio_Pago' => Venta::TARJETA,
            ];
        });
    }
}
