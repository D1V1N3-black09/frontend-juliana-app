/**
 * Sistema de Verificación de Email
 * Muestra banner y restricciones para usuarios no verificados
 */

// Configuración
const VERIFICATION_CONFIG = {
    bannerCheckInterval: 5000, // Revisar cada 5 segundos
    restrictedActions: ['add-to-cart', 'checkout', 'wishlist'],
    excludePages: ['login.html', 'register.html', 'verify-email.html']
};

// Estado global
let verificationBanner = null;
let isVerificationCheckActive = false;

/**
 * Inicializar sistema de verificación
 */
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // No ejecutar en páginas excluidas
    if (VERIFICATION_CONFIG.excludePages.some(page => currentPage.includes(page))) {
        return;
    }
    
    // Verificar estado del usuario
    checkUserVerificationStatus();
    
    // Revisar periódicamente
    setInterval(checkUserVerificationStatus, VERIFICATION_CONFIG.bannerCheckInterval);
    
    // Interceptar acciones restringidas
    setupCartRestrictions();
});

/**
 * Verificar estado de verificación del usuario
 */
function checkUserVerificationStatus() {
    const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    
    if (!sessionData) {
        // No hay sesión activa, remover banner si existe
        removeVerificationBanner();
        return;
    }
    
    try {
        const session = JSON.parse(sessionData);
        
        // Verificar si el usuario está autenticado y no verificado
        if (session.email && !session.email_verified) {
            showVerificationBanner(session);
        } else {
            removeVerificationBanner();
        }
    } catch (error) {
        console.error('Error al verificar estado:', error);
    }
}

/**
 * Mostrar banner de verificación
 */
function showVerificationBanner(session) {
    // Si el banner ya existe, no crear otro
    if (verificationBanner && document.body.contains(verificationBanner)) {
        return;
    }
    
    // Crear banner
    verificationBanner = document.createElement('div');
    verificationBanner.id = 'verification-banner';
    verificationBanner.className = 'verification-banner';
    verificationBanner.innerHTML = `
        <div class="container">
            <div class="row align-items-center py-2">
                <div class="col-md-8">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-exclamation-circle fa-2x me-3 text-warning"></i>
                        <div>
                            <strong>⚠️ Tu email no está verificado</strong>
                            <p class="mb-0 small">Verifica tu email para desbloquear todas las funciones (carrito, compras, etc.)</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 text-md-end mt-2 mt-md-0">
                    <button class="btn btn-warning btn-sm me-2" onclick="goToVerificationPage()">
                        <i class="fas fa-check-circle me-1"></i>Verificar Ahora
                    </button>
                    <button class="btn btn-outline-light btn-sm" onclick="closeVerificationBanner()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Agregar estilos inline (por si no están en CSS)
    verificationBanner.style.cssText = `
        position: fixed;
        top: 76px;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        color: white;
        z-index: 1040;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: slideDown 0.3s ease-out;
    `;
    
    // Insertar en el body
    document.body.insertBefore(verificationBanner, document.body.firstChild);
    
    // Ajustar padding del body para compensar el banner
    document.body.style.paddingTop = '135px';
    
    isVerificationCheckActive = true;
}

/**
 * Remover banner de verificación
 */
function removeVerificationBanner() {
    if (verificationBanner && document.body.contains(verificationBanner)) {
        verificationBanner.remove();
        document.body.style.paddingTop = '76px';
        verificationBanner = null;
        isVerificationCheckActive = false;
    }
}

/**
 * Cerrar banner temporalmente
 */
function closeVerificationBanner() {
    removeVerificationBanner();
    
    // Mostrar tooltip recordatorio después de 2 minutos
    setTimeout(() => {
        if (!isUserVerified()) {
            showVerificationReminder();
        }
    }, 120000); // 2 minutos
}

/**
 * Ir a página de verificación
 */
function goToVerificationPage() {
    const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    
    if (!sessionData) {
        return;
    }
    
    try {
        const session = JSON.parse(sessionData);
        sessionStorage.setItem('verificationEmail', session.email);
        window.location.href = './pages/verify-email.html';
    } catch (error) {
        console.error('Error al ir a verificación:', error);
    }
}

/**
 * Mostrar recordatorio de verificación
 */
function showVerificationReminder() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: 'Recordatorio',
            text: 'No olvides verificar tu email para acceder a todas las funciones',
            showCancelButton: true,
            confirmButtonText: 'Verificar Ahora',
            cancelButtonText: 'Más Tarde',
            timer: 10000,
            timerProgressBar: true
        }).then((result) => {
            if (result.isConfirmed) {
                goToVerificationPage();
            }
        });
    }
}

/**
 * Configurar restricciones del carrito
 */
function setupCartRestrictions() {
    // Interceptar botones de agregar al carrito
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.add-to-cart-btn, [data-action="add-to-cart"], .btn-add-to-cart');
        
        if (target && !isUserVerified()) {
            e.preventDefault();
            e.stopPropagation();
            showVerificationAlert('add-to-cart');
            return false;
        }
    }, true);
    
    // Interceptar botón de checkout
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.checkout-btn, [data-action="checkout"], .btn-checkout');
        
        if (target && !isUserVerified()) {
            e.preventDefault();
            e.stopPropagation();
            showVerificationAlert('checkout');
            return false;
        }
    }, true);
}

/**
 * Verificar si el usuario está verificado
 * DESHABILITADO: Siempre retorna true para permitir acceso sin verificación
 */
function isUserVerified() {
    // Verificación deshabilitada - todos los usuarios pueden acceder
    return true;
    
    /* CÓDIGO ORIGINAL DESHABILITADO:
    const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    
    if (!sessionData) {
        return false;
    }
    
    try {
        const session = JSON.parse(sessionData);
        return session.email_verified === true || session.email_verified === 1;
    } catch (error) {
        return false;
    }
    */
}

/**
 * Mostrar alerta de verificación requerida
 */
function showVerificationAlert(action) {
    const messages = {
        'add-to-cart': {
            title: '🛒 Verificación Requerida',
            text: 'Debes verificar tu email antes de agregar productos al carrito. ¿Quieres verificar tu cuenta ahora?'
        },
        'checkout': {
            title: '💳 Verificación Requerida',
            text: 'Debes verificar tu email antes de realizar compras. ¿Quieres verificar tu cuenta ahora?'
        },
        'wishlist': {
            title: '❤️ Verificación Requerida',
            text: 'Debes verificar tu email antes de guardar favoritos. ¿Quieres verificar tu cuenta ahora?'
        }
    };
    
    const message = messages[action] || messages['add-to-cart'];
    
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'warning',
            title: message.title,
            html: `
                <p>${message.text}</p>
                <div class="alert alert-info mt-3">
                    <i class="fas fa-info-circle me-2"></i>
                    La verificación solo toma unos segundos y te permitirá acceder a todas las funciones.
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-check-circle me-1"></i>Verificar Ahora',
            cancelButtonText: 'Más Tarde',
            confirmButtonColor: '#ff9800',
            cancelButtonColor: '#6c757d'
        }).then((result) => {
            if (result.isConfirmed) {
                goToVerificationPage();
            }
        });
    } else {
        // Fallback si SweetAlert no está disponible
        const confirmed = confirm(message.text);
        if (confirmed) {
            goToVerificationPage();
        }
    }
}

/**
 * Validar acción antes de ejecutar
 * Uso: if (!validateVerifiedAction()) return;
 */
function validateVerifiedAction() {
    if (!isUserVerified()) {
        showVerificationAlert('add-to-cart');
        return false;
    }
    return true;
}

// Exportar funciones globales
window.goToVerificationPage = goToVerificationPage;
window.closeVerificationBanner = closeVerificationBanner;
window.validateVerifiedAction = validateVerifiedAction;
window.isUserVerified = isUserVerified;
