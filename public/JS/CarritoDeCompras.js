const CART_KEY = 'fashion_cart';

document.addEventListener('DOMContentLoaded', () => {
    renderCheckout();
});

window.addEventListener('cartChanged', (e) => {
    if (e.detail.key === CART_KEY) renderCheckout();
});

function formatMoney(v) {
    return `$${v.toLocaleString('es-CO')}`;
}

function renderCheckout() {
    const items = CartUtils.get(CART_KEY);
    const footer = document.getElementById('resumenCompra');
    const carousel = document.getElementById('cart-items-carousel');
    const details = document.getElementById('cart-list-details');
    const totals = document.getElementById('cart-totals');

    if (!footer || !details || !totals) return;

    if (!items || items.length === 0) {
        footer.style.display = 'none';
        return;
    }

    footer.style.display = 'flex';

    carousel.innerHTML = items.map(i => `
        <div class="mini-prod">
            <img src="${i.imagen && i.imagen.startsWith('uploads/') ? '/storage/' + i.imagen : i.imagen || i.img || ''}" alt="${i.nombre}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;margin:6px;">
        </div>
    `).join('');

    details.innerHTML = items.map(i => {
        const price = Number(String(i.precio || 0).replace(/[^0-9.-]/g, '')) || 0;
        return `
            <div style="display:flex;justify-content:space-between;padding:6px 0;">
                <div style="max-width:60%">${i.nombre} x ${i.quantity}</div>
                <div style="font-weight:600">${formatMoney(price * (i.quantity || 1))}</div>
            </div>`;
    }).join('');

    const subtotal = CartUtils.getTotal(CART_KEY);
    const iva = +(subtotal * 0.13);
    const total = subtotal + iva;

    totals.innerHTML = `
        <div style="padding:6px 0;display:flex;justify-content:space-between;"><span>Subtotal</span><strong>${formatMoney(subtotal)}</strong></div>
        <div style="padding:6px 0;display:flex;justify-content:space-between;"><span>IVA (13%)</span><strong>${formatMoney(iva)}</strong></div>
        <div style="padding:10px 0;border-top:1px solid #eee;margin-top:6px;display:flex;justify-content:space-between;font-size:1.05rem;"><span>Total</span><strong>${formatMoney(total)}</strong></div>
    `;
}

// Pay button: basic flow (collect form data and show confirmation)
const payBtn = document.getElementById('payBtn');
if (payBtn) {
    payBtn.addEventListener('click', () => {
        const nombre = document.getElementById('nombre')?.value || '';
        const apellido = document.getElementById('apellido')?.value || '';
        if (!nombre || !apellido) {
            alert('Por favor completa tu nombre y apellido antes de pagar.');
            return;
        }
        const items = CartUtils.get(CART_KEY);
        const subtotal = CartUtils.getTotal(CART_KEY);
        const iva = +(subtotal * 0.13);
        const total = subtotal + iva;
        // For now, show a confirmation and clear cart
        alert(`Gracias ${nombre}. Pedido confirmado. Total: ${formatMoney(total)}`);
        CartUtils.clear(CART_KEY);
        window.location.href = 'CompraExitosa.html';
    });
}
