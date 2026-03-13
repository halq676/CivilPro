// 1. CARGA INICIAL: Lee de la memoria o inicia vacío
let listaCalculos = JSON.parse(localStorage.getItem('civilPro_data')) || [];
const PESOS_HIERRO = { '1/4"': 0.25, '3/8"': 0.56, '1/2"': 0.99, '5/8"': 1.55 };

function adaptarFormulario() {
    const tipo = document.getElementById('tipoElemento').value;
    const esPared = (tipo === 'Pared');
    const esRepello = (tipo === 'Repello');
    const esParrilla = (tipo === 'Zapata' || tipo === 'Losa'); // Agrupamos ambos
    
    const lblLargo = document.getElementById('lblLargo');
    const lblAncho = document.getElementById('lblAncho');
    const lblAlto = document.getElementById('lblAlto');
    const seccionHierro = document.getElementById('seccion-hierro');

    if (esPared || esRepello) {
        lblLargo.innerText = "Largo (m):";
        lblAlto.innerText = "Alto (m):";
        seccionHierro.style.display = 'none';
        document.getElementById('contenedor-ancho').style.display = 'none';
        document.getElementById('grupo-ladrillo').style.display = esPared ? 'block' : 'none';
    } else {
        // Para Losa o Zapata usamos términos de área
        lblLargo.innerText = esParrilla ? "Largo (m):" : "Largo/Alto (m):";
        lblAncho.innerText = esParrilla ? "Ancho (m):" : "Ancho (m):";
        lblAlto.innerText = esParrilla ? "Espesor (m):" : "Espesor/Base (m):";
        
        seccionHierro.style.display = 'block';
        document.getElementById('contenedor-ancho').style.display = 'block';
        document.getElementById('grupo-ladrillo').style.display = 'none';

        const lblVarillas = document.getElementById('lblVarillas');
        const lblSep = document.getElementById('lblSep');
        const estriboSelect = document.getElementById('contenedor-estribo-select');

        if (esParrilla) {
            lblVarillas.innerText = "Separación varillas X (m):";
            lblSep.innerText = "Separación varillas Y (m):";
            if(estriboSelect) estriboSelect.style.display = 'none'; 
        } else {
            lblVarillas.innerText = "Cant. Varillas principales:";
            lblSep.innerText = "Separación Estribos (m):";
            if(estriboSelect) estriboSelect.style.display = 'block';
        }
    }
}
function calcular() {
    const tipo = document.getElementById('tipoElemento').value;
    const cant = parseFloat(document.getElementById('cantidad').value) || 0;
    const L = parseFloat(document.getElementById('largo').value) || 0; 
    const A = parseFloat(document.getElementById('ancho').value) || 0;
    const H = parseFloat(document.getElementById('alto').value) || 0;

    let item = { 
        id: Date.now(), 
        nombre: `${tipo} (${cant} und)`, 
        cemento: 0, arena: 0, piedra: 0, 
        agua: 0,
        ladrillos: 0, ladrilloTipo: "", 
        hierros: {}, pesos: {}, 
        cantEstribos: 0, diamEstribo: "", 
        alambre: 0 
    };

    if (tipo === 'Pared') {
        const area = L * H * cant;
        const clase = document.getElementById('claseLadrillo').value;
        item.ladrilloTipo = clase === 'farol' ? "Farol" : "Sólido";
        if (clase === 'farol') {
            item.ladrillos = Math.ceil(area * 16 * 1.05);
            item.cemento = Math.ceil(area * 0.30);
            item.arena = parseFloat((area * 0.035).toFixed(2));
            
        } else {
            item.ladrillos = Math.ceil(area * 38 * 1.05);
            item.cemento = Math.ceil(area * 0.80);
            item.arena = parseFloat((area * 0.06).toFixed(2));
            item.agua = Math.round(item.cemento * 16);
            
        }
    } else if (tipo === 'Repello') {
        const area = L * H * cant;
        item.cemento = Math.ceil(area / 5); 
        item.arena = parseFloat((area * 0.025).toFixed(2));
        item.nombre = `Repello (${area.toFixed(1)} m²)`;
        item.agua = Math.round(item.cemento * 18);

    } else if (tipo === 'Zapata' || tipo === 'Losa') {
        // CÁLCULO DE ZAPATA (NUEVO)
        const vol = L * A * H * cant;
        item.cemento = Math.ceil(vol * 8.5); 
        item.arena = parseFloat((vol * 0.55).toFixed(2));
        item.piedra = parseFloat((vol * 0.84).toFixed(2));
        item.agua = Math.round(vol * 170);

        const dP = document.getElementById('diametro').value; 
        const sepX = parseFloat(document.getElementById('varillasCant').value) || 0.15; 
        const sepY = parseFloat(document.getElementById('separacion').value) || 0.15;

        const numVarillasEnA = Math.floor(A / sepX) + 1;
        const numVarillasEnL = Math.floor(L / sepY) + 1;

        const metrosParrilla = ((numVarillasEnA * L) + (numVarillasEnL * A)) * cant;
        
        item.hierros[dP] = Math.ceil(metrosParrilla / 6);
        item.pesos[dP] = parseFloat((metrosParrilla * PESOS_HIERRO[dP]).toFixed(2));
        item.alambre = parseFloat((metrosParrilla * 0.05).toFixed(1));
        item.nombre = `${tipo} (${L}x${A}x${H}m)`;
    } else {
        // CÁLCULO DE VIGAS Y COLUMNAS
        const vol = L * A * H * cant;
        item.cemento = Math.ceil(vol * 8.5); 
        item.arena = parseFloat((vol * 0.55).toFixed(2));
        item.piedra = parseFloat((vol * 0.84).toFixed(2));
        item.agua = Math.round(vol * 170);

        const dP = document.getElementById('diametro').value;
        const nP = parseFloat(document.getElementById('varillasCant').value) || 0;
        const metrosP = L * nP * cant;
        item.hierros[dP] = Math.ceil(metrosP / 6);
        item.pesos[dP] = parseFloat((metrosP * PESOS_HIERRO[dP]).toFixed(2));

        const dE = document.getElementById('diametroEstribo').value;
        const sep = parseFloat(document.getElementById('separacion').value) || 0;
        if (sep > 0) {
            const nE = (Math.floor(L / sep) + 1) * cant;
            item.cantEstribos = nE; 
            item.diamEstribo = dE;
            const desarrollo = ((A + H) * 2) + 0.15;
            const metrosE = nE * desarrollo;
            
            item.hierros[dE] = (item.hierros[dE] || 0) + Math.ceil(metrosE / 6);
            item.pesos[dE] = (item.pesos[dE] || 0) + parseFloat((metrosE * PESOS_HIERRO[dE]).toFixed(2));
            item.alambre = parseFloat(((metrosP + metrosE) * 0.04).toFixed(1));
        }
    }
    listaCalculos.push(item);
    renderizarTodo();
}

function renderizarTodo() {
    const historialDiv = document.getElementById('historial-categorias');
    const consolidadoDiv = document.getElementById('contenedor-consolidado');
    historialDiv.innerHTML = "";
    
    let total = { cemento: 0, arena: 0, piedra: 0, agua: 0, alambre: 0, ladrillos: 0, hierros: {}, pesos: {}, totalEstribos: 0 };

    listaCalculos.forEach(item => {
        total.cemento += item.cemento;
        total.arena += item.arena;
        total.piedra += item.piedra;
        total.agua += (item.agua || 0);
        total.alambre += item.alambre;
        total.ladrillos += item.ladrillos;
        total.totalEstribos += (item.cantEstribos || 0);

        for(let d in item.hierros) {
            total.hierros[d] = (total.hierros[d] || 0) + item.hierros[d];
            total.pesos[d] = (total.pesos[d] || 0) + item.pesos[d];
        }

        historialDiv.innerHTML += `
            <div class="item-calculado">
                <button class="btn-borrar-item" onclick="eliminarItem(${item.id})">×</button>
                <h4>${item.nombre}</h4>
                <div style="font-size: 0.85rem; line-height: 1.4;">
                    ${item.ladrillos > 0 ? `<b>Ladrillos:</b> ${item.ladrillos} ${item.ladrilloTipo}` : ''}
                    ${item.cemento > 0 ? `<br><span style="color:#2980b9"><b>Cem:</b> ${item.cemento} bul | <b>Arena:</b> ${item.arena} m³</span>` : ''}
                    ${item.cantEstribos > 0 ? `<br><span style="color:#27ae60"><b>Estribos:</b> ${item.cantEstribos} de ${item.diamEstribo}</span>` : ''}
                    ${Object.keys(item.hierros).filter(d => d !== item.diamEstribo).map(d => `<br><b>Hierro ${d}:</b> ${item.hierros[d]}v (${item.pesos[d]}kg)`).join('')}
                </div>
            </div>`;
    });

    if (listaCalculos.length > 0) {
        let filasHierro = "";
        for (let d in total.hierros) {
            filasHierro += `<tr><td>Hierro de ${d}</td><td>${total.hierros[d]} v / <b>${total.pesos[d].toFixed(1)} Kg</b></td></tr>`;
        }

        consolidadoDiv.innerHTML = `
            <div class="reporte-consolidado">
                <h3>📋 REPORTE CONSOLIDADO</h3>
                <table class="tabla-final">
                    <tr><td>Cemento Gris</td><td>${total.cemento} bultos</td></tr>
                    ${filasHierro}
                    ${total.totalEstribos > 0 ? `<tr style="background:#e8f5e9"><td><b>Total Estribos</b></td><td><b>${total.totalEstribos} piezas</b></td></tr>` : ''}
                    <tr><td>Arena</td><td>${total.arena.toFixed(2)} m³</td></tr>
                    ${total.piedra > 0 ? `<tr><td>Piedra / Triturado</td><td>${total.piedra.toFixed(2)} m³</td></tr>` : ''}
                    ${total.agua > 0 ? `<tr><td>Agua Aproximada</td><td style="color: #007bff;"><b>${total.agua} Litros</b></td></tr>` : ''}
                    ${total.alambre > 0 ? `<tr><td>Alambre Negro</td><td>${total.alambre.toFixed(1)} kg</td></tr>` : ''}
                    ${total.ladrillos > 0 ? `<tr style="background:#fff9c4"><td><b>Ladrillos Totales</b></td><td><b>${total.ladrillos} und</b></td></tr>` : ''}
                </table>
                <button class="btn-whatsapp" onclick="enviarWA()">Enviar Pedido WhatsApp</button>
                <button onclick="nuevaObra()" style="background:#e74c3c; color:white; border:none; padding:10px; margin-top:10px; border-radius:5px; width:100%; cursor:pointer;">Limpiar Todo / Nueva Obra</button>
            </div>`;
    } else {
        consolidadoDiv.innerHTML = "";
    }

    // ACTUALIZACIÓN: Esta línea es la que guarda físicamente en el navegador
    localStorage.setItem('civilPro_data', JSON.stringify(listaCalculos));
}

function enviarWA() {
    if (listaCalculos.length === 0) {
        alert("No hay materiales para enviar.");
        return;
    }

    // 1. Agregamos 'agua: 0' aquí para que no de error
    let total = { cemento: 0, arena: 0, piedra: 0, agua: 0, alambre: 0, ladrillos: 0, hierros: {}, pesos: {}, totalEstribos: 0 };
    
    listaCalculos.forEach(item => {
        total.cemento += item.cemento;
        total.arena += item.arena;
        total.piedra += item.piedra;
        total.agua += (item.agua || 0); // Sumamos el agua
        total.alambre += item.alambre;
        total.ladrillos += item.ladrillos;
        total.totalEstribos += (item.cantEstribos || 0);
        for(let d in item.hierros) {
            total.hierros[d] = (total.hierros[d] || 0) + item.hierros[d];
            total.pesos[d] = (total.pesos[d] || 0) + item.pesos[d];
        }
    });

    let msj = "*🏗️ PEDIDO MATERIALES - CIVILPRO*%0A";
    msj += "==============================%0A";
    msj += "*📦 TOTALES A PEDIR:*%0A";
    msj += `• Cemento Gris: *${total.cemento} bultos*%0A`;
    msj += `• Arena: *${total.arena.toFixed(2)} m³*%0A`;
    
    // CORRECCIÓN AQUÍ: Usamos msj (no mensaje) y cerramos el IF correctamente
    if (total.agua > 0) {
        msj += `• Agua aprox: *${total.agua} Litros*%0A`;
    }

    if (total.piedra > 0) msj += `• Piedra/Triturado: *${total.piedra.toFixed(2)} m³*%0A`;
    if (total.ladrillos > 0) msj += `• Ladrillos Totales: *${total.ladrillos} und*%0A`;
    
    for (let d in total.hierros) {
        msj += `• Hierro de ${d}: *${total.hierros[d]} varillas* (${total.pesos[d].toFixed(1)}kg)%0A`;
    }
    
    if (total.totalEstribos > 0) msj += `• Total Estribos: *${total.totalEstribos} piezas*%0A`;
    if (total.alambre > 0) msj += `• Alambre Negro: *${total.alambre.toFixed(1)} kg*%0A`;

    msj += "==============================%0A";
    msj += "*📋 DETALLE DE OBRA:*%0A";
    listaCalculos.forEach(i => { msj += `- ${i.nombre}%0A`; });

    // Agregamos tu firma final
    msj += "%0A*Calculado por: Henry Lombana*";

    window.open(`https://wa.me/?text=${msj}`, '_blank');
}

function eliminarItem(id) {
    listaCalculos = listaCalculos.filter(i => i.id !== id);
    renderizarTodo();
}

function nuevaObra() {
    if (confirm("¿Seguro que quieres borrar todos los cálculos para iniciar una nueva obra?")) {
        listaCalculos = [];
        localStorage.removeItem('civilPro_data');
        renderizarTodo();
    }
}

// ACTUALIZACIÓN: Al cargar la página, adaptamos el formulario y dibujamos lo guardado
window.onload = function() {
    adaptarFormulario();
    renderizarTodo(); 
};