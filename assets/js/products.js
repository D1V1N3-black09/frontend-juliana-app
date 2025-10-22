

let p = [];

var paginaActual = 1;
var itemsPorPagina = 16;

async function cargarProductos() {
    try {
        console.log('Iniciando carga de productos...');
        document.getElementById('loadingSpinner').classList.remove('d-none');
        document.getElementById('productsGrid').innerHTML = '';
        
        p = await API.getProducts();
        console.log('Productos cargados:', p.length);
        
        document.getElementById('loadingSpinner').classList.add('d-none');
        filtrar();
        u();
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        document.getElementById('loadingSpinner').classList.add('d-none');
        mostrarError();
    }
}

function mostrarError() {
    const tbody = document.querySelector("#productsTable tbody");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <p class="h5">Error al cargar los productos</p>
                    <p class="text-muted">Por favor, recarga la página</p>
                </td>
            </tr>
        `;
    }
}





function cambiarPagina(pagina) {
    paginaActual = pagina;
    filtrar();
}

function actualizarPaginacion(totalItems) {
    var totalPaginas = Math.ceil(totalItems / itemsPorPagina);
    var paginacionHTML = '';
    
    
    paginacionHTML += `
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="event.preventDefault(); cambiarPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'tabindex="-1" aria-disabled="true"' : ''}>
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>`;

    
    for (var i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaActual - 1 && i <= paginaActual + 1)) {
            paginacionHTML += `
                <li class="page-item ${i === paginaActual ? 'active' : ''}">
                    <a class="page-link" href="javascript:void(0)" onclick="event.preventDefault(); cambiarPagina(${i})">${i}</a>
                </li>`;
        } else if (i === paginaActual - 2 || i === paginaActual + 2) {
            paginacionHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }

    
    paginacionHTML += `
        <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="event.preventDefault(); cambiarPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? 'tabindex="-1" aria-disabled="true"' : ''}>
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>`;    document.querySelector('#paginacion').innerHTML = paginacionHTML;
}

function filtrar() {
    var categoria = document.querySelector("#filtroCategoria").value;
    var busqueda = document.querySelector("#filtroBusqueda").value.toLowerCase();
    var precioMin = parseFloat(document.querySelector("#precioMin")?.value) || 0;
    var precioMax = parseFloat(document.querySelector("#precioMax")?.value) || Infinity;
    var soloEnStock = document.querySelector("#filtroEnStock")?.checked || false;
    
    var productosFiltrados = p.filter(function(item) {
        var matchCategoria = categoria === "" || item.category === categoria;
        var matchBusqueda = item.name.toLowerCase().includes(busqueda) || 
                           item.description.toLowerCase().includes(busqueda);
        var matchPrecio = item.price >= precioMin && item.price <= precioMax;
        var matchStock = !soloEnStock || item.stock > 0;
        
        return matchCategoria && matchBusqueda && matchPrecio && matchStock;
    });
    
    // Ordenar productos
    var sortValue = document.querySelector("#sortProducts").value;
    productosFiltrados.sort(function(a, b) {
        switch(sortValue) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'stock-desc':
                return b.stock - a.stock;
            default:
                return 0;
        }
    });
    
    var inicio = (paginaActual - 1) * itemsPorPagina;
    var fin = inicio + itemsPorPagina;
    var productosEnPagina = productosFiltrados.slice(inicio, fin);
    
    actualizarPaginacion(productosFiltrados.length);
    actualizarContador(productosFiltrados.length);
    r(productosEnPagina);
}

function actualizarContador(total) {
    var counter = document.getElementById('productsCount');
    if (counter) {
        if (total === 0) {
            counter.textContent = 'No se encontraron productos';
        } else if (total === 1) {
            counter.textContent = '1 producto encontrado';
        } else {
            counter.textContent = `${total} productos encontrados`;
        }
    }
}

function r(productos) {
    var grid = document.querySelector("#productsGrid");
    var noResults = document.querySelector("#noResults");
    
    if (!grid) {
        console.error("Grid no encontrado");
        return;
    }
    
    if (productos.length === 0) {
        grid.innerHTML = '';
        noResults.classList.remove('d-none');
        document.getElementById('paginationContainer').classList.add('d-none');
        return;
    }
    
    noResults.classList.add('d-none');
    document.getElementById('paginationContainer').classList.remove('d-none');
    
    // Usar requestAnimationFrame para mejor rendimiento
    requestAnimationFrame(() => {
        grid.innerHTML = productos.map(function(i) {
            const sinStock = i.stock === 0;
            const pocoStock = i.stock > 0 && i.stock <= 5;
            
            let stockBadge, badgeClass, botonHTML;
            
            if (sinStock) {
                stockBadge = '<i class="fas fa-times-circle me-1"></i>Agotado';
                badgeClass = 'bg-danger';
                botonHTML = `
                    <button class="btn btn-secondary w-100 mb-2" disabled>
                        <i class="fas fa-ban me-2"></i>No disponible
                    </button>
                    <button class="btn btn-outline-primary w-100 btn-sm" onclick="verProducto(${i.id})">
                        <i class="fas fa-eye me-2"></i>Ver Detalles
                    </button>`;
            } else if (pocoStock) {
                stockBadge = `<i class="fas fa-exclamation-triangle me-1"></i>¡Solo ${i.stock}!`;
                badgeClass = 'bg-warning text-dark';
                botonHTML = `
                    <button class="btn btn-primary w-100 mb-2" onclick="a(${i.id})">
                        <i class="fas fa-cart-plus me-2"></i>Agregar al Carrito
                    </button>
                    <button class="btn btn-outline-primary w-100 btn-sm" onclick="verProducto(${i.id})">
                        <i class="fas fa-eye me-2"></i>Ver Detalles
                    </button>`;
            } else {
                stockBadge = `<i class="fas fa-check-circle me-1"></i>Stock: ${i.stock}`;
                badgeClass = 'bg-success';
                botonHTML = `
                    <button class="btn btn-primary w-100 mb-2" onclick="a(${i.id})">
                        <i class="fas fa-cart-plus me-2"></i>Agregar al Carrito
                    </button>
                    <button class="btn btn-outline-primary w-100 btn-sm" onclick="verProducto(${i.id})">
                        <i class="fas fa-eye me-2"></i>Ver Detalles
                    </button>`;
            }
            
            const categoryIcons = {
                'maquillaje': '💄',
                'facial': '✨',
                'corporal': '🧴'
            };
            
            const categoryColors = {
                'maquillaje': 'primary',
                'facial': 'success',
                'corporal': 'info'
            };
            
            return `
                <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6" data-aos="fade-up" data-aos-delay="100">
                    <div class="card product-card shadow-sm border-0 overflow-hidden">
                        <!-- Imagen del Producto -->
                        <div class="position-relative overflow-hidden product-image-container" onclick="verProducto(${i.id})" style="cursor: pointer;">
                            <img src="${i.image}" 
                                 class="card-img-top w-100 h-100 ${sinStock ? 'opacity-50' : ''}" 
                                 alt="${i.name}"
                                 loading="lazy"
                                 decoding="async"
                                 onerror="this.src='../assets/img/placeholder.png'">
                            
                            <!-- Badge de Stock en esquina superior derecha -->
                            <div class="position-absolute top-0 end-0 m-2">
                                <span class="badge ${badgeClass} badge-sm">${stockBadge}</span>
                            </div>
                            
                            <!-- Badge de Categoría en esquina superior izquierda -->
                            <div class="position-absolute top-0 start-0 m-2">
                                <span class="badge bg-white text-${categoryColors[i.category] || 'secondary'} shadow-sm badge-sm">
                                    ${categoryIcons[i.category] || ''} ${i.category}
                                </span>
                            </div>
                            
                            <!-- Overlay de Vista Rápida -->
                            <div class="position-absolute top-50 start-50 translate-middle quick-view-overlay">
                                <span class="badge bg-dark bg-opacity-75 py-2 px-3">
                                    <i class="fas fa-eye me-2"></i>Vista Rápida
                                </span>
                            </div>
                            
                            ${sinStock ? '<div class="position-absolute top-50 start-50 translate-middle"><span class="badge bg-danger py-2 px-3">AGOTADO</span></div>' : ''}
                        </div>
                        
                        <!-- Contenido de la Card -->
                        <div class="card-body d-flex flex-column p-3">
                            <h6 class="card-title fw-bold text-dark mb-2 product-title">
                                ${i.name}
                            </h6>
                            
                            <p class="card-text text-muted small mb-2 product-description">
                                ${i.description.length > 60 ? i.description.substring(0, 60) + '...' : i.description}
                            </p>
                            
                            <!-- Precio y Stock -->
                            <div class="mt-auto">
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <h5 class="text-primary mb-0 fw-bold">$${i.price.toLocaleString('es-CO')}</h5>
                                    ${pocoStock ? '<span class="badge bg-warning text-dark badge-xs"><i class="fas fa-fire me-1"></i>¡Últimas!</span>' : ''}
                                </div>
                                
                                <!-- Botón de Acción -->
                                ${botonHTML}
                            </div>
                        </div>
                    </div>
                </div>`;
        }).join("");
        
        // Reiniciar animaciones AOS de forma eficiente
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    });
}

async function a(i) {
    var x = p.find(function(e) { return e.id === i });
    if(!x) return;
    
    // Verificar stock antes de agregar
    if (x.stock === 0) {
        showToast('Este producto está agotado', 'danger');
        return;
    }
    
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    
    if (session && session.id) {
        try {
            await API.addToCart(session.id, {
                id: x.id,
                name: x.name,
                price: x.price,
                image: x.image,
                quantity: 1
            });
            if (typeof window.updateCartCountGlobal === 'function') {
                await window.updateCartCountGlobal();
            } else {
                await u();
            }
            
            // Mensaje diferente según el stock
            if (x.stock <= 5) {
                showToast(`${x.name} agregado al carrito. ¡Últimas ${x.stock} unidades disponibles!`, 'warning');
            } else {
                showToast(x.name + " agregado al carrito", 'success');
            }
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            showToast('Error al agregar al carrito', 'danger');
        }
    } else {
        var c = localStorage.getItem("cart");
        c = c ? JSON.parse(c) : [];
        var e = c.find(function(e) { return e.id === i });
        // Usar 'image' en lugar de 'img' para consistencia con el backend
        e ? e.qty++ : c.push({id:x.id, name:x.name, price:x.price, qty:1, image:x.image});
        localStorage.setItem("cart", JSON.stringify(c));
        if (typeof window.updateCartCountGlobal === 'function') {
            await window.updateCartCountGlobal();
        } else {
            await u();
        }
        
        // Mensaje diferente según el stock
        if (x.stock <= 5) {
            showToast(`${x.name} agregado al carrito. ¡Últimas ${x.stock} unidades disponibles!`, 'warning');
        } else {
            showToast(x.name + " agregado al carrito", 'success');
        }
    }
}

async function u() {
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession'));
    
    let t = 0;
    
    if (session && session.id) {
        try {
            const cart = await API.getCart(session.id);
            t = cart.items ? cart.items.reduce((s, i) => s + i.quantity, 0) : 0;
        } catch (error) {
            console.error('Error al actualizar contador:', error);
            var c = localStorage.getItem("cart");
            c = c ? JSON.parse(c) : [];
            t = c.reduce(function(s,i) { return s + i.qty }, 0);
        }
    } else {
        var c = localStorage.getItem("cart");
        c = c ? JSON.parse(c) : [];
        t = c.reduce(function(s,i) { return s + i.qty }, 0);
    }
    
    const cartCounts = document.querySelectorAll(".cart-count");
    cartCounts.forEach(cartCount => {
        cartCount.textContent = t;
    });
}

function showToast(message, type = 'info') {
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

// Función para mostrar el modal de producto - OPTIMIZADA
let modalInstance = null; // Cache de la instancia del modal

function verProducto(productId) {
    const producto = p.find(item => item.id === productId);
    
    if (!producto) {
        showToast('Producto no encontrado', 'danger');
        return;
    }
    
    const sinStock = producto.stock === 0;
    const pocoStock = producto.stock > 0 && producto.stock <= 5;
    
    // Usar fragmento de documento para construcción más eficiente
    const fragment = document.createDocumentFragment();
    
    // Configurar imagen - Optimización: usar loading lazy
    const modalImage = document.getElementById('modalProductImage');
    modalImage.src = producto.image;
    modalImage.alt = producto.name;
    modalImage.loading = 'lazy';
    
    // Configurar texto - Usar textContent es más rápido que innerHTML cuando es posible
    document.getElementById('modalProductName').textContent = producto.name;
    document.getElementById('modalProductDescription').textContent = producto.description;
    document.getElementById('modalProductPrice').textContent = `$${producto.price.toLocaleString('es-CO')}`;
    
    // Configurar categoría - Objeto inmutable para mejor rendimiento
    const categoryConfig = {
        'maquillaje': { icon: '💄', color: 'primary' },
        'facial': { icon: '✨', color: 'success' },
        'corporal': { icon: '🧴', color: 'info' }
    };
    
    const config = categoryConfig[producto.category] || { icon: '', color: 'secondary' };
    
    document.getElementById('modalCategoryBadge').innerHTML = `
        <span class="badge bg-${config.color}">
            ${config.icon} ${producto.category}
        </span>
    `;
    
    // Configurar badges de stock - Minimizar manipulación del DOM
    let stockBadge, stockAlert;
    
    if (sinStock) {
        stockBadge = '<span class="badge bg-danger">Agotado</span>';
        stockAlert = `
            <div class="alert alert-danger py-2 px-3 small mb-0">
                <i class="fas fa-times-circle me-2"></i>Este producto está agotado actualmente
            </div>
        `;
    } else if (pocoStock) {
        stockBadge = `<span class="badge bg-warning text-dark">¡Solo ${producto.stock}!</span>`;
        stockAlert = `
            <div class="alert alert-warning py-2 px-3 small mb-0">
                <i class="fas fa-exclamation-triangle me-2"></i>¡Últimas ${producto.stock} unidades disponibles!
            </div>
        `;
    } else {
        stockBadge = `<span class="badge bg-success">Stock: ${producto.stock}</span>`;
        stockAlert = `
            <div class="alert alert-success py-2 px-3 small mb-0">
                <i class="fas fa-check-circle me-2"></i>Disponible (${producto.stock} unidades)
            </div>
        `;
    }
    
    // Actualizar DOM una sola vez
    document.getElementById('modalStockBadge').innerHTML = stockBadge;
    document.getElementById('modalStockInfo').innerHTML = stockAlert;
    
    // Configurar botón de agregar al carrito - Usar referencias en lugar de recrear
    const addToCartBtn = document.getElementById('modalAddToCart');
    
    if (sinStock) {
        addToCartBtn.disabled = true;
        addToCartBtn.innerHTML = '<i class="fas fa-ban me-2"></i>No Disponible';
        addToCartBtn.className = 'btn btn-secondary btn-lg';
        addToCartBtn.onclick = null;
    } else {
        addToCartBtn.disabled = false;
        addToCartBtn.innerHTML = '<i class="fas fa-cart-plus me-2"></i>Agregar al Carrito';
        addToCartBtn.className = 'btn btn-primary btn-lg';
        
        // Usar función de flecha para mejor rendimiento
        addToCartBtn.onclick = () => {
            a(productId);
            // Reutilizar instancia del modal
            if (modalInstance) {
                modalInstance.hide();
            }
        };
    }
    
    // Reutilizar instancia del modal en lugar de crear una nueva cada vez
    const modalElement = document.getElementById('productModal');
    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalElement, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
    }
    
    modalInstance.show();
}




document.addEventListener("DOMContentLoaded", function() {
    
    cargarProductos();
    
    // Filtros
    var filtroCategoria = document.querySelector("#filtroCategoria");
    var filtroBusqueda = document.querySelector("#filtroBusqueda");
    var itemsPorPaginaSelect = document.querySelector("#itemsPorPagina");
    var precioMin = document.querySelector("#precioMin");
    var precioMax = document.querySelector("#precioMax");
    var filtroEnStock = document.querySelector("#filtroEnStock");
    var sortProducts = document.querySelector("#sortProducts");
    var clearFilters = document.querySelector("#clearFilters");
    
    // Event listeners para filtros
    if (filtroCategoria) {
        filtroCategoria.addEventListener("change", function() {
            paginaActual = 1;
            filtrar();
        });
    }
    
    if (filtroBusqueda) {
        filtroBusqueda.addEventListener("input", function() {
            paginaActual = 1;
            filtrar();
        });
    }
    
    if (itemsPorPaginaSelect) {
        itemsPorPaginaSelect.addEventListener("change", function() {
            itemsPorPagina = parseInt(this.value);
            paginaActual = 1;
            filtrar();
        });
    }
    
    if (precioMin) {
        precioMin.addEventListener("input", function() {
            paginaActual = 1;
            filtrar();
        });
    }
    
    if (precioMax) {
        precioMax.addEventListener("input", function() {
            paginaActual = 1;
            filtrar();
        });
    }
    
    if (filtroEnStock) {
        filtroEnStock.addEventListener("change", function() {
            paginaActual = 1;
            filtrar();
        });
    }
    
    if (sortProducts) {
        sortProducts.addEventListener("change", function() {
            filtrar();
        });
    }
    
    // Limpiar todos los filtros
    if (clearFilters) {
        clearFilters.addEventListener("click", function() {
            if (filtroCategoria) filtroCategoria.value = "";
            if (filtroBusqueda) filtroBusqueda.value = "";
            if (precioMin) precioMin.value = "";
            if (precioMax) precioMax.value = "";
            if (filtroEnStock) filtroEnStock.checked = false;
            if (sortProducts) sortProducts.value = "name-asc";
            paginaActual = 1;
            filtrar();
        });
    }
});
