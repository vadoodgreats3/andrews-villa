// Dashboard Force Visibility Fix
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Applying dashboard visibility fix');
    
    // Apply immediate CSS fixes
    applyVisibilityFix();
    
    // Remove pre-written demo content
    removeDemoContent();
    
    // Force dashboard layout
    forceDashboardLayout();
    
    // Check authentication
    checkAuthAndLoadData();
});

function applyVisibilityFix() {
    // Add critical CSS
    const style = document.createElement('style');
    style.textContent = `
        /* CRITICAL: Force dashboard visibility */
        .dashboard {
            display: grid !important;
            grid-template-columns: 280px 1fr !important;
            min-height: 100vh !important;
            margin-top: 80px !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
        
        .sidebar {
            display: block !important;
            position: fixed !important;
            left: 0 !important;
            top: 80px !important;
            width: 280px !important;
            height: calc(100vh - 80px) !important;
            background: #f8fafc !important;
            border-right: 1px solid #e2e8f0 !important;
            padding: 2rem 1rem !important;
            overflow-y: auto !important;
            z-index: 90 !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
        
        .dashboard-content {
            display: block !important;
            margin-left: 280px !important;
            width: calc(100% - 280px) !important;
            padding: 2rem !important;
            min-height: calc(100vh - 80px) !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
        
        /* Remove all hiding classes */
        .hidden, [hidden], .d-none, .is-hidden {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .dashboard {
                grid-template-columns: 1fr !important;
            }
            
            .sidebar {
                position: static !important;
                width: 100% !important;
                height: auto !important;
            }
            
            .dashboard-content {
                margin-left: 0 !important;
                width: 100% !important;
            }
        }
    `;
    
    document.head.appendChild(style);
}

function removeDemoContent() {
    // Remove any pre-written placeholder content
    const demoSelectors = [
        '.demo-content',
        '.placeholder',
        '[data-demo="true"]',
        '.template-content',
        '.example-data'
    ];
    
    demoSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.remove();
        });
    });
    
    // Clear any demo text in stat cards
    document.querySelectorAll('.stat-value').forEach(el => {
        if (el.textContent.includes('Demo') || el.textContent.includes('Example')) {
            el.textContent = '0';
        }
    });
}

function forceDashboardLayout() {
    // Ensure dashboard container exists
    let dashboard = document.querySelector('.dashboard');
    if (!dashboard) {
        dashboard = document.createElement('div');
        dashboard.className = 'dashboard';
        document.querySelector('main')?.appendChild(dashboard) || document.body.appendChild(dashboard);
    }
    
    // Ensure sidebar exists
    let sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
        sidebar = document.createElement('aside');
        sidebar.className = 'sidebar';
        dashboard.appendChild(sidebar);
        
        // Add basic sidebar content
        sidebar.innerHTML = `
            <div class="user-profile">
                <div class="user-avatar" id="userAvatar">JD</div>
                <h3 id="userName">Loading...</h3>
                <p id="userEmail">Loading...</p>
            </div>
            <nav class="sidebar-menu">
                <a href="#profile" class="menu-item active" data-section="profile">
                    <i class="fas fa-user"></i> Profile
                </a>
                <a href="#saved" class="menu-item" data-section="saved">
                    <i class="fas fa-bookmark"></i> Saved Properties
                </a>
                <a href="#applications" class="menu-item" data-section="applications">
                    <i class="fas fa-file-alt"></i> Applications
                </a>
                <a href="#payments" class="menu-item" data-section="payments">
                    <i class="fas fa-credit-card"></i> Payments
                </a>
            </nav>
        `;
    }
    
    // Ensure content area exists
    let content = document.querySelector('.dashboard-content');
    if (!content) {
        content = document.createElement('main');
        content.className = 'dashboard-content';
        dashboard.appendChild(content);
        
        // Add basic content
        content.innerHTML = `
            <div class="dashboard-section active" id="profileSection">
                <h1>Dashboard</h1>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-home"></i></div>
                        <div class="stat-content">
                            <div class="stat-value" id="savedCount">0</div>
                            <div class="stat-label">Saved Properties</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-file-contract"></i></div>
                        <div class="stat-content">
                            <div class="stat-value" id="applicationsCount">0</div>
                            <div class="stat-label">Applications</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function checkAuthAndLoadData() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Update UI
    document.getElementById('userName').textContent = 
        `${userData.firstName || 'User'} ${userData.lastName || ''}`;
    document.getElementById('userEmail').textContent = userData.email || '';
    
    // Set avatar initials
    const avatar = document.getElementById('userAvatar');
    if (avatar) {
        const initials = `${(userData.firstName || 'U')[0]}${(userData.lastName || 'S')[0]}`;
        avatar.textContent = initials.toUpperCase();
    }
    
    // Try to load real data from API
    loadRealData(userData);
}

async function loadRealData(userData) {
    try {
        const token = localStorage.getItem('authToken');
        
        // Determine which API to call based on user role
        if (userData.role === 'admin') {
            await loadAdminData(token);
        } else {
            await loadClientData(token);
        }
        
    } catch (error) {
        console.log('Using fallback data:', error);
        // Use fallback data if API fails
        useFallbackData();
    }
}

async function loadClientData(token) {
    // Try to fetch real client data
    try {
        const response = await fetch('https://andrews-villa-api.onrender.com/api/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('savedCount').textContent = data.savedCount || 0;
            document.getElementById('applicationsCount').textContent = data.bookingsCount || 0;
        }
    } catch (error) {
        console.log('Client API call failed:', error);
    }
}

async function loadAdminData(token) {
    // Try to fetch real admin data
    try {
        const response = await fetch('https://andrews-villa-api.onrender.com/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('savedCount').textContent = data.totalProperties || 0;
            document.getElementById('applicationsCount').textContent = data.totalUsers || 0;
        }
    } catch (error) {
        console.log('Admin API call failed:', error);
    }
}

function useFallbackData() {
    // Set reasonable fallback values
    document.getElementById('savedCount').textContent = '0';
    document.getElementById('applicationsCount').textContent = '0';
}

// Initialize dashboard navigation
function initDashboardNav() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            document.querySelectorAll('.dashboard-section').forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(`${sectionId}Section`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// Call this after DOM is fully loaded
setTimeout(initDashboardNav, 100);