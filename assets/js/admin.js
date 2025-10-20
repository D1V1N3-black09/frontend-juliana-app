/**
 * SISTEMA DE ADMINISTRACIÓN - BEAUTIFUL GIRL
 * Gestión completa del panel de administración
 * Incluye CRUD de productos con imágenes
 */

// ==========================================
// DATOS DE PRODUCTOS (Cargados desde JSON)
// ==========================================
let products = [];

// Variables de paginación y filtros
let currentPage = 1;
let itemsPerPage = 10;
let filteredProducts = [];

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
    if (!document.getElementById('productsTableBody')) return;

    // Cargar productos desde JSON
    cargarProductosAdmin();

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

    // Configurar botón de cerrar sesión
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('userType');
                window.location.href = '../login.html';
            }
        });
    }
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

    tbody.innerHTML = productsToShow.map(product => `
        <tr data-product-id="${product.id}">
            <td>
                <span class="badge bg-primary">#${product.id}</span>
            </td>
            <td>
                <img src="${product.image}" 
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
    `).join('');

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
    
    // Mostrar vista previa de la imagen
    const previewImg = document.getElementById('previewImg');
    previewImg.src = product.image;
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
        previewImg.src = imageUrl;
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