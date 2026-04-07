const dashboard = {
    timerInterval: null,
    currentStartTime: null,

    init: () => {
        // Escuchar notificaciones (Comunicados y Alertas)
        storage.listen('notifications', (data) => {
            const container = document.getElementById('comms-list');
            container.innerHTML = '';
            if (!data) return;
            
            Object.values(data).reverse().forEach(msg => {
                if (msg.target === 'all' || msg.target === app.user.role) {
                    const div = document.createElement('div');
                    div.className = msg.type === 'alerta' ? 'alerta-item' : 'comunicado-item';
                    div.innerHTML = `<strong>${msg.type.toUpperCase()}:</strong> ${msg.text} <br><small>De: ${msg.sender}</small>`;
                    container.appendChild(div);
                }
            });
        });

        // Si es jefe o admin, ver lista de subordinados
        if (app.user.role === 'alto' || app.user.role === 'admin') {
            storage.listen('timers', (timers) => {
                const subContainer = document.getElementById('sub-container');
                subContainer.innerHTML = '';
                if (!timers) return;

                Object.keys(timers).forEach(id => {
                    const t = timers[id];
                    // Un Cargo Alto solo ve a quien le dio código. Admin ve a todos.
                    if (app.user.role === 'admin' || t.authorizedBy === app.user.id) {
                        const card = document.createElement('div');
                        card.className = 'sub-card';
                        card.innerHTML = `
                            p><strong>${t.userName}</strong> [${t.status}]</p>
                            <button onclick="dashboard.remoteControl('${id}', 'paused')">Pausa</button>
                            <button onclick="dashboard.remoteControl('${id}', 'stopped')">Stop</button>
                            <button onclick="dashboard.remoteControl('${id}', 'subtract')">-5 Min</button>
                        `;
                        subContainer.appendChild(card);
                    }
                });
            });
        }

        // Escuchar mi propio cronómetro por si mi jefe lo pausa
        storage.listen('timers/' + app.user.id, (myState) => {
            if (myState && myState.status === 'paused') {
                clearInterval(dashboard.timerInterval);
                alert("Tu cronómetro ha sido pausado por un superior");
            }
        });
    },

    generateCode: () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        document.getElementById('generated-code').innerText = code;
        storage.saveToken(code, app.user.id, app.user.role);
    },

    validateToken: async () => {
        const input = document.getElementById('input-token').value;
        const snapshot = await db.ref('tokens/' + input).once('value');
        const tokenData = snapshot.val();

        if (tokenData && tokenData.status === 'active') {
            alert("Código aceptado. Iniciando...");
            dashboard.startTimer(tokenData.creator);
            // Desactivar token para que no se use dos veces
            db.ref('tokens/' + input).update({ status: 'used' });
        } else {
            alert("Código inválido o ya usado.");
        }
    },

    startTimer: (bossId) => {
        dashboard.currentStartTime = Date.now();
        storage.saveTimer(app.user.id, {
            userName: app.user.name,
            startTime: dashboard.currentStartTime,
            status: 'running',
            authorizedBy: bossId || 'self'
        });

        dashboard.timerInterval = setInterval(() => {
            const diff = Date.now() - dashboard.currentStartTime;
            document.getElementById('timer-display').innerText = new Date(diff).toISOString().substr(11, 8);
        }, 1000);
    },

    sendMsg: async (type) => {
        const text = document.getElementById('msg-text').value;
        const target = document.getElementById('msg-target').value;
        
        if (type === 'alerta' && app.user.role === 'alto') {
            const code = prompt("Las alertas requieren autorización. Pide código a Admin:");
            if (!code) return;
            // Aquí podrías validar el código contra una tabla de 'admin_codes'
        }

        await storage.sendNotification(type, target, text, app.user.name);
        document.getElementById('msg-text').value = '';
    },

    remoteControl: (targetId, action) => {
        if (action === 'subtract') {
            // Lógica para restar 5 minutos (300000 ms)
            db.ref('timers/' + targetId + '/startTime').transaction(current => current + 300000);
        } else {
            db.ref('timers/' + targetId).update({ status: action });
        }
    }
};
