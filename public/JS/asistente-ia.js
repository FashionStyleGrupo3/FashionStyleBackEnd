/**
 * Asistente ERP - Fashion Style
 * Sistema completo de gestión empresarial con IA
 * Versión 4.0 - Con historial de chat persistente y tema corporativo
 */

(function () {
    'use strict';

    const API_BASE = '/api/ia';
    const STORAGE_KEY = 'fs_chat_history';

    let estado = {
        abierto: false,
        mensajes: [],
        enviando: false,
        noLeidos: 0,
        conversacionActiva: false,
        pasoActual: null,
        totalPasos: 7,
        progreso: 0,
        imagenes: [],
        conversacionActual: null,
        conversaciones: [],
        mostrandoHistorial: false,
    };

    // ─── Verificar si el usuario es administrador ───
    async function esAdmin() {
        try {
            const res = await fetch('/api/auth/sesion', {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            });
            const data = await res.json();
            return data.ok && (data.rol === 1 || data.rol === 2);
        } catch (e) { return false; }
    }

    // ─── Inicializar ───
    async function init() {
        const admin = await esAdmin();
        if (!admin) return;
        if (document.getElementById('ia-container')) return;

        const container = document.createElement('div');
        container.id = 'ia-container';
        container.innerHTML = `
            <button id="ia-fab" class="ia-fab" title="Asistente ERP">
                <span class="ia-fab-icon">🤖</span>
                <span class="ia-fab-close">✕</span>
                <span id="ia-badge" class="ia-badge">0</span>
            </button>

            <div id="ia-window" class="ia-window">
                <div class="ia-header">
                    <div class="ia-avatar">🤖</div>
                    <div class="ia-header-info">
                        <div class="ia-header-title" id="ia-chat-title">Asistente ERP</div>
                        <div class="ia-header-status">
                            <span class="ia-status-dot"></span> En línea
                        </div>
                    </div>
                    <div class="ia-header-actions">
                        <button id="ia-btn-history" class="ia-header-btn" title="Historial de chats">📋</button>
                        <button id="ia-btn-dashboard" class="ia-header-btn" title="Dashboard ejecutivo">📊</button>
                        <button id="ia-btn-newchat" class="ia-header-btn" title="Nuevo chat">➕</button>
                        <button id="ia-btn-clear" class="ia-header-btn" title="Limpiar">🗑️</button>
                        <button id="ia-btn-close" class="ia-header-btn" title="Cerrar">✕</button>
                    </div>
                </div>

                <div id="ia-progress-bar" class="ia-progress-bar" style="display:none;">
                    <div class="ia-progress-track">
                        <div id="ia-progress-fill" class="ia-progress-fill"></div>
                    </div>
                    <span id="ia-progress-text" class="ia-progress-text">0%</span>
                </div>

                <!-- Panel de historial lateral -->
                <div id="ia-history-panel" class="ia-history-panel" style="display:none;">
                    <div class="ia-history-header">
                        <h3>📋 Historial</h3>
                        <div class="ia-history-search">
                            <input type="text" id="ia-history-search" placeholder="Buscar conversaciones..." class="ia-inp">
                        </div>
                    </div>
                    <div id="ia-history-list" class="ia-history-list"></div>
                </div>

                <div id="ia-body" class="ia-body">
                    <div class="ia-welcome" id="ia-welcome">
                        <div class="ia-welcome-icon">🤖</div>
                        <h3>¡Bienvenido al Asistente ERP!</h3>
                        <p>Gestiona productos, clientes, ventas, finanzas y más con lenguaje natural.</p>
                        <div class="ia-welcome-suggestions">
                            <button class="ia-suggestion-btn" data-msg="Quiero agregar un producto">➕ Agregar producto</button>
                            <button class="ia-suggestion-btn" data-msg="Productos con bajo stock">⚠️ Ver bajo stock</button>
                            <button class="ia-suggestion-btn" data-msg="Busca al cliente Juan Pérez">👤 Buscar cliente</button>
                            <button class="ia-suggestion-btn" data-msg="Dashboard ejecutivo">📊 Dashboard</button>
                            <button class="ia-suggestion-btn" data-msg="Registra un gasto de 50000 en publicidad">💰 Registrar gasto</button>
                            <button class="ia-suggestion-btn" data-msg="Flujo de caja">💵 Flujo de caja</button>
                            <button class="ia-suggestion-btn" data-msg="Producto más vendido">🏆 Más vendido</button>
                            <button class="ia-suggestion-btn" data-msg="Genera descripción para camiseta negra">✍️ Generar descripción</button>
                            <button class="ia-suggestion-btn" data-msg="Calcula producción para 50 camisetas">🏭 Calcular producción</button>
                            <button class="ia-suggestion-btn" data-msg="ayuda">❓ Ayuda</button>
                        </div>
                    </div>
                    <div id="ia-messages"></div>
                    <div id="ia-typing" class="ia-typing">
                        <span class="ia-typing-dot"></span>
                        <span class="ia-typing-dot"></span>
                        <span class="ia-typing-dot"></span>
                    </div>
                </div>

                <div class="ia-footer">
                    <button id="ia-attach-btn" class="ia-attach-btn" title="Adjuntar imagen">📎</button>
                    <textarea id="ia-input" class="ia-input" placeholder="Escribe un mensaje o comando..." rows="1"></textarea>
                    <button id="ia-send-btn" class="ia-send-btn" title="Enviar">➤</button>
                </div>

                <div id="ia-dropzone" class="ia-dropzone">
                    <div class="ia-dropzone-content">
                        <span class="ia-dropzone-icon">📸</span>
                        <p>Suelta tu imagen aquí</p>
                        <small>JPG, PNG o WEBP (max 5MB)</small>
                    </div>
                </div>
            </div>

            <input type="file" id="ia-file-input" accept="image/jpeg,image/png,image/webp" style="display:none;">
        `;

        document.body.appendChild(container);

        document.getElementById('ia-fab').addEventListener('click', toggleChat);
        document.getElementById('ia-btn-close').addEventListener('click', toggleChat);
        document.getElementById('ia-btn-clear').addEventListener('click', limpiarChat);
        document.getElementById('ia-btn-dashboard').addEventListener('click', () => abrirDashboard());
        document.getElementById('ia-btn-history').addEventListener('click', toggleHistorial);
        document.getElementById('ia-btn-newchat').addEventListener('click', nuevaConversacion);
        document.getElementById('ia-send-btn').addEventListener('click', enviarMensaje);
        document.getElementById('ia-attach-btn').addEventListener('click', () => document.getElementById('ia-file-input').click());
        document.getElementById('ia-file-input').addEventListener('change', manejarSeleccionArchivo);
        document.getElementById('ia-history-search').addEventListener('input', filtrarHistorial);

        const input = document.getElementById('ia-input');
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensaje(); }
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 80) + 'px';
        });

        document.querySelectorAll('.ia-suggestion-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.getElementById('ia-input').value = this.dataset.msg;
                enviarMensaje();
            });
        });

        const dropzone = document.getElementById('ia-dropzone');
        const win = document.getElementById('ia-window');
        win.addEventListener('dragenter', (e) => { e.preventDefault(); e.stopPropagation(); if (estado.conversacionActiva) dropzone.classList.add('visible'); });
        win.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); if (estado.conversacionActiva) dropzone.classList.add('visible'); });
        win.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); if (!win.contains(e.relatedTarget)) dropzone.classList.remove('visible'); });
        win.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); dropzone.classList.remove('visible'); if (e.dataTransfer.files.length > 0) subirImagen(e.dataTransfer.files[0]); });

        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && estado.abierto) toggleChat(); });
        
        // Cargar conversaciones al iniciar
        await cargarConversaciones();
        verificarEstadoConversacion();
        if (typeof Chart === 'undefined') cargarChartJS();
    }

    function cargarChartJS() {
        if (document.querySelector('script[src*="chart.js"]')) return;
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        document.head.appendChild(script);
    }

    function toggleChat() {
        estado.abierto = !estado.abierto;
        const fab = document.getElementById('ia-fab');
        const win = document.getElementById('ia-window');
        fab.classList.toggle('abierto', estado.abierto);
        win.classList.toggle('abierto', estado.abierto);
        if (estado.abierto) {
            estado.noLeidos = 0;
            actualizarBadge();
            document.getElementById('ia-input').focus();
            scrollToBottom();
            verificarEstadoConversacion();
        }
    }

    // ════════════════════════════════════════════════════════════════
    //  HISTORIAL DE CHAT
    // ════════════════════════════════════════════════════════════════

    async function cargarConversaciones() {
        try {
            const res = await fetch(`${API_BASE}/conversaciones`, {
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': obtenerCsrfToken() },
                credentials: 'same-origin',
            });
            const data = await res.json();
            if (data.ok) {
                estado.conversaciones = data.conversaciones;
                // Backup en localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data.conversaciones));
            }
        } catch (err) {
            // Fallback a localStorage
            const backup = localStorage.getItem(STORAGE_KEY);
            if (backup) {
                estado.conversaciones = JSON.parse(backup);
            }
        }
    }

    function toggleHistorial() {
        estado.mostrandoHistorial = !estado.mostrandoHistorial;
        const panel = document.getElementById('ia-history-panel');
        panel.style.display = estado.mostrandoHistorial ? 'flex' : 'none';
        if (estado.mostrandoHistorial) renderizarHistorial();
    }

    function renderizarHistorial() {
        const lista = document.getElementById('ia-history-list');
        const busqueda = document.getElementById('ia-history-search').value.toLowerCase();
        
        let conversaciones = estado.conversaciones;
        if (busqueda) {
            conversaciones = conversaciones.filter(c => 
                c.titulo.toLowerCase().includes(busqueda) || 
                (c.ultimo_mensaje && c.ultimo_mensaje.toLowerCase().includes(busqueda))
            );
        }

        if (conversaciones.length === 0) {
            lista.innerHTML = '<div class="ia-history-empty">No hay conversaciones</div>';
            return;
        }

        lista.innerHTML = conversaciones.map(c => `
            <div class="ia-history-item" data-id="${c.id}" onclick="seleccionarConversacion(${c.id})">
                <div class="ia-history-item-title">${c.titulo}</div>
                <div class="ia-history-item-preview">${c.ultimo_mensaje || 'Sin mensajes'}</div>
                <div class="ia-history-item-meta">
                    <span>${c.total_mensajes} msgs</span>
                    <span>${c.updated_at}</span>
                </div>
                <div class="ia-history-item-actions">
                    <button onclick="event.stopPropagation(); renombrarConversacion(${c.id})" title="Renombrar">✏️</button>
                    <button onclick="event.stopPropagation(); duplicarConversacion(${c.id})" title="Duplicar">📋</button>
                    <button onclick="event.stopPropagation(); eliminarConversacion(${c.id})" title="Eliminar">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    function filtrarHistorial() { renderizarHistorial(); }

    async function nuevaConversacion() {
        try {
            const res = await fetch(`${API_BASE}/conversaciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': obtenerCsrfToken() },
                credentials: 'same-origin',
                body: JSON.stringify({ titulo: 'Nueva conversación' }),
            });
            const data = await res.json();
            if (data.ok) {
                estado.conversacionActual = data.conversacion;
                estado.mensajes = [];
                document.getElementById('ia-messages').innerHTML = '';
                document.getElementById('ia-welcome').style.display = 'block';
                document.getElementById('ia-chat-title').textContent = 'Nueva conversación';
                if (estado.mostrandoHistorial) toggleHistorial();
                await cargarConversaciones();
            }
        } catch (err) {
            console.error('[IA] Error creando conversación:', err);
        }
    }

    async function seleccionarConversacion(id) {
        try {
            const res = await fetch(`${API_BASE}/conversaciones/${id}`, {
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': obtenerCsrfToken() },
                credentials: 'same-origin',
            });
            const data = await res.json();
            if (data.ok) {
                estado.conversacionActual = { id: data.conversacion.id, titulo: data.conversacion.titulo };
                estado.mensajes = data.conversacion.mensajes || [];
                
                const container = document.getElementById('ia-messages');
                container.innerHTML = '';
                document.getElementById('ia-welcome').style.display = 'none';
                document.getElementById('ia-chat-title').textContent = data.conversacion.titulo;
                
                estado.mensajes.forEach(m => {
                    agregarMensaje(m.contenido, m.tipo);
                });
                
                if (estado.mostrandoHistorial) toggleHistorial();
                scrollToBottom();
            }
        } catch (err) {
            console.error('[IA] Error cargando conversación:', err);
        }
    }

    async function renombrarConversacion(id) {
        const nuevoTitulo = prompt('Nuevo título:');
        if (!nuevoTitulo) return;
        try {
            await fetch(`${API_BASE}/conversaciones/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': obtenerCsrfToken() },
                credentials: 'same-origin',
                body: JSON.stringify({ titulo: nuevoTitulo }),
            });
            await cargarConversaciones();
            renderizarHistorial();
        } catch (err) { console.error('[IA] Error renombrando:', err); }
    }

    async function duplicarConversacion(id) {
        try {
            await fetch(`${API_BASE}/conversaciones/${id}/duplicar`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': obtenerCsrfToken() },
                credentials: 'same-origin',
            });
            await cargarConversaciones();
            renderizarHistorial();
        } catch (err) { console.error('[IA] Error duplicando:', err); }
    }

    async function eliminarConversacion(id) {
        if (!confirm('¿Eliminar esta conversación?')) return;
        try {
            await fetch(`${API_BASE}/conversaciones/${id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': obtenerCsrfToken() },
                credentials: 'same-origin',
            });
            if (estado.conversacionActual?.id === id) {
                estado.conversacionActual = null;
                document.getElementById('ia-messages').innerHTML = '';
                document.getElementById('ia-welcome').style.display = 'block';
                document.getElementById('ia-chat-title').textContent = 'Asistente ERP';
            }
            await cargarConversaciones();
            renderizarHistorial();
        } catch (err) { console.error('[IA] Error eliminando:', err); }
    }

    async function guardarMensajeEnBD(tipo, contenido) {
        if (!estado.conversacionActual) {
            // Crear conversación automáticamente
            try {
                const res = await fetch(`${API_BASE}/conversaciones`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': obtenerCsrfToken() },
                    credentials: 'same-origin',
                    body: JSON.stringify({ titulo: contenido.substring(0, 50) }),
                });
                const data = await res.json();
                if (data.ok) estado.conversacionActual = data.conversacion;
                else return;
            } catch (err) { return; }
        }

        try {
            await fetch(`${API_BASE}/conversaciones/${estado.conversacionActual.id}/mensajes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': obtenerCsrfToken() },
                credentials: 'same-origin',
                body: JSON.stringify({ tipo, contenido }),
            });
            // Backup en localStorage
            const backup = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const idx = backup.findIndex(c => c.id === estado.conversacionActual.id);
            if (idx >= 0) {
                backup[idx].ultimo_mensaje = contenido.substring(0, 100);
                backup[idx].total_mensajes = (backup[idx].total_mensajes || 0) + 1;
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(backup));
        } catch (err) {
            console.warn('[IA] Error guardando mensaje en BD, usando localStorage:', err);
            // Fallback localStorage
            const backup = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            backup.push({ id: Date.now(), titulo: contenido.substring(0, 50), ultimo_mensaje: contenido.substring(0, 100), total_mensajes: 1, updated_at: 'ahora' });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(backup));
        }
    }

    // ════════════════════════════════════════════════════════════════
    //  DASHBOARD EJECUTIVO
    // ════════════════════════════════════════════════════════════════

    async function abrirDashboard() {
        if (!estado.abierto) toggleChat();
        document.getElementById('ia-welcome').style.display = 'none';
        mostrarTyping(true);

        try {
            const res = await fetch(`${API_BASE}/dashboard-ejecutivo`, {
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': obtenerCsrfToken() },
                credentials: 'same-origin',
            });
            const data = await res.json();
            mostrarTyping(false);

            if (data.ok) {
                mostrarDashboardEjecutivo(data.data);
            } else {
                agregarMensaje('⚠️ No se pudo cargar el dashboard.', 'bot');
            }
        } catch (err) {
            mostrarTyping(false);
            agregarMensaje('🔴 Error al cargar dashboard: ' + (err.message || 'Error de conexión'), 'bot');
        }
    }

    function mostrarDashboardEjecutivo(d) {
        const dashboardHTML = `
        <div class="ia-dashboard">
            <div class="ia-dash-header">
                <h3>📊 Dashboard Ejecutivo</h3>
                <span class="ia-dash-refresh" onclick="abrirDashboard()">↻ Actualizar</span>
            </div>

            <div class="ia-kpi-grid">
                <div class="ia-kpi-card" style="background:linear-gradient(135deg,#e91e63,#c2185b)">
                    <div class="ia-kpi-icon">💰</div>
                    <div class="ia-kpi-value">$${formatearNumero(d.ventas_hoy)}</div>
                    <div class="ia-kpi-label">Ventas Hoy</div>
                </div>
                <div class="ia-kpi-card" style="background:linear-gradient(135deg,#9c27b0,#7b1fa2)">
                    <div class="ia-kpi-icon">📈</div>
                    <div class="ia-kpi-value">$${formatearNumero(d.ventas_semana)}</div>
                    <div class="ia-kpi-label">Esta Semana</div>
                </div>
                <div class="ia-kpi-card" style="background:linear-gradient(135deg,#2196f3,#1976d2)">
                    <div class="ia-kpi-icon">📊</div>
                    <div class="ia-kpi-value">$${formatearNumero(d.ventas_mes)}</div>
                    <div class="ia-kpi-label">Este Mes</div>
                </div>
                <div class="ia-kpi-card" style="background:linear-gradient(135deg,#4caf50,#388e3c)">
                    <div class="ia-kpi-icon">📅</div>
                    <div class="ia-kpi-value">$${formatearNumero(d.ventas_ano)}</div>
                    <div class="ia-kpi-label">Este Año</div>
                </div>
            </div>

            <div class="ia-kpi-grid ia-kpi-sm">
                <div class="ia-kpi-card-sm">
                    <span class="ia-kpi-sm-label">Ganancia Bruta</span>
                    <span class="ia-kpi-sm-value">$${formatearNumero(d.ganancia_bruta)}</span>
                </div>
                <div class="ia-kpi-card-sm">
                    <span class="ia-kpi-sm-label">Ganancia Neta</span>
                    <span class="ia-kpi-sm-value">$${formatearNumero(d.ganancia_neta)}</span>
                </div>
                <div class="ia-kpi-card-sm">
                    <span class="ia-kpi-sm-label">Ticket Promedio</span>
                    <span class="ia-kpi-sm-value">$${formatearNumero(d.ticket_promedio)}</span>
                </div>
                <div class="ia-kpi-card-sm">
                    <span class="ia-kpi-sm-label">Gastos Mes</span>
                    <span class="ia-kpi-sm-value">$${formatearNumero(d.gastos_mes)}</span>
                </div>
            </div>

            <div class="ia-dash-section">
                <h4>📦 Inventario</h4>
                <div class="ia-dash-badges">
                    <span class="ia-badge-inv ia-badge-total">${d.total_productos} productos</span>
                    ${d.productos_agotados > 0 ? `<span class="ia-badge-inv ia-badge-danger">🔴 ${d.productos_agotados} agotados</span>` : ''}
                    ${d.bajo_stock > 0 ? `<span class="ia-badge-inv ia-badge-warning">🟡 ${d.bajo_stock} stock bajo</span>` : ''}
                </div>
            </div>

            <div class="ia-dash-section">
                <h4>👥 Clientes</h4>
                <div class="ia-dash-badges">
                    <span class="ia-badge-inv ia-badge-total">🆕 ${d.clientes_nuevos} nuevos este mes</span>
                    <span class="ia-badge-inv ia-badge-info">🔄 ${d.clientes_recurrentes} recurrentes</span>
                </div>
            </div>
        </div>`;

        const container = document.getElementById('ia-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'ia-msg bot';
        const avatar = document.createElement('div');
        avatar.className = 'ia-msg-avatar';
        avatar.textContent = '🤖';
        const content = document.createElement('div');
        content.className = 'ia-msg-content';
        content.innerHTML = dashboardHTML;
        const time = document.createElement('div');
        time.className = 'ia-msg-time';
        time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        content.appendChild(time);
        msgDiv.appendChild(avatar);
        msgDiv.appendChild(content);
        container.appendChild(msgDiv);
        scrollToBottom();
    }

    function formatearNumero(n) {
        return Number(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    // ════════════════════════════════════════════════════════════════
    //  ENVIAR MENSAJE Y PROCESAR RESPUESTA
    // ════════════════════════════════════════════════════════════════

    async function enviarMensaje() {
        if (estado.enviando) return;
        const input = document.getElementById('ia-input');
        const texto = input.value.trim();
        if (!texto) return;

        document.getElementById('ia-welcome').style.display = 'none';
        agregarMensaje(texto, 'user');
        input.value = '';
        input.style.height = 'auto';
        mostrarTyping(true);

        // Guardar mensaje del usuario en BD
        await guardarMensajeEnBD('user', texto);

        estado.enviando = true;
        const btn = document.getElementById('ia-send-btn');
        btn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': obtenerCsrfToken() },
                credentials: 'same-origin',
                body: JSON.stringify({ mensaje: texto }),
            });

            const data = await res.json();
            mostrarTyping(false);

            if (data.ok && data.respuesta) {
                procesarRespuesta(data.respuesta);
                // Guardar respuesta de la IA
                await guardarMensajeEnBD('bot', data.respuesta.mensaje || '');
            } else {
                agregarMensaje('⚠️ ' + (data.error || 'No se pudo procesar.'), 'bot');
            }
        } catch (err) {
            mostrarTyping(false);
            agregarMensaje('🔴 Error de conexión: ' + (err.message || 'Error'), 'bot');
        } finally {
            estado.enviando = false;
            btn.disabled = false;
            input.focus();
            // Actualizar historial
            await cargarConversaciones();
        }
    }

    function procesarRespuesta(respuesta) {
        if (respuesta.paso_actual) {
            estado.conversacionActiva = true;
            estado.pasoActual = respuesta.paso_actual;
            estado.totalPasos = respuesta.total_pasos || 7;
            estado.progreso = respuesta.progreso || 0;
            actualizarBarraProgreso();
        } else {
            estado.conversacionActiva = false;
            estado.pasoActual = null;
            estado.progreso = 0;
            ocultarBarraProgreso();
        }

        agregarMensaje(respuesta.mensaje, 'bot', respuesta);
    }

    function agregarMensaje(texto, tipo, datos = null) {
        const container = document.getElementById('ia-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `ia-msg ${tipo}`;

        const avatar = document.createElement('div');
        avatar.className = 'ia-msg-avatar';
        avatar.textContent = tipo === 'bot' ? '🤖' : '👤';

        const content = document.createElement('div');
        content.className = 'ia-msg-content';

        const formatted = texto
            .replace(/\n/g, '<br>')
            .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>');
        content.innerHTML = formatted;

        if (datos && datos.imagenes_preview) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'ia-msg-images';
            datos.imagenes_preview.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.className = 'ia-msg-img';
                imgContainer.appendChild(img);
            });
            content.appendChild(imgContainer);
        }

        const time = document.createElement('div');
        time.className = 'ia-msg-time';
        time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        content.appendChild(time);
        msgDiv.appendChild(avatar);
        msgDiv.appendChild(content);
        container.appendChild(msgDiv);

        if (datos && datos.requiere_confirmacion) {
            agregarBotonesConfirmacion(content, datos);
        }

        estado.mensajes.push({ texto, tipo, fecha: new Date() });
        if (!estado.abierto && tipo === 'bot') {
            estado.noLeidos++;
            actualizarBadge();
        }
        scrollToBottom();
    }

    function agregarBotonesConfirmacion(content, datos) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'ia-confirm-actions';
        const btnSi = document.createElement('button');
        btnSi.className = 'ia-confirm-btn ia-confirm-yes';
        btnSi.innerHTML = '✅ Sí, confirmar';
        btnSi.addEventListener('click', () => { document.getElementById('ia-input').value = 'sí'; enviarMensaje(); });
        const btnNo = document.createElement('button');
        btnNo.className = 'ia-confirm-btn ia-confirm-no';
        btnNo.innerHTML = '❌ No, cancelar';
        btnNo.addEventListener('click', () => { document.getElementById('ia-input').value = 'no'; enviarMensaje(); });
        actionsDiv.appendChild(btnSi);
        actionsDiv.appendChild(btnNo);
        content.appendChild(actionsDiv);
    }

    // ════════════════════════════════════════════════════════════════
    //  SUBIR IMAGEN
    // ════════════════════════════════════════════════════════════════

    async function subirImagen(file) {
        if (!file) return;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) { agregarMensaje('⚠️ Formato no permitido. Usa: JPG, PNG o WEBP.', 'bot'); return; }
        if (file.size > 5 * 1024 * 1024) { agregarMensaje('⚠️ La imagen excede el tamaño máximo de 5MB.', 'bot'); return; }

        mostrarTyping(true);
        const formData = new FormData();
        formData.append('imagen', file);

        try {
            const res = await fetch(`${API_BASE}/upload-imagen`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': obtenerCsrfToken() },
                credentials: 'same-origin',
                body: formData,
            });

            const data = await res.json();
            mostrarTyping(false);

            if (data.ok) {
                const imgMsg = document.createElement('div');
                imgMsg.className = 'ia-msg bot';
                const imgContent = document.createElement('div');
                imgContent.className = 'ia-msg-content';
                imgContent.innerHTML = `✅ Imagen recibida: <strong>${data.nombre}</strong>`;
                const preview = document.createElement('img');
                preview.src = data.url;
                preview.className = 'ia-chat-img-preview';
                imgContent.appendChild(preview);
                const time = document.createElement('div');
                time.className = 'ia-msg-time';
                time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                imgContent.appendChild(time);
                const avatar = document.createElement('div');
                avatar.className = 'ia-msg-avatar';
                avatar.textContent = '🤖';
                imgMsg.appendChild(avatar);
                imgMsg.appendChild(imgContent);
                document.getElementById('ia-messages').appendChild(imgMsg);
                estado.imagenes.push(data.url);
                scrollToBottom();

                if (estado.conversacionActiva && estado.pasoActual === 'imagenes') {
                    setTimeout(() => agregarMensaje(`📸 Imagen guardada (${data.total_imagenes} en total). ¿Deseas agregar otra o continuar?`, 'bot'), 500);
                }
            } else {
                agregarMensaje('⚠️ ' + (data.error || 'Error al subir la imagen.'), 'bot');
            }
        } catch (err) {
            mostrarTyping(false);
            agregarMensaje('🔴 Error al subir la imagen: ' + (err.message || 'Error de conexión'), 'bot');
        }
    }

    function manejarSeleccionArchivo(e) {
        if (e.target.files.length > 0) subirImagen(e.target.files[0]);
        e.target.value = '';
    }

    // ════════════════════════════════════════════════════════════════
    //  UTILIDADES
    // ════════════════════════════════════════════════════════════════

    async function verificarEstadoConversacion() {
        try {
            const res = await fetch(`${API_BASE}/estado`, {
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': obtenerCsrfToken() },
                credentials: 'same-origin',
            });
            const data = await res.json();
            if (data.ok) {
                estado.conversacionActiva = data.conversacion_activa;
                estado.pasoActual = data.paso_actual;
                actualizarBarraProgreso();
            }
        } catch (err) {}
    }

    function actualizarBarraProgreso() {
        const bar = document.getElementById('ia-progress-bar');
        const fill = document.getElementById('ia-progress-fill');
        const text = document.getElementById('ia-progress-text');
        if (estado.conversacionActiva && estado.progreso > 0) {
            bar.style.display = 'flex';
            fill.style.width = estado.progreso + '%';
            text.textContent = estado.progreso + '%';
        } else {
            bar.style.display = 'none';
        }
    }

    function ocultarBarraProgreso() { document.getElementById('ia-progress-bar').style.display = 'none'; }

    function mostrarTyping(visible) {
        document.getElementById('ia-typing').classList.toggle('visible', visible);
        if (visible) scrollToBottom();
    }

    function scrollToBottom() {
        const body = document.getElementById('ia-body');
        setTimeout(() => { body.scrollTop = body.scrollHeight; }, 50);
    }

    function actualizarBadge() {
        const badge = document.getElementById('ia-badge');
        if (estado.noLeidos > 0) { badge.textContent = estado.noLeidos; badge.classList.add('visible'); }
        else { badge.classList.remove('visible'); }
    }

    async function limpiarChat() {
        document.getElementById('ia-messages').innerHTML = '';
        document.getElementById('ia-welcome').style.display = 'block';
        estado.mensajes = [];
        estado.conversacionActiva = false;
        estado.pasoActual = null;
        estado.progreso = 0;
        estado.imagenes = [];
        ocultarBarraProgreso();
        try {
            await fetch(`${API_BASE}/reset`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': obtenerCsrfToken() },
                credentials: 'same-origin',
            });
        } catch (err) {}
    }

    function obtenerCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) return meta.getAttribute('content');
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        if (match) return decodeURIComponent(match[1]);
        return '';
    }

    // Exponer funciones globalmente para onclick
    window.seleccionarConversacion = seleccionarConversacion;
    window.renombrarConversacion = renombrarConversacion;
    window.duplicarConversacion = duplicarConversacion;
    window.eliminarConversacion = eliminarConversacion;
    window.abrirDashboard = abrirDashboard;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();