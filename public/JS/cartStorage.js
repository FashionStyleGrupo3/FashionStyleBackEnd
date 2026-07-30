// ========== OBJETO UTILITARIO GLOBAL DEL CARRITO ==========
window.CartUtils = {
    get(key) {
        try {
            const d = localStorage.getItem(key);
            return d ? JSON.parse(d) : [];
        } catch (e) {
            return [];
        }
    },
    save(key, d) {
        localStorage.setItem(key, JSON.stringify(d));
        window.dispatchEvent(new CustomEvent('cartChanged', { detail: { key, data: d } }));
    },
    addItem(key, it) {
        const its = this.get(key);
        const idx = its.findIndex(i => i.id === it.id);
        if (idx > -1) {
            its[idx].quantity = (its[idx].quantity || 0) + (it.quantity || 1);
        } else {
            its.push({ ...it, quantity: it.quantity || 1 });
        }
        this.save(key, its);
    },
    updateQuantity(key, id, delta) {
        const its = this.get(key);
        const idx = its.findIndex(i => i.id === id);
        if (idx > -1) {
            its[idx].quantity = (its[idx].quantity || 0) + delta;
            if (its[idx].quantity <= 0) {
                its.splice(idx, 1);
            }
            this.save(key, its);
        }
    },
    removeItem(key, id) {
        const its = this.get(key).filter(i => i.id !== id);
        this.save(key, its);
    },
    getTotal(key) {
        return this.get(key).reduce((t, i) => {
            const price = Number(String(i.precio || 0).replace(/[^0-9.-]/g, '')) || 0;
            return t + price * (i.quantity || 1);
        }, 0);
    },
    getCount(key) {
        return this.get(key).reduce((c, i) => c + (i.quantity || 1), 0);
    },
    clear(key) {
        localStorage.removeItem(key);
        window.dispatchEvent(new CustomEvent('cartChanged', { detail: { key, data: [] } }));
    }
};


// NOTA: La carga del catálogo público (Colección Destacada en main.html)
// se maneja en JS/catalogoPublico.js, que consulta la API real
// (api/productos/listar_publicos.php) en vez de localStorage.
// Los productos se agregan al carrito usando window.CartUtils con la
// clave 'fashion_cart' desde JS/ProductoDetalle.js.