/* Estadísticas Module - Fashion Style ERP */
const API_EST = '/api/estadisticas';

async function cargarTodasLasEstadisticas() {
    try {
        const res = await fetch(`${API_EST}/dashboard`, { credentials: 'same-origin' });
        const d = await res.json();
        if (!d.ok) throw new Error(d.error);

        // KPIs
        document.getElementById('kpiVentasHoy').textContent = '$' + Number(d.kpi.ventas_hoy).toLocaleString('es-CO');
        document.getElementById('kpiVentasSemana').textContent = '$' + Number(d.kpi.ventas_semana).toLocaleString('es-CO');
        document.getElementById('kpiVentasMes').textContent = '$' + Number(d.kpi.ventas_mes).toLocaleString('es-CO');
        document.getElementById('kpiIngresos').textContent = '$' + Number(d.kpi.ingresos).toLocaleString('es-CO');
        document.getElementById('kpiGastos').textContent = '$' + Number(d.kpi.gastos).toLocaleString('es-CO');
        document.getElementById('kpiUtilidad').textContent = '$' + Number(d.kpi.utilidad).toLocaleString('es-CO');
        document.getElementById('kpiInventario').textContent = '$' + Number(d.kpi.valor_inventario).toLocaleString('es-CO');
        document.getElementById('kpiProductos').textContent = d.kpi.total_productos;

        // Productos agotados
        const agotadosEl = document.getElementById('listaAgotados');
        if (agotadosEl) {
            agotadosEl.innerHTML = d.kpi.productos_agotados > 0 
                ? `<p class="text-danger">⚠️ ${d.kpi.productos_agotados} producto(s) agotado(s)</p>`
                : `<p class="text-success">✅ Sin productos agotados</p>`;
        }

        // Stock bajo
        const stockBajoEl = document.getElementById('listaStockBajo');
        if (stockBajoEl) {
            stockBajoEl.innerHTML = d.kpi.productos_stock_bajo > 0
                ? `<p class="text-warning">⚠️ ${d.kpi.productos_stock_bajo} producto(s) con stock bajo</p>`
                : `<p class="text-success">✅ Stock suficiente</p>`;
        }

        // Gráfico ventas mensuales
        const ctx1 = document.getElementById('chartVentasMensuales');
        if (ctx1 && d.ventas_mensuales?.length) {
            if (window._chartVentas) window._chartVentas.destroy();
            window._chartVentas = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: d.ventas_mensuales.map(v => v.mes),
                    datasets: [{ label: 'Ventas', data: d.ventas_mensuales.map(v => parseFloat(v.total)), backgroundColor: '#2196f3' }]
                }
            });
        }

        // Gráfico productos más vendidos
        const ctx2 = document.getElementById('chartTopProductos');
        if (ctx2 && d.mas_vendidos?.length) {
            if (window._chartTop) window._chartTop.destroy();
            window._chartTop = new Chart(ctx2, {
                type: 'horizontalBar',
                data: {
                    labels: d.mas_vendidos.map(p => p.nombre),
                    datasets: [{ label: 'Unidades vendidas', data: d.mas_vendidos.map(p => parseInt(p.total_vendido)), backgroundColor: '#4caf50' }]
                },
                options: { indexAxis: 'y' }
            });
        }

        // Clientes frecuentes
        const clientesEl = document.getElementById('listaClientesFrecuentes');
        if (clientesEl && d.clientes_frecuentes?.length) {
            clientesEl.innerHTML = '<table class="table"><tr><th>Cliente</th><th>Compras</th><th>Total gastado</th></tr>' +
                d.clientes_frecuentes.map(c => `<tr><td>${c.nombre}</td><td>${c.total_compras}</td><td>$${Number(c.total_gastado).toLocaleString('es-CO')}</td></tr>`).join('') +
                '</table>';
        }

    } catch (e) {
        console.error('Error cargando estadísticas:', e);
    }
}

document.addEventListener('DOMContentLoaded', cargarTodasLasEstadisticas);