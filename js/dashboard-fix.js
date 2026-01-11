// Andrews Villa - Dashboard Layout Fix
// This fixes all layout issues immediately

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Dashboard fix loaded');
    
    // Apply emergency CSS fixes
    applyEmergencyFixes();
    
    // Check authentication
    checkDashboardAuth();
    
    // Load user profile
    loadUserProfile();
    
    // Initialize dashboard based on type
    if (document.getElementById('propertiesSection')) {
        initAdminDashboard();
    } else if (document.getElementById('profileSection')) {
        initClientDashboard();
    }
    
    // Setup navigation
    setupDashboardNavigation();
});

// ========== EMERGENCY LAYOUT FIXES ==========
function applyEmergencyFixes() {
    // Add critical CSS if needed
    const style = document.createElement('style');
    style.textContent = `
        /* Emergency layout fixes */
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.5;
        }
        
        .dashboard {
            display: grid;
            grid-template-columns: 280px 1fr;
            min-height: 100vh;
            padding-top: 80px;
        }
        
        .sidebar {
            background: white;
            border-right: 1px solid #e2e8f0;
            padding: 2rem 1rem;
            position: fixed;
            left: 0;
            top: 80px;
            bottom: 0;
            width: 280px;
            overflow-y: auto;
        }
        
        .dashboard-content {
            margin-left: 280px;
            padding: 2rem;
            width: calc(100% - 280px);
        }
        
        /* Fix menu items */
        .menu-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            text-decoration: none;
            color: #64748b;
            transition: all 0.2s;
            margin-bottom: 0.25rem;
        }
        
        .menu-item:hover,
        .menu-item.active {
            background: #3b82f6;
            color: white;
        }
        
        /* Fix stats grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }
        
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        /* Mobile responsive */
        @media (max-width: 1024px) {
            .dashboard {
                grid-template-columns: 1fr;
            }
            
            .sidebar {
                position: static;
                width: 100%;
                height: auto;
            }
            
            .dashboard-content {
                margin-left: 0;
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// ========== AUTH CHECK ==========
function checkDashboardAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const authToken = localStorage.getItem('authToken');
    
    if (!isLoggedIn || !authToken) {
        alert('Please login first');
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// ========== USER PROFILE ==========
function loadUserProfile() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Update profile elements
        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        const userAvatarEl = document.getElementById('userAvatar');
        
        if (userNameEl) {
            userNameEl.textContent = `${userData.firstName || 'User'} ${userData.lastName || ''}`;
        }
        
        if (userEmailEl) {
            userEmailEl.textContent = userData.email || 'user@example.com';
        }
        
        if (userAvatarEl) {
            const initials = `${(userData.firstName || 'U')[0]}${(userData.lastName || 'S')[0]}`;
            userAvatarEl.textContent = initials.toUpperCase();
        }
        
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

// ========== CLIENT DASHBOARD ==========
function initClientDashboard() {
    console.log('Initializing client dashboard');
    
    // Load dashboard stats
    loadClientStats();
    
    // Load saved properties
    loadClientSavedProperties();
    
    // Make first section active
    document.querySelector('.menu-item[data-section="profile"]')?.classList.add('active');
    document.getElementById('profileSection')?.classList.add('active');
}

async function loadClientStats() {
    try {
        const authToken = localStorage.getItem('authToken');
        
        // Try to fetch real data
        const response = await fetch('https://andrews-villa-api.onrender.com/api/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Update stats with real data
            updateStat('savedCount', data.savedCount || 0);
            updateStat('applicationsCount', data.bookingsCount || 0);
            updateStat('paymentsCount', data.paymentsCount || 0);
            updateStat('messagesCount', data.messagesCount || 0);
            
        } else {
            // Use demo data if API fails
            useDemoStats();
        }
        
    } catch (error) {
        console.log('Using demo stats due to error:', error);
        useDemoStats();
    }
}

function useDemoStats() {
    // Set demo values
    updateStat('savedCount', 3);
    updateStat('applicationsCount', 2);
    updateStat('paymentsCount', 5);
    updateStat('messagesCount', 12);
}

function updateStat(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

async function loadClientSavedProperties() {
    const container = document.getElementById('savedProperties');
    if (!container) return;
    
    try {
        const authToken = localStorage.getItem('authToken');
        
        const response = await fetch('https://andrews-villa-api.onrender.com/api/dashboard/saved-properties', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderSavedProperties(container, data.properties || []);
        } else {
            renderDemoProperties(container);
        }
        
    } catch (error) {
        console.log('Using demo properties:', error);
        renderDemoProperties(container);
    }
}

function renderSavedProperties(container, properties) {
    if (!properties || properties.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bookmark"></i>
                <h3>No Saved Properties</h3>
                <p>Properties you save will appear here.</p>
                <a href="index.html" class="btn btn-primary">Browse Properties</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = properties.map(property => `
        <div class="property-card" style="
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: white;
            border-radius: 12px;
            margin-bottom: 1rem;
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
}

function renderDemoProperties(container) {
    const demoProperties = [
        {
            id: 1,
            title: 'Modern Villa with Pool',
            location: 'Malibu, California',
            price: '$750,000',
            images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400']
        },
        {
            id: 2,
            title: 'Luxury Downtown Apartment',
            location: 'New York, NY',
            price: '$3,500/month',
            images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400']
        }
    ];
    
    renderSavedProperties(container, demoProperties);
}

// ========== ADMIN DASHBOARD ==========
function initAdminDashboard() {
    console.log('Initializing admin dashboard');
    
    // Load admin stats
    loadAdminStats();
    
    // Load properties table
    loadPropertiesTable();
    
    // Load users table
    loadUsersTable();
    
    // Make first section active
    document.querySelector('.menu-item[data-section="overview"]')?.classList.add('active');
    document.getElementById('overviewSection')?.classList.add('active');
}

async function loadAdminStats() {
    try {
        const authToken = localStorage.getItem('authToken');
        
        const response = await fetch('https://andrews-villa-api.onrender.com/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Update admin stats
            updateStat('totalProperties', data.totalProperties || 0);
            updateStat('totalUsers', data.totalUsers || 0);
            updateStat('totalRevenue', data.totalRevenue ? `$${data.totalRevenue}` : '$0');
            updateStat('unreadMessages', data.unreadMessages || 0);
            
        } else {
            // Use demo admin stats
            updateStat('totalProperties', 24);
            updateStat('totalUsers', 156);
            updateStat('totalRevenue', '$245,800');
            updateStat('unreadMessages', 12);
        }
        
    } catch (error) {
        console.log('Using demo admin stats:', error);
        updateStat('totalProperties', 24);
        updateStat('totalUsers', 156);
        updateStat('totalRevenue', '$245,800');
        updateStat('unreadMessages', 12);
    }
}

async function loadPropertiesTable() {
    const tableBody = document.getElementById('propertiesTable');
    if (!tableBody) return;
    
    try {
        const authToken = localStorage.getItem('authToken');
        
        const response = await fetch('https://andrews-villa-api.onrender.com/api/admin/properties', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderPropertiesTable(tableBody, data.properties || []);
        } else {
            renderDemoPropertiesTable(tableBody);
        }
        
    } catch (error) {
        console.log('Using demo properties table:', error);
        renderDemoPropertiesTable(tableBody);
    }
}

function renderPropertiesTable(tableBody, properties) {
    if (!properties || properties.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-home" style="font-size: 2rem; color: #94a3b8; margin-bottom: 1rem;"></i>
                    <p>No properties found</p>
                    <button class="btn btn-primary" onclick="showAddPropertyModal()">
                        <i class="fas fa-plus"></i> Add First Property
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = properties.map(property => `
        <tr>
            <td><code>${property.id || 'N/A'}</code></td>
            <td>
                <strong>${property.title || 'Untitled'}</strong><br>
                <small>${property.location || 'No location'}</small>
            </td>
            <td>
                <span class="property-type">${property.type || 'house'}</span>
            </td>
            <td><strong>${property.price || '$0'}</strong></td>
            <td>
                <span class="status-badge status-${property.status || 'available'}">
                    ${property.status || 'Available'}
                </span>
            </td>
            <td>${property.created_at ? new Date(property.created_at).toLocaleDateString() : 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editProperty('${property.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteProperty('${property.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderDemoPropertiesTable(tableBody) {
    const demoProperties = [
        {
            id: 'prop_1',
            title: 'Modern Villa with Pool',
            type: 'house',
            price: '$750,000',
            status: 'available',
            location: 'Malibu, California',
            created_at: '2024-01-15'
        },
        {
            id: 'prop_2',
            title: 'Luxury Downtown Apartment',
            type: 'apartment',
            price: '$3,500/month',
            status: 'rented',
            location: 'New York, NY',
            created_at: '2024-01-10'
        }
    ];
    
    renderPropertiesTable(tableBody, demoProperties);
}

async function loadUsersTable() {
    const tableBody = document.getElementById('usersTable');
    if (!tableBody) return;
    
    try {
        const authToken = localStorage.getItem('authToken');
        
        const response = await fetch('https://andrews-villa-api.onrender.com/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderUsersTable(tableBody, data.users || []);
        } else {
            renderDemoUsersTable(tableBody);
        }
        
    } catch (error) {
        console.log('Using demo users table:', error);
        renderDemoUsersTable(tableBody);
    }
}

function renderUsersTable(tableBody, users) {
    if (!users || users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-users" style="font-size: 2rem; color: #94a3b8;"></i>
                    <p>No users found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = users.map(user => `
        <tr>
            <td><code>${user.id || 'N/A'}</code></td>
            <td>${user.first_name || ''} ${user.last_name || ''}</td>
            <td>${user.email || 'N/A'}</td>
            <td>
                <span class="status-badge ${user.role === 'admin' ? 'status-available' : 'status-rented'}">
                    ${user.role || 'client'}
                </span>
            </td>
            <td>
                <span class="status-badge ${user.is_active ? 'status-available' : 'status-sold'}">
                    ${user.is_active ? 'Active' : 'Suspended'}
                </span>
            </td>
            <td>${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editUser('${user.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderDemoUsersTable(tableBody) {
    const demoUsers = [
        {
            id: 'user_1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            role: 'client',
            is_active: true,
            created_at: '2024-01-15'
        },
        {
            id: 'user_2',
            first_name: 'Sarah',
            last_name: 'Smith',
            email: 'sarah@example.com',
            role: 'client',
            is_active: true,
            created_at: '2024-01-10'
        }
    ];
    
    renderUsersTable(tableBody, demoUsers);
}

// ========== DASHBOARD NAVIGATION ==========
function setupDashboardNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Remove active class from all sections
            document.querySelectorAll('.dashboard-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(`${sectionId}Section`);
            
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// ========== UTILITY FUNCTIONS ==========
function viewProperty(propertyId) {
    window.location.href = `property-listing.html?id=${propertyId}`;
}

function editProperty(propertyId) {
    alert(`Edit property ${propertyId} - This will be implemented`);
}

function deleteProperty(propertyId) {
    if (confirm(`Are you sure you want to delete property ${propertyId}?`)) {
        alert(`Property ${propertyId} deleted (demo)`);
    }
}

function editUser(userId) {
    alert(`Edit user ${userId} - This will be implemented`);
}

function showAddPropertyModal() {
    alert('Add property modal will open here');
}

// Make functions available globally
window.viewProperty = viewProperty;
window.editProperty = editProperty;
window.deleteProperty = deleteProperty;
window.editUser = editUser;
window.showAddPropertyModal = showAddPropertyModal;