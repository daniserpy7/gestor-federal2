// Storage wrapper para localStorage
const storage = {
    get: function(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? { value: value } : null;
        } catch (error) {
            console.error('Error al obtener datos:', error);
            return null;
        }
    },
    
    set: function(key, value) {
        try {
            localStorage.setItem(key, value);
            return { key: key, value: value };
        } catch (error) {
            console.error('Error al guardar datos:', error);
            return null;
        }
    },
    
    delete: function(key) {
        try {
            localStorage.removeItem(key);
            return { key: key, deleted: true };
        } catch (error) {
            console.error('Error al eliminar datos:', error);
            return null;
        }
    }
};

console.log('✅ storage.js cargado');
