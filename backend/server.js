const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: false });

if (!process.env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET en la configuración del entorno');
}

const app = require('./app.js');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor de ATLAS corriendo en el puerto ${PORT}`);
});