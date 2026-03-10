// 1. VARIABLES GLOBALES
let listaElementos = [];
let totalesObra = { cemento: 0, arena: 0, piedra: 0, varillas: 0, alambre: 0 };

// 2. ADAPTAR FORMULARIO
function adaptarFormulario() {
    const tipo = document.getElementById('tipoElemento').value;
    const vBox = document.getElementById('opcionVarillas');
    const sBox = document.getElementById('seccionSeparacion');
    if (vBox && sBox) {
        vBox.style.display = (tipo === "columna" || tipo === "viga") ? "block" : "none";
        sBox.style.display = (tipo === "columna" || tipo === "viga") ? "none" : "block";
    }
}

// 3. CAPTURAR DATOS
function obtenerDatos() {
    const leer = (id) => {
        const el = document.getElementById(id);
        return el ? parseFloat(el.value.replace(',', '.')) || 0 : 0;
    };
    return { 
        tipo: document.getElementById('tipoElemento').value,
        cant: parseInt(document.getElementById('cantidadElementos').value) || 1,
        nVarillas: parseInt(document.getElementById('numVarillas').value) || 4,
        diametro: document.getElementById('diametro').value,
        L: leer('largo'), A: leer('ancho'), H: leer('alto'), 
        sep: leer('separacionMalla') 
    };
}

// 4. VER CÁLCULO
function calcular() {
    const d = obtenerDatos();
    if (d.L <= 0 || d.A <= 0 || d.H <= 0) return alert("Ingresa medidas válidas.");

    const volTotal = (d.L * d.A * d.H) * d.cant;
    const cem = Math.ceil(volTotal * 1.05 * 7.1); 
    let metrosLong = (d.tipo === "columna" || d.tipo === "viga") ? (d.L * d.nVarillas) : (Math.ceil(d.L / d.sep) + 1) * d.A + (Math.ceil(d.A / d.sep) + 1) * d.L;
    const varillas6m = Math.ceil(((metrosLong * d.cant) * 1.10) / 6);

    document.getElementById('contenedor-reporte').innerHTML = `
        <div class="card" style="border-left: 5px solid #27ae60; background: #f9f9f9; padding: 15px; margin-top:20px;">
            <h4>Cálculo para ${d.cant} ${d.tipo}(s):</h4>
            <p><strong>Cemento:</strong> ${cem} bultos | <strong>Hierro:</strong> ${varillas6m} varillas</p>
            <button onclick="añadirAlProyecto()" class="btn-main" style="width:100%; margin-top:10px;">➕ AÑADIR AL PEDIDO</button>
        </div>`;
}

// 5. AÑADIR AL PROYECTO
function añadirAlProyecto() {
    const d = obtenerDatos();
    const vol = (d.L * d.A * d.H) * d.cant;
    const cem = Math.ceil(vol * 1.05 * 7.1);
    const are = parseFloat((vol * 1.05 * 0.56).toFixed(2));
    const pie = parseFloat((vol * 1.05 * 0.84).toFixed(2));
    let metrosLong = (d.tipo === "columna" || d.tipo === "viga") ? (d.L * d.nVarillas) : (Math.ceil(d.L / d.sep) + 1) * d.A + (Math.ceil(d.A / d.sep) + 1) * d.L;
    const vars = Math.ceil(((metrosLong * d.cant) * 1.10) / 6);
    const alam = parseFloat((vars * 0.3).toFixed(1));

    const nuevoElemento = { 
        id: Date.now(), 
        nombre: `${d.cant} ${d.tipo}(s) de ${d.L}x${d.A}`, 
        cem, are, pie, vars, alam 
    };

    listaElementos.push(nuevoElemento);
    recalcularTotales();
}

// 6. ELIMINAR ELEMENTO
function eliminarElemento(id) {
    listaElementos = listaElementos.filter(e => e.id !== id);
    recalcularTotales();
}

// 7. RECALCULAR
function recalcularTotales() {
    totalesObra = { cemento: 0, arena: 0, piedra: 0, varillas: 0, alambre: 0 };
    listaElementos.forEach(e => {
        totalesObra.cemento += e.cem;
        totalesObra.arena += e.are;
        totalesObra.piedra += e.pie;
        totalesObra.varillas += e.vars;
        totalesObra.alambre += e.alam;
    });
    actualizarTablaProyecto();
}

// 8. ACTUALIZAR TABLA VISIBLE
function actualizarTablaProyecto() {
    const diametro = document.getElementById('diametro').value;
    let html = `
        <div id="area-pdf" style="padding: 15px; background: white; color: black; border: 2px solid #333; margin-top:20px;">
            <h3 style="text-align: center;">REPORTE DE MATERIALES</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <tr style="background: #eee;">
                    <th style="border: 1px solid #000; padding: 5px;">Elemento</th>
                    <th style="border: 1px solid #000; padding: 5px;">Cem</th>
                    <th style="border: 1px solid #000; padding: 5px;">X</th>
                </tr>
                ${listaElementos.map(e => `
                    <tr>
                        <td style="border: 1px solid #000; padding: 5px; font-size:12px;">${e.nombre}</td>
                        <td style="border: 1px solid #000; padding: 5px; text-align:center;">${e.cem}</td>
                        <td style="border: 1px solid #000; padding: 5px; text-align:center;">
                            <button onclick="eliminarElemento(${e.id})" style="background:#e74c3c; color:white; border:none; padding:2px 8px; cursor:pointer;">X</button>
                        </td>
                    </tr>
                `).join('')}
            </table>
            <div style="font-weight: bold; border: 2px solid #000; padding: 10px; background: #f9f9f9;">
                <p>✅ TOTAL CEMENTO: ${totalesObra.cemento} bultos</p>
                <p>✅ TOTAL HIERRO: ${totalesObra.varillas} varillas</p>
                <p>⏳ ARENA: ${totalesObra.arena.toFixed(2)} m³</p>
                <p>⏳ PIEDRA: ${totalesObra.piedra.toFixed(2)} m³</p>
            </div>
        </div>`;
    
    document.getElementById('contenedor-reporte').innerHTML = html;
    const btnCont = document.getElementById('btn-container');
    if (btnCont) btnCont.style.display = listaElementos.length > 0 ? "block" : "none";
}

// 9. WHATSAPP
function descargarPDF() {
    if (listaElementos.length === 0) return alert("No hay datos.");
    const diametro = document.getElementById('diametro').value;
    let mensaje = `*🏗️ CIVILPRO - REPORTE*%0A✅ *CEMENTO:* ${totalesObra.cemento} bultos%0A✅ *HIERRO:* ${totalesObra.varillas} varillas%0A⏳ *ARENA:* ${totalesObra.arena.toFixed(2)} m³%0A⏳ *PIEDRA:* ${totalesObra.piedra.toFixed(2)} m³`;
    window.open(`https://wa.me/?text=${mensaje}`, '_blank');
}

function limpiarProyecto() { if (confirm("¿Borrar todo?")) location.reload(); }
window.onload = adaptarFormulario;
