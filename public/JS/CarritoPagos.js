
document.addEventListener('DOMContentLoaded', () => {
    
    // Referencias al DOM
    const selectIdentificacion = document.getElementById('identificacion');
    const selectDepartamento = document.getElementById('departamento');
    const selectCiudad = document.getElementById('ciudad');
    const payBtn = document.getElementById('payBtn');
    
    let loadedData = {};

    // 1. CARGA DE DATOS GEOGRÁFICOS (JSON)
    fetch('../Json/data.json')
        .then(response => {
            if (!response.ok) throw new Error("Error JSON");
            return response.json();
        })
        .then(data => {
            loadedData = data; 
            inicializarFormulario();
        })
        .catch(error => {
            console.warn('Aviso: Usa Live Server para cargar los departamentos correctamente.');
            if (selectIdentificacion) selectIdentificacion.innerHTML = '<option>Error de carga</option>';
        });

    function inicializarFormulario() {
        if (!selectIdentificacion || !selectDepartamento) return;

        // Documentos
        selectIdentificacion.innerHTML = '<option value="">Seleccionar...</option>';
        loadedData.documentTypes.forEach(type => {
            let option = document.createElement('option');
            option.value = type.val;
            option.textContent = type.label;
            selectIdentificacion.appendChild(option);
        });

        // Departamentos
        selectDepartamento.innerHTML = '<option value="">Seleccione Departamento...</option>';
        Object.keys(loadedData.locations).forEach(dep => {
            let option = document.createElement('option');
            option.value = dep;
            option.textContent = dep;
            selectDepartamento.appendChild(option);
        });
    }

    // 2. CAMBIO DE DEPARTAMENTO
    if (selectDepartamento) {
        selectDepartamento.addEventListener('change', function() {
            const dep = this.value;
            selectCiudad.innerHTML = '<option value="">Seleccione Ciudad...</option>';

            if (dep && loadedData.locations[dep]) {
                selectCiudad.disabled = false;
                loadedData.locations[dep].forEach(ciudad => {
                    let option = document.createElement('option');
                    option.value = ciudad;
                    option.textContent = ciudad;
                    selectCiudad.appendChild(option);
                });
            } else {
                selectCiudad.disabled = true;
                selectCiudad.innerHTML = '<option value="">Seleccione un departamento primero</option>';
            }
        });
    }

    // 3. CARGAR CARRITO REAL DESDE LOCALSTORAGE
    const productosCarrito = CartUtils.get('fashion_cart'); 
    cargarResumenCompra(productosCarrito);

    // 4. LÓGICA DE PAGO
    if (payBtn) {
        payBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const inputs = document.querySelectorAll('input, select');
            let filled = true;

            inputs.forEach(input => {
                if(input.offsetParent !== null && input.required && input.value.trim() === '') {
                    filled = false;
                    input.style.borderColor = 'red';
                } else if (input.offsetParent !== null) {
                    input.style.borderColor = '#ccc';
                }
            });

            if(!filled) {
                alert("Por favor, completa todos los campos obligatorios.");
            } else if (productosCarrito.length === 0) {
                alert("El carrito está vacío.");
            } else {
                // Limpiar carrito tras compra exitosa
                CartUtils.save('fashion_cart', []);
                window.location.href = 'CompraExitosa.html';
            }
        });
    }
});

function cargarResumenCompra(productos) {
    const footerSection = document.getElementById('resumenCompra');
    if (!footerSection) return;
    
    if (productos.length === 0) {
        footerSection.innerHTML = '<p style="text-align:center; padding:20px;">Tu carrito está vacío</p>';
        return;
    }
    
    footerSection.style.display = 'flex';

    // Referencias a los contenedores internos (si existen en el HTML)
    const carouselContainer = document.getElementById('cart-items-carousel');
    const listContainer = document.getElementById('cart-list-details');
    const totalsContainer = document.getElementById('cart-totals');

    if (carouselContainer) carouselContainer.innerHTML = '';
    if (listContainer) listContainer.innerHTML = '';
    if (totalsContainer) totalsContainer.innerHTML = '';

    let subTotal = 0;

    productos.forEach(prod => {
        // Imagen
        if (carouselContainer) {
            const img = document.createElement('img');
            img.src = '../' + (prod.imagen || prod.img); 
            img.className = 'prod-thumb';
            img.style.width = '60px';
            img.style.marginRight = '10px';
            carouselContainer.appendChild(img);
        }

        // Descripción
        if (listContainer) {
            const itemDesc = document.createElement('div');
            itemDesc.textContent = `${prod.nombre} x ${prod.quantity}`;
            listContainer.appendChild(itemDesc);
        }

        // Cálculo de subtotal
        const precioNum = parseFloat(String(prod.precio).replace(/[^0-9]/g, ""));
        subTotal += precioNum * (prod.quantity || 1);
    });

    if (totalsContainer) {
        const subTotalElem = document.createElement('div');
        subTotalElem.className = 'price-row';
        subTotalElem.textContent = `Sub total $${subTotal.toLocaleString('es-CO')}`;
        
        const totalElem = document.createElement('div');
        totalElem.className = 'price-row';
        totalElem.style.fontWeight = 'bold';
        totalElem.textContent = `Total De La Compra $${subTotal.toLocaleString('es-CO')}`;

        totalsContainer.appendChild(subTotalElem);
        totalsContainer.appendChild(totalElem);
    }
}
