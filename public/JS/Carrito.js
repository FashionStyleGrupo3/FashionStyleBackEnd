document.addEventListener("DOMContentLoaded", function () {

    const botonesEliminar = document.querySelectorAll(".eliminar");
    const totalElemento = document.querySelector(".resumen-compra p");

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", function () {

            const producto = this.closest(".producto");

            // Obtener precio correctamente
            const precioTexto = producto.querySelector("p:nth-of-type(2)").textContent;
            const precio = parseFloat(precioTexto.replace("Precio: $", ""));

            let totalActual = parseFloat(totalElemento.textContent.replace("Total: $", ""));
            totalActual -= precio;

            totalElemento.textContent = "Total: $" + totalActual.toFixed(2);

            producto.remove();
        });
    });

    const metodoPago = document.getElementById("metodoPago");
    const metodoTexto = document.getElementById("metodoSeleccionado");
    const finalizarBtn = document.querySelector(".finalizar-compra");

    let metodoSeleccionado = "";

    metodoPago.addEventListener("change", function () {
        metodoSeleccionado = this.value;

        if (metodoSeleccionado !== "") {
            metodoTexto.textContent = "Método de Pago: " + metodoSeleccionado;
        } else {
            metodoTexto.textContent = "";
        }
    });

    finalizarBtn.addEventListener("click", function () {

        if (metodoSeleccionado === "") {
            alert("Por favor, selecciona un método de pago antes de finalizar.");
            return;
        }

        alert("Compra realizada con " + metodoSeleccionado + ". ¡Gracias por tu compra!");
        console.log("Método registrado:", metodoSeleccionado);
    });

});
