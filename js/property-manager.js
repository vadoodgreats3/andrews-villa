// Property Manager for Andrews Villa
document.addEventListener('DOMContentLoaded', function() {
    console.log('Property manager initialized');
    
    // Get property ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id') || '1';
    const isAdmin = urlParams.get('admin') === 'true';
    
    // Load property data
    loadProperty(propertyId, isAdmin);
    
    // Initialize event listeners
    initPropertyInteractions();
    initBookingForm();
});

function loadProperty(propertyId, isAdmin = false) {
    let properties = [];
    
    if (isAdmin) {
        properties = JSON.parse(localStorage.getItem('adminProperties') || '[]');
    } else {
        properties = [
            {
                id: '1',
                title: 'Modern Villa with Pool',
                type: 'house',
                price: '$750,000',
                status: 'available',
                location: 'Malibu, California',
                description: 'Stunning modern villa with panoramic ocean views, infinity pool, and state-of-the-art amenities. This luxurious property features an open floor plan, floor-to-ceiling windows, and direct beach access.',
                images: [
                    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
                    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800',
                    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
                ],
                beds: 4,
                baths: 3,
                sqft: 3200,
                features: ['Ocean View', 'Swimming Pool', 'Garage', 'Garden', 'Security System'],
                listedDate: '2024-01-15'
            },
            {
                id: '2',
                title: 'Luxury Downtown Apartment',
                type: 'apartment',
                price: '$3,500/month',
                status: 'rented',
                location: 'New York, NY',
                description: 'Premium downtown apartment with luxury finishes and stunning city views. Features high-end appliances, concierge service, and access to rooftop terrace.',
                images: [
                    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200',
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
                    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800'
                ],
                beds: 2,
                baths: 2,
                sqft: 1200,
                features: ['City View', 'Concierge', 'Gym', 'Rooftop', 'Pet Friendly'],
                listedDate: '2024-01-10'
            },
            {
                id: '3',
                title: 'Premium Mountain Lodge',
                type: 'hotel',
                price: '$1,200/night',
                status: 'available',
                location: 'Aspen, Colorado',
                description: 'Luxury mountain lodge with ski-in/ski-out access, fireplace, and premium amenities. Perfect for vacation rentals or corporate retreats.',
                images: [
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
                    'https://images.unsplash.com/photo-1564501049418-3c27787d01e8?w=800',
                    'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800'
                ],
                beds: 3,
                baths: 3,
                sqft: 2500,
                features: ['Ski Access', 'Fireplace', 'Hot Tub', 'Mountain View', 'Kitchen'],
                listedDate: '2024-01-05'
            }
        ];
    }
    
    const property = properties.find(p => p.id === propertyId || p.id === `prop_${propertyId}`) || properties[0];
    
    // Update page with property data
    updatePropertyUI(property);
}

function updatePropertyUI(property) {
    // Update basic info
    document.getElementById('propertyTitle').textContent = property.title;
    document.getElementById('propertyLocation').textContent = property.location;
    document.getElementById('propertyType').textContent = property.type.charAt(0).toUpperCase() + property.type.slice(1);
    document.getElementById('propertyPrice').textContent = property.price;
    document.getElementById('propertyDate').textContent = new Date(property.listedDate).toLocaleDateString();
    
    // Update status
    const statusElement = document.getElementById('propertyStatus');
    statusElement.textContent = property.status.charAt(0).toUpperCase() + property.status.slice(1);
    statusElement.className = `status-badge status-${property.status}`;
    
    // Update price period based on type
    const pricePeriod = document.getElementById('pricePeriod');
    if (property.type === 'hotel') {
        pricePeriod.textContent = 'Per Night';
    } else if (property.type === 'apartment') {
        pricePeriod.textContent = 'Per Month';
    } else {
        pricePeriod.textContent = 'For Sale';
    }
    
    // Update description
    const descElement = document.getElementById('propertyDescription');
    if (descElement) {
        descElement.querySelector('p').textContent = property.description;
    }
    
    // Update images
    updateGallery(property.images || []);
    
    // Update details grid
    updateDetailsGrid(property);
}

function updateGallery(images) {
    const mainImage = document.getElementById('currentImage');
    const thumbnailsContainer = document.getElementById('galleryThumbnails');
    
    if (images.length > 0 && mainImage) {
        mainImage.src = images[0];
    }
    
    if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = '';
        
        images.forEach((img, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'gallery-thumb' + (index === 0 ? ' active' : '');
            thumb.innerHTML = `<img src="${img}" alt="Thumbnail ${index + 1}">`;
            
            thumb.addEventListener('click', function() {
                // Update main image
                mainImage.src = img;
                
                // Update active thumbnail
                document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
            
            thumbnailsContainer.appendChild(thumb);
        });
    }
}

function updateDetailsGrid(property) {
    const grid = document.getElementById('propertyDetails');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const details = [
        { icon: 'fa-bed', label: 'Bedrooms', value: property.beds },
        { icon: 'fa-bath', label: 'Bathrooms', value: property.baths },
        { icon: 'fa-ruler-combined', label: 'Square Feet', value: property.sqft?.toLocaleString() },
        { icon: 'fa-building', label: 'Property Type', value: property.type.charAt(0).toUpperCase() + property.type.slice(1) },
        { icon: 'fa-calendar', label: 'Year Built', value: '2020' },
        { icon: 'fa-car', label: 'Parking', value: property.type === 'house' ? '3 cars' : '1 car' }
    ];
    
    details.forEach(detail => {
        const item = document.createElement('div');
        item.className = 'detail-item';
        item.innerHTML = `
            <div class="detail-icon">
                <i class="fas ${detail.icon}"></i>
            </div>
            <div>
                <div style="font-weight: 600; color: var(--text-primary);">${detail.value}</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">${detail.label}</div>
            </div>
        `;
        grid.appendChild(item);
    });
}

function initPropertyInteractions() {
    // Book Now button
    const bookBtn = document.getElementById('bookNowBtn');
    if (bookBtn) {
        bookBtn.addEventListener('click', function() {
            const bookingForm = document.getElementById('bookingForm');
            bookingForm.style.display = 'block';
            
            // Scroll to booking form
            bookingForm.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Contact Agent button
    const contactBtn = document.getElementById('contactAgentBtn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function() {
            // Check if user is logged in
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            
            if (isLoggedIn) {
                // Redirect to chat in dashboard
                window.location.href = 'dashboard-client.html#chat';
            } else {
                // Redirect to login
                window.location.href = 'login.html?redirect=contact';
            }
        });
    }
    
    // Save Property button
    const saveBtn = document.getElementById('savePropertyBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const propertyId = new URLSearchParams(window.location.search).get('id') || '1';
            const propertyTitle = document.getElementById('propertyTitle').textContent;
            const propertyLocation = document.getElementById('propertyLocation').textContent;
            const propertyPrice = document.getElementById('propertyPrice').textContent;
            const propertyType = document.getElementById('propertyType').textContent.toLowerCase();
            
            // Get current image
            const mainImage = document.getElementById('currentImage');
            const propertyImage = mainImage ? mainImage.src : 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400';
            
            // Get saved properties from localStorage
            let savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
            
            // Check if already saved
            if (savedProperties.some(p => p.id === propertyId)) {
                alert('This property is already in your saved list!');
                return;
            }
            
            // Add to saved
            savedProperties.push({
                id: propertyId,
                title: propertyTitle,
                location: propertyLocation,
                price: propertyPrice,
                type: propertyType,
                image: propertyImage
            });
            
            localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
            
            // Update button text
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            saveBtn.disabled = true;
            
            setTimeout(() => {
                saveBtn.innerHTML = '<i class="fas fa-bookmark"></i> Save Property';
                saveBtn.disabled = false;
            }, 2000);
        });
    }
}

function initBookingForm() {
    const bookingForm = document.getElementById('bookingFormContent');
    const cancelBtn = document.getElementById('cancelBooking');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check if user is logged in
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            
            if (!isLoggedIn) {
                alert('Please login to make a booking');
                window.location.href = 'login.html?redirect=booking';
                return;
            }
            
            // Get form data
            const bookingType = document.getElementById('bookingType').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            const specialRequests = document.getElementById('specialRequests').value;
            
            // Simulate booking process
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Save booking to localStorage
                const booking = {
                    id: 'booking_' + Date.now(),
                    propertyId: new URLSearchParams(window.location.search).get('id') || '1',
                    propertyTitle: document.getElementById('propertyTitle').textContent,
                    type: bookingType,
                    startDate: startDate,
                    endDate: endDate,
                    paymentMethod: paymentMethod,
                    specialRequests: specialRequests,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                
                let bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
                bookings.push(booking);
                localStorage.setItem('userBookings', JSON.stringify(bookings));
                
                // Show success message
                alert('Booking request submitted successfully! Our team will contact you shortly.');
                
                // Reset form
                bookingForm.reset();
                document.getElementById('bookingForm').style.display = 'none';
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Redirect to dashboard
                window.location.href = 'dashboard-client.html#applications';
                
            }, 2000);
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            document.getElementById('bookingForm').style.display = 'none';
        });
    }
    
    // Update estimated total when dates change
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const bookingTypeSelect = document.getElementById('bookingType');
    
    if (startDateInput) {
        startDateInput.addEventListener('change', updateEstimatedTotal);
    }
    
    if (endDateInput) {
        endDateInput.addEventListener('change', updateEstimatedTotal);
    }
    
    if (bookingTypeSelect) {
        bookingTypeSelect.addEventListener('change', updateEstimatedTotal);
    }
}

function updateEstimatedTotal() {
    const priceElement = document.getElementById('propertyPrice');
    const totalElement = document.getElementById('estimatedTotal');
    const bookingType = document.getElementById('bookingType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!priceElement || !totalElement) return;
    
    // Parse price
    const priceText = priceElement.textContent;
    const basePrice = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 750000;
    
    let estimatedTotal = basePrice;
    
    // Calculate based on booking type
    if (bookingType === 'hotel' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const nights = Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        estimatedTotal = basePrice * nights;
    } else if (bookingType === 'rent') {
        // Security deposit (typically 1-2 months rent)
        estimatedTotal = basePrice * 1.5;
    } else if (bookingType === 'viewing') {
        // Viewing fee (if any)
        estimatedTotal = 0; // Free viewing
    }
    
    // Add fees
    const fees = estimatedTotal * 0.05; // 5% service fee
    estimatedTotal += fees;
    
    totalElement.textContent = `$${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}