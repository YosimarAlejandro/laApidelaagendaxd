const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config');
const authRoutes = require('./routes/auth');
const cors = require('cors');

dotenv.config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
