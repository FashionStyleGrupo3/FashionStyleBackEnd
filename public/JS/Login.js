const API_AUTH = "/api/auth";

function togglePw() {
    const input = document.getElementById('password');
    const icon  = document.getElementById('eyeIcon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function handleLogin() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Por favor completa correo y contraseña.");
        return;
    }

    const boton = document.querySelector(".btn-ingresar");
    const textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = "Ingresando...";

    fetch(`${API_AUTH}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, password })
    })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                window.location.href = data.redirect || "VistaPrevia.html";
            } else {
                alert(data.error || "Usuario o contraseña incorrectos.");
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