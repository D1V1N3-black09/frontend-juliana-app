function getUserSession() {
    const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    return sessionData ? JSON.parse(sessionData) : null;
}

function getAvatarUrl(firstName) {
    const initial = firstName ? firstName.charAt(0).toUpperCase() : 'U';
    return `https://ui-avatars.com/api/?name=${initial}&background=0d6efd&color=fff&size=32`;
}

window.updateCartCountGlobal = async function() {
    const session = getUserSession();
    
    let total = 0;
    
    if (session && session.id) {
        try {
            const cart = await API.getCart(session.id);
            total = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        } catch (error) {
            console.error('Error al obtener carrito del backend:', error);
            const localCart = JSON.parse(localStorage.getItem('cart')) || [];
            total = localCart.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0);
        }
    } else {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        total = cart.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0);
    }
    
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(count => {
        count.textContent = total;
    });
    
    return total;
};

function updateNavbar() {
    const session = getUserSession();
    const authButtons = document.querySelector('.navbar .d-flex');
    
    if (!authButtons) return;

    if (session) {
        const profileUrl = session.isAdmin ? './pages/admin/dashboard.html' : './pages/profile.html';
        const relativePath = window.location.pathname.includes('/pages/') ? '../pages/' : './pages/';
        const correctProfileUrl = session.isAdmin 
            ? (window.location.pathname.includes('/pages/') ? './admin/dashboard.html' : './pages/admin/dashboard.html')
            : (window.location.pathname.includes('/pages/') ? './profile.html' : './pages/profile.html');

        authButtons.innerHTML = `
            <a href="${window.location.pathname.includes('/pages/') ? './cart.html' : './pages/cart.html'}" class="btn btn-outline-primary position-relative me-2">
                <i class="fas fa-shopping-cart"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-count">0</span>
            </a>
            <div class="dropdown">
                <button class="btn btn-primary dropdown-toggle d-flex align-items-center" type="button" id="userDropdown" data-bs-toggle="dropdown">
                    <img src="${getAvatarUrl(session.firstName)}" alt="${session.firstName}" class="rounded-circle me-2" width="32" height="32">
                    <span class="d-none d-md-inline">${session.firstName}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <div class="dropdown-header">
                            <strong>${session.firstName} ${session.lastName}</strong>
                            <br>
                            <small class="text-muted">${session.email}</small>
                        </div>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <a class="dropdown-item" href="${correctProfileUrl}">
                            <i class="fas fa-user me-2"></i>Mi Perfil
                        </a>
                    </li>
                    ${session.isAdmin ? `
                    <li>
                        <a class="dropdown-item" href="${window.location.pathname.includes('/pages/') ? './admin/dashboard.html' : './pages/admin/dashboard.html'}">
                            <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                        </a>
                    </li>
                    ` : ''}
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <a class="dropdown-item text-danger" href="#" onclick="handleLogoutFromNavbar(event)">
                            <i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                        </a>
                    </li>
                </ul>
            </div>
        `;
    } else {
        const loginUrl = window.location.pathname.includes('/pages/') ? './login.html' : './pages/login.html';
        const registerUrl = window.location.pathname.includes('/pages/') ? './register.html' : './pages/register.html';
        const cartUrl = window.location.pathname.includes('/pages/') ? './cart.html' : './pages/cart.html';

        authButtons.innerHTML = `
            <a href="${cartUrl}" class="btn btn-outline-primary position-relative me-2">
                <i class="fas fa-shopping-cart"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-count">0</span>
            </a>
            <a href="${registerUrl}" class="btn btn-outline-primary me-2">
                <i class="fas fa-user-plus me-1"></i>Registrarse
            </a>
            <a href="${loginUrl}" class="btn btn-primary">
                <i class="fas fa-user me-1"></i>Iniciar Sesión
            </a>
        `;
    }

    updateCartCountDisplay();
}

async function handleLogoutFromNavbar(event) {
    event.preventDefault();
    
    // Mostrar modal de confirmación de logout
    const confirmed = await showLogoutConfirm();
    if (confirmed) {
        localStorage.removeItem('userSession');
        sessionStorage.removeItem('userSession');
        
        const isInPages = window.location.pathname.includes('/pages/');
        window.location.href = isInPages ? '../index.html' : './index.html';
    }
}

async function updateCartCountDisplay() {
    await window.updateCartCountGlobal();
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    updateCartCountDisplay();
    
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart' || e.key === 'userSession') {
            updateCartCountDisplay();
        }
    });
    
    setInterval(updateCartCountDisplay, 5000);
});
