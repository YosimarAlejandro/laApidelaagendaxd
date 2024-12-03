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
    const { username } = req.params; // Esto obtiene el parámetro 'username' de la URL
    console.log('Username recibido:', username); // Agrega un log para ver el valor de 'username'
  
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
  
    const data = { username };
    try {
      const qrCode = await QRCode.toDataURL(JSON.stringify(data));
      res.json({ qrCode });
    } catch (error) {
      res.status(500).json({ error: 'Error generating QR code' });
    }
  });
  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
