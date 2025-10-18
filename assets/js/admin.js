// Inicialización de DataTables
document.addEventListener('DOMContentLoaded', function() {
    // Configuración común para todas las tablas
    const dataTableConfig = {
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
        },
        responsive: true,
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    };

    // Inicialización de tablas
    initializeTables(dataTableConfig);
    
    // Inicialización de gráficos
    initializeCharts();
});

function initializeTables(config) {
    // Tabla de Productos
    if (document.getElementById('productsTable')) {
        new DataTable('#productsTable', {
            ...config,
            data: getProductsData(),
            columns: [
                { data: 'id' },
                { 
                    data: 'image',
                    render: data => `<img src="${data}" class="img-thumbnail" width="50">`
                },
                { data: 'name' },
                { data: 'category' },
                { 
                    data: 'price',
                    render: data => `$${parseFloat(data).toFixed(2)}`
                },
                { data: 'stock' },
                {
                    data: 'status',
                    render: data => `<span class="badge bg-${data ? 'success' : 'danger'}">${data ? 'Activo' : 'Inactivo'}</span>`
                },
                {
                    data: null,
                    render: (data, type, row) => getActionButtons(row.id, 'product')
                }
            ]
        });
    }

    // Tabla de Pedidos
    if (document.getElementById('ordersTable')) {
        new DataTable('#ordersTable', {
            ...config,
            data: getOrdersData(),
            columns: [
                { data: 'id' },
                { data: 'customer' },
                { data: 'date' },
                { 
                    data: 'total',
                    render: data => `$${parseFloat(data).toFixed(2)}`
                },
                {
                    data: 'status',
                    render: data => getStatusBadge(data)
                },
                {
                    data: null,
                    render: (data, type, row) => getActionButtons(row.id, 'order')
                }
            ]
        });
    }

    // Tabla de Clientes
    if (document.getElementById('customersTable')) {
        new DataTable('#customersTable', {
            ...config,
            data: getCustomersData(),
            columns: [
                { data: 'id' },
                { data: 'name' },
                { data: 'email' },
                { data: 'phone' },
                { data: 'registerDate' },
                { data: 'orders' },
                {
                    data: null,
                    render: (data, type, row) => getActionButtons(row.id, 'customer')
                }
            ]
        });
    }
}

function initializeCharts() {
    // Gráfico de Ventas
    if (document.getElementById('salesChart')) {
        const salesCtx = document.getElementById('salesChart').getContext('2d');
        new Chart(salesCtx, {
            type: 'line',
            data: getSalesChartData(),
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    // Gráfico de Productos
    if (document.getElementById('productsChart')) {
        const productsCtx = document.getElementById('productsChart').getContext('2d');
        new Chart(productsCtx, {
            type: 'doughnut',
            data: getProductsChartData(),
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Funciones auxiliares
function getStatusBadge(status) {
    const statusClasses = {
        'pending': 'bg-warning',
        'processing': 'bg-info',
        'completed': 'bg-success',
        'cancelled': 'bg-danger'
    };
    return `<span class="badge ${statusClasses[status]}">${status}</span>`;
}

function getActionButtons(id, type) {
    switch(type) {
        case 'product':
            return `
                <button class="btn btn-sm btn-primary" onclick="editProduct(${id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        case 'order':
            return `
                <button class="btn btn-sm btn-primary" onclick="viewOrder(${id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="updateOrderStatus(${id})">
                    <i class="fas fa-check"></i>
                </button>
            `;
        case 'customer':
            return `
                <button class="btn btn-sm btn-primary" onclick="viewCustomer(${id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editCustomer(${id})">
                    <i class="fas fa-edit"></i>
                </button>
            `;
    }
}

// Datos de ejemplo
function getProductsData() {
    return [
        {
            id: 1,
            image: 'https://via.placeholder.com/50',
            name: 'Crema Hidratante',
            category: 'Skincare',
            price: 29.99,
            stock: 50,
            status: true
        },
        // Más productos...
    ];
}

function getOrdersData() {
    return [
        {
            id: 1,
            customer: 'María García',
            date: '2025-10-06',
            total: 59.98,
            status: 'completed'
        },
        // Más pedidos...
    ];
}

function getCustomersData() {
    return [
        {
            id: 1,
            name: 'María García',
            email: 'maria@example.com',
            phone: '123-456-7890',
            registerDate: '2025-01-15',
            orders: 5
        },
        // Más clientes...
    ];
}

function getSalesChartData() {
    return {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [{
            label: 'Ventas 2025',
            data: [12, 19, 3, 5, 2, 3, 20, 33, 23, 12, 43, 32],
            borderColor: 'rgb(255, 105, 180)',
            tension: 0.1,
            fill: true,
            backgroundColor: 'rgba(255, 105, 180, 0.1)'
        }]
    };
}

function getProductsChartData() {
    return {
        labels: ['Skincare', 'Maquillaje', 'Cabello', 'Fragancias'],
        datasets: [{
            data: [30, 25, 20, 25],
            backgroundColor: [
                'rgba(255, 105, 180, 0.8)',
                'rgba(255, 20, 147, 0.8)',
                'rgba(255, 192, 203, 0.8)',
                'rgba(219, 112, 147, 0.8)'
            ]
        }]
    };
}

// Funciones de gestión
function editProduct(id) {
    showNotification(`Editando producto ${id}`);
}

function deleteProduct(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        showNotification(`Producto ${id} eliminado`, 'success');
    }
}

function viewOrder(id) {
    showNotification(`Viendo pedido ${id}`);
}

function updateOrderStatus(id) {
    showNotification(`Estado del pedido ${id} actualizado`, 'success');
}

function viewCustomer(id) {
    showNotification(`Viendo cliente ${id}`);
}

function editCustomer(id) {
    showNotification(`Editando cliente ${id}`);
}

// Sistema de notificaciones
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

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar gráficos si estamos en el dashboard
    if (window.location.href.includes('/admin/dashboard.html')) {
        initializeDashboard();
    }
});

function initializeDashboard() {
    // Gráfico de Ventas por Mes
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
            datasets: [{
                label: 'Ventas ($)',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                fill: false,
                borderColor: '#0d6efd',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });

    // Gráfico de Productos más Vendidos
    const productsCtx = document.getElementById('productsChart').getContext('2d');
    new Chart(productsCtx, {
        type: 'doughnut',
        data: {
            labels: ['Labial', 'Base', 'Mascara', 'Rubor', 'Sombras'],
            datasets: [{
                data: [300, 250, 200, 150, 100],
                backgroundColor: [
                    '#0d6efd',
                    '#6610f2',
                    '#6f42c1',
                    '#d63384',
                    '#dc3545'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}
let products = JSON.parse(localStorage.getItem('products')) || [];

function loadAdminProducts() {
    const productsTable = document.getElementById('productsTable');
    if (!productsTable) return;

    productsTable.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><img src="${product.image}" alt="${product.name}" width="50"></td>
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button onclick="editProduct(${product.id})" class="btn btn-small">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteProduct(${product.id})" class="btn btn-small btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function showModal(title = 'Añadir Producto') {
    const modal = document.getElementById('productModal');
    const modalTitle = modal.querySelector('h3');
    modalTitle.textContent = title;
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
}

function addProduct(productData) {
    const newProduct = {
        id: products.length + 1,
        ...productData,
        stock: parseInt(productData.stock),
        price: parseFloat(productData.price)
    };
    
    products.push(newProduct);
    saveProducts();
    loadAdminProducts();
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    showModal('Editar Producto');
    
    const form = document.getElementById('productForm');
    form.productName.value = product.name;
    form.productPrice.value = product.price;
    form.productStock.value = product.stock;
    form.productDescription.value = product.description;
    
    form.dataset.editId = productId;
}

function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de querer eliminar este producto?')) return;
    
    products = products.filter(p => p.id !== productId);
    saveProducts();
    loadAdminProducts();
}

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

// Inicialización del panel admin
document.addEventListener('DOMContentLoaded', () => {
    loadAdminProducts();

    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => showModal());
    }

    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const productData = {
                name: productForm.productName.value,
                price: productForm.productPrice.value,
                stock: productForm.productStock.value,
                description: productForm.productDescription.value,
                image: 'https://via.placeholder.com/200x200'  // Placeholder para demo
            };

            const editId = productForm.dataset.editId;
            if (editId) {
                // Actualizar producto existente
                products = products.map(p => 
                    p.id === parseInt(editId) ? {...p, ...productData} : p
                );
            } else {
                // Añadir nuevo producto
                addProduct(productData);
            }

            saveProducts();
            loadAdminProducts();
            closeModal();
            productForm.reset();
            delete productForm.dataset.editId;
        });
    }
});