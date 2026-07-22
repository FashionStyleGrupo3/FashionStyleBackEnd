// ======================================================
// PLANIFICACIÓN DE PRODUCCIÓN - Módulo Profesional ERP
// ======================================================

const API = '/api/calculadora';
let modoCalculo = 'simular';
let ultimoResultado = null;
let _productos = [];
let _materiales = [];
let _unidadesMedida = [];

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', init);

async function init() {
  await Promise.all([cargarProductos(), cargarMateriales(), cargarUnidadesMedida()]);
  setupDateInputs();
}

function setupDateInputs() {
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('calc-fecha-prod').value = hoy;
  const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  document.getElementById('calc-fecha-entrega').value = manana;
}

// ===================== LOADING / TOAST =====================
function showLoading() { document.getElementById('loading').classList.add('show'); }
function hideLoading() { document.getElementById('loading').classList.remove('show'); }

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  const icon = document.getElementById('toast-icon');
  const text = document.getElementById('toast-msg');
  const icons = { success: 'ti-circle-check', error: 'ti-alert-circle', warning: 'ti-alert-triangle', info: 'ti-info-circle' };
  icon.className = `ti ${icons[type] || icons.info}`;
  text.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}

// ===================== SIDEBAR =====================
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ===================== TAB SWITCHING =====================
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('[id^="panel-"]').forEach(p => p.style.display = 'none');

  const panels = { calcular: 'panel-calcular', formula: 'panel-formula', historial: 'panel-historial', dashboard: 'panel-dashboard' };
  const panel = document.getElementById(panels[tab]);
  if (panel) panel.style.display = 'block';

  const btns = document.querySelectorAll('.tab-btn');
  const idx = { calcular: 0, formula: 1, historial: 2, dashboard: 3 };
  if (btns[idx[tab]]) btns[idx[tab]].classList.add('active');

  if (tab === 'historial') cargarHistorial();
  if (tab === 'dashboard') cargarDashboard();
}

// ===================== MODO CÁLCULO =====================
function setModoCalculo(modo) {
  modoCalculo = modo;
  document.getElementById('toggle-simular').classList.toggle('active', modo === 'simular');
  document.getElementById('toggle-confirmar').classList.toggle('active', modo === 'confirmar');
  const btn = document.getElementById('btn-calcular-text');
  btn.textContent = modo === 'confirmar' ? 'Calcular y Confirmar Producción' : 'Calcular Planificación';
}

// ===================== LOAD DATA =====================
async function cargarProductos() {
  try {
    const r = await fetch(`${API}/productos`);
    const json = await r.json();
    if (!json.ok) throw new Error(json.message);
    _productos = json.data;
    const selects = ['calc-producto', 'conf-producto', 'form-producto', 'hist-producto'];
    selects.forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      sel.innerHTML = '<option value="">Selecciona un producto</option>';
      json.data.forEach(p => {
        sel.innerHTML += `<option value="${p.id_producto}">${p.nombre}</option>`;
      });
    });
  } catch (e) {
    console.error('Error cargando productos:', e);
  }
}

async function cargarMateriales() {
  try {
    const r = await fetch(`${API}/materiales`);
    const json = await r.json();
    if (!json.ok) throw new Error(json.message);
    _materiales = json.data;
  } catch (e) {
    console.error('Error cargando materiales:', e);
  }
}

async function cargarUnidadesMedida() {
  try {
    const r = await fetch(`${API}/unidades-medida`);
    const json = await r.json();
    if (!json.ok) throw new Error(json.message);
    _unidadesMedida = json.data;
  } catch (e) {
    console.error('Error cargando unidades:', e);
  }
}

// ===================== ON PRODUCTO CHANGE =====================
async function onProductoChange() {
  const id = document.getElementById('calc-producto').value;
  if (!id) return;
  const prod = _productos.find(p => p.id_producto == id);
  if (prod && prod.precio) {
    document.getElementById('calc-precio').value = prod.precio;
  }
}

// ===================== CÁLCULO PRINCIPAL =====================
async function calcularPlanificacion() {
  const data = getFormData();
  if (!data) return;

  showLoading();
  try {
    const endpoint = modoCalculo === 'confirmar' ? `${API}/confirmar` : `${API}/guardar`;
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await r.json();

    if (json.ok === false) {
      const msg = json.errors ? json.errors.join(', ') : json.message;
      throw new Error(msg || 'Error en el cálculo');
    }

    ultimoResultado = json;
    mostrarResultados(json);

    if (modoCalculo === 'confirmar') {
      showToast('Producción confirmada exitosamente. Materiales descontados del inventario.', 'success');
    } else {
      showToast('Cálculo realizado exitosamente', 'success');
    }
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
    console.error(e);
  } finally {
    hideLoading();
  }
}

function getFormData() {
  const producto = document.getElementById('calc-producto').value;
  const tipo = document.getElementById('calc-tipo').value;
  const cantidad = document.getElementById('calc-cantidad').value;
  const precio = document.getElementById('calc-precio').value;

  if (!producto) { showToast('Selecciona un producto', 'warning'); return null; }
  if (!cantidad || cantidad <= 0) { showToast('Ingresa una cantidad válida', 'warning'); return null; }
  if (!precio || precio <= 0) { showToast('Ingresa un precio de venta', 'warning'); return null; }

  return {
    producto_id: parseInt(producto),
    tipo_calculo: tipo,
    cantidad: parseFloat(cantidad),
    precio_venta: parseFloat(precio),
    descuento_porcentaje: parseFloat(document.getElementById('calc-descuento').value || 0),
    iva_porcentaje: parseFloat(document.getElementById('calc-iva').value || 0),
    desperdicio_porcentaje: parseFloat(document.getElementById('calc-desperdicio').value || 0),
    margen_ganancia_deseado: parseFloat(document.getElementById('calc-margen').value || 0),
    costo_transporte: parseFloat(document.getElementById('calc-transporte').value || 0),
    costo_empaque: parseFloat(document.getElementById('calc-empaque').value || 0),
    costo_etiquetas: parseFloat(document.getElementById('calc-etiquetas').value || 0),
    costo_mano_obra: parseFloat(document.getElementById('calc-mano-obra').value || 0),
    costo_hora_produccion: parseFloat(document.getElementById('calc-costo-hora').value || 0),
    horas_estimadas: parseFloat(document.getElementById('calc-horas').value || 0),
    fecha_estimada: document.getElementById('calc-fecha-prod').value,
    fecha_entrega: document.getElementById('calc-fecha-entrega').value,
    cliente: document.getElementById('calc-cliente').value,
    observaciones: document.getElementById('calc-observaciones').value,
  };
}

// ===================== MOSTRAR RESULTADOS =====================
function mostrarResultados(r) {
  const res = document.getElementById('resultados');
  res.style.display = 'block';

  // Resumen ejecutivo
  mostrarResumenEjecutivo(r);

  // Alerta faltante
  const alerta = document.getElementById('alerta-faltante');
  const faltanteLista = document.getElementById('faltante-lista');
  if (r.inventario && r.inventario.hay_faltante) {
    alerta.style.display = 'block';
    faltanteLista.innerHTML = r.inventario.materiales_faltantes.map(m =>
      `<div style="font-size:13px;padding:2px 0;">• <strong>${m.material}</strong>: necesitas ${m.necesario} ${m.unidad}, tienes ${m.disponible} ${m.unidad} (faltan ${m.faltante})</div>`
    ).join('');
  } else {
    alerta.style.display = 'none';
  }

  // Producción máxima
  const maxContainer = document.getElementById('max-prod-container');
  if (r.produccion_maxima) {
    maxContainer.style.display = 'block';
    const pm = r.produccion_maxima;
    maxContainer.innerHTML = `
      <div class="max-prod-card">
        <div class="max-label">Producción máxima posible con inventario actual</div>
        <div class="max-value">${pm.maxima_posible} unidades</div>
        <div class="max-limite">Material limitante: <strong>${pm.material_limitante}</strong></div>
        <div style="margin-top:8px;font-size:13px;">
          <span class="badge ${pm.se_puede_fabricar ? 'badge-success' : 'badge-danger'}">
            ${pm.se_puede_fabricar ? '✓ Se puede fabricar la cantidad solicitada' : '✗ No hay suficiente inventario'}
          </span>
        </div>
      </div>
    `;
  }

  // Tabla de materiales
  const tbody = document.getElementById('tabla-materiales');
  if (r.detalle_materiales) {
    tbody.innerHTML = r.detalle_materiales.map(m => `
      <tr>
        <td><strong>${m.material}</strong></td>
        <td>${m.unidad}</td>
        <td>${m.consumo_unitario}</td>
        <td>${m.cantidad_requerida}</td>
        <td>${m.disponible}</td>
        <td>${m.faltante > 0 ? `<span class="badge badge-danger">${m.faltante}</span>` : '<span class="badge badge-success">0</span>'}</td>
        <td>$${formatNum(m.costo_unitario)}</td>
        <td>$${formatNum(m.costo_total)}</td>
        <td>${m.proveedor || '-'}</td>
      </tr>
    `).join('');
  }

  // Lista de compras
  const comprasContainer = document.getElementById('compras-container');
  const comprasLista = document.getElementById('compras-lista');
  const compraTotal = document.getElementById('compra-total');
  if (r.lista_compras && r.lista_compras.length > 0) {
    comprasContainer.style.display = 'block';
    comprasLista.innerHTML = r.lista_compras.map(c => `
      <div class="compra-item">
        <div>
          <strong>${c.material}</strong>
          <div style="font-size:12px;color:#92400e;">Faltante: ${c.cantidad_faltante} ${c.unidad} — Proveedor: ${c.proveedor}</div>
        </div>
        <div style="text-align:right;font-weight:600;">$${formatNum(c.costo_total_estimado)}</div>
      </div>
    `).join('');
    compraTotal.textContent = `Total estimado de compras: $${formatNum(r.costo_total_compra)}`;
  } else {
    comprasContainer.style.display = 'none';
  }

  // Costos
  if (r.costos) {
    const c = r.costos;
    document.getElementById('res-costo-mat').textContent = '$' + formatNum(c.costo_materiales);
    document.getElementById('res-costo-mo').textContent = '$' + formatNum(c.costo_mano_obra);
    document.getElementById('res-costo-trans').textContent = '$' + formatNum(c.costo_transporte);
    document.getElementById('res-costo-emp').textContent = '$' + formatNum(c.costo_empaque);
    document.getElementById('res-costo-etq').textContent = '$' + formatNum(c.costo_etiquetas);
    document.getElementById('res-costo-op').textContent = '$' + formatNum(c.costo_operativo);
    document.getElementById('res-costo-ind').textContent = '$' + formatNum(c.costo_indirecto);
    document.getElementById('res-costo-total').textContent = '$' + formatNum(c.costo_total_fabricacion);
    document.getElementById('res-costo-und').textContent = '$' + formatNum(c.costo_por_unidad);
    document.getElementById('res-costo-doc').textContent = '$' + formatNum(c.costo_por_docena);
  }

  // Ingresos
  if (r.ingresos) {
    const i = r.ingresos;
    document.getElementById('res-precio').textContent = '$' + formatNum(i.precio_venta);
    document.getElementById('res-ing-bruto').textContent = '$' + formatNum(i.ingreso_bruto);
    document.getElementById('res-descuento').textContent = '$' + formatNum(i.descuento_calculado) + ' (' + i.descuento_porcentaje + '%)';
    document.getElementById('res-subtotal').textContent = '$' + formatNum(i.ingreso_bruto - i.descuento_calculado);
    document.getElementById('res-iva').textContent = '$' + formatNum(i.iva_calculado) + ' (' + i.iva_porcentaje + '%)';
    document.getElementById('res-ing-net').textContent = '$' + formatNum(i.ingreso_neto);
  }

  // Ganancias
  if (r.ganancias) {
    const g = r.ganancias;
    document.getElementById('res-gan-bruta').textContent = '$' + formatNum(g.ganancia_bruta);
    document.getElementById('res-gan-neta').textContent = '$' + formatNum(g.ganancia_neta);
    document.getElementById('res-margen-val').textContent = g.margen_utilidad + '%';
    document.getElementById('res-rentabilidad').textContent = g.rentabilidad + '%';
    document.getElementById('res-punto-eq').textContent = g.punto_equilibrio + ' unidades';

    // Alerta de margen
    const margenAlerta = document.getElementById('margen-alerta');
    if (g.margen_deseado > 0) {
      margenAlerta.style.display = 'block';
      if (g.cumple_margen) {
        margenAlerta.style.background = 'var(--success-light)';
        margenAlerta.style.color = 'var(--success)';
        margenAlerta.innerHTML = `<i class="ti ti-circle-check"></i> El margen de utilidad (${g.margen_utilidad}%) cumple con el margen deseado (${g.margen_deseado}%)`;
      } else {
        margenAlerta.style.background = 'var(--warning-light)';
        margenAlerta.style.color = 'var(--warning)';
        margenAlerta.innerHTML = `<i class="ti ti-alert-triangle"></i> El margen de utilidad (${g.margen_utilidad}%) NO alcanza el margen deseado (${g.margen_deseado}%)`;
      }
    } else {
      margenAlerta.style.display = 'none';
    }
  }

  // Botón confirmar
  const btnConfirmar = document.getElementById('btn-confirmar-prod');
  if (modoCalculo === 'simular' && r.planificacion_id && r.estado === 'simulado') {
    btnConfirmar.style.display = 'inline-flex';
  } else {
    btnConfirmar.style.display = 'none';
  }

  // Scroll a resultados
  res.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function mostrarResumenEjecutivo(r) {
  const container = document.getElementById('resumen-ejecutivo');
  const re = r.resumen_ejecutivo || {};
  const prod = r.produccion || {};

  const cards = [
    { icon: 'ti ti-box', label: 'Materiales Req.', value: re.total_materiales_requeridos || 0, color: 'primary' },
    { icon: 'ti ti-alert-triangle', label: 'Materiales Falt.', value: re.materiales_faltantes || 0, color: re.materiales_faltantes > 0 ? 'danger' : 'success' },
    { icon: 'ti ti-coin', label: 'Costo Total', value: '$' + formatNum(re.costo_total || 0), color: 'warning' },
    { icon: 'ti ti-trending-up', label: 'Ingreso Proyectado', value: '$' + formatNum(re.ingreso_proyectado || 0), color: 'info' },
    { icon: 'ti ti-chart-bar', label: 'Ganancia Proyectada', value: '$' + formatNum(re.ganancia_proyectada || 0), color: re.ganancia_proyectada > 0 ? 'success' : 'danger' },
    { icon: 'ti ti-percentage', label: 'Margen', value: (re.margen || 0) + '%', color: 'primary' },
    { icon: 'ti ti-stack', label: 'Prod. Máxima', value: re.produccion_maxima_posible || 0, color: 'info' },
  ];

  container.innerHTML = cards.map(c => `
    <div class="resumen-card ${c.color}">
      <div class="resumen-icon"><i class="${c.icon}"></i></div>
      <div class="resumen-label">${c.label}</div>
      <div class="resumen-valor">${c.value}</div>
    </div>
  `).join('');
}

// ===================== PRODUCCIÓN MÁXIMA =====================
async function calcularProduccionMaxima() {
  const productoId = document.getElementById('calc-producto').value;
  if (!productoId) { showToast('Selecciona un producto primero', 'warning'); return; }

  showLoading();
  try {
    const r = await fetch(`${API}/produccion-maxima/${productoId}`);
    const json = await r.json();
    if (!json.ok) throw new Error(json.message);

    const pm = json.data;
    let html = `<div class="max-prod-card">
      <div class="max-label">Análisis de producción máxima posible</div>
      <div class="max-value">${pm.produccion_maxima} unidades</div>
      <div class="max-limite">Material limitante: <strong>${pm.material_limitante}</strong></div>
    </div>
    <div style="margin-top:12px;">
      <table class="calc-table">
        <thead><tr><th>Material</th><th>Unidad</th><th>Disponible</th><th>Consumo/Unidad</th><th>Prod. Posible</th></tr></thead>
        <tbody>
    `;
    pm.detalle_materiales.forEach(m => {
      html += `<tr><td>${m.material}</td><td>${m.unidad}</td><td>${m.disponible}</td><td>${m.consumo_por_unidad}</td><td><strong>${m.produccion_posible}</strong></td></tr>`;
    });
    html += '</tbody></table></div>';

    showModal('Producción Máxima Posible', html);
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  } finally {
    hideLoading();
  }
}

// ===================== GUARDAR / CONFIRMAR =====================
async function guardarSimulacion() {
  if (!ultimoResultado) { showToast('Realiza un cálculo primero', 'warning'); return; }
  if (ultimoResultado.planificacion_id) {
    showToast('Planificación guardada con ID: ' + ultimoResultado.planificacion_id, 'success');
    return;
  }
  showToast('Ya está guardada', 'info');
}

async function confirmarProduccion() {
  if (!ultimoResultado || !ultimoResultado.planificacion_id) {
    showToast('Realiza un cálculo primero', 'warning');
    return;
  }

  const confirm = await Swal.fire({
    title: '¿Confirmar producción?',
    text: 'Esto descontará los materiales del inventario y registrará la producción. ¿Estás seguro?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#059669',
    cancelButtonColor: '#dc2626',
    confirmButtonText: 'Sí, confirmar producción',
    cancelButtonText: 'Cancelar'
  });

  if (!confirm.isConfirmed) return;

  showLoading();
  try {
    const r = await fetch(`${API}/confirmar/${ultimoResultado.planificacion_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await r.json();
    if (!json.ok) throw new Error(json.message || 'Error al confirmar');

    showToast('Producción confirmada. Materiales descontados.', 'success');
    ultimoResultado.estado = 'confirmado';
    document.getElementById('btn-confirmar-prod').style.display = 'none';
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  } finally {
    hideLoading();
  }
}

// ===================== EXPORTAR =====================
function exportarResultados(formato) {
  if (!ultimoResultado) { showToast('Realiza un cálculo primero', 'warning'); return; }

  const prod = ultimoResultado.produccion || {};
  const costos = ultimoResultado.costos || {};
  const ingresos = ultimoResultado.ingresos || {};
  const ganancias = ultimoResultado.ganancias || {};
  const re = ultimoResultado.resumen_ejecutivo || {};

  let csv = '';
  csv += 'PLANIFICACIÓN DE PRODUCCIÓN\n';
  csv += '========================\n\n';
  csv += `Producto,${prod.producto || ''}\n`;
  csv += `Cantidad solicitada,${prod.cantidad_solicitada || 0}\n`;
  csv += `Total unidades,${prod.total_unidades || 0}\n`;
  csv += `Tipo cálculo,${prod.tipo_calculo || ''}\n\n`;

  csv += 'COSTOS\n';
  csv += `Materiales,$${formatNum(costos.costo_materiales)}\n`;
  csv += `Mano de obra,$${formatNum(costos.costo_mano_obra)}\n`;
  csv += `Transporte,$${formatNum(costos.costo_transporte)}\n`;
  csv += `Empaque,$${formatNum(costos.costo_empaque)}\n`;
  csv += `Etiquetas,$${formatNum(costos.costo_etiquetas)}\n`;
  csv += `Costo operativo,$${formatNum(costos.costo_operativo)}\n`;
  csv += `Costo indirecto,$${formatNum(costos.costo_indirecto)}\n`;
  csv += `Total fabricación,$${formatNum(costos.costo_total_fabricacion)}\n`;
  csv += `Costo por unidad,$${formatNum(costos.costo_por_unidad)}\n`;
  csv += `Costo por docena,$${formatNum(costos.costo_por_docena)}\n\n`;

  csv += 'INGRESOS\n';
  csv += `Precio venta,$${formatNum(ingresos.precio_venta)}\n`;
  csv += `Bruto,$${formatNum(ingresos.ingreso_bruto)}\n`;
  csv += `Descuento,${ingresos.descuento_porcentaje || 0}%\n`;
  csv += `IVA,${ingresos.iva_porcentaje || 0}%\n`;
  csv += `Neto,$${formatNum(ingresos.ingreso_neto)}\n\n`;

  csv += 'GANANCIAS\n';
  csv += `Bruta,$${formatNum(ganancias.ganancia_bruta)}\n`;
  csv += `Neta,$${formatNum(ganancias.ganancia_neta)}\n`;
  csv += `Margen,${ganancias.margen_utilidad || 0}%\n`;
  csv += `Rentabilidad,${ganancias.rentabilidad || 0}%\n`;
  csv += `Punto equilibrio,${ganancias.punto_equilibrio || 0}\n\n`;

  csv += 'MATERIALES\n';
  csv += 'Material,Unidad,Consumo Unitario,Cantidad Requerida,Disponible,Faltante,Costo Unitario,Costo Total\n';
  if (ultimoResultado.detalle_materiales) {
    ultimoResultado.detalle_materiales.forEach(m => {
      csv += `${m.material},${m.unidad},${m.consumo_unitario},${m.cantidad_requerida},${m.disponible},${m.faltante},${m.costo_unitario},${m.costo_total}\n`;
    });
  }

  if (formato === 'csv') {
    downloadFile(csv, `planificacion_${prod.producto || 'export'}.csv`, 'text/csv');
  } else {
    // For PDF and Excel, just download as CSV for now (can be extended)
    downloadFile(csv, `planificacion_${prod.producto || 'export'}.csv`, 'text/csv');
    showToast(`Exportado como CSV (${formato} avanzado próximamente)`, 'info');
  }
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ===================== FÓRMULAS / RECETAS =====================
async function cargarFormula() {
  const productoId = document.getElementById('form-producto').value;
  const container = document.getElementById('formula-container');
  if (!productoId) {
    container.innerHTML = '<p style="color:var(--text-secondary); font-size:13px;">Selecciona un producto para configurar su receta de producción.</p>';
    return;
  }

  showLoading();
  try {
    const r = await fetch(`${API}/formula/${productoId}`);
    const json = await r.json();
    if (!json.ok) throw new Error(json.message);

    if (json.data.length === 0) {
      container.innerHTML = `
        <p style="color:var(--text-secondary); font-size:13px; margin-bottom:12px;">
          Este producto no tiene fórmula. Usa "Agregar material" para crear su receta.
        </p>
        <div id="formula-items"></div>
      `;
      return;
    }

    let html = '<div style="margin-bottom:12px;"><span class="badge badge-info">Fórmula existente</span></div><div id="formula-items">';
    json.data.forEach((item, i) => {
      html += crearItemFormulaHTML(item, i);
    });
    html += '</div>';
    container.innerHTML = html;
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  } finally {
    hideLoading();
  }
}

function crearItemFormulaHTML(item, idx) {
  const matOptions = _materiales.map(m =>
    `<option value="${m.ID_Material}" ${item.materia_prima_id == m.ID_Material ? 'selected' : ''}>${m.Nombre} (Stock: ${m.Stock})</option>`
  ).join('');

  const undOptions = _unidadesMedida.map(u =>
    `<option value="${u.id}" ${item.unidad_medida_id == u.id ? 'selected' : ''}>${u.nombre} (${u.abreviatura})</option>`
  ).join('');

  return `
    <div class="formula-item" style="background:#f9fafb; border:1px solid var(--border); border-radius:8px; padding:16px; margin-bottom:10px;">
      <div class="form-row cols-4" style="gap:10px;">
        <div class="form-group">
          <label>Material</label>
          <select class="inp formula-mat" data-idx="${idx}">
            <option value="">Seleccionar...</option>
            ${matOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Cantidad</label>
          <input class="inp formula-cant" type="number" value="${item.cantidad || 0}" step="0.01" min="0" data-idx="${idx}">
        </div>
        <div class="form-group">
          <label>Unidad</label>
          <select class="inp formula-und" data-idx="${idx}">
            <option value="">Seleccionar...</option>
            ${undOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Desperdicio %</label>
          <input class="inp formula-desp" type="number" value="${item.desperdicio_porcentaje || 0}" step="0.01" min="0" max="100" data-idx="${idx}">
        </div>
      </div>
      <div class="form-row cols-3" style="gap:10px;">
        <div class="form-group">
          <label>Costo unitario estimado</label>
          <div class="inp-group">
            <span class="inp-prefix">$</span>
            <input class="inp formula-costo" type="number" value="${item.costo_unitario_estimado || 0}" step="0.01" min="0" data-idx="${idx}">
          </div>
        </div>
        <div class="form-group">
          <label>Proveedor ID (opcional)</label>
          <input class="inp formula-prov" type="number" value="${item.proveedor_id || ''}" placeholder="ID" data-idx="${idx}">
        </div>
        <div class="form-group" style="display:flex;align-items:flex-end;">
          <button class="btn-danger btn-sm" onclick="eliminarItemFormula(this)" style="margin-bottom:16px;">
            <i class="ti ti-trash"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  `;
}

function agregarItemFormula() {
  const container = document.getElementById('formula-items');
  if (!container) {
    document.getElementById('formula-container').innerHTML = '<div id="formula-items"></div>';
  }
  const itemsContainer = document.getElementById('formula-items') || container;
  const idx = itemsContainer.children.length;
  const div = document.createElement('div');
  div.innerHTML = crearItemFormulaHTML({}, idx);
  itemsContainer.insertAdjacentHTML('beforeend', div.innerHTML);
}

function eliminarItemFormula(btn) {
  const item = btn.closest('.formula-item');
  if (item) item.remove();
}

async function guardarFormula() {
  const productoId = document.getElementById('form-producto').value;
  if (!productoId) { showToast('Selecciona un producto', 'warning'); return; }

  const items = [];
  const containers = document.querySelectorAll('#formula-items .formula-item');
  containers.forEach(container => {
    const mat = container.querySelector('.formula-mat').value;
    if (!mat) return;
    items.push({
      materia_prima_id: parseInt(mat),
      cantidad: parseFloat(container.querySelector('.formula-cant').value || 0),
      unidad_medida_id: container.querySelector('.formula-und').value ? parseInt(container.querySelector('.formula-und').value) : null,
      desperdicio_porcentaje: parseFloat(container.querySelector('.formula-desp').value || 0),
      costo_unitario_estimado: parseFloat(container.querySelector('.formula-costo').value || 0),
      proveedor_id: container.querySelector('.formula-prov').value ? parseInt(container.querySelector('.formula-prov').value) : null,
    });
  });

  if (items.length === 0) { showToast('Agrega al menos un material a la fórmula', 'warning'); return; }

  showLoading();
  try {
    const r = await fetch(`${API}/formula/guardar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producto_id: parseInt(productoId), items })
    });
    const json = await r.json();
    if (!json.ok) throw new Error(json.errors ? json.errors.join(', ') : json.message);

    showToast('Fórmula guardada correctamente', 'success');
    document.getElementById('form-mensaje').textContent = '✓ Guardado';
    setTimeout(() => document.getElementById('form-mensaje').textContent = '', 3000);
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  } finally {
    hideLoading();
  }
}

// ===================== HISTORIAL =====================
let historialPagina = 1;

async function cargarHistorial(pagina = 1) {
  historialPagina = pagina;
  showLoading();
  try {
    const params = new URLSearchParams({
      page: pagina,
      limit: 20
    });
    const producto = document.getElementById('hist-producto').value;
    if (producto) params.set('producto_id', producto);
    const estado = document.getElementById('hist-estado').value;
    if (estado) params.set('estado', estado);
    const desde = document.getElementById('hist-fecha-desde').value;
    if (desde) params.set('fecha_desde', desde);
    const hasta = document.getElementById('hist-fecha-hasta').value;
    if (hasta) params.set('fecha_hasta', hasta);

    const r = await fetch(`${API}/historial?${params}`);
    const json = await r.json();
    if (!json.ok) throw new Error(json.message);

    const h = json.data;
    const lista = document.getElementById('historial-lista');

    if (h.total === 0) {
      lista.innerHTML = `<div class="empty-state"><i class="ti ti-history"></i><h3>Sin planificaciones</h3><p>No se encontraron registros con los filtros seleccionados.</p></div>`;
      document.getElementById('historial-pagination').innerHTML = '';
      return;
    }

    lista.innerHTML = h.data.map(p => `
      <div class="historial-item" onclick="verPlanificacion(${p.id})">
        <div class="historial-header">
          <div>
            <strong>${p.producto ? p.producto.nombre : 'Producto #' + p.producto_id}</strong>
            <span class="badge ${p.estado === 'confirmado' ? 'badge-success' : p.estado === 'en_produccion' ? 'badge-info' : p.estado === 'completado' ? 'badge-primary' : 'badge-warning'}">
              ${p.estado || 'simulado'}
            </span>
          </div>
          <div style="font-size:13px;color:var(--text-secondary);">
            <i class="ti ti-coin"></i> $${formatNum(p.costo_total_fabricacion)}
            <span style="margin-left:8px;"><i class="ti ti-trending-up"></i> $${formatNum(p.ingreso_neto)}</span>
          </div>
        </div>
        <div class="historial-info">
          ${p.cantidad_solicitada} ${p.tipo_calculo === 'docena' ? 'docenas' : p.tipo_calculo === 'caja' ? 'cajas' : 'unidades'}
          &middot; ${p.total_unidades_producir} unidades totales
          &middot; <i class="ti ti-calendar"></i> ${new Date(p.created_at).toLocaleDateString()}
          ${p.cliente ? '&middot; <i class="ti ti-user"></i> ' + p.cliente : ''}
        </div>
      </div>
    `).join('');

    // Pagination
    const pag = document.getElementById('historial-pagination');
    let pagHtml = '';
    if (h.ultima_pagina > 1) {
      if (h.pagina > 1) pagHtml += `<button class="btn-outline btn-sm" onclick="cargarHistorial(${h.pagina - 1})"><i class="ti ti-chevron-left"></i></button>`;
      pagHtml += `<span style="padding:6px 12px;font-size:13px;">Pág. ${h.pagina} de ${h.ultima_pagina}</span>`;
      if (h.pagina < h.ultima_pagina) pagHtml += `<button class="btn-outline btn-sm" onclick="cargarHistorial(${h.pagina + 1})"><i class="ti ti-chevron-right"></i></button>`;
    }
    pag.innerHTML = pagHtml;
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  } finally {
    hideLoading();
  }
}

async function verPlanificacion(id) {
  showLoading();
  try {
    const r = await fetch(`${API}/planificacion/${id}`);
    const json = await r.json();
    if (!json.ok) throw new Error(json.message);

    const p = json.data;
    let html = `
      <div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h3 style="margin:0;">${p.producto ? p.producto.nombre : 'Producto #' + p.producto_id}</h3>
          <span class="badge ${p.estado === 'confirmado' ? 'badge-success' : 'badge-warning'}">${p.estado}</span>
        </div>
        <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">
          ${new Date(p.created_at).toLocaleString()} ${p.cliente ? '— Cliente: ' + p.cliente : ''}
        </div>
      </div>
      <div class="resumen-grid">
        <div class="resumen-item"><span class="resumen-label">Cantidad</span><span class="resumen-val">${p.cantidad_solicitada} (${p.total_unidades_producir} unds)</span></div>
        <div class="resumen-item"><span class="resumen-label">Costo total</span><span class="resumen-val">$${formatNum(p.costo_total_fabricacion)}</span></div>
        <div class="resumen-item"><span class="resumen-label">Ingreso neto</span><span class="resumen-val">$${formatNum(p.ingreso_neto)}</span></div>
        <div class="resumen-item"><span class="resumen-label">Ganancia neta</span><span class="resumen-val">$${formatNum(p.ganancia_neta)}</span></div>
        <div class="resumen-item"><span class="resumen-label">Margen</span><span class="resumen-val">${p.margen_utilidad}%</span></div>
        <div class="resumen-item"><span class="resumen-label">Prod. máxima</span><span class="resumen-val">${p.produccion_maxima_posible} unds</span></div>
      </div>
    `;

    if (p.detalles && p.detalles.length > 0) {
      html += '<hr style="margin:16px 0;"><h4 style="margin-bottom:8px;">Materiales</h4>';
      html += '<div style="font-size:13px;">';
      p.detalles.forEach(d => {
        const nom = d.materia_prima ? d.materia_prima.Nombre : 'Material #' + d.materia_prima_id;
        html += `<div style="padding:4px 0;"><strong>${nom}</strong>: ${d.cantidad_requerida} ${d.unidad || ''} — Costo: $${formatNum(d.costo_total)}</div>`;
      });
      html += '</div>';
    }

    if (!p.produccion_confirmada) {
      document.getElementById('modal-footer').innerHTML = `
        <button class="btn-success" onclick="confirmarDesdeModal(${p.id})"><i class="ti ti-circle-check"></i> Confirmar producción</button>
        <button class="btn-outline" onclick="cerrarModal()">Cerrar</button>
      `;
    } else {
      document.getElementById('modal-footer').innerHTML = `<button class="btn-outline" onclick="cerrarModal()">Cerrar</button>`;
    }

    showModal('Planificación #' + id, html);
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  } finally {
    hideLoading();
  }
}

async function confirmarDesdeModal(id) {
  cerrarModal();
  showLoading();
  try {
    const r = await fetch(`${API}/confirmar/${id}`, { method: 'POST' });
    const json = await r.json();
    if (!json.ok) throw new Error(json.message);
    showToast('Producción confirmada', 'success');
    cargarHistorial(historialPagina);
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  } finally {
    hideLoading();
  }
}

// ===================== DASHBOARD =====================
async function cargarDashboard() {
  const container = document.getElementById('dashboard-content');
  showLoading();
  try {
    const r = await fetch(`${API}/dashboard`);
    const json = await r.json();
    if (!json.ok) throw new Error(json.message);

    const d = json.data;
    const t = d.totales || {};
    const f = d.financiero || {};

    let html = `
      <div class="resumen-ejecutivo" style="margin-bottom:20px;">
        <div class="resumen-card primary">
          <div class="resumen-icon"><i class="ti ti-clipboard-list"></i></div>
          <div class="resumen-label">Total Planificaciones</div>
          <div class="resumen-valor">${t.total_planificaciones || 0}</div>
        </div>
        <div class="resumen-card success">
          <div class="resumen-icon"><i class="ti ti-circle-check"></i></div>
          <div class="resumen-label">Confirmadas</div>
          <div class="resumen-valor">${t.confirmadas || 0}</div>
        </div>
        <div class="resumen-card warning">
          <div class="resumen-icon"><i class="ti ti-eye"></i></div>
          <div class="resumen-label">Simulaciones</div>
          <div class="resumen-valor">${t.simulaciones || 0}</div>
        </div>
        <div class="resumen-card info">
          <div class="resumen-icon"><i class="ti ti-settings"></i></div>
          <div class="resumen-label">En Producción</div>
          <div class="resumen-valor">${t.en_produccion || 0}</div>
        </div>
        <div class="resumen-card success">
          <div class="resumen-icon"><i class="ti ti-check"></i></div>
          <div class="resumen-label">Completadas</div>
          <div class="resumen-valor">${t.completadas || 0}</div>
        </div>
      </div>

      <div class="form-row cols-3" style="gap:16px;margin-bottom:20px;">
        <div class="form-card" style="text-align:center;flex:1;">
          <div style="font-size:12px;color:var(--text-secondary);text-transform:uppercase;font-weight:600;">Costo Total</div>
          <div style="font-size:28px;font-weight:700;color:var(--warning);">$${formatNum(f.costo_total || 0)}</div>
        </div>
        <div class="form-card" style="text-align:center;flex:1;">
          <div style="font-size:12px;color:var(--text-secondary);text-transform:uppercase;font-weight:600;">Ingreso Total</div>
          <div style="font-size:28px;font-weight:700;color:var(--info);">$${formatNum(f.ingreso_total || 0)}</div>
        </div>
        <div class="form-card" style="text-align:center;flex:1;">
          <div style="font-size:12px;color:var(--text-secondary);text-transform:uppercase;font-weight:600;">Ganancia Total</div>
          <div style="font-size:28px;font-weight:700;color:var(--success);">$${formatNum(f.ganancia_total || 0)}</div>
        </div>
      </div>

      <h4 style="margin-bottom:12px;">Últimas planificaciones</h4>
    `;

    if (d.ultimas_planificaciones && d.ultimas_planificaciones.length > 0) {
      d.ultimas_planificaciones.forEach(p => {
        html += `
          <div class="historial-item" onclick="verPlanificacion(${p.id})">
            <div class="historial-header">
              <span><strong>${p.producto ? p.producto.nombre : 'Producto #' + p.producto_id}</strong> <span class="badge ${p.estado === 'confirmado' ? 'badge-success' : 'badge-warning'}">${p.estado}</span></span>
              <span style="font-size:13px;color:var(--text-secondary);">$${formatNum(p.ingreso_neto)}</span>
            </div>
            <div class="historial-info">${p.cantidad_solicitada} unidades — ${new Date(p.created_at).toLocaleDateString()}</div>
          </div>
        `;
      });
    } else {
      html += '<p style="color:var(--text-secondary);">No hay planificaciones registradas.</p>';
    }

    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><i class="ti ti-alert-circle"></i><h3>Error</h3><p>${e.message}</p></div>`;
  } finally {
    hideLoading();
  }
}

// ===================== MODAL =====================
function showModal(title, body) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal').classList.add('show');
}

function cerrarModal() {
  document.getElementById('modal').classList.remove('show');
}

// ===================== UTILITIES =====================
function formatNum(num) {
  if (num === null || num === undefined) return '0.00';
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}