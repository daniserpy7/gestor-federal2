const app = {
    user: null,

    login: () => {
        const role = document.getElementById('role-selector').value;
        const name = document.getElementById('username').value;

        if (!role || !name) return alert("Por favor rellena todos los campos");

        app.user = { role, name, id: name.toLowerCase().replace(/\s/g, '_') };
        
        // Aplicar tema visual
        document.body.className = `role-${role}`;
        document.getElementById('display-role').innerText = role.toUpperCase();
        document.getElementById('display-name').innerText = name;

        // Mostrar/Ocultar secciones según rango
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('main-dashboard').classList.remove('hidden');

        app.setupInterface();
        dashboard.init();
    },

    setupInterface: () => {
        const r = app.user.role;
        
        // El cronómetro necesita código para Iniciales y Medios
        if (r === 'inicial' || r === 'medio') {
            document.getElementById('auth-code-input').classList.remove('hidden');
        }

        // Panel de gestión para Altos y Admin
        if (r === 'alto' || r === 'admin') {
            document.getElementById('management-section').classList.remove('hidden');
            document.getElementById('admin-comms').classList.remove('hidden');
        }

        // Historial solo para Admin
        if (r === 'admin') {
            document.getElementById('history-section').classList.remove('hidden');
        }
    },

    logout: () => {
        location.reload();
    }
};
