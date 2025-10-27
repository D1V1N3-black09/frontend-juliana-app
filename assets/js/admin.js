let products = [];
let orders = [];
let customers = [];

let currentPage = 1;
let itemsPerPage = 10;
let filteredProducts = [];
let productsSortColumn = null;
let productsSortDirection = 'asc';

let currentOrdersPage = 1;
let ordersPerPage = 10;
let filteredOrders = [];
let ordersSortColumn = null;
let ordersSortDirection = 'asc';

let currentCustomersPage = 1;
let customersPerPage = 10;
let filteredCustomers = [];
let customersSortColumn = null;
let customersSortDirection = 'asc';

async function cargarProductosAdmin() {
    try {
        products = await API.getAllProducts();
        filteredProducts = [...products];
        loadProductsTable();
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        showNotification('No se pudieron cargar los productos. Verifica que el backend esté activo.', 'danger');
    }
}




document.addEventListener('DOMContentLoaded', async function() {
    
    const dashboardCheck = document.getElementById('section-dashboard');
    if (!dashboardCheck) return;

    
    initializeSidebarNavigation();

    
    cargarProductosAdmin();
    await loadDemoOrders();
    await loadDemoCustomers();

    
    initializeCharts();

    
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', openCreateProductModal);
    }

    
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductFormSubmit);
    }

    
    const productImage = document.getElementById('productImage');
    if (productImage) {
        productImage.addEventListener('input', updateImagePreview);
    }

    const usePlaceholder = document.getElementById('usePlaceholderImage');
    if (usePlaceholder) {
        usePlaceholder.addEventListener('change', handlePlaceholderToggle);
    }

    
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

    // Event listeners para filtros de órdenes
    const searchOrder = document.getElementById('searchOrder');
    const filterOrderStatus = document.getElementById('filterOrderStatus');
    const filterOrderDate = document.getElementById('filterOrderDate');
    const ordersPerPageSelect = document.getElementById('ordersPerPage');

    if (searchOrder) {
        searchOrder.addEventListener('input', function() {
            currentOrdersPage = 1;
            applyOrdersFilters();
        });
    }

    if (filterOrderStatus) {
        filterOrderStatus.addEventListener('change', function() {
            currentOrdersPage = 1;
            applyOrdersFilters();
        });
    }

    if (filterOrderDate) {
        filterOrderDate.addEventListener('change', function() {
            currentOrdersPage = 1;
            applyOrdersFilters();
        });
    }

    if (ordersPerPageSelect) {
        ordersPerPageSelect.addEventListener('change', function() {
            ordersPerPage = parseInt(this.value);
            currentOrdersPage = 1;
            loadOrdersTable();
        });
    }

    // Event listeners para filtros de clientes
    const searchCustomer = document.getElementById('searchCustomer');
    const sortCustomers = document.getElementById('sortCustomers');
    const customersPerPageSelect = document.getElementById('customersPerPage');

    if (searchCustomer) {
        searchCustomer.addEventListener('input', function() {
            currentCustomersPage = 1;
            applyCustomersFilters();
        });
    }

    if (sortCustomers) {
        sortCustomers.addEventListener('change', function() {
            const sortBy = this.value;
            sortCustomersByField(sortBy);
        });
    }

    if (customersPerPageSelect) {
        customersPerPageSelect.addEventListener('change', function() {
            customersPerPage = parseInt(this.value);
            currentCustomersPage = 1;
            loadCustomersTable();
        });
    }

    
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            // Mostrar modal de confirmación de logout
            const confirmed = await showLogoutConfirm();
            if (confirmed) {
                // Remover las claves correctas de sesión
                localStorage.removeItem('userSession');
                sessionStorage.removeItem('userSession');
                
                // Mostrar mensaje de éxito
                showSuccess('Sesión cerrada', 'Has cerrado sesión exitosamente');
                
                // Redirigir después de mostrar el mensaje
                setTimeout(() => {
                    window.location.href = '../login.html';
                }, 1000);
            }
        });
    });
});





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

    // Aplicar ordenamiento si existe
    if (productsSortColumn) {
        sortProducts(productsSortColumn, false);
    }

    loadProductsTable();
}

function sortProducts(column, toggleDirection = true) {
    if (toggleDirection) {
        if (productsSortColumn === column) {
            productsSortDirection = productsSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            productsSortColumn = column;
            productsSortDirection = 'asc';
        }
    }

    filteredProducts.sort((a, b) => {
        let valA, valB;

        switch(column) {
            case 'id':
                valA = a.id;
                valB = b.id;
                break;
            case 'name':
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
                break;
            case 'category':
                valA = a.category.toLowerCase();
                valB = b.category.toLowerCase();
                break;
            case 'price':
                valA = a.price;
                valB = b.price;
                break;
            case 'stock':
                valA = a.stock;
                valB = b.stock;
                break;
            case 'status':
                valA = a.status;
                valB = b.status;
                break;
            default:
                return 0;
        }

        if (valA < valB) return productsSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return productsSortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    loadProductsTable();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginationControls = document.getElementById('paginationControls');
    
    if (!paginationControls) return;

    if (totalPages <= 1) {
        paginationControls.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;

    
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

    
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;

    paginationControls.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    loadProductsTable();
}

function updatePaginationInfo() {
    const paginationInfo = document.getElementById('paginationInfo');
    if (!paginationInfo) return;

    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filteredProducts.length);
    const total = filteredProducts.length;

    paginationInfo.textContent = `Mostrando ${start} - ${end} de ${total} productos`;
}





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
        updateSortIcons('products');
        return;
    }

    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    tbody.innerHTML = productsToShow.map(product => {
        
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

    
    updatePaginationInfo();
    renderPagination();
    updateSortIcons('products');
}

// Actualizar íconos de ordenamiento
function updateSortIcons(table) {
    if (table === 'products') {
        // Resetear todos los iconos
        ['id', 'name', 'category', 'price', 'stock', 'status'].forEach(col => {
            const icon = document.getElementById(`sort-icon-${col}`);
            if (icon) {
                icon.className = 'fas fa-sort text-muted';
            }
        });
        
        // Actualizar icono de la columna activa
        if (productsSortColumn) {
            const activeIcon = document.getElementById(`sort-icon-${productsSortColumn}`);
            if (activeIcon) {
                activeIcon.className = productsSortDirection === 'asc' 
                    ? 'fas fa-sort-up text-primary' 
                    : 'fas fa-sort-down text-primary';
            }
        }
    } else if (table === 'orders') {
        ['id', 'customer', 'date', 'total', 'status'].forEach(col => {
            const icon = document.getElementById(`sort-icon-order-${col}`);
            if (icon) {
                icon.className = 'fas fa-sort text-muted';
            }
        });
        
        if (ordersSortColumn) {
            const activeIcon = document.getElementById(`sort-icon-order-${ordersSortColumn}`);
            if (activeIcon) {
                activeIcon.className = ordersSortDirection === 'asc' 
                    ? 'fas fa-sort-up text-primary' 
                    : 'fas fa-sort-down text-primary';
            }
        }
    } else if (table === 'customers') {
        ['id', 'name', 'email', 'orders', 'totalSpent', 'registerDate'].forEach(col => {
            const icon = document.getElementById(`sort-icon-customer-${col}`);
            if (icon) {
                icon.className = 'fas fa-sort text-muted';
            }
        });
        
        if (customersSortColumn) {
            const activeIcon = document.getElementById(`sort-icon-customer-${customersSortColumn}`);
            if (activeIcon) {
                activeIcon.className = customersSortDirection === 'asc' 
                    ? 'fas fa-sort-up text-primary' 
                    : 'fas fa-sort-down text-primary';
            }
        }
    }
}





function openCreateProductModal() {
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.getElementById('productModalLabel');
    const form = document.getElementById('productForm');
    
    modalTitle.textContent = 'Crear Nuevo Producto';
    form.reset();
    delete form.dataset.editingId;
    
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('productImage').disabled = false;
    document.getElementById('usePlaceholderImage').checked = false;
    
    modal.show();
}

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
    
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productStatus').value = product.status;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productImage').value = product.image;
    
    const isPlaceholder = product.image.includes('placeholder.png');
    document.getElementById('usePlaceholderImage').checked = isPlaceholder;
    document.getElementById('productImage').disabled = isPlaceholder;
    
    const previewImg = document.getElementById('previewImg');
    const imagePath = product.image.replace('../assets/', '../../assets/');
    previewImg.src = imagePath;
    document.getElementById('imagePreview').style.display = 'block';
    
    form.dataset.editingId = productId;
    
    modal.show();
}

async function toggleProductVisibility(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStatus = product.status === 'visible' ? 'hidden' : 'visible';
    
    const productData = {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        status: newStatus,
        description: product.description,
        image: product.image
    };

    try {
        await API.updateProduct(productId, productData);
        await cargarProductosAdmin();
        const statusText = newStatus === 'visible' ? 'visible' : 'oculto';
        showNotification(`Producto "${product.name}" ahora está ${statusText}`, 'success');
    } catch (error) {
        console.error('Error actualizando estado:', error);
        showNotification('Error al cambiar el estado del producto', 'danger');
    }
}

async function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Mostrar modal de confirmación de eliminación
    const confirmed = await showDeleteConfirm(product.name, 'producto');
    if (!confirmed) return;

    try {
        showLoading('Eliminando producto...', 'Por favor espera');
        await API.deleteProduct(productId);
        await cargarProductosAdmin();
        closeLoading();
        await showSuccess('¡Producto eliminado!', `"${product.name}" ha sido eliminado correctamente`);
    } catch (error) {
        console.error('Error eliminando producto:', error);
        showNotification('Error al eliminar el producto. Verifica que el backend esté activo.', 'danger');
    }
}

async function handleProductFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const editingId = form.dataset.editingId;
    
    let imageValue = document.getElementById('productImage').value.trim();
    if (!imageValue) {
        imageValue = '../assets/img/placeholder.png';
    }
    
    const productData = {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        status: document.getElementById('productStatus').value,
        description: document.getElementById('productDescription').value.trim(),
        image: imageValue
    };

    if (!productData.name || !productData.category) {
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
            await API.updateProduct(parseInt(editingId), productData);
            showNotification('Producto actualizado correctamente', 'success');
        } else {
            await API.createProduct(productData);
            showNotification('Producto creado correctamente', 'success');
        }

        await cargarProductosAdmin();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
        
        form.reset();
        delete form.dataset.editingId;
        
    } catch (error) {
        console.error('Error guardando producto:', error);
        showNotification('Error al guardar el producto. Verifica que el backend esté activo.', 'danger');
    }
}

function saveProducts() {
    try {
        localStorage.setItem('beautifulgirl_products', JSON.stringify(products));
    } catch (e) {
        console.error('Error guardando productos en localStorage:', e);
        showNotification('Error al guardar los cambios', 'danger');
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

function handlePlaceholderToggle() {
    const checkbox = document.getElementById('usePlaceholderImage');
    const imageInput = document.getElementById('productImage');
    
    if (checkbox.checked) {
        imageInput.value = '../assets/img/placeholder.png';
        imageInput.disabled = true;
        updateImagePreview();
    } else {
        imageInput.disabled = false;
        if (imageInput.value === '../assets/img/placeholder.png') {
            imageInput.value = '';
        }
        updateImagePreview();
    }
}

function updateImagePreview() {
    const imageUrl = document.getElementById('productImage').value;
    const previewContainer = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (imageUrl.trim()) {
        let adjustedUrl = imageUrl;
        if (imageUrl.startsWith('../assets/')) {
            adjustedUrl = imageUrl.replace('../assets/', '../../assets/');
        }
        
        previewImg.src = adjustedUrl;
        previewImg.onerror = function() {
            this.src = 'https://via.placeholder.com/200?text=Error+al+cargar';
            previewContainer.style.display = 'block';
        };
        previewImg.onload = function() {
            previewContainer.style.display = 'block';
        };
    } else {
        previewContainer.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    
    const bgClass = {
        'success': 'bg-success',
        'danger': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info',
        'primary': 'bg-primary'
    }[type] || 'bg-info';

    
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
    
    
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}





let salesChartInstance = null;
let productsChartInstance = null;

async function loadDashboardStats() {
    try {
        const stats = await API.getDashboardStats();
        
        // Actualizar Ventas Totales
        const salesElement = document.getElementById('statTotalSales');
        if (salesElement) {
            salesElement.textContent = '$' + formatPrice(stats.total_sales);
        }
        const salesChangeElement = document.getElementById('statSalesChange');
        if (salesChangeElement) {
            const isPositive = stats.sales_change >= 0;
            salesChangeElement.className = isPositive ? 'text-success' : 'text-danger';
            salesChangeElement.innerHTML = `
                <i class="fas fa-arrow-${isPositive ? 'up' : 'down'} me-1"></i>
                ${Math.abs(stats.sales_change).toFixed(1)}% vs mes anterior
            `;
        }

        // Actualizar Órdenes Nuevas
        const ordersElement = document.getElementById('statTotalOrders');
        if (ordersElement) {
            ordersElement.textContent = stats.total_orders;
        }
        const ordersChangeElement = document.getElementById('statOrdersChange');
        if (ordersChangeElement) {
            const isPositive = stats.orders_change >= 0;
            ordersChangeElement.className = isPositive ? 'text-success' : 'text-danger';
            ordersChangeElement.innerHTML = `
                <i class="fas fa-arrow-${isPositive ? 'up' : 'down'} me-1"></i>
                ${Math.abs(stats.orders_change).toFixed(1)}% vs mes anterior
            `;
        }

        // Actualizar Clientes Nuevos
        const customersElement = document.getElementById('statNewCustomers');
        if (customersElement) {
            customersElement.textContent = stats.new_customers;
        }
        const customersChangeElement = document.getElementById('statCustomersChange');
        if (customersChangeElement) {
            const isPositive = stats.customers_change >= 0;
            customersChangeElement.className = isPositive ? 'text-success' : 'text-danger';
            customersChangeElement.innerHTML = `
                <i class="fas fa-arrow-${isPositive ? 'up' : 'down'} me-1"></i>
                ${Math.abs(stats.customers_change).toFixed(1)}% vs mes anterior
            `;
        }

        // Actualizar Visitas
        const visitsElement = document.getElementById('statTotalVisits');
        if (visitsElement) {
            visitsElement.textContent = formatNumber(stats.total_visits);
        }
        const visitsChangeElement = document.getElementById('statVisitsChange');
        if (visitsChangeElement) {
            const isPositive = stats.visits_change >= 0;
            visitsChangeElement.className = isPositive ? 'text-success' : 'text-danger';
            visitsChangeElement.innerHTML = `
                <i class="fas fa-arrow-${isPositive ? 'up' : 'down'} me-1"></i>
                ${Math.abs(stats.visits_change).toFixed(1)}% vs mes anterior
            `;
        }

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        showNotification('Error al cargar estadísticas', 'warning');
    }
}

async function loadSalesChart() {
    try {
        const salesData = await API.getSalesChartData(6);
        
        const salesCanvas = document.getElementById('salesChart');
        if (!salesCanvas) return;

        // Preparar datos
        const monthNames = {
            '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
            '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
            '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
        };

        const labels = salesData.map(item => {
            const [year, month] = item.month.split('-');
            return monthNames[month] + ' ' + year.slice(2);
        });

        const revenues = salesData.map(item => item.total_revenue);

        // Destruir gráfico anterior si existe
        if (salesChartInstance) {
            salesChartInstance.destroy();
        }

        // Crear nuevo gráfico
        const salesCtx = salesCanvas.getContext('2d');
        salesChartInstance = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas ($)',
                    data: revenues,
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
    } catch (error) {
        console.error('Error cargando gráfico de ventas:', error);
    }
}

async function loadProductsChart() {
    try {
        const categoriesData = await API.getTopCategories(5);
        
        const productsCanvas = document.getElementById('productsChart');
        if (!productsCanvas) return;

        // Preparar datos
        const labels = categoriesData.map(item => 
            item.category.charAt(0).toUpperCase() + item.category.slice(1)
        );
        const data = categoriesData.map(item => item.total_sold);

        // Colores para las categorías
        const colors = [
            'rgba(255, 105, 180, 0.8)',
            'rgba(255, 20, 147, 0.8)',
            'rgba(255, 192, 203, 0.8)',
            'rgba(219, 112, 147, 0.8)',
            'rgba(255, 182, 193, 0.8)'
        ];

        // Destruir gráfico anterior si existe
        if (productsChartInstance) {
            productsChartInstance.destroy();
        }

        // Crear nuevo gráfico
        const productsCtx = productsCanvas.getContext('2d');
        productsChartInstance = new Chart(productsCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
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
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + ' unidades';
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error cargando gráfico de productos:', error);
    }
}

function initializeCharts() {
    // Cargar estadísticas y gráficos con datos reales
    loadDashboardStats();
    loadSalesChart();
    loadProductsChart();
}

function formatNumber(num) {
    return new Intl.NumberFormat('es-CO').format(num);
}





function initializeSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('#sidebar .nav-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.dataset.section;
            
            
            sidebarLinks.forEach(l => l.classList.remove('active'));
            
            
            this.classList.add('active');
            
            
            const allSections = document.querySelectorAll('.admin-section');
            allSections.forEach(s => {
                s.style.display = 'none';
                s.style.visibility = 'hidden';
            });
            
            
            const targetSection = document.getElementById(`section-${section}`);
            
            if (targetSection) {
                
                targetSection.style.display = 'block';
                targetSection.style.visibility = 'visible';
                
                
                window.scrollTo(0, 0);
                
                
                switch(section) {
                    case 'dashboard':
                        loadDashboardStats();
                        loadSalesChart();
                        loadProductsChart();
                        break;
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
                    case 'admin-profile':
                        loadAdminProfile();
                        break;
                }
            }
        });
    });
}





async function loadDemoOrders() {
    try {
        orders = await API.getAllOrders();
        filteredOrders = [...orders];
    } catch (error) {
        console.error('Error al cargar órdenes:', error);
        orders = [];
        filteredOrders = [];
    }
}

// Aplicar filtros a órdenes
function applyOrdersFilters() {
    const searchTerm = document.getElementById('searchOrder')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filterOrderStatus')?.value || '';
    const dateFilter = document.getElementById('filterOrderDate')?.value || '';

    filteredOrders = orders.filter(order => {
        const matchSearch = searchTerm === '' || 
                           order.id.toString().includes(searchTerm) ||
                           order.customer.name.toLowerCase().includes(searchTerm);
        
        const matchStatus = statusFilter === '' || order.status === statusFilter;
        
        const matchDate = dateFilter === '' || 
                         order.date.startsWith(dateFilter);

        return matchSearch && matchStatus && matchDate;
    });

    // Aplicar ordenamiento si existe
    if (ordersSortColumn) {
        sortOrders(ordersSortColumn, false);
    }

    currentOrdersPage = 1;
    loadOrdersTable();
}

// Ordenar órdenes
function sortOrders(column, toggleDirection = true) {
    if (toggleDirection) {
        if (ordersSortColumn === column) {
            ordersSortDirection = ordersSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            ordersSortColumn = column;
            ordersSortDirection = 'asc';
        }
    }

    filteredOrders.sort((a, b) => {
        let valA, valB;

        switch(column) {
            case 'id':
                valA = a.id;
                valB = b.id;
                break;
            case 'customer':
                valA = a.customer.name.toLowerCase();
                valB = b.customer.name.toLowerCase();
                break;
            case 'date':
                valA = new Date(a.date);
                valB = new Date(b.date);
                break;
            case 'total':
                valA = a.total;
                valB = b.total;
                break;
            case 'status':
                valA = a.status;
                valB = b.status;
                break;
            default:
                return 0;
        }

        if (valA < valB) return ordersSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return ordersSortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    loadOrdersTable();
}

function loadOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    <i class="fas fa-inbox fa-3x mb-3 d-block"></i>
                    ${orders.length === 0 
                        ? 'No hay órdenes registradas.'
                        : 'No se encontraron órdenes con los filtros aplicados.'}
                </td>
            </tr>
        `;
        updateOrdersPagination();
        updateSortIcons('orders');
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
    updateSortIcons('orders');
}

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
    
    
    paginationHTML += `
        <li class="page-item ${currentOrdersPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeOrdersPage(${currentOrdersPage - 1}); return false;">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentOrdersPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changeOrdersPage(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    
    paginationHTML += `
        <li class="page-item ${currentOrdersPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeOrdersPage(${currentOrdersPage + 1}); return false;">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    paginationControls.innerHTML = paginationHTML;
}

function changeOrdersPage(page) {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    if (page < 1 || page > totalPages) return;
    currentOrdersPage = page;
    loadOrdersTable();
}

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





async function loadDemoCustomers() {
    try {
        const users = await API.getAllUsersWithStats();
        customers = users.map(user => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            phone: user.phone || 'N/A',
            orders: user.total_orders,
            totalSpent: parseFloat(user.total_spent),
            registerDate: user.created_at,
            role: user.role
        }));
        filteredCustomers = [...customers];
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        customers = [];
        filteredCustomers = [];
    }
}

// Aplicar filtros a clientes
function applyCustomersFilters() {
    const searchTerm = document.getElementById('searchCustomer')?.value.toLowerCase() || '';

    filteredCustomers = customers.filter(customer => {
        const matchSearch = searchTerm === '' || 
                           customer.name.toLowerCase().includes(searchTerm) ||
                           customer.email.toLowerCase().includes(searchTerm) ||
                           customer.id.toString().includes(searchTerm);

        return matchSearch;
    });

    // Aplicar ordenamiento si existe
    if (customersSortColumn) {
        sortCustomers(customersSortColumn, false);
    }

    currentCustomersPage = 1;
    loadCustomersTable();
}

// Ordenar clientes por campo del selector
function sortCustomersByField(field) {
    customersSortColumn = field;
    customersSortDirection = 'desc'; // Por defecto descendente para valores numéricos

    if (field === 'name') {
        customersSortDirection = 'asc'; // Ascendente para nombre
    }

    sortCustomers(field, false);
}

// Ordenar clientes
function sortCustomers(column, toggleDirection = true) {
    if (toggleDirection) {
        if (customersSortColumn === column) {
            customersSortDirection = customersSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            customersSortColumn = column;
            customersSortDirection = 'asc';
        }
    }

    filteredCustomers.sort((a, b) => {
        let valA, valB;

        switch(column) {
            case 'id':
                valA = a.id;
                valB = b.id;
                break;
            case 'name':
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
                break;
            case 'email':
                valA = a.email.toLowerCase();
                valB = b.email.toLowerCase();
                break;
            case 'orders':
                valA = a.orders;
                valB = b.orders;
                break;
            case 'totalSpent':
            case 'total':
                valA = a.totalSpent;
                valB = b.totalSpent;
                break;
            case 'registerDate':
            case 'date':
                valA = new Date(a.registerDate);
                valB = new Date(b.registerDate);
                break;
            default:
                return 0;
        }

        if (valA < valB) return customersSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return customersSortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    loadCustomersTable();
}

function loadCustomersTable() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    
    if (filteredCustomers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4 text-muted">
                    <i class="fas fa-users fa-3x mb-3 d-block"></i>
                    ${customers.length === 0 
                        ? 'No hay clientes registrados.'
                        : 'No se encontraron clientes con los filtros aplicados.'}
                </td>
            </tr>
        `;
        updateCustomersPagination();
        updateSortIcons('customers');
        return;
    }
    
    const startIndex = (currentCustomersPage - 1) * customersPerPage;
    const endIndex = startIndex + customersPerPage;
    const customersToShow = filteredCustomers.slice(startIndex, endIndex);
    
    tbody.innerHTML = customersToShow.map(customer => {
        const roleClass = customer.role === 'ADMIN' ? 'bg-danger' : 'bg-secondary';
        const roleText = customer.role === 'ADMIN' ? 'Admin' : 'Cliente';
        
        return `
            <tr>
                <td><span class="badge bg-primary">#${customer.id}</span></td>
                <td><strong>${customer.name}</strong></td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td><span class="badge bg-info">${customer.orders}</span></td>
                <td><strong class="text-success">$${formatPrice(customer.totalSpent)}</strong></td>
                <td><span class="badge ${roleClass}">${roleText}</span></td>
                <td>${formatDate(customer.registerDate)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-warning" onclick="openEditCustomerModal(${customer.id})" title="Editar cliente">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCustomer(${customer.id})" title="Eliminar cliente">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    updateCustomersPagination();
    updateSortIcons('customers');
}

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
    
    
    paginationHTML += `
        <li class="page-item ${currentCustomersPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeCustomersPage(${currentCustomersPage - 1}); return false;">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentCustomersPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changeCustomersPage(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    
    paginationHTML += `
        <li class="page-item ${currentCustomersPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeCustomersPage(${currentCustomersPage + 1}); return false;">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    paginationControls.innerHTML = paginationHTML;
}

function changeCustomersPage(page) {
    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
    if (page < 1 || page > totalPages) return;
    currentCustomersPage = page;
    loadCustomersTable();
}

function openEditCustomerModal(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    const isEditingSelf = session && session.id === customerId;

    const modalHTML = `
        <div class="modal fade" id="editCustomerModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Editar Cliente</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editCustomerForm">
                            <input type="hidden" id="editCustomerId" value="${customer.id}">
                            <div class="mb-3">
                                <label class="form-label">Nombre</label>
                                <input type="text" class="form-control" id="editCustomerName" value="${customer.name}" disabled>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" id="editCustomerEmail" value="${customer.email}" disabled>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Teléfono</label>
                                <input type="text" class="form-control" id="editCustomerPhone" value="${customer.phone}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Rol</label>
                                <select class="form-select" id="editCustomerRole" ${isEditingSelf ? 'disabled' : ''}>
                                    <option value="CUSTOMER" ${customer.role === 'CUSTOMER' ? 'selected' : ''}>Cliente</option>
                                    <option value="ADMIN" ${customer.role === 'ADMIN' ? 'selected' : ''}>Administrador</option>
                                </select>
                                ${isEditingSelf ? '<small class="text-muted">No puedes cambiar tu propio rol</small>' : ''}
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="saveCustomerChanges()">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    let existingModal = document.getElementById('editCustomerModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('editCustomerModal'));
    modal.show();
}

async function saveCustomerChanges() {
    const customerId = document.getElementById('editCustomerId').value;
    const roleSelect = document.getElementById('editCustomerRole');
    
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    const isEditingSelf = session && session.id == customerId;

    if (isEditingSelf && !roleSelect.disabled) {
        showNotification('No puedes cambiar tu propio rol', 'warning');
        return;
    }

    if (roleSelect.disabled) {
        showNotification('Cambios guardados (rol sin modificar)', 'info');
        const modal = bootstrap.Modal.getInstance(document.getElementById('editCustomerModal'));
        modal.hide();
        return;
    }

    const newRole = roleSelect.value;

    try {
        await API.updateUserRole(customerId, newRole);
        showNotification('Cliente actualizado correctamente', 'success');
        
        await loadDemoCustomers();
        loadCustomersTable();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('editCustomerModal'));
        modal.hide();
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        showNotification('Error al actualizar cliente', 'danger');
    }
}

async function deleteCustomer(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    // Mostrar modal de confirmación de eliminación
    const confirmed = await showDeleteConfirm(customer.name, 'cliente');
    if (!confirmed) return;

    try {
        showLoading('Eliminando cliente...', 'Por favor espera');
        await API.deleteUser(customerId);
        closeLoading();
        await showSuccess('¡Cliente eliminado!', 'El cliente ha sido eliminado correctamente');
        
        await loadDemoCustomers();
        loadCustomersTable();
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        showNotification('Error al eliminar cliente', 'danger');
    }
}





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

function displayReportResults(reportData, daysDiff) {
    const resultsDiv = document.getElementById('reportResults');
    resultsDiv.style.display = 'block';
    
    document.getElementById('reportTotal').textContent = '$' + formatPrice(reportData.total);
    document.getElementById('reportCount').textContent = reportData.count;
    document.getElementById('reportAverage').textContent = '$' + formatPrice(Math.round(reportData.average));
    document.getElementById('reportPeriod').textContent = `${daysDiff} días`;
    
    
    const tableHeaders = document.getElementById('reportTableHeaders');
    const tableBody = document.getElementById('reportTableBody');
    
    tableHeaders.innerHTML = reportData.headers.map(h => `<th>${h}</th>`).join('');
    tableBody.innerHTML = reportData.data.map(row => {
        const values = Object.values(row);
        return `<tr>${values.map(v => `<td>${v}</td>`).join('')}</tr>`;
    }).join('');
    
    
    createReportChart(reportData);
    
    showNotification('Reporte generado correctamente', 'success');
}

function createReportChart(reportData) {
    const canvas = document.getElementById('reportChart');
    if (!canvas) return;
    
    
    if (window.reportChartInstance) {
        window.reportChartInstance.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    let chartConfig = {};
    
    if (reportData.type === 'sales' || reportData.type === 'orders') {
        
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





function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('es-CO', options);
}

let adminOriginalData = {};

async function loadAdminProfile() {
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    
    if (!session || !session.id) {
        showNotification('No se pudo cargar el perfil', 'danger');
        return;
    }

    try {
        const user = await API.getUser(session.id);
        
        const avatarUrl = `https://ui-avatars.com/api/?name=${user.first_name.charAt(0)}&background=0d6efd&color=fff&size=120`;
        document.getElementById('adminAvatar').src = avatarUrl;
        document.getElementById('adminProfileName').textContent = `${user.first_name} ${user.last_name}`;
        document.getElementById('adminProfileEmail').textContent = user.email;
        
        document.getElementById('adminFirstName').value = user.first_name;
        document.getElementById('adminLastName').value = user.last_name;
        document.getElementById('adminEmail').value = user.email;
        document.getElementById('adminPhone').value = user.phone || '';
        document.getElementById('adminCity').value = user.city || '';
        document.getElementById('adminAddress').value = user.address || '';
        document.getElementById('adminPostalCode').value = user.postal_code || '';
        
        adminOriginalData = {
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone || '',
            city: user.city || '',
            address: user.address || '',
            postalCode: user.postal_code || ''
        };
    } catch (error) {
        console.error('Error al cargar perfil del admin:', error);
        showNotification('Error al cargar datos del perfil', 'danger');
    }
}

function toggleAdminEditMode() {
    const inputs = document.querySelectorAll('#adminProfileForm input');
    inputs.forEach(input => {
        if (input.id !== 'adminEmail') {
            input.disabled = false;
        }
    });
    
    document.getElementById('adminFormButtons').classList.remove('d-none');
    document.getElementById('adminEditBtn').classList.add('d-none');
}

function cancelAdminEdit() {
    document.getElementById('adminFirstName').value = adminOriginalData.firstName;
    document.getElementById('adminLastName').value = adminOriginalData.lastName;
    document.getElementById('adminEmail').value = adminOriginalData.email;
    document.getElementById('adminPhone').value = adminOriginalData.phone;
    document.getElementById('adminCity').value = adminOriginalData.city;
    document.getElementById('adminAddress').value = adminOriginalData.address;
    document.getElementById('adminPostalCode').value = adminOriginalData.postalCode;

    const inputs = document.querySelectorAll('#adminProfileForm input');
    inputs.forEach(input => input.disabled = true);

    document.getElementById('adminFormButtons').classList.add('d-none');
    document.getElementById('adminEditBtn').classList.remove('d-none');
}

async function saveAdminProfile(e) {
    e.preventDefault();
    
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    if (!session || !session.id) return;

    const updatedData = {
        first_name: document.getElementById('adminFirstName').value,
        last_name: document.getElementById('adminLastName').value,
        email: document.getElementById('adminEmail').value,
        phone: document.getElementById('adminPhone').value,
        address: document.getElementById('adminAddress').value,
        city: document.getElementById('adminCity').value,
        postal_code: document.getElementById('adminPostalCode').value
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

        const inputs = document.querySelectorAll('#adminProfileForm input');
        inputs.forEach(input => input.disabled = true);

        document.getElementById('adminFormButtons').classList.add('d-none');
        document.getElementById('adminEditBtn').classList.remove('d-none');

        await loadAdminProfile();

        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        showNotification('Error al actualizar perfil', 'danger');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const adminEditBtn = document.getElementById('adminEditBtn');
    const adminCancelBtn = document.getElementById('adminCancelBtn');
    const adminProfileForm = document.getElementById('adminProfileForm');
    
    if (adminEditBtn) {
        adminEditBtn.addEventListener('click', toggleAdminEditMode);
    }
    
    if (adminCancelBtn) {
        adminCancelBtn.addEventListener('click', cancelAdminEdit);
    }
    
    if (adminProfileForm) {
        adminProfileForm.addEventListener('submit', saveAdminProfile);
    }
});


// ============================================
// SISTEMA DE REPORTES PROFESIONALES
// ============================================

// ============================================
// SISTEMA DE REPORTES MEJORADO
// ============================================

let selectedReportType = null;
let selectedFormat = null;
let selectedPeriod = 'month'; // 'today', 'week', 'month', 'year', 'custom'
let customDays = 30;
let customStartDate = null;
let customEndDate = null;

// Nombres de reportes para mostrar
const reportNames = {
    'general': 'Reporte General',
    'sales': 'Reporte de Ventas',
    'products': 'Reporte de Productos',
    'inventory': 'Reporte de Inventario',
    'customers': 'Reporte de Clientes'
};

// Cargar tipos de reportes disponibles
async function loadReportTypes() {
    try {
        const response = await fetch(`${API_URL}/reports/types`);
        const data = await response.json();
        
        const container = document.getElementById('reportTypesContainer');
        if (!container) return;
        
        container.innerHTML = data.types.map(type => `
            <div class="col-md-6 col-lg-4">
                <div class="card report-type-card h-100" onclick="selectReportType('${type.id}')" id="report-card-${type.id}">
                    <div class="card-body text-center p-4">
                        <i class="fas ${type.icon} fa-3x mb-3" style="color: #667eea;"></i>
                        <h5 class="card-title fw-bold">${type.name}</h5>
                        <p class="card-text text-muted small">${type.description}</p>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error cargando tipos de reportes:', error);
        showNotification('Error al cargar tipos de reportes', 'danger');
    }
}

// Seleccionar tipo de reporte
function selectReportType(reportType) {
    selectedReportType = reportType;
    
    // Actualizar UI de tarjetas
    document.querySelectorAll('.report-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.getElementById(`report-card-${reportType}`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    updateGenerateButton();
}

// Seleccionar formato (Excel o PDF) - EXCLUSIVO
function selectFormat(format) {
    selectedFormat = format;
    
    // Remover selección de ambas tarjetas
    const excelCard = document.getElementById('format-card-excel');
    const pdfCard = document.getElementById('format-card-pdf');
    
    if (excelCard && pdfCard) {
        excelCard.classList.remove('selected');
        pdfCard.classList.remove('selected');
        
        // Resetear iconos
        excelCard.querySelector('i').className = 'far fa-circle me-2';
        pdfCard.querySelector('i').className = 'far fa-circle me-2';
        
        // Aplicar selección al formato elegido
        if (format === 'excel') {
            excelCard.classList.add('selected');
            excelCard.querySelector('i').className = 'fas fa-check-circle me-2';
        } else if (format === 'pdf') {
            pdfCard.classList.add('selected');
            pdfCard.querySelector('i').className = 'fas fa-check-circle me-2';
        }
    }
    
    updateGenerateButton();
}

// Obtener nombre legible del período
function getPeriodName(period, days = 30) {
    const periodNames = {
        'today': 'Hoy',
        'week': 'Última Semana',
        'month': 'Último Mes',
        'year': 'Último Año',
        'custom': `Últimos ${days} días`
    };
    return periodNames[period] || periodNames['month'];
}

// Actualizar el botón de generar según selecciones
function updateGenerateButton() {
    const btn = document.getElementById('generateReportBtn');
    const btnText = document.getElementById('generateBtnText');
    const summary = document.getElementById('reportConfigSummary');
    
    if (!btn || !btnText || !summary) return;
    
    // Verificar que todas las selecciones estén completas
    if (selectedReportType && selectedPeriod && selectedFormat) {
        btn.disabled = false;
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        
        // Actualizar texto del botón
        const formatName = selectedFormat === 'excel' ? 'Excel' : 'PDF';
        btnText.innerHTML = `<i class="fas fa-file-${selectedFormat === 'excel' ? 'excel' : 'pdf'} me-2"></i>Generar Reporte ${formatName}`;
        
        // Actualizar resumen
        const reportName = reportNames[selectedReportType] || 'Reporte';
        const periodName = getPeriodName(selectedPeriod, customDays);
        summary.innerHTML = `<i class="fas fa-check-circle text-success me-2"></i><strong>Configuración:</strong> ${reportName} | ${periodName} | Formato ${formatName}`;
        
    } else {
        btn.disabled = true;
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        
        // Mensajes según lo que falte
        if (!selectedReportType) {
            btnText.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Selecciona un tipo de reporte';
            summary.innerHTML = '<i class="fas fa-info-circle text-muted me-2"></i>Paso 1: Selecciona el tipo de reporte';
        } else if (!selectedFormat) {
            btnText.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Selecciona un formato';
            summary.innerHTML = '<i class="fas fa-info-circle text-muted me-2"></i>Paso 3: Selecciona el formato de descarga';
        }
    }
}

// Manejar cambio de período
function handlePeriodChange(period) {
    selectedPeriod = period;
    
    const customDateRange = document.getElementById('customDateRange');
    const customDaysInput = document.getElementById('customDays');
    
    if (period === 'custom') {
        // Mostrar selector de rango personalizado
        if (customDateRange) {
            customDateRange.style.display = 'block';
        }
    } else {
        // Ocultar selector personalizado y establecer días predefinidos
        if (customDateRange) {
            customDateRange.style.display = 'none';
        }
        
        // Establecer días según el período seleccionado
        switch(period) {
            case 'today':
                customDays = 1;
                break;
            case 'week':
                customDays = 7;
                break;
            case 'month':
                customDays = 30;
                break;
            case 'year':
                customDays = 365;
                break;
        }
        
        if (customDaysInput) {
            customDaysInput.value = customDays;
        }
    }
    
    updateGenerateButton();
}

// Generar y descargar reporte
async function generateReport() {
    if (!selectedReportType || !selectedFormat) {
        await showWarning('Configuración incompleta', 'Por favor completa todas las selecciones');
        return;
    }
    
    try {
        await showLoading('Generando reporte...', 'Esto puede tomar unos segundos');
        
        // Construir URL con parámetros de período
        let url = `${API_URL}/reports/${selectedFormat}/${selectedReportType}`;
        
        // Agregar parámetros de período
        if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
            url += `?start=${customStartDate}&end=${customEndDate}`;
        } else {
            url += `?days=${customDays}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error al generar el reporte');
        }
        
        // Obtener el blob del archivo
        const blob = await response.blob();
        
        // Crear nombre de archivo
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const extension = selectedFormat === 'excel' ? 'xlsx' : 'pdf';
        const filename = `BeautifulGirl_${selectedReportType}_${timestamp}.${extension}`;
        
        // Descargar archivo
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        
        await closeLoading();
        await showSuccess(
            '¡Reporte Generado!',
            `El reporte ha sido descargado exitosamente como <strong>${filename}</strong>`
        );
        
    } catch (error) {
        console.error('Error generando reporte:', error);
        await closeLoading();
        await showError(
            'Error al Generar Reporte',
            'No se pudo generar el reporte. Verifica que el backend esté activo y las librerías instaladas.'
        );
    }
}

// Event listeners para el sistema de reportes
document.addEventListener('DOMContentLoaded', function() {
    // Cargar tipos de reportes al mostrar sección
    const reportsLink = document.querySelector('[data-section="reports"]');
    if (reportsLink) {
        reportsLink.addEventListener('click', function() {
            setTimeout(() => {
                loadReportTypes();
            }, 100);
        });
    }
    
    // Listeners para botones de período rápido
    document.querySelectorAll('input[name="quickPeriod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            handlePeriodChange(e.target.value);
        });
    });
    
    // Listener para días personalizados
    const customDaysInput = document.getElementById('customDays');
    if (customDaysInput) {
        customDaysInput.addEventListener('input', (e) => {
            customDays = parseInt(e.target.value) || 30;
            updateGenerateButton();
        });
    }
    
    // Listeners para fechas personalizadas
    const customStartDateInput = document.getElementById('customStartDate');
    const customEndDateInput = document.getElementById('customEndDate');
    
    if (customStartDateInput) {
        customStartDateInput.addEventListener('change', (e) => {
            customStartDate = e.target.value;
            updateGenerateButton();
        });
    }
    
    if (customEndDateInput) {
        customEndDateInput.addEventListener('change', (e) => {
            customEndDate = e.target.value;
            updateGenerateButton();
        });
    }
    
    // Listener para botón de generar reporte
    const generateBtn = document.getElementById('generateReportBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateReport);
    }
});