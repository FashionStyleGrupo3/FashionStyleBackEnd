const BASE = "/api/productos";

let productos          = [];
let publicados         = [];
let actual             = null;
let imagenesEditar     = [];
let imagenActivaEditar = 0;

function cargarProductos() {
    fetch(`${BASE}/listar`)
        .then(res => res.json())
        .then(data => {
            const lista = Array.isArray(data) ? data : (data.data || []);
            productos = lista;
            publicados = productos
                .filter(p => Number(p.publicado) === 1)
                .map(p => Number(p.id_producto || p.id));
            mostrar();
        })
        .catch(err => console.error("ERROR CARGANDO:", err));
}

function actualizarEstadisticas() {
    const totalProductos  = document.getElementById("totalProductos");
    const totalPendientes = document.getElementById("totalPendientes");
    const totalPublicados = document.getElementById("totalPublicados");
    if (totalProductos)  totalProductos.textContent  = productos.length;
    if (totalPublicados) totalPublicados.textContent  = publicados.length;
    if (totalPendientes) totalPendientes.textContent  = productos.length - publicados.length;
}

function obtenerPrimeraImagen(p) {
    // Prioridad: 1) producto.imagen 2) producto.imagenes[0].ruta 3) null
    if (p.imagen) return p.imagen;
    if (p.imagenes && p.imagenes.length > 0) {
        const primera = p.imagenes[0];
        return (typeof primera === 'string') ? primera : (primera.ruta || null);
    }
    return null;
}

function mostrar() {
    const contenedor = document.getElementById("VistaPrevia");
    if (!contenedor) return;
    let html = "";
    productos.forEach((p) => {
        const id        = p.id_producto || p.id;
        const isChecked = publicados.includes(Number(id));
        const imgRuta   = obtenerPrimeraImagen(p);
        const imgPath   = resolverRuta(imgRuta);
        // Si no hay imagen, usar placeholder
        const imgTag    = imgPath 
            ? `<img src="${imgPath}" onerror="this.onerror=null;this.src='';this.classList.add('img-placeholder');" alt="${p.nombre}">`
            : `<div class="img-placeholder-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
        html += `
        <div class="producto">
            <div class="disponibilidad-container">
                <span class="status-text">Publicar</span>
                <label class="switch">
                    <input type="checkbox" class="check-publicar" data-id="${id}" ${isChecked ? "checked" : ""}>
                    <span class="slider"></span>
                </label>
            </div>
            <div class="producto-card" onclick="abrirModal(${id})">
                ${imgTag}
                <h3>${p.nombre}</h3>
                <p>$${p.precio}</p>
            </div>
        </div>`;
    });
    contenedor.innerHTML = html;
    actualizarEstadisticas();
}

function resolverRuta(ruta) {
    if (!ruta) return '';
    if (ruta.startsWith('data:') || ruta.startsWith('http')) return ruta;
    const limpia = ruta.replace(/^\/+/, "");
    // rutas de storage (uploads/, productos/, ia_temp/)
    if (limpia.startsWith("uploads/") || limpia.startsWith("productos/") || limpia.startsWith("ia_temp/")) {
        return "/storage/" + limpia;
    }
    if (limpia.startsWith("assets/")) {
        return "/" + limpia;
    }
    if (limpia.startsWith("storage/")) {
        return "/" + limpia;
    }
    return "/" + limpia;
}

function filtrarProductos() {
    const texto = document.getElementById("buscarProducto").value.toLowerCase();
    document.querySelectorAll(".producto").forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(texto) ? "block" : "none";
    });
}

function publicarEnTienda() {
    const checks = document.querySelectorAll(".check-publicar:checked");
    if (checks.length === 0) {
        Swal.fire("Sin selección", "Selecciona al menos un producto", "warning");
        return;
    }
    const idsSeleccionados = Array.from(checks).map(check => Number(check.dataset.id));
    const btnPublicar = document.querySelector(".btn-publicar");
    const textoOriginal = btnPublicar ? btnPublicar.textContent : null;
    if (btnPublicar) { btnPublicar.disabled = true; btnPublicar.textContent = "Publicando..."; }

    fetch(`${BASE}/publicar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsSeleccionados })
    })
    .then(res => res.json())
    .then(data => {
        publicados = idsSeleccionados;
        actualizarEstadisticas();
        Swal.fire("Listo", `${publicados.length} productos publicados en la tienda`, "success");
    })
    .catch(err => Swal.fire("Error", err.message || "No se pudo publicar", "error"))
    .finally(() => {
        if (btnPublicar) { btnPublicar.disabled = false; btnPublicar.textContent = textoOriginal; }
    });
}

function abrirModal(id) {
    actual = id;
    const p = productos.find(x => (x.id_producto || x.id) == id);
    if (!p) return;

    document.getElementById("modalImg").src            = resolverRuta(p.imagen);
    document.getElementById("modalNombre").textContent = p.nombre;
    document.getElementById("modalPrecio").textContent = "Precio: $" + p.precio;
    document.getElementById("modalColor").textContent  = "Color: " + (p.color || "N/A");
    document.getElementById("modalDesc").textContent   = p.descripcion || "";

    renderTallasModal(p.tallas || []);

    const inputStock = document.getElementById("cantidadInput");
    if (inputStock) inputStock.value = p.stock ?? 0;
    document.getElementById("contadorStockVisual").textContent = p.stock ?? 0;

    const imagenes = p.imagenes && p.imagenes.length ? p.imagenes : [p.imagen];
    generarDots(imagenes);
    document.getElementById("modal").style.display = "flex";
}

function renderTallasModal(tallasOriginales) {
    const contBotones  = document.getElementById("modalTallasBotones");
    const panelMedidas = document.getElementById("modalMedidasPanel");
    if (!contBotones) return;

    const tallas = (tallasOriginales || []).filter(t => t && String(t.talla || "").trim() !== "");

    if (!tallas.length) {
        contBotones.innerHTML = `<span class="sin-tallas">Sin tallas registradas</span>`;
        if (panelMedidas) panelMedidas.innerHTML = "";
        return;
    }

    contBotones.innerHTML = tallas.map((t, i) => {
        const agotada = Number(t.stock) === 0 ? ' agotada' : '';
        return `<button type="button" class="btn-talla-admin${agotada}" data-index="${i}">
            ${t.talla}<small class="stock-badge">${t.stock} uds</small>
        </button>`;
    }).join("");

    if (panelMedidas) {
        panelMedidas.innerHTML = construirHtmlMedidas(tallas[0]);
        contBotones.querySelectorAll(".btn-talla-admin")[0]?.classList.add("activa");
    }

    contBotones.querySelectorAll(".btn-talla-admin").forEach(btn => {
        btn.addEventListener("click", () => {
            contBotones.querySelectorAll(".btn-talla-admin").forEach(b => b.classList.remove("activa"));
            btn.classList.add("activa");
            if (panelMedidas) {
                panelMedidas.innerHTML = construirHtmlMedidas(tallas[Number(btn.dataset.index)]);
            }
        });
    });
}

function construirHtmlMedidas(t) {
    if (!t) return "";
    const filas = [
        ["Hombro", t.hombro], ["Pecho", t.pecho], ["Cintura", t.cintura],
        ["Cadera", t.cadera], ["Largo", t.largo],  ["Largo de manga", t.largo_manga]
    ].filter(([, v]) => v && String(v).trim() !== "");

    const stockHtml = `<p class="medidas-stock ${Number(t.stock) === 0 ? 'agotado' : 'disponible'}">
        ${Number(t.stock) === 0 ? '⚠ Agotada' : `✓ ${t.stock} unidades disponibles`}
    </p>`;

    if (filas.length === 0) {
        return stockHtml + `<p class="medidas-vacio">No hay medidas registradas para esta talla.</p>`;
    }
    return stockHtml + `
        <p class="medidas-titulo">Medidas — Talla ${t.talla}</p>
        <ul class="medidas-lista">
            ${filas.map(([l, v]) => `<li><span>${l}</span><strong>${v}</strong></li>`).join("")}
        </ul>`;
}

function cerrarModal() {
    document.getElementById("modal").style.display = "none";
}

function generarDots(imagenes) {
    const contenedor = document.getElementById("carouselDots");
    if (!contenedor) return;
    contenedor.innerHTML = imagenes.map((_, i) =>
        `<span class="dot ${i === 0 ? 'active' : ''}" onclick="cambiarImagenCarousel(${i})"></span>`
    ).join("");
}

function cambiarImagenCarousel(index) {
    const p = productos.find(x => (x.id_producto || x.id) == actual);
    if (!p) return;
    const imagenes = p.imagenes && p.imagenes.length ? p.imagenes : [p.imagen];
    if (!imagenes[index]) return;
    document.getElementById("modalImg").src = resolverRuta(imagenes[index]);
    document.querySelectorAll("#carouselDots .dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
    });
}

function editarProducto() {
    document.getElementById("modal").style.display = "none";
    const p = productos.find(x => (x.id_producto || x.id) == actual);
    if (!p) return;

    const rutasOriginales = p.imagenes && p.imagenes.length ? p.imagenes : [p.imagen];
    imagenesEditar = rutasOriginales.map((ruta, i) => ({
        ruta, base64: null, file: null, esNueva: false, orden: i
    }));
    imagenActivaEditar = 0;
    mostrarImagenEditar(0);

    document.getElementById("eNombre").value = p.nombre  ?? '';
    document.getElementById("ePrecio").value = p.precio  ?? 0;
    document.getElementById("eStock").value  = p.stock   ?? 0;
    document.getElementById("eColor").value  = p.color   ?? '';
    document.getElementById("eTipoProducto").value = p.tipo_producto ?? '';

    vaciarContenedorTallas("listaTallasEditar");
    const tallas = Array.isArray(p.tallas) && p.tallas.length ? p.tallas : [];
    if (tallas.length > 0) {
        tallas.forEach(t => crearFilaTalla("listaTallasEditar", t));
    } else {
        crearFilaTalla("listaTallasEditar");
    }

    setTimeout(() => {
        document.getElementById("modalEditar").style.display = "flex";
    }, 50);
}

function mostrarImagenEditar(index) {
    if (index < 0 || index >= imagenesEditar.length) return;
    imagenActivaEditar = index;
    const item = imagenesEditar[index];
    document.getElementById("editarImg").src = item.base64 ? item.base64 : resolverRuta(item.ruta);
    actualizarDotsEditar();
}

function actualizarDotsEditar() {
    const contenedor = document.getElementById("editarCarouselDots");
    if (!contenedor) return;
    contenedor.innerHTML = imagenesEditar.map((item, i) => {
        const esNueva = item.esNueva ? ' style="background:#e60067"' : '';
        return `<span class="dot ${i === imagenActivaEditar ? 'active' : ''}"${esNueva}
                     onclick="mostrarImagenEditar(${i})"></span>`;
    }).join("");
}

function cerrarModalEditar() {
    document.getElementById("modalEditar").style.display = "none";
    imagenesEditar     = [];
    imagenActivaEditar = 0;
    vaciarContenedorTallas("listaTallasEditar");
}

function zoomImagenEditar() {
    const src = document.getElementById("editarImg").src;
    const v = window.open("", "_blank", "width=900,height=700,scrollbars=yes,resizable=yes");
    v.document.write(`<!DOCTYPE html><html><head><title>Zoom</title>
        <style>body{margin:0;background:#111;display:flex;justify-content:center;align-items:center;min-height:100vh;}
        img{max-width:100%;max-height:100vh;object-fit:contain;border-radius:8px;}</style>
        </head><body><img src="${src}"></body></html>`);
    v.document.close();
}

function cambiarImagenActiva(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        imagenesEditar[imagenActivaEditar].base64 = e.target.result;
        imagenesEditar[imagenActivaEditar].file   = file;
        mostrarImagenEditar(imagenActivaEditar);
    };
    reader.readAsDataURL(file);
}

function agregarImagenAlCarrusel(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        imagenesEditar.push({ ruta: null, base64: e.target.result, file, esNueva: true, orden: imagenesEditar.length });
        actualizarDotsEditar();
    };
    reader.readAsDataURL(file);
}

function crearFilaTalla(contenedorId, datos = null) {
    const tpl = document.getElementById("tplFilaTalla");
    const contenedor = document.getElementById(contenedorId);
    if (!tpl || !contenedor) return;

    const nodo = tpl.content.cloneNode(true);
    const fila = nodo.querySelector(".fila-talla");

    if (datos) {
        fila.querySelector(".talla-nombre").value       = datos.talla       ?? '';
        fila.querySelector(".talla-stock").value        = datos.stock       ?? 0;
        fila.querySelector(".medida-hombro").value      = datos.hombro      ?? '';
        fila.querySelector(".medida-pecho").value       = datos.pecho       ?? '';
        fila.querySelector(".medida-cintura").value     = datos.cintura     ?? '';
        fila.querySelector(".medida-cadera").value      = datos.cadera      ?? '';
        fila.querySelector(".medida-largo").value       = datos.largo       ?? '';
        fila.querySelector(".medida-largo-manga").value = datos.largo_manga ?? '';
    }

    fila.querySelector(".btn-quitar-talla").addEventListener("click", () => fila.remove());
    contenedor.appendChild(fila);
}

function recolectarTallas(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return [];
    return Array.from(contenedor.querySelectorAll(".fila-talla"))
        .map(fila => ({
            talla:       fila.querySelector(".talla-nombre").value.trim(),
            stock:       parseInt(fila.querySelector(".talla-stock").value) || 0,
            hombro:      fila.querySelector(".medida-hombro").value.trim(),
            pecho:       fila.querySelector(".medida-pecho").value.trim(),
            cintura:     fila.querySelector(".medida-cintura").value.trim(),
            cadera:      fila.querySelector(".medida-cadera").value.trim(),
            largo:       fila.querySelector(".medida-largo").value.trim(),
            largo_manga: fila.querySelector(".medida-largo-manga").value.trim()
        }))
        .filter(t => t.talla !== "");
}

function vaciarContenedorTallas(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (contenedor) contenedor.innerHTML = "";
}

async function guardarTallasProducto(idProducto, tallas) {
    const res = await fetch(`${BASE}/guardar_tallas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_producto: idProducto, tallas })
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Error al guardar tallas");
    return data;
}

async function guardarEdicion() {
    const btnGuardar    = document.querySelector(".editar-btn-guardar");
    const textoOriginal = btnGuardar.innerHTML;

    const tallas = recolectarTallas("listaTallasEditar");
    if (tallas.length === 0) {
        Swal.fire("Faltan tallas", "Agrega al menos una talla antes de guardar.", "warning");
        return;
    }

    btnGuardar.disabled = true;
    btnGuardar.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Guardando...`;

    try {
        for (let i = 0; i < imagenesEditar.length; i++) {
            const item = imagenesEditar[i];
            if (!item.file) continue;
            const formData = new FormData();
            formData.append("id",       actual);
            formData.append("imagen",   item.file);
            formData.append("orden",    item.orden);
            formData.append("es_nueva", item.esNueva ? "1" : "0");
            const res  = await fetch(`${BASE}/editar_imagen`, { method: "POST", body: formData });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error || `Error subiendo imagen ${i}`);
            imagenesEditar[i].ruta   = data.imagen;
            imagenesEditar[i].file   = null;
            imagenesEditar[i].base64 = null;
        }

        const resEditar = await fetch(`${BASE}/editar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id:     actual,
                nombre: document.getElementById("eNombre").value,
                precio: document.getElementById("ePrecio").value,
                stock:  document.getElementById("eStock").value,
                color:       document.getElementById("eColor").value,
                tipo_producto: document.getElementById("eTipoProducto")?.value ?? '',
            })
        });
        const dataEditar = await resEditar.json();
        if (!dataEditar.ok) throw new Error(dataEditar.error || "Error al guardar campos");

        await guardarTallasProducto(actual, tallas);

        cerrarModalEditar();
        Swal.fire({ icon: "success", title: "Guardado", text: "Producto actualizado", timer: 1800, showConfirmButton: false });
        cargarProductos();

    } catch (err) {
        console.error(err);
        if (document.activeElement) document.activeElement.blur();
        Swal.fire("Error", err.message || "No se pudo guardar el producto", "error");
    } finally {
        btnGuardar.disabled  = false;
        btnGuardar.innerHTML = textoOriginal;
    }
}

function borrarProducto() {
    cerrarModal();
    Swal.fire({ title: "¿Eliminar producto?", icon: "warning", showCancelButton: true, confirmButtonText: "Eliminar" })
    .then(result => {
        if (!result.isConfirmed) return;
        fetch(`${BASE}/eliminar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: actual })
        })
        .then(res => res.json())
        .then(data => {
            if (!data.ok) throw new Error("Error al eliminar");
            Swal.fire("Eliminado", "", "success");
            cargarProductos();
        })
        .catch(() => Swal.fire("Error", "No se pudo eliminar", "error"));
    });
}

function enviarStock() {
    const nuevoStock = Number(document.getElementById("cantidadInput").value);
    fetch(`${BASE}/editar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: actual, stock: nuevoStock })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.ok) throw new Error(data.error || "Error");
        document.getElementById("contadorStockVisual").textContent = nuevoStock;
        const prod = productos.find(x => (x.id_producto || x.id) == actual);
        if (prod) prod.stock = nuevoStock;
        Swal.fire({ icon: "success", title: "Stock actualizado", timer: 1500, showConfirmButton: false });
    })
    .catch(() => Swal.fire("Error", "No se pudo actualizar el stock", "error"));
}

async function agregarProducto() {
    const input = document.getElementById("imagen");
    if (!input || !input.files.length) {
        Swal.fire("Error", "Selecciona una imagen", "error");
        return;
    }

    const tallas = recolectarTallas("listaTallas");
    if (tallas.length === 0) {
        Swal.fire("Faltan tallas", "Agrega al menos una talla antes de guardar.", "warning");
        return;
    }

    const formData = new FormData();
    formData.append("nombre",      document.getElementById("nombre").value);
    formData.append("descripcion", document.getElementById("desc").value);
    formData.append("precio",      document.getElementById("precio").value);
    formData.append("color",       document.getElementById("color")?.value ?? '');
    formData.append("imagen",      input.files[0]);

    const btnGuardar = document.querySelector(".btn-guardar");
    if (btnGuardar) { btnGuardar.disabled = true; btnGuardar.textContent = "Guardando..."; }

    try {
        const res  = await fetch(`${BASE}/crear`, { method: "POST", body: formData });

        let data;
        try {
            data = await res.json();
        } catch (parseErr) {
            throw new Error(`Respuesta inválida del servidor (HTTP ${res.status}). Revisa la consola/red para más detalle.`);
        }

        if (!data.ok) {
            throw new Error(data.error || "El servidor rechazó la solicitud");
        }

        const idNuevo = data.id || data.id_producto;
        if (!idNuevo) throw new Error("No se recibió el ID del producto creado");

        await guardarTallasProducto(idNuevo, tallas);

        Swal.fire("Listo", "Producto agregado con sus tallas", "success")
            .then(() => { window.location.href = "VistaPrevia.html"; });

    } catch (err) {
        console.error(err);
        if (document.activeElement) document.activeElement.blur();
        Swal.fire("Error", err.message || "No se pudo agregar el producto", "error");
    } finally {
        if (btnGuardar) { btnGuardar.disabled = false; btnGuardar.textContent = "Guardar Producto"; }
    }
}

window.onload = function () {
    const styleEl = document.createElement("style");
    styleEl.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(styleEl);

    cargarProductos();

    const imagenPage = document.getElementById("imagen");
    if (imagenPage) {
        imagenPage.addEventListener("change", function () {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                const img = document.getElementById('previewImg');
                if (img) { img.src = e.target.result; img.style.display = 'block'; }
                const placeholder = document.getElementById('dropPlaceholder');
                if (placeholder) placeholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        });
    }

    const inputCambiar = document.getElementById("editarInputCambiar");
    const inputAgregar = document.getElementById("editarInputAgregar");
    const btnCambiar   = document.getElementById("btnCambiarImagen");
    const btnAgregar   = document.getElementById("btnAgregarImagen");
    const btnZoom      = document.getElementById("btnZoomEditar");

    if (btnZoom)    btnZoom.addEventListener("click", zoomImagenEditar);
    if (btnCambiar && inputCambiar) btnCambiar.addEventListener("click", () => inputCambiar.click());
    if (inputCambiar) inputCambiar.addEventListener("change", function () { cambiarImagenActiva(this.files[0]); this.value = ""; });
    if (btnAgregar && inputAgregar) btnAgregar.addEventListener("click", () => inputAgregar.click());
    if (inputAgregar) inputAgregar.addEventListener("change", function () { agregarImagenAlCarrusel(this.files[0]); this.value = ""; });

    const btnAgregarTalla = document.getElementById("btnAgregarTalla");
    if (btnAgregarTalla) {
        btnAgregarTalla.addEventListener("click", () => crearFilaTalla("listaTallas"));
        crearFilaTalla("listaTallas");
    }

    const btnAgregarTallaEditar = document.getElementById("btnAgregarTallaEditar");
    if (btnAgregarTallaEditar) {
        btnAgregarTallaEditar.addEventListener("click", () => crearFilaTalla("listaTallasEditar"));
    }
};