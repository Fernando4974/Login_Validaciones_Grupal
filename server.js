const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'duti_el_nene_del_sistema'; // <--- por revisar

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'bd_login_s',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fjeni5889@gmail.com',
        pass: 'nkct nczk yvzr kaws'
    }
});

// Función para obtener la IP del usuario
const getClientIp = (req) => {
    console.log(req.ip)
    return req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
};

// --- Rutas de la API ---

// Ruta de Registro
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const registrationIp = getClientIp(req);

    if (!email || !password) {
        return res.status(400).json({ message: 'Correo y contraseña son requeridos.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.execute(
            'INSERT INTO users (email, password, registration_ip, last_login_ip) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, registrationIp, registrationIp]
        );
        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El correo ya está registrado.' });
        }
        res.status(500).json({ message: 'Error al registrar usuario: ' + error.message });
    }
});

// Ruta de Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const currentIp = getClientIp(req);

    if (!email || !password) {
        return res.status(400).json({ message: 'Correo y contraseña son requeridos.' });
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        if (user.last_login_ip && user.last_login_ip !== currentIp) {
            const verificationToken = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '10m' });

            await pool.execute('UPDATE users SET verification_token = ? WHERE id = ?', [verificationToken, user.id]);

            const mailOptions = {
                from: 'fjeni5889@gmail.com',
                to: user.email,
                subject: 'Alerta de inicio de sesión desde una nueva IP',
                html: `
                    <h1>Verificación de seguridad</h1>
                    <p>Hemos detectado un inicio de sesión desde una nueva ubicación (IP: ${currentIp}).</p>
                    <p>Por favor, haz clic en el siguiente enlace para verificar que eres tú:</p>
                    <a href="http://localhost:${PORT}/verify?token=${verificationToken}">Verificar mi inicio de sesión</a>
                    <p>Si no fuiste tú, por favor ignora este correo.</p>
                `
            };

            await transporter.sendMail(mailOptions);
            return res.status(200).json({ message: 'Inicio de sesión detectado desde una nueva IP. Se ha enviado un correo de verificación.' });
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        await pool.execute('UPDATE users SET last_login_ip = ? WHERE id = ?', [currentIp, user.id]);
        res.status(200).json({ message: 'Login exitoso', token });

    } catch (error) {
        res.status(500).json({ message: 'Error en el login: ' + error.message });
    }
});

// Ruta para verificar el token de correo
app.get('/verify', async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ message: 'Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [decoded.userId]);
        const user = rows[0];

        if (!user || user.verification_token !== token) {
            return res.status(400).json({ message: 'Token inválido o expirado.' });
        }

        await pool.execute('UPDATE users SET last_login_ip = ?, verification_token = NULL WHERE id = ?', [getClientIp(req), user.id]);

        res.status(200).json({ message: 'Inicio de sesión verificado exitosamente. Ahora puedes ingresar.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar el token: ' + error.message });
    }
});

app.listen(PORT,() => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});