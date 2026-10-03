const discoveryService = require('../services/discoveryService');

const getDiscoveries = async (req, res) => {
    try {
        const discoveries = await discoveryService.getDiscoveries(req.user.id);
        res.status(200).json(discoveries);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener descubrimientos' });
    }
};

const createDiscovery = async (req, res) => {
    try {
        const discovery = await discoveryService.createDiscovery(req.user.id, req.body);
        res.status(201).json(discovery);
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'Esta criatura ya está en tu Atlas' });
        if (error.code === '23503') {
            return res.status(401).json({ error: 'La cuenta de esta sesión ya no existe. Inicia sesión nuevamente.' });
        }
        console.error('Error al guardar descubrimiento', {
            code: error.code || 'unknown',
            message: error.message || 'Error sin mensaje',
        });
        res.status(500).json({ error: 'Error al guardar el descubrimiento' });
    }
};

const recordTaxonView = async (req, res) => {
    try {
        await discoveryService.recordTaxonView(req.user.id, req.body.external_id);
        res.status(201).json({ mensaje: 'Vista registrada' });
    } catch (error) {
        console.error('Error al registrar vista taxonómica', {
            code: error.code || 'unknown',
            message: error.message || 'Error sin mensaje',
        });
        res.status(500).json({ error: 'Error al registrar la vista' });
    }
};

const updateDiscovery = async (req, res) => {
    try {
        const discovery = await discoveryService.updateDiscovery(req.user.id, req.params.id, req.body);
        if (!discovery) {
            return res.status(404).json({ error: 'Descubrimiento no encontrado o no tienes permiso para editarlo' });
        }
        res.status(200).json(discovery);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el descubrimiento' });
    }
};

const deleteDiscovery = async (req, res) => {
    try {
        const deleted = await discoveryService.deleteDiscovery(req.user.id, req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Descubrimiento no encontrado o no tienes permiso para eliminarlo' });
        }

        res.status(200).json({ mensaje: 'Criatura eliminada de tu Atlas' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el descubrimiento' });
    }
};

module.exports = { getDiscoveries, createDiscovery, recordTaxonView, updateDiscovery, deleteDiscovery };