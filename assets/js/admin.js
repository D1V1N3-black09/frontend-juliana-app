/**
 * SISTEMA DE ADMINISTRACIÓN - BEAUTIFUL GIRL
 * Gestión completa del panel de administración
 * Incluye CRUD de productos, órdenes, clientes y reportes
 */

// ==========================================
// DATOS GLOBALES
// ==========================================
let products = [];
let orders = [];
let customers = [];

// Variables de paginación y filtros - Productos
let currentPage = 1;
let itemsPerPage = 10;
let filteredProducts = [];

// Variables de paginación y filtros - Órdenes
let currentOrdersPage = 1;
let ordersPerPage = 10;
let filteredOrders = [];

// Variables de paginación y filtros - Clientes
let currentCustomersPage = 1;
let customersPerPage = 10;
let filteredCustomers = [];

// ==========================================
// CARGA DE PRODUCTOS DESDE JSON
// ==========================================
async function cargarProductosAdmin() {
    try {
        const response = await fetch('../../data/products.json');
        if (!response.ok) throw new Error('Error al cargar productos');
        
        products = await response.json();
        
        // Inicializar productos filtrados con todos los productos
        filteredProducts = [...products];
        
        // Cargar productos en la tabla
        loadProductsTable();
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        
        // Si no se puede cargar el JSON, intentar cargar del localStorage
        const storedProducts = localStorage.getItem('beautifulgirl_products');
        if (storedProducts) {
            try {
                products = JSON.parse(storedProducts);
                filteredProducts = [...products];
                loadProductsTable();
                showNotification('Productos cargados desde el almacenamiento local', 'info');
            } catch (e) {
                showNotification('Error al cargar los productos', 'danger');
            }
        } else {
            showNotification('No se pudieron cargar los productos. Recarga la página.', 'danger');
        }
    }
}

// ==========================================
// INICIALIZACIÓN DEL DASHBOARD
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que estamos en la página del dashboard
    const dashboardCheck = document.getElementById('section-dashboard');
    if (!dashboardCheck) return;

    // Inicializar navegación del sidebar
    initializeSidebarNavigation();

    // Cargar todos los datos
    cargarProductosAdmin();
    loadDemoOrders();
    loadDemoCustomers();

    // Inicializar gráficos
    initializeCharts();

    // Configurar botón de agregar producto
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', openCreateProductModal);
    }

    // Configurar formulario de productos
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductFormSubmit);
    }

    // Configurar vista previa de imagen
    const productImage = document.getElementById('productImage');
    if (productImage) {
        productImage.addEventListener('input', updateImagePreview);
    }

    // Configurar filtros
    const searchProduct = document.getElementById('searchProduct');
    const filterCategory = document.getElementById('filterCategory');
    const filterStatus = document.getElementById('filterStatus');
    const itemsPerPageSelect = document.getElementById('itemsPerPage');

    if (searchProduct) {
        searchProduct.addEventListener('input', function() {
            currentPage = 1;
            applyFilters();
        });
    }

    if (filterCategory) {
        filterCategory.addEventListener('change', function() {
            currentPage = 1;
            applyFilters();
        });
    }

    if (filterStatus) {
        filterStatus.addEventListener('change', function() {
            currentPage = 1;
            applyFilters();
        });
    }

    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', function() {
            itemsPerPage = parseInt(this.value);
            currentPage = 1;
            loadProductsTable();
        });
    }

    // Configurar botones de cerrar sesión (navbar y sidebar)
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('userType');
                window.location.href = '../login.html';
            }
        });
    });
});

// ==========================================
// GESTIÓN DE FILTROS Y PAGINACIÓN
// ==========================================

/**
 * Aplica los filtros a los productos
 */
function applyFilters() {
    const searchTerm = document.getElementById('searchProduct')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('filterCategory')?.value || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';

    filteredProducts = products.filter(product => {
        const matchSearch = searchTerm === '' || 
                           product.name.toLowerCase().includes(searchTerm) ||
                           product.id.toString().includes(searchTerm);
        const matchCategory = categoryFilter === '' || product.category === categoryFilter;
        const matchStatus = statusFilter === '' || product.status === statusFilter;

        return matchSearch && matchCategory && matchStatus;
    });

    loadProductsTable();
}

/**
 * Renderiza los controles de paginación
 */
function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginationControls = document.getElementById('paginationControls');
    
    if (!paginationControls) return;

    if (totalPages <= 1) {
        paginationControls.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Botón anterior
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;

    // Páginas numeradas
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(1); return false;">1</a>
            </li>
        `;
        if (startPage > 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a>
            </li>
        `;
    }

    // Botón siguiente
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;

    paginationControls.innerHTML = paginationHTML;
}

/**
 * Cambia la página actual
 */
function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    loadProductsTable();
}

/**
 * Actualiza la información de paginación
 */
function updatePaginationInfo() {
    const paginationInfo = document.getElementById('paginationInfo');
    if (!paginationInfo) return;

    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filteredProducts.length);
    const total = filteredProducts.length;

    paginationInfo.textContent = `Mostrando ${start} - ${end} de ${total} productos`;
}

// ==========================================
// GESTIÓN DE TABLA DE PRODUCTOS
// ==========================================

/**
 * Carga los productos en la tabla con paginación
 */
function loadProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (filteredProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    <i class="fas fa-box-open fa-3x mb-3 d-block"></i>
                    ${products.length === 0 
                        ? 'No hay productos registrados. Haz clic en "Crear Producto" para agregar uno.'
                        : 'No se encontraron productos con los filtros aplicados.'}
                </td>
            </tr>
        `;
        updatePaginationInfo();
        renderPagination();
        return;
    }

    // Calcular productos de la página actual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    tbody.innerHTML = productsToShow.map(product => {
        // Ajustar ruta de imagen para el dashboard (que está en pages/admin/)
        const imagePath = product.image.replace('../assets/', '../../assets/');
        
        return `
        <tr data-product-id="${product.id}">
            <td>
                <span class="badge bg-primary">#${product.id}</span>
            </td>
            <td>
                <img src="${imagePath}" 
                     alt="${product.name}" 
                     class="img-thumbnail rounded" 
                     style="width: 60px; height: 60px; object-fit: cover;"
                     onerror="this.src='https://via.placeholder.com/60?text=Sin+Imagen'">
            </td>
            <td>
                <strong>${product.name}</strong>
            </td>
            <td>
                <span class="badge bg-secondary">${product.category}</span>
            </td>
            <td>
                <strong class="text-success">$${formatPrice(product.price)}</strong>
            </td>
            <td>
                <span class="badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                    ${product.stock} unid.
                </span>
            </td>
            <td>
                <span class="badge ${product.status === 'visible' ? 'bg-success' : 'bg-secondary'}">
                    <i class="fas fa-${product.status === 'visible' ? 'eye' : 'eye-slash'} me-1"></i>
                    ${product.status === 'visible' ? 'Visible' : 'Oculto'}
                </span>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" 
                            onclick="editProduct(${product.id})"
                            title="Editar producto">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-${product.status === 'visible' ? 'warning' : 'success'}" 
                            onclick="toggleProductVisibility(${product.id})"
                            title="${product.status === 'visible' ? 'Ocultar' : 'Mostrar'} producto">
                        <i class="fas fa-eye${product.status === 'visible' ? '-slash' : ''}"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="deleteProduct(${product.id})"
                            title="Eliminar producto">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');

    // Actualizar información y controles de paginación
    updatePaginationInfo();
    renderPagination();
}

// ==========================================
// OPERACIONES CRUD DE PRODUCTOS
// ==========================================

/**
 * Abre el modal para crear un nuevo producto
 */
function openCreateProductModal() {
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.getElementById('productModalLabel');
    const form = document.getElementById('productForm');
    
    modalTitle.textContent = 'Crear Nuevo Producto';
    form.reset();
    delete form.dataset.editingId;
    
    // Ocultar vista previa
    document.getElementById('imagePreview').style.display = 'none';
    
    modal.show();
}

/**
 * Edita un producto existente
 */
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showNotification('Producto no encontrado', 'danger');
        return;
    }

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.getElementById('productModalLabel');
    const form = document.getElementById('productForm');
    
    modalTitle.textContent = 'Editar Producto';
    
    // Llenar el formulario con los datos del producto
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productStatus').value = product.status;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productImage').value = product.image;
    
    // Mostrar vista previa de la imagen (ajustando ruta para dashboard)
    const previewImg = document.getElementById('previewImg');
    const imagePath = product.image.replace('../assets/', '../../assets/');
    previewImg.src = imagePath;
    document.getElementById('imagePreview').style.display = 'block';
    
    // Guardar ID del producto que se está editando
    form.dataset.editingId = productId;
    
    modal.show();
}

/**
 * Alterna la visibilidad de un producto (Ocultar/Mostrar)
 */
function toggleProductVisibility(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStatus = product.status === 'visible' ? 'hidden' : 'visible';
    product.status = newStatus;
    
    saveProducts();
    loadProductsTable();
    
    const statusText = newStatus === 'visible' ? 'visible' : 'oculto';
    showNotification(`Producto "${product.name}" ahora está ${statusText}`, 'success');
}

/**
 * Elimina un producto
 */
function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (!confirm(`¿Estás seguro de que deseas eliminar "${product.name}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }

    products = products.filter(p => p.id !== productId);
    saveProducts();
    loadProductsTable();
    
    showNotification(`Producto "${product.name}" eliminado correctamente`, 'success');
}

/**
 * Maneja el envío del formulario de productos
 */
function handleProductFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const editingId = form.dataset.editingId;
    
    // Recopilar datos del formulario
    const productData = {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        status: document.getElementById('productStatus').value,
        description: document.getElementById('productDescription').value.trim(),
        image: document.getElementById('productImage').value.trim()
    };

    // Validar datos
    if (!productData.name || !productData.category || !productData.image) {
        showNotification('Por favor completa todos los campos obligatorios', 'warning');
        return;
    }

    if (productData.price <= 0) {
        showNotification('El precio debe ser mayor a 0', 'warning');
        return;
    }

    if (productData.stock < 0) {
        showNotification('El stock no puede ser negativo', 'warning');
        return;
    }

    try {
        if (editingId) {
            // Actualizar producto existente
            const index = products.findIndex(p => p.id === parseInt(editingId));
            if (index !== -1) {
                products[index] = {
                    ...products[index],
                    ...productData
                };
                showNotification('Producto actualizado correctamente', 'success');
            }
        } else {
            // Crear nuevo producto
            const newProduct = {
                id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
                ...productData
            };
            products.push(newProduct);
            showNotification('Producto creado correctamente', 'success');
        }

        // Guardar cambios
        saveProducts();
        loadProductsTable();
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
        
        // Limpiar formulario
        form.reset();
        delete form.dataset.editingId;
        
    } catch (error) {
        console.error('Error guardando producto:', error);
        showNotification('Error al guardar el producto', 'danger');
    }
}

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

/**
 * Guarda los productos en localStorage
 * NOTA: En un proyecto real, aquí se haría una petición al backend para actualizar el JSON
 * Para este proyecto escolar, usamos localStorage como simulación de persistencia
 */
function saveProducts() {
    try {
        localStorage.setItem('beautifulgirl_products', JSON.stringify(products));
        console.log('Productos guardados correctamente');
    } catch (e) {
        console.error('Error guardando productos en localStorage:', e);
        showNotification('Error al guardar los cambios', 'danger');
    }
}

/**
 * Formatea el precio para mostrar
 */
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

/**
 * Actualiza la vista previa de la imagen
 */
function updateImagePreview() {
    const imageUrl = document.getElementById('productImage').value;
    const previewContainer = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (imageUrl.trim()) {
        // Ajustar ruta si es relativa para que funcione en el dashboard
        let adjustedUrl = imageUrl;
        if (imageUrl.startsWith('../assets/')) {
            adjustedUrl = imageUrl.replace('../assets/', '../../assets/');
        }
        
        previewImg.src = adjustedUrl;
        previewImg.onerror = function() {
            previewContainer.style.display = 'none';
        };
        previewImg.onload = function() {
            previewContainer.style.display = 'block';
        };
    } else {
        previewContainer.style.display = 'none';
    }
}

/**
 * Sistema de notificaciones con Bootstrap Toast
 */
function showNotification(message, type = 'info') {
    // Crear contenedor de toasts si no existe
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    // Mapear tipos a colores de Bootstrap
    const bgClass = {
        'success': 'bg-success',
        'danger': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info',
        'primary': 'bg-primary'
    }[type] || 'bg-info';

    // Crear toast
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white ${bgClass} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toastEl);
    
    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 3000
    });
    
    toast.show();
    
    // Eliminar el toast del DOM después de ocultarse
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

// ==========================================
// INICIALIZACIÓN DE GRÁFICOS
// ==========================================

function initializeCharts() {
    // Gráfico de Ventas por Mes
    const salesCanvas = document.getElementById('salesChart');
    if (salesCanvas) {
        const salesCtx = salesCanvas.getContext('2d');
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'],
                datasets: [{
                    label: 'Ventas ($)',
                    data: [1200000, 1900000, 1500000, 2500000, 2200000, 3000000, 2800000, 3200000, 2900000, 3500000],
                    fill: true,
                    backgroundColor: 'rgba(255, 105, 180, 0.1)',
                    borderColor: 'rgba(255, 105, 180, 1)',
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Ventas: $' + formatPrice(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + formatPrice(value);
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de Productos más Vendidos
    const productsCanvas = document.getElementById('productsChart');
    if (productsCanvas) {
        const productsCtx = productsCanvas.getContext('2d');
        new Chart(productsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Cuidado Facial', 'Maquillaje', 'Fragancias', 'Cuidado Corporal', 'Cabello'],
                datasets: [{
                    data: [300, 250, 200, 150, 100],
                    backgroundColor: [
                        'rgba(255, 105, 180, 0.8)',
                        'rgba(255, 20, 147, 0.8)',
                        'rgba(255, 192, 203, 0.8)',
                        'rgba(219, 112, 147, 0.8)',
                        'rgba(255, 182, 193, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
}

// ==========================================
// NAVEGACIÓN DEL SIDEBAR
// ==========================================

/**
 * Inicializa la navegación entre secciones del sidebar
 */
function initializeSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('#sidebar .nav-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.dataset.section;
            
            // Remover clase active de todos los links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al link clickeado
            this.classList.add('active');
            
            // Ocultar TODAS las secciones con force
            const allSections = document.querySelectorAll('.admin-section');
            allSections.forEach(s => {
                s.style.display = 'none';
                s.style.visibility = 'hidden';
            });
            
            // Mostrar SOLO la sección seleccionada
            const targetSection = document.getElementById(`section-${section}`);
            
            if (targetSection) {
                // Forzar display block
                targetSection.style.display = 'block';
                targetSection.style.visibility = 'visible';
                
                // Scroll to top
                window.scrollTo(0, 0);
                
                // Cargar datos específicos de la sección
                switch(section) {
                    case 'products':
                        if (products.length > 0) loadProductsTable();
                        break;
                    case 'orders':
                        loadOrdersTable();
                        break;
                    case 'customers':
                        loadCustomersTable();
                        break;
                    case 'reports':
                        initializeReportDates();
                        break;
                }
            }
        });
    });
}

// ==========================================
// GESTIÓN DE ÓRDENES
// ==========================================

/**
 * Carga datos de demostración de órdenes
 */
function loadDemoOrders() {
    // Datos de demostración para el proyecto escolar
    orders = [
        {
            id: 1,
            customer: { name: 'María García', email: 'maria@email.com', phone: '3001234567', address: 'Calle 123 #45-67' },
            date: '2025-10-15',
            products: [
                { name: 'Base Aura', quantity: 2, price: 49900 },
                { name: 'Labial Matte', quantity: 1, price: 35900 }
            ],
            total: 135700,
            status: 'completed'
        },
        {
            id: 2,
            customer: { name: 'Ana Rodríguez', email: 'ana@email.com', phone: '3109876543', address: 'Carrera 45 #12-34' },
            date: '2025-10-16',
            products: [
                { name: 'Crema Facial', quantity: 1, price: 65900 },
                { name: 'Serum Vitamina C', quantity: 1, price: 89900 }
            ],
            total: 155800,
            status: 'processing'
        },
        {
            id: 3,
            customer: { name: 'Laura Martínez', email: 'laura@email.com', phone: '3201234567', address: 'Avenida 68 #23-45' },
            date: '2025-10-17',
            products: [
                { name: 'Base Mouse', quantity: 1, price: 45900 }
            ],
            total: 45900,
            status: 'pending'
        },
        {
            id: 4,
            customer: { name: 'Carolina López', email: 'carolina@email.com', phone: '3159876543', address: 'Transversal 12 #34-56' },
            date: '2025-10-18',
            products: [
                { name: 'Máscara de Pestañas', quantity: 2, price: 42900 },
                { name: 'Delineador', quantity: 1, price: 29900 }
            ],
            total: 115700,
            status: 'completed'
        },
        {
            id: 5,
            customer: { name: 'Valentina Gómez', email: 'valentina@email.com', phone: '3187654321', address: 'Diagonal 78 #90-12' },
            date: '2025-10-19',
            products: [
                { name: 'Base Queen', quantity: 1, price: 55900 },
                { name: 'Polvo Compacto', quantity: 1, price: 39900 }
            ],
            total: 95800,
            status: 'processing'
        }
    ];
    
    filteredOrders = [...orders];
}

/**
 * Carga la tabla de órdenes
 */
function loadOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    <i class="fas fa-inbox fa-3x mb-3 d-block"></i>
                    No hay órdenes registradas.
                </td>
            </tr>
        `;
        return;
    }
    
    const startIndex = (currentOrdersPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const ordersToShow = filteredOrders.slice(startIndex, endIndex);
    
    tbody.innerHTML = ordersToShow.map(order => {
        const statusColors = {
            pending: 'warning',
            processing: 'info',
            completed: 'success',
            cancelled: 'danger'
        };
        
        const statusTexts = {
            pending: 'Pendiente',
            processing: 'En Proceso',
            completed: 'Completada',
            cancelled: 'Cancelada'
        };
        
        return `
            <tr>
                <td><span class="badge bg-primary">#${order.id}</span></td>
                <td>${order.customer.name}</td>
                <td>${formatDate(order.date)}</td>
                <td>${order.products.length} producto(s)</td>
                <td><strong class="text-success">$${formatPrice(order.total)}</strong></td>
                <td><span class="badge bg-${statusColors[order.status]}">${statusTexts[order.status]}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="viewOrderDetail(${order.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    updateOrdersPagination();
}

/**
 * Actualiza la paginación de órdenes
 */
function updateOrdersPagination() {
    const paginationInfo = document.getElementById('ordersPaginationInfo');
    const paginationControls = document.getElementById('ordersPaginationControls');
    
    if (!paginationInfo || !paginationControls) return;
    
    const start = (currentOrdersPage - 1) * ordersPerPage + 1;
    const end = Math.min(currentOrdersPage * ordersPerPage, filteredOrders.length);
    const total = filteredOrders.length;
    
    paginationInfo.textContent = `Mostrando ${start} - ${end} de ${total} órdenes`;
    
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    let paginationHTML = '';
    
    if (totalPages <= 1) {
        paginationControls.innerHTML = '';
        return;
    }
    
    // Botón anterior
    paginationHTML += `
        <li class="page-item ${currentOrdersPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeOrdersPage(${currentOrdersPage - 1}); return false;">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Páginas
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentOrdersPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changeOrdersPage(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    // Botón siguiente
    paginationHTML += `
        <li class="page-item ${currentOrdersPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeOrdersPage(${currentOrdersPage + 1}); return false;">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    paginationControls.innerHTML = paginationHTML;
}

/**
 * Cambia la página de órdenes
 */
function changeOrdersPage(page) {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    if (page < 1 || page > totalPages) return;
    currentOrdersPage = page;
    loadOrdersTable();
}

/**
 * Muestra el detalle de una orden
 */
function viewOrderDetail(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    
    document.getElementById('orderDetailId').textContent = order.id;
    document.getElementById('orderCustomerName').textContent = order.customer.name;
    document.getElementById('orderCustomerEmail').textContent = order.customer.email;
    document.getElementById('orderCustomerPhone').textContent = order.customer.phone;
    document.getElementById('orderCustomerAddress').textContent = order.customer.address;
    document.getElementById('orderDate').textContent = formatDate(order.date);
    
    const productsList = document.getElementById('orderProductsList');
    productsList.innerHTML = order.products.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${p.quantity}</td>
            <td>$${formatPrice(p.price)}</td>
            <td>$${formatPrice(p.price * p.quantity)}</td>
        </tr>
    `).join('');
    
    document.getElementById('orderTotalAmount').textContent = '$' + formatPrice(order.total);
    
    const statusBadge = document.getElementById('orderStatus');
    const statusColors = { pending: 'bg-warning', processing: 'bg-info', completed: 'bg-success', cancelled: 'bg-danger' };
    const statusTexts = { pending: 'Pendiente', processing: 'En Proceso', completed: 'Completada', cancelled: 'Cancelada' };
    statusBadge.className = `badge ${statusColors[order.status]}`;
    statusBadge.textContent = statusTexts[order.status];
    
    document.getElementById('updateOrderStatus').value = order.status;
    
    // Configurar botón de guardar
    const saveBtn = document.getElementById('saveOrderStatusBtn');
    saveBtn.onclick = function() {
        const newStatus = document.getElementById('updateOrderStatus').value;
        order.status = newStatus;
        loadOrdersTable();
        modal.hide();
        showNotification('Estado de la orden actualizado correctamente', 'success');
    };
    
    modal.show();
}

// ==========================================
// GESTIÓN DE CLIENTES
// ==========================================

/**
 * Carga datos de demostración de clientes
 */
function loadDemoCustomers() {
    customers = [
        { id: 1, name: 'María García', email: 'maria@email.com', phone: '3001234567', orders: 5, totalSpent: 678500, registerDate: '2025-01-15' },
        { id: 2, name: 'Ana Rodríguez', email: 'ana@email.com', phone: '3109876543', orders: 3, totalSpent: 467200, registerDate: '2025-02-20' },
        { id: 3, name: 'Laura Martínez', email: 'laura@email.com', phone: '3201234567', orders: 8, totalSpent: 1234500, registerDate: '2025-01-10' },
        { id: 4, name: 'Carolina López', email: 'carolina@email.com', phone: '3159876543', orders: 4, totalSpent: 578900, registerDate: '2025-03-05' },
        { id: 5, name: 'Valentina Gómez', email: 'valentina@email.com', phone: '3187654321', orders: 6, totalSpent: 892300, registerDate: '2025-02-15' },
        { id: 6, name: 'Sofía Hernández', email: 'sofia@email.com', phone: '3124567890', orders: 2, totalSpent: 234000, registerDate: '2025-04-01' },
        { id: 7, name: 'Isabella Díaz', email: 'isabella@email.com', phone: '3176543210', orders: 7, totalSpent: 1056700, registerDate: '2025-01-25' },
        { id: 8, name: 'Camila Torres', email: 'camila@email.com', phone: '3198765432', orders: 5, totalSpent: 723400, registerDate: '2025-03-10' }
    ];
    
    filteredCustomers = [...customers];
}

/**
 * Carga la tabla de clientes
 */
function loadCustomersTable() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    
    if (filteredCustomers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    <i class="fas fa-users fa-3x mb-3 d-block"></i>
                    No hay clientes registrados.
                </td>
            </tr>
        `;
        return;
    }
    
    const startIndex = (currentCustomersPage - 1) * customersPerPage;
    const endIndex = startIndex + customersPerPage;
    const customersToShow = filteredCustomers.slice(startIndex, endIndex);
    
    tbody.innerHTML = customersToShow.map(customer => `
        <tr>
            <td><span class="badge bg-primary">#${customer.id}</span></td>
            <td><strong>${customer.name}</strong></td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td><span class="badge bg-info">${customer.orders}</span></td>
            <td><strong class="text-success">$${formatPrice(customer.totalSpent)}</strong></td>
            <td>${formatDate(customer.registerDate)}</td>
        </tr>
    `).join('');
    
    updateCustomersPagination();
}

/**
 * Actualiza la paginación de clientes
 */
function updateCustomersPagination() {
    const paginationInfo = document.getElementById('customersPaginationInfo');
    const paginationControls = document.getElementById('customersPaginationControls');
    
    if (!paginationInfo || !paginationControls) return;
    
    const start = (currentCustomersPage - 1) * customersPerPage + 1;
    const end = Math.min(currentCustomersPage * customersPerPage, filteredCustomers.length);
    const total = filteredCustomers.length;
    
    paginationInfo.textContent = `Mostrando ${start} - ${end} de ${total} clientes`;
    
    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
    let paginationHTML = '';
    
    if (totalPages <= 1) {
        paginationControls.innerHTML = '';
        return;
    }
    
    // Botón anterior
    paginationHTML += `
        <li class="page-item ${currentCustomersPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeCustomersPage(${currentCustomersPage - 1}); return false;">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Páginas
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentCustomersPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changeCustomersPage(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    // Botón siguiente
    paginationHTML += `
        <li class="page-item ${currentCustomersPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeCustomersPage(${currentCustomersPage + 1}); return false;">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    paginationControls.innerHTML = paginationHTML;
}

/**
 * Cambia la página de clientes
 */
function changeCustomersPage(page) {
    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
    if (page < 1 || page > totalPages) return;
    currentCustomersPage = page;
    loadCustomersTable();
}

// ==========================================
// SISTEMA DE REPORTES
// ==========================================

/**
 * Inicializa las fechas del reporte
 */
function initializeReportDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const startDateInput = document.getElementById('reportStartDate');
    const endDateInput = document.getElementById('reportEndDate');
    
    if (startDateInput) startDateInput.valueAsDate = firstDay;
    if (endDateInput) endDateInput.valueAsDate = today;
    
    const generateBtn = document.getElementById('generateReportBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateReport);
    }
    
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const exportPDFBtn = document.getElementById('exportPDFBtn');
    const printReportBtn = document.getElementById('printReportBtn');
    
    if (exportExcelBtn) exportExcelBtn.addEventListener('click', () => showNotification('Exportar a Excel - Funcionalidad en desarrollo', 'info'));
    if (exportPDFBtn) exportPDFBtn.addEventListener('click', () => showNotification('Exportar a PDF - Funcionalidad en desarrollo', 'info'));
    if (printReportBtn) printReportBtn.addEventListener('click', () => window.print());
}

/**
 * Genera el reporte según los parámetros
 */
function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const startDate = new Date(document.getElementById('reportStartDate').value);
    const endDate = new Date(document.getElementById('reportEndDate').value);
    
    if (!startDate || !endDate) {
        showNotification('Por favor selecciona ambas fechas', 'warning');
        return;
    }
    
    if (startDate > endDate) {
        showNotification('La fecha de inicio debe ser anterior a la fecha de fin', 'warning');
        return;
    }
    
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    let reportData = {};
    
    switch(reportType) {
        case 'sales':
            reportData = generateSalesReport(startDate, endDate);
            break;
        case 'products':
            reportData = generateProductsReport();
            break;
        case 'customers':
            reportData = generateCustomersReport();
            break;
        case 'orders':
            reportData = generateOrdersReport(startDate, endDate);
            break;
    }
    
    displayReportResults(reportData, daysDiff);
}

/**
 * Genera reporte de ventas
 */
function generateSalesReport(startDate, endDate) {
    const ordersInRange = orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate >= startDate && orderDate <= endDate;
    });
    
    const total = ordersInRange.reduce((sum, o) => sum + o.total, 0);
    const count = ordersInRange.length;
    const average = count > 0 ? total / count : 0;
    
    return {
        type: 'sales',
        title: 'Reporte de Ventas',
        total: total,
        count: count,
        average: average,
        data: ordersInRange.map(o => ({
            fecha: formatDate(o.date),
            orden: `#${o.id}`,
            cliente: o.customer.name,
            monto: `$${formatPrice(o.total)}`
        })),
        headers: ['Fecha', 'Orden', 'Cliente', 'Monto']
    };
}

/**
 * Genera reporte de productos
 */
function generateProductsReport() {
    const total = products.length;
    const visible = products.filter(p => p.status === 'visible').length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const averagePrice = products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0;
    
    return {
        type: 'products',
        title: 'Reporte de Productos',
        total: totalValue,
        count: total,
        average: averagePrice,
        data: products.map(p => ({
            id: `#${p.id}`,
            nombre: p.name,
            categoria: p.category,
            precio: `$${formatPrice(p.price)}`,
            stock: p.stock,
            estado: p.status === 'visible' ? 'Visible' : 'Oculto'
        })),
        headers: ['ID', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado']
    };
}

/**
 * Genera reporte de clientes
 */
function generateCustomersReport() {
    const total = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const count = customers.length;
    const average = count > 0 ? total / count : 0;
    
    return {
        type: 'customers',
        title: 'Reporte de Clientes',
        total: total,
        count: count,
        average: average,
        data: customers.map(c => ({
            id: `#${c.id}`,
            nombre: c.name,
            email: c.email,
            ordenes: c.orders,
            gastado: `$${formatPrice(c.totalSpent)}`,
            registro: formatDate(c.registerDate)
        })),
        headers: ['ID', 'Nombre', 'Email', 'Órdenes', 'Total Gastado', 'Registro']
    };
}

/**
 * Genera reporte de órdenes
 */
function generateOrdersReport(startDate, endDate) {
    const ordersInRange = orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate >= startDate && orderDate <= endDate;
    });
    
    const total = ordersInRange.reduce((sum, o) => sum + o.total, 0);
    const count = ordersInRange.length;
    const average = count > 0 ? total / count : 0;
    
    const statusTexts = { pending: 'Pendiente', processing: 'En Proceso', completed: 'Completada', cancelled: 'Cancelada' };
    
    return {
        type: 'orders',
        title: 'Reporte de Órdenes',
        total: total,
        count: count,
        average: average,
        data: ordersInRange.map(o => ({
            orden: `#${o.id}`,
            fecha: formatDate(o.date),
            cliente: o.customer.name,
            productos: o.products.length,
            total: `$${formatPrice(o.total)}`,
            estado: statusTexts[o.status]
        })),
        headers: ['Orden', 'Fecha', 'Cliente', 'Productos', 'Total', 'Estado']
    };
}

/**
 * Muestra los resultados del reporte
 */
function displayReportResults(reportData, daysDiff) {
    const resultsDiv = document.getElementById('reportResults');
    resultsDiv.style.display = 'block';
    
    document.getElementById('reportTotal').textContent = '$' + formatPrice(reportData.total);
    document.getElementById('reportCount').textContent = reportData.count;
    document.getElementById('reportAverage').textContent = '$' + formatPrice(Math.round(reportData.average));
    document.getElementById('reportPeriod').textContent = `${daysDiff} días`;
    
    // Tabla de datos
    const tableHeaders = document.getElementById('reportTableHeaders');
    const tableBody = document.getElementById('reportTableBody');
    
    tableHeaders.innerHTML = reportData.headers.map(h => `<th>${h}</th>`).join('');
    tableBody.innerHTML = reportData.data.map(row => {
        const values = Object.values(row);
        return `<tr>${values.map(v => `<td>${v}</td>`).join('')}</tr>`;
    }).join('');
    
    // Gráfico del reporte
    createReportChart(reportData);
    
    showNotification('Reporte generado correctamente', 'success');
}

/**
 * Crea el gráfico del reporte
 */
function createReportChart(reportData) {
    const canvas = document.getElementById('reportChart');
    if (!canvas) return;
    
    // Destruir gráfico anterior si existe
    if (window.reportChartInstance) {
        window.reportChartInstance.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    let chartConfig = {};
    
    if (reportData.type === 'sales' || reportData.type === 'orders') {
        // Gráfico de línea para ventas/órdenes por fecha
        const dates = reportData.data.map(d => d.fecha);
        const amounts = reportData.data.map(d => parseInt(d.monto.replace(/[$,]/g, '')) || parseInt(d.total.replace(/[$,]/g, '')));
        
        chartConfig = {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Monto',
                    data: amounts,
                    borderColor: 'rgba(255, 20, 147, 1)',
                    backgroundColor: 'rgba(255, 20, 147, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => '$' + formatPrice(value)
                        }
                    }
                }
            }
        };
    } else if (reportData.type === 'products') {
        // Gráfico de barras para productos por categoría
        const categories = {};
        products.forEach(p => {
            categories[p.category] = (categories[p.category] || 0) + 1;
        });
        
        chartConfig = {
            type: 'bar',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    label: 'Cantidad de Productos',
                    data: Object.values(categories),
                    backgroundColor: ['rgba(255, 20, 147, 0.8)', 'rgba(255, 105, 180, 0.8)', 'rgba(255, 192, 203, 0.8)']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        };
    } else if (reportData.type === 'customers') {
        // Gráfico de barras para clientes por gasto
        const topCustomers = customers.slice().sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
        
        chartConfig = {
            type: 'bar',
            data: {
                labels: topCustomers.map(c => c.name),
                datasets: [{
                    label: 'Total Gastado',
                    data: topCustomers.map(c => c.totalSpent),
                    backgroundColor: 'rgba(255, 20, 147, 0.8)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => '$' + formatPrice(value)
                        }
                    }
                }
            }
        };
    }
    
    window.reportChartInstance = new Chart(ctx, chartConfig);
}

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

/**
 * Formatea una fecha
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('es-CO', options);
}