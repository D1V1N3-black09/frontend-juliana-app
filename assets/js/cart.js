// Obtener el carrito del localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const shipping = 50000; // Costo fijo de envío

// Renderizar items del carrito
function renderCartItems() {
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

    cartItems.innerHTML = cart.map((item, index) => `
        <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div class="border rounded shadow-sm" style="width: 100px; height: 100px; overflow: hidden;">
                <img src="${item.img}" alt="${item.name}" class="w-100 h-100" style="object-fit: cover;">
            </div>
            <div class="ms-3 flex-grow-1">
                <h4 class="h6 mb-1">${item.name}</h4>
                <p class="text-muted mb-0">$${item.price.toFixed(0)}</p>
                <div class="mt-2 text-muted small">Cantidad:</div>
            </div>
            <div class="d-flex align-items-center">
                <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${index}, -1)" ${item.qty <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-minus"></i>
                </button>
                <span class="mx-3 h5 mb-0">${item.qty}</span>
                <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${index}, 1)">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm ms-3" onclick="removeItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    updateTotals();
}

// Actualizar cantidad de un item
function updateQuantity(index, change) {
    if (!cart[index]) return;
    
    const newQty = cart[index].qty + change;
    if (newQty < 1) return;
    
    cart[index].qty = newQty;
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
}

// Eliminar item del carrito
function removeItem(index) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartCount();
    }
}

// Actualizar totales
function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(0)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(0)}`;
    document.getElementById('total').textContent = `$${total.toFixed(0)}`;
}

// Actualizar contador del carrito
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelector('.cart-count').textContent = count;
}

// Proceder al pago
document.getElementById('checkoutBtn')?.addEventListener('click', function() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega algunos productos antes de proceder al pago.');
        return;
    }
    
    // Aquí iría la lógica de pago
    alert('¡Gracias por tu compra! Procesando el pago...');
});

// Aplicar cupón
document.getElementById('applyCoupon')?.addEventListener('click', function() {
    const couponCode = document.getElementById('coupon').value.trim();
    if (!couponCode) {
        alert('Por favor ingresa un código de cupón');
        return;
    }
    
    // Aquí iría la validación del cupón
    alert('Código de cupón inválido o expirado');
});

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    renderCartItems();
    updateCartCount();
});
