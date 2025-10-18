// Array de productos
const p = [
    // Bases y primers
    {id:1, name:"Base Aura", price:49.90, cat:"maquillaje", stock:15, desc:"Base de maquillaje líquida de larga duración", img:"../Imagenes_pagina_juliana/base-aura.PNG"},
    {id:2, name:"Base Mouse", price:45.90, cat:"maquillaje", stock:20, desc:"Base mousse mate de cobertura media", img:"../Imagenes_pagina_juliana/base-mouse.PNG"},
    {id:3, name:"Base Queen", price:55.90, cat:"maquillaje", stock:10, desc:"Base de alta cobertura efecto porcelana", img:"../Imagenes_pagina_juliana/base-queen.PNG"},
    {id:4, name:"Primer Pop", price:39.90, cat:"maquillaje", stock:25, desc:"Primer facial hidratante", img:"../Imagenes_pagina_juliana/primer-pop.PNG"},
    {id:5, name:"Primer Summer", price:42.90, cat:"maquillaje", stock:20, desc:"Primer facial efecto bronceado", img:"../Imagenes_pagina_juliana/primer-summer.PNG"},
    {id:6, name:"Primer Watermelon", price:41.90, cat:"maquillaje", stock:18, desc:"Primer facial refrescante", img:"../Imagenes_pagina_juliana/primer-watermelon.PNG"},
    {id:7, name:"Primer Carrusel", price:44.90, cat:"maquillaje", stock:15, desc:"Primer facial iluminador", img:"../Imagenes_pagina_juliana/primer-carrusel.PNG"},
    
    // Pestañinas
    {id:8, name:"Pestañina Fresh", price:35.90, cat:"maquillaje", stock:25, desc:"Máscara de pestañas waterproof", img:"../Imagenes_pagina_juliana/pestanina-fresh.PNG"},
    {id:9, name:"Pestañina Boom", price:32.90, cat:"maquillaje", stock:18, desc:"Máscara voluminizadora", img:"../Imagenes_pagina_juliana/pestanina-boom.PNG"},
    {id:10, name:"Pestañina Pastel", price:34.90, cat:"maquillaje", stock:22, desc:"Máscara alargadora de pestañas", img:"../Imagenes_pagina_juliana/pestanina-pastel.PNG"},
    
    // Cuidado facial
    {id:11, name:"Crema Hidratante", price:45.90, cat:"facial", stock:30, desc:"Crema hidratante facial 24h", img:"../Imagenes_pagina_juliana/crema-hidratante.PNG"},
    {id:12, name:"Agua de Rosas", price:29.90, cat:"facial", stock:25, desc:"Tónico facial refrescante", img:"../Imagenes_pagina_juliana/agua-rosas.PNG"},
    {id:13, name:"Bruma Facial", price:39.90, cat:"facial", stock:20, desc:"Bruma fijadora de maquillaje", img:"../Imagenes_pagina_juliana/bruma-facial.PNG"},
    {id:14, name:"Aceite Desmaquillante", price:42.90, cat:"facial", stock:15, desc:"Aceite limpiador facial", img:"../Imagenes_pagina_juliana/aceite-desmaquillante.PNG"},
    {id:15, name:"Mascarilla Acné", price:35.90, cat:"facial", stock:20, desc:"Mascarilla facial anti-acné", img:"../Imagenes_pagina_juliana/mascarilla-acne.PNG"},
    {id:16, name:"Mascarilla Ojos", price:25.90, cat:"facial", stock:30, desc:"Parches hidratantes para ojos", img:"../Imagenes_pagina_juliana/mascarilla-ojos.PNG"},
    {id:17, name:"Toallas Desmaquillantes", price:19.90, cat:"facial", stock:40, desc:"Toallas húmedas desmaquillantes", img:"../Imagenes_pagina_juliana/toallas-desmaquillante.PNG"},
    
    // Iluminadores y contorno
    {id:18, name:"Iluminador Alegría", price:39.90, cat:"maquillaje", stock:20, desc:"Iluminador en polvo compacto", img:"../Imagenes_pagina_juliana/iluminador-alegria.PNG"},
    {id:19, name:"Iluminador Wonderland", price:42.90, cat:"maquillaje", stock:15, desc:"Iluminador líquido nacarado", img:"../Imagenes_pagina_juliana/iluminador-wonderland.PNG"},
    {id:20, name:"Contorno Barra", price:38.90, cat:"maquillaje", stock:25, desc:"Contorno facial en barra", img:"../Imagenes_pagina_juliana/contorno-barra.PNG"},
    {id:21, name:"Contorno Chocolate", price:41.90, cat:"maquillaje", stock:20, desc:"Contorno en polvo tono chocolate", img:"../Imagenes_pagina_juliana/contorno-chocolate.PNG"},
    {id:22, name:"Contorno Cupcake", price:39.90, cat:"maquillaje", stock:18, desc:"Contorno en crema", img:"../Imagenes_pagina_juliana/contorno-cupcake.PNG"},
    {id:23, name:"Contorno Queen", price:44.90, cat:"maquillaje", stock:15, desc:"Paleta de contorno profesional", img:"../Imagenes_pagina_juliana/contorno-queen.PNG"},
    {id:24, name:"Contorno Star", price:43.90, cat:"maquillaje", stock:20, desc:"Contorno facial iluminador", img:"../Imagenes_pagina_juliana/contorno-star.PNG"},
    
    // Correctores
    {id:25, name:"Corrector Magic", price:25.90, cat:"maquillaje", stock:30, desc:"Corrector de alta cobertura", img:"../Imagenes_pagina_juliana/corrector-magic.PNG"},
    {id:26, name:"Corrector Aura", price:28.90, cat:"maquillaje", stock:25, desc:"Corrector iluminador", img:"../Imagenes_pagina_juliana/corrector-aura.PNG"},
    {id:27, name:"Corrector Naranja", price:24.90, cat:"maquillaje", stock:20, desc:"Corrector color naranja para ojeras", img:"../Imagenes_pagina_juliana/corrector-naranja.PNG"},
    {id:28, name:"Corrector Verde", price:24.90, cat:"maquillaje", stock:20, desc:"Corrector verde para rojeces", img:"../Imagenes_pagina_juliana/corrector-verde.PNG"},
    {id:29, name:"Corrector Magic Mini", price:19.90, cat:"maquillaje", stock:35, desc:"Corrector de viaje", img:"../Imagenes_pagina_juliana/corrector-magic-mini.PNG"},
    
    // Polvos
    {id:30, name:"Polvo Bakery", price:38.90, cat:"maquillaje", stock:20, desc:"Polvo translúcido mate", img:"../Imagenes_pagina_juliana/polvo-bakery.PNG"},
    {id:31, name:"Polvo Hadas", price:41.90, cat:"maquillaje", stock:15, desc:"Polvo iluminador con brillos", img:"../Imagenes_pagina_juliana/polvo-hadas.PNG"},
    {id:32, name:"Polvo Osito", price:36.90, cat:"maquillaje", stock:25, desc:"Polvo compacto suave", img:"../Imagenes_pagina_juliana/polvo-osito.PNG"},
    {id:33, name:"Polvos Banana", price:39.90, cat:"maquillaje", stock:20, desc:"Polvo banana para contorno", img:"../Imagenes_pagina_juliana/polvos-banana.PNG"},
    {id:34, name:"Polvos Golden", price:42.90, cat:"maquillaje", stock:18, desc:"Polvo bronceador dorado", img:"../Imagenes_pagina_juliana/polvos-golden.PNG"},
    
    // Labiales y tintas
    {id:35, name:"Kit Labios", price:65.90, cat:"maquillaje", stock:15, desc:"Set completo de labiales", img:"../Imagenes_pagina_juliana/kit-labios.PNG"},
    {id:36, name:"Labial Glazed", price:29.90, cat:"maquillaje", stock:30, desc:"Labial efecto gloss", img:"../Imagenes_pagina_juliana/labial-glazed.PNG"},
    {id:37, name:"Tinta Frutas", price:32.90, cat:"maquillaje", stock:25, desc:"Tinta labial sabor frutas", img:"../Imagenes_pagina_juliana/tinta-frutas.PNG"},
    {id:38, name:"Tinta Jack", price:34.90, cat:"maquillaje", stock:20, desc:"Tinta labial larga duración", img:"../Imagenes_pagina_juliana/tinta-jack.PNG"},
    {id:39, name:"Tinta Villanos", price:34.90, cat:"maquillaje", stock:20, desc:"Tinta labial mate", img:"../Imagenes_pagina_juliana/tinta-villanos.PNG"},
    
    // Rubores
    {id:40, name:"Rubor Lucky", price:32.90, cat:"maquillaje", stock:25, desc:"Rubor en polvo compacto", img:"../Imagenes_pagina_juliana/rubor-lucky.PNG"},
    {id:41, name:"Rubor Star", price:34.90, cat:"maquillaje", stock:20, desc:"Rubor líquido de larga duración", img:"../Imagenes_pagina_juliana/rubor-star.PNG"},
    {id:42, name:"Rubor Stamp", price:31.90, cat:"maquillaje", stock:22, desc:"Rubor en sello", img:"../Imagenes_pagina_juliana/rubor-stamp.PNG"},
    {id:43, name:"Rubor Vergüenza", price:33.90, cat:"maquillaje", stock:18, desc:"Rubor efecto natural", img:"../Imagenes_pagina_juliana/rubor-verguenza.PNG"},
    {id:44, name:"Rubor Villanos", price:35.90, cat:"maquillaje", stock:15, desc:"Rubor intenso mate", img:"../Imagenes_pagina_juliana/rubor-villanos.PNG"},
    
    // Sombras
    {id:45, name:"Sombra Hollywood", price:45.90, cat:"maquillaje", stock:15, desc:"Paleta de sombras metálicas", img:"../Imagenes_pagina_juliana/sombra-hollywood.PNG"},
    {id:46, name:"Sombra Cloud", price:42.90, cat:"maquillaje", stock:18, desc:"Paleta de sombras mate", img:"../Imagenes_pagina_juliana/sombra-cloud.PNG"},
    {id:47, name:"Sombra Jack", price:44.90, cat:"maquillaje", stock:20, desc:"Paleta de sombras Halloween", img:"../Imagenes_pagina_juliana/sombra-jack.PNG"},
    {id:48, name:"Sombra Puppy", price:41.90, cat:"maquillaje", stock:22, desc:"Paleta de sombras kawaii", img:"../Imagenes_pagina_juliana/sombra-puppy.PNG"},
    
    // Sueros y tratamientos
    {id:49, name:"Suero Detox", price:55.90, cat:"facial", stock:20, desc:"Suero facial purificante", img:"../Imagenes_pagina_juliana/suero-detox.PNG"},
    {id:50, name:"Suero Hidratante", price:52.90, cat:"facial", stock:25, desc:"Suero facial hidratante", img:"../Imagenes_pagina_juliana/suero-hidratante.PNG"},
    {id:51, name:"Suero Vitamina C", price:58.90, cat:"facial", stock:18, desc:"Suero facial antioxidante", img:"../Imagenes_pagina_juliana/suero-vitaminac.PNG"},
    
    // Protección solar y corporales
    {id:52, name:"Protector Solar", price:59.90, cat:"facial", stock:20, desc:"Protector solar facial SPF 50+", img:"../Imagenes_pagina_juliana/protector-solar.PNG"},
    {id:53, name:"Mantequilla Corporal", price:49.90, cat:"corporal", stock:20, desc:"Crema corporal nutritiva", img:"../Imagenes_pagina_juliana/mantequilla-corporal.PNG"},
    
    // Kits especiales
    {id:54, name:"Kit Furia", price:89.90, cat:"maquillaje", stock:10, desc:"Kit completo de maquillaje", img:"../Imagenes_pagina_juliana/kit-furia.PNG"},
    {id:55, name:"Barra Multi", price:45.90, cat:"maquillaje", stock:15, desc:"Barra multiusos rostro", img:"../Imagenes_pagina_juliana/barra-multi.PNG"},
    {id:56, name:"Contorno Ojos", price:38.90, cat:"facial", stock:25, desc:"Crema contorno de ojos", img:"../Imagenes_pagina_juliana/contorno-ojos.PNG"},
    {id:57, name:"Polvos Jack", price:43.90, cat:"maquillaje", stock:12, desc:"Polvos fijadores edición Halloween", img:"../Imagenes_pagina_juliana/polvos-jack.PNG"},
    {id:58, name:"Polvos Master", price:46.90, cat:"maquillaje", stock:15, desc:"Polvos profesionales HD", img:"../Imagenes_pagina_juliana/polvos-master.PNG"},
    {id:59, name:"Crema Facial", price:48.90, cat:"facial", stock:20, desc:"Crema facial regeneradora", img:"../Imagenes_pagina_juliana/crema-facial.PNG"},
    {id:60, name:"Serum Hidratante", price:54.90, cat:"facial", stock:18, desc:"Serum facial intensivo", img:"../Imagenes_pagina_juliana/serum-hidratante.PNG"},
    {id:2, name:"Base Mouse", price:45.90, cat:"maquillaje", stock:20, desc:"Base mousse mate de cobertura media", img:"../Imagenes_pagina_juliana/base-mouse.PNG"},
    {id:3, name:"Base Queen", price:55.90, cat:"maquillaje", stock:10, desc:"Base de alta cobertura efecto porcelana", img:"../Imagenes_pagina_juliana/base-queen.PNG"},
    {id:4, name:"Pestañina Fresh", price:35.90, cat:"maquillaje", stock:25, desc:"Máscara de pestañas waterproof", img:"../Imagenes_pagina_juliana/pestanina-fresh.PNG"},
    {id:5, name:"Pestañina Boom", price:32.90, cat:"maquillaje", stock:18, desc:"Máscara voluminizadora", img:"../Imagenes_pagina_juliana/pestanina-boom.PNG"},
    {id:6, name:"Pestañina Pastel", price:34.90, cat:"maquillaje", stock:22, desc:"Máscara alargadora de pestañas", img:"../Imagenes_pagina_juliana/pestanina-pastel.PNG"},
    {id:7, name:"Crema Hidratante", price:45.90, cat:"facial", stock:30, desc:"Crema hidratante facial 24h", img:"../Imagenes_pagina_juliana/crema-hidratante.PNG"},
    {id:8, name:"Agua de Rosas", price:29.90, cat:"facial", stock:25, desc:"Tónico facial refrescante", img:"../Imagenes_pagina_juliana/agua-rosas.PNG"},
    {id:9, name:"Bruma Facial", price:39.90, cat:"facial", stock:20, desc:"Bruma fijadora de maquillaje", img:"../Imagenes_pagina_juliana/bruma-facial.PNG"},
    {id:10, name:"Aceite Desmaquillante", price:42.90, cat:"facial", stock:15, desc:"Aceite limpiador facial", img:"../Imagenes_pagina_juliana/aceite-desmaquillante.PNG"},
    {id:11, name:"Iluminador Alegría", price:39.90, cat:"maquillaje", stock:20, desc:"Iluminador en polvo compacto", img:"../Imagenes_pagina_juliana/iluminador-alegria.PNG"},
    {id:12, name:"Iluminador Wonderland", price:42.90, cat:"maquillaje", stock:15, desc:"Iluminador líquido nacarado", img:"../Imagenes_pagina_juliana/iluminador-wonderland.PNG"},
    {id:13, name:"Corrector Magic", price:25.90, cat:"maquillaje", stock:30, desc:"Corrector de alta cobertura", img:"../Imagenes_pagina_juliana/corrector-magic.PNG"},
    {id:14, name:"Corrector Aura", price:28.90, cat:"maquillaje", stock:25, desc:"Corrector iluminador", img:"../Imagenes_pagina_juliana/corrector-aura.PNG"},
    {id:15, name:"Protector Solar", price:59.90, cat:"facial", stock:20, desc:"Protector solar facial SPF 50+", img:"../Imagenes_pagina_juliana/protector-solar.PNG"},
    {id:16, name:"Mantequilla Corporal", price:49.90, cat:"corporal", stock:20, desc:"Crema corporal nutritiva", img:"../Imagenes_pagina_juliana/mantequilla-corporal.PNG"},
    {id:17, name:"Sombra Hollywood", price:45.90, cat:"maquillaje", stock:15, desc:"Paleta de sombras metálicas", img:"../Imagenes_pagina_juliana/sombra-hollywood.PNG"},
    {id:18, name:"Sombra Cloud", price:42.90, cat:"maquillaje", stock:18, desc:"Paleta de sombras mate", img:"../Imagenes_pagina_juliana/sombra-cloud.PNG"},
    {id:19, name:"Rubor Lucky", price:32.90, cat:"maquillaje", stock:25, desc:"Rubor en polvo compacto", img:"../Imagenes_pagina_juliana/rubor-lucky.PNG"},
    {id:20, name:"Rubor Star", price:34.90, cat:"maquillaje", stock:20, desc:"Rubor líquido de larga duración", img:"../Imagenes_pagina_juliana/rubor-star.PNG"}
];

// Variables de paginación
var paginaActual = 1;
var itemsPorPagina = 5;

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
        var matchCategoria = categoria === "" || item.cat === categoria;
        var matchBusqueda = item.name.toLowerCase().includes(busqueda) || 
                           item.desc.toLowerCase().includes(busqueda);
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
    
    t.innerHTML = productos.map(function(i) {
        return `<tr class="align-middle">
            <td><img src="${i.img}" style="width:150px;height:150px" class="rounded shadow-sm"></td>
            <td class="h5">${i.name}</td>
            <td class="h5">S/${i.price.toFixed(2)}</td>
            <td><span class="badge bg-${i.cat==="maquillaje"?"primary":"success"} fs-6">${i.cat}</span></td>
            <td><span class="badge bg-${i.stock>10?"success":"warning"} fs-6">${i.stock>10?"En Stock":"Pocas unidades"}</span></td>
            <td class="fs-6">${i.desc}</td>
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
    e ? e.qty++ : c.push({id:x.id, name:x.name, price:x.price, qty:1, img:x.img});
    localStorage.setItem("cart", JSON.stringify(c));
    u();
    alert(x.name + " agregado al carrito");
}

function u() {
    var c = localStorage.getItem("cart");
    c = c ? JSON.parse(c) : [];
    var t = c.reduce(function(s,i) { return s + i.qty }, 0);
    document.querySelector(".cart-count").textContent = t;
}

document.addEventListener("DOMContentLoaded", function() {
    r(p.slice(0, itemsPorPagina));
    u();
    
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
    
    actualizarPaginacion(p.length);
});
