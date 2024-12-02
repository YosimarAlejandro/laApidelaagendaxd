const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const QRCode = require('qrcode');

dotenv.config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Ruta para generar el QR
app.get('/api/qr/:username', async (req, res) => {
  const { username } = req.params;

  // Creamos un objeto con el nombre de usuario
  const data = { username };

  try {
    // Generamos el código QR en formato base64
    const qrCode = await QRCode.toDataURL(JSON.stringify(data));
    
    // Devolvemos el QR en formato JSON
    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ error: 'Error generando el código QR' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
