





















document.addEventListener('DOMContentLoaded', function() {
    checkSession();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    try {
        const user = await API.login(email, password);
        
        const session = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone,
            address: user.address,
            city: user.city,
            postalCode: user.postal_code,
            role: user.role,
            isAdmin: user.role === 'ADMIN',
            timestamp: new Date().getTime()
        };

        if (remember) {
            localStorage.setItem('userSession', JSON.stringify(session));
        } else {
            sessionStorage.setItem('userSession', JSON.stringify(session));
        }

        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (localCart.length > 0) {
            try {
                await API.syncCart(user.id, localCart);
                localStorage.removeItem('cart');
            } catch (error) {
                console.error('Error al sincronizar carrito:', error);
            }
        }

        showNotification(`¡Bienvenid@ ${user.first_name}!`, 'success');
        
        const redirectTo = localStorage.getItem('redirectAfterLogin');
        localStorage.removeItem('redirectAfterLogin');
        
        setTimeout(() => {
            if (redirectTo) {
                window.location.href = redirectTo;
            } else if (user.role === 'ADMIN') {
                window.location.href = './admin/dashboard.html';
            } else {
                window.location.href = './profile.html';
            }
        }, 1000);
    } catch (error) {
        showNotification(error.message, 'danger');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('name').value.trim();
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];
    
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;

    if (!terms) {
        showNotification('Debes aceptar los términos y condiciones', 'warning');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'warning');
        return;
    }

    if (password.length < 8) {
        showNotification('La contraseña debe tener al menos 8 caracteres', 'warning');
        return;
    }

    try {
        const userData = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
            phone: phone
        };

        await API.register(userData);
        
        showNotification('¡Registro exitoso! Ahora puedes iniciar sesión', 'success');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 1500);
    } catch (error) {
        showNotification(error.message, 'danger');
    }
}




function handleLogout() {
    
    localStorage.removeItem('userSession');
    sessionStorage.removeItem('userSession');
    
    
    showNotification('Sesión cerrada exitosamente', 'info');
    
    
    setTimeout(() => {
        window.location.href = '../../index.html';
    }, 500);
}







function checkSession() {
    
    const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    const session = sessionData ? JSON.parse(sessionData) : null;
    
    
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.includes('/admin/');
    const isProfilePage = currentPath.includes('/profile.html');
    const isLoginPage = currentPath.includes('/login.html');
    
    
    
    
    if (!session) {
        
        if (isAdminPage || isProfilePage) {
            window.location.href = '../pages/login.html';
        }
        return;
    }
    
    
    
    
    
    
    if (session.isAdmin && isAdminPage) {
        return;
    }
    
    
    if (!session.isAdmin && isProfilePage) {
        return;
    }
    
    
    if (isLoginPage) {
        if (session.isAdmin) {
            window.location.href = '../pages/admin/dashboard.html';
        } else {
            window.location.href = '../pages/profile.html';
        }
        return;
    }
    
    
    if (session.isAdmin && isProfilePage) {
        window.location.href = '../pages/admin/dashboard.html';
        return;
    }
    
    
    if (!session.isAdmin && isAdminPage) {
        showNotification('No tienes permisos para acceder a esta área', 'danger');
        setTimeout(() => {
            window.location.href = '../pages/profile.html';
        }, 1000);
        return;
    }
}


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