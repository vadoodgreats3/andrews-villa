// API Configuration - POINTS TO YOUR LIVE BACKEND
const API_BASE_URL = 'https://andrews-villa.onrender.com/api';

// Helper function for making authenticated API calls
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: defaultHeaders
    });
    
    if (response.status === 401) {
        // Token expired or invalid
        localStorage.clear();
        window.location.href = 'login.html';
        return;
    }
    
    return response;
}
// Authentication System for Andrews Villa
document.addEventListener('DOMContentLoaded', function() {
    console.log('Authentication system initialized');
    
    // Initialize components
    initLoginForm();
    initPasswordToggle();
    checkRememberedLogin();
    
    // Check if user is already logged in
    if (isLoggedIn()) {
        redirectToDashboard();
    }
});

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value; // This will be handled by backend
        
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        submitBtn.disabled = true;
        
        try {
            // Call your LIVE backend API
            const response = await fetch('https://andrews-villa.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: username,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Handle API errors (invalid credentials, server error, etc.)
                throw new Error(data.error || 'Login failed');
            }
            
            // Login successful - save token and user data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', data.user.role);
            
            showSuccess('Login successful! Redirecting...');
            
            // Redirect based on role
            setTimeout(() => {
                if (data.user.role === 'admin') {
                    window.location.href = 'dashboard-admin.html';
                } else {
                    window.location.href = 'dashboard-client.html';
                }
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            showError(error.message || 'Login failed. Please try again.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

function authenticateUser(username, password, role) {
    // Admin authentication
    if (role === 'admin') {
        return username === 'corner' && password === 'cornerdooradmin4life';
    }
    
    // Client authentication (demo users)
    const demoUsers = {
        'client@andrewsvilla.com': 'client123',
        'john@example.com': 'john123',
        'sarah@example.com': 'sarah123',
        'demo': 'demo123'
    };
    
    return demoUsers[username] === password;
}

function initPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    if (!toggleBtn) return;
    
    toggleBtn.addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    });
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.style.display = 'flex';
        errorDiv.style.alignItems = 'center';
        errorDiv.style.gap = '0.5rem';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    
    if (successDiv && successText) {
        successText.textContent = message;
        successDiv.style.display = 'flex';
        successDiv.style.alignItems = 'center';
        successDiv.style.gap = '0.5rem';
    }
}

function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

function redirectToDashboard() {
    const role = localStorage.getItem('userRole') || 'client';
    
    if (role === 'admin') {
        window.location.href = 'dashboard-admin.html';
    } else {
        window.location.href = 'dashboard-client.html';
    }
}

function checkRememberedLogin() {
    const remembered = localStorage.getItem('rememberedLogin');
    if (!remembered) return;
    
    try {
        const loginData = JSON.parse(remembered);
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        if (loginData.timestamp > oneWeekAgo) {
            // Auto-fill username
            const usernameInput = document.getElementById('username');
            const roleSelect = document.getElementById('role');
            
            if (usernameInput) usernameInput.value = loginData.username;
            if (roleSelect) roleSelect.value = loginData.role;
        } else {
            // Clear expired remember
            localStorage.removeItem('rememberedLogin');
        }
    } catch (e) {
        console.error('Error parsing remembered login:', e);
    }
}

// Registration function (for register.html)
function registerUser(userData) {
    // In a real system, this would make an API call
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Check if user already exists
    if (users.some(u => u.email === userData.email)) {
        return { success: false, message: 'Email already registered' };
    }
    
    // Add new user
    users.push({
        id: 'user_' + Date.now(),
        ...userData,
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    // Auto-login after registration
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', 'client');
    localStorage.setItem('username', userData.email);
    
    return { success: true, message: 'Registration successful' };
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        authenticateUser,
        registerUser,
        logout,
        isLoggedIn
    };
}