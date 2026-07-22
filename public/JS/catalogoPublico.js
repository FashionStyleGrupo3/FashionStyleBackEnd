let productosCatalogo = [];

(function () {

    function resolverImagen(ruta) {
        if (!ruta) return "/assets/img1.jpg";
        if (ruta.startsWith("http") || ruta.startsWith("data:")) return ruta;
        const limpia = ruta.replace(/^\/+/, "");
        // Las imagenes estan en public/uploads/ directamente
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

    function formatearPrecio(precio) {
        const num = Number(precio) || 0;
        return "$" + num.toLocaleString("es-CO");
    }

    function pintarGaleria(productos) {
        const contenedor = document.getElementById("galeriaProductos");
        if (!contenedor) return;

        if (!productos.length) {
            contenedor.innerHTML = `<p class="aviso-catalogo-vacio">Nuestra nueva colección se está preparando. ¡Vuelve pronto!</p>`;
            return;
        }

        contenedor.innerHTML = productos.map(p => {
            const id = p.id_producto || p.id;
            return `
            <div class="tarjeta" data-id="${id}">
                <div class="img-box">
                    <img src="${resolverImagen(p.imagen || (p.imagenes && p.imagenes.length > 0 ? (typeof p.imagenes[0] === 'string' ? p.imagenes[0] : p.imagenes[0].ruta) : ''))}" alt="${p.nombre}" onerror="this.onerror=null;">
                    <button class="wish-btn" type="button">♡</button>
                </div>
                <div class="card-info">
                    <button class="cart-btn-circle add-to-cart" data-id="${id}" type="button" title="Agregar al carrito">🛒</button>
                    <div class="card-name">${p.nombre}</div>
                    <div class="card-price">${formatearPrecio(p.precio)}</div>
                    <span class="card-badge">NUEVO</span>
                </div>
            </div>`;
        }).join("");
    }

    function cargarGaleria() {
        fetch("/api/productos/listar_publicos")
            .then(res => res.json())
            .then(data => {
                const lista = Array.isArray(data) ? data : (data.data || []);
                productosCatalogo = lista;
                pintarGaleria(lista);
            })
            .catch(err => {
                console.error("Error cargando colección destacada:", err);
                const contenedor = document.getElementById("galeriaProductos");
                if (contenedor) {
                    contenedor.innerHTML = `<p class="aviso-catalogo-vacio">No se pudo cargar la colección. Intenta más tarde.</p>`;
                }
            });
    }

    document.addEventListener("DOMContentLoaded", cargarGaleria);
})();

function mostrarProducto(id) {
    window.location.href = `producto.html?id=${id}`;
}

// ── Manejar clic en tarjetas de productos ──
// Si se hace clic en el botón de carrito: agrega al carrito y abre mini carrito
// Si se hace clic en cualquier otra parte de la tarjeta: navega al detalle
document.addEventListener('click', function(e) {
    // Buscar si se hizo clic dentro de una tarjeta de producto
    const target = e.target.closest('.tarjeta');
    if (!target) return;

    // Buscar si el clic fue en el botón "Agregar al carrito"
    const addBtn = e.target.closest('.add-to-cart');
    if (addBtn) {
        e.preventDefault();
        e.stopPropagation();

        const pid = Number(addBtn.dataset.id);
        const prod = productosCatalogo.find(p => Number(p.id_producto || p.id) === pid);
        if (!prod) return;

        // Usar CartUtils si está disponible
        if (window.CartUtils) {
            window.CartUtils.addItem('fashion_cart', {
                id: prod.id_producto || prod.id,
                nombre: prod.nombre,
                precio: prod.precio,
                imagen: prod.imagen || ''
            });
        } else if (window.miniCarrito && window.miniCarrito.agregar) {
            window.miniCarrito.agregar({
                id: prod.id_producto || prod.id,
                nombre: prod.nombre,
                precio: prod.precio,
                imagen: prod.imagen || ''
            });
        }

        // Actualizar badge, abrir mini carrito y mostrar notificación toast
        if (window.miniCarrito) {
            window.miniCarrito.actualizarBadge();
            window.miniCarrito.toggle();
        }
        return;
    }

    // Evitar que el clic en el botón wish-list navegue
    if (e.target.closest('.wish-btn')) {
        return;
    }

    // Clic en cualquier otra parte de la tarjeta: navegar al detalle del producto
    const id = target.dataset.id;
    if (id) {
        mostrarProducto(Number(id));
    }
});
