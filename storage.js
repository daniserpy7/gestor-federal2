const firebaseConfig = {
    apiKey: "AIzaSyA2vmgHe_sooD5dg7gpx-w-i5y8_gD17tc",
    authDomain: "gestor-federal.firebaseapp.com",
    databaseURL: "https://gestor-federal-default-rtdb.firebaseio.com",
    projectId: "gestor-federal",
    storageBucket: "gestor-federal.firebasestorage.app",
    messagingSenderId: "568075713708",
    appId: "1:568075713708:web:034bc6377dbfb30bf5b309"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const storage = {
    // Guardar estado del cronómetro
    saveTimer: (uid, data) => {
        return db.ref('timers/' + uid).set(data);
    },
    
    // Obtener códigos activos
    saveToken: (code, creatorId, creatorRole) => {
        return db.ref('tokens/' + code).set({
            creator: creatorId,
            role: creatorRole,
            status: 'active',
            timestamp: Date.now()
        });
    },

    // Enviar mensajes o alertas
    sendNotification: (type, target, text, sender) => {
        const newMsgRef = db.ref('notifications').push();
        return newMsgRef.set({
            type,
            target,
            text,
            sender,
            timestamp: Date.now()
        });
    },

    // Escuchar cambios en tiempo real
    listen: (path, callback) => {
        db.ref(path).on('value', snapshot => callback(snapshot.val()));
    }
};
