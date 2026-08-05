const API_AUTH = "/api/auth";

function togglePw(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

function checkStrength() {
    const val = document.getElementById("password").value;

    const segs = [
        document.getElementById("seg1"),
        document.getElementById("seg2"),
        document.getElementById("seg3"),
        document.getElementById("seg4")
    ];

    const text = document.getElementById("strengthText");

    let score = 0;

    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const colors = ["#ff4d6d", "#ff9f1c", "#2ec4b6", "#06d6a0"];
    const labels = ["Débil", "Regular", "Buena", "Fuerte"];

    const active = val.length === 0 ? 0 : Math.max(score, 1);

    segs.forEach((seg, index) => {
        seg.style.background = index < active ? colors[active - 1] : "#e5e5e5";
    });

    text.textContent = active === 0 ? "Débil" : labels[active - 1];
    text.style.color = active === 0 ? "#999" : colors[active - 1];
}

function handleRegistro() {
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const password = document.getElementById("password").value;
    const confirmar = document.getElementById("confirmar").value;
    const terminos = document.getElementById("terminos").checked;

    if (!nombre || !email || !password || !confirmar) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
    }

    if (password !== confirmar) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    if (!terminos) {
        alert("Debes aceptar los Términos y Condiciones.");
        return;
    }

    const boton = document.querySelector(".btn-registrarse");
    const textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = "Creando cuenta...";

    fetch(`${API_AUTH}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ nombre, email, telefono, password })
    })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                window.location.href = "VistaPrevia.html";
            } else {
                alert(data.error || "No se pudo completar el registro.");
                boton.disabled = false;
                boton.textContent = textoOriginal;
            }
        })
        .catch(err => {
            console.error(err);
            alert("Error de conexión con el servidor.");
            boton.disabled = false;
            boton.textContent = textoOriginal;
        });
}