// =========================================
//  FASHION STYLE — Registrar Material
//  AgregarMateriales.js (conectado a API)
// =========================================

const API_INV = '/api/inventario';

// ── Helpers ──────────────────────────────

function hoy() {
  return new Date().toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

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

// ── Validación ───────────────────────────

const REQUIRED_FIELDS = [
  { id: 'mat-nombre',        label: 'Nombre del material' },
  { id: 'mat-categoria',     label: 'Categoría' },
  { id: 'mat-unidad',        label: 'Unidad de medida' },
  { id: 'mat-costo',         label: 'Costo unitario' },
  { id: 'mat-stock-inicial', label: 'Stock inicial' },
  { id: 'mat-stock-min',     label: 'Stock mínimo' },
];

function validateMaterial() {
  REQUIRED_FIELDS.forEach(f => document.getElementById(f.id).classList.remove('error'));
  for (const field of REQUIRED_FIELDS) {
    const el  = document.getElementById(field.id);
    const val = el.value.trim();
    if (val === '' || (el.type === 'number' && isNaN(parseFloat(val)))) {
      el.classList.add('error');
      el.focus();
      showToast(`El campo "${field.label}" es obligatorio.`, 'error');
      setTimeout(() => el.classList.remove('error'), 2500);
      return false;
    }
  }
  return true;
}

// ── Recolectar datos ─────────────────────

function collectMaterial() {
  return {
    nombre:       document.getElementById('mat-nombre').value.trim(),
    categoria:    document.getElementById('mat-categoria').value.trim(),
    proveedor:    document.getElementById('mat-proveedor').value.trim(),
    unidad:       document.getElementById('mat-unidad').value.trim(),
    costo:        parseFloat(document.getElementById('mat-costo').value) || 0,
    stock:        parseInt(document.getElementById('mat-stock-inicial').value, 10) || 0,
    min:          parseInt(document.getElementById('mat-stock-min').value, 10) || 0,
    descripcion:  document.getElementById('mat-descripcion').value.trim(),
    color:        document.getElementById('mat-color').value.trim(),
    composicion:  document.getElementById('mat-composicion').value.trim(),
    ancho:        document.getElementById('mat-ancho').value.trim(),
    presentacion: document.getElementById('mat-presentacion').value.trim(),
    fecha:        hoy(),
  };
}

function clearMaterial() {
  ['mat-nombre','mat-categoria','mat-proveedor','mat-unidad','mat-costo',
   'mat-stock-inicial','mat-stock-min','mat-descripcion',
   'mat-color','mat-composicion','mat-ancho','mat-presentacion']
    .forEach(id => { const el = document.getElementById(id); el.value = ''; el.classList.remove('error'); });
  document.getElementById('mat-char-count').textContent = '0/300';
  clearMatImage();
}

function anyMatFilled() {
  return ['mat-nombre','mat-categoria','mat-proveedor','mat-unidad','mat-costo','mat-descripcion']
    .some(id => document.getElementById(id).value.trim() !== '');
}

// ── Imagen ───────────────────────────────

function handleMatFile(file) {
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('El archivo supera 5 MB.', 'error'); return; }
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
    showToast('Formato no permitido. Usa JPG, PNG o WEBP.', 'error'); return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('mat-preview-img').src = e.target.result;
    document.getElementById('mat-file-name').textContent = `${file.name} (${Math.round(file.size/1024)} KB)`;
    document.getElementById('mat-upload-content').style.display  = 'none';
    document.getElementById('mat-preview-content').style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

function clearMatImage() {
  document.getElementById('mat-file-input').value = '';
  document.getElementById('mat-preview-img').src  = '';
  document.getElementById('mat-upload-content').style.display  = 'block';
  document.getElementById('mat-preview-content').style.display = 'none';
}

// ── Guardar (API) ────────────────────────

async function handleSave(continuar = false) {
  if (!validateMaterial()) return;
  const data = collectMaterial();
  const btn  = continuar ? document.getElementById('btn-save-continue') : document.getElementById('btn-save');
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2"></i> Guardando…';

  try {
    const formData = new FormData();
    formData.append('Nombre', data.nombre);
    formData.append('Clasificacion', data.categoria);
    formData.append('Stock', data.stock);
    formData.append('Stock_min', data.min);
    formData.append('Unidad_Medidad', data.unidad);

    // Adjuntar imagen si fue seleccionada
    const fileInput = document.getElementById('mat-file-input');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      formData.append('Imagen', fileInput.files[0]);
    }

    const res = await fetch(`${API_INV}/crear`, {
      method: 'POST',
      body: formData,
      // NO headers: Content-Type se auto-asigna con FormData
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Error al guardar material');
    }

    if (continuar) {
      showToast(`"${data.nombre}" guardado. Puedes registrar otro.`, 'success');
      clearMaterial();
    } else {
      showToast(`Material "${data.nombre}" guardado exitosamente.`, 'success');
      setTimeout(() => { window.location.href = 'Inventario.html'; }, 800);
    }
  } catch (err) {
    showToast(err.message || 'No se pudo guardar. Intenta de nuevo.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
}

// ── Init ─────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('btn-save').addEventListener('click', () => handleSave(false));
  document.getElementById('btn-save-continue').addEventListener('click', () => handleSave(true));

  // Char count
  document.getElementById('mat-descripcion').addEventListener('input', function () {
    document.getElementById('mat-char-count').textContent = `${this.value.length}/300`;
  });

  // Upload zone
  const matZone   = document.getElementById('mat-upload-zone');
  const matInput  = document.getElementById('mat-file-input');
  const matSelBtn = document.getElementById('mat-select-file-btn');
  const matChgBtn = document.getElementById('mat-change-file-btn');

  matSelBtn.addEventListener('click', e => { e.stopPropagation(); matInput.click(); });
  matChgBtn.addEventListener('click', e => { e.stopPropagation(); clearMatImage(); matInput.click(); });
  matZone.addEventListener('click', () => matInput.click());
  matInput.addEventListener('change', () => handleMatFile(matInput.files[0]));

  matZone.addEventListener('dragover', e => { e.preventDefault(); matZone.classList.add('drag-over'); });
  matZone.addEventListener('dragleave', () => matZone.classList.remove('drag-over'));
  matZone.addEventListener('drop', e => {
    e.preventDefault(); matZone.classList.remove('drag-over');
    handleMatFile(e.dataTransfer.files[0]);
  });

  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function () {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Navegación a Calculadora
  document.getElementById('nav-calculadora').addEventListener('click', function() {
    window.location.href = 'CalculadoraProduccion.html';
  });
});