// Variables globales
let currentUser = null;
let timerInterval = null;
let seconds = 0;
let isRunning = false;
let workSessionActive = false;

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
        if (isRunning) {
            isRunning = false;
            clearInterval(timerInterval);
            seconds = 0;
        }
        
        storage.delete('currentUser');
        currentUser = null;
        workSessionActive = false;
        
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

// Funciones de utilidad
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
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
