const API_URL = 'http://localhost:3000/api';

const TokenManager = {
    setToken: function(token) {
        localStorage.setItem('authToken', token);
    },
    
    getToken: function() {
        return localStorage.getItem('authToken');
    },
    
    removeToken: function() {
        localStorage.removeItem('authToken');
    },
    
    setUser: function(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },
    
    getUser: function() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    removeUser: function() {
        localStorage.removeItem('user');
    },
    
    isAuthenticated: function() {
        return !!this.getToken();
    },
    
    clearAll: function() {
        this.removeToken();
        this.removeUser();
    }
};

const AuthAPI = {
    register: function(userData) {
        return fetch(API_URL + '/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                TokenManager.setToken(data.token);
                TokenManager.setUser(data.user);
            }
            return data;
        })
        .catch(function(error) {
            console.error('Error en registro:', error);
            return {
                success: false,
                message: 'Error de conexión con el servidor'
            };
        });
    },
    
    login: function(credentials) {
        return fetch(API_URL + '/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                TokenManager.setToken(data.token);
                TokenManager.setUser(data.user);
            }
            return data;
        })
        .catch(function(error) {
            console.error('Error en login:', error);
            return {
                success: false,
                message: 'Error de conexión con el servidor'
            };
        });
    },
    
    verifyToken: function() {
        const token = TokenManager.getToken();
        
        if (!token) {
            return Promise.resolve({
                success: false,
                message: 'No hay token'
            });
        }
        
        return fetch(API_URL + '/auth/verify', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(function(response) {
            return response.json();
        })
        .catch(function(error) {
            TokenManager.clearAll();
            return {
                success: false,
                message: 'Error al verificar token'
            };
        });
    },
    
    logout: function() {
        TokenManager.clearAll();
        window.location.href = 'login.html';
    }
};