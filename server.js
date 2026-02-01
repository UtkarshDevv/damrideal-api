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
app.use(cors());
app.use(express.json());

// Health check routes
app.get('/', (req, res) => {
    res.json({ message: 'Damrideal API is running', status: 'ok' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Routes - USING TEST ROUTE TO DEBUG 502
app.use('/api/auth', require('./routes/auth-test'));

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/damrideals';

mongoose.connect(MONGO_URI, { family: 4 })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
