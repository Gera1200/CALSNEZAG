// Array para almacenar los registros
let registros = [];

// Función para verificar si un año es bisiesto
function esBisiesto(año) {
    return (año % 4 === 0 && año % 100 !== 0) || (año % 400 === 0);
}

// Función para calcular la diferencia entre dos fechas
function calcularDiferencia(fecha1, fecha2) {
    let f1 = new Date(fecha1);
    let f2 = new Date(fecha2);
    
    let años = f2.getFullYear() - f1.getFullYear();
    let meses = f2.getMonth() - f1.getMonth();
    let días = f2.getDate() - f1.getDate();
    
    // Ajustar si los días son negativos
    if (días < 0) {
        meses--;
        const ultimoDiaMesAnterior = new Date(f2.getFullYear(), f2.getMonth(), 0).getDate();
        días += ultimoDiaMesAnterior;
    }
    
    // Ajustar si los meses son negativos
    if (meses < 0) {
        años--;
        meses += 12;
    }
    
    return { años, meses, días };
}

// Función para agregar un nuevo registro
function agregarRegistro() {
    const clave = document.getElementById('terminacionClave').value;
    const ingreso = document.getElementById('fechaIngreso').value;
    const egreso = document.getElementById('fechaEgreso').value;
    const tipo = document.getElementById('tipo').value;
    
    // Validar campos requeridos
    if (!clave || !ingreso || !egreso || !tipo) {
        alert('Por favor complete todos los campos');
        return;
    }
    
    // Validar formato de clave
    if (clave.length !== 6 || !/^\d+$/.test(clave)) {
        alert('La terminación de clave debe tener 6 dígitos');
        return;
    }

    // Validar fechas
    if (new Date(ingreso) > new Date(egreso)) {
        alert('La fecha de ingreso no puede ser posterior a la fecha de egreso');
        return;
    }
    
    const registro = {
        id: Date.now(),
        clave,
        ingreso,
        egreso,
        tipo
    };
    
    registros.push(registro);
    actualizarTabla();
    limpiarFormulario();
}

// Función para actualizar la tabla de registros
function actualizarTabla() {
    const tbody = document.querySelector('#registrosTabla tbody');
    tbody.innerHTML = '';
    
    registros.forEach(registro => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${registro.clave}</td>
            <td>${formatearFecha(registro.ingreso)}</td>
            <td>${formatearFecha(registro.egreso)}</td>
            <td>${registro.tipo === '1' ? 'Activo' : 'Licencia'}</td>
            <td>
                <button class="btn" onclick="editarRegistro(${registro.id})">Editar</button>
                <button class="btn" onclick="eliminarRegistro(${registro.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para formatear fechas
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-MX');
}

// Función para editar un registro
function editarRegistro(id) {
    const registro = registros.find(r => r.id === id);
    if (registro) {
        document.getElementById('terminacionClave').value = registro.clave;
        document.getElementById('fechaIngreso').value = registro.ingreso;
        document.getElementById('fechaEgreso').value = registro.egreso;
        document.getElementById('tipo').value = registro.tipo;
        
        eliminarRegistro(id);
    }
}

// Función para eliminar un registro
function eliminarRegistro(id) {
    if (confirm('¿Está seguro de eliminar este registro?')) {
        registros = registros.filter(r => r.id !== id);
        actualizarTabla();
    }
}

// Función para limpiar el formulario
function limpiarFormulario() {
    document.getElementById('terminacionClave').value = '';
    document.getElementById('fechaIngreso').value = '';
    document.getElementById('fechaEgreso').value = '';
    document.getElementById('tipo').value = '1';
}

// Función para calcular el tiempo total
function calcularTiempo() {
    let tiempoActivo = { años: 0, meses: 0, días: 0 };
    let tiempoLicencia = { años: 0, meses: 0, días: 0 };
    
    // Ordenar registros por fecha
    registros.sort((a, b) => new Date(a.ingreso) - new Date(b.ingreso));
    
    // Calcular períodos sin duplicidad
    let ultimaFecha = null;
    registros.forEach(registro => {
        let fechaInicio = new Date(registro.ingreso);
        let fechaFin = new Date(registro.egreso);
        
        // Ajustar fecha de inicio si hay solapamiento
        if (ultimaFecha && fechaInicio < ultimaFecha) {
            fechaInicio = new Date(ultimaFecha);
        }
        
        if (fechaInicio < fechaFin) {
            const diferencia = calcularDiferencia(fechaInicio, fechaFin);
            
            if (registro.tipo === '1') { // Activo
                tiempoActivo.años += diferencia.años;
                tiempoActivo.meses += diferencia.meses;
                tiempoActivo.días += diferencia.días;
            } else { // Licencia
                tiempoLicencia.años += diferencia.años;
                tiempoLicencia.meses += diferencia.meses;
                tiempoLicencia.días += diferencia.días;
            }
        }
        
        ultimaFecha = fechaFin > (ultimaFecha || fechaFin) ? fechaFin : ultimaFecha;
    });
    
    // Normalizar resultados
    normalizarTiempo(tiempoActivo);
    normalizarTiempo(tiempoLicencia);
    
    // Actualizar resultados en la interfaz
    document.getElementById('tiempoActivo').textContent = 
        `Tiempo Activo: ${tiempoActivo.años} años, ${tiempoActivo.meses} meses, ${tiempoActivo.días} días`;
    document.getElementById('tiempoLicencia').textContent = 
        `Tiempo en Licencia: ${tiempoLicencia.años} años, ${tiempoLicencia.meses} meses, ${tiempoLicencia.días} días`;
}

// Función para normalizar el tiempo (convertir exceso de días a meses y meses a años)
function normalizarTiempo(tiempo) {
    if (tiempo.días >= 30) {
        tiempo.meses += Math.floor(tiempo.días / 30);
        tiempo.días %= 30;
    }
    if (tiempo.meses >= 12) {
        tiempo.años += Math.floor(tiempo.meses / 12);
        tiempo.meses %= 12;
    }
}

// Función para eliminar todos los registros
function eliminarTodo() {
    if (confirm('¿Está seguro de eliminar todos los registros?')) {
        registros = [];
        actualizarTabla();
        document.getElementById('tiempoActivo').textContent = 'Tiempo Activo: 0 años, 0 meses, 0 días';
        document.getElementById('tiempoLicencia').textContent = 'Tiempo en Licencia: 0 años, 0 meses, 0 días';
        limpiarFormulario();
    }
}