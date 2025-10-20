
let userData = {};
let isEditing = false;
let originalData = {};

document.addEventListener('DOMContentLoaded', function() {
    checkUserSession();
    loadUserData();
    loadOrders();
    
    
    document.getElementById('editBtn').addEventListener('click', toggleEditMode);
    document.getElementById('cancelBtn').addEventListener('click', cancelEdit);
    document.getElementById('profileForm').addEventListener('submit', saveProfile);
    
    
    updateCartCount();
    
    
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


function checkUserSession() {
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const userNameElement = document.getElementById('userName');
    if (userNameElement && session.firstName) {
        userNameElement.textContent = session.firstName;
    }
}


async function loadUserData() {
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    
    if (!session || !session.id) return;

    try {
        const user = await API.getUser(session.id);
        
        userData = {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone || '',
            address: user.address || '',
            city: user.city || '',
            postalCode: user.postal_code || '',
            role: user.role
        };

        document.getElementById('firstName').value = userData.firstName;
        document.getElementById('lastName').value = userData.lastName;
        document.getElementById('email').value = userData.email;
        document.getElementById('phone').value = userData.phone;
        document.getElementById('address').value = userData.address;
        document.getElementById('city').value = userData.city;
        document.getElementById('postalCode').value = userData.postalCode;

        document.getElementById('profileName').textContent = `${userData.firstName} ${userData.lastName}`;
        document.getElementById('profileEmail').textContent = userData.email;

        const statusBadge = document.querySelector('.badge.bg-success');
        if (statusBadge) {
            if (user.role === 'ADMIN') {
                statusBadge.className = 'badge bg-primary';
                statusBadge.textContent = 'Administrador';
            } else {
                statusBadge.className = 'badge bg-success';
                statusBadge.textContent = 'Cliente Activo';
            }
        }

        const updatedSession = {
            ...session,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone || '',
            address: user.address || '',
            city: user.city || '',
            postalCode: user.postal_code || '',
            role: user.role,
            isAdmin: user.role === 'ADMIN'
        };

        if (localStorage.getItem('userSession')) {
            localStorage.setItem('userSession', JSON.stringify(updatedSession));
        } else {
            sessionStorage.setItem('userSession', JSON.stringify(updatedSession));
        }
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        showNotification('Error al cargar datos del usuario', 'danger');
    }
}


function toggleEditMode() {
    isEditing = true;
    
    
    originalData = { ...userData };
    
    
    const inputs = document.querySelectorAll('#profileForm input');
    inputs.forEach(input => {
        if (input.id !== 'email') { 
            input.disabled = false;
        }
    });
    
    
    document.getElementById('formButtons').classList.remove('d-none');
    document.getElementById('editBtn').classList.add('d-none');
}


function cancelEdit() {
    isEditing = false;

    document.getElementById('firstName').value = originalData.firstName;
    document.getElementById('lastName').value = originalData.lastName;
    document.getElementById('email').value = originalData.email;
    document.getElementById('phone').value = originalData.phone;
    document.getElementById('address').value = originalData.address;
    document.getElementById('city').value = originalData.city;
    document.getElementById('postalCode').value = originalData.postalCode;

    const inputs = document.querySelectorAll('#profileForm input');
    inputs.forEach(input => input.disabled = true);

    document.getElementById('formButtons').classList.add('d-none');
    document.getElementById('editBtn').classList.remove('d-none');
}


async function saveProfile(e) {
    e.preventDefault();
    
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    if (!session || !session.id) return;

    const updatedData = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postal_code: document.getElementById('postalCode').value
    };

    try {
        await API.updateUser(session.id, updatedData);

        const updatedSession = {
            ...session,
            firstName: updatedData.first_name,
            lastName: updatedData.last_name,
            email: updatedData.email,
            phone: updatedData.phone,
            address: updatedData.address,
            city: updatedData.city,
            postalCode: updatedData.postal_code
        };

        if (localStorage.getItem('userSession')) {
            localStorage.setItem('userSession', JSON.stringify(updatedSession));
        } else {
            sessionStorage.setItem('userSession', JSON.stringify(updatedSession));
        }

        showNotification('Perfil actualizado correctamente', 'success');

        isEditing = false;
        const inputs = document.querySelectorAll('#profileForm input');
        inputs.forEach(input => input.disabled = true);

        document.getElementById('formButtons').classList.add('d-none');
        document.getElementById('editBtn').classList.remove('d-none');

        await loadUserData();

        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    } catch (error) {
        console.error('Error al actualizar:', error);
        showNotification('Error al actualizar perfil', 'danger');
    }
}


async function loadOrders() {
    const ordersTable = document.getElementById('ordersTable');
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    
    if (!session || !session.id) {
        ordersTable.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No hay pedidos disponibles.</td></tr>';
        return;
    }

    try {
        const orders = await API.getUserOrders(session.id);
        
        if (orders.length === 0) {
            ordersTable.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No tienes pedidos aún.</td></tr>';
            return;
        }
        
        ordersTable.innerHTML = orders.map(order => {
            const statusClass = getStatusClass(order.status);
            const statusIcon = getStatusIcon(order.status);
            const productNames = order.products.map(p => p.name);
            
            return `
                <tr>
                    <td><strong>#${order.id}</strong></td>
                    <td>${formatDate(order.date)}</td>
                    <td>
                        <div class="small text-muted">
                            ${productNames.slice(0, 2).join(', ')}
                            ${productNames.length > 2 ? `<br><small>+${productNames.length - 2} más</small>` : ''}
                        </div>
                    </td>
                    <td><strong>$${order.total.toLocaleString('es-CO')}</strong></td>
                    <td><span class="badge ${statusClass}">${statusIcon} ${translateStatus(order.status)}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetail(${order.id})">
                            <i class="fas fa-eye me-1"></i>Ver
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        window.userOrders = orders;
    } catch (error) {
        console.error('Error al cargar órdenes:', error);
        ordersTable.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-danger">Error al cargar pedidos.</td></tr>';
    }
}


function viewOrderDetail(orderId) {
    const orders = window.userOrders || [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modalContent = document.getElementById('orderDetailContent');
    const statusClass = getStatusClass(order.status);
    
    modalContent.innerHTML = `
        <div class="mb-4">
            <div class="row">
                <div class="col-md-6 mb-3">
                    <h6 class="text-muted small mb-1">Número de Pedido</h6>
                    <p class="mb-0"><strong>#${order.id}</strong></p>
                </div>
                <div class="col-md-6 mb-3">
                    <h6 class="text-muted small mb-1">Fecha</h6>
                    <p class="mb-0">${formatDate(order.date)}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <h6 class="text-muted small mb-1">Estado</h6>
                    <p class="mb-0"><span class="badge ${statusClass}">${translateStatus(order.status)}</span></p>
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
                    ${order.products.map(item => `
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


function translateStatus(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'processing': 'Procesando',
        'completed': 'Completado',
        'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
}

function getStatusClass(status) {
    switch(status) {
        case 'completed':
            return 'bg-success';
        case 'processing':
            return 'bg-info';
        case 'pending':
            return 'bg-warning text-dark';
        case 'cancelled':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}


function getStatusIcon(status) {
    switch(status) {
        case 'completed':
            return '<i class="fas fa-check-circle"></i>';
        case 'processing':
            return '<i class="fas fa-truck"></i>';
        case 'pending':
            return '<i class="fas fa-clock"></i>';
        case 'cancelled':
            return '<i class="fas fa-times-circle"></i>';
        default:
            return '<i class="fas fa-box"></i>';
    }
}


function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-CO', options);
}


function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelector('.cart-count').textContent = count;
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
