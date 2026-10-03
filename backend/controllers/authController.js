const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

const register = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ mensaje: 'Expedición iniciada con éxito', user });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Ya existe una cuenta con ese correo electrónico' });
        }
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

const login = async (req, res) => {
    try {
        const user = await authService.authenticateUser(req.body.email, req.body.password);
        if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(200).json({
            mensaje: 'Bienvenido al Atlas',
            token,
            user: { id: user.id, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en el inicio de sesión' });
    }
};

module.exports = { register, login };