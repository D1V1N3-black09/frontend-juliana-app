/**
 * GESTIÓN DE PRODUCTOS - BEAUTIFUL GIRL
 * Carga productos desde JSON y gestiona filtros, búsqueda y carrito
 */

// Array de productos (se cargará desde JSON)
let p = [];

// Variables de paginación
var paginaActual = 1;
var itemsPorPagina = 5;

// ==========================================
// CARGA DE PRODUCTOS DESDE JSON
// ==========================================
async function cargarProductos() {
    try {
        const response = await fetch('../data/products.json');
        if (!response.ok) throw new Error('Error al cargar productos');
        
        const productos = await response.json();
        
        // Filtrar solo productos visibles para la tienda
        p = productos.filter(producto => producto.status === 'visible');
        
        // Inicializar la vista
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

// ==========================================
// FUNCIONES DE PAGINACIÓN
// ==========================================

function cambiarPagina(pagina) {
    paginaActual = pagina;
    filtrar();
}

function actualizarPaginacion(totalItems) {
    var totalPaginas = Math.ceil(totalItems / itemsPorPagina);
    var paginacionHTML = '';
    
    // Botón anterior
    paginacionHTML += `
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="event.preventDefault(); cambiarPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'tabindex="-1" aria-disabled="true"' : ''}>
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>`;

    // Números de página
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

    // Botón siguiente
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
    
    // Calcular productos para la página actual
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
        return `<tr class="align-middle">
            <td><img src="${i.image}" style="width:150px;height:150px" class="rounded shadow-sm" onerror="this.src='../assets/img/placeholder.png'"></td>
            <td class="h5">${i.name}</td>
            <td class="h5">$${i.price.toLocaleString('es-CO')}</td>
            <td><span class="badge bg-${i.category==="maquillaje"?"primary":i.category==="facial"?"success":"info"} fs-6">${i.category}</span></td>
            <td><span class="badge bg-${i.stock>10?"success":"warning"} fs-6">${i.stock>10?"En Stock":"Pocas unidades"}</span></td>
            <td class="fs-6">${i.description}</td>
            <td><button class="btn btn-primary" onclick="a(${i.id})"><i class="fas fa-cart-plus"></i> Agregar</button></td>
        </tr>`;
    }).join("");
}

function a(i) {
    var x = p.find(function(e) { return e.id === i });
    if(!x) return;
    var c = localStorage.getItem("cart");
    c = c ? JSON.parse(c) : [];
    var e = c.find(function(e) { return e.id === i });
    e ? e.qty++ : c.push({id:x.id, name:x.name, price:x.price, qty:1, img:x.image});
    localStorage.setItem("cart", JSON.stringify(c));
    u();
    alert(x.name + " agregado al carrito");
}

function u() {
    var c = localStorage.getItem("cart");
    c = c ? JSON.parse(c) : [];
    var t = c.reduce(function(s,i) { return s + i.qty }, 0);
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) {
        cartCount.textContent = t;
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    // Cargar productos desde JSON
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
