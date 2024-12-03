const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Ruta de registro
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "Usuario ya registrado" });
    }

    // Crear un nuevo usuario
    user = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(201).json({ msg: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Encuentra todos los usuarios
    if (users.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios' });
    }
    res.status(200).json(users[1]); // Devuelve solo el primer usuario
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
});

////aqui es donde esta la creacion del token y esa madre
router.get('/current', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Obtiene el token de la cabecera

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    // Verifica el token
    const decoded = jwt.verify(token, 'tu_clave_secreta');
    console.log("Token decodificado:", decoded); // Verifica los datos decodificados

    // Asegúrate de que el userId está presente en el token
    if (!decoded || !decoded.userId) {
      return res.status(400).json({ message: 'El token no contiene un userId válido' });
    }

    // Busca al usuario en la base de datos con el userId decodificado
    const user = await User.findById(decoded.userId);

    // Si no se encuentra el usuario, responde con error 404
    if (!user) {
      console.error(`Usuario no encontrado con ID: ${decoded.userId}`);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si todo está bien, responde con los datos del usuario
    res.json({ username: user.username });  // Devuelve el nombre de usuario
  } catch (err) {
    console.error('Error al verificar el token:', err);

    // Manejo de errores según el tipo de error
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Token inválido' });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'El token ha expirado' });
    } else {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
});

module.exports = router;
