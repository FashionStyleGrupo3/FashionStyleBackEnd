function cargarProductos() {
  let productos = JSON.parse(localStorage.getItem("productos"));

  if (!productos) {
    return fetch('../Json/Productos.Json')
      .then(r => r.json())
      .then(data => {
        localStorage.setItem("productos", JSON.stringify(data));
        return data;
      });
  } else {
    return Promise.resolve(productos);
  }
}