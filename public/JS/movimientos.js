// Movimientos.js - Módulo de movimientos con diseño unificado ERP
const API_BASE = '/api';

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

async function abrirModalMovimiento() {
    document.getElementById('movTipo').value = 'entrada';
    document.getElementById('movCantidad').value = '';
    document.getElementById('movMotivo').value = '';
    
    // Cargar productos en select
    try {
        const res = await fetch(`${API_BASE}/productos`, {
            headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' }
        });
        const data = await res.json();
        const productos = data.productos || data.data || [];
        const select = document.getElementById('movProducto');
        select.innerHTML = productos.map(p => `<option value="${p.id_producto}">${p.nombre}</option>`).join('');
    } catch (err) {
        mostrarToast('Error al cargar productos', 'error');
    }
    
    abrirModal('modalMovimiento');
}

async function guardarMovimiento() {
    const tipo = document.getElementById('movTipo').value;
    const producto_id = document.getElementById('movProducto').value;
    const cantidad = parseInt(document.getElementById('movCantidad').value);
    const motivo = document.getElementById('movMotivo').value.trim();

    if (!producto_id) return mostrarToast('Selecciona un producto', 'error');
    if (!cantidad || cantidad <= 0) return mostrarToast('La cantidad debe ser mayor a cero', 'error');

    try {
        const res = await fetch(`${API_BASE}/movimientos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' },
            body: JSON.stringify({ tipo, producto_id, cantidad, motivo, descripcion: motivo })
        });
        const data = await res.json();
        if (res.ok) {
            mostrarToast('Movimiento registrado exitosamente ✅', 'success');
            cerrarModal('modalMovimiento');
            cargarMovimientos();
        } else {
            mostrarToast(data.error || 'Error al guardar', 'error');
        }
    } catch (err) {
        mostrarToast('Error de conexión', 'error');
    }
}

async function cargarMovimientos() {
    try {
        const res = await fetch(`${API_BASE}/movimientos`, {
            headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const movimientos = data.movimientos || data.data || [];
        const timeline = document.getElementById('timelineMovimientos');
        const totalSpan = document.getElementById('totalRegistros');

        if (movimientos.length === 0) {
            timeline.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <div class="empty-title">Sin movimientos</div>
                    <div class="empty-desc">No hay movimientos registrados aún</div>
                </div>`;
            totalSpan.textContent = '0 movimientos';
            return;
        }

        timeline.innerHTML = movimientos.map(m => {
            const icono = m.tipo === 'entrada' ? '📥' : m.tipo === 'salida' ? '📤' : '🔄';
            const claseIcono = m.tipo === 'entrada' ? 'entrada' : m.tipo === 'salida' ? 'salida' : 'ajuste';
            const badgeClase = m.tipo === 'entrada' ? 'badge-green' : m.tipo === 'salida' ? 'badge-red' : 'badge-amber';
            return `
                <div class="timeline-item fade-in">
                    <div class="timeline-icon ${claseIcono}">${icono}</div>
                    <div class="timeline-content">
                        <div class="timeline-title">${m.producto_nombre || m.producto?.nombre || 'Producto'}</div>
                        <div class="timeline-meta">
                            <span class="badge ${badgeClase}">${(m.tipo || 'ajuste').toUpperCase()}</span>
                            <span>Cantidad: <strong>${m.cantidad || 0}</strong></span>
                            <span>${m.created_at ? new Date(m.created_at).toLocaleDateString('es-CO') : '-'}</span>
                            <span>${m.motivo || m.descripcion || ''}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        totalSpan.textContent = `${movimientos.length} movimientos`;

        // KPIs
        const entradas = movimientos.filter(m => m.tipo === 'entrada').reduce((s, m) => s + Number(m.cantidad || 0), 0);
        const salidas = movimientos.filter(m => m.tipo === 'salida').reduce((s, m) => s + Number(m.cantidad || 0), 0);
        const ajustes = movimientos.filter(m => m.tipo === 'ajuste').length;
        const balance = entradas - salidas;

        document.getElementById('totalEntradas').textContent = entradas.toLocaleString('es-CO');
        document.getElementById('totalSalidas').textContent = salidas.toLocaleString('es-CO');
        document.getElementById('totalAjustes').textContent = ajustes;
        document.getElementById('balanceMovimientos').textContent = balance.toLocaleString('es-CO');

    } catch (err) {
        document.getElementById('timelineMovimientos').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon" style="background:#fcebeb;color:#E24B4A;">❌</div>
                <div class="empty-title">Error al cargar</div>
                <div class="empty-desc">${err.message}</div>
            </div>`;
        mostrarToast('Error al cargar movimientos', 'error');
    }
}

function filtrarMovimientos() {
    const texto = (document.getElementById('buscadorMovimientos')?.value || '').toLowerCase();
    const tipo = document.getElementById('filtroTipo')?.value || '';
    const items = document.querySelectorAll('.timeline-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const coincideTipo = !tipo || text.includes(tipo);
        const coincideTexto = !texto || text.includes(texto);
        item.style.display = coincideTexto && coincideTipo ? '' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', cargarMovimientos);