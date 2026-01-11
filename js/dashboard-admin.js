// Admin Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard initialized');
    
    // Check admin authentication
    checkAdminAuth();
    
    // Initialize components
    initAdminNavigation();
    initAdminStats();
    initPropertyManagement();
    initUserManagement();
    initModals();
    initLogout();
    
    // Load initial data
    loadProperties();
    loadUsers();
    loadRecentActivity();
    
    // Setup event listeners
    document.getElementById('refreshActivity')?.addEventListener('click', loadRecentActivity);
    document.getElementById('addPropertyBtn')?.addEventListener('click', showAddPropertyModal);
    document.getElementById('userSearch')?.addEventListener('input', searchUsers);
});

function checkAdminAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    if (!isLoggedIn || userRole !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
}

function initAdminNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    const sections = document.querySelectorAll('.dashboard-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all
            menuItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active to clicked item
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(`${sectionId}Section`);
            
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Load section data
                switch(sectionId) {
                    case 'properties':
                        loadProperties();
                        break;
                    case 'users':
                        loadUsers();
                        break;
                    case 'transactions':
                        loadTransactions();
                        break;
                    case 'messages':
                        loadMessages();
                        break;
                    case 'company':
                        loadCompanySettings();
                        break;
                    case 'payment':
                        loadPaymentMethods();
                        break;
                    case 'system':
                        loadSystemControls();
                        break;
                    case 'analytics':
                        loadAnalytics();
                        break;
                }
            }
        });
    });
}

function initAdminStats() {
    // Load stats from localStorage or API
    const stats = JSON.parse(localStorage.getItem('adminStats')) || {
        totalProperties: 24,
        totalUsers: 156,
        totalRevenue: 245800,
        unreadMessages: 12
    };
    
    // Update UI
    const elements = ['totalProperties', 'totalUsers', 'totalRevenue', 'unreadMessages'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = id === 'totalRevenue' ? `$${stats[id].toLocaleString()}` : stats[id];
        }
    });
}

function initPropertyManagement() {
    console.log('Property management initialized');
}

function initUserManagement() {
    console.log('User management initialized');
}

function initModals() {
    const modal = document.getElementById('propertyModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Save property form
    const saveBtn = document.getElementById('saveProperty');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveProperty);
    }
}

function showAddPropertyModal() {
    const modal = document.getElementById('propertyModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('propertyForm');
    
    // Reset form
    form.reset();
    
    // Set modal title
    modalTitle.textContent = 'Add New Property';
    
    // Show modal
    modal.classList.add('active');
}

function saveProperty() {
    const form = document.getElementById('propertyForm');
    const formData = {
        id: 'prop_' + Date.now(),
        title: document.getElementById('propertyTitle').value,
        type: document.getElementById('propertyType').value,
        price: document.getElementById('propertyPrice').value,
        status: document.getElementById('propertyStatus').value,
        location: document.getElementById('propertyLocation').value,
        description: document.getElementById('propertyDescription').value,
        images: document.getElementById('propertyImages').value.split('\n').filter(url => url.trim()),
        beds: parseInt(document.getElementById('propertyBeds').value) || 3,
        baths: parseInt(document.getElementById('propertyBaths').value) || 2,
        sqft: parseInt(document.getElementById('propertySqft').value) || 2000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Validate required fields
    if (!formData.title || !formData.price || !formData.location) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Save to localStorage (will be API in Phase 3)
    let properties = JSON.parse(localStorage.getItem('adminProperties') || '[]');
    properties.push(formData);
    localStorage.setItem('adminProperties', JSON.stringify(properties));
    
    // Close modal
    document.getElementById('propertyModal').classList.remove('active');
    
    // Reload properties table
    loadProperties();
    
    // Show success message
    alert('Property added successfully!');
}

function loadProperties() {
    let properties = JSON.parse(localStorage.getItem('adminProperties') || '[]');
    
    // If no properties in admin storage, use demo data
    if (properties.length === 0) {
        properties = [
            {
                id: 'prop_1',
                title: 'Modern Villa with Pool',
                type: 'house',
                price: '$750,000',
                status: 'available',
                location: 'Malibu, California',
                createdAt: '2024-01-15',
                beds: 4,
                baths: 3,
                sqft: 3200
            },
            {
                id: 'prop_2',
                title: 'Luxury Downtown Apartment',
                type: 'apartment',
                price: '$3,500/month',
                status: 'rented',
                location: 'New York, NY',
                createdAt: '2024-01-10',
                beds: 2,
                baths: 2,
                sqft: 1200
            },
            {
                id: 'prop_3',
                title: 'Premium Mountain Lodge',
                type: 'hotel',
                price: '$1,200/night',
                status: 'available',
                location: 'Aspen, Colorado',
                createdAt: '2024-01-05',
                beds: 3,
                baths: 3,
                sqft: 2500
            },
            {
                id: 'prop_4',
                title: 'Waterfront Luxury Home',
                type: 'house',
                price: '$1,200,000',
                status: 'sold',
                location: 'Miami, Florida',
                createdAt: '2024-01-01',
                beds: 5,
                baths: 4,
                sqft: 4500
            }
        ];
        localStorage.setItem('adminProperties', JSON.stringify(properties));
    }
    
    const tableBody = document.getElementById('propertiesTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    properties.forEach(property => {
        const row = document.createElement('tr');
        
        // Format status badge
        let statusClass = 'status-available';
        let statusText = 'Available';
        
        if (property.status === 'sold') {
            statusClass = 'status-sold';
            statusText = 'Sold';
        } else if (property.status === 'rented') {
            statusClass = 'status-rented';
            statusText = 'Rented';
        } else if (property.status === 'unavailable') {
            statusClass = 'status-unavailable';
            statusText = 'Unavailable';
        }
        
        row.innerHTML = `
            <td><code>${property.id}</code></td>
            <td>
                <strong>${property.title}</strong><br>
                <small class="text-secondary">${property.location}</small>
            </td>
            <td>
                <span class="property-type">${property.type}</span>
            </td>
            <td><strong>${property.price}</strong></td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td>${new Date(property.createdAt).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" data-id="${property.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" data-id="${property.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon btn-view" data-id="${property.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            editProperty(propertyId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this property?')) {
                deleteProperty(propertyId);
            }
        });
    });
    
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            window.location.href = `property-listing.html?id=${propertyId}&admin=true`;
        });
    });
}

function editProperty(propertyId) {
    const properties = JSON.parse(localStorage.getItem('adminProperties') || '[]');
    const property = properties.find(p => p.id === propertyId);
    
    if (!property) {
        alert('Property not found');
        return;
    }
    
    const modal = document.getElementById('propertyModal');
    const modalTitle = document.getElementById('modalTitle');
    
    // Set modal title
    modalTitle.textContent = 'Edit Property';
    
    // Fill form with property data
    document.getElementById('propertyTitle').value = property.title;
    document.getElementById('propertyType').value = property.type;
    document.getElementById('propertyPrice').value = property.price.replace(/[^0-9.]/g, '');
    document.getElementById('propertyStatus').value = property.status;
    document.getElementById('propertyLocation').value = property.location;
    document.getElementById('propertyDescription').value = property.description || '';
    document.getElementById('propertyImages').value = (property.images || []).join('\n');
    document.getElementById('propertyBeds').value = property.beds || 3;
    document.getElementById('propertyBaths').value = property.baths || 2;
    document.getElementById('propertySqft').value = property.sqft || 2000;
    
    // Store property ID for update
    modal.setAttribute('data-edit-id', propertyId);
    
    // Show modal
    modal.classList.add('active');
    
    // Update save button to edit mode
    const saveBtn = document.getElementById('saveProperty');
    saveBtn.textContent = 'Update Property';
    saveBtn.onclick = updateProperty;
}

function updateProperty() {
    const propertyId = document.getElementById('propertyModal').getAttribute('data-edit-id');
    let properties = JSON.parse(localStorage.getItem('adminProperties') || '[]');
    const index = properties.findIndex(p => p.id === propertyId);
    
    if (index === -1) {
        alert('Property not found');
        return;
    }
    
    // Update property
    properties[index] = {
        ...properties[index],
        title: document.getElementById('propertyTitle').value,
        type: document.getElementById('propertyType').value,
        price: document.getElementById('propertyPrice').value,
        status: document.getElementById('propertyStatus').value,
        location: document.getElementById('propertyLocation').value,
        description: document.getElementById('propertyDescription').value,
        images: document.getElementById('propertyImages').value.split('\n').filter(url => url.trim()),
        beds: parseInt(document.getElementById('propertyBeds').value) || 3,
        baths: parseInt(document.getElementById('propertyBaths').value) || 2,
        sqft: parseInt(document.getElementById('propertySqft').value) || 2000,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('adminProperties', JSON.stringify(properties));
    
    // Close modal
    document.getElementById('propertyModal').classList.remove('active');
    
    // Reload properties
    loadProperties();
    
    // Show success message
    alert('Property updated successfully!');
}

function deleteProperty(propertyId) {
    let properties = JSON.parse(localStorage.getItem('adminProperties') || '[]');
    properties = properties.filter(p => p.id !== propertyId);
    localStorage.setItem('adminProperties', JSON.stringify(properties));
    loadProperties();
}

function loadUsers() {
    const users = [
        {
            id: 'user_1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'client',
            status: 'active',
            joined: '2024-01-15'
        },
        {
            id: 'user_2',
            name: 'Sarah Smith',
            email: 'sarah@example.com',
            role: 'client',
            status: 'active',
            joined: '2024-01-10'
        },
        {
            id: 'user_3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            role: 'client',
            status: 'suspended',
            joined: '2024-01-05'
        },
        {
            id: 'user_4',
            name: 'Admin Corner',
            email: 'corner@andrewsvilla.com',
            role: 'admin',
            status: 'active',
            joined: '2024-01-01'
        }
    ];
    
    const tableBody = document.getElementById('usersTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><code>${user.id}</code></td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <span class="status-badge ${user.role === 'admin' ? 'status-available' : 'status-rented'}">
                    ${user.role}
                </span>
            </td>
            <td>
                <span class="status-badge ${user.status === 'active' ? 'status-available' : 'status-sold'}">
                    ${user.status}
                </span>
            </td>
            <td>${new Date(user.joined).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editUser('${user.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="toggleUserStatus('${user.id}', '${user.status}')">
                        <i class="fas ${user.status === 'active' ? 'fa-lock' : 'fa-unlock'}"></i>
                    </button>
                    <button class="btn-icon" onclick="resetUserPassword('${user.id}')">
                        <i class="fas fa-key"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#usersTable tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function loadRecentActivity() {
    const activities = [
        {
            id: 1,
            type: 'property',
            action: 'added',
            target: 'Modern Villa with Pool',
            user: 'Admin Corner',
            time: '10 minutes ago'
        },
        {
            id: 2,
            type: 'user',
            action: 'registered',
            target: 'John Doe',
            user: 'System',
            time: '1 hour ago'
        },
        {
            id: 3,
            type: 'payment',
            action: 'completed',
            target: '$3,500 rental deposit',
            user: 'Sarah Smith',
            time: '2 hours ago'
        },
        {
            id: 4,
            type: 'message',
            action: 'sent',
            target: 'Inquiry about Malibu property',
            user: 'Mike Johnson',
            time: '3 hours ago'
        },
        {
            id: 5,
            type: 'property',
            action: 'updated',
            target: 'Waterfront Luxury Home',
            user: 'Admin Corner',
            time: '5 hours ago'
        }
    ];
    
    const container = document.getElementById('activityList');
    if (!container) return;
    
    container.innerHTML = '';
    
    activities.forEach(activity => {
        const activityEl = document.createElement('div');
        activityEl.className = 'activity-item';
        activityEl.style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
        `;
        
        // Icon based on activity type
        let icon = 'fa-home';
        let iconColor = '#4361ee';
        
        switch(activity.type) {
            case 'user': icon = 'fa-user'; iconColor = '#7209b7'; break;
            case 'payment': icon = 'fa-credit-card'; iconColor = '#2ecc71'; break;
            case 'message': icon = 'fa-comment'; iconColor = '#4cc9f0'; break;
        }
        
        activityEl.innerHTML = `
            <div class="activity-icon" style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: ${iconColor}20;
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${iconColor};
            ">
                <i class="fas ${icon}"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 500; color: var(--text-primary);">
                    ${activity.user} ${activity.action} ${activity.target}
                </div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">
                    ${activity.time}
                </div>
            </div>
        `;
        
        container.appendChild(activityEl);
    });
}

function editUser(userId) {
    alert(`Edit user ${userId} - This feature will be fully implemented in Phase 3`);
}

function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'suspend'} this user?`)) {
        alert(`User ${userId} status changed to ${newStatus}`);
        loadUsers(); // Reload to reflect changes
    }
}

function resetUserPassword(userId) {
    const tempPassword = generateTempPassword();
    if (confirm(`Reset password for user ${userId}? Temporary password: ${tempPassword}`)) {
        alert(`Password reset successful. Temporary password: ${tempPassword}\nUser will be forced to change it on next login.`);
    }
}

function generateTempPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function loadTransactions() {
    console.log('Loading transactions...');
    // To be implemented in Phase 3
}

function loadMessages() {
    console.log('Loading messages...');
    // To be implemented in Phase 3
}

function loadCompanySettings() {
    console.log('Loading company settings...');
    // To be implemented in Phase 3
}

function loadPaymentMethods() {
    console.log('Loading payment methods...');
    // To be implemented in Phase 3
}

function loadSystemControls() {
    console.log('Loading system controls...');
    // To be implemented in Phase 3
}

function loadAnalytics() {
    console.log('Loading analytics...');
    // To be implemented in Phase 3
}

function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }
}