// Gastos.js v4 - Módulo completo de gestión de gastos con gráficos y paginación
const API_BASE = '/api';
let gastosData = [];
let gastosPagina = 1;
const gastosPorPagina = 10;
let gastosOrden = { campo: 'fecha', dir: 'desc' };
let chartGastosCat = null;
let chartGastosMes = null;

function mostrarToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function abrirModal(id) {
    document.getElementById(id).classList.add('open');
}
function cerrarModal(id) {
    document.getElementById(id).classList.remove('open');
}

function abrirModalGasto(editarId = null) {
    document.getElementById('gastoIdEditar').value = '';
    document.getElementById('gastoDescripcion').value = '';
    document.getElementById('gastoMonto').value = '';
    document.getElementById('gastoCategoria').value = 'publicidad';
    document.getElementById('gastoFecha').value = new Date().toISOString().split('T')[0];
    document.getElementById('modalGastoTitle').textContent = '➕ Nuevo Gasto';
    abrirModal('modalGasto');
}

async function guardarGasto() {
    const idEditar = document.getElementById('gastoIdEditar').value;
    const descripcion = document.getElementById('gastoDescripcion').value.trim();
    const monto = parseFloat(document.getElementById('gastoMonto').value);
    const categoria = document.getElementById('gastoCategoria').value;
    const fecha = document.getElementById('gastoFecha').value || new Date().toISOString().split('T')[0];

    if (!descripcion) return mostrarToast('La descripción es obligatoria', 'error');
    if (!monto || monto <= 0) return mostrarToast('El monto debe ser mayor a cero', 'error');

    try {
        const url = idEditar ? `${API_BASE}/gastos/${idEditar}` : `${API_BASE}/gastos`;
        const method = idEditar ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' },
            body: JSON.stringify({ descripcion, monto, categoria, fecha_gasto: fecha })
        });
        const data = await res.json();
        if (res.ok || res.status === 201) {
            mostrarToast(idEditar ? 'Gasto actualizado ✅' : 'Gasto registrado ✅', 'success');
            cerrarModal('modalGasto');
            cargarGastos();
        } else {
            mostrarToast(data.error || 'Error al guardar', 'error');
        }
    } catch (err) {
        mostrarToast('Error de conexión', 'error');
    }
}

async function cargarGastos() {
    document.getElementById('loadingGastos').style.display = 'block';
    try {
        const [resGastos, resResumen] = await Promise.all([
            fetch(`${API_BASE}/gastos`, { headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' } }),
            fetch(`${API_BASE}/gastos/resumen`, { headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' } })
        ]);
        const data = await resGastos.json();
        const resumen = resResumen.ok ? await resResumen.json() : {};
        if (!resGastos.ok) throw new Error(data.error);

        gastosData = data.gastos || data.data || [];
        document.getElementById('loadingGastos').style.display = 'none';
        renderizarTablaGastos();
        actualizarKPIsGastos(gastosData);
        renderizarGraficosGastos(gastosData);
    } catch (err) {
        document.getElementById('loadingGastos').style.display = 'none';
        document.getElementById('tbodyGastos').innerHTML = '<tr><td colspan="6" style="text-align:center;color:#E24B4A;padding:40px;">❌ Error al cargar gastos</td></tr>';
        mostrarToast('Error al cargar gastos', 'error');
    }
}

function renderizarTablaGastos() {
    const tbody = document.getElementById('tbodyGastos');
    const totalSpan = document.getElementById('totalRegistros');
    const filtrados = obtenerGastosFiltrados();

    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#a3a9b0;padding:40px;"><div style="font-size:24px;margin-bottom:8px;">💸</div><div style="font-weight:500;">No hay gastos registrados</div><div style="font-size:12px;margin-top:4px;">Usa el botón "Nuevo Gasto" para agregar</div></td></tr>';
        totalSpan.textContent = '0 registros';
        return;
    }

    const inicio = (gastosPagina - 1) * gastosPorPagina;
    const fin = inicio + gastosPorPagina;
    const pagina = filtrados.slice(inicio, fin);

    tbody.innerHTML = pagina.map(g => `
        <tr>
            <td>#${g.id_gasto || g.id}</td>
            <td><span class="mat-name">${g.descripcion || 'Sin descripción'}</span></td>
            <td><span class="badge badge-pink">${(g.categoria || 'otros').toUpperCase()}</span></td>
            <td><strong>$${Number(g.monto || 0).toLocaleString('es-CO')}</strong></td>
            <td>${g.fecha_gasto ? new Date(g.fecha_gasto).toLocaleDateString('es-CO') : '-'}</td>
            <td>
                <button class="action-btn" onclick="eliminarGasto(${g.id_gasto || g.id})" title="Eliminar">🗑️</button>
            </td>
        </tr>
    `).join('');
    totalSpan.textContent = `${filtrados.length} registros`;

    const totalPaginas = Math.ceil(filtrados.length / gastosPorPagina);
    document.getElementById('infoPaginaGasto').textContent = `Página ${gastosPagina} de ${totalPaginas || 1}`;
    document.getElementById('btnPrevGasto').disabled = gastosPagina <= 1;
    document.getElementById('btnNextGasto').disabled = gastosPagina >= totalPaginas;
}

function obtenerGastosFiltrados() {
    const texto = (document.getElementById('buscadorGastos')?.value || '').toLowerCase();
    const categoria = document.getElementById('filtroCategoria')?.value || '';
    let filtrados = gastosData;

    if (texto) filtrados = filtrados.filter(g => (g.descripcion || '').toLowerCase().includes(texto));
    if (categoria) filtrados = filtrados.filter(g => (g.categoria || '') === categoria);

    const [campo, dir] = [gastosOrden.campo, gastosOrden.dir];
    filtrados.sort((a, b) => {
        let va = a[campo === 'id' ? 'id_gasto' : campo] || a[campo] || '';
        let vb = b[campo === 'id' ? 'id_gasto' : campo] || b[campo] || '';
        if (campo === 'monto') { va = Number(va); vb = Number(vb); }
        else if (campo === 'fecha') { va = new Date(va); vb = new Date(vb); }
        else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
        return dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return filtrados;
}

function filtrarGastos() { gastosPagina = 1; renderizarTablaGastos(); }
function cambiarPaginaGastos(dir) {
    gastosPagina += dir === 'next' ? 1 : -1;
    if (gastosPagina < 1) gastosPagina = 1;
    renderizarTablaGastos();
}
function ordenarGastos(campo) {
    if (gastosOrden.campo === campo) gastosOrden.dir = gastosOrden.dir === 'asc' ? 'desc' : 'asc';
    else { gastosOrden.campo = campo; gastosOrden.dir = 'asc'; }
    renderizarTablaGastos();
}

function actualizarKPIsGastos(gastos) {
    const total = gastos.reduce((s, g) => s + Number(g.monto || 0), 0);
    const ahora = new Date();
    const mes = gastos.filter(g => {
        const f = new Date(g.fecha_gasto);
        return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
    });
    const totalMes = mes.reduce((s, g) => s + Number(g.monto || 0), 0);
    const categorias = new Set(gastos.map(g => g.categoria));
    const promedio = gastos.length > 0 ? total / gastos.length : 0;

    document.getElementById('totalGastos').textContent = '$' + total.toLocaleString('es-CO');
    document.getElementById('gastosMes').textContent = '$' + totalMes.toLocaleString('es-CO');
    document.getElementById('totalCategorias').textContent = categorias.size;
    document.getElementById('promedioGasto').textContent = '$' + Math.round(promedio).toLocaleString('es-CO');
}

function renderizarGraficosGastos(gastos) {
    // Gráfico por categoría
    const catMap = {};
    gastos.forEach(g => {
        const cat = g.categoria || 'otros';
        catMap[cat] = (catMap[cat] || 0) + Number(g.monto || 0);
    });
    const labels = Object.keys(catMap);
    const data = Object.values(catMap);
    const colores = ['#e60067','#1D9E75','#BA7517','#1a73e8','#7c3aed','#E24B4A','#f59e0b','#a3a9b0'];

    if (chartGastosCat) chartGastosCat.destroy();
    if (labels.length) {
        chartGastosCat = new Chart(document.getElementById('chartGastosCategoria'), {
            type: 'pie',
            data: { labels, datasets: [{ data, backgroundColor: colores.slice(0, labels.length) }] },
            options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } } }
        });
    }

    // Gráfico por mes (últimos 6 meses)
    const mesMap = {};
    gastos.forEach(g => {
        if (!g.fecha_gasto) return;
        const mes = g.fecha_gasto.substring(0, 7);
        mesMap[mes] = (mesMap[mes] || 0) + Number(g.monto || 0);
    });
    const meses = Object.keys(mesMap).sort().slice(-6);
    const dataMes = meses.map(m => mesMap[m]);

    if (chartGastosMes) chartGastosMes.destroy();
    if (meses.length) {
        chartGastosMes = new Chart(document.getElementById('chartGastosMensuales'), {
            type: 'bar',
            data: { labels: meses, datasets: [{ label: 'Gastos', data: dataMes, backgroundColor: '#e60067', borderRadius: 6 }] },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }
}

async function eliminarGasto(id) {
    if (!confirm('¿Eliminar este gasto permanentemente?')) return;
    try {
        const res = await fetch(`${API_BASE}/gastos/${id}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' }
        });
        if (res.ok) {
            mostrarToast('Gasto eliminado ✅', 'success');
            cargarGastos();
        } else {
            mostrarToast('Error al eliminar', 'error');
        }
    } catch (err) {
        mostrarToast('Error de conexión', 'error');
    }
}

document.addEventListener('DOMContentLoaded', cargarGastos);