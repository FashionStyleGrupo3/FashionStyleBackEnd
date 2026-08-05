<?php

namespace Database\Seeders;

use App\Models\Venta;
use App\Models\User;
use Illuminate\Database\Seeder;

class VentaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
       
        $this->crearVentasPorEstado();
        $this->crearVentasEspecificas();
        $this->crearVentasPorMedioPago();
        $this->crearVentasPorFechas();
    }

    private function crearVentasPorEstado(): void
    {

        Venta::factory()
            ->pendiente()
            ->count(20)
            ->create();

        Venta::factory()
            ->enProceso()
            ->count(15)
            ->create();

        Venta::factory()
            ->completada()
            ->count(30)
            ->create();

        Venta::factory()
            ->cancelada()
            ->count(10)
            ->create();
    }

    private function crearVentasEspecificas(): void
    {

        Venta::factory()
            ->completada()
            ->count(5)
            ->state(function (array $attributes) {
                return [
                    'Monto_Total' => $this->faker->randomFloat(2, 1000000, 5000000),
                    'Descripcion' => 'Venta de alto valor - ' . $this->faker->sentence(),
                ];
            })
            ->create();

        Venta::factory()
            ->completada()
            ->count(5)
            ->state(function (array $attributes) {
                return [
                    'Monto_Total' => $this->faker->randomFloat(2, 100, 5000),
                    'Descripcion' => 'Venta de bajo valor - ' . $this->faker->sentence(),
                ];
            })
            ->create();

        Venta::factory()
            ->completada()
            ->count(3)
            ->state(function (array $attributes) {
                return [
                    'Notas' => 'Venta especial - Requiere seguimiento. ' . $this->faker->paragraph(),
                    'Categoria' => 'Especial',
                ];
            })
            ->create();
    }

    private function crearVentasPorMedioPago(): void
    {
        
        Venta::factory()
            ->completada()
            ->efectivo()
            ->count(10)
            ->create();

        
        Venta::factory()
            ->completada()
            ->tarjeta()
            ->count(10)
            ->create();

        
        Venta::factory()
            ->completada()
            ->state(function (array $attributes) {
                return [
                    'Medio_Pago' => Venta::TRANSFERENCIA,
                ];
            })
            ->count(10)
            ->create();

        
        Venta::factory()
            ->completada()
            ->state(function (array $attributes) {
                return [
                    'Medio_Pago' => Venta::CREDITO,
                ];
            })
            ->count(5)
            ->create();

        
        Venta::factory()
            ->completada()
            ->state(function (array $attributes) {
                return [
                    'Medio_Pago' => Venta::DEBITO,
                ];
            })
            ->count(5)
            ->create();
    }

    private function crearVentasPorFechas(): void
    {
        
        Venta::factory()
            ->completada()
            ->count(10)
            ->state(function (array $attributes) {
                return [
                    'Fecha_Venta' => now()->subWeek()->addDays(rand(0, 6)),
                ];
            })
            ->create();

        
        Venta::factory()
            ->completada()
            ->count(10)
            ->state(function (array $attributes) {
                return [
                    'Fecha_Venta' => now()->subMonth()->addDays(rand(0, 27)),
                ];
            })
            ->create();

        
        Venta::factory()
            ->completada()
            ->count(5)
            ->state(function (array $attributes) {
                return [
                    'Fecha_Venta' => now(),
                ];
            })
            ->create();

        
        Venta::factory()
            ->completada()
            ->count(8)
            ->state(function (array $attributes) {
                return [
                    'Fecha_Venta' => now()->subMonths(3)->addDays(rand(0, 27)),
                ];
            })
            ->create();

        
        Venta::factory()
            ->completada()
            ->count(5)
            ->state(function (array $attributes) {
                return [
                    'Fecha_Venta' => now()->subMonths(6)->addDays(rand(0, 27)),
                ];
            })
            ->create();
    }

    public function crearVentasPorUsuario(): void
    {
        
        $usuarios = User::all();

        if ($usuarios->isEmpty()) {
            
            $usuarios = User::factory()->count(5)->create();
        }

        foreach ($usuarios as $usuario) {
            
            $cantidad = rand(5, 15);
            
            Venta::factory()
                ->count($cantidad)
                ->state(function (array $attributes) use ($usuario) {
                    return [
                        'ID_Usuario' => $usuario->id,
                    ];
                })
                ->create();
        }
    }

    public function crearVentasConMontos(): void
    {
        $rangos = [
            ['min' => 100, 'max' => 1000, 'descripcion' => 'Ventas pequeñas'],
            ['min' => 1000, 'max' => 10000, 'descripcion' => 'Ventas medianas'],
            ['min' => 10000, 'max' => 100000, 'descripcion' => 'Ventas grandes'],
            ['min' => 100000, 'max' => 1000000, 'descripcion' => 'Ventas muy grandes'],
        ];

        foreach ($rangos as $rango) {
            Venta::factory()
                ->completada()
                ->count(10)
                ->state(function (array $attributes) use ($rango) {
                    return [
                        'Monto_Total' => $this->faker->randomFloat(2, $rango['min'], $rango['max']),
                        'Descripcion' => $rango['descripcion'] . ' - ' . $this->faker->sentence(),
                    ];
                })
                ->create();
        }
    }
}
