const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_STATUSES = new Set(['descubierto', 'investigando', 'observado']);

function validateBody(validator) {
    return (req, res, next) => {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({ error: 'El cuerpo de la solicitud debe ser un objeto JSON' });
        }

        const error = validator(req.body);
        if (error) return res.status(400).json({ error });
        next();
    };
}

const validateRegistration = validateBody((body) => {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name || name.length > 100) return 'El nombre es obligatorio y no puede superar 100 caracteres';
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) return 'El correo electrónico no es válido';
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
        return 'La contraseña debe tener al menos 8 caracteres y no superar 72 bytes';
    }

    body.name = name;
    body.email = email;
    body.password = password;
    return null;
});

const validateLogin = validateBody((body) => {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (email.length > 254 || !EMAIL_PATTERN.test(email)) return 'El correo electrónico no es válido';
    if (!password || Buffer.byteLength(password, 'utf8') > 72) return 'La contraseña no es válida';

    body.email = email;
    body.password = password;
    return null;
});

const validateDiscoveryCreate = validateBody((body) => {
    const allowedFields = new Set(['external_id', 'notes']);
    if (Object.keys(body).some((field) => !allowedFields.has(field))) return 'La solicitud contiene campos no permitidos';

    if (typeof body.external_id !== 'number' && typeof body.external_id !== 'string') {
        return 'El ID externo debe ser un entero positivo';
    }
    const externalId = String(body.external_id).trim();
    if (!/^[1-9]\d*$/.test(externalId) || !Number.isSafeInteger(Number(externalId))) {
        return 'El ID externo debe ser un entero positivo';
    }

    const notes = body.notes === undefined ? '' : body.notes;
    if (typeof notes !== 'string' || notes.length > 5000) return 'Las notas deben ser texto de hasta 5000 caracteres';

    body.external_id = externalId;
    body.notes = notes;
    return null;
});

const validateDiscoveryUpdate = validateBody((body) => {
    const allowedFields = new Set(['favorite', 'status', 'notes']);
    const fields = Object.keys(body);
    if (!fields.length || fields.some((field) => !allowedFields.has(field))) {
        return 'Indica al menos un campo permitido para actualizar';
    }
    if (Object.hasOwn(body, 'favorite') && typeof body.favorite !== 'boolean') {
        return 'favorite debe ser un valor booleano';
    }
    if (Object.hasOwn(body, 'status') && !VALID_STATUSES.has(body.status)) {
        return 'El estado indicado no es válido';
    }
    if (Object.hasOwn(body, 'notes') && (typeof body.notes !== 'string' || body.notes.length > 5000)) {
        return 'Las notas deben ser texto de hasta 5000 caracteres';
    }
    return null;
});

const validateTaxonView = validateBody((body) => {
    if (Object.keys(body).some((field) => field !== 'external_id')) {
        return 'La solicitud contiene campos no permitidos';
    }
    if (typeof body.external_id !== 'number' && typeof body.external_id !== 'string') {
        return 'El ID externo debe ser un entero positivo';
    }
    const externalId = String(body.external_id).trim();
    if (!/^[1-9]\d*$/.test(externalId) || !Number.isSafeInteger(Number(externalId))) {
        return 'El ID externo debe ser un entero positivo';
    }
    body.external_id = externalId;
    return null;
});

function validateDiscoveryId(req, res, next) {
    const id = req.params.id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return res.status(400).json({ error: 'El ID del descubrimiento no es válido' });
    next();
}

module.exports = {
    validateRegistration,
    validateLogin,
    validateDiscoveryCreate,
    validateDiscoveryUpdate,
    validateTaxonView,
    validateDiscoveryId,
};