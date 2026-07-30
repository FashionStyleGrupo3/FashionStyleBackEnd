/**
 * CarritoGrande.js
 * Maneja el carrito de compras grande (página CarritoGrande.html)
 * Carga y muestra productos desde localStorage
 */

const CART_KEY = 'fashion_cart';

// ── Obtener carrito desde localStorage ─────────────────────────
function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
        return [];
    }
}

// ── Guardar carrito en localStorage y notificar ────────────────
function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // Notificar a otros componentes
    window.dispatchEvent(new CustomEvent('cartChanged', { detail: { key: CART_KEY, data: cart } }));
    if (window.miniCarrito && window.miniCarrito.actualizarBadge) {
        window.miniCarrito.actualizarBadge();
    }
}

// ── Formatear moneda ───────────────────────────────────────────
function formatMoney(val) {
    return '$' + Number(val).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Resolver URL de imagen ─────────────────────────────────────
function resolverImagen(imagen) {
    if (!imagen) return '/assets/img1.jpg';
    if (String(imagen).startsWith('http') || String(imagen).startsWith('data:')) return imagen;
    if (String(imagen).startsWith('uploads/')) return '/storage/' + imagen;
    return '/' + imagen;
}

// ── Renderizar items del carrito ───────────────────────────────
function renderCartItems() {
    const container = document.getElementById('cart-large-items');
    const emptyState = document.getElementById('empty-state');
    const cart = getCart();

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        updateSummary(0);
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    let html = '';
    cart.forEach((item, index) => {
        const qty = item.quantity || item.cantidad || 1;
        const precio = Number(item.precio) || 0;
        const subtotal = precio * qty;
        const imgSrc = resolverImagen(item.imagen);

        html += `
            <div class="cart-row" data-index="${index}" data-id="${item.id}">
                <div class="cart-row-product">
                    <img src="${imgSrc}" alt="${item.nombre}" onerror="this.src='/assets/img1.jpg'">
                    <div class="cart-row-info">
                        <span class="cart-row-name">${item.nombre}</span>
                        ${item.talla ? `<span style="font-size:12px;color:#888;">Talla: ${item.talla}</span>` : ''}
                    </div>
                </div>
                <div class="cart-row-price">${formatMoney(precio)}</div>
                <div class="cart-row-qty">
                    <button class="qty-minus" data-id="${item.id}">−</button>
                    <span class="qty">${qty}</span>
                    <button class="qty-plus" data-id="${item.id}">+</button>
                </div>
                <div class="cart-row-sub">${formatMoney(subtotal)}</div>
                <div>
                    <button class="remove-item" data-id="${item.id}">✕ Eliminar</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Event listeners para botones +/-
    container.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = Number(this.dataset.id);
            changeQuantity(id, 1);
        });
    });

    container.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = Number(this.dataset.id);
            changeQuantity(id, -1);
        });
    });

    container.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = Number(this.dataset.id);
            removeItem(id);
        });
    });

    updateSummary(cart);
}

// ── Cambiar cantidad ──────────────────────────────────────────
function changeQuantity(id, delta) {
    const cart = getCart();
    const idx = cart.findIndex(item => item.id === id);
    if (idx === -1) return;

    const oldQty = cart[idx].quantity || cart[idx].cantidad || 1;
    const newQty = oldQty + delta;

    if (newQty <= 0) {
        // Eliminar si llega a 0
        cart.splice(idx, 1);
    } else {
        cart[idx].quantity = newQty;
    }

    setCart(cart);
    renderCartItems();
}

// ── Eliminar item ──────────────────────────────────────────────
function removeItem(id) {
    const cart = getCart().filter(item => item.id !== id);
    setCart(cart);
    renderCartItems();
}

// ── Actualizar resumen ────────────────────────────────────────
function updateSummary(cartOrTotal) {
    let subtotal = 0;
    let totalItems = 0;

    if (typeof cartOrTotal === 'number') {
        subtotal = cartOrTotal;
    } else {
        const cart = cartOrTotal || getCart();
        cart.forEach(item => {
            const qty = item.quantity || item.cantidad || 1;
            subtotal += (Number(item.precio) || 0) * qty;
            totalItems += qty;
        });
    }

    const iva = subtotal * 0.13;
    const total = subtotal + iva;

    const elSubtotal = document.getElementById('cart-subtotal');
    const elIva = document.getElementById('cart-iva');
    const elTotal = document.getElementById('cart-total');

    if (elSubtotal) elSubtotal.textContent = formatMoney(subtotal);
    if (elIva) elIva.textContent = formatMoney(iva);
    if (elTotal) elTotal.textContent = formatMoney(total);

    // Actualizar badge también
    if (window.miniCarrito && window.miniCarrito.actualizarBadge) {
        window.miniCarrito.actualizarBadge();
    }
}

// ── Vaciar carrito ─────────────────────────────────────────────
function clearCart() {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
        setCart([]);
        renderCartItems();
    }
}

// ── Inicializar ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    renderCartItems();

    // Botón vaciar carrito
    const clearBtn = document.getElementById('clear-cart');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCart);
    }

    // Escuchar cambios desde otras pestañas/páginas
    window.addEventListener('storage', function(e) {
        if (e.key === CART_KEY) {
            renderCartItems();
        }
    });

    window.addEventListener('cartChanged', function() {
        renderCartItems();
    });

    // También cargar sugerencias (función existente)
    if (typeof cargarSugerencias === 'function') {
        cargarSugerencias();
    }
});