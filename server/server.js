const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const connectDB = require('./config/db');
const imageRoutes = require('./routes/imageRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/images', imageRoutes);

// Root route (Welcome message)
app.get('/', (req, res) => {
    res.send('API is running. Access /api/images to get images.');
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler — catches Multer and other errors
app.use((err, req, res, next) => {
    // Multer-specific errors
    if (err instanceof multer.MulterError) {
        const messages = {
            LIMIT_FILE_SIZE: 'File is too large. Maximum size is 10 MB.',
            LIMIT_FILE_COUNT: 'Too many files. Maximum is 10 files per upload.',
            LIMIT_UNEXPECTED_FILE: err.message || 'Unexpected file field.'
        };
        return res.status(400).json({
            message: messages[err.code] || `Upload error: ${err.message}`
        });
    }

    // Generic errors thrown from middleware (e.g. file filter)
    if (err) {
        console.error('Unhandled error:', err);
        return res.status(500).json({ message: err.message || 'Internal Server Error' });
    }

    next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
