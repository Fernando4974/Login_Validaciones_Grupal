const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

const BASE_URL = 'http://localhost:3000'; 

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Lógica de registro
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.text();
        if (response.ok) {
            showMessage(data, 'success');
            registerForm.reset();
        } else {
            showMessage(data, 'error');
        }
    } catch (error) {
        showMessage('Error de red. Intenta de nuevo más tarde.', 'error');
        console.error('Error:', error);
    }
});

// Lógica de inicio de sesión
// Dentro del evento de escucha para loginForm en app.js

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
     
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // verifica si la respuesta es exitosa (response.ok)
        if (response.ok) {
            const data = await response.json();
            if (data.token) {
                // Login exitoso y con la misma IP
                localStorage.setItem('userToken', data.token);
                showMessage('Login exitoso. ¡Bienvenido!', 'success');
            } else if (data.message) {
                // Login exitoso, pero se necesita autenticación por correo
                showMessage(data.message, 'success');
            }
            loginForm.reset();
        } else {
            // 💡 Si la respuesta no es OK (por ejemplo, 400 Bad Request)
            const errorData = await response.json();
            showMessage(errorData.message || 'Credenciales inválidas', 'error');
        }
    } catch (error) {
        // Este bloque solo se activará por errores de red reales, no por errores de la API
        showMessage('Error de red. Intenta de nuevo más tarde.', 'error');
        console.error('Error:', error);
    }
});