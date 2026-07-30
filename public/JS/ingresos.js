// Ingresos.js v4 - Módulo completo de gestión de ingresos con gráficos y paginación
const API_BASE = '/api';
let ingresosData = [];
let ingresosPagina = 1;
const ingresosPorPagina = 10;
let ingresosOrden = { campo: 'fecha', dir: 'desc' };
let chartIngresosCat = null;
let chartIngresosMes = null;

function mostrarToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function abrirModal(id) { document.getElementById(id).classList.add('open'); }
function cerrarModal(id) { document.getElementById(id).classList.remove('open'); }

function abrirModalIngreso() {
    document.getElementById('ingresoDescripcion').value = '';
    document.getElementById('ingresoMonto').value = '';
    document.getElementById('ingresoCategoria').value = 'ventas';
    document.getElementById('ingresoFecha').value = new Date().toISOString().split('T')[0];
    document.getElementById('modalIngresoTitle').textContent = '💰 Nuevo Ingreso';
    abrirModal('modalIngreso');
}

async function guardarIngreso() {
    const descripcion = document.getElementById('ingresoDescripcion').value.trim();
    const monto = parseFloat(document.getElementById('ingresoMonto').value);
    const categoria = document.getElementById('ingresoCategoria').value;
    const fecha = document.getElementById('ingresoFecha').value || new Date().toISOString().split('T')[0];

    if (!descripcion) return mostrarToast('La descripción es obligatoria', 'error');
    if (!monto || monto <= 0) return mostrarToast('El monto debe ser mayor a cero', 'error');

    try {
        const res = await fetch(`${API_BASE}/ingresos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' },
            body: JSON.stringify({ descripcion, monto, categoria, fecha_ingreso: fecha })
        });
        const data = await res.json();
        if (res.ok || res.status === 201) {
            mostrarToast('Ingreso registrado exitosamente ✅', 'success');
            cerrarModal('modalIngreso');
            cargarIngresos();
        } else {
            mostrarToast(data.error || 'Error al guardar', 'error');
        }
    } catch (err) {
        mostrarToast('Error de conexión', 'error');
    }
}

async function cargarIngresos() {
    document.getElementById('loadingIngresos').style.display = 'block';
    try {
        const res = await fetch(`${API_BASE}/ingresos`, {
            headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        ingresosData = data.ingresos || data.data || [];
        document.getElementById('loadingIngresos').style.display = 'none';
        renderizarTablaIngresos();
        actualizarKPIsIngresos(ingresosData);
        renderizarGraficosIngresos(ingresosData);
    } catch (err) {
        document.getElementById('loadingIngresos').style.display = 'none';
        document.getElementById('tbodyIngresos').innerHTML = '<tr><td colspan="6" style="text-align:center;color:#E24B4A;padding:40px;">❌ Error al cargar ingresos</td></tr>';
        mostrarToast('Error al cargar ingresos', 'error');
    }
}

function renderizarTablaIngresos() {
    const tbody = document.getElementById('tbodyIngresos');
    const totalSpan = document.getElementById('totalRegistros');
    const filtrados = obtenerIngresosFiltrados();

    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#a3a9b0;padding:40px;"><div style="font-size:24px;margin-bottom:8px;">💰</div><div style="font-weight:500;">No hay ingresos registrados</div><div style="font-size:12px;margin-top:4px;">Usa el botón "Nuevo Ingreso" para agregar</div></td></tr>';
        totalSpan.textContent = '0 registros';
        return;
    }

    const inicio = (ingresosPagina - 1) * ingresosPorPagina;
    const fin = inicio + ingresosPorPagina;
    const pagina = filtrados.slice(inicio, fin);

    tbody.innerHTML = pagina.map(g => `
        <tr>
            <td>#${g.id_ingreso || g.id}</td>
            <td><span class="mat-name">${g.descripcion || 'Sin descripción'}</span></td>
            <td><span class="badge badge-green">${(g.categoria || 'otros').toUpperCase()}</span></td>
            <td><strong>$${Number(g.monto || 0).toLocaleString('es-CO')}</strong></td>
            <td>${g.fecha_ingreso ? new Date(g.fecha_ingreso).toLocaleDateString('es-CO') : '-'}</td>
            <td>
                <button class="action-btn" onclick="eliminarIngreso(${g.id_ingreso || g.id})" title="Eliminar">🗑️</button>
            </td>
        </tr>
    `).join('');
    totalSpan.textContent = `${filtrados.length} registros`;

    const totalPaginas = Math.ceil(filtrados.length / ingresosPorPagina);
    document.getElementById('infoPaginaIngreso').textContent = `Página ${ingresosPagina} de ${totalPaginas || 1}`;
    document.getElementById('btnPrevIngreso').disabled = ingresosPagina <= 1;
    document.getElementById('btnNextIngreso').disabled = ingresosPagina >= totalPaginas;
}

function obtenerIngresosFiltrados() {
    const texto = (document.getElementById('buscadorIngresos')?.value || '').toLowerCase();
    const categoria = document.getElementById('filtroCategoria')?.value || '';
    let filtrados = ingresosData;

    if (texto) filtrados = filtrados.filter(g => (g.descripcion || '').toLowerCase().includes(texto));
    if (categoria) filtrados = filtrados.filter(g => (g.categoria || '') === categoria);

    const [campo, dir] = [ingresosOrden.campo, ingresosOrden.dir];
    filtrados.sort((a, b) => {
        let va = a[campo === 'id' ? 'id_ingreso' : campo] || a[campo] || '';
        let vb = b[campo === 'id' ? 'id_ingreso' : campo] || b[campo] || '';
        if (campo === 'monto') { va = Number(va); vb = Number(vb); }
        else if (campo === 'fecha') { va = new Date(va); vb = new Date(vb); }
        else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
        return dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return filtrados;
}

function filtrarIngresos() { ingresosPagina = 1; renderizarTablaIngresos(); }
function cambiarPaginaIngresos(dir) {
    ingresosPagina += dir === 'next' ? 1 : -1;
    if (ingresosPagina < 1) ingresosPagina = 1;
    renderizarTablaIngresos();
}
function ordenarIngresos(campo) {
    if (ingresosOrden.campo === campo) ingresosOrden.dir = ingresosOrden.dir === 'asc' ? 'desc' : 'asc';
    else { ingresosOrden.campo = campo; ingresosOrden.dir = 'asc'; }
    renderizarTablaIngresos();
}

function actualizarKPIsIngresos(ingresos) {
    const total = ingresos.reduce((s, g) => s + Number(g.monto || 0), 0);
    const ahora = new Date();
    const mes = ingresos.filter(g => {
        const f = new Date(g.fecha_ingreso);
        return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
    });
    const totalMes = mes.reduce((s, g) => s + Number(g.monto || 0), 0);
    const categorias = new Set(ingresos.map(g => g.categoria));
    const promedio = ingresos.length > 0 ? total / ingresos.length : 0;

    document.getElementById('totalIngresos').textContent = '$' + total.toLocaleString('es-CO');
    document.getElementById('ingresosMes').textContent = '$' + totalMes.toLocaleString('es-CO');
    document.getElementById('totalCategorias').textContent = categorias.size;
    document.getElementById('promedioIngreso').textContent = '$' + Math.round(promedio).toLocaleString('es-CO');
}

function renderizarGraficosIngresos(ingresos) {
    const catMap = {};
    ingresos.forEach(g => {
        const cat = g.categoria || 'otros';
        catMap[cat] = (catMap[cat] || 0) + Number(g.monto || 0);
    });
    const labels = Object.keys(catMap);
    const data = Object.values(catMap);
    const colores = ['#1D9E75','#1a73e8','#BA7517','#7c3aed','#f59e0b','#a3a9b0','#e60067'];

    if (chartIngresosCat) chartIngresosCat.destroy();
    if (labels.length) {
        chartIngresosCat = new Chart(document.getElementById('chartIngresosCategoria'), {
            type: 'pie',
            data: { labels, datasets: [{ data, backgroundColor: colores.slice(0, labels.length) }] },
            options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } } }
        });
    }

    const mesMap = {};
    ingresos.forEach(g => {
        if (!g.fecha_ingreso) return;
        const mes = g.fecha_ingreso.substring(0, 7);
        mesMap[mes] = (mesMap[mes] || 0) + Number(g.monto || 0);
    });
    const meses = Object.keys(mesMap).sort().slice(-6);
    const dataMes = meses.map(m => mesMap[m]);

    if (chartIngresosMes) chartIngresosMes.destroy();
    if (meses.length) {
        chartIngresosMes = new Chart(document.getElementById('chartIngresosMensuales'), {
            type: 'bar',
            data: { labels: meses, datasets: [{ label: 'Ingresos', data: dataMes, backgroundColor: '#1D9E75', borderRadius: 6 }] },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }
}

async function eliminarIngreso(id) {
    if (!confirm('¿Eliminar este ingreso permanentemente?')) return;
    try {
        const res = await fetch(`${API_BASE}/ingresos/${id}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' }
        });
        if (res.ok) {
            mostrarToast('Ingreso eliminado ✅', 'success');
            cargarIngresos();
        } else {
            mostrarToast('Error al eliminar', 'error');
        }
    } catch (err) {
        mostrarToast('Error de conexión', 'error');
    }
}

document.addEventListener('DOMContentLoaded', cargarIngresos);