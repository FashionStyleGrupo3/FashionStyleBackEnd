/* ==========================================================================
   inventario.js — Lógica del inventario de materiales (conectado a API)
   ========================================================================== */

const API_INV = '/api/inventario';

// ── Estado global ────────────────────────────────────────────────────────────

let materiales = [];
let paginaActual = 1;
const ITEMS_POR_PAGINA = 6;

// ── Utilidades ───────────────────────────────────────────────────────────────

function hoy() {
  return new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getEstado(stock, min) {
  if (stock <= 0)   return 'Sin Stock';
  if (stock < min)  return 'Stock Bajo';
  return 'En Stock';
}

function badgeClass(estado) {
  if (estado === 'En Stock')   return 'badge-green';
  if (estado === 'Stock Bajo') return 'badge-amber';
  return 'badge-red';
}

function stockClass(estado) {
  if (estado === 'En Stock')   return 'stock-green';
  if (estado === 'Stock Bajo') return 'stock-amber';
  return 'stock-red';
}

function codigoMat(idx) {
  return 'MAT-' + String(idx + 1).padStart(3, '0');
}

function formatStock(val, unidad) {
  const n = parseFloat(val);
  const str = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
  return unidad ? str + ' ' + unidad : str;
}

// ── Resolver ruta de imagen ──────────────────────────────────────────────────

function resolverRutaMat(ruta) {
  if (!ruta) return null;
  if (ruta.startsWith('data:') || ruta.startsWith('http')) return ruta;
  const limpia = ruta.replace(/^\/+/, "");
  if (limpia.startsWith("uploads/")) {
    return "/storage/" + limpia;
  }
  return "/" + limpia;
}

// ── API Calls ────────────────────────────────────────────────────────────────

async function cargarMateriales() {
  try {
    const res = await fetch(`${API_INV}/listar`);
    if (!res.ok) throw new Error('Error al cargar materiales');
    const data = await res.json();
    materiales = Array.isArray(data) ? data : (data.data || []);
    actualizarFiltroCategorias();
    renderTabla();
  } catch (err) {
    console.error('Error cargando materiales:', err);
    materiales = [];
    renderTabla();
  }
}

async function guardarMaterialAPI(mat) {
  const res = await fetch(`${API_INV}/crear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Nombre: mat.nombre,
      Clasificacion: mat.categoria,
      Stock: mat.stock,
      Stock_min: mat.min,
      Unidad_Medidad: mat.unidad,
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Error al guardar material');
  }
  return await res.json();
}

async function actualizarMaterialAPI(id, mat) {
  const res = await fetch(`${API_INV}/actualizar/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Nombre: mat.nombre,
      Clasificacion: mat.categoria,
      Stock: mat.stock,
      Stock_min: mat.min,
      Unidad_Medidad: mat.unidad,
    })
  });
  if (!res.ok) throw new Error('Error al actualizar material');
  return await res.json();
}

async function eliminarMaterialAPI(id) {
  const res = await fetch(`${API_INV}/eliminar/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar material');
  return await res.json();
}

// ── Estadísticas ─────────────────────────────────────────────────────────────

function actualizarStats() {
  const total  = materiales.length;
  const enStock = materiales.filter(m => getEstado(m.Stock, m.Stock_min || 0) === 'En Stock').length;
  const bajo   = materiales.filter(m => getEstado(m.Stock, m.Stock_min || 0) === 'Stock Bajo').length;
  const sin    = materiales.filter(m => getEstado(m.Stock, m.Stock_min || 0) === 'Sin Stock').length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-enstock').textContent = enStock;
  document.getElementById('stat-bajo').textContent  = bajo;
  document.getElementById('stat-sin').textContent   = sin;
}

// ── Filtro de categorías ─────────────────────────────────────────────────────

function actualizarFiltroCategorias() {
  const cats = [...new Set(materiales.map(m => m.Clasificacion || '').filter(Boolean))].sort();
  const sel  = document.getElementById('filtroCategoria');
  const actual = sel.value;

  sel.innerHTML = '<option value="">Categoría</option>' +
    cats.map(c => `<option value="${c}"${c === actual ? ' selected' : ''}>${c}</option>`).join('');
}

// ── Renderizado de la tabla ───────────────────────────────────────────────────

function getMateralesFiltrados() {
  const q     = document.getElementById('searchInput').value.toLowerCase().trim();
  const catF  = document.getElementById('filtroCategoria').value;
  const estF  = document.getElementById('filtroEstado').value;

  return materiales
    .map((m, i) => ({ ...m, _idx: i }))
    .filter(m => {
      const estado = getEstado(m.Stock, m.Stock_min || 0);
      const coincideBusqueda = !q ||
        (m.Nombre || '').toLowerCase().includes(q) ||
        (m.Clasificacion || '').toLowerCase().includes(q) ||
        codigoMat(m._idx).toLowerCase().includes(q);
      const coincideCat  = !catF || (m.Clasificacion || '') === catF;
      const coincideEst  = !estF || estado === estF;
      return coincideBusqueda && coincideCat && coincideEst;
    });
}

function renderTabla() {
  const filtrados   = getMateralesFiltrados();
  const totalFiltro = filtrados.length;
  const totalPages  = Math.max(1, Math.ceil(totalFiltro / ITEMS_POR_PAGINA));

  if (paginaActual > totalPages) paginaActual = totalPages;

  const inicio  = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const fin     = inicio + ITEMS_POR_PAGINA;
  const pagina  = filtrados.slice(inicio, fin);

  const body       = document.getElementById('tablaBody');
  const emptyState = document.getElementById('emptyState');

  actualizarStats();

  if (filtrados.length === 0) {
    body.innerHTML = '';
    emptyState.style.display = 'block';
    document.getElementById('footerLabel').textContent =
      materiales.length === 0 ? 'Sin materiales registrados' : 'Sin resultados para el filtro aplicado';
    renderPaginacion(0, 1);
    return;
  }

  emptyState.style.display = 'none';

  body.innerHTML = pagina.map(m => {
    const stockVal = m.Stock || 0;
    const minVal   = m.Stock_min || 0;
    const estado   = getEstado(stockVal, minVal);
    const bCls     = badgeClass(estado);
    const sCls     = stockClass(estado);
    const unidad   = m.Unidad_Medidad || '';
    const stockStr = formatStock(stockVal, unidad);
    const minStr   = formatStock(minVal, unidad);
    const idx      = m._idx;
    const id       = m.ID_Material;

    const imgUrl = m.Imagen ? resolverRutaMat(m.Imagen) : null;

    return `
      <tr>
        <td>
          <div class="mat-info">
            ${imgUrl
              ? `<img class="mat-img" src="${imgUrl}" alt="${escapeHtml(m.Nombre || '')}" onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex';">`
              : ''
            }
            <div class="mat-img-placeholder" aria-hidden="true"${imgUrl ? ' style="display:none;"' : ''}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <div>
              <div class="mat-name">${escapeHtml(m.Nombre || '')}</div>
              <div class="mat-code">${codigoMat(idx)}</div>
            </div>
          </div>
        </td>
        <td>${escapeHtml(m.Clasificacion || '')}</td>
        <td>${escapeHtml(unidad)}</td>
        <td class="${sCls}">${escapeHtml(stockStr)}</td>
        <td>${escapeHtml(minStr)}</td>
        <td><span class="badge ${bCls}">${estado}</span></td>
        <td>${m.fecha || hoy()}</td>
        <td>
          <button class="action-btn" onclick="editarMaterial(${idx})" aria-label="Editar material ${escapeHtml(m.Nombre || '')}">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-btn" onclick="eliminarMaterial(${idx})" aria-label="Eliminar material ${escapeHtml(m.Nombre || '')}">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  document.getElementById('footerLabel').textContent =
    `Mostrando ${inicio + 1} a ${Math.min(fin, totalFiltro)} de ${totalFiltro} material${totalFiltro !== 1 ? 'es' : ''}`;

  renderPaginacion(totalFiltro, totalPages);
}

// ── Paginación ────────────────────────────────────────────────────────────────

function renderPaginacion(total, totalPages) {
  const cont = document.getElementById('paginacion');
  if (total === 0 || totalPages <= 1) { cont.innerHTML = ''; return; }

  let html = `<button class="pg-btn" onclick="irPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'disabled' : ''}>‹</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || i === totalPages ||
      (i >= paginaActual - 1 && i <= paginaActual + 1)
    ) {
      html += `<button class="pg-btn${i === paginaActual ? ' active' : ''}" onclick="irPagina(${i})">${i}</button>`;
    } else if (i === paginaActual - 2 || i === paginaActual + 2) {
      html += `<span style="font-size:13px;color:#a3a9b0;padding:0 2px">…</span>`;
    }
  }

  html += `<button class="pg-btn" onclick="irPagina(${paginaActual + 1})" ${paginaActual === totalPages ? 'disabled' : ''}>›</button>`;
  cont.innerHTML = html;
}

function irPagina(n) {
  const filtrados  = getMateralesFiltrados();
  const totalPages = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  if (n < 1 || n > totalPages) return;
  paginaActual = n;
  renderTabla();
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function abrirModal(idx) {
  const esEdicion = idx !== undefined && idx >= 0;
  document.getElementById('editIndex').value = esEdicion ? idx : -1;
  document.getElementById('modalTitulo').textContent = esEdicion ? 'Editar material' : 'Registrar entrada';

  if (esEdicion) {
    const m = materiales[idx];
    document.getElementById('mNombre').value    = m.Nombre || '';
    document.getElementById('mCategoria').value = m.Clasificacion || '';
    document.getElementById('mUnidad').value    = m.Unidad_Medidad || '';
    document.getElementById('mStock').value     = m.Stock || 0;
    document.getElementById('mMin').value       = m.Stock_min || 0;
  } else {
    document.getElementById('mNombre').value    = '';
    document.getElementById('mCategoria').value = '';
    document.getElementById('mUnidad').value    = '';
    document.getElementById('mStock').value     = '';
    document.getElementById('mMin').value       = '';
  }

  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('mNombre').focus();
}

function cerrarModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

async function guardarMaterial() {
  const nombre    = document.getElementById('mNombre').value.trim();
  const categoria = document.getElementById('mCategoria').value.trim();
  const unidad    = document.getElementById('mUnidad').value.trim();
  const stockRaw  = document.getElementById('mStock').value;
  const minRaw    = document.getElementById('mMin').value;
  const stock     = parseFloat(stockRaw);
  const min       = parseFloat(minRaw);
  const idx       = parseInt(document.getElementById('editIndex').value);

  if (!nombre || !categoria || !unidad || stockRaw === '' || isNaN(stock) || minRaw === '' || isNaN(min)) {
    alert('Por favor completa todos los campos requeridos.');
    return;
  }

  if (stock < 0 || min < 0) {
    alert('Los valores de stock no pueden ser negativos.');
    return;
  }

  const mat = { nombre, categoria, unidad, stock, min, fecha: hoy() };

  try {
    if (idx >= 0) {
      // Editar existente
      const id = materiales[idx].ID_Material;
      await actualizarMaterialAPI(id, mat);
    } else {
      // Crear nuevo
      await guardarMaterialAPI(mat);
    }

    cerrarModal();
    await cargarMateriales();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

function editarMaterial(idx) {
  abrirModal(idx);
}

async function eliminarMaterial(idx) {
  const m = materiales[idx];
  if (!confirm(`¿Eliminar "${m.Nombre}"? Esta acción no se puede deshacer.`)) return;

  try {
    await eliminarMaterialAPI(m.ID_Material);
    await cargarMateriales();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// ── Seguridad: escape HTML ────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

// ── Event listeners ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Abrir modal - botón "Registrar material" en el topbar
  const btnAbrir = document.getElementById('btnAbrir');
  if (btnAbrir) {
    btnAbrir.addEventListener('click', () => abrirModal());
  }

  // Cerrar modal
  document.getElementById('btnCerrar').addEventListener('click', cerrarModal);
  document.getElementById('btnCancelar').addEventListener('click', cerrarModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) cerrarModal();
  });

  // Guardar
  document.getElementById('btnGuardar').addEventListener('click', guardarMaterial);

  // Enter en inputs del modal
  ['mNombre','mCategoria','mUnidad','mStock','mMin'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') guardarMaterial();
    });
  });

  // Cerrar modal con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarModal();
  });

  // Búsqueda y filtros
  document.getElementById('searchInput').addEventListener('input', () => {
    paginaActual = 1;
    renderTabla();
  });

  document.getElementById('filtroCategoria').addEventListener('change', () => {
    paginaActual = 1;
    renderTabla();
  });

  document.getElementById('filtroEstado').addEventListener('change', () => {
    paginaActual = 1;
    renderTabla();
  });

  // Cargar datos desde la API
  cargarMateriales();
});