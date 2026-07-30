<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        
        $permisoVerUsuarios   = Permission::create(['name' => 'ver usuarios']);
        $permisoEditarUsuarios = Permission::create(['name' => 'editar usuarios']);
        $permisoVerPedidos   = Permission::create(['name' => 'ver pedidos']);
        $permisoCrearPedidos  = Permission::create(['name' => 'crear pedidos']);
        

        $roleAdmin    = Role::create(['name' => 'admin']);
        $roleEmpleado = Role::create(['name' => 'empleado']);
        $roleCliente  = Role::create(['name' => 'cliente']);

        $roleAdmin->givePermissionTo(Permission::all());

        $roleEmpleado->givePermissionTo([
            $permisoVerUsuarios,
            $permisoVerPedidos,
            $permisoCrearPedidos,
        ]);

        $roleCliente->givePermissionTo([
            $permisoVerPedidos,
            $permisoCrearPedidos,
        ]);
    }
}