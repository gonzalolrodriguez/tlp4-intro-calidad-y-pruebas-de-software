# Resultados del laboratorio: pruebas automatizadas en Express.js

Entorno: Node.js v24.20.0 · npm 12.0.2 · Vitest 3.2.7

## Registro de resultados

| Comprobación | Resultado | Observación |
| --- | --- | --- |
| Respuesta de `GET /healthy` | HTTP 200 | Devuelve `{"estado":"ok"}`. La ruta original era `/salud` y se reemplazó por `/healthy` para coincidir con la guía. |
| Primera ejecución de `npm test` | 4 pasan, 1 falla | Falla `rechaza descuentos superiores al 100 %`: la función no lanzaba error. |
| Corrección del servicio | 5 pasan | Se agregaron validaciones con `Number.isFinite` y `RangeError` en `src/services/precios.ts`, sin cambiar la fórmula. |
| Nuevas pruebas unitarias | 7 pasan | Descuento 100 % (total 0), precio negativo, descuento negativo y `NaN` como precio. |
| Prueba de integración HTTP 400 | 10 pasan en total | `POST` con descuento 150 % responde 400 con la propiedad `error`. |
| Verificación `npm run typecheck` | Sin errores | `tsc --noEmit` terminó con código 0. |

Comprobación extra: con el código original, 5 de las 10 pruebas fallan. Esto demuestra que las pruebas nuevas detectan el defecto.

## 2. Conocer la aplicación

- **¿Qué archivo contiene la regla de cálculo?** `src/services/precios.ts`.
- **¿Qué archivo define la ruta HTTP?** `src/app.ts`.
- **¿En qué se diferencian sus responsabilidades?** `precios.ts` solo calcula el precio (regla de negocio). `app.ts` recibe la petición HTTP, llama al servicio y arma la respuesta con su código de estado.

## 4. Interpretar la falla

1. Devuelve **-500** (`1000 - 1000 * 150 / 100`).
2. Un precio final no puede ser negativo: un descuento no puede superar el 100 %.
3. Porque la prueba espera que la función **lance un `RangeError`**. La función terminó normalmente y devolvió un número, así que no se cumplió la expectativa `toThrow(RangeError)`.

## 6. Desafío adicional

Sí, la validación rechaza `NaN` como precio, porque `Number.isFinite(NaN)` devuelve `false`.

## 7. ¿Por qué la prueba HTTP 400 es de integración?

Porque no llama a la función directamente. Envía una petición HTTP a la aplicación Express y comprueba la respuesta. Así se prueba que la ruta, el servicio de cálculo y el manejo de errores (que convierte el `RangeError` en un 400) funcionan juntos.

## 8. ¿Por qué usar `typecheck` y `npm test`?

Porque detectan problemas distintos. `typecheck` revisa los tipos sin ejecutar el código (por ejemplo, pasar un texto donde se espera un número). `npm test` ejecuta el código y comprueba que el comportamiento sea el esperado. Un código puede tener tipos correctos y aun así calcular mal, o al revés.

## 9. Integración continua

Pasos de `.github/workflows/pruebas.yml`:

1. `actions/checkout@v4`: descarga el repositorio.
2. `actions/setup-node@v4` con Node 24: prepara Node.
3. `npm install`: instala las dependencias.
4. `npm run typecheck`: comprueba los tipos.
5. `npm test`: ejecuta las pruebas.

## 11. Preguntas de cierre

1. **Manual vs. automatizada:** la comprobación manual la hace una persona cada vez y puede olvidar casos. La prueba automatizada queda escrita en código y se repite siempre igual con un solo comando.
2. **Causa de la primera falla:** `calcularPrecioFinal` no validaba las entradas, por eso aceptaba un descuento de 150 % y devolvía -500 en lugar de lanzar un `RangeError`.
3. **Casos inválidos:** los usuarios pueden enviar datos incorrectos. Si solo se prueban los casos habituales, errores como un total negativo pasan desapercibidos.
4. **Qué comprueba cada archivo:** `tests/precios.test.ts` comprueba solo la función de cálculo (prueba unitaria). `tests/api.test.ts` comprueba la ruta de Express, el servicio y las respuestas HTTP juntos (prueba de integración).
5. **Ejecutar después de cada cambio:** permite detectar enseguida si una modificación rompió algo que antes funcionaba (una regresión).
