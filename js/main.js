// Main JavaScript for Andrews Villa

document.addEventListener('DOMContentLoaded', function() {
    console.log('Andrews Villa Platform Initialized');
    
    // Initialize components
    initPropertyCards();
    initSearchFunctionality();
    initMobileMenu();
    loadDynamicContent();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.property-card, .service-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // Initialize search tabs
    const searchTabs = document.querySelectorAll('.search-tab');
    searchTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            searchTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Update search placeholder based on selected tab
            const searchInput = document.querySelector('.search-input input[type="text"]');
            const tabText = this.textContent.trim();
            
            if (tabText === 'Buy') {
                searchInput.placeholder = 'Enter location to buy properties...';
            } else if (tabText === 'Rent') {
                searchInput.placeholder = 'Enter location to rent properties...';
            } else if (tabText === 'Hotels') {
                searchInput.placeholder = 'Enter destination for hotel lodges...';
            }
        });
    });
    
    // Form validation for search
    const searchForm = document.querySelector('.search-fields');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const locationInput = this.querySelector('input[type="text"]');
            if (!locationInput.value.trim()) {
                locationInput.focus();
                locationInput.style.borderColor = '#ff4757';
                setTimeout(() => {
                    locationInput.style.borderColor = '';
                }, 2000);
                return;
            }
            
            // Simulate search process
            const searchBtn = this.querySelector('.btn-search');
            const originalText = searchBtn.innerHTML;
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
            searchBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                searchBtn.innerHTML = originalText;
                searchBtn.disabled = false;
                alert('Search functionality will be fully implemented in Phase 3 with backend integration.');
            }, 1500);
        });
    }
    
    // Load Instagram handle from localStorage or default
    const instagramHandle = localStorage.getItem('instagramHandle') || '@andrewsvilla';
    const instagramLink = document.getElementById('instagramLink');
    const instagramSpan = document.getElementById('instagramHandle');
    
    if (instagramSpan) {
        instagramSpan.textContent = instagramHandle;
    }
    
    if (instagramLink) {
        instagramLink.href = `https://instagram.com/${instagramHandle.replace('@', '')}`;
        instagramLink.target = '_blank';
        instagramLink.rel = 'noopener noreferrer';
    }
    
    // Load company contact info
    const companyEmail = localStorage.getItem('companyEmail') || 'contact@andrewsvilla.com';
    const companyPhone = localStorage.getItem('companyPhone') || '+1 (555) 123-4567';
    
    const emailElement = document.getElementById('companyEmail');
    const phoneElement = document.getElementById('companyPhone');
    
    if (emailElement) emailElement.textContent = companyEmail;
    if (phoneElement) phoneElement.textContent = companyPhone;
});

function initPropertyCards() {
    // Sample property data - will be replaced with API call in Phase 3
    const properties = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600',
            price: '$750,000',
            type: 'house',
            title: 'Modern Villa with Pool',
            location: 'Malibu, California',
            beds: 4,
            baths: 3,
            sqft: '3,200',
            status: 'available'
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w-600',
            price: '$3,500/month',
            type: 'apartment',
            title: 'Luxury Downtown Apartment',
            location: 'New York, NY',
            beds: 2,
            baths: 2,
            sqft: '1,200',
            status: 'rented'
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w-600',
            price: '$1,200/night',
            type: 'hotel',
            title: 'Premium Mountain Lodge',
            location: 'Aspen, Colorado',
            beds: 3,
            baths: 3,
            sqft: '2,500',
            status: 'available'
        },
        {
            id: 4,
            image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w-600',
            price: '$1,200,000',
            type: 'house',
            title: 'Waterfront Luxury Home',
            location: 'Miami, Florida',
            beds: 5,
            baths: 4,
            sqft: '4,500',
            status: 'available'
        }
    ];
    
    const propertiesGrid = document.querySelector('.properties-grid');
    if (!propertiesGrid) return;
    
    // Clear existing content
    propertiesGrid.innerHTML = '';
    
    // Generate property cards
    properties.forEach(property => {
        const propertyCard = document.createElement('div');
        propertyCard.className = 'property-card glass-card';
        propertyCard.innerHTML = `
            <div class="property-image">
                <img src="${property.image}" alt="${property.title}" loading="lazy">
                <div class="property-status">${property.status}</div>
            </div>
            <div class="property-content">
                <div class="property-header">
                    <div class="property-price">${property.price}</div>
                    <span class="property-type">${property.type}</span>
                </div>
                <h3 class="property-title">${property.title}</h3>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${property.location}</span>
                </div>
                <div class="property-features">
                    <div class="feature">
                        <i class="fas fa-bed"></i>
                        <span>${property.beds} Beds</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-bath"></i>
                        <span>${property.baths} Baths</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-ruler-combined"></i>
                        <span>${property.sqft} sqft</span>
                    </div>
                </div>
                <div class="property-actions">
                    <button class="btn btn-outline btn-view" data-id="${property.id}">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-primary btn-contact" data-id="${property.id}">
                        <i class="fas fa-comment"></i> Contact
                    </button>
                </div>
            </div>
        `;
        
        propertiesGrid.appendChild(propertyCard);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.btn-view').forEach(button => {
        button.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            window.location.href = `property-listing.html?id=${propertyId}`;
        });
    });
    
    document.querySelectorAll('.btn-contact').forEach(button => {
        button.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-id');
            alert(`Contact form for property #${propertyId} - This will open chat system in Phase 3`);
        });
    });
}

function initSearchFunctionality() {
    const searchBtn = document.querySelector('.btn-search');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchInput = document.querySelector('.search-input input[type="text"]');
            const propertyType = document.querySelector('.search-input select');
            const maxPrice = document.querySelector('.search-input input[type="number"]');
            
            console.log('Search initiated:', {
                location: searchInput.value,
                type: propertyType.value,
                maxPrice: maxPrice.value
            });
            
            // Show loading state
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
            this.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-search"></i> Search';
                this.disabled = false;
                
                // Show search results
                alert(`Search results for: ${searchInput.value || 'All locations'}, Type: ${propertyType.value || 'Any'}, Max Price: $${maxPrice.value || 'Any'}`);
            }, 2000);
        });
    }
}

function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '100%';
            navMenu.style.left = '0';
            navMenu.style.right = '0';
            navMenu.style.background = 'var(--bg-primary)';
            navMenu.style.padding = '1rem';
            navMenu.style.boxShadow = 'var(--shadow-md)';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.nav-container')) {
                navMenu.style.display = 'none';
            }
        });
    }
}

function loadDynamicContent() {
    // This function will be expanded in Phase 3 to load real data from APIs
    console.log('Loading dynamic content...');
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    // Update navigation based on login status
    const loginBtn = document.querySelector('a[href="login.html"]');
    const dashboardBtn = document.querySelector('a[href="dashboard-client.html"]');
    
    if (isLoggedIn) {
        if (loginBtn) {
            loginBtn.textContent = 'Logout';
            loginBtn.href = '#';
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.clear();
                window.location.reload();
            });
        }
        
        if (dashboardBtn) {
            if (userRole === 'admin') {
                dashboardBtn.href = 'dashboard-admin.html';
                dashboardBtn.textContent = 'Admin Dashboard';
            }
        }
    }
}