let productos = [];

function cargarProductos() {
    let local = localStorage.getItem("productos");
    if (local) {
        productos = JSON.parse(local);
        mostrarAdmin();
    } else {
        fetch('../Json/Productos.Json')
        .then(r => r.json())
        .then(data => {
            productos = data;
            localStorage.setItem("productos", JSON.stringify(productos));
            mostrarAdmin();
        });
    }
}

function mostrarAdmin() {
    const galeria = document.getElementById("adminGaleria");
    galeria.innerHTML = "";

    productos.forEach(p => {
        galeria.innerHTML += `
        <div class="tarjeta" onclick="editarProducto(${p.id})">
            <div class="img-box"><img src="../${p.imagen}"></div>
            <div class="name">${p.nombre}<br>${p.precio}</div>
        </div>`;
    });
}

function editarProducto(id) {
    const p = productos.find(x => x.id === id);
    document.getElementById("edit-id").value = p.id;
    document.getElementById("edit-nombre").value = p.nombre;
    document.getElementById("edit-precio").value = p.precio;
    document.getElementById("edit-descripcion").value = p.descripcion;
    document.getElementById("edit-imagen").value = p.imagen;

    document.getElementById("producto-detalle").style.display = "block";
}

function cerrarModal() {
    document.getElementById("producto-detalle").style.display = "none";
}

function guardarEdicion() {
    const id = parseInt(document.getElementById("edit-id").value);
    const p = productos.find(x => x.id === id);

    p.nombre = document.getElementById("edit-nombre").value;
    p.precio = document.getElementById("edit-precio").value;
    p.descripcion = document.getElementById("edit-descripcion").value;
    p.imagen = document.getElementById("edit-imagen").value;

    localStorage.setItem("productos", JSON.stringify(productos));
    cerrarModal();
    mostrarAdmin();
    alert("Producto actualizado");
}

cargarProductos();