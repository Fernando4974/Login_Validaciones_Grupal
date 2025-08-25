Sistema de Autenticación de Usuario por IP
Descripción del Proyecto
Este proyecto es un sistema de autenticación de usuario que utiliza una capa de seguridad adicional. Además del login tradicional con correo y contraseña, la aplicación detecta si un usuario intenta iniciar sesión desde una dirección IP diferente a la registrada. Si se detecta un cambio de IP, el sistema envía un correo electrónico de verificación al usuario. Este enfoque mejora la seguridad al notificar sobre inicios de sesión sospechosos.

Características
Registro de Usuarios: Permite a nuevos usuarios registrarse con correo electrónico y contraseña.

Login Seguro: Autentica a los usuarios y verifica su dirección IP en cada intento de inicio de sesión.

Verificación de IP: Si un usuario inicia sesión desde una IP desconocida, se le envía un correo electrónico con un enlace de verificación.

Cifrado de Contraseñas: Utiliza bcrypt.js para cifrar las contraseñas, garantizando que no se almacenen en texto plano en la base de datos.

JSON Web Tokens (JWT): Genera tokens para la verificación de IP y el control de sesiones seguras.

Notificaciones por Correo Electrónico: Usa Nodemailer para enviar correos de verificación a través de Gmail.

Tecnologías Utilizadas
Backend: Node.js, Express.js

Base de Datos: MySQL

Autenticación: bcrypt.js, jsonwebtoken

Envío de Correos: Nodemailer

Frontend: HTML, CSS, JavaScript (puro)

Requisitos Previos
Antes de ejecutar la aplicación, asegúrate de tener instalado lo siguiente:

Node.js y npm

MySQL Server

Configuración e Instalación
Clonar el repositorio:

Bash

git clone [URL_DEL_REPOSITORIO]
cd [nombre_del_proyecto]
Instalar dependencias:

Bash

npm install
Configurar la base de datos:

Crea una base de datos en MySQL con el nombre bd_login_s.

Ejecuta el siguiente script SQL para crear la tabla users:

SQL

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    registration_ip VARCHAR(45) NOT NULL,
    last_login_ip VARCHAR(45),
    verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Configurar las credenciales de correo:

En tu cuenta de Google, activa la verificación en dos pasos.

Genera una "contraseña de aplicación" de 16 caracteres.

En el archivo server.js, reemplaza la sección de auth con tus credenciales:

JavaScript

auth: {
    user: 'tu_correo@gmail.com',
    pass: 'tu_contraseña_de_aplicación' // La contraseña de 16 caracteres
}
Uso
Iniciar el servidor:

Bash

node server.js
El servidor se iniciará en http://localhost:3000.

Probar el registro y login:

Abre tu navegador y ve a http://localhost:3000.

Utiliza el formulario de registro para crear un nuevo usuario.

Para probar la verificación de IP, sigue los pasos detallados en la sección de "Pruebas de Funcionalidad".

Pruebas de Funcionalidad
Para demostrar la funcionalidad principal del proyecto, sigue este procedimiento:

Primer Login (Registro):

Conecta tu PC a una red Wi-Fi.

Inicia el servidor y regístrate en la aplicación. La IP que se guardará será la de bucle invertido (::1 o 127.0.0.1).

Segundo Login (Verificación de IP):

Detén el servidor (Ctrl + C).
cambia la funcion listen que esta al final de fichero server.js a el siguiente
app.listen(PORT,0.0.0.0,() => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
esto para simular un cambio de ip

Inicia el servidor nuevamente (node server.js).

En el navegador de tu PC, inicia sesión con el mismo usuario. El servidor detectará que la IP ha cambiado a la de tu operador móvil y enviará el correo de verificación.
