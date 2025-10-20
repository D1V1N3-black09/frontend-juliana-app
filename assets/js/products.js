

let p = [];

var paginaActual = 1;
var itemsPorPagina = 5;

async function cargarProductos() {
    try {
        console.log('Iniciando carga de productos...');
        p = await API.getProducts();
        console.log('Productos cargados:', p.length);
        
        r(p.slice(0, itemsPorPagina));
        actualizarPaginacion(p.length);
        u();
        
    } catch (error) {
        console.error('Error cargando productos:', error);
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
    
    var productosFiltrados = p.filter(function(item) {
        var matchCategoria = categoria === "" || item.category === categoria;
        var matchBusqueda = item.name.toLowerCase().includes(busqueda) || 
                           item.description.toLowerCase().includes(busqueda);
        return matchCategoria && matchBusqueda;
    });
    
    
    var inicio = (paginaActual - 1) * itemsPorPagina;
    var fin = inicio + itemsPorPagina;
    var productosEnPagina = productosFiltrados.slice(inicio, fin);
    
    actualizarPaginacion(productosFiltrados.length);
    r(productosEnPagina);
}

function r(productos) {
    var t = document.querySelector("#productsTable tbody");
    if (!t) {
        console.error("Tabla no encontrada");
        return;
    }
    
    if (productos.length === 0) {
        t.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <p class="h5">No se encontraron productos</p>
                    <p class="text-muted">Intenta con otros filtros de búsqueda</p>
                </td>
            </tr>
        `;
        return;
    }
    
    t.innerHTML = productos.map(function(i) {
        const sinStock = i.stock === 0;
        const pocoStock = i.stock > 0 && i.stock <= 5;
        const stockNormal = i.stock > 5 && i.stock <= 10;
        const bienStock = i.stock > 10;
        
        let stockBadge, stockClass, botonHTML;
        
        if (sinStock) {
            stockBadge = '<span class="badge bg-danger fs-6"><i class="fas fa-times-circle me-1"></i>Sin Stock</span>';
            stockClass = 'table-danger opacity-75';
            botonHTML = '<button class="btn btn-secondary" disabled><i class="fas fa-ban me-2"></i>No disponible</button>';
        } else if (pocoStock) {
            stockBadge = `<span class="badge bg-warning text-dark fs-6"><i class="fas fa-exclamation-triangle me-1"></i>Últimas ${i.stock} unidades</span>`;
            stockClass = 'table-warning';
            botonHTML = `<button class="btn btn-warning text-dark" onclick="a(${i.id})"><i class="fas fa-cart-plus me-2"></i>¡Últimas unidades!</button>`;
        } else if (stockNormal) {
            stockBadge = `<span class="badge bg-info fs-6"><i class="fas fa-box me-1"></i>Stock: ${i.stock}</span>`;
            stockClass = '';
            botonHTML = `<button class="btn btn-primary" onclick="a(${i.id})"><i class="fas fa-cart-plus me-2"></i>Agregar</button>`;
        } else {
            stockBadge = `<span class="badge bg-success fs-6"><i class="fas fa-check-circle me-1"></i>Disponible (${i.stock})</span>`;
            stockClass = '';
            botonHTML = `<button class="btn btn-primary" onclick="a(${i.id})"><i class="fas fa-cart-plus me-2"></i>Agregar</button>`;
        }
        
        return `<tr class="align-middle ${stockClass}">
            <td>
                <div class="position-relative">
                    <img src="${i.image}" style="width:150px;height:150px" class="rounded shadow-sm ${sinStock ? 'opacity-50' : ''}" onerror="this.src='../assets/img/placeholder.png'">
                    ${sinStock ? '<div class="position-absolute top-50 start-50 translate-middle"><span class="badge bg-danger fs-5">AGOTADO</span></div>' : ''}
                </div>
            </td>
            <td class="h5 ${sinStock ? 'text-muted' : ''}">${i.name}</td>
            <td class="h5 ${sinStock ? 'text-muted' : ''}">$${i.price.toLocaleString('es-CO')}</td>
            <td><span class="badge bg-${i.category==="maquillaje"?"primary":i.category==="facial"?"success":"info"} fs-6">${i.category}</span></td>
            <td>${stockBadge}</td>
            <td class="fs-6 ${sinStock ? 'text-muted' : ''}">${i.description}</td>
            <td>${botonHTML}</td>
        </tr>`;
    }).join("");
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




document.addEventListener("DOMContentLoaded", function() {
    
    cargarProductos();
    
    var filtroCategoria = document.querySelector("#filtroCategoria");
    var filtroBusqueda = document.querySelector("#filtroBusqueda");
    var itemsPorPaginaSelect = document.querySelector("#itemsPorPagina");
    
    if (filtroCategoria && filtroBusqueda) {
        filtroCategoria.addEventListener("change", function() {
            paginaActual = 1;
            filtrar();
        });
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
});
