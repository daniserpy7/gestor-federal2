// ===== DASHBOARD ADMIN =====

function renderAdminDashboard(container) {
    container.innerHTML = `
        <div class="user-info">
            <div class="user-details">
                <h2>Panel de Administrador</h2>
                <p>${currentUser.name} - ${currentUser.email}</p>
            </div>
            <button class="logout-btn" onclick="logout()">Cerrar Sesión</button>
        </div>

        <div class="tabs">
            <button class="tab active" onclick="switchTab(event, 'users')">👥 Usuarios</button>
            <button class="tab" onclick="switchTab(event, 'codes')">🔑 Códigos</button>
            <button class="tab" onclick="switchTab(event, 'timers')">⏱️ Cronómetros</button>
            <button class="tab" onclick="switchTab(event, 'actas')">⚖️ Actas</button>
            <button class="tab" onclick="switchTab(event, 'comunicados')">📢 Comunicados</button>
        </div>

        <div id="usersTab" class="tab-content active">
            <div class="card">
                <h3>➕ Crear Nuevo Usuario</h3>
                <div class="form-group">
                    <label for="newUserName">Nombre Completo</label>
                    <input type="text" id="newUserName" placeholder="Juan Pérez">
                </div>
                <div class="form-group">
                    <label for="newUsername">Nombre de Usuario</label>
                    <input type="text" id="newUsername" placeholder="jperez">
                </div>
                <div class="form-group">
                    <label for="newUserEmail">Correo Electrónico</label>
                    <input type="email" id="newUserEmail" placeholder="juan@empresa.com">
                </div>
                <div class="form-group">
                    <label for="newUserPassword">Contraseña</label>
                    <input type="password" id="newUserPassword" placeholder="Mínimo 6 caracteres">
                </div>
                <div class="form-group">
                    <label for="newUserRole">Rol</label>
                    <select id="newUserRole">
                        <option value="basico">Básico</option>
                        <option value="medio">Medio</option>
                        <option value="alto">Alto</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button onclick="createUser()">Crear Usuario</button>
            </div>

            <div class="card" style="margin-top: 30px;">
                <h3>📋 Lista de Usuarios</h3>
                <div id="usersList"></div>
            </div>
        </div>

        <div id="codesTab" class="tab-content">
            <div class="grid-2">
                <div class="card">
                    <h3>🔑 Códigos para Alto</h3>
                    <button onclick="generateCodeForAlto()" class="btn-small">Generar Código</button>
                    <div id="adminCodeDisplay"></div>
                    <div id="adminCodesList" style="margin-top: 20px;"></div>
                </div>

                <div class="card">
                    <h3>🔑 Códigos para Básico/Medio</h3>
                    <button onclick="generateCodeForWorkerAdmin()" class="btn-small">Generar Código</button>
                    <div id="adminWorkerCodeDisplay"></div>
                    <div id="adminWorkerCodesList" style="margin-top: 20px;"></div>
                </div>
            </div>
        </div>

        <div id="timersTab" class="tab-content">
            <div class="card">
                <h3>⏱️ Cronómetros Activos</h3>
                <div id="activeTimersList"></div>
            </div>
        </div>

        <div id="actasTab" class="tab-content">
            <div class="card">
                <h3>⚖️ Crear Nueva Acta</h3>
                <div class="form-group">
                    <label for="actaUser">Usuario</label>
                    <select id="actaUser"></select>
                </div>
                <div class="form-group">
                    <label for="actaMotivo">Motivo</label>
                    <textarea id="actaMotivo" placeholder="Motivo de la amonestación..."></textarea>
                </div>
                <button onclick="createActaAdmin()">Crear Acta</button>
            </div>

            <div class="card" style="margin-top: 30px;">
                <h3>📋 Actas Pendientes de Autorización</h3>
                <div id="actasPendingList"></div>
            </div>

            <div class="card" style="margin-top: 30px;">
                <h3>📋 Todas las Actas</h3>
                <div id="allActasList"></div>
            </div>
        </div>

        <div id="comunicadosTab" class="tab-content">
            <div class="card">
                <h3>📢 Crear Comunicado</h3>
                <div class="form-group">
                    <label for="comunicadoTipo">Tipo</label>
                    <select id="comunicadoTipo">
                        <option value="normal">Normal</option>
                        <option value="urgente">Urgente</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="comunicadoDestinatario">Destinatario</label>
                    <select id="comunicadoDestinatario">
                        <option value="todos">Todos</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="comunicadoAsunto">Asunto</label>
                    <input type="text" id="comunicadoAsunto" placeholder="Asunto">
                </div>
                <div class="form-group">
                    <label for="comunicadoContenido">Contenido</label>
                    <textarea id="comunicadoContenido" placeholder="Contenido del comunicado..."></textarea>
                </div>
                <button onclick="createComunicado()">Enviar Comunicado</button>
            </div>

            <div class="card" style="margin-top: 30px;">
                <h3>📋 Comunicados Enviados</h3>
                <div id="comunicadosList"></div>
            </div>
        </div>
    `;

    loadAllUsers();
    loadAdminCodes();
    loadAdminWorkerCodes();
    loadActiveTimers();
    loadUsersForActa();
    loadUsersForComunicado();
    loadActasPending();
    loadAllActas();
    loadComunicados();
}

function switchTab(event, tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    if (tabName === 'timers') {
        loadActiveTimers();
    }
}

// Gestión de usuarios
function createUser() {
    const name = document.getElementById('newUserName').value.trim();
    const username = document.getElementById('newUsername').value.trim();
    const email = document.getElementById('newUserEmail').value.trim().toLowerCase();
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;

    if (!name || !username || !email || !password) {
        showError('Completa todos los campos');
        return;
    }

    if (password.length < 6) {
        showError('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    const existingUser = storage.get(`user:${email}`);
    if (existingUser) {
        showError('Este correo ya está registrado');
        return;
    }

    const user = {
        name: name,
        username: username,
        email: email,
        password: password,
        role: role,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.email
    };

    storage.set(`user:${email}`, JSON.stringify(user));
    
    let allUsers = [];
    const result = storage.get('all:users');
    if (result) allUsers = JSON.parse(result.value);
    allUsers.push(email);
    storage.set('all:users', JSON.stringify(allUsers));

    showSuccess(`Usuario ${name} creado exitosamente`);
    
    document.getElementById('newUserName').value = '';
    document.getElementById('newUsername').value = '';
    document.getElementById('newUserEmail').value = '';
    document.getElementById('newUserPassword').value = '';
    
    loadAllUsers();
}

function loadAllUsers() {
    const result = storage.get('all:users');
    const container = document.getElementById('usersList');
    if (!container) return;
    
    if (!result) {
        container.innerHTML = '<p style="color: #999;">No hay usuarios</p>';
        return;
    }

    const userEmails = JSON.parse(result.value);
    let html = '<table class="data-table"><thead><tr><th>Nombre</th><th>Usuario</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead><tbody>';

    for (const email of userEmails) {
        const userResult = storage.get(`user:${email}`);
        if (userResult) {
            const user = JSON.parse(userResult.value);
            const roleNames = {admin: 'Admin', alto: 'Alto', medio: 'Medio', basico: 'Básico'};
            const roleClass = `role-${user.role}`;
            
            html += `<tr>
                <td><strong>${user.name}</strong></td>
                <td>${user.username || '-'}</td>
                <td>${user.email}</td>
                <td><span class="role-badge ${roleClass}" style="font-size: 12px; padding: 4px 12px;">${roleNames[user.role]}</span></td>
                <td><button class="btn-danger btn-small" onclick="deleteUser('${user.email}')">Eliminar</button></td>
            </tr>`;
        }
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

function deleteUser(email) {
    if (!confirm('¿Eliminar este usuario?')) return;

    storage.delete(`user:${email}`);
    
    let allUsers = [];
    const result = storage.get('all:users');
    if (result) allUsers = JSON.parse(result.value);
    
    allUsers = allUsers.filter(e => e !== email);
    storage.set('all:users', JSON.stringify(allUsers));

    showSuccess('Usuario eliminado');
    loadAllUsers();
}

// Códigos
function generateCodeForAlto() {
    const code = generateCode();
    const codeData = {
        code: code,
        forRole: 'alto',
        generatedBy: currentUser.email,
        generatedAt: new Date().toISOString(),
        used: false,
        usedBy: null
    };

    storage.set(`code:${code}`, JSON.stringify(codeData));
    
    let allCodes = [];
    const result = storage.get('admin:codes');
    if (result) allCodes = JSON.parse(result.value);
    allCodes.push(code);
    storage.set('admin:codes', JSON.stringify(allCodes));

    document.getElementById('adminCodeDisplay').innerHTML = `
        <div class="code-display" style="font-size: 24px; margin: 15px 0;">${code}</div>
        <p style="text-align: center; color: #666; font-size: 14px;">Comparte este código con un usuario Alto</p>
    `;
    
    loadAdminCodes();
    showSuccess('Código generado');
}

function loadAdminCodes() {
    const result = storage.get('admin:codes');
    const container = document.getElementById('adminCodesList');
    if (!container) return;
    
    if (!result) {
        container.innerHTML = '<p style="color: #999; font-size: 14px;">No hay códigos</p>';
        return;
    }

    const codes = JSON.parse(result.value);
    let html = '<div style="font-size: 14px;">';

    for (const code of codes.slice(-5)) {
        const codeResult = storage.get(`code:${code}`);
        if (codeResult) {
            const codeData = JSON.parse(codeResult.value);
            const status = codeData.used ? '✓ Usado' : '⏳ Pendiente';
            html += `<div style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${code}</strong> - ${status}</div>`;
        }
    }

    html += '</div>';
    container.innerHTML = html;
}

function generateCodeForWorkerAdmin() {
    const code = generateCode();
    const codeData = {
        code: code,
        forRole: 'worker',
        generatedBy: currentUser.email,
        generatedAt: new Date().toISOString(),
        used: false,
        usedBy: null
    };

    storage.set(`code:${code}`, JSON.stringify(codeData));
    
    let allCodes = [];
    const result = storage.get('admin:worker:codes');
    if (result) allCodes = JSON.parse(result.value);
    allCodes.push(code);
    storage.set('admin:worker:codes', JSON.stringify(allCodes));

    document.getElementById('adminWorkerCodeDisplay').innerHTML = `
        <div class="code-display" style="font-size: 24px; margin: 15px 0;">${code}</div>
        <p style="text-align: center; color: #666; font-size: 14px;">Comparte con Básico/Medio</p>
    `;
    
    loadAdminWorkerCodes();
    showSuccess('Código generado');
}

function loadAdminWorkerCodes() {
    const result = storage.get('admin:worker:codes');
    const container = document.getElementById('adminWorkerCodesList');
    if (!container) return;
    
    if (!result) {
        container.innerHTML = '<p style="color: #999; font-size: 14px;">No hay códigos</p>';
        return;
    }

    const codes = JSON.parse(result.value);
    let html = '<div style="font-size: 14px;">';

    for (const code of codes.slice(-5)) {
        const codeResult = storage.get(`code:${code}`);
        if (codeResult) {
            const codeData = JSON.parse(codeResult.value);
            const status = codeData.used ? '✓ Usado' : '⏳ Pendiente';
            html += `<div style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${code}</strong> - ${status}</div>`;
        }
    }

    html += '</div>';
    container.innerHTML = html;
}

// Cronómetros activos
function loadActiveTimers() {
    const container = document.getElementById('activeTimersList');
    if (!container) return;
    
    const activeTimers = getAllActiveTimers();
    
    if (activeTimers.length === 0) {
        container.innerHTML = '<p style="color: #999;">No hay cronómetros activos</p>';
        return;
    }
    
    let html = '';
    for (const timer of activeTimers) {
        html += `
            <div class="activity-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div><strong>${timer.name}</strong> (${timer.role})</div>
                        <div style="font-size: 24px; font-weight: bold; color: #1e3c72; margin: 10px 0;">${formatDuration(timer.seconds)}</div>
                    </div>
                    <div style="display: flex; gap: 10px; flex-direction: column;">
                        <button class="btn-danger btn-small" onclick="adminStopTimer('${timer.email}')">Detener</button>
                        <button class="btn-warning btn-small" onclick="adminAdjustTimer('${timer.email}')">Restar Tiempo</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Actualizar cada segundo
    if (timerUpdateInterval) clearInterval(timerUpdateInterval);
    timerUpdateInterval = setInterval(() => {
        if (document.getElementById('timersTab').classList.contains('active')) {
            loadActiveTimers();
        }
    }, 1000);
}

function adminStopTimer(userEmail) {
    const motivo = prompt('Ingresa el motivo para detener el cronómetro:');
    if (!motivo || motivo.trim() === '') {
        showError('Debes ingresar un motivo');
        return;
    }
    
    stopTimerForUser(userEmail, motivo);
    showSuccess('Cronómetro detenido');
    loadActiveTimers();
}

function adminAdjustTimer(userEmail) {
    const minutes = prompt('¿Cuántos MINUTOS deseas restar?');
    if (!minutes || isNaN(minutes) || minutes <= 0) {
        showError('Ingresa un número válido de minutos');
        return;
    }
    
    const motivo = prompt('Ingresa el motivo del ajuste:');
    if (!motivo || motivo.trim() === '') {
        showError('Debes ingresar un motivo');
        return;
    }
    
    const seconds = parseInt(minutes) * 60;
    const success = adjustTimerForUser(userEmail, seconds, motivo);
    
    if (success) {
        showSuccess(`${minutes} minutos restados exitosamente`);
        loadActiveTimers();
    } else {
        showError('Error al ajustar el tiempo');
    }
}// Actas
function loadUsersForActa() {
    const result = storage.get('all:users');
    const select = document.getElementById('actaUser');
    if (!select) return;
    
    if (!result) {
        select.innerHTML = '<option value="">No hay usuarios</option>';
        return;
    }

    const userEmails = JSON.parse(result.value);
    let options = '<option value="">Seleccione un usuario</option>';
    
    for (const email of userEmails) {
        const userResult = storage.get(`user:${email}`);
        if (userResult) {
            const user = JSON.parse(userResult.value);
            if (user.email !== currentUser.email) {
                options += `<option value="${user.email}">${user.name} (${user.role})</option>`;
            }
        }
    }
    
    select.innerHTML = options;
}

function createActaAdmin() {
    const userEmail = document.getElementById('actaUser').value;
    const motivo = document.getElementById('actaMotivo').value.trim();
    
    if (!userEmail) {
        showError('Selecciona un usuario');
        return;
    }
    
    if (!motivo) {
        showError('Escribe el motivo');
        return;
    }
    
    const acta = {
        id: 'acta_' + Date.now(),
        targetUser: userEmail,
        createdBy: currentUser.email,
        createdByName: currentUser.name,
        motivo: motivo,
        fecha: new Date().toISOString(),
        autorizada: true,
        autorizadaPor: currentUser.email,
        autorizadaPorNombre: currentUser.name
    };
    
    let allActas = [];
    const result = storage.get('all:actas');
    if (result) allActas = JSON.parse(result.value);
    allActas.push(acta);
    storage.set('all:actas', JSON.stringify(allActas));
    
    showSuccess('Acta creada y autorizada');
    document.getElementById('actaMotivo').value = '';
    document.getElementById('actaUser').value = '';
    loadAllActas();
}

function loadActasPending() {
    const result = storage.get('all:actas');
    const container = document.getElementById('actasPendingList');
    if (!container) return;
    
    if (!result) {
        container.innerHTML = '<p style="color: #999;">No hay actas pendientes</p>';
        return;
    }
    
    const actas = JSON.parse(result.value).filter(a => !a.autorizada);
    
    if (actas.length === 0) {
        container.innerHTML = '<p style="color: #999;">No hay actas pendientes</p>';
        return;
    }
    
    let html = '';
    for (const acta of actas) {
        const userResult = storage.get(`user:${acta.targetUser}`);
        const userName = userResult ? JSON.parse(userResult.value).name : acta.targetUser;
        
        html += `
            <div class="activity-item">
                <div><strong>Para:</strong> ${userName}</div>
                <div><strong>Creada por:</strong> ${acta.createdByName}</div>
                <div><strong>Motivo:</strong> ${acta.motivo}</div>
                <div><strong>Fecha:</strong> ${new Date(acta.fecha).toLocaleString('es-ES')}</div>
                <div style="margin-top: 10px;">
                    <button class="btn-success btn-small" onclick="autorizarActa('${acta.id}')">Autorizar</button>
                    <button class="btn-danger btn-small" onclick="rechazarActa('${acta.id}')">Rechazar</button>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function autorizarActa(actaId) {
    const result = storage.get('all:actas');
    if (!result) return;
    
    let actas = JSON.parse(result.value);
    const acta = actas.find(a => a.id === actaId);
    
    if (acta) {
        acta.autorizada = true;
        acta.autorizadaPor = currentUser.email;
        acta.autorizadaPorNombre = currentUser.name;
        acta.fechaAutorizacion = new Date().toISOString();
        
        storage.set('all:actas', JSON.stringify(actas));
        showSuccess('Acta autorizada');
        loadActasPending();
        loadAllActas();
    }
}

function rechazarActa(actaId) {
    if (!confirm('¿Rechazar esta acta?')) return;
    
    const result = storage.get('all:actas');
    if (!result) return;
    
    let actas = JSON.parse(result.value);
    actas = actas.filter(a => a.id !== actaId);
    
    storage.set('all:actas', JSON.stringify(actas));
    showSuccess('Acta rechazada');
    loadActasPending();
    loadAllActas();
}

function loadAllActas() {
    const result = storage.get('all:actas');
    const container = document.getElementById('allActasList');
    if (!container) return;
    
    if (!result) {
        container.innerHTML = '<p style="color: #999;">No hay actas</p>';
        return;
    }
    
    const actas = JSON.parse(result.value).filter(a => a.autorizada);
    
    if (actas.length === 0) {
        container.innerHTML = '<p style="color: #999;">No hay actas autorizadas</p>';
        return;
    }
    
    actas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    let html = '';
    for (const acta of actas) {
        const userResult = storage.get(`user:${acta.targetUser}`);
        const userName = userResult ? JSON.parse(userResult.value).name : acta.targetUser;
        
        html += `
            <div class="activity-item">
                <div><strong>Para:</strong> ${userName}</div>
                <div><strong>Creada por:</strong> ${acta.createdByName}</div>
                <div><strong>Autorizada por:</strong> ${acta.autorizadaPorNombre}</div>
                <div><strong>Motivo:</strong> ${acta.motivo}</div>
                <div class="activity-date">${new Date(acta.fecha).toLocaleString('es-ES')}</div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Comunicados
function loadUsersForComunicado() {
    const result = storage.get('all:users');
    const select = document.getElementById('comunicadoDestinatario');
    if (!select) return;
    
    let options = '<option value="todos">Todos los usuarios</option>';
    
    if (result) {
        const userEmails = JSON.parse(result.value);
        
        for (const email of userEmails) {
            const userResult = storage.get(`user:${email}`);
            if (userResult) {
                const user = JSON.parse(userResult.value);
                options += `<option value="${user.email}">${user.name} (${user.role})</option>`;
            }
        }
    }
    
    select.innerHTML = options;
}

function createComunicado() {
    const tipo = document.getElementById('comunicadoTipo').value;
    const destinatario = document.getElementById('comunicadoDestinatario').value;
    const asunto = document.getElementById('comunicadoAsunto').value.trim();
    const contenido = document.getElementById('comunicadoContenido').value.trim();
    
    if (!asunto || !contenido) {
        showError('Completa asunto y contenido');
        return;
    }
    
    const comunicado = {
        id: 'com_' + Date.now(),
        tipo: tipo,
        destinatario: destinatario,
        asunto: asunto,
        contenido: contenido,
        createdBy: currentUser.email,
        createdByName: currentUser.name,
        fecha: new Date().toISOString()
    };
    
    let allComunicados = [];
    const result = storage.get('all:comunicados');
    if (result) allComunicados = JSON.parse(result.value);
    allComunicados.push(comunicado);
    storage.set('all:comunicados', JSON.stringify(allComunicados));
    
    showSuccess('Comunicado enviado');
    document.getElementById('comunicadoAsunto').value = '';
    document.getElementById('comunicadoContenido').value = '';
    loadComunicados();
}

function loadComunicados() {
    const result = storage.get('all:comunicados');
    const container = document.getElementById('comunicadosList');
    if (!container) return;
    
    if (!result) {
        container.innerHTML = '<p style="color: #999;">No hay comunicados</p>';
        return;
    }
    
    const comunicados = JSON.parse(result.value);
    comunicados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    let html = '';
    for (const com of comunicados) {
        const tipoClass = com.tipo === 'urgente' ? 'badge-unused' : '';
        const destinatarioText = com.destinatario === 'todos' ? 'Todos' : com.destinatario;
        
        html += `
            <div class="activity-item">
                <div><strong class="${tipoClass}">${com.tipo.toUpperCase()}</strong> - ${com.asunto}</div>
                <div><strong>Para:</strong> ${destinatarioText}</div>
                <div>${com.contenido}</div>
                <div class="activity-date">${new Date(com.fecha).toLocaleString('es-ES')}</div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// ===== DASHBOARD ALTO =====

function renderAltoDashboard(container) {
    // Verificar si ya tiene sesión activa
    const sessionResult = storage.get(`session:${currentUser.email}`);
    const hasSession = sessionResult && JSON.parse(sessionResult.value).active;
    
    if (!hasSession) {
        // Mostrar pantalla de validación de código
        container.innerHTML = `
            <div class="user-info">
                <div class="user-details">
                    <h2>Panel de Usuario Alto</h2>
                    <p>${currentUser.name} - ${currentUser.email}</p>
                </div>
                <button class="logout-btn" onclick="logout()">Cerrar Sesión</button>
            </div>

            <div class="code-input-section">
                <h3>🔐 Código de Autorización</h3>
                <div class="code-status status-pending">
                    ⚠️ Necesitas un código de Admin para iniciar
                </div>
                <div class="form-group">
                    <label for="accessCodeAlto">Código:</label>
                    <input type="text" id="accessCodeAlto" placeholder="ABC123" style="text-transform: uppercase;">
                </div>
                <button onclick="validateCodeAlto()">Validar e Iniciar</button>
            </div>
        `;
        return;
    }
    
    // Mostrar dashboard completo
    container.innerHTML = `
        <div class="user-info">
            <div class="user-details">
                <h2>Panel de Usuario Alto</h2>
                <p>${currentUser.name} - ${currentUser.email}</p>
            </div>
            <button class="logout-btn" onclick="logout()">Cerrar Sesión</button>
        </div>

        <div class="tabs">
            <button class="tab active" onclick="switchTab(event, 'timer')">⏱️ Mi Tiempo</button>
            <button class="tab" onclick="switchTab(event, 'codes')">🔑 Códigos</button>
            <button class="tab" onclick="switchTab(event, 'actas')">⚖️ Actas</button>
            <button class="tab" onclick="switchTab(event, 'alertas')">🔔 Alertas</button>
            <button class="tab" onclick="switchTab(event, 'comunicados')">📢 Comunicados</button>
