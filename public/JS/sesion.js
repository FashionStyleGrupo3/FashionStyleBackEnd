const API_AUTH = "/api/auth";

function actualizarHeaderSesion() {
    fetch(`${API_AUTH}/sesion`)
        .then(res => res.json())
        .then(data => {
            const btnLogin    = document.getElementById("btnLogin");
            const btnRegister = document.getElementById("btnRegister");
            const userMenu    = document.getElementById("userMenu");
            const userNombre  = document.getElementById("userNombre");
            const userEmail   = document.getElementById("userEmail");

            if (!btnLogin || !btnRegister || !userMenu || !userNombre || !userEmail) return;

            if (data.ok) {
                btnLogin.style.display = "none";
                btnRegister.style.display = "none";
                userMenu.style.display = "flex";
                userNombre.textContent = (data.usuario_nombre || "").split(" ")[0];
            } else {
                btnLogin.style.display = "";
                btnRegister.style.display = "";
                userMenu.style.display = "none";
            }
        })
        .catch(err => console.error("No se pudo verificar la sesión:", err));
}

function toggleUserDropdown(e) {
    e.stopPropagation();
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) dropdown.classList.toggle("open");
}

function cerrarDropdownSiClicAfuera() {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) dropdown.classList.remove("open");
}

function cerrarSesion(e) {
    e.preventDefault();
    fetch(`${API_AUTH}/logout`, { method: "POST" })
        .then(() => window.location.href = "VistaPrevia.html")
        .catch(err => console.error(err));
}

document.addEventListener("DOMContentLoaded", () => {
    actualizarHeaderSesion();

    const userIconBtn = document.getElementById("userIconBtn");
    if (userIconBtn) userIconBtn.addEventListener("click", toggleUserDropdown);

    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) btnLogout.addEventListener("click", cerrarSesion);

    document.addEventListener("click", cerrarDropdownSiClicAfuera);
});