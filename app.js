function adaptarFormulario() {
    const tipo = document.getElementById('tipoElemento').value;
    const vBox = document.getElementById('opcionVarillas');
    const sBox = document.getElementById('seccionSeparacion');
    
    if (tipo === "columna" || tipo === "viga") {
        vBox.style.display = "block";
        sBox.style.display = "none";
    } else {
        vBox.style.display = "none";
        sBox.style.display = "block";
    }
}

function calcular() {
    const tipo = document.getElementById('tipoElemento').value;
    const cant = parseInt(document.getElementById('cantidadElementos').value) || 1;
    const nVarillas = parseInt(document.getElementById('numVarillas').value) || 4;
    const diametro = document.getElementById('diametro').value;

    const leerNum = (id) => {
        let v = document.getElementById(id).value.toString().replace(',', '.');
        return parseFloat(v) || 0;
    };

    const L = leerNum('largo');
    const A = leerNum('ancho');
    const H = leerNum('alto');
    const sep = leerNum('separacionMalla');

    if (L <= 0 || A <= 0 || H <= 0) return alert("Ingresa medidas válidas.");

    // 1. CONCRETO (Dosificación 3000 PSI)
    const volTotal = (L * A * H) * cant;
    const cemento = (volTotal * 1.05 * 7.1).toFixed(1);
    const arena = (volTotal * 1.05 * 0.56).toFixed(2);
    const piedra = (volTotal * 1.05 * 0.84).toFixed(2);

    // 2. ACERO
    let metrosUnidad = 0;
    let detalleRefuerzo = "";

    if (tipo === "columna" || tipo === "viga") {
        metrosUnidad = L * nVarillas;
        detalleRefuerzo = `${nVarillas} varillas longitudinales`;
    } else {
        // Cálculo de Malla Cuadriculada
        const varX = Math.ceil(L / sep) + 1;
        const varY = Math.ceil(A / sep) + 1;
        metrosUnidad = (varX * A) + (varY * L);
        detalleRefuerzo = "Malla amarrada a cada " + (sep * 100) + " cm (" + sep + "m)";
    }

    const varillas6m = Math.ceil(((metrosUnidad * cant) * 1.10) / 6);
    const alambre = (varillas6m * 0.3).toFixed(1);

    document.getElementById('contenedor-reporte').innerHTML = `
        <div id="area-pdf" style="padding: 30px; background: white; border: 2px solid #2ecc71; color: #333;">
            <h2 style="color: #27ae60; text-align: center;">REPORTE DE MATERIALES</h2>
            <p style="text-align: center; font-weight: bold;">TOTAL PARA: ${cant} ${tipo.toUpperCase()}(S)</p>
            <hr>
            <p><strong>Volumen Concreto:</strong> ${volTotal.toFixed(2)} m³</p>
            <p><strong>Cemento:</strong> ${cemento} bultos | <strong>Arena:</strong> ${arena} m³</p>
            <p><strong>Piedra:</strong> ${piedra} m³</p>
            <hr>
            <h4 style="margin-bottom:5px;">Especificaciones de Acero</h4>
            <p><strong>Tipo:</strong> ${detalleRefuerzo}</p>
            <p><strong>Pedido:</strong> ${varillas6m} varillas de 6m (${diametro}")</p>
            <p><strong>Alambre Negro:</strong> ${alambre} kg</p>
            <p style="font-size: 10px; color: #aaa; text-align: center; margin-top: 20px;">CivilPro v6.5 - Henry Lombana</p>
        </div>
    `;
    document.getElementById('btn-container').style.display = "block";
}

async function descargarPDF() {
    const elemento = document.getElementById('area-pdf');
    const btn = document.getElementById('btnPdf');
    btn.innerText = "Procesando...";
    
    const opciones = {
        margin: 0.5,
        filename: 'Reporte_CivilPro_Maestro.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    window.scrollTo(0,0);
    setTimeout(() => {
        html2pdf().set(opciones).from(elemento).save().then(() => {
            btn.innerText = "📥 DESCARGAR REPORTE PDF";
        });
    }, 500);
}

function limpiarFormulario() { location.reload(); }
window.onload = adaptarFormulario;