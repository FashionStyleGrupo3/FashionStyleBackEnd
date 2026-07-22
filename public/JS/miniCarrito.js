/* ==========================================================================
   miniCarrito.js — Mini carrito lateral deslizante (Fashion Style)
   Diseño profesional tipo e-commerce con animaciones suaves
   ========================================================================== */

(function () {
    'use strict';

    const CART_KEY = 'fashion_cart';
    const MINI_CONTAINER_ID = 'id1';

    // ── Obtener carrito desde localStorage ──────────────────────────────────
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    // ── Guardar carrito en localStorage ─────────────────────────────────────
    function setCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        actualizarBadge();
        // Disparar evento para sincronizar con otras páginas
        window.dispatchEvent(new CustomEvent('cartChanged', { detail: { key: CART_KEY, data: cart } }));
    }

    // ── Actualizar badge del carrito en todas las páginas ───────────────────
    function actualizarBadge() {
        const cart = getCart();
        const total = cart.reduce((sum, item) => sum + (item.quantity || item.cantidad || 1), 0);
        document.querySelectorAll('.cart-badge').forEach(el => {
            el.textContent = total;
            el.style.display = total > 0 ? 'inline' : 'none';
        });
    }

    // ── Agregar producto al carrito ─────────────────────────────────────────
    function agregarAlCarrito(producto, cantidad = 1) {
        if (!producto || !producto.id) return false;
        const cart = getCart();
        const existente = cart.findIndex(item => item.id === producto.id);
        if (existente >= 0) {
            cart[existente].quantity = (cart[existente].quantity || 1) + cantidad;
        } else {
            cart.push({
                id: producto.id,
                nombre: producto.nombre || 'Producto',
                precio: producto.precio || 0,
                imagen: producto.imagen || '',
                talla: producto.talla || '',
                quantity: cantidad,
            });
        }
        setCart(cart);
        return true;
    }

    // ── Cambiar cantidad de un producto ─────────────────────────────────────
    function cambiarCantidad(id, delta) {
        const cart = getCart();
        const idx = cart.findIndex(item => item.id === id);
        if (idx === -1) return;
        const newQty = (cart[idx].quantity || 1) + delta;
        if (newQty <= 0) {
            cart.splice(idx, 1);
        } else {
            cart[idx].quantity = newQty;
        }
        setCart(cart);
        renderMiniCarrito();
    }

    // ── Eliminar producto del carrito ───────────────────────────────────────
    function eliminarDelCarrito(id) {
        const cart = getCart().filter(item => item.id !== id);
        setCart(cart);
        renderMiniCarrito();
    }

    // ── Formatear precio ────────────────────────────────────────────────────
    function formatPrice(val) {
        return '$' + Number(val).toLocaleString('es-CO');
    }

    // ── Resolver imagen ─────────────────────────────────────────────────────
    function resolverImagen(imagen) {
        if (!imagen) return '../assets/logo.pp.png';
        if (imagen.startsWith('http') || imagen.startsWith('data:')) return imagen;
        if (imagen.startsWith('uploads/')) return '/storage/' + imagen;
        if (imagen.startsWith('/')) return imagen;
        return '/' + imagen;
    }

    // ── Mostrar toast de notificación ───────────────────────────────────────
    function showToast(message, icon = '✅') {
        // Eliminar toast existente
        const existing = document.querySelector('.cart-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-text">${message}</span>`;
        document.body.appendChild(toast);

        // Forzar reflow para animación
        void toast.offsetWidth;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    }

    // ── Renderizar mini carrito (si existe el contenedor) ───────────────────
    function renderMiniCarrito() {
        const container = document.getElementById(MINI_CONTAINER_ID);
        if (!container) return;

        // Asegurar clases
        container.className = 'mini-cart-container';

        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || item.cantidad || 1), 0);
        const totalPrecio = cart.reduce((sum, item) => {
            return sum + (Number(item.precio) || 0) * (item.quantity || item.cantidad || 1);
        }, 0);

        // ── Header ──
        let html = `
            <div class="mini-cart-header">
                <div class="mini-cart-header-left">
                    <span class="cart-icon">🛒</span>
                    <span class="cart-title">Tu Carrito</span>
                    <span class="cart-count">${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}</span>
                </div>
                <button class="mini-cart-close" id="miniCartClose" aria-label="Cerrar carrito">✕</button>
            </div>
        `;

        // ── Cuerpo ──
        if (cart.length === 0) {
            html += `
                <div class="mini-cart-body">
                    <div class="mini-cart-empty">
                        <div class="mini-cart-empty-icon">🛍️</div>
                        <h3>Tu carrito está vacío</h3>
                        <p>Agrega productos para comenzar tu compra</p>
                        <a href="VistaPrevia.html" class="btn-continuar">Ir a la tienda</a>
                    </div>
                </div>
            `;
        } else {
            html += `<div class="mini-cart-body">`;
            cart.forEach(item => {
                const qty = item.quantity || item.cantidad || 1;
                const precio = Number(item.precio) || 0;
                const subtotal = precio * qty;
                const imgSrc = resolverImagen(item.imagen);
                html += `
                    <div class="mini-cart-item" data-id="${item.id}">
                        <img src="${imgSrc}" alt="${item.nombre}" class="mini-cart-item-img" onerror="this.src='../assets/logo.pp.png'">
                        <div class="mini-cart-item-info">
                            <div class="mini-cart-item-name">${item.nombre}</div>
                            ${item.talla ? `<div class="mini-cart-item-size">Talla: ${item.talla}</div>` : ''}
                            <div class="mini-cart-item-price">${formatPrice(precio)}</div>
                        </div>
                        <div class="mini-cart-item-actions">
                            <div class="mini-cart-qty-controls">
                                <button class="mini-cart-qty-btn mini-cart-qty-minus" data-id="${item.id}">−</button>
                                <span class="mini-cart-qty-value">${qty}</span>
                                <button class="mini-cart-qty-btn mini-cart-qty-plus" data-id="${item.id}">+</button>
                            </div>
                            <div class="mini-cart-item-subtotal">${formatPrice(subtotal)}</div>
                            <button class="mini-cart-remove-btn" data-id="${item.id}" title="Eliminar">✕</button>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;

            // ── Footer ──
            html += `
                <div class="mini-cart-footer">
                    <div class="mini-cart-footer-total">
                        <span class="mini-cart-footer-total-label">Total</span>
                        <span class="mini-cart-footer-total-amount">${formatPrice(totalPrecio)}</span>
                    </div>
                    <a href="CarritoGrande.html" class="btn-ver-carrito">Ver carrito completo →</a>
                </div>
            `;
        }

        container.innerHTML = html;

        // ── Event listeners ──
        // Cerrar
        const closeBtn = document.getElementById('miniCartClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', cerrarMiniCarrito);
        }

        // Botones de cantidad +
        container.querySelectorAll('.mini-cart-qty-plus').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                cambiarCantidad(Number(this.dataset.id), 1);
            });
        });

        // Botones de cantidad -
        container.querySelectorAll('.mini-cart-qty-minus').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                cambiarCantidad(Number(this.dataset.id), -1);
            });
        });

        // Botones eliminar
        container.querySelectorAll('.mini-cart-remove-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                eliminarDelCarrito(Number(this.dataset.id));
            });
        });
    }

    // ── Toggle visibilidad del mini carrito ──────────────────────────
    function toggleMiniCarrito() {
        const container = document.getElementById(MINI_CONTAINER_ID);
        if (!container) return;

        const isActive = container.classList.contains('active');

        // Crear/eliminar overlay
        let overlay = document.querySelector('.mini-cart-overlay');
        if (!isActive) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'mini-cart-overlay';
                overlay.id = 'miniCartOverlay';
                overlay.addEventListener('click', cerrarMiniCarrito);
                document.body.appendChild(overlay);
            }
            // Forzar reflow
            void overlay.offsetWidth;
            overlay.classList.add('active');
            container.classList.add('active');
            // Prevenir scroll del body
            document.body.style.overflow = 'hidden';
        } else {
            cerrarMiniCarrito();
        }
    }

    // ── Cerrar mini carrito ──────────────────────────────────────────
    function cerrarMiniCarrito() {
        const container = document.getElementById(MINI_CONTAINER_ID);
        const overlay = document.querySelector('.mini-cart-overlay');
        if (container) container.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ── Inicializar ─────────────────────────────────────────────────────────
    function init() {
        actualizarBadge();
        renderMiniCarrito();

        // Click en el icono 🛒 para mostrar/ocultar el mini carrito
        document.querySelectorAll('.btn-carrito').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                toggleMiniCarrito();
            });
        });

        // Cerrar con tecla Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                cerrarMiniCarrito();
            }
        });

        // Escuchar cambios en localStorage desde otras pestañas
        window.addEventListener('storage', function (e) {
            if (e.key === CART_KEY) {
                actualizarBadge();
                renderMiniCarrito();
            }
        });

        // Escuchar evento personalizado de CartUtils
        window.addEventListener('cartChanged', function () {
            actualizarBadge();
            renderMiniCarrito();
        });
    }

    // Exponer funciones globalmente
    window.miniCarrito = {
        getCart: getCart,
        agregar: agregarAlCarrito,
        eliminar: eliminarDelCarrito,
        actualizarBadge: actualizarBadge,
        render: renderMiniCarrito,
        toggle: toggleMiniCarrito,
        cerrar: cerrarMiniCarrito,
        showToast: showToast,
    };

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();