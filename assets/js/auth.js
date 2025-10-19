// ============================================
// SISTEMA DE AUTENTICACIÓN - Beautiful Girl
// ============================================
// Proyecto Escolar - Sistema Simple de Login
//
// CREDENCIALES PARA PRUEBAS:
// ---------------------------
// ADMINISTRADOR:
//   Email: admin@beautifulgirl.com
//   Password: admin123
//   Acceso: Dashboard de Administración
//
// CLIENTE DE PRUEBA:
//   Email: cliente@ejemplo.com
//   Password: cliente123
//   Acceso: Perfil de Cliente
//
// NOTA: En producción real, las credenciales 
// estarían en una base de datos segura
// ============================================

// Credenciales de administrador
const ADMIN_EMAIL = 'admin@beautifulgirl.com';
const ADMIN_PASSWORD = 'admin123';

// Credenciales de cliente de ejemplo
const CUSTOMER_EMAIL = 'cliente@ejemplo.com';
const CUSTOMER_PASSWORD = 'cliente123';

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

// ============================================
// FUNCIÓN PRINCIPAL DE LOGIN
// ============================================
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    // ========================================
    // VALIDACIÓN 1: ¿Es el ADMINISTRADOR?
    // ========================================
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Crear sesión de administrador
        const session = {
            email: email,
            firstName: 'Admin',
            lastName: 'Beautiful Girl',
            isAdmin: true,
            timestamp: new Date().getTime()
        };

        // Guardar sesión
        if (remember) {
            localStorage.setItem('userSession', JSON.stringify(session));
        } else {
            sessionStorage.setItem('userSession', JSON.stringify(session));
        }

        // Mostrar notificación y redirigir al dashboard
        showNotification('¡Bienvenido Administrador!', 'success');
        setTimeout(() => {
            window.location.href = '../pages/admin/dashboard.html';
        }, 1000);
        return;
    }

    // ========================================
    // VALIDACIÓN 2: ¿Es un CLIENTE?
    // ========================================
    if (email === CUSTOMER_EMAIL && password === CUSTOMER_PASSWORD) {
        // Crear sesión de cliente
        const session = {
            email: email,
            firstName: 'María',
            lastName: 'González',
            phone: '+57 300 123 4567',
            address: 'Calle 123 #45-67',
            city: 'Bogotá',
            postalCode: '110111',
            isAdmin: false,
            timestamp: new Date().getTime()
        };

        // Guardar sesión
        if (remember) {
            localStorage.setItem('userSession', JSON.stringify(session));
        } else {
            sessionStorage.setItem('userSession', JSON.stringify(session));
        }

        // Mostrar notificación y redirigir al perfil
        showNotification('¡Bienvenida María!', 'success');
        setTimeout(() => {
            window.location.href = '../pages/profile.html';
        }, 1000);
        return;
    }

    // ========================================
    // VALIDACIÓN 3: Credenciales incorrectas
    // ========================================
    showNotification('Email o contraseña incorrectos', 'danger');
}

// ============================================
// FUNCIÓN DE CIERRE DE SESIÓN
// ============================================
function handleLogout() {
    // Limpiar toda la sesión
    localStorage.removeItem('userSession');
    sessionStorage.removeItem('userSession');
    
    // Mostrar mensaje
    showNotification('Sesión cerrada exitosamente', 'info');
    
    // Redireccionar al inicio después de un momento
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 500);
}

// ============================================
// FUNCIÓN DE VERIFICACIÓN DE SESIÓN
// ============================================
// Esta función protege las páginas y redirige
// a los usuarios según su tipo de cuenta
// ============================================
function checkSession() {
    // Obtener sesión activa
    const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    const session = sessionData ? JSON.parse(sessionData) : null;
    
    // Detectar en qué página estamos
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.includes('/admin/');
    const isProfilePage = currentPath.includes('/profile.html');
    const isLoginPage = currentPath.includes('/login.html');
    
    // ========================================
    // CASO 1: Usuario NO autenticado
    // ========================================
    if (!session) {
        // Si intenta acceder a página protegida, redirigir a login
        if (isAdminPage || isProfilePage) {
            window.location.href = '../pages/login.html';
        }
        return;
    }
    
    // ========================================
    // CASO 2: Usuario SÍ autenticado
    // ========================================
    
    // Si es ADMIN y está en página de admin, todo OK
    if (session.isAdmin && isAdminPage) {
        return;
    }
    
    // Si es CLIENTE y está en su perfil, todo OK
    if (!session.isAdmin && isProfilePage) {
        return;
    }
    
    // Si está en login y ya tiene sesión, redirigir a su área
    if (isLoginPage) {
        if (session.isAdmin) {
            window.location.href = '../pages/admin/dashboard.html';
        } else {
            window.location.href = '../pages/profile.html';
        }
        return;
    }
    
    // Si ADMIN intenta acceder a área de cliente
    if (session.isAdmin && isProfilePage) {
        window.location.href = '../pages/admin/dashboard.html';
        return;
    }
    
    // Si CLIENTE intenta acceder a área de admin
    if (!session.isAdmin && isAdminPage) {
        showNotification('No tienes permisos para acceder a esta área', 'danger');
        setTimeout(() => {
            window.location.href = '../pages/profile.html';
        }, 1000);
        return;
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