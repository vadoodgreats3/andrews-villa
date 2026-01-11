// Andrews Villa - WORKING Authentication System
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Auth system loaded');
    
    // Check if we're on login page
    if (window.location.pathname.includes('login.html') || document.getElementById('loginForm')) {
        setupLoginForm();
    }
    
    // Check if we're on register page
    if (window.location.pathname.includes('register.html') || document.getElementById('registerForm')) {
        setupRegistrationForm();
    }
    
    // Setup logout if button exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
    
    // Update navigation based on login status
    updateNavigation();
});

// Configuration - CHANGE THIS TO YOUR ACTUAL BACKEND URL
const API_URL = 'https://andrews-villa-api.onrender.com/api';

// ========== LOGIN FUNCTION ==========
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        
        // Show loading
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;
        
        try {
            console.log('Attempting login to:', API_URL + '/auth/login');
            
            const response = await fetch(API_URL + '/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Login failed:', errorText);
                throw new Error('Login failed. Please check credentials.');
            }
            
            const data = await response.json();
            console.log('Login successful:', data);
            
            // Store user data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');
            
            // Show success message
            alert('Login successful! Redirecting...');
            
            // Redirect based on role
            setTimeout(() => {
                if (data.user.role === 'admin') {
                    window.location.href = 'dashboard-admin.html';
                } else {
                    window.location.href = 'dashboard-client.html';
                }
            }, 1000);
            
        } catch (error) {
            console.error('Login error details:', error);
            alert('Login failed: ' + error.message + '\n\nCheck browser console (F12) for details.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========== REGISTRATION FUNCTION ==========
function setupRegistrationForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            phone: document.getElementById('phone').value.trim()
        };
        
        // Basic validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (formData.password.length < 8) {
            alert('Password must be at least 8 characters');
            return;
        }
        
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (formData.password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // Show loading
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        submitBtn.disabled = true;
        
        try {
            console.log('Attempting registration to:', API_URL + '/auth/register');
            
            const response = await fetch(API_URL + '/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Registration failed:', errorText);
                throw new Error('Registration failed. Email may already exist.');
            }
            
            const data = await response.json();
            console.log('Registration successful:', data);
            
            // Auto-login
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');
            
            alert('Account created successfully! Redirecting to dashboard...');
            
            setTimeout(() => {
                window.location.href = 'dashboard-client.html';
            }, 1000);
            
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed: ' + error.message);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========== NAVIGATION UPDATE ==========
function updateNavigation() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginLink = document.querySelector('a[href="login.html"]');
    const dashboardLink = document.querySelector('a[href*="dashboard"]');
    
    if (isLoggedIn) {
        if (loginLink) {
            loginLink.textContent = 'Logout';
            loginLink.href = '#';
            loginLink.onclick = function(e) {
                e.preventDefault();
                localStorage.clear();
                window.location.href = 'index.html';
            };
        }
        
        // Update dashboard link based on role
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (dashboardLink && userData.role === 'admin') {
            dashboardLink.href = 'dashboard-admin.html';
            dashboardLink.textContent = 'Admin Dashboard';
        }
    }
}

// ========== HELPER FUNCTIONS ==========
function getAuthToken() {
    return localStorage.getItem('authToken');
}

function isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

function getUserData() {
    try {
        return JSON.parse(localStorage.getItem('userData') || '{}');
    } catch {
        return {};
    }
}