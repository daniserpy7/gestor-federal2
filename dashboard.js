// Dashboard Admin
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
            <button class="tab active" onclick="switchTab(event, 'users')">👥 Gestión de Usuarios</button>
            <button class="tab" onclick="switchTab(event, 'codes')">🔑 Códigos para Alto</button>
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
            <div class="code-section">
                <h3>🔑 Generar Código para Usuario Alto</h3>
                <button onclick="generateCodeForAlto()" class="btn-small">
                    Generar Nuevo Código
                </button>
                <div id="adminCodeDisplay"></div>
            </div>

            <div class="card">
                <h3>📋 Códigos Generados</h3>
                <div id="adminCodesList"></div>
            </div>
        </div>
    `;

    loadAllUsers();
    loadAdminCodes();
}

function switchTab(event, tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
}

function createUser() {
    const name = document.getElementById('newUserName').value.trim();
    const username = document.getElementById('newUsername').value.trim();
    const email = document.getElementById('newUserEmail').value.trim().toLowerCase();
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;

    if (!name || !username || !email || !password) {
        showError('Por favor completa todos los campos');
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
    if (!result) {
        document.getElementById('usersList').innerHTML = '<p style="color: #999;">No hay usuarios creados</p>';
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
                <td>
                    <button class="btn-danger btn-small" onclick="deleteUser('${user.email}')">Eliminar</button>
                </td>
            </tr>`;
        }
    }

    html += '</tbody></table>';
    document.getElementById('usersList').innerHTML = html;
}

function deleteUser(email) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    storage.delete(`user:${email}`);
    
    let allUsers = [];
    const result = storage.get('all:users');
    if (result) allUsers = JSON.parse(result.value);
    
    allUsers = allUsers.filter(e => e !== email);
    storage.set('all:users', JSON.stringify(allUsers));

    showSuccess('Usuario eliminado exitosamente');
    loadAllUsers();
}

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
        <div class="code-display">${code}</div>
        <p style="text-align: center; color: #666;">Código generado exitosamente. Compártelo con un usuario Alto.</p>
    `;
    
    loadAdminCodes();
    showSuccess('Código generado exitosamente');
}

function loadAdminCodes() {
    const result = storage.get('admin:codes');
    if (!result) {
        document.getElementById('adminCodesList').innerHTML = '<p style="color: #999;">No hay códigos generados</p>';
        return;
    }

    const codes = JSON.parse(result.value);
    let html = '<table class="data-table"><thead><tr><th>Código</th><th>Generado</th><th>Estado</th><th>Usado por</th></tr></thead><tbody>';

    for (const code of codes) {
        const codeResult = storage.get(`code:${code}`);
        if (codeResult) {
            const codeData = JSON.parse(codeResult.value);
            const date = new Date(codeData.generatedAt).toLocaleString('es-ES');
            const status = codeData.used ? 
                `<span class="badge-used">✓ Usado</span>` : 
                `<span class="badge-unused">⏳ Pendiente</span>`;
            const usedBy = codeData.usedBy || '-';
            
            html += `<tr>
                <td><strong>${code}</strong></td>
                <td>${date}</td>
                <td>${status}</td>
                <td>${usedBy}</td>
            </tr>`;
        }
    }

    html += '</tbody></table>';
    document.getElementById('adminCodesList').innerHTML = html;
}

// Dashboard Alto
function renderAltoDashboard(container) {
    container.innerHTML = `
        <div class="user-info">
            <div class="user-details">
                <h2>Panel de Usuario Alto</h2>
                <p>${currentUser.name} (@${currentUser.username || 'sin usuario'}) - ${currentUser.email}</p>
            </div>
            <button class="logout-btn" onclick="logout()">Cerrar Sesión</button>
        </div>

        <div class="grid-2">
            <div class="code-section">
                <h3>🔑 Generar Código para Medio/Básico</h3>
                <button onclick="generateCodeForWorker()" style="width: 100%; padding: 12px;">
                    Generar Nuevo Código
                </button>
                <div id="altoCodeDisplay"></div>
            </div>

            <div class="card">
                <h3>📊 Estadísticas</h3>
                <div class="stat-number" id="altoStats">0</div>
                <p style="color: #666;">Códigos generados</p>
            </div>
        </div>

        <div class="timer-section">
            <h3>⏱️ Tu Cronómetro</h3>
            <input type="text" id="taskDescription" placeholder="¿En qué estás trabajando?" style="text-align: center; margin-bottom: 15px;">
            <div class="timer" id="timer">00:00:00</div>
            <div class="timer-controls">
                <button class="btn-success" id="startBtn" onclick="startTimer()">▶ Iniciar</button>
                <button class="btn-warning hidden" id="pauseBtn" onclick="pauseTimer()">⏸ Pausar</button>
                <button class="btn-danger hidden" id="stopBtn" onclick="stopTimer()">⏹ Detener</button>
            </div>
        </div>

        <div class="activity-section">
            <h3>📋 Tu Historial de Actividades</h3>
            <div id="activityList"></div>
        </div>

        <div class="card" style="margin-top: 30px;">
            <h3>📋 Códigos Generados por Ti</h3>
            <div id="altoCodesList"></div>
        </div>
    `;

    loadAltoData();
}

function generateCodeForWorker() {
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
    
    let userCodes = [];
    const result = storage.get(`alto:codes:${currentUser.email}`);
    if (result) userCodes = JSON.parse(result.value);
    
    userCodes.push(code);
    storage.set(`alto:codes:${currentUser.email}`, JSON.stringify(userCodes));

    document.getElementById('altoCodeDisplay').innerHTML = `
        <div class="code-display">${code}</div>
        <p style="text-align: center; color: #666;">Comparte este código con usuarios Medio o Básico</p>
    `;
    
    loadAltoData();
    showSuccess('Código generado exitosamente');
}

function loadAltoData() {
    const result = storage.get(`alto:codes:${currentUser.email}`);
    let codes = [];
    if (result) codes = JSON.parse(result.value);

    document.getElementById('altoStats').textContent = codes.length;

    if (codes.length === 0) {
        document.getElementById('altoCodesList').innerHTML = '<p style="color: #999;">No has generado códigos aún</p>';
    } else {
        let html = '<table class="data-table"><thead><tr><th>Código</th><th>Generado</th><th>Estado</th></tr></thead><tbody>';
        
        for (const code of codes) {
            const codeResult = storage.get(`code:${code}`);
            if (codeResult) {
                const codeData = JSON.parse(codeResult.value);
                const date = new Date(codeData.generatedAt).toLocaleString('es-ES');
                const status = codeData.used ? 
                    `<span class="badge-used">✓ Usado</span>` : 
                    `<span class="badge-unused">⏳ Pendiente</span>`;
                
                html += `<tr>
                    <td><strong>${code}</strong></td>
                    <td>${date}</td>
                    <td>${status}</td>
                </tr>`;
            }
        }
        
        html += '</tbody></table>';
        document.getElementById('altoCodesList').innerHTML = html;
    }

    loadActivities();
}

// Dashboard Básico/Medio
function renderBasicMedioDashboard(container) {
    const roleName = currentUser.role === 'medio' ? 'Medio' : 'Básico';
    
    container.innerHTML = `
        <div class="user-info">
            <div class="user-details">
                <h2>Panel de Usuario ${roleName}</h2>
                <p>${currentUser.name} (@${currentUser.username || 'sin usuario'}) - ${currentUser.email}</p>
            </div>
            <button class="logout-btn" onclick="logout()">Cerrar Sesión</button>
        </div>

        <div id="codeInputSection" class="code-input-section">
            <h3>🔐 Solicitar Código de Acceso</h3>
            <div class="code-status status-pending">
                ⚠️ Necesitas un código de un usuario Alto para iniciar tu jornada
            </div>
            <div class="form-group">
                <label for="accessCode">Ingresa el código proporcionado por tu supervisor Alto:</label>
                <input type="text" id="accessCode" placeholder="Ejemplo: ABC123" style="text-transform: uppercase;">
            </div>
            <button onclick="validateCode()">Validar Código e Iniciar Jornada</button>
        </div>

        <div id="workerTimerSection" class="hidden">
            <div class="code-status status-active" style="margin-bottom: 30px;">
                ✅ Jornada activa - Puedes registrar tu tiempo
            </div>

            <div class="timer-section">
                <h3>⏱️ Registra tu Tiempo</h3>
                <input type="text" id="taskDescription" placeholder="¿En qué estás trabajando?" style="text-align: center; margin-bottom: 15px;">
                <div class="timer" id="timer">00:00:00</div>
                <div class="timer-controls">
                    <button class="btn-success" id="startBtn" onclick="startTimer()">▶ Iniciar</button>
                    <button class="btn-warning hidden" id="pauseBtn" onclick="pauseTimer()">⏸ Pausar</button>
                    <button class="btn-danger hidden" id="stopBtn" onclick="stopTimer()">⏹ Detener</button>
                </div>
            </div>

            <div class="activity-section">
                <h3>📋 Tu Historial de Actividades</h3>
                <div id="activityList"></div>
            </div>
        </div>
    `;

    checkWorkSession();
}

function checkWorkSession() {
    const result = storage.get(`session:${currentUser.email}`);
    if (result) {
        const session = JSON.parse(result.value);
        if (session.active) {
            workSessionActive = true;
            document.getElementById('codeInputSection').classList.add('hidden');
            document.getElementById('workerTimerSection').classList.remove('hidden');
            loadActivities();
            return;
        }
    }
}

function validateCode() {
    const code = document.getElementById('accessCode').value.trim().toUpperCase();
    
    if (!code) {
        showError('Por favor ingresa un código');
        return;
    }

    const result = storage.get(`code:${code}`);
    if (!result) {
        showError('Código inválido o no existe');
        return;
    }

    const codeData = JSON.parse(result.value);

    if (codeData.used) {
        showError('Este código ya ha sido utilizado');
        return;
    }

    if (codeData.forRole !== 'worker') {
        showError('Este código no es válido para tu rol');
        return;
    }

    codeData.used = true;
    codeData.usedBy = currentUser.email;
    codeData.usedAt = new Date().toISOString();
    storage.set(`code:${code}`, JSON.stringify(codeData));

    const session = {
        active: true,
        code: code,
        startedAt: new Date().toISOString(),
        startedBy: codeData.generatedBy
    };
    storage.set(`session:${currentUser.email}`, JSON.stringify(session));

    workSessionActive = true;
    showSuccess('¡Código validado! Tu jornada ha iniciado');

    setTimeout(() => {
        document.getElementById('codeInputSection').classList.add('hidden');
        document.getElementById('workerTimerSection').classList.remove('hidden');
        loadActivities();
    }, 1500);
}

// Timer functions
function startTimer() {
    if (!currentUser) {
        showError('Debes iniciar sesión primero');
        return;
    }

    if (!workSessionActive && (currentUser.role === 'medio' || currentUser.role === 'basico')) {
        showError('Necesitas validar un código antes de iniciar el cronómetro');
        return;
    }

    isRunning = true;
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    if (startBtn) startBtn.classList.add('hidden');
    if (pauseBtn) pauseBtn.classList.remove('hidden');
    if (stopBtn) stopBtn.classList.remove('hidden');

    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    if (!currentUser) return;
    
    isRunning = false;
    clearInterval(timerInterval);
    
    const pauseBtn = document.getElementById('pauseBtn');
    const startBtn = document.getElementById('startBtn');
    
    if (pauseBtn) pauseBtn.classList.add('hidden');
    if (startBtn) startBtn.classList.remove('hidden');
}

function stopTimer() {
    if (!currentUser) return;
    
    isRunning = false;
    clearInterval(timerInterval);

    if (seconds > 0) {
        const taskInput = document.getElementById('taskDescription');
        const task = taskInput ? taskInput.value.trim() : 'Actividad sin descripción';
        
        const activity = {
            task: task || 'Actividad sin descripción',
            duration: seconds,
            date: new Date().toISOString(),
            role: currentUser.role,
            userName: currentUser.name,
            userEmail: currentUser.email
        };

        let activities = [];
        const result = storage.get(`activities:${currentUser.email}`);
        if (result) {
            activities = JSON.parse(result.value);
        }
        
        activities.push(activity);
        storage.set(`activities:${currentUser.email}`, JSON.stringify(activities));

        showSuccess('Actividad guardada exitosamente');
        loadActivities();
    }

    seconds = 0;
    updateTimerDisplay();
    
    const taskInput = document.getElementById('taskDescription');
    const stopBtn = document.getElementById('stopBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const startBtn = document.getElementById('startBtn');
    
    if (taskInput) taskInput.value = '';
    if (stopBtn) stopBtn.classList.add('hidden');
    if (pauseBtn) pauseBtn.classList.add('hidden');
    if (startBtn) startBtn.classList.remove('hidden');
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    timerElement.textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function loadActivities() {
    if (!currentUser) return;
    
    const result = storage.get(`activities:${currentUser.email}`);
    let activities = [];
    if (result) {
        activities = JSON.parse(result.value);
    }

    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay actividades registradas</p>';
        return;
    }

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-header">
                <div>
                    <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${activity.task}</div>
                    <div class="activity-date">${new Date(activity.date).toLocaleString('es-ES')}</div>
                </div>
                <div class="activity-time">${formatDuration(activity.duration)}</div>
            </div>
        </div>
    `).join('');
}

console.log('✅ dashboard.js cargado');
