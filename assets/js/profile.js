// Datos de ejemplo del usuario (en producción vendrían del backend)
let userData = {
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@ejemplo.com',
    phone: '+57 300 123 4567',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    postalCode: '110111'
};

// Pedidos de ejemplo (en producción vendrían del backend)
const orders = [
    {
        id: 'ORD-2025-001',
        date: '2025-10-15',
        products: ['Labial Mate Rosa', 'Sombras Palette Nude'],
        total: 89900,
        status: 'Entregado',
        items: [
            { name: 'Labial Mate Rosa', quantity: 1, price: 45000 },
            { name: 'Sombras Palette Nude', quantity: 1, price: 44900 }
        ]
    },
    {
        id: 'ORD-2025-002',
        date: '2025-10-10',
        products: ['Base Líquida', 'Máscara de Pestañas'],
        total: 125000,
        status: 'En Camino',
        items: [
            { name: 'Base Líquida', quantity: 1, price: 75000 },
            { name: 'Máscara de Pestañas', quantity: 1, price: 50000 }
        ]
    },
    {
        id: 'ORD-2025-003',
        date: '2025-10-05',
        products: ['Rubor Compacto', 'Iluminador'],
        total: 95000,
        status: 'Procesando',
        items: [
            { name: 'Rubor Compacto', quantity: 1, price: 42000 },
            { name: 'Iluminador', quantity: 1, price: 53000 }
        ]
    }
];

// Variables globales
let isEditing = false;
let originalData = {};

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    checkUserSession();
    
    // Cargar datos del usuario
    loadUserData();
    
    // Cargar pedidos
    loadOrders();
    
    // Event Listeners
    document.getElementById('editBtn').addEventListener('click', toggleEditMode);
    document.getElementById('cancelBtn').addEventListener('click', cancelEdit);
    document.getElementById('profileForm').addEventListener('submit', saveProfile);
    
    // Actualizar contador del carrito
    updateCartCount();
    
    // Smooth scroll para enlaces del sidebar
    document.querySelectorAll('.list-group-item-action').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.list-group-item-action').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const target = this.getAttribute('href');
            document.querySelector(target).scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});

// Verificar sesión del usuario
function checkUserSession() {
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    
    if (!session) {
        // Si no hay sesión, redirigir al login
        window.location.href = 'login.html';
        return;
    }
    
    // Actualizar nombre en el navbar
    if (session.firstName) {
        document.getElementById('userName').textContent = session.firstName;
    }
}

// Cargar datos del usuario
function loadUserData() {
    // En producción, estos datos vendrían del backend
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    
    // Si hay datos en la sesión, usarlos
    if (session) {
        userData = {
            firstName: session.firstName || userData.firstName,
            lastName: session.lastName || userData.lastName,
            email: session.email || userData.email,
            phone: session.phone || userData.phone,
            address: session.address || userData.address,
            city: session.city || userData.city,
            postalCode: session.postalCode || userData.postalCode
        };
    }
    
    // Cargar datos en el formulario
    document.getElementById('firstName').value = userData.firstName;
    document.getElementById('lastName').value = userData.lastName;
    document.getElementById('email').value = userData.email;
    document.getElementById('phone').value = userData.phone;
    document.getElementById('address').value = userData.address || '';
    document.getElementById('city').value = userData.city || '';
    document.getElementById('postalCode').value = userData.postalCode || '';
    
    // Actualizar sidebar
    document.getElementById('profileName').textContent = `${userData.firstName} ${userData.lastName}`;
    document.getElementById('profileEmail').textContent = userData.email;
}

// Activar/desactivar modo edición
function toggleEditMode() {
    isEditing = true;
    
    // Guardar datos originales
    originalData = { ...userData };
    
    // Habilitar campos
    const inputs = document.querySelectorAll('#profileForm input');
    inputs.forEach(input => {
        if (input.id !== 'email') { // El email no se puede cambiar
            input.disabled = false;
        }
    });
    
    // Mostrar botones de guardar/cancelar
    document.getElementById('formButtons').classList.remove('d-none');
    document.getElementById('editBtn').classList.add('d-none');
}

// Cancelar edición
function cancelEdit() {
    isEditing = false;
    
    // Restaurar datos originales
    userData = { ...originalData };
    loadUserData();
    
    // Deshabilitar campos
    const inputs = document.querySelectorAll('#profileForm input');
    inputs.forEach(input => input.disabled = true);
    
    // Ocultar botones de guardar/cancelar
    document.getElementById('formButtons').classList.add('d-none');
    document.getElementById('editBtn').classList.remove('d-none');
}

// Guardar perfil
function saveProfile(e) {
    e.preventDefault();
    
    // Obtener datos del formulario
    userData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value
    };
    
    // Actualizar sesión
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    if (session) {
        const updatedSession = { ...session, ...userData };
        
        if (localStorage.getItem('userSession')) {
            localStorage.setItem('userSession', JSON.stringify(updatedSession));
        } else {
            sessionStorage.setItem('userSession', JSON.stringify(updatedSession));
        }
    }
    
    // En producción, aquí se enviarían los datos al backend
    showNotification('Perfil actualizado correctamente', 'success');
    
    // Deshabilitar modo edición
    isEditing = false;
    const inputs = document.querySelectorAll('#profileForm input');
    inputs.forEach(input => input.disabled = true);
    
    document.getElementById('formButtons').classList.add('d-none');
    document.getElementById('editBtn').classList.remove('d-none');
    
    // Actualizar sidebar
    loadUserData();
}

// Cargar pedidos
function loadOrders() {
    const ordersTable = document.getElementById('ordersTable');
    
    if (orders.length === 0) {
        return; // Mantener el mensaje por defecto
    }
    
    ordersTable.innerHTML = orders.map(order => {
        const statusClass = getStatusClass(order.status);
        const statusIcon = getStatusIcon(order.status);
        
        return `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>${formatDate(order.date)}</td>
                <td>
                    <div class="small text-muted">
                        ${order.products.slice(0, 2).join(', ')}
                        ${order.products.length > 2 ? `<br><small>+${order.products.length - 2} más</small>` : ''}
                    </div>
                </td>
                <td><strong>$${order.total.toLocaleString('es-CO')}</strong></td>
                <td><span class="badge ${statusClass}">${statusIcon} ${order.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetail('${order.id}')">
                        <i class="fas fa-eye me-1"></i>Ver
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Ver detalle del pedido
function viewOrderDetail(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modalContent = document.getElementById('orderDetailContent');
    const statusClass = getStatusClass(order.status);
    
    modalContent.innerHTML = `
        <div class="mb-4">
            <div class="row">
                <div class="col-md-6 mb-3">
                    <h6 class="text-muted small mb-1">Número de Pedido</h6>
                    <p class="mb-0"><strong>${order.id}</strong></p>
                </div>
                <div class="col-md-6 mb-3">
                    <h6 class="text-muted small mb-1">Fecha</h6>
                    <p class="mb-0">${formatDate(order.date)}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <h6 class="text-muted small mb-1">Estado</h6>
                    <p class="mb-0"><span class="badge ${statusClass}">${order.status}</span></p>
                </div>
                <div class="col-md-6 mb-3">
                    <h6 class="text-muted small mb-1">Total</h6>
                    <p class="mb-0"><strong class="text-primary">$${order.total.toLocaleString('es-CO')}</strong></p>
                </div>
            </div>
        </div>
        
        <h6 class="mb-3">Productos</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead class="table-light">
                    <tr>
                        <th>Producto</th>
                        <th class="text-center">Cantidad</th>
                        <th class="text-end">Precio</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td class="text-center">${item.quantity}</td>
                            <td class="text-end">$${item.price.toLocaleString('es-CO')}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" class="text-end"><strong>Total:</strong></td>
                        <td class="text-end"><strong>$${order.total.toLocaleString('es-CO')}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
        
        <div class="alert alert-info mt-3">
            <i class="fas fa-info-circle me-2"></i>
            <small>Si tienes alguna pregunta sobre tu pedido, contáctanos a través de nuestro formulario de contacto.</small>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    modal.show();
}

// Obtener clase CSS según el estado
function getStatusClass(status) {
    switch(status) {
        case 'Entregado':
            return 'bg-success';
        case 'En Camino':
            return 'bg-info';
        case 'Procesando':
            return 'bg-warning text-dark';
        case 'Cancelado':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// Obtener icono según el estado
function getStatusIcon(status) {
    switch(status) {
        case 'Entregado':
            return '<i class="fas fa-check-circle"></i>';
        case 'En Camino':
            return '<i class="fas fa-truck"></i>';
        case 'Procesando':
            return '<i class="fas fa-clock"></i>';
        case 'Cancelado':
            return '<i class="fas fa-times-circle"></i>';
        default:
            return '<i class="fas fa-box"></i>';
    }
}

// Formatear fecha
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-CO', options);
}

// Actualizar contador del carrito
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelector('.cart-count').textContent = count;
}

// Mostrar notificación
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
