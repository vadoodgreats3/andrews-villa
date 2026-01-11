// ============================================
// Andrews Villa - Production Backend Server
// ============================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(cors({
    origin: ['http://localhost:8080', 'https://andrews-villa.onrender.com'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== DATABASE CONFIG ==========
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect()
    .then(() => console.log('✅ PostgreSQL Database Connected'))
    .catch(err => console.error('❌ Database Connection Error:', err));

// ========== CLOUDINARY CONFIG ==========
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ========== AUTH MIDDLEWARE ==========
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access token required' });
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// ========== AUTHENTICATION ROUTES ==========

// User Registration
app.post('/api/auth/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { email, password, firstName, lastName, phone } = req.body;
        
        // Check if user exists
        const userExists = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // Create user
        const newUser = await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, phone, role) 
             VALUES ($1, $2, $3, $4, $5, 'client') 
             RETURNING id, email, first_name, last_name, role`,
            [email, passwordHash, firstName, lastName, phone || null]
        );
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: newUser.rows[0].id, 
                email: newUser.rows[0].email,
                role: newUser.rows[0].role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: newUser.rows[0].id,
                email: newUser.rows[0].email,
                firstName: newUser.rows[0].first_name,
                lastName: newUser.rows[0].last_name,
                role: newUser.rows[0].role
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const userResult = await pool.query(
            `SELECT id, email, password_hash, first_name, last_name, role, is_active 
             FROM users WHERE email = $1`,
            [email]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = userResult.rows[0];
        
        // Check if account is active
        if (!user.is_active) {
            return res.status(403).json({ error: 'Account is suspended' });
        }
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// ========== USER PROFILE ROUTES ==========

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const userResult = await pool.query(
            `SELECT id, email, first_name, last_name, phone, address, 
                    created_at, updated_at, role 
             FROM users WHERE id = $1`,
            [req.user.id]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user: userResult.rows[0] });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, phone, address } = req.body;
        
        const updateResult = await pool.query(
            `UPDATE users 
             SET first_name = $1, last_name = $2, phone = $3, address = $4, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $5 
             RETURNING id, email, first_name, last_name, phone, address`,
            [firstName, lastName, phone, address, req.user.id]
        );
        
        res.json({
            message: 'Profile updated successfully',
            user: updateResult.rows[0]
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== PROPERTY ROUTES ==========

// Get all properties (public)
app.get('/api/properties', async (req, res) => {
    try {
        const { type, minPrice, maxPrice, location, status } = req.query;
        
        let query = `
            SELECT p.*, 
                   array_agg(pi.image_url) as images,
                   COUNT(DISTINCT sp.user_id) as saved_count
            FROM properties p
            LEFT JOIN property_images pi ON p.id = pi.property_id
            LEFT JOIN saved_properties sp ON p.id = sp.property_id
            WHERE p.is_active = true
        `;
        
        const params = [];
        let paramCount = 1;
        
        if (type) {
            query += ` AND p.type = $${paramCount}`;
            params.push(type);
            paramCount++;
        }
        
        if (status) {
            query += ` AND p.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }
        
        if (minPrice) {
            query += ` AND p.price >= $${paramCount}`;
            params.push(minPrice);
            paramCount++;
        }
        
        if (maxPrice) {
            query += ` AND p.price <= $${paramCount}`;
            params.push(maxPrice);
            paramCount++;
        }
        
        if (location) {
            query += ` AND p.location ILIKE $${paramCount}`;
            params.push(`%${location}%`);
            paramCount++;
        }
        
        query += ` GROUP BY p.id ORDER BY p.created_at DESC`;
        
        const result = await pool.query(query, params);
        res.json({ properties: result.rows });
    } catch (error) {
        console.error('Properties fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single property
app.get('/api/properties/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, 
                    array_agg(pi.image_url) as images
             FROM properties p
             LEFT JOIN property_images pi ON p.id = pi.property_id
             WHERE p.id = $1 AND p.is_active = true
             GROUP BY p.id`,
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        res.json({ property: result.rows[0] });
    } catch (error) {
        console.error('Property fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Create property
app.post('/api/admin/properties', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, description, type, price, location, beds, baths, sqft, amenities, status, images } = req.body;
        
        const propertyResult = await pool.query(
            `INSERT INTO properties 
             (title, description, type, price, location, beds, baths, sqft, amenities, status, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
             RETURNING *`,
            [title, description, type, price, location, beds, baths, sqft, amenities, status, req.user.id]
        );
        
        const propertyId = propertyResult.rows[0].id;
        
        // Insert images
        if (images && images.length > 0) {
            for (const imageUrl of images) {
                await pool.query(
                    'INSERT INTO property_images (property_id, image_url) VALUES ($1, $2)',
                    [propertyId, imageUrl]
                );
            }
        }
        
        res.status(201).json({
            message: 'Property created successfully',
            property: propertyResult.rows[0]
        });
    } catch (error) {
        console.error('Property creation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== DASHBOARD ROUTES ==========

// Get user dashboard stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get saved properties count
        const savedCount = await pool.query(
            'SELECT COUNT(*) FROM saved_properties WHERE user_id = $1',
            [userId]
        );
        
        // Get bookings count
        const bookingsCount = await pool.query(
            'SELECT COUNT(*) FROM bookings WHERE user_id = $1 AND status IN ($2, $3)',
            [userId, 'pending', 'confirmed']
        );
        
        // Get payments count
        const paymentsCount = await pool.query(
            'SELECT COUNT(*) FROM payments WHERE user_id = $1',
            [userId]
        );
        
        // Get unread messages count
        const messagesCount = await pool.query(
            `SELECT COUNT(*) FROM messages 
             WHERE recipient_id = $1 AND read_at IS NULL AND sender_role = 'admin'`,
            [userId]
        );
        
        res.json({
            savedCount: parseInt(savedCount.rows[0].count),
            bookingsCount: parseInt(bookingsCount.rows[0].count),
            paymentsCount: parseInt(paymentsCount.rows[0].count),
            messagesCount: parseInt(messagesCount.rows[0].count)
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get saved properties for user
app.get('/api/dashboard/saved-properties', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, array_agg(pi.image_url) as images
             FROM saved_properties sp
             JOIN properties p ON sp.property_id = p.id
             LEFT JOIN property_images pi ON p.id = pi.property_id
             WHERE sp.user_id = $1 AND p.is_active = true
             GROUP BY p.id
             ORDER BY sp.saved_at DESC`,
            [req.user.id]
        );
        
        res.json({ properties: result.rows });
    } catch (error) {
        console.error('Saved properties error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== ADMIN ROUTES ==========

// Get admin dashboard stats
app.get('/api/admin/stats', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        // Total properties
        const propertiesCount = await pool.query('SELECT COUNT(*) FROM properties');
        
        // Total users
        const usersCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['client']);
        
        // Total revenue
        const revenueResult = await pool.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = $1',
            ['completed']
        );
        
        // Unread messages
        const messagesCount = await pool.query(
            'SELECT COUNT(*) FROM messages WHERE read_at IS NULL AND sender_role = $1',
            ['client']
        );
        
        // Recent transactions
        const recentTransactions = await pool.query(
            `SELECT p.*, u.email as user_email, u.first_name, u.last_name 
             FROM payments p
             JOIN users u ON p.user_id = u.id
             ORDER BY p.created_at DESC LIMIT 5`
        );
        
        res.json({
            totalProperties: parseInt(propertiesCount.rows[0].count),
            totalUsers: parseInt(usersCount.rows[0].count),
            totalRevenue: parseFloat(revenueResult.rows[0].total),
            unreadMessages: parseInt(messagesCount.rows[0].count),
            recentTransactions: recentTransactions.rows
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users (admin)
app.get('/api/admin/users', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT id, email, first_name, last_name, phone, role, 
                   is_active, created_at, updated_at 
            FROM users 
            WHERE role = 'client'
        `;
        
        const params = [];
        
        if (search) {
            query += ` AND (email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)`;
            params.push(`%${search}%`);
        }
        
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
        
        const result = await pool.query(query, params);
        
        // Get total count
        const countQuery = `SELECT COUNT(*) FROM users WHERE role = 'client'`;
        const countResult = await pool.query(countQuery);
        
        res.json({
            users: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(countResult.rows[0].count / limit)
            }
        });
    } catch (error) {
        console.error('Admin users fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Andrews Villa API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ========== START SERVER ==========
app.listen(PORT, () => {
    console.log(`🚀 Andrews Villa Backend running on port ${PORT}`);
    console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
});