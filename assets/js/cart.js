
let cart = [];
const shipping = 5000;
let isLoggedIn = false;
let currentUser = null;

document.addEventListener('DOMContentLoaded', async function() {
    await initializeCart();
    renderCartItems();
    setupCheckoutButton();
});

async function initializeCart() {
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    
    if (session && session.id) {
        isLoggedIn = true;
        currentUser = session;
        
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (localCart.length > 0) {
            try {
                await API.syncCart(session.id, localCart);
                localStorage.removeItem('cart');
            } catch (error) {
                console.error('Error al sincronizar carrito:', error);
            }
        }
        
        try {
            const backendCart = await API.getCart(session.id);
            cart = backendCart.items || [];
        } catch (error) {
            console.error('Error al cargar carrito:', error);
            cart = [];
        }
    } else {
        isLoggedIn = false;
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    }
}

async function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-4x text-muted mb-4"></i>
                <h3 class="h5 mb-3 text-muted">Tu carrito está vacío</h3>
                <p class="text-muted mb-4">¡Agrega algunos productos para comenzar!</p>
                <a href="products.html" class="btn btn-primary">
                    <i class="fas fa-shopping-bag me-2"></i>Ir a comprar
                </a>
            </div>
        `;
        return;
    }

    // Obtener stock actual de los productos
    const productStocks = {};
    for (const item of cart) {
        const productId = item.product_id || item.id;
        try {
            const products = await API.getProducts();
            const product = products.find(p => p.id === productId);
            if (product) {
                productStocks[productId] = product.stock;
            }
        } catch (error) {
            console.error('Error al obtener stock:', error);
        }
    }

    cartItems.innerHTML = cart.map((item, index) => {
        const itemImage = item.image || item.img || '../assets/img/placeholder.png';
        const itemPrice = item.price;
        const itemQty = item.quantity || item.qty;
        const itemId = item.product_id || item.id;
        const availableStock = productStocks[itemId] || 0;
        const hasStockIssue = itemQty > availableStock;
        
        return `
            <div class="d-flex align-items-center mb-4 pb-3 border-bottom ${hasStockIssue ? 'border-danger' : ''}" data-product-id="${itemId}">
                <div class="border rounded shadow-sm" style="width: 100px; height: 100px; overflow: hidden;">
                    <img src="${itemImage}" alt="${item.name}" class="w-100 h-100" style="object-fit: cover;">
                </div>
                <div class="ms-3 flex-grow-1">
                    <h4 class="h6 mb-1">${item.name}</h4>
                    <p class="text-muted mb-0">$${itemPrice.toLocaleString('es-CO')}</p>
                    <div class="mt-2">
                        ${hasStockIssue 
                            ? `<span class="badge bg-danger">
                                <i class="fas fa-exclamation-triangle me-1"></i>
                                Stock insuficiente (Disponible: ${availableStock})
                               </span>` 
                            : `<span class="text-muted small">Stock disponible: ${availableStock}</span>`
                        }
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${index}, -1)" ${itemQty <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="mx-3 h5 mb-0 ${hasStockIssue ? 'text-danger' : ''}">${itemQty}</span>
                    <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${index}, 1)" ${itemQty >= availableStock ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm ms-3" onclick="removeItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    updateTotals();
}

async function updateQuantity(index, change) {
    if (!cart[index]) return;
    
    const item = cart[index];
    const currentQty = item.quantity || item.qty;
    const newQty = currentQty + change;
    
    if (newQty < 1) return;
    
    if (isLoggedIn && currentUser) {
        try {
            const productId = item.product_id || item.id;
            await API.updateCartItem(currentUser.id, productId, newQty);
            
            if (item.quantity !== undefined) {
                cart[index].quantity = newQty;
            } else {
                cart[index].qty = newQty;
            }
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            showNotification('Error al actualizar la cantidad', 'danger');
            return;
        }
    } else {
        cart[index].qty = newQty;
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    renderCartItems();
    updateCartCount();
}

async function removeItem(index) {
    const item = cart[index];
    
    // Mostrar modal de confirmación elegante
    const confirmed = await showDeleteConfirm(item.name || item.product_name, 'producto del carrito');
    if (!confirmed) return;
    
    if (isLoggedIn && currentUser) {
        try {
            const productId = item.product_id || item.id;
            await API.removeFromCart(currentUser.id, productId);
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
            showNotification('Error al eliminar el producto', 'danger');
            return;
        }
    }
    
    cart.splice(index, 1);
    
    if (!isLoggedIn) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    renderCartItems();
    updateCartCount();
    showNotification('Producto eliminado del carrito', 'success');
}


function updateTotals() {
    const subtotal = cart.reduce((sum, item) => {
        const qty = item.quantity || item.qty;
        return sum + (item.price * qty);
    }, 0);
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = `$${subtotal.toLocaleString('es-CO')}`;
    document.getElementById('shipping').textContent = `$${shipping.toLocaleString('es-CO')}`;
    document.getElementById('total').textContent = `$${total.toLocaleString('es-CO')}`;
}

function updateCartCount() {
    if (typeof window.updateCartCountGlobal === 'function') {
        window.updateCartCountGlobal();
    } else {
        const count = cart.reduce((sum, item) => {
            const qty = item.quantity || item.qty;
            return sum + qty;
        }, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(el => el.textContent = count);
    }
}

function setupCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (!checkoutBtn) return;
    
    checkoutBtn.addEventListener('click', async function() {
        if (cart.length === 0) {
            showNotification('Tu carrito está vacío. Agrega algunos productos antes de proceder al pago.', 'warning');
            return;
        }
        
        if (!isLoggedIn || !currentUser) {
            // Mostrar modal elegante para redirigir a login
            const goToLogin = await showLoginRedirect();
            if (goToLogin) {
                localStorage.setItem('cart', JSON.stringify(cart));
                localStorage.setItem('redirectAfterLogin', 'cart.html');
                window.location.href = 'login.html';
            }
            return;
        }
        
        try {
            const orderData = {
                user_id: currentUser.id,
                order_date: new Date().toISOString().split('T')[0],
                total: cart.reduce((sum, item) => {
                    const qty = item.quantity || item.qty;
                    return sum + (item.price * qty);
                }, 0),
                status: 'pending',
                items: cart.map(item => ({
                    product_id: item.product_id || item.id,
                    product_name: item.name,
                    quantity: item.quantity || item.qty,
                    price_at_purchase: item.price
                }))
            };
            
            // Deshabilitar el botón mientras se procesa
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Procesando...';
            
            const response = await API.createOrder(orderData);
            
            await API.clearCart(currentUser.id);
            cart = [];
            
            showNotification('¡Pedido realizado exitosamente!', 'success');
            
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error al procesar el pedido:', error);
            
            // Habilitar el botón nuevamente
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i class="fas fa-credit-card me-2"></i>Proceder al pago';
            
            // Mostrar mensaje de error específico
            let errorMessage = 'Error al procesar el pedido. Intenta nuevamente.';
            let errorTitle = 'Error en el pedido';
            
            if (error.message && error.message.includes('Stock insuficiente')) {
                errorMessage = error.message;
                errorTitle = '⚠️ Stock Insuficiente';
                showStockErrorModal(errorMessage);
                return;
            } else if (error.message && error.message.includes('Error en')) {
                errorMessage = error.message;
                errorTitle = '⚠️ Producto no disponible';
                showStockErrorModal(errorMessage);
                return;
            }
            
            showNotification(errorMessage, 'danger');
        }
    });
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
    container.style.zIndex = '9999';
    container.appendChild(toast);
    document.body.appendChild(container);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        container.remove();
    });
}

function showStockErrorModal(errorMessage) {
    // Crear modal con mensaje de error más visible
    const modalHtml = `
        <div class="modal fade" id="stockErrorModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-warning" style="border-width: 3px;">
                    <div class="modal-header bg-warning text-dark">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Stock Insuficiente
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-warning mb-3" role="alert">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Lo sentimos</strong>, uno o más productos no tienen suficiente stock disponible.
                        </div>
                        <div class="bg-light p-3 rounded">
                            <p class="mb-2"><strong>Detalle del error:</strong></p>
                            <p class="mb-0 text-danger fw-bold">${errorMessage}</p>
                        </div>
                        <div class="mt-3">
                            <p class="mb-0 text-muted">
                                <i class="fas fa-lightbulb me-2"></i>
                                <small>Puedes reducir la cantidad del producto o eliminarlo del carrito para continuar.</small>
                            </p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Cerrar
                        </button>
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick="window.location.reload()">
                            <i class="fas fa-sync-alt me-2"></i>Actualizar carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Eliminar modal anterior si existe
    const existingModal = document.getElementById('stockErrorModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('stockErrorModal'));
    modal.show();
    
    // Limpiar modal después de cerrar
    document.getElementById('stockErrorModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

