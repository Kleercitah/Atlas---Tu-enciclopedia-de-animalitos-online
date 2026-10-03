const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const discoveryRoutes = require('./routes/discoveryRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const defaultOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5502',
    'http://127.0.0.1:5502',
];
const allowedOrigins = (process.env.CORS_ORIGINS || defaultOrigins.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(helmet());
app.use(cors({
    origin: allowedOrigins,
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '20kb' }));

app.use('/auth', authRoutes);
app.use('/api/discoveries', discoveryRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ mensaje: 'ATLAS API operativa' });
});

module.exports = app;