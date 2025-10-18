// Datos de ejemplo para productos (simula una base de datos)
let products = [
    {
        id: 1,
        name: "Crema Hidratante",
        price: 29.99,
        image: "https://via.placeholder.com/300x300?text=Crema+Hidratante",
        description: "Crema hidratante para todo tipo de piel",
        category: "skincare"
    },
    {
        id: 2,
        name: "Labial Mate",
        price: 19.99,
        image: "https://via.placeholder.com/300x300?text=Labial+Mate",
        description: "Labial de larga duración",
        category: "makeup"
    },
    {
        id: 3,
        name: "Sérum Facial",
        price: 45.99,
        image: "https://via.placeholder.com/300x300?text=Serum+Facial",
        description: "Sérum con vitamina C para un rostro radiante",
        category: "skincare"
    },
    {
        id: 4,
        name: "Base de Maquillaje HD",
        price: 39.99,
        image: "https://via.placeholder.com/300x300?text=Base+HD",
        description: "Base de alta definición para un acabado profesional",
        category: "makeup"
    },
    {
        id: 5,
        name: "Máscara de Pestañas Volumen",
        price: 24.99,
        image: "https://via.placeholder.com/300x300?text=Mascara+Pestanas",
        description: "Máscara para pestañas con efecto volumen dramático",
        category: "makeup"
    },
    {
        id: 6,
        name: "Agua Micelar",
        price: 15.99,
        image: "https://via.placeholder.com/300x300?text=Agua+Micelar",
        description: "Limpiador suave y desmaquillante todo en uno",
        category: "skincare"
    }
];

// Cargar productos en la página principal
function loadProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = products.map(product => `
        <div class="col-md-6 col-lg-4" data-aos="fade-up">
            <div class="card h-100 border-0 shadow-sm product-card">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body text-center">
                    <h3 class="h5 mb-2">${product.name}</h3>
                    <p class="text-muted mb-3">${product.description}</p>
                    <p class="h4 text-primary mb-3">$${product.price.toFixed(2)}</p>
                    <button onclick="addToCart(${product.id})" class="btn btn-primary">
                        <i class="fas fa-shopping-cart me-2"></i>Añadir al Carrito
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Carrito de compras
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Revisar si el producto ya está en el carrito
        const existingProduct = cart.find(item => item.id === productId);
        
        if (existingProduct) {
            // Si existe, incrementar cantidad
            existingProduct.quantity = (existingProduct.quantity || 1) + 1;
        } else {
            // Si no existe, añadir con cantidad 1
            cart.push({...product, quantity: 1});
        }
        
        // Guardar en localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Actualizar contador
        updateCartCount();
        
        // Mostrar notificación
        showNotification('¡Producto añadido al carrito!');
    }
}

function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'position-fixed top-0 end-0 p-3';
    notification.style.zIndex = '1070';
    
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Beautiful Girl</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    notification.appendChild(toast);
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
});
