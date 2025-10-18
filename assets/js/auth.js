// Credenciales de administrador (en un entorno real esto estaría en el backend)
const ADMIN_EMAIL = 'admin@beautifulgirl.com';
const ADMIN_PASSWORD = 'admin123';

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay una sesión activa
    checkSession();

    // Manejar el formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Manejar el cierre de sesión
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Funciones de autenticación
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    // Validar credenciales
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Guardar sesión
        const session = {
            email: email,
            isAdmin: true,
            timestamp: new Date().getTime()
        };

        if (remember) {
            localStorage.setItem('userSession', JSON.stringify(session));
        } else {
            sessionStorage.setItem('userSession', JSON.stringify(session));
        }

        // Mostrar notificación de éxito
        showNotification('¡Inicio de sesión exitoso!', 'success');

        // Redireccionar al panel de administración
        setTimeout(() => {
            window.location.href = '../admin/dashboard.html';
        }, 1000);
    } else {
        // Validar si es un cliente regular
        handleCustomerLogin(email, password);
    }
}

function handleCustomerLogin(email, password) {
    // Aquí iría la lógica para clientes regulares
    // Por ahora, mostrar error
    showNotification('Credenciales incorrectas', 'danger');
}

function handleLogout() {
    // Limpiar sesión
    localStorage.removeItem('userSession');
    sessionStorage.removeItem('userSession');
    
    // Redireccionar al inicio
    window.location.href = '../index.html';
}

function checkSession() {
    // Verificar si hay una sesión activa
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.includes('/admin/');
    
    if (session) {
        // Verificar si la sesión es de administrador y estamos en la página correcta
        if (session.isAdmin && !isAdminPage && !currentPath.includes('/pages/login.html')) {
            window.location.href = '/admin/dashboard.html';
        } else if (!session.isAdmin && isAdminPage) {
            window.location.href = '../index.html';
        }
    } else if (isAdminPage) {
        // Si no hay sesión y estamos en una página de admin, redirigir al login
        window.location.href = '../pages/login.html';
    }
}

// Utilidades
function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    const container = document.createElement('div');
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.appendChild(toast);
    document.body.appendChild(container);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        container.remove();
    });
}