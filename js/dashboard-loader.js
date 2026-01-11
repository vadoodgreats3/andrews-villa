// Dashboard Loader - Fixes layout and loads data
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loader initialized');
    
    // Fix layout issues
    fixDashboardLayout();
    
    // Check authentication
    if (!localStorage.getItem('authToken')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user data
    loadUserData();
    
    // Initialize based on dashboard type
    if (document.getElementById('propertiesSection')) {
        initAdminDashboard();
    } else if (document.getElementById('profileSection')) {
        initClientDashboard();
    }
});

function fixDashboardLayout() {
    // Ensure proper CSS loading
    const style = document.createElement('style');
    style.textContent = `
        .dashboard { display: grid !important; grid-template-columns: 280px 1fr; min-height: 100vh; }
        .sidebar { background: #f8fafc; border-right: 1px solid #e2e8f0; }
        .dashboard-content { padding: 2rem; }
        .menu-item { display: flex; align-items: center; padding: 0.75rem 1rem; }
        .stat-card { background: white; border-radius: 12px; padding: 1.5rem; }
        
        /* Mobile responsive */
        @media (max-width: 1024px) {
            .dashboard { grid-template-columns: 1fr; }
            .sidebar { display: none; }
        }
    `;
    document.head.appendChild(style);
}

async function loadUserData() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Update UI elements
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userAvatar = document.getElementById('userAvatar');
        
        if (userName) userName.textContent = `${userData.firstName || 'User'} ${userData.lastName || ''}`;
        if (userEmail) userEmail.textContent = userData.email || '';
        if (userAvatar) userAvatar.textContent = `${(userData.firstName || 'U')[0]}${(userData.lastName || 'S')[0]}`;
        
    } catch (error) {
        console.error('Failed to load user data:', error);
    }
}

async function initClientDashboard() {
    console.log('Loading client dashboard...');
    
    // Load dashboard stats
    await loadDashboardStats();
    
    // Load saved properties
    await loadSavedProperties();
    
    // Initialize menu navigation
    initDashboardNavigation();
}

async function loadDashboardStats() {
    try {
        const response = await apiFetch('/dashboard/stats');
        const data = await response.json();
        
        // Update stat cards
        const elements = {
            'savedCount': data.savedCount || 0,
            'applicationsCount': data.bookingsCount || 0,
            'paymentsCount': data.paymentsCount || 0,
            'messagesCount': data.messagesCount || 0
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
        
    } catch (error) {
        console.error('Failed to load stats:', error);
        // Set defaults
        ['savedCount', 'applicationsCount', 'paymentsCount', 'messagesCount'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '0';
        });
    }
}

async function loadSavedProperties() {
    try {
        const response = await apiFetch('/dashboard/saved-properties');
        const data = await response.json();
        
        const container = document.getElementById('savedProperties');
        if (!container) return;
        
        if (!data.properties || data.properties.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-bookmark" style="font-size: 3rem; color: #94a3b8;"></i>
                    <h3>No Saved Properties</h3>
                    <p>Properties you save will appear here.</p>
                </div>
            `;
            return;
        }
        
        // Render properties
        container.innerHTML = data.properties.map(property => `
            <div class="property-card" style="
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            ">
                <img src="${property.images?.[0] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400'}" 
                     alt="${property.title}" 
                     style="width: 100px; height: 100px; border-radius: 8px; object-fit: cover;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.5rem 0;">${property.title}</h4>
                    <p style="color: #64748b; margin: 0 0 0.5rem 0;">
                        <i class="fas fa-map-marker-alt"></i> ${property.location}
                    </p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold; color: #3b82f6;">${property.price}</span>
                        <div>
                            <button class="btn btn-outline" onclick="viewProperty('${property.id}')">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load saved properties:', error);
    }
}

function initDashboardNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.dashboard-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active states
            menuItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            this.classList.add('active');
            
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(`${sectionId}Section`);
            
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Load section-specific data
                switch(sectionId) {
                    case 'saved':
                        loadSavedProperties();
                        break;
                    case 'chat':
                        initChatSystem();
                        break;
                    // Add more cases as needed
                }
            }
        });
    });
}

function viewProperty(propertyId) {
    window.location.href = `property-listing.html?id=${propertyId}`;
}

// Make functions available globally
window.initDashboardNavigation = initDashboardNavigation;
window.viewProperty = viewProperty;