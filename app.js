/* ==========================================================
   TPI DPW1 · Etapa 3 · Variante CI …911
   Descuento: 2×1 en el producto más barato del carrito
   ========================================================== */

// Evidencia: mi nombre en la consola
console.log("TPI DPW1 · Efrain Cabrera Escalier · CI …911");

/* ---------- 1. Datos y estado ---------- */
const CLAVE_CARRITO = "carrito"; // nombre con el que guardo en localStorage
let productos = []; // lista que llega del JSON
let carrito = []; // lista de { id, cantidad }

/* ---------- 2. Elementos del HTML (pueden no existir en otra página) ---------- */
const contProductos = document.querySelector(".productos");
const selCategoria = document.querySelector("#filtro-categoria");
const inputBuscar = document.querySelector("#buscador");
const contCarrito = document.querySelector("#carrito-lista");
const contTotales = document.querySelector("#carrito-totales");
const formContacto = document.querySelector("#form-contacto");

/* ---------- 3. localStorage ---------- */
function cargarCarrito() {
  try {
    const texto = localStorage.getItem(CLAVE_CARRITO);
    return texto ? JSON.parse(texto) : [];
  } catch (error) {
    return [];
  }
}

function guardarCarrito() {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

/* ---------- 4. Dibujar los productos ---------- */
function renderProductos(lista) {
  if (lista.length === 0) {
    contProductos.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }
  contProductos.innerHTML = lista
    .map(
      (p) => `
    <article class="card">
      <img src="${p.imagen}" alt="${p.nombre}" width="300" height="200">
      <h3>${p.nombre}</h3>
      <p class="categoria">${p.categoria}</p>
      <p class="precio">${p.precio} Bs</p>
      <button type="button" class="btn-agregar" data-id="${p.id}">Agregar al carrito</button>
    </article>`,
    )
    .join("");
}

/* ---------- 5. Filtro por categoría + buscador ---------- */
function aplicarFiltros() {
  const categoria = selCategoria.value;
  const texto = inputBuscar.value.trim().toLowerCase();

  const filtrados = productos.filter((p) => {
    const coincideCategoria =
      categoria === "todas" || p.categoria === categoria;
    const coincideTexto = p.nombre.toLowerCase().includes(texto);
    return coincideCategoria && coincideTexto;
  });

  renderProductos(filtrados);
}

/* ---------- 6. Carrito: agregar y quitar ---------- */
function agregar(id) {
  const item = carrito.find((i) => i.id === id);
  if (item) {
    item.cantidad++;
  } else {
    carrito.push({ id: id, cantidad: 1 });
  }
  guardarCarrito();
  renderCarrito();
}

function quitar(id) {
  const item = carrito.find((i) => i.id === id);
  if (!item) return;
  item.cantidad--;
  if (item.cantidad === 0) {
    carrito = carrito.filter((i) => i.id !== id);
  }
  guardarCarrito();
  renderCarrito();
}

/* ---------- 7. Cálculo: subtotal, descuento 2×1 y total ---------- */
function calcularTotales() {
  let subtotal = 0;
  let masBarato = null; // el producto de menor precio que haya en el carrito

  for (const item of carrito) {
    const p = productos.find((x) => x.id === item.id);
    subtotal += p.precio * item.cantidad;
    if (masBarato === null || p.precio < masBarato.precio) {
      masBarato = p;
    }
  }

  let descuento = 0;
  if (masBarato !== null) {
    const cantidad = carrito.find((i) => i.id === masBarato.id).cantidad;
    // 2×1: por cada 2 unidades, una es gratis
    descuento = Math.floor(cantidad / 2) * masBarato.precio;
  }

  return {
    subtotal: subtotal,
    descuento: descuento,
    total: subtotal - descuento,
  };
}

/* ---------- 8. Dibujar el carrito ---------- */
function renderCarrito() {
  if (carrito.length === 0) {
    contCarrito.innerHTML = "<li>El carrito está vacío.</li>";
    contTotales.innerHTML = "";
    return;
  }

  contCarrito.innerHTML = carrito
    .map((item) => {
      const p = productos.find((x) => x.id === item.id);
      return `
      <li>
        <span>${p.nombre} × ${item.cantidad} = ${p.precio * item.cantidad} Bs</span>
        <span>
          <button type="button" data-accion="quitar" data-id="${p.id}" aria-label="Quitar una unidad de ${p.nombre}">−</button>
          <button type="button" data-accion="sumar" data-id="${p.id}" aria-label="Agregar una unidad de ${p.nombre}">+</button>
        </span>
      </li>`;
    })
    .join("");

  const t = calcularTotales();
  contTotales.innerHTML = `
    <p>Subtotal: <strong id="subtotal">${t.subtotal} Bs</strong></p>
    <p>Descuento 2×1: <strong id="descuento">−${t.descuento} Bs</strong></p>
    <p>Total: <strong id="total">${t.total} Bs</strong></p>`;
}

/* ---------- 9. Iniciar el catálogo (solo si la página lo tiene) ---------- */
if (contProductos) {
  fetch("productos.json")
    .then((respuesta) => {
      if (!respuesta.ok) throw new Error("No se pudo cargar productos.json");
      return respuesta.json();
    })
    .then((datos) => {
      productos = datos;
      // Si guardé algo viejo en localStorage, solo conservo ids que existen
      carrito = cargarCarrito().filter((i) =>
        productos.some((p) => p.id === i.id),
      );
      renderProductos(productos);
      renderCarrito();
    })
    .catch((error) => {
      contProductos.innerHTML =
        "<p>Error al cargar los productos. Abre el sitio con Live Server.</p>";
      console.error(error);
    });

  selCategoria.addEventListener("change", aplicarFiltros);
  inputBuscar.addEventListener("input", aplicarFiltros);

  // Un solo "oyente" en el contenedor: detecta cuál botón se apretó
  contProductos.addEventListener("click", (e) => {
    const boton = e.target.closest(".btn-agregar");
    if (boton) agregar(Number(boton.dataset.id));
  });

  contCarrito.addEventListener("click", (e) => {
    const boton = e.target.closest("button[data-accion]");
    if (!boton) return;
    const id = Number(boton.dataset.id);
    if (boton.dataset.accion === "sumar") agregar(id);
    if (boton.dataset.accion === "quitar") quitar(id);
  });
}

/* ---------- 10. Validación del formulario (sin alert) ---------- */
function mostrarError(idCampo, mensaje) {
  document.querySelector("#error-" + idCampo).textContent = mensaje;
  document.querySelector("#" + idCampo).classList.add("invalido");
}

function limpiarError(idCampo) {
  document.querySelector("#error-" + idCampo).textContent = "";
  document.querySelector("#" + idCampo).classList.remove("invalido");
}

if (formContacto) {
  formContacto.addEventListener("submit", (e) => {
    e.preventDefault(); // evita que la página se recargue

    const nombre = document.querySelector("#nombre").value.trim();
    const email = document.querySelector("#email").value.trim();
    const mensaje = document.querySelector("#mensaje").value.trim();
    const exito = document.querySelector("#mensaje-exito");
    let valido = true;

    exito.textContent = "";

    if (nombre.length < 3) {
      mostrarError("nombre", "El nombre debe tener al menos 3 caracteres.");
      valido = false;
    } else {
      limpiarError("nombre");
    }

    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patronEmail.test(email)) {
      mostrarError(
        "email",
        "Escribe un correo válido, por ejemplo nombre@correo.com.",
      );
      valido = false;
    } else {
      limpiarError("email");
    }

    if (mensaje.length < 10) {
      mostrarError("mensaje", "El mensaje debe tener al menos 10 caracteres.");
      valido = false;
    } else {
      limpiarError("mensaje");
    }

    if (valido) {
      exito.textContent = "¡Gracias, " + nombre + "! Recibimos tu mensaje.";
      formContacto.reset();
    }
  });
}
