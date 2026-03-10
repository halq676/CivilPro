let listaElementos = [];
let totalesObra = { cemento: 0, arena: 0, piedra: 0, varillasPrin: 0, varillasEst: 0, alambre: 0, totalEstribos: 0 };

function adaptarFormulario() {
    const tipo = document.getElementById('tipoElemento').value;
    const isLosa = (tipo === "losa");
    document.getElementById('opcionVarillas').style.display = isLosa ? "none" : "block";
    document.getElementById('seccionEstribos').style.display = isLosa ? "none" : "block";
    document.getElementById('seccionSeparacion').style.display = isLosa ? "block" : "none";
}

function obtenerDatos() {
    const leer = (id) => parseFloat(document.getElementById(id).value.replace(',', '.')) || 0;
    return { 
        tipo: document.getElementById('tipoElemento').value,
        cant: parseInt(document.getElementById('cantidadElementos').value) || 1,
        nVarillas: parseInt(document.getElementById('numVarillas').value) || 4,
        diametro: document.getElementById('diametro').value,
        L: leer('largo'), A: leer('ancho'), H: leer('alto'), 
        sepMalla: leer('separacionMalla'),
        sepEstribo: leer('separacionEstribo') || 0.20 
    };
}

function calcular() {
    const d = obtenerDatos();
    if (d.L <= 0 || d.A <= 0 || d.H <= 0) return alert("⚠️ Ingresa medidas válidas.");
    const vol = (d.L * d.A * d.H) * d.cant;
    const cem = Math.ceil(vol * 7.1 * 1.05);
    let est = (d.tipo !== "losa") ? Math.ceil(d.L / d.sepEstribo + 1) * d.cant : 0;

    document.getElementById('contenedor-reporte').innerHTML = `
        <div class="card-resultado">
            <h4>Vista previa (${d.cant} ${d.tipo}s):</h4>
            <p><b>Cemento:</b> ${cem} bultos</p>
            ${est > 0 ? `<p><b>Estribos:</b> ${est} unidades</p>` : ''}
            <button onclick="añadirAlProyecto()" class="btn-main" style="width:100%; margin-top:10px;">➕ AÑADIR AL PEDIDO</button>
        </div>`;
}

function añadirAlProyecto() {
    const d = obtenerDatos();
    const vol = (d.L * d.A * d.H) * d.cant;
    const cem = Math.ceil(vol * 7.1 * 1.05);
    const are = parseFloat((vol * 0.56 * 1.05).toFixed(2));
    const pie = parseFloat((vol * 0.84 * 1.05).toFixed(2));
    
    let nEst = 0, mPrin = 0, mEst = 0;
    if (d.tipo !== "losa") {
        nEst = Math.ceil(d.L / d.sepEstribo + 1) * d.cant;
        mPrin = (d.L * d.nVarillas) * d.cant;
        let periEst = ((d.A + d.H) * 2 + 0.15); // Perímetro + ganchos
        mEst = periEst * nEst;
    } else {
        mPrin = (((d.L / d.sepMalla) + 1) * d.A + ((d.A / d.sepMalla) + 1) * d.L) * d.cant;
    }
    
    const vPrin = Math.ceil((mPrin * 1.10) / 6);
    const vEst = Math.ceil((mEst * 1.10) / 6);
    const alam = parseFloat(((vPrin + vEst) * 0.3).toFixed(1));

    listaElementos.push({ id: Date.now(), nombre: `${d.cant} ${d.tipo}(s)`, cem, are, pie, vPrin, vEst, alam, nEst });
    actualizarTabla();
}

function actualizarTabla() {
    totalesObra = { cemento: 0, arena: 0, piedra: 0, varillasPrin: 0, varillasEst: 0, alambre: 0, totalEstribos: 0 };
    listaElementos.forEach(e => {
        totalesObra.cemento += e.cem; totalesObra.arena += e.are; totalesObra.piedra += e.pie;
        totalesObra.varillasPrin += e.vPrin; totalesObra.varillasEst += e.vEst;
        totalesObra.alambre += e.alam; totalesObra.totalEstribos += e.nEst;
    });

    const diam = document.getElementById('diametro').value;
    let html = `
        <div class="reporte-box">
            <h3>📋 PEDIDO DE MATERIALES</h3>
            <table class="tabla-final">
                <tr><td><b>Cemento Gris</b></td><td>${totalesObra.cemento} bultos</td></tr>
                <tr><td><b>Hierro Principal (${diam})</b></td><td>${totalesObra.varillasPrin} vars</td></tr>
                ${totalesObra.varillasEst > 0 ? `<tr><td><b>Hierro Estribo (1/4")</b></td><td>${totalesObra.varillasEst} vars</td></tr>` : ''}
                ${totalesObra.totalEstribos > 0 ? `<tr><td><b>Total Estribos</b></td><td>${totalesObra.totalEstribos} und</td></tr>` : ''}
                <tr><td><b>Arena</b></td><td>${totalesObra.arena.toFixed(2)} m³</td></tr>
                <tr><td><b>Piedra</b></td><td>${totalesObra.piedra.toFixed(2)} m³</td></tr>
                <tr><td><b>Alambre Negro</b></td><td>${totalesObra.alambre.toFixed(1)} kg</td></tr>
            </table>
            <div class="detalle-lista">
                ${listaElementos.map(e => `
                    <div class="item-pedido">
                        <span>• ${e.nombre}</span>
                        <button class="btn-del" onclick="borrar(${e.id})">BORRAR</button>
                    </div>`).join('')}
            </div>
        </div>`;
    document.getElementById('contenedor-reporte').innerHTML = html;
    document.getElementById('btn-container').style.display = "block";
}

function borrar(id) {
    listaElementos = listaElementos.filter(e => e.id !== id);
    actualizarTabla();
}

function enviarWhatsApp() {
    const d = document.getElementById('diametro').value;
    let msj = `*🏗️ CIVILPRO - PEDIDO*%0A*Cemento:* ${totalesObra.cemento} bultos%0A*Hierro ${d}:* ${totalesObra.varillasPrin} vars%0A`;
    if(totalesObra.varillasEst > 0) msj += `*Hierro 1/4 (Estribos):* ${totalesObra.varillasEst} vars%0A*Total Estribos:* ${totalesObra.totalEstribos} und%0A`;
    msj += `*Arena:* ${totalesObra.arena.toFixed(2)} m³%0A*Piedra:* ${totalesObra.piedra.toFixed(2)} m³%0A*Alambre:* ${totalesObra.alambre.toFixed(1)} kg`;
    window.open(`https://wa.me/?text=${msj}`, '_blank');
}

function limpiarProyecto() { if(confirm("¿Borrar todo?")) location.reload(); }
window.onload = adaptarFormulario;
