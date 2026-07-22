const urlParams = new URLSearchParams(window.location.search);
const id = parseInt(urlParams.get('id'));

let currentProduct = null;
let listaCompleta  = [];
let tallaSeleccionada = null;
let cantidadSeleccionada = 1;

const MAPA_COLORES = {
    'negro':        '#111111',
    'blanco':       '#ffffff',
    'gris':         '#888888',
    'gris claro':   '#cccccc',
    'gris oscuro':  '#444444',
    'rojo':         '#c0173c',
    'rojo cereza':  '#9b1b30',
    'vino':         '#6e1423',
    'azul':         '#13294b',
    'azul claro':   '#7ec8e3',
    'azul marino':  '#0a1e3f',
    'celeste':      '#a9d6e5',
    'verde':        '#2e7d32',
    'verde claro':  '#8bc34a',
    'verde oliva':  '#556b2f',
    'amarillo':     '#f5d020',
    'naranja':      '#e8702a',
    'rosa':         '#ff8fb1',
    'fucsia':       '#e60067',
    'morado':       '#7b2d8b',
    'violeta':      '#8e44ad',
    'beige':        '#e8dcc8',
    'café':         '#6f4e37',
    'cafe':         '#6f4e37',
    'marron':       '#6f4e37',
    'marrón':       '#6f4e37',
    'dorado':       '#c9a227',
    'plateado':     '#c0c0c0',
    'turquesa':     '#1abc9c'
};

function obtenerColorVisual(textoColor) {
    const limpio = String(textoColor || '').trim().toLowerCase();
    if (!limpio) return null;
    return MAPA_COLORES[limpio] || '#bbbbbb';
}

function renderColorProducto(textoColor) {
    const contenedor = document.getElementById('color-opciones');
    const bloque     = document.getElementById('bloque-colores');
    if (!contenedor) return;

    const nombre = String(textoColor || '').trim();
    if (!nombre) {
        if (bloque) bloque.style.display = 'none';
        return;
    }

    if (bloque) bloque.style.display = '';
    const hex = obtenerColorVisual(nombre);
    contenedor.innerHTML = `
        <button class="btn-color activo" type="button"
                style="background:${hex};" title="${nombre}" aria-label="Color: ${nombre}"></button>
        <span class="color-nombre-texto">${nombre}</span>`;
}

if (id) {
    fetch("/api/productos/listar_publicos")
        .then(r => r.json())
        .then(data => {
            const lista = Array.isArray(data) ? data : (data.data || []);
            listaCompleta = lista;

            const producto = lista.find(p => Number(p.id_producto || p.id) === id);
            if (!producto) return;

            const imgRuta = producto.imagen || (producto.imagenes && producto.imagenes.length > 0 ? (typeof producto.imagenes[0] === 'string' ? producto.imagenes[0] : producto.imagenes[0].ruta) : '');
            const imagenPrincipal = imgRuta
                ? (String(imgRuta).startsWith('http') || String(imgRuta).startsWith('data:') ? imgRuta : 
                   (String(imgRuta).startsWith('uploads/') || String(imgRuta).startsWith('productos/') || String(imgRuta).startsWith('ia_temp/') ? '/storage/' + imgRuta : 
                   (String(imgRuta).startsWith('storage/') ? '/' + imgRuta : '/' + imgRuta)))
                : '/assets/img1.jpg';

            currentProduct = {
                id:     producto.id_producto || producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen || ''
            };

            document.getElementById('titulo-producto').textContent      = producto.nombre;
            document.getElementById('imagen-producto').src              = imagenPrincipal;
            document.getElementById('nombre-producto').textContent      = producto.nombre;
            document.getElementById('precio-producto').textContent      =
                '$' + Number(producto.precio).toLocaleString('es-CO');
            document.getElementById('descripcion-producto').textContent = producto.descripcion || '';

            renderTallasProducto(producto.tallas || []);
            renderColorProducto(producto.color || '');
            renderRelacionados(lista, id);
        })
        .catch(err => console.error('Error cargando el producto:', err));
}

function renderTallasProducto(tallasOriginales) {
    const contenedor = document.getElementById('talla-opciones');
    const panel      = document.getElementById('panel-medidas');
    if (!contenedor) return;

    const tallas = (tallasOriginales || []).filter(t => t && String(t.talla || '').trim() !== '');

    if (!tallas.length) {
        contenedor.innerHTML = `<span class="sin-tallas">Sin tallas registradas</span>`;
        if (panel) panel.style.display = 'none';
        return;
    }

    contenedor.innerHTML = tallas.map((t, i) => {
        const agotada  = Number(t.stock) === 0;
        const clases   = `btn-talla${agotada ? ' agotada' : ''}`;
        const tooltip  = agotada ? ' title="Agotada"' : '';
        return `<button class="${clases}" type="button" data-index="${i}"${tooltip}>${t.talla}</button>`;
    }).join('');

    const botones = contenedor.querySelectorAll('.btn-talla');

    function seleccionar(index) {
        botones.forEach(b => b.classList.remove('activa'));
        botones[index].classList.add('activa');
        tallaSeleccionada = tallas[index];
        mostrarPanelMedidas(tallas[index]);
        cantidadSeleccionada = 1;
        actualizarVistaCantidad();
    }

    botones.forEach((btn, i) => btn.addEventListener('click', () => seleccionar(i)));

    const primerDisponible = tallas.findIndex(t => Number(t.stock) > 0);
    seleccionar(primerDisponible >= 0 ? primerDisponible : 0);
}

const ICONOS_MEDIDA = {
    'Hombro':          'fa-person',
    'Pecho':           'fa-shirt',
    'Cintura':         'fa-ruler-horizontal',
    'Cadera':          'fa-ruler-combined',
    'Largo':           'fa-ruler-vertical',
    'Largo de manga':  'fa-ruler'
};

function mostrarPanelMedidas(t) {
    const panel = document.getElementById('panel-medidas');
    if (!panel) return;

    const agotada = Number(t.stock) === 0;

    const stockHtml = `
        <div class="medidas-stock-row ${agotada ? 'agotado' : 'disponible'}">
            <i class="fa-solid ${agotada ? 'fa-circle-xmark' : 'fa-circle-check'}"></i>
            <span>${agotada ? 'Agotada' : `${t.stock} unidades disponibles`}</span>
        </div>`;

    const filas = [
        ['Hombro', t.hombro], ['Pecho', t.pecho], ['Cintura', t.cintura],
        ['Cadera', t.cadera], ['Largo', t.largo],  ['Largo de manga', t.largo_manga]
    ].filter(([, v]) => v && String(v).trim() !== '');

    const medidasHtml = filas.length === 0
        ? `<p class="medidas-vacio">No hay medidas registradas para la talla ${t.talla}.</p>`
        : `<p class="medidas-titulo"><i class="fa-solid fa-ruler"></i> Medidas — Talla ${t.talla}</p>
           <div class="medidas-grid">
               ${filas.map(([label, valor]) => `
                   <div class="medida-card">
                       <span class="medida-icono"><i class="fa-solid ${ICONOS_MEDIDA[label] || 'fa-ruler'}"></i></span>
                       <span class="medida-nombre">${label}</span>
                       <span class="medida-valor">${valor}</span>
                   </div>`).join('')}
           </div>`;

    panel.innerHTML = stockHtml + medidasHtml;
    panel.style.display = 'block';
}

function renderRelacionados(lista, idActual) {
    const contenedor = document.getElementById('relacionados-grid');
    if (!contenedor) return;

    const candidatos = lista.filter(p => Number(p.id_producto || p.id) !== idActual);
    const aleatorios = mezclarArray(candidatos).slice(0, 4);

    if (aleatorios.length === 0) {
        contenedor.innerHTML = `<p style="color:#888;font-size:14px;">Aún no hay más productos en el catálogo.</p>`;
        return;
    }

    contenedor.innerHTML = aleatorios.map(p => {
        const pid     = p.id_producto || p.id;
        const imgRutaRel = p.imagen || (p.imagenes && p.imagenes.length > 0 ? (typeof p.imagenes[0] === 'string' ? p.imagenes[0] : p.imagenes[0].ruta) : '');
        const imgPath = imgRutaRel
            ? (String(imgRutaRel).startsWith('http') || String(imgRutaRel).startsWith('data:') ? imgRutaRel : 
               (String(imgRutaRel).startsWith('uploads/') || String(imgRutaRel).startsWith('productos/') || String(imgRutaRel).startsWith('ia_temp/') ? '/storage/' + imgRutaRel : '/' + imgRutaRel))
            : '/assets/img1.jpg';
        return `
            <div class="tarjeta" onclick="window.location.href='producto.html?id=${pid}'">
                <div class="img-box">
                    <img src="${imgPath}" alt="${p.nombre}" onerror="this.onerror=null;">
                    <button class="cart-btn-circle add-to-cart" data-id="${pid}" type="button" title="Agregar al carrito">
                        <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                </div>
                <div class="card-info">
                    <p class="card-name">${p.nombre}</p>
                    <p class="card-price">$${Number(p.precio).toLocaleString('es-CO')}</p>
                </div>
            </div>`;
    }).join('');
}

function mezclarArray(arr) {
    const copia = [...arr];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function actualizarVistaCantidad() {
    const span = document.getElementById('cantidad-valor');
    if (span) span.textContent = cantidadSeleccionada;
}

function inicializarSelectorCantidad() {
    const btnRestar = document.getElementById('btn-restar');
    const btnSumar  = document.getElementById('btn-sumar');
    if (!btnRestar || !btnSumar) return;

    btnRestar.addEventListener('click', () => {
        if (cantidadSeleccionada > 1) {
            cantidadSeleccionada--;
            actualizarVistaCantidad();
        }
    });

    btnSumar.addEventListener('click', () => {
        const tope = tallaSeleccionada && Number(tallaSeleccionada.stock) > 0
            ? Number(tallaSeleccionada.stock)
            : null;

        if (tope !== null && cantidadSeleccionada >= tope) return;
        cantidadSeleccionada++;
        actualizarVistaCantidad();
    });
}

document.addEventListener('DOMContentLoaded', inicializarSelectorCantidad);

document.addEventListener('DOMContentLoaded', function () {
    const addCartBtn = document.querySelector('.btn-add-cart');
    if (addCartBtn) {
    addCartBtn.addEventListener('click', function () {
        if (!currentProduct) { alert('Producto no cargado.'); return; }

        if (tallaSeleccionada && Number(tallaSeleccionada.stock) === 0) {
            alert('La talla seleccionada está agotada. Por favor escoge otra talla.');
            return;
        }

        const itemToAdd = { 
            ...currentProduct, 
            quantity: cantidadSeleccionada,
            talla: tallaSeleccionada ? tallaSeleccionada.talla : ''
        };

        CartUtils.addItem('fashion_cart', itemToAdd);

        cantidadSeleccionada = 1;
        actualizarVistaCantidad();

        if (window.miniCarrito && window.miniCarrito.actualizarBadge) {
            window.miniCarrito.actualizarBadge();
        }
        if (window.miniCarrito && window.miniCarrito.toggle) {
            window.miniCarrito.toggle();
        }
    });
    }
});

document.addEventListener('click', function (e) {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;
    e.stopPropagation();

    const pid  = Number(btn.dataset.id);
    const prod = listaCompleta.find(p => Number(p.id_producto || p.id) === pid);
    if (!prod) return;

    CartUtils.addItem('fashion_cart', {
        id: prod.id_producto || prod.id,
        nombre: prod.nombre,
        precio: prod.precio,
        imagen: prod.imagen || ''
    });

    // Actualizar badge y mostrar mini carrito
    if (window.miniCarrito) {
        window.miniCarrito.actualizarBadge();
        window.miniCarrito.toggle();
    }
});
