// Andrews Villa - Production Authentication System
// ===============================================

// API Configuration - UPDATE THIS WITH YOUR ACTUAL BACKEND URL
const API_BASE_URL = 'https://andrews-villa-api.onrender.com/api';

// Store for fallback data
window.appData = {
    user: null,
    properties: [],
    saved: []
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth system initialized');
    
    // Initialize based on current page
    if (document.getElementById('loginForm')) {
        initLoginForm();
    }
    if (document.getElementById('registerForm')) {
        initRegistrationForm();
    }
    
    // Check if user is already logged in
    checkAuthStatus();
    
    // Initialize password toggles
    initPasswordToggles();
});

// ========== AUTHENTICATION FUNCTIONS ==========

async function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('username')?.value.trim() || 
                      document.getElementById('email')?.value.trim();
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `Login failed (${response.status})`);
            }
            
            // Save auth data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', data.user.role);
            
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect with delay for user to see message
            setTimeout(() => {
                if (data.user.role === 'admin') {
                    window.location.href = 'dashboard-admin.html';
                } else {
                    window.location.href = 'dashboard-client.html';
                }
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            showNotification(error.message || 'Network error. Please check your connection.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

async function initRegistrationForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    // Initialize password validation
    initPasswordValidation();
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateRegistrationForm()) {
            return;
        }
        
        const userData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone')?.value.trim() || '',
            password: document.getElementById('password').value
        };
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `Registration failed (${response.status})`);
            }
            
            // Auto-login after registration
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', data.user.role);
            
            showNotification('Account created successfully!', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard-client.html';
            }, 1500);
            
        } catch (error) {
            console.error('Registration error:', error);
            showNotification(error.message || 'Registration failed. Please try again.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========== HELPER FUNCTIONS ==========

function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Update UI based on auth status
    const loginBtn = document.querySelector('a[href="login.html"]');
    const dashboardBtn = document.querySelector('a[href*="dashboard"]');
    
    if (isLoggedIn && token) {
        if (loginBtn) {
            loginBtn.textContent = 'Logout';
            loginBtn.href = '#';
            loginBtn.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        }
        
        // Load user data
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        window.appData.user = userData;
        
        // Update dashboard button text
        if (dashboardBtn) {
            if (userData.role === 'admin') {
                dashboardBtn.textContent = 'Admin Dashboard';
                dashboardBtn.href = 'dashboard-admin.html';
            }
        }
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// API fetch helper with authentication
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            // Token expired
            localStorage.clear();
            window.location.href = 'login.html?expired=true';
            throw new Error('Session expired');
        }
        
        return response;
    } catch (error) {
        console.error('API fetch error:', error);
        throw error;
    }
}

// ========== UI HELPERS ==========

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.global-notification');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `global-notification notification-${type}`;
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        ">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                margin-left: 1rem;
            ">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function initPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });
}

function initPasswordValidation() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const hints = {
            length: document.getElementById('hintLength'),
            uppercase: document.getElementById('hintUppercase'),
            lowercase: document.getElementById('hintLowercase'),
            number: document.getElementById('hintNumber')
        };
        
        if (hints.length) {
            const isValid = password.length >= 8;
            updateHint(hints.length, isValid);
        }
        if (hints.uppercase) {
            const isValid = /[A-Z]/.test(password);
            updateHint(hints.uppercase, isValid);
        }
        if (hints.lowercase) {
            const isValid = /[a-z]/.test(password);
            updateHint(hints.lowercase, isValid);
        }
        if (hints.number) {
            const isValid = /[0-9]/.test(password);
            updateHint(hints.number, isValid);
        }
    });
    
    // Confirm password matching
    const confirmInput = document.getElementById('confirmPassword');
    if (confirmInput) {
        confirmInput.addEventListener('input', function() {
            const password = document.getElementById('password').value;
            const hint = document.getElementById('hintMatch');
            if (hint) {
                const isValid = password === this.value && password.length > 0;
                updateHint(hint, isValid);
            }
        });
    }
}

function updateHint(element, isValid) {
    if (!element) return;
    
    const icon = element.querySelector('i');
    if (icon) {
        icon.className = isValid ? 'fas fa-check' : 'fas fa-times';
        icon.style.color = isValid ? '#10b981' : '#ef4444';
    }
    element.style.color = isValid ? '#10b981' : '#6b7280';
}

function validateRegistrationForm() {
    const firstName = document.getElementById('firstName')?.value.trim();
    const lastName = document.getElementById('lastName')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    const terms = document.getElementById('terms')?.checked;
    
    // Basic validation
    const errors = [];
    
    if (!firstName || !lastName) {
        errors.push('Please enter your full name');
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    
    if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    if (!terms) {
        errors.push('Please accept the Terms of Service');
    }
    
    // Password strength
    if (password) {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        
        if (!hasUppercase || !hasLowercase || !hasNumber) {
            errors.push('Password must include uppercase, lowercase letters, and numbers');
        }
    }
    
    if (errors.length > 0) {
        showNotification(errors[0], 'error');
        return false;
    }
    
    return true;
}

// Make functions available globally
window.showNotification = showNotification;
window.logout = logout;
window.apiFetch = apiFetch;