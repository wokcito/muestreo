const contenedor = document.getElementById('resultado')
const formulario = document.getElementById('formulario')

formulario.addEventListener('submit', (e) => {
    e.preventDefault()

    const datos = {};
    const formData = new FormData(formulario)
    formData.forEach((value, key) => datos[key] = value)

    const { elementos, modo } = datos

    const ESPACIO = ' '
    const elementosOrdenados = elementos.split(ESPACIO).map(elemento => Number(elemento)).sort()

    const combinaciones = calcularCombinaciones(elementosOrdenados, modo)
    const xRaya = calcularXRaya(combinaciones)
    const sCuadrado = calcularSCuadrado(combinaciones)
    const sCuadradoCorregida = calcularSCuadradoCorregida(combinaciones)

    const tablaCombinaciones = `
        <table>
            <thead>
                <tr>
                    <th scope="row">Comb.</th>
                    ${ combinaciones.map(([primero, segundo]) => `<th scope="col">${primero}-${segundo}</th>`).join('') }
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row"><span class="con-linea">X</span></th>
                    ${ xRaya.map(resultado => `<td>${resultado}</td>`).join('') }
                </tr>
                <tr>
                    <th scope="row"><span>S<sup>2</sup></span></th>
                    ${ sCuadrado.map(resultado => `<td>${resultado}</td>`).join('') }
                </tr>
                <tr>
                    <th scope="row"><span>S<sup>2</sup> corregida</span></th>
                    ${ sCuadradoCorregida.map(resultado => `<td>${resultado}</td>`).join('') }
                </tr>
            </tbody>
        </table>
    `

    const distribucionMuestralDeMedias = `
        <table>
            <thead>
                <tr>
                    <th scope="row"><span class="con-linea">X</span></th>
                    ${ Object.keys(obtenerDistribucion(xRaya)).map(valor => `<td>${valor}</td>`).join('') }
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">Fi</th>
                    ${ Object.values(obtenerDistribucion(xRaya)).map(cantidad => `<td>${cantidad}</td>`).join('') }
                </tr>
            </tbody>
        </table>
    `

    const distribucionMuestralDeVarianza = `
        <table>
            <thead>
                <tr>
                    <th scope="row"><span>S<sup>2</sup></span></th>
                    ${ Object.keys(obtenerDistribucion(sCuadrado)).map(valor => `<td>${valor}</td>`).join('') }
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">Fi</th>
                    ${ Object.values(obtenerDistribucion(sCuadrado)).map(cantidad => `<td>${cantidad}</td>`).join('') }
                </tr>
            </tbody>
        </table>
    `

    const distribucionMuestralDeVarianzaCorregida = `
        <table>
            <thead>
                <tr>
                    <th scope="row"><span>S<sup>2</sup> corregida</span></th>
                    ${ Object.keys(obtenerDistribucion(sCuadradoCorregida)).map(valor => `<td>${valor}</td>`).join('') }
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">Fi</th>
                    ${ Object.values(obtenerDistribucion(sCuadradoCorregida)).map(cantidad => `<td>${cantidad}</td>`).join('') }
                </tr>
            </tbody>
        </table>
    `

    const valoresDePoblacion = `
        <table>
            <caption>
                Población
            </caption>
            <thead>
                <th scope="col"><span>μ</span><sub>X</sub></th>
                <th scope="col"><span>σ</span><sup>2</sup><sub>X</sub></th>
                <th scope="col"><span>σ</span><sub>X</sub></th>
            </thead>
            <tbody>
                <td>${calcularMediaPoblacion(elementosOrdenados)}</td>
                <td>${calcularVarianzaPoblacion(elementosOrdenados)}</td>
                <td>${formatearNumero(Math.sqrt(calcularVarianzaPoblacion(elementosOrdenados)))}</td>
            </tbody>
        </table>
    `

    const valoresDeMuestra = `
        <table>
            <caption>
                Muestra
            </caption>
            <thead>
                <th scope="col"><span>μ</span><sub class="con-linea">X</sub></th>
                <th scope="col"><span>σ</span><sup>2</sup><sub class="con-linea">X</sub></th>
                <th scope="col"><span>σ</span><sub class="con-linea">X</sub></th>
                <th scope="col"><span>μ</span><sub>S</sub><sup>2</th>
            </thead>
            <tbody>
                <td>${calcularMediaMuestra(combinaciones, xRaya)}</td>
                <td>${calcularVarianzaPoblacion(xRaya.map(valor => Number(valor)))}</td>
                <td>${formatearNumero(Math.sqrt(calcularVarianzaPoblacion(xRaya.map(valor => Number(valor)))))}</td>
                <td>${calcularMediaVarianzasMuestra(combinaciones, sCuadrado)}</td>
            </tbody>
        </table>
    `

    contenedor.innerHTML =
        tablaCombinaciones +
        distribucionMuestralDeMedias +
        distribucionMuestralDeVarianza +
        distribucionMuestralDeVarianzaCorregida +
        valoresDePoblacion +
        valoresDeMuestra
})

function formatearNumero(numero) {
    if (Number.isInteger(numero)) {
        return numero.toString()
    } else {
        return numero.toFixed(2)
    }
}

function calcularCombinaciones(elementos, modo) {
    const MODO_CON_REPOSICION = 'con-reposicion'
    const combinaciones = []

    if (modo === MODO_CON_REPOSICION) {
        for (let i = 0; i < elementos.length; i++) {
            for (let j = 0; j < elementos.length; j++) {
                combinaciones.push([Number(elementos[i]), Number(elementos[j])])
            }
        }
    } else {
        for (let i = 0; i < elementos.length; i++) {
            let j = i + 1

            while (j < elementos.length) {
                combinaciones.push([Number(elementos[i]), Number(elementos[j])])
                j++
            }
        }
    }

    return combinaciones
}

const VALOR_INICIAL_CERO = 0

function calcularXRaya(combinaciones) {
    return combinaciones.map(combinacion => {
        return formatearNumero(combinacion.reduce((acumulador, valor) => acumulador + valor, VALOR_INICIAL_CERO) / combinacion.length)
    })
}

function calcularSCuadrado(combinaciones) {
    const medias = calcularXRaya(combinaciones)

    return combinaciones.map((combinacion, i) => {
        return formatearNumero(combinacion.reduce((acumulador, valor) => acumulador + ((valor - medias[i]) ** 2), VALOR_INICIAL_CERO) / combinacion.length)
    })
}

function calcularSCuadradoCorregida(combinaciones) {
    const PRIMER_VALOR = 0
    const SCuadrado = calcularSCuadrado(combinaciones)
    const n = combinaciones[PRIMER_VALOR].length

    return SCuadrado.map(varianza => formatearNumero(varianza * (n / (n - 1))))
}

function obtenerDistribucion(datos) {
    const distribucion = {}

    datos.forEach(dato => {
        if (distribucion[dato] === undefined) {
            distribucion[dato] = 1
        } else {
            distribucion[dato] += 1
        }
    })

    return distribucion
}

function calcularMediaPoblacion(elementos) {
    return formatearNumero(elementos.reduce((acumulador, valor) => acumulador + valor, VALOR_INICIAL_CERO) / elementos.length)
}

function calcularMediaMuestra(combinaciones, medias) {
    return formatearNumero(medias.reduce((acumulador, media) => acumulador + Number(media), VALOR_INICIAL_CERO) / combinaciones.length)
}

function calcularVarianzaPoblacion(elementos) {
    const media = calcularMediaPoblacion(elementos)

    return formatearNumero(elementos.reduce((acumulador, valor) => acumulador + ((valor - media) ** 2), VALOR_INICIAL_CERO) / elementos.length)
}

function calcularMediaVarianzasMuestra(combinaciones, varianzas) {
    return formatearNumero(varianzas.reduce((acumulador, varianza) => acumulador + Number(varianza), VALOR_INICIAL_CERO) / combinaciones.length)
}
