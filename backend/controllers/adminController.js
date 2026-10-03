const adminService = require('../services/adminService');

async function listUsers(req, res) {
    try {
        const users = await adminService.getUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
}

async function getMetrics(req, res) {
    try {
        const metrics = await adminService.getMetrics();
        res.status(200).json(metrics);
    } catch (error) {
        console.error('Error al obtener métricas admin', {
            code: error.code || 'unknown',
            message: error.message || 'Error sin mensaje',
        });
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
}

module.exports = { listUsers, getMetrics };