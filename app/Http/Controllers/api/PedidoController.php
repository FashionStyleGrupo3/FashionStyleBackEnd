<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\api\Controller;

use App\Models\Pedido;
use Illuminate\Http\Request;

class PedidoController extends Controller
{
    public function index()
    {
        return Pedido::with(['usuario', 'detalles'])->get();
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'usuario_id' => 'required|exists:usuarios,id_usuario',
            'carrito_id' => 'nullable|exists:carrito_de_compras,id',
            'fecha_pedido' => 'nullable|date',
            'estado' => 'nullable|string|max:30',
            'monto_subtotal' => 'required|numeric|min:0',
            'costo_envio' => 'nullable|numeric|min:0',
            'monto_total' => 'required|numeric|min:0',
            'direccion_envio' => 'required|string',
            'ciudad_envio' => 'required|string|max:100',
            'departamento_envio' => 'required|string|max:100',
            'telefono_contacto' => 'required|string|max:20',
            'empresa_transportadora' => 'nullable|string|max:100',
            'numero_guia' => 'nullable|string|max:100',
            'metodo_pago' => 'nullable|string|max:50',
            'referencia_pasarela' => 'nullable|string|max:100',
            'notas_cliente' => 'nullable|string',
        ]);

        $pedido = Pedido::create($datos);

        return response()->json($pedido->load(['usuario', 'detalles']), 201);
    }

    public function show(Pedido $pedido)
    {
        return $pedido->load(['usuario', 'detalles']);
    }

    public function update(Request $request, Pedido $pedido)
    {
        $datos = $request->validate([
            'usuario_id' => 'sometimes|required|exists:usuarios,id_usuario',
            'carrito_id' => 'nullable|exists:carrito_de_compras,id',
            'fecha_pedido' => 'nullable|date',
            'estado' => 'nullable|string|max:30',
            'monto_subtotal' => 'sometimes|required|numeric|min:0',
            'costo_envio' => 'nullable|numeric|min:0',
            'monto_total' => 'sometimes|required|numeric|min:0',
            'direccion_envio' => 'sometimes|required|string',
            'ciudad_envio' => 'sometimes|required|string|max:100',
            'departamento_envio' => 'sometimes|required|string|max:100',
            'telefono_contacto' => 'sometimes|required|string|max:20',
            'empresa_transportadora' => 'nullable|string|max:100',
            'numero_guia' => 'nullable|string|max:100',
            'metodo_pago' => 'nullable|string|max:50',
            'referencia_pasarela' => 'nullable|string|max:100',
            'notas_cliente' => 'nullable|string',
        ]);

        $pedido->update($datos);

        return response()->json($pedido->load(['usuario', 'detalles']));
    }

    public function destroy(Pedido $pedido)
    {
        $pedido->delete();

        return response()->json([
            'mensaje' => 'Pedido eliminado correctamente',
        ]);
    }
}