const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const dns = require('dns');
// Set Google DNS to bypass local DNS issues with SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: true, // Allow all origins (reflects request origin)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.options('*', cors()); // Enable pre-flight for all routes
app.use(express.json());

// Request Logging Middleware - Log all incoming requests
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log('\n========================================');
    console.log(`📥 [${timestamp}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    console.log('========================================\n');
    next();
});

// Health check routes
app.get('/', (req, res) => {
    res.json({ message: 'Damrideal API is running', status: 'ok' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/requirements', require('./routes/requirements'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/settings', require('./routes/settings'));

// Admin Routes
app.use('/api/admin', require('./admin/routes/adminAuth'));
app.use('/api/admin/dashboard', require('./admin/routes/adminDashboard'));

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/damrideals';

mongoose.connect(MONGO_URI, { family: 4 })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Base URL: ${process.env.BASE_URL || 'Not defined'}`);
});
