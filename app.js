let listaCalculos = [];

function adaptarFormulario() {
    const tipo = document.getElementById('tipoElemento').value;
    const esPared = (tipo === 'Pared');
    document.getElementById('seccion-hierro').style.display = esPared ? 'none' : 'block';
    document.getElementById('contenedor-ancho').style.display = esPared ? 'none' : 'block';
    document.getElementById('grupo-ladrillo').style.display = esPared ? 'block' : 'none';
}

function calcular() {
    const tipo = document.getElementById('tipoElemento').value;
    const cant = parseFloat(document.getElementById('cantidad').value) || 0;
    const L = parseFloat(document.getElementById('largo').value) || 0;
    const A = parseFloat(document.getElementById('ancho').value) || 0;
    const H = parseFloat(document.getElementById('alto').value) || 0;

    let nuevoItem = {
        id: Date.now(),
        nombre: `${tipo} (${cant} und)`,
        cemento: 0, arena: 0, piedra: 0, varPrin: 0, dP: "", varEst: 0, dE: "", alambre: 0, ladrillos: 0, ladrilloTipo: ""
    };

    if (tipo === 'Pared') {
        const area = L * H * cant;
        const clase = document.getElementById('claseLadrillo').value;
        nuevoItem.ladrilloTipo = clase === 'farol' ? "Farol" : "Sólido";
        nuevoItem.ladrillos = Math.ceil(area * (clase === 'farol' ? 16 : 38) * 1.05);
    } else {
        const vol = L * A * H * cant;
        nuevoItem.cemento = Math.ceil(vol * 8.5); 
        nuevoItem.arena = parseFloat((vol * 0.52).toFixed(2));
        nuevoItem.piedra = parseFloat((vol * 0.65).toFixed(2));

        const dP = document.getElementById('diametro').value;
        const vP = parseFloat(document.getElementById('varillasCant').value) || 0;
        const mP = L * vP * cant;
        nuevoItem.varPrin = Math.ceil(mP / 6);
        nuevoItem.dP = dP;

        const dE = document.getElementById('diametroEstribo').value;
        const sep = parseFloat(document.getElementById('separacion').value) || 0;
        let mE = 0;
        if (sep > 0) {
            const nEst = (Math.floor(L / sep) + 1) * cant;
            const longEst = (tipo === 'Losa') ? (A * 1.05) : ((A + H) * 2 + 0.15);
            mE = nEst * longEst;
            nuevoItem.varEst = Math.ceil(mE / 6);
            nuevoItem.dE = dE;
        }
        nuevoItem.alambre = parseFloat(((mP + mE) * 0.04).toFixed(1));
    }

    listaCalculos.push(nuevoItem);
    renderizarTodo();
}

function eliminarItem(id) {
    listaCalculos = listaCalculos.filter(item => item.id !== id);
    renderizarTodo();
}

function renderizarTodo() {
    const historialDiv = document.getElementById('historial-categorias');
    const consolidadoDiv = document.getElementById('contenedor-consolidado');
    historialDiv.innerHTML = "";
    
    // Objeto para acumular materiales por tipo
    let resumen = {
        cemento: 0, arena: 0, piedra: 0, alambre: 0, ladrillos: 0,
        hierros: {} // Aquí guardaremos: {"1/2": 10, "1/4": 5}
    };

    listaCalculos.forEach(item => {
        resumen.cemento += item.cemento;
        resumen.arena += item.arena;
        resumen.piedra += item.piedra;
        resumen.alambre += item.alambre;
        resumen.ladrillos += item.ladrillos;

        // Sumar hierro principal al diámetro correspondiente
        if(item.varPrin > 0) {
            resumen.hierros[item.dP] = (resumen.hierros[item.dP] || 0) + item.varPrin;
        }
        // Sumar estribos al diámetro correspondiente
        if(item.varEst > 0) {
            resumen.hierros[item.dE] = (resumen.hierros[item.dE] || 0) + item.varEst;
        }

        historialDiv.innerHTML += `
            <div class="item-calculado">
                <button class="btn-borrar-item" onclick="eliminarItem(${item.id})">×</button>
                <h4>${item.nombre}</h4>
                <p>
                    ${item.cemento > 0 ? `Cem: ${item.cemento} bul | ` : ''}
                    ${item.varPrin > 0 ? `Prin: ${item.varPrin} de ${item.dP} | ` : ''}
                    ${item.varEst > 0 ? `Est: ${item.varEst} de ${item.dE} | ` : ''}
                    ${item.ladrillos > 0 ? `Ladrillo: ${item.ladrillos} ${item.ladrilloTipo}` : ''}
                </p>
            </div>`;
    });

    if (listaCalculos.length > 0) {
        let tablaHierros = "";
        for (let diametro in resumen.hierros) {
            tablaHierros += `<tr><td>Hierro de ${diametro}</td><td>${resumen.hierros[diametro]} vars</td></tr>`;
        }

        consolidadoDiv.innerHTML = `
            <div class="reporte-consolidado">
                <h3>📋 REPORTE CONSOLIDADO</h3>
                <table class="tabla-final">
                    <tr><td>Cemento Gris</td><td>${resumen.cemento} bultos</td></tr>
                    ${tablaHierros}
                    <tr><td>Alambre Negro</td><td>${resumen.alambre.toFixed(1)} kg</td></tr>
                    <tr><td>Arena</td><td>${resumen.arena.toFixed(2)} m³</td></tr>
                    <tr><td>Piedra / Triturado</td><td>${resumen.piedra.toFixed(2)} m³</td></tr>
                    ${resumen.ladrillos > 0 ? `<tr><td>Total Ladrillos</td><td>${resumen.ladrillos} und</td></tr>` : ''}
                </table>
                <button class="btn-whatsapp" onclick="enviarWA()">Enviar Pedido Total</button>
            </div>`;
    } else {
        consolidadoDiv.innerHTML = "";
    }
}

function enviarWA() {
    // Generar mensaje automático
    let msj = "*PEDIDO CIVILPRO - TOTAL*%0A";
    listaCalculos.forEach(item => {
        msj += `-%20${item.nombre}%0A`;
    });
    window.open(`https://wa.me/?text=${msj}`, '_blank');
}

window.onload = adaptarFormulario;

