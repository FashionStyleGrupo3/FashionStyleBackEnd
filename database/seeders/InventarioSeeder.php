<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Inventario;
use App\Models\Producto;
use App\Models\MateriaPrima;
use App\Models\User;
use Carbon\Carbon;

class InventarioSeeder extends Seeder
{
    public function run(): void
    {

        $this->verificarDatosRelacionados();


        $this->command->info(' Generando movimientos con Factory...');


        Inventario::factory()
            ->count(50)
            ->create();


        Inventario::factory()
            ->count(30)
            ->entrada()
            ->create();


        Inventario::factory()
            ->count(20)
            ->salida()
            ->create();


        Inventario::factory()
            ->count(15)
            ->ajuste()
            ->create();


        Inventario::factory()
            ->count(10)
            ->reciente()
            ->create();


        Inventario::factory()
            ->count(10)
            ->conProducto()
            ->create();

  
        Inventario::factory()
            ->count(10)
            ->conMateriaPrima()
            ->create();


        Inventario::factory()
            ->count(10)
            ->altoCosto()
            ->create();


        Inventario::factory()
            ->count(10)
            ->bajoCosto()
            ->create();


        $this->command->info(' Creando movimientos específicos...');


        Inventario::factory()
            ->entrada()
            ->conProducto()
            ->fecha(Carbon::now()->subDays(30))
            ->state([
                'concepto' => 'Compra inicial de temporada',
                'cantidad' => 150,
                'costo_unitario' => 45.00,
            ])
            ->create();

        Inventario::factory()
            ->entrada()
            ->conMateriaPrima()
            ->fecha(Carbon::now()->subDays(20))
            ->state([
                'concepto' => 'Compra de insumos para producción',
                'cantidad' => 200,
                'costo_unitario' => 12.50,
            ])
            ->create();


        Inventario::factory()
            ->salida()
            ->conProducto()
            ->fecha(Carbon::now()->subDays(15))
            ->state([
                'concepto' => 'Venta mayorista - Pedido especial',
                'cantidad' => 45,
                'costo_unitario' => 55.00,
            ])
            ->create();

        Inventario::factory()
            ->salida()
            ->conProducto()
            ->fecha(Carbon::now()->subDays(5))
            ->state([
                'concepto' => 'Venta por e-commerce - Black Friday',
                'cantidad' => 25,
                'costo_unitario' => 40.00,
            ])
            ->create();


        Inventario::factory()
            ->ajuste()
            ->conProducto()
            ->fecha(Carbon::now()->subDays(10))
            ->state([
                'concepto' => 'Ajuste por inventario físico mensual',
                'cantidad' => 8,
                'diferencia' => 5,
                'costo_unitario' => 30.00,
            ])
            ->create();

        Inventario::factory()
            ->ajuste()
            ->conMateriaPrima()
            ->fecha(Carbon::now()->subDays(3))
            ->state([
                'concepto' => 'Corrección de stock por error de sistema',
                'cantidad' => 12,
                'diferencia' => -3,
                'costo_unitario' => 8.00,
            ])
            ->create();


        $this->command->info('');
        $this->command->info(' InventarioSeeder ejecutado correctamente');
        $this->command->info(' Total de registros: ' . Inventario::count());
        $this->command->info(' Entradas: ' . Inventario::where('tipo_movimiento', 'entrada')->count());
        $this->command->info(' Salidas: ' . Inventario::where('tipo_movimiento', 'salida')->count());
        $this->command->info(' Ajustes: ' . Inventario::where('tipo_movimiento', 'ajuste')->count());
        
        $totalCosto = Inventario::sum('costo_total');
        $this->command->info(' Costo total: $' . number_format($totalCosto, 2));
        $this->command->info('');
    }

    /**
     * Verificar que existan datos en las tablas relacionadas
     */
    private function verificarDatosRelacionados()
    {

        if (Producto::count() === 0) {
            $this->command->warn(' No hay productos. Creando productos de prueba...');
            $this->crearProductosPrueba();
        }


        if (MateriaPrima::count() === 0) {
            $this->command->warn(' No hay materias primas. Creando materias primas de prueba...');
            $this->crearMateriasPrimasPrueba();
        }


        if (User::count() === 0) {
            $this->command->warn(' No hay usuarios. Creando usuario de prueba...');
            $this->crearUsuarioPrueba();
        }
    }

    /**
     * Crear productos de prueba
     */
    private function crearProductosPrueba()
    {
        $productos = [
            ['Nombre' => 'Camisa Casual', 'Precio' => 45.00, 'Stock' => 100],
            ['Nombre' => 'Pantalón Jeans', 'Precio' => 60.00, 'Stock' => 80],
            ['Nombre' => 'Zapatos Deportivos', 'Precio' => 75.00, 'Stock' => 50],
            ['Nombre' => 'Chaqueta de Cuero', 'Precio' => 120.00, 'Stock' => 30],
            ['Nombre' => 'Vestido de Fiesta', 'Precio' => 90.00, 'Stock' => 40],
            ['Nombre' => 'Blusa Seda', 'Precio' => 55.00, 'Stock' => 60],
            ['Nombre' => 'Falda Plisada', 'Precio' => 50.00, 'Stock' => 45],
            ['Nombre' => 'Abrigo de Invierno', 'Precio' => 150.00, 'Stock' => 20],
            ['Nombre' => 'Camiseta Deportiva', 'Precio' => 35.00, 'Stock' => 120],
            ['Nombre' => 'Bermuda de Playa', 'Precio' => 40.00, 'Stock' => 75],
        ];

        foreach ($productos as $producto) {
            Producto::create($producto);
        }
        $this->command->info(' Productos creados: ' . Producto::count());
    }

    /**
     * Crear materias primas de prueba
     */
    private function crearMateriasPrimasPrueba()
    {
        $materias = [
            ['Nombre' => 'Algodón Orgánico', 'Precio' => 10.00, 'Stock' => 500],
            ['Nombre' => 'Cuero Sintético', 'Precio' => 15.00, 'Stock' => 300],
            ['Nombre' => 'Seda Natural', 'Precio' => 25.00, 'Stock' => 200],
            ['Nombre' => 'Lana de Oveja', 'Precio' => 12.00, 'Stock' => 400],
            ['Nombre' => 'Poliéster Reciclado', 'Precio' => 8.00, 'Stock' => 600],
            ['Nombre' => 'Hilo de Algodón', 'Precio' => 5.00, 'Stock' => 800],
            ['Nombre' => 'Botones de Madera', 'Precio' => 3.00, 'Stock' => 1000],
            ['Nombre' => 'Cierres Metálicos', 'Precio' => 4.00, 'Stock' => 900],
        ];

        foreach ($materias as $materia) {
            MateriaPrima::create($materia);
        }
        $this->command->info(' Materias primas creadas: ' . MateriaPrima::count());
    }

    /**
     * Crear usuario de prueba
     */
    private function crearUsuarioPrueba()
    {
        User::create([
            'name' => 'Admin Fashion',
            'email' => 'admin@fashionstyle.com',
            'password' => bcrypt('password123'),
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Usuario Inventario',
            'email' => 'inventario@fashionstyle.com',
            'password' => bcrypt('password123'),
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Vendedor Fashion',
            'email' => 'vendedor@fashionstyle.com',
            'password' => bcrypt('password123'),
            'email_verified_at' => now(),
        ]);

        $this->command->info(' Usuarios creados: ' . User::count());
    }
}