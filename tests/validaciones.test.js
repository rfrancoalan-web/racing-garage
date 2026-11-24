import test from "node:test";
import assert from "node:assert";
import {
    esEmailValido,
    esTelefonoValido,
    esCodigoPostalValido,
    tieneLargoMinimo
} from "../recursos/js/validaciones.js";

// Código postal
test("acepta un código postal de 4 números", () => {
    assert.strictEqual(esCodigoPostalValido("5000"), true);
});

test("rechaza un código postal de 3 números", () => {
    assert.strictEqual(esCodigoPostalValido("500"), false);
});

test("rechaza un código postal con letras", () => {
    assert.strictEqual(esCodigoPostalValido("50A0"), false);
});

// Email
test("acepta un email con formato correcto", () => {
    assert.strictEqual(esEmailValido("cliente@correo.com"), true);
});

test("rechaza un email sin arroba", () => {
    assert.strictEqual(esEmailValido("clientecorreo.com"), false);
});

// Teléfono
test("acepta un teléfono de 10 dígitos con guiones y espacios", () => {
    assert.strictEqual(esTelefonoValido("351 643-6853"), true);
});

test("rechaza un teléfono demasiado corto", () => {
    assert.strictEqual(esTelefonoValido("12345"), false);
});

// Largo mínimo
test("acepta un texto que cumple el largo mínimo", () => {
    assert.strictEqual(tieneLargoMinimo("Hola, quiero consultar", 10), true);
});

test("rechaza un texto de solo espacios", () => {
    assert.strictEqual(tieneLargoMinimo("          ", 5), false);
});
