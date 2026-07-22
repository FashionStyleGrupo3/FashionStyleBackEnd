/* =========================================
   FASHION STYLE — Calculadora de Producción
   CalculadoraProduccion.js
   ========================================= */

const API_CALC = '/api/calculadora';

// ── Toast ────────────────────────────────

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon  = document.getElementById('toast-icon');
  const msgEl = document.getElementById('toast-msg');
  msgEl.textContent = message;
  icon.className = type === 'success' ? 'ti ti-circle-check' : 'ti ti-alert-circle';
  toast.className = `toast show ${type}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.className = 'toast'; }, 3500);
}

// ── Formateo de moneda ───────────────────

function formatMoney(val) {
  return '$' + Number(val).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Tab switching ─────────────────────────

function switchTab(tab) {
  document.getElementById('tab-calcular').classList.toggle('active', tab === 'calcular');
  document.getElementById('tab-configurar').classList.toggle('active', tab === 'configurar');
  document.getElementById('panel-calcular').style.display = tab === 'calcular' ? 'block' : 'none';
  document.getElementById('panel-configurar').style.display = tab === 'configurar' ? 'block' : 'none';
}

// ── Cargar productos en selects ───────────

async function cargarProductos() {
  try {
    const res = await fetch(`${API_CALC}/productos`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.message || 'Error al cargar productos');

    const opts = json.data.map(p =>
      `<option value="${p.id_producto}">${p.nombre}</option>`
    ).join('');

    document.getElementById('calc-producto').innerHTML = '<option value="">Selecciona un producto</option>' + opts;
    document.getElementById('conf-producto').innerHTML = '<option value="">Selecciona un producto</option>' + opts;
  } catch (err) {
    console.error('Error cargando productos:', err);
  }
}

// ── Cargar materiales para configuración ──

let materialesData = [];

async function cargarMateriales() {
  try {
    const res = await fetch(`${API_CALC}/materiales`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.message || 'Error al cargar materiales');
    materialesData = json.data;
  } catch (err) {
    console.error('Error cargando materiales:', err);
  }
}

// ── CALCULAR PRODUCCIÓN ──────────────────

async function calcularProduccion() {
  const productoId = document.getElementById('calc-producto').value;
  const tipo = document.getElementById('calc-tipo').value;
  const cantidad = parseFloat(document.getElementById('calc-cantidad').value);
  const precio = parseFloat(document.getElementById('calc-precio').value);
  const desperdicio = parseFloat(document.getElementById('calc-desperdicio')?.value) || 0;
  const descuento = parseFloat(document.getElementById('calc-descuento')?.value) || 0;
  const iva = parseFloat(document.getElementById('calc-iva')?.value) || 0;
  const margen = parseFloat(document.getElementById('calc-margen')?.value) || 0;
  const costoTransporte = parseFloat(document.getElementById('calc-costo-transporte')?.value) || 0;
  const costoEmpaque = parseFloat(document.getElementById('calc-costo-empaque')?.value) || 0;
  const costoEtiquetas = parseFloat(document.getElementById('calc-costo-etiquetas')?.value) || 0;
  const costoManoObra = parseFloat(document.getElementById('calc-costo-mo')?.value) || 0;

  // Validaciones amigables
  if (!productoId) { showToast('Selecciona un producto para calcular.', 'error'); return; }
  if (!cantidad || isNaN(cantidad) || cantidad <= 0) { showToast('Ingresa cuántas unidades deseas fabricar.', 'error'); return; }
  if (!precio || isNaN(precio) || precio <= 0) { showToast('Ingresa el precio de venta por unidad.', 'error'); return; }

  const btn = document.getElementById('btn-calcular');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2"></i> Calculando…';

  try {
    const res = await fetch(`${API_CALC}/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        producto_id: parseInt(productoId),
        tipo_calculo: tipo,
        cantidad: cantidad,
        precio_venta: precio,
        desperdicio_porcentaje: desperdicio,
        descuento_porcentaje: descuento,
        iva_porcentaje: iva,
        margen_ganancia_deseado: margen,
        costo_transporte: costoTransporte,
        costo_empaque: costoEmpaque,
        costo_etiquetas: costoEtiquetas,
        costo_mano_obra: costoManoObra,
      })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.errors?.[0] || 'Error al calcular');

    mostrarResultados(json);
  } catch (err) {
    showToast(err.message, 'error');
    document.getElementById('resultados').style.display = 'none';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-calculator"></i> Calcular';
  }
}

function mostrarResultados(data) {
  const r = data;
  document.getElementById('resultados').style.display = 'block';

  // ===== RESUMEN EJECUTIVO (summary-cards) =====
  const summaryContainer = document.getElementById('summary-cards');
  if (summaryContainer && r.resumen_ejecutivo) {
    const s = r.resumen_ejecutivo;
    summaryContainer.innerHTML = `
      <div class="summary-card ${s.se_puede_producir ? 'success' : 'danger'}">
        <div class="icon">📦</div>
        <div class="label">Producción posible</div>
        <div class="value">${s.se_puede_producir ? 'Sí' : 'No'}</div>
      </div>
      <div class="summary-card info">
        <div class="icon">🧵</div>
        <div class="label">Materiales requeridos</div>
        <div class="value">${s.total_materiales_requeridos}</div>
      </div>
      <div class="summary-card ${s.materiales_faltantes > 0 ? 'danger' : 'success'}">
        <div class="icon">⚠️</div>
        <div class="label">Materiales faltantes</div>
        <div class="value">${s.materiales_faltantes}</div>
      </div>
      <div class="summary-card warning">
        <div class="icon">🏭</div>
        <div class="label">Producción máxima</div>
        <div class="value">${s.produccion_maxima_posible}</div>
      </div>
      <div class="summary-card info">
        <div class="icon">💰</div>
        <div class="label">Costo total</div>
        <div class="value">${formatMoney(s.costo_total)}</div>
      </div>
      <div class="summary-card success">
        <div class="icon">📈</div>
        <div class="label">Ganancia proyectada</div>
        <div class="value">${formatMoney(s.ganancia_proyectada)}</div>
      </div>
    `;
  }

  // ===== PRODUCCIÓN MÁXIMA (max-prod-container) =====
  const maxProdContainer = document.getElementById('max-prod-container');
  if (maxProdContainer && r.produccion_maxima) {
    const pm = r.produccion_maxima;
    const puedeFabricar = pm.se_puede_fabricar;
    maxProdContainer.innerHTML = `
      <div class="result-highlight ${puedeFabricar ? '' : 'error'}" style="margin-top:0;">
        <div class="label">${puedeFabricar ? '✅ Puedes fabricar esta cantidad' : '❌ No puedes fabricar esta cantidad con el inventario actual'}</div>
        ${!puedeFabricar ? `<div class="big-number">${pm.maxima_posible}</div>` : `<div class="big-number">${pm.maxima_posible}</div>`}
        <div class="sub-label">Unidades máximas que puedes fabricar con el inventario actual</div>
        ${pm.material_limitante ? `<div class="sub-label">Material limitante: <strong>${pm.material_limitante}</strong></div>` : ''}
      </div>
      ${pm.detalle && pm.detalle.length > 0 ? `
        <div style="font-size:13px;font-weight:500;color:#374151;margin-bottom:8px;">Detalle por material:</div>
        <div class="table-responsive">
          <table class="calc-table" style="font-size:12px;">
            <thead>
              <tr>
                <th>Material</th>
                <th>Unidad</th>
                <th>Disponible</th>
                <th>Consumo x unidad</th>
                <th>Producción posible</th>
              </tr>
            </thead>
            <tbody>
              ${pm.detalle.map(d => `
                <tr>
                  <td>${d.material}</td>
                  <td>${d.unidad}</td>
                  <td>${d.disponible}</td>
                  <td>${d.consumo_por_unidad}</td>
                  <td><strong>${d.produccion_posible}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
    `;
  }

  // ===== COSTOS =====
  // Usar los IDs que realmente existen en el HTML
  const elCostoTotal = document.getElementById('res-costo-total');
  if (elCostoTotal) elCostoTotal.textContent = formatMoney(r.costos.costo_total_fabricacion);

  const elCostoUnd = document.getElementById('res-costo-und');
  if (elCostoUnd) elCostoUnd.textContent = formatMoney(r.costos.costo_por_unidad);

  const elCostoDoc = document.getElementById('res-costo-doc');
  if (elCostoDoc) elCostoDoc.textContent = formatMoney(r.costos.costo_por_docena);

  // Costos individuales
  const costoMat = document.getElementById('res-costo-mat');
  if (costoMat) costoMat.textContent = formatMoney(r.costos.costo_materiales);
  const costoMO = document.getElementById('res-costo-mo');
  if (costoMO) costoMO.textContent = formatMoney(r.costos.costo_mano_obra);
  const costoTrans = document.getElementById('res-costo-trans');
  if (costoTrans) costoTrans.textContent = formatMoney(r.costos.costo_transporte);
  const costoEmp = document.getElementById('res-costo-emp');
  if (costoEmp) costoEmp.textContent = formatMoney(r.costos.costo_empaque);
  const costoEtq = document.getElementById('res-costo-etq');
  if (costoEtq) costoEtq.textContent = formatMoney(r.costos.costo_etiquetas);
  const costoOp = document.getElementById('res-costo-op');
  if (costoOp) costoOp.textContent = formatMoney(r.costos.costo_operativo);
  const costoInd = document.getElementById('res-costo-ind');
  if (costoInd) costoInd.textContent = formatMoney(r.costos.costo_indirecto);

  // ===== INGRESOS =====
  const elPrecio = document.getElementById('res-precio');
  if (elPrecio) elPrecio.textContent = formatMoney(r.ingresos.precio_venta);
  const elIngBruto = document.getElementById('res-ing-bruto');
  if (elIngBruto) elIngBruto.textContent = formatMoney(r.ingresos.ingreso_bruto);
  const elDesc = document.getElementById('res-descuento');
  if (elDesc) elDesc.textContent = formatMoney(r.ingresos.descuento_calculado);
  const elSubtotal = document.getElementById('res-subtotal');
  // Usar subtotal si existe en la respuesta, sino calcularlo
  const subtotalVal = r.ingresos.subtotal || (r.ingresos.ingreso_bruto - r.ingresos.descuento_calculado);
  if (elSubtotal) elSubtotal.textContent = formatMoney(subtotalVal);
  const elIva = document.getElementById('res-iva');
  if (elIva) elIva.textContent = formatMoney(r.ingresos.iva_calculado);
  const elIngNet = document.getElementById('res-ing-net');
  if (elIngNet) elIngNet.textContent = formatMoney(r.ingresos.ingreso_neto);

  // ===== GANANCIAS =====
  const elGanBruta = document.getElementById('res-gan-bruta');
  if (elGanBruta) elGanBruta.textContent = formatMoney(r.ganancias.ganancia_bruta);
  const elGanNeta = document.getElementById('res-gan-neta');
  if (elGanNeta) elGanNeta.textContent = formatMoney(r.ganancias.ganancia_neta);
  const elMargen = document.getElementById('res-margen-val');
  if (elMargen) elMargen.textContent = r.ganancias.margen_utilidad + '%';
  const elRent = document.getElementById('res-rentabilidad');
  if (elRent) elRent.textContent = r.ganancias.rentabilidad + '%';
  const elPuntoEq = document.getElementById('res-punto-eq');
  if (elPuntoEq) elPuntoEq.textContent = r.ganancias.punto_equilibrio + ' unidades';

  // Alerta de margen
  const margenAlerta = document.getElementById('margen-alerta');
  if (margenAlerta) {
    if (r.ganancias.margen_deseado > 0) {
      margenAlerta.style.display = 'block';
      if (r.ganancias.cumple_margen) {
        margenAlerta.className = 'validation-msg success';
        margenAlerta.innerHTML = `<i class="ti ti-circle-check"></i> ✅ Cumples con el margen de ganancia deseado (${r.ganancias.margen_deseado}%)`;
      } else {
        margenAlerta.className = 'validation-msg warning';
        margenAlerta.innerHTML = `<i class="ti ti-alert-triangle"></i> ⚠️ No cumples con el margen de ganancia deseado. Tu margen actual es ${r.ganancias.margen_utilidad}% y necesitas ${r.ganancias.margen_deseado}%`;
      }
    } else {
      margenAlerta.style.display = 'none';
    }
  }

  // Tabla de materiales
  const tbody = document.getElementById('tabla-materiales');
  if (tbody) {
    tbody.innerHTML = r.detalle_materiales.map(m => {
      const faltanteCls = m.faltante > 0 ? 'style="color:#dc2626;font-weight:600;"' : '';
      return `<tr>
        <td>${m.material}</td>
        <td>${m.unidad}</td>
        <td>${m.consumo_unitario}</td>
        <td>${m.cantidad_requerida}</td>
        <td>${m.disponible}</td>
        <td ${faltanteCls}>${m.faltante > 0 ? m.faltante : '0'}</td>
        <td>${formatMoney(m.costo_unitario)}</td>
        <td>${formatMoney(m.costo_total)}</td>
      </tr>`;
    }).join('');
  }

  // Alerta de inventario insuficiente
  const alerta = document.getElementById('alerta-faltante');
  const lista = document.getElementById('faltante-lista');
  if (r.inventario.hay_faltante && r.inventario.materiales_faltantes.length > 0) {
    alerta.style.display = 'block';
    lista.innerHTML = r.inventario.materiales_faltantes.map(m => `
      <div style="background:#fff;border:1px solid #fecaca;border-radius:8px;padding:12px;margin-bottom:8px;">
        <div style="font-weight:600;margin-bottom:4px;">${m.material}</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:13px;">
          <div>Disponible: <strong>${m.disponible} ${m.unidad}</strong></div>
          <div>Necesario: <strong>${m.necesario} ${m.unidad}</strong></div>
          <div>Faltante: <strong style="color:#dc2626;">${m.faltante} ${m.unidad}</strong></div>
        </div>
      </div>
    `).join('');
  } else {
    alerta.style.display = 'none';
  }

  // Lista de compras
  const comprasContainer = document.getElementById('compras-container');
  const comprasLista = document.getElementById('compras-lista');
  const compraTotal = document.getElementById('compra-total');
  if (comprasContainer && comprasLista && r.lista_compras && r.lista_compras.length > 0) {
    comprasContainer.style.display = 'block';
    comprasLista.innerHTML = r.lista_compras.map(c => `
      <div style="background:#fff;border:1px solid #fde68a;border-radius:8px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-weight:600;">${c.material}</div>
          <div style="font-size:13px;color:#6b7280;">Cantidad: ${c.cantidad_faltante} ${c.unidad} | Proveedor: ${c.proveedor}</div>
        </div>
        <div style="font-weight:700;color:#92400e;">${formatMoney(c.costo_total_estimado)}</div>
      </div>
    `).join('');
    if (compraTotal) compraTotal.textContent = 'Total compras necesarias: ' + formatMoney(r.costo_total_compra);
  } else if (comprasContainer) {
    comprasContainer.style.display = 'none';
  }

  // Botón confirmar producción (mostrar solo si hay inventario suficiente)
  const btnConfirmar = document.getElementById('btn-confirmar-prod');
  if (btnConfirmar) {
    btnConfirmar.style.display = r.inventario.material_suficiente ? 'inline-flex' : 'none';
  }

  showToast('Cálculo completado exitosamente.', 'success');
  // Scroll a resultados
  document.getElementById('resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── CONFIGURAR CONSUMOS ──────────────────

async function cargarConsumos() {
  const productoId = document.getElementById('conf-producto').value;
  const container = document.getElementById('consumos-container');

  if (!productoId) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Selecciona un producto para configurar sus consumos.</p>';
    return;
  }

  try {
    const res = await fetch(`${API_CALC}/formula/${productoId}`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);

    if (json.data.length === 0) {
      // Sin fórmula configurada, mostrar una fila vacía
      container.innerHTML = '';
      agregarFilaConsumo();
    } else {
      container.innerHTML = '';
      json.data.forEach(c => {
        agregarFilaConsumo(c.materia_prima_id, c.cantidad, c.desperdicio_porcentaje);
      });
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function agregarFilaConsumo(materiaPrimaId = '', consumoUnidad = '', desperdicio = '') {
  const container = document.getElementById('consumos-container');

  if (materialesData.length === 0) {
    showToast('No hay materiales disponibles. Registra materiales primero.', 'error');
    return;
  }

  // CORREGIDO: usar las claves reales de MateriaPrima (ID_Material, Nombre, Unidad_Medidad, Stock)
  const opts = materialesData.map(m =>
    `<option value="${m.ID_Material}" ${materiaPrimaId == m.ID_Material ? 'selected' : ''}>
      ${m.Nombre} (${m.Unidad_Medidad || 'sin unidad'}) - Stock: ${m.Stock || 0}
    </option>`
  ).join('');

  const fila = document.createElement('div');
  fila.className = 'consumo-fila';
  fila.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr 1fr auto;gap:12px;align-items:end;margin-bottom:10px;padding:12px;background:var(--surface-1);border-radius:8px;';

  fila.innerHTML = `
    <div>
      <label style="font-size:12px;font-weight:500;color:var(--text-secondary);display:block;margin-bottom:4px;">Material</label>
      <select class="inp" style="font-size:13px;">${opts}</select>
    </div>
    <div>
      <label style="font-size:12px;font-weight:500;color:var(--text-secondary);display:block;margin-bottom:4px;">Cantidad por unidad</label>
      <input class="inp" type="number" step="0.0001" min="0" placeholder="Ej: 0.5" value="${consumoUnidad}" style="font-size:13px;">
    </div>
    <div>
      <label style="font-size:12px;font-weight:500;color:var(--text-secondary);display:block;margin-bottom:4px;">Desperdicio %</label>
      <input class="inp" type="number" step="0.1" min="0" max="100" placeholder="Ej: 5" value="${desperdicio}" style="font-size:13px;">
    </div>
    <div>
      <label style="font-size:12px;font-weight:500;color:var(--text-secondary);display:block;margin-bottom:4px;">Costo unitario $</label>
      <input class="inp" type="number" step="0.01" min="0" placeholder="0.00" style="font-size:13px;">
    </div>
    <div>
      <button class="btn-cancelar" style="padding:8px 12px;font-size:13px;" onclick="this.closest('.consumo-fila').remove()">
        <i class="ti ti-trash"></i>
      </button>
    </div>
  `;

  container.appendChild(fila);
}

async function guardarConsumos() {
  const productoId = document.getElementById('conf-producto').value;
  if (!productoId) { showToast('Selecciona un producto.', 'error'); return; }

  const filas = document.querySelectorAll('#consumos-container .consumo-fila');
  if (filas.length === 0) { showToast('Agrega al menos un material.', 'error'); return; }

  const items = [];
  let valid = true;

  filas.forEach(f => {
    const select = f.querySelector('select');
    const inputs = f.querySelectorAll('input');
    const materiaPrimaId = select.value;
    const cantidad = parseFloat(inputs[0].value) || 0;
    const desperdicio = parseFloat(inputs[1].value) || 0;
    const costoUnitario = parseFloat(inputs[2].value) || 0;

    if (!materiaPrimaId) { valid = false; return; }

    items.push({
      materia_prima_id: parseInt(materiaPrimaId),
      cantidad: cantidad,
      desperdicio_porcentaje: desperdicio,
      costo_unitario_estimado: costoUnitario,
    });
  });

  if (!valid) { showToast('Completa todos los materiales seleccionados.', 'error'); return; }

  try {
    const res = await fetch(`${API_CALC}/formula/guardar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producto_id: parseInt(productoId), items })
    });

    const json = await res.json();
    if (!json.ok) throw new Error(json.errors?.[0] || 'Error al guardar');

    showToast('Fórmula de producción guardada exitosamente.', 'success');
    document.getElementById('conf-mensaje').textContent = '✓ Guardado';
    setTimeout(() => { document.getElementById('conf-mensaje').textContent = ''; }, 3000);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── GUARDAR SIMULACIÓN ──────────────────

async function guardarSimulacion() {
  const productoId = document.getElementById('calc-producto').value;
  const tipo = document.getElementById('calc-tipo').value;
  const cantidad = parseFloat(document.getElementById('calc-cantidad').value);
  const precio = parseFloat(document.getElementById('calc-precio').value);
  const desperdicio = parseFloat(document.getElementById('calc-desperdicio')?.value) || 0;
  const descuento = parseFloat(document.getElementById('calc-descuento')?.value) || 0;
  const iva = parseFloat(document.getElementById('calc-iva')?.value) || 0;
  const costoTransporte = parseFloat(document.getElementById('calc-costo-transporte')?.value) || 0;
  const costoEmpaque = parseFloat(document.getElementById('calc-costo-empaque')?.value) || 0;
  const costoEtiquetas = parseFloat(document.getElementById('calc-costo-etiquetas')?.value) || 0;
  const costoManoObra = parseFloat(document.getElementById('calc-costo-mo')?.value) || 0;

  if (!productoId) { showToast('Selecciona un producto.', 'error'); return; }
  if (!cantidad || cantidad <= 0) { showToast('Ingresa una cantidad válida.', 'error'); return; }
  if (!precio || precio <= 0) { showToast('Ingresa un precio de venta.', 'error'); return; }

  try {
    const res = await fetch(`${API_CALC}/guardar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        producto_id: parseInt(productoId),
        tipo_calculo: tipo,
        cantidad: cantidad,
        precio_venta: precio,
        desperdicio_porcentaje: desperdicio,
        descuento_porcentaje: descuento,
        iva_porcentaje: iva,
        costo_transporte: costoTransporte,
        costo_empaque: costoEmpaque,
        costo_etiquetas: costoEtiquetas,
        costo_mano_obra: costoManoObra,
      })
    });

    const json = await res.json();
    if (!json.ok) throw new Error(json.errors?.[0] || 'Error al guardar');

    showToast('Simulación guardada exitosamente.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── CONFIRMAR PRODUCCIÓN ────────────────

async function confirmarProduccion() {
  const productoId = document.getElementById('calc-producto').value;
  const tipo = document.getElementById('calc-tipo').value;
  const cantidad = parseFloat(document.getElementById('calc-cantidad').value);
  const precio = parseFloat(document.getElementById('calc-precio').value);
  const desperdicio = parseFloat(document.getElementById('calc-desperdicio')?.value) || 0;
  const descuento = parseFloat(document.getElementById('calc-descuento')?.value) || 0;
  const iva = parseFloat(document.getElementById('calc-iva')?.value) || 0;
  const costoTransporte = parseFloat(document.getElementById('calc-costo-transporte')?.value) || 0;
  const costoEmpaque = parseFloat(document.getElementById('calc-costo-empaque')?.value) || 0;
  const costoEtiquetas = parseFloat(document.getElementById('calc-costo-etiquetas')?.value) || 0;
  const costoManoObra = parseFloat(document.getElementById('calc-costo-mo')?.value) || 0;

  if (!productoId) { showToast('Selecciona un producto.', 'error'); return; }
  if (!cantidad || cantidad <= 0) { showToast('Ingresa una cantidad válida.', 'error'); return; }
  if (!precio || precio <= 0) { showToast('Ingresa un precio de venta.', 'error'); return; }

  const confirm = await Swal.fire({
    title: '¿Confirmar producción?',
    text: 'Esta acción descontará los materiales del inventario. ¿Estás seguro?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#059669',
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`${API_CALC}/confirmar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        producto_id: parseInt(productoId),
        tipo_calculo: tipo,
        cantidad: cantidad,
        precio_venta: precio,
        desperdicio_porcentaje: desperdicio,
        descuento_porcentaje: descuento,
        iva_porcentaje: iva,
        costo_transporte: costoTransporte,
        costo_empaque: costoEmpaque,
        costo_etiquetas: costoEtiquetas,
        costo_mano_obra: costoManoObra,
      })
    });

    const json = await res.json();
    if (!json.ok) throw new Error(json.errors?.[0] || 'Error al confirmar');

    showToast('Producción confirmada. Materiales descontados del inventario.', 'success');
    document.getElementById('btn-confirmar-prod').style.display = 'none';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── EXPORTAR RESULTADOS ────────────────

function exportarResultados(formato = 'csv') {
  // Obtener datos de la tabla de materiales
  const tabla = document.getElementById('tabla-materiales');
  if (!tabla || !tabla.rows || tabla.rows.length === 0) {
    showToast('No hay resultados para exportar. Realiza un cálculo primero.', 'error');
    return;
  }

  // Recopilar data
  const filas = [];
  for (let i = 0; i < tabla.rows.length; i++) {
    const celdas = tabla.rows[i].cells;
    filas.push({
      material: celdas[0]?.textContent || '',
      unidad: celdas[1]?.textContent || '',
      consumo_unitario: celdas[2]?.textContent || '',
      cantidad_requerida: celdas[3]?.textContent || '',
      disponible: celdas[4]?.textContent || '',
      faltante: celdas[5]?.textContent || '',
      costo_unitario: celdas[6]?.textContent || '',
      costo_total: celdas[7]?.textContent || '',
    });
  }

  // Obtener totales
  const costoTot = document.getElementById('res-costo-total')?.textContent || '$0.00';
  const ingNeto = document.getElementById('res-ing-net')?.textContent || '$0.00';
  const ganNeta = document.getElementById('res-gan-neta')?.textContent || '$0.00';

  if (formato === 'csv') {
    // Generar CSV
    let csv = 'Material,Unidad,Consumo x Unidad,Cantidad Requerida,Disponible,Faltante,Costo Unitario,Costo Total\n';
    filas.forEach(f => {
      csv += `"${f.material}","${f.unidad}","${f.consumo_unitario}","${f.cantidad_requerida}","${f.disponible}","${f.faltante}","${f.costo_unitario}","${f.costo_total}"\n`;
    });
    csv += '\n';
    csv += `Total Costo Fabricación,,,${costoTot}\n`;
    csv += `Ingreso Neto,,,${ingNeto}\n`;
    csv += `Ganancia Neta,,,${ganNeta}\n`;

    // Descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'resultados_produccion.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Archivo CSV exportado exitosamente.', 'success');
  } else {
    // JSON
    const data = {
      materiales: filas,
      totales: {
        costo_total_fabricacion: costoTot,
        ingreso_neto: ingNeto,
        ganancia_neta: ganNeta,
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'resultados_produccion.json';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Archivo JSON exportado exitosamente.', 'success');
  }
}

// ── Navegación sidebar ───────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Cargar datos iniciales
  cargarProductos();
  cargarMateriales();

  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function () {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Navegación a otras secciones
  document.getElementById('nav-productos').addEventListener('click', function() {
    window.location.href = 'VistaPrevia.html';
  });

  document.getElementById('nav-inventario').addEventListener('click', function() {
    window.location.href = 'Inventario.html';
  });

  // Logout
  const logoutItem = document.querySelector('.logout-item');
  if (logoutItem) {
    logoutItem.addEventListener('click', function() {
      const btnLogout = document.getElementById('btnLogout');
      if (btnLogout) btnLogout.click();
    });
  }
});