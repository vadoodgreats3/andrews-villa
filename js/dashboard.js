// Dashboard Functionality for Andrews Villa
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialized');
    
    // Initialize dashboard components
    initDashboardNavigation();
    loadUserProfile();
    initProfileForm();
    initLogout();
    loadDashboardStats();
    
    // Check authentication
    checkAuthentication();
    
    // Initialize chat system if on chat page
    if (document.getElementById('chatSection')) {
        initChatSystem();
    }
    
    // Load saved properties
    loadSavedProperties();
});

function checkAuthentication() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // If admin tries to access client dashboard
    if (userRole === 'admin' && !window.location.href.includes('dashboard-admin')) {
        window.location.href = 'dashboard-admin.html';
    }
}

function initDashboardNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.dashboard-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all menu items and sections
            menuItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked menu item
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(`${sectionId}Section`);
            
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Load section-specific data
                switch(sectionId) {
                    case 'saved':
                        loadSavedProperties();
                        break;
                    case 'applications':
                        loadApplications();
                        break;
                    case 'payments':
                        loadPaymentHistory();
                        break;
                    case 'notifications':
                        loadNotifications();
                        break;
                    case 'documents':
                        loadDocuments();
                        break;
                }
            }
        });
    });
}

function loadUserProfile() {
    // Load user data from localStorage or API
    const userData = JSON.parse(localStorage.getItem('userData')) || {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, New York, NY'
    };
    
    // Update UI elements
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userAvatar = document.getElementById('userAvatar');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    
    if (userName) userName.textContent = `${userData.firstName} ${userData.lastName}`;
    if (userEmail) userEmail.textContent = userData.email;
    if (userAvatar) userAvatar.textContent = `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;
    
    // Update form inputs
    if (firstNameInput) firstNameInput.value = userData.firstName;
    if (lastNameInput) lastNameInput.value = userData.lastName;
    if (emailInput) emailInput.value = userData.email;
    if (phoneInput) phoneInput.value = userData.phone;
    if (addressInput) addressInput.value = userData.address;
}

function initProfileForm() {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;
    
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const userData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        };
        
        // Save to localStorage (will be replaced with API call in Phase 3)
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Update UI
        loadUserProfile();
        
        // Show success message
        showNotification('Profile updated successfully!', 'success');
    });
}

function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
}

function loadDashboardStats() {
    // Load statistics from localStorage or API
    const stats = JSON.parse(localStorage.getItem('dashboardStats')) || {
        savedCount: 3,
        applicationsCount: 2,
        paymentsCount: 5,
        messagesCount: 12
    };
    
    // Update UI
    const savedCount = document.getElementById('savedCount');
    const applicationsCount = document.getElementById('applicationsCount');
    const paymentsCount = document.getElementById('paymentsCount');
    const messagesCount = document.getElementById('messagesCount');
    
    if (savedCount) savedCount.textContent = stats.savedCount;
    if (applicationsCount) applicationsCount.textContent = stats.applicationsCount;
    if (paymentsCount) paymentsCount.textContent = stats.paymentsCount;
    if (messagesCount) messagesCount.textContent = stats.messagesCount;
}

function loadSavedProperties() {
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties')) || [
        {
            id: 1,
            title: 'Modern Villa with Pool',
            location: 'Malibu, California',
            price: '$750,000',
            type: 'house',
            image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400'
        },
        {
            id: 2,
            title: 'Luxury Downtown Apartment',
            location: 'New York, NY',
            price: '$3,500/month',
            type: 'apartment',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'
        },
        {
            id: 4,
            title: 'Waterfront Luxury Home',
            location: 'Miami, Florida',
            price: '$1,200,000',
            type: 'house',
            image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400'
        }
    ];
    
    const container = document.getElementById('savedProperties');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (savedProperties.length === 0) {
        container.innerHTML = `
            <div class="empty-state glass-card" style="text-align: center; padding: 3rem;">
                <i class="fas fa-bookmark" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                <h3>No Saved Properties</h3>
                <p>Properties you save will appear here.</p>
                <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-search"></i> Browse Properties
                </a>
            </div>
        `;
        return;
    }
    
    savedProperties.forEach(property => {
        const propertyCard = document.createElement('div');
        propertyCard.className = 'property-card glass-card';
        propertyCard.style.display = 'flex';
        propertyCard.style.alignItems = 'center';
        propertyCard.style.gap = '1rem';
        propertyCard.style.marginBottom = '1rem';
        
        propertyCard.innerHTML = `
            <img src="${property.image}" alt="${property.title}" 
                 style="width: 100px; height: 100px; border-radius: var(--radius-md); object-fit: cover;">
            <div style="flex: 1;">
                <h4 style="margin-bottom: 0.25rem;">${property.title}</h4>
                <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-map-marker-alt"></i> ${property.location}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="property-price">${property.price}</span>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-outline btn-sm btn-view-property" data-id="${property.id}">
                            View Details
                        </button>
                        <button class="btn btn-outline btn-sm btn-remove-saved" data-id="${property.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(propertyCard);
    });
    
    // Add event listeners
    document.querySelectorAll('.btn-view-property').forEach(btn => {
        btn.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            window.location.href = `property-listing.html?id=${propertyId}`;
        });
    });
    
    document.querySelectorAll('.btn-remove-saved').forEach(btn => {
        btn.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            removeSavedProperty(propertyId);
        });
    });
}

function removeSavedProperty(propertyId) {
    let savedProperties = JSON.parse(localStorage.getItem('savedProperties')) || [];
    savedProperties = savedProperties.filter(p => p.id != propertyId);
    localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
    loadSavedProperties();
    showNotification('Property removed from saved list', 'success');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-card);
        color: var(--text-primary);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        animation: slideIn 0.3s ease;
    `;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                 type === 'error' ? 'fas fa-exclamation-circle' : 
                 'fas fa-info-circle';
    
    notification.innerHTML = `
        <i class="${icon}" style="color: ${type === 'success' ? 'var(--primary-color)' : 'inherit'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Functions to be implemented in Phase 3
function loadApplications() {
    console.log('Loading applications...');
    // Will be implemented with backend API
}

function loadPaymentHistory() {
    console.log('Loading payment history...');
    // Will be implemented with backend API
}

function loadNotifications() {
    console.log('Loading notifications...');
    // Will be implemented with backend API
}

function loadDocuments() {
    console.log('Loading documents...');
    // Will be implemented with backend API
}