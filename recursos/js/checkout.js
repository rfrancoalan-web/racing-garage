// Script del formulario de finalizar compra
// Valida los campos con JavaScript, arma el pedido, intenta enviarlo por email y va a la confirmación

import { leerCarrito, vaciarCarrito, calcularTotal } from "./carrito.js";
import { mostrarNotificacion } from "./notificaciones.js";
import { validarCampo, esEmailValido, esTelefonoValido, esCodigoPostalValido, tieneLargoMinimo } from "./validaciones.js";
import { formatearPrecio } from "./utilidades.js";
import { emailConfigurado, enviarEmail, armarTextoPedido } from "./envio-pedido.js";

const formulario = document.querySelector(".formulario");
const inputNombre = document.querySelector("#id-nombre");
const inputEmail = document.querySelector("#id-email");
const inputTelefono = document.querySelector("#id-telefono");
const inputDireccion = document.querySelector("#id-direccion");
const inputCiudad = document.querySelector("#id-ciudad");
const inputCodigoPostal = document.querySelector("#id-codigo-postal");
const listaResumen = document.querySelector(".resumen-lista");

// Descuento del 10% si paga por transferencia (si no, no hay descuento)
function calcularDescuento(subtotal, metodo) {
    if (metodo === "transferencia") {
        return Math.round(subtotal * 0.1);
    }
    return 0;
}

// Dibuja el resumen del pedido con subtotal, descuento (si hay) y total
function mostrarResumen() {
    const carrito = leerCarrito();
    const metodoElegido = document.querySelector('input[name="metodo-pago"]:checked');
    const subtotal = calcularTotal(carrito);
    const descuento = calcularDescuento(subtotal, metodoElegido.value);

    let html = "<li><span>Subtotal</span> <span>" + formatearPrecio(subtotal) + "</span></li>";
    if (descuento > 0) {
        html = html + "<li><span>Descuento transferencia (10%)</span> <span>- " + formatearPrecio(descuento) + "</span></li>";
    }
    html = html + "<li><span>Envío</span> <span>Gratis</span></li>";
    html = html + "<li><span>Total</span> <span>" + formatearPrecio(subtotal - descuento) + "</span></li>";

    listaResumen.innerHTML = html;
}

// Revisa campo por campo. Devuelve true solo si TODOS están bien
function validarFormulario() {
    let todoOk = true;

    if (!validarCampo(inputNombre, tieneLargoMinimo(inputNombre.value, 3), "Ingresá tu nombre completo (mínimo 3 letras).")) {
        todoOk = false;
    }
    if (!validarCampo(inputEmail, esEmailValido(inputEmail.value), "Ingresá un email válido, por ejemplo juan@ejemplo.com.")) {
        todoOk = false;
    }
    if (!validarCampo(inputTelefono, esTelefonoValido(inputTelefono.value), "Ingresá un teléfono con 8 a 13 números.")) {
        todoOk = false;
    }
    if (!validarCampo(inputDireccion, tieneLargoMinimo(inputDireccion.value, 5), "Ingresá calle y número.")) {
        todoOk = false;
    }
    if (!validarCampo(inputCiudad, tieneLargoMinimo(inputCiudad.value, 2), "Ingresá tu ciudad.")) {
        todoOk = false;
    }
    if (!validarCampo(inputCodigoPostal, esCodigoPostalValido(inputCodigoPostal.value), "El código postal debe tener 4 números.")) {
        todoOk = false;
    }

    return todoOk;
}

// Arma el objeto con todos los datos del pedido
function crearPedido(carrito) {
    const metodoElegido = document.querySelector('input[name="metodo-pago"]:checked');
    const numero = "RG-" + String(Date.now()).slice(-7);
    const subtotal = calcularTotal(carrito);
    const descuento = calcularDescuento(subtotal, metodoElegido.value);

    return {
        numero: numero,
        nombre: inputNombre.value.trim(),
        email: inputEmail.value.trim(),
        telefono: inputTelefono.value.trim(),
        direccion: inputDireccion.value.trim() + ", " + inputCiudad.value.trim() + " (CP: " + inputCodigoPostal.value.trim() + ")",
        metodoPago: metodoElegido.value,
        descuento: descuento,
        total: subtotal - descuento,
        productos: carrito,
        emailEnviado: false
    };
}

// Intenta mandar el pedido por email. Si falla no frena la compra: se avisa y sigue.
async function intentarEnviarEmail(pedido) {
    if (!emailConfigurado()) {
        return;
    }

    try {
        await enviarEmail(pedido.nombre, pedido.email, armarTextoPedido(pedido));
        pedido.emailEnviado = true;
    } catch (error) {
        console.error("No se pudo enviar el email:", error);
        mostrarNotificacion("No pudimos enviar el email, pero tu pedido quedó registrado.", "warning");
    }
}

// Al cambiar el método de pago se recalcula el resumen
formulario.addEventListener("change", function (evento) {
    if (evento.target.name === "metodo-pago") {
        mostrarResumen();
    }
});

mostrarResumen();

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    if (!validarFormulario()) {
        mostrarNotificacion("Revisá los campos marcados en rojo.", "warning");
        return;
    }

    const carrito = leerCarrito();

    if (carrito.length === 0) {
        mostrarNotificacion("Tu carrito está vacío. No podés confirmar una compra sin productos.", "warning");
        return;
    }

    const pedido = crearPedido(carrito);
    await intentarEnviarEmail(pedido);

    localStorage.setItem("ultimo_pedido", JSON.stringify(pedido));
    vaciarCarrito();

    window.location.href = "./confirmacion.html";
});
