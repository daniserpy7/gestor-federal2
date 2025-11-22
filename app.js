// Variables globales
let currentUser = null;
let timerUpdateInterval = null;

console.log('✅ app.js cargado');

// Inicialización
window.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado completamente');
    
    createDefaultAdmin();
    checkSession();
    
    // Event listeners
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', login);
        console.log('✅ Event listener de login agregado');
    }
    
    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
    }
});

// Crear admin por defecto
function createDefaultAdmin() {
    const adminEmail = 'admin@sistema.com';
    const existingAdmin = storage.get(`user:${adminEmail}`);
    
    if (!existingAdmin) {
        const adminUser = {
            name: 'Administrador del Sistema',
            email: adminEmail,
            password: 'Admin123!',
            role: 'admin',
            username: 'admin',
            createdAt: new Date().toISOString(),
            createdBy: 'system'
        };
        storage.set(`user:${adminEmail}`, JSON.stringify(adminUser));
        console.log('✅ Usuario admin creado');
    } else {
        console.log('✅ Usuario admin ya existe');
    }
}

// Verificar sesión
function checkSession() {
    const result = storage.get('currentUser');
    if (result && result.value) {
        currentUser = JSON.parse(result.value);
        console.log('✅ Sesión encontrada:', currentUser.email);
        showDashboard();
    } else {
        console.log('ℹ️ No hay sesión activa');
    }
}

// Login
function login() {
    console.log('🔐 Intentando login...');
    
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!emailInput || !passwordInput) {
        console.error('❌ Campos de login no encontrados');
        showError('Error: Campos no encontrados');
        return;
    }
    
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    console.log('Email ingresado:', email);

    if (!email || !password) {
        showError('Por favor completa todos los campos');
        return;
    }

    const result = storage.get(`user:${email}`);
    console.log('Búsqueda de usuario:', result ? '✅ Encontrado' : '❌ No encontrado');
    
    if (!result) {
        showError('Usuario no encontrado');
        return;
    }

    const user = JSON.parse(result.value);
    console.log('Usuario:', user.name, '- Rol:', user.role);
    
    if (user.password !== password) {
        showError('Contraseña incorrecta');
        console.log('❌ Contraseña incorrecta');
        return;
    }

    console.log('✅ Login exitoso!');
    currentUser = user;
    storage.set('currentUser', JSON.stringify(user));
    showDashboard();
}

// Logout
function logout() {
    try {
        if (timerUpdateInterval) {
            clearInterval(timerUpdateInterval);
        }
        
        storage.delete('currentUser');
        currentUser = null;
        
        // Remover tema
        document.body.className = '';
        
        const dashboard = document.getElementById('dashboard');
        const authSection = document.getElementById('authSection');
        
        if (dashboard) {
            dashboard.style.display = 'none';
            dashboard.innerHTML = '';
        }
        
        if (authSection) {
            authSection.classList.remove('hidden');
            authSection.style.display = 'block';
        }
        
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('headerInfo').innerHTML = '';
        
        clearMessages();
        console.log('✅ Sesión cerrada');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        location.reload();
    }
}

// Mostrar dashboard
function showDashboard() {
    console.log('📊 Mostrando dashboard para rol:', currentUser.role);
    
    const authSection = document.getElementById('authSection');
    const dashboard = document.getElementById('dashboard');
    const body = document.body;
    
    // Aplicar tema según rol
    body.className = `theme-${currentUser.role}`;
    
    if (authSection) {
        authSection.classList.add('hidden');
        authSection.style.display = 'none';
    }
    
    if (dashboard) {
        dashboard.style.display = 'block';
        dashboard.classList.remove('hidden');
    }
    
    const roleClass = `role-${currentUser.role}`;
    const roleNames = {
        admin: 'ADMIN',
        alto: 'ALTO',
        medio: 'MEDIO',
        basico: 'BÁSICO'
    };

    document.getElementById('headerInfo').innerHTML = `
        <div class="role-badge ${roleClass}">${roleNames[currentUser.role]}</div>
    `;

    if (currentUser.role === 'admin') {
        renderAdminDashboard(dashboard);
    } else if (currentUser.role === 'alto') {
        renderAltoDashboard(dashboard);
    } else {
        renderBasicMedioDashboard(dashboard);
    }
}

// SISTEMA DE CRONÓMETROS PERSISTENTES

function startTimerForUser(userEmail) {
    const timerData = {
        userEmail: userEmail,
        startTime: Date.now(),
        isRunning: true
    };
    
    storage.set(`timer:${userEmail}`, JSON.stringify(timerData));
    console.log('⏱️ Cronómetro iniciado para:', userEmail);
}

function getTimerSeconds(userEmail) {
    const result = storage.get(`timer:${userEmail}`);
    if (!result) return 0;
    
    const timerData = JSON.parse(result.value);
    if (!timerData.isRunning) return 0;
    
    const elapsed = Math.floor((Date.now() - timerData.startTime) / 1000);
    return elapsed;
}

function stopTimerForUser(userEmail, motivo = null) {
    const result = storage.get(`timer:${userEmail}`);
    if (!result) return;
    
    const timerData = JSON.parse(result.value);
    if (!timerData.isRunning) return;
    
    const totalSeconds = Math.floor((Date.now() - timerData.startTime) / 1000);
    
    // Guardar en historial
    const activity = {
        duration: totalSeconds,
        startTime: timerData.startTime,
        endTime: Date.now(),
        date: new Date().toISOString(),
        stoppedBy: currentUser.email,
        stoppedByName: currentUser.name,
        motivo: motivo
    };
    
    let activities = [];
    const activitiesResult = storage.get(`activities:${userEmail}`);
    if (activitiesResult) {
        activities = JSON.parse(activitiesResult.value);
    }
    activities.push(activity);
    storage.set(`activities:${userEmail}`, JSON.stringify(activities));
    
    // Detener cronómetro
    storage.delete(`timer:${userEmail}`);
    
    // Desactivar sesión
    storage.delete(`session:${userEmail}`);
    
    console.log('⏹️ Cronómetro detenido para:', userEmail);
}

function adjustTimerForUser(userEmail, secondsToSubtract, motivo) {
    const result = storage.get(`timer:${userEmail}`);
    if (!result) return false;
    
    const timerData = JSON.parse(result.value);
    if (!timerData.isRunning) return false;
    
    // Ajustar el tiempo de inicio (adelantarlo)
    timerData.startTime = timerData.startTime + (secondsToSubtract * 1000);
    
    // Guardar registro del ajuste
    let adjustments = [];
    const adjustResult = storage.get(`adjustments:${userEmail}`);
    if (adjustResult) {
        adjustments = JSON.parse(adjustResult.value);
    }
    
    adjustments.push({
        adjustedBy: currentUser.email,
        adjustedByName: currentUser.name,
        secondsSubtracted: secondsToSubtract,
        motivo: motivo,
        date: new Date().toISOString()
    });
    
    storage.set(`adjustments:${userEmail}`, JSON.stringify(adjustments));
    storage.set(`timer:${userEmail}`, JSON.stringify(timerData));
    
    console.log('⏱️ Tiempo ajustado para:', userEmail, '- Restados:', secondsToSubtract, 'segundos');
    return true;
}

function getAllActiveTimers() {
    const users = [];
    const usersResult = storage.get('all:users');
    if (!usersResult) return [];
    
    const userEmails = JSON.parse(usersResult.value);
    
    for (const email of userEmails) {
        const timerResult = storage.get(`timer:${email}`);
        if (timerResult) {
            const timerData = JSON.parse(timerResult.value);
            if (timerData.isRunning) {
                const userResult = storage.get(`user:${email}`);
                if (userResult) {
                    const user = JSON.parse(userResult.value);
                    users.push({
                        email: email,
                        name: user.name,
                        role: user.role,
                        seconds: getTimerSeconds(email)
                    });
                }
            }
        }
    }
    
    return users;
}

// Funciones de utilidad
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.random() * chars.length);
    }
    return code;
}

function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 5000);
    }
}

function clearMessages() {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
}

console.log('✅ Funciones básicas cargadas');
