// =========================
// ELEMENTOS DEL DOM
// =========================
const horaInicioInput = document.getElementById("horaInicio");
const horaFinInput = document.getElementById("horaFin");
const horaActualEl = document.getElementById("horaActual");
const contadorEl = document.getElementById("contador");
const contadorSoloEl = document.getElementById("contadorSolo");
const barraEl = document.getElementById("barraProgreso");
const barraContainer = document.querySelector(".barra-container");

// Elementos de información
const cursoInput = document.getElementById("curso");
const evaluacionInput = document.getElementById("evaluacion");
const profesorInput = document.getElementById("profesor");
const aulaInput = document.getElementById("aula");
const claveCursoInput = document.getElementById("claveCurso");
const fechaInput = document.getElementById("fecha");
const fechaTexto = document.getElementById("fechaTexto");

// Botones
const btnFullscreen = document.getElementById("btnFullscreen");
const btnDarkMode = document.getElementById("btnDarkMode");
const btnReset = document.getElementById("btnReset");
const btnSoloReloj = document.getElementById("btnSoloReloj");
const btnSalirSoloReloj = document.getElementById("btnSalirSoloReloj");
const modalFin = document.getElementById("modalFin");
const btnCerrarModal = document.getElementById("btnCerrarModal");

// =========================
// VARIABLES GLOBALES
// =========================
let intervaloCuenta;
let tiempoTotal = 0;
let ultimoTiempoRestante = 0;
let alertaSonora = null;

// =========================
// INICIALIZACIÓN
// =========================
document.addEventListener("DOMContentLoaded", () => {
    cargarDatosGuardados();
    establecerFechaActual();
    actualizarHoraActual();
    setInterval(actualizarHoraActual, 1000);
    aplicarModoOscuro();
});

// =========================
// ESTABLECER FECHA ACTUAL
// =========================
function establecerFechaActual() {
    // Solo establecer la fecha si no hay una guardada
    if (!fechaTexto.value) {
        const hoy = new Date();
        const dia = String(hoy.getDate()).padStart(2, '0');
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const anio = hoy.getFullYear();
        
        fechaTexto.value = `${dia}/${mes}/${anio}`;
        fechaInput.value = `${anio}-${mes}-${dia}`;
    }
}

// =========================
// CUENTA REGRESIVA MEJORADA
// =========================
function iniciarCuentaRegresiva() {
    clearInterval(intervaloCuenta);

    if (!horaInicioInput.value || !horaFinInput.value) {
        contadorEl.textContent = "00:00:00";
        contadorSoloEl.textContent = "00:00:00";
        barraEl.style.width = "0%";
        barraContainer.setAttribute("aria-valuenow", "0");
        contadorEl.classList.remove("warning", "tiempo-critico");
        contadorSoloEl.classList.remove("warning", "tiempo-critico");
        return;
    }

    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

    const [hIni, mIni] = horaInicioInput.value.split(":");
    const [hFin, mFin] = horaFinInput.value.split(":");

    const inicio = new Date(hoy);
    inicio.setHours(parseInt(hIni), parseInt(mIni), 0, 0);

    const fin = new Date(hoy);
    fin.setHours(parseInt(hFin), parseInt(mFin), 0, 0);

    // Soporte para tiempo que cruza medianoche
    if (fin <= inicio) {
        fin.setDate(fin.getDate() + 1);
    }

    tiempoTotal = fin - inicio;

    intervaloCuenta = setInterval(() => {
        const ahora = new Date();
        const restante = fin - ahora;

        if (restante <= 0) {
            contadorEl.textContent = "00:00:00";
            contadorSoloEl.textContent = "00:00:00";
            barraEl.style.width = "100%";
            barraContainer.setAttribute("aria-valuenow", "100");
            contadorEl.classList.remove("warning");
            contadorEl.classList.add("tiempo-critico");
            contadorSoloEl.classList.remove("warning");
            contadorSoloEl.classList.add("tiempo-critico");
            clearInterval(intervaloCuenta);
            // Mostrar modal de fin con alerta sonora
            modalFin.classList.add("visible");
            reproducirAlerta();
            return;
        }

        // Calcular tiempo
        const horas = Math.floor(restante / 3600000);
        const minutos = Math.floor((restante % 3600000) / 60000);
        const segundos = Math.floor((restante % 60000) / 1000);

        // Formatear con ceros a la izquierda
        const horasStr = String(horas).padStart(2, "0");
        const minutosStr = String(minutos).padStart(2, "0");
        const segundosStr = String(segundos).padStart(2, "0");

        contadorEl.textContent = `${horasStr}:${minutosStr}:${segundosStr}`;
        contadorSoloEl.textContent = `${horasStr}:${minutosStr}:${segundosStr}`;

        // Advertencia visual cuando quedan menos de 5 minutos
        if (restante <= 300000 && !contadorEl.classList.contains("warning")) {
            contadorEl.classList.add("warning");
            contadorSoloEl.classList.add("warning");
        } else if (restante > 300000) {
            contadorEl.classList.remove("warning");
            contadorSoloEl.classList.remove("warning");
        }

        // Advertencia crítica cuando quedan menos de 1 minuto
        if (restante <= 60000) {
            contadorEl.classList.add("tiempo-critico");
            contadorSoloEl.classList.add("tiempo-critico");
        } else {
            contadorEl.classList.remove("tiempo-critico");
            contadorSoloEl.classList.remove("tiempo-critico");
        }

        // Actualizar barra de progreso
        const progreso = Math.min(((tiempoTotal - restante) / tiempoTotal) * 100, 100);
        barraEl.style.width = `${progreso.toFixed(2)}%`;
        barraContainer.setAttribute("aria-valuenow", Math.round(progreso));

        ultimoTiempoRestante = restante;
    }, 1000);

    // Guardar configuración
    guardarDatos();
}

// =========================
// HORA ACTUAL
// =========================
function actualizarHoraActual() {
    const ahora = new Date();
    horaActualEl.textContent = ahora.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    }).toUpperCase();
}

// =========================
// GESTIÓN DE FECHA
// =========================
fechaTexto.addEventListener("click", () => {
    fechaInput.showPicker();
});

fechaInput.addEventListener("change", () => {
    if (!fechaInput.value) return;
    const [anio, mes, dia] = fechaInput.value.split("-");
    fechaTexto.value = `${dia}/${mes}/${anio}`;
    guardarDatos();
});

// =========================
// PANTALLA COMPLETA
// =========================
btnFullscreen.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error("Error al activar pantalla completa:", err);
        });
    } else {
        document.exitFullscreen();
    }
});

document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
        btnFullscreen.innerHTML = '<span class="icon">⛶</span><span class="text">Pantalla completa</span>';
    } else {
        btnFullscreen.innerHTML = '<span class="icon">⤫</span><span class="text">Salir pantalla completa</span>';
    }
});

// =========================
// MODO OSCURO
// =========================
function aplicarModoOscuro() {
    const modoOscuro = localStorage.getItem("darkMode") === "true";
    
    if (modoOscuro) {
        document.body.classList.add("dark");
        btnDarkMode.innerHTML = '<span class="icon">☀️</span><span class="text">Modo claro</span>';
    } else {
        document.body.classList.remove("dark");
        btnDarkMode.innerHTML = '<span class="icon">🌙</span><span class="text">Modo oscuro</span>';
    }
}

btnDarkMode.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("darkMode", isDark);
    
    btnDarkMode.innerHTML = isDark
        ? '<span class="icon">☀️</span><span class="text">Modo claro</span>'
        : '<span class="icon">🌙</span><span class="text">Modo oscuro</span>';
});

// =========================
// MODO SOLO RELOJ
// =========================
function activarSoloReloj() {
    document.body.classList.add("solo-reloj");
}

function salirSoloReloj() {
    document.body.classList.remove("solo-reloj");
}

btnSoloReloj.addEventListener("click", activarSoloReloj);
btnSalirSoloReloj.addEventListener("click", salirSoloReloj);

// =========================
// MODAL FIN DE EVALUACIÓN
// =========================
function cerrarModal() {
    modalFin.classList.remove("visible");
}

function reproducirAlerta() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Tres beeps descendentes tipo alarma
        const beeps = [
            { freq: 880, start: 0.0, dur: 0.18 },
            { freq: 880, start: 0.25, dur: 0.18 },
            { freq: 880, start: 0.50, dur: 0.18 },
            { freq: 660, start: 0.85, dur: 0.35 },
        ];

        beeps.forEach(({ freq, start, dur }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

            gain.gain.setValueAtTime(0, ctx.currentTime + start);
            gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);

            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + dur + 0.05);
        });

        // Repetir 3 veces con pausa entre repeticiones
        let repeticiones = 0;
        const intervaloAlerta = setInterval(() => {
            repeticiones++;
            if (repeticiones >= 2) {
                clearInterval(intervaloAlerta);
                return;
            }
            beeps.forEach(({ freq, start, dur }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                const t0 = ctx.currentTime + start;
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, t0);
                gain.gain.setValueAtTime(0, t0);
                gain.gain.linearRampToValueAtTime(0.6, t0 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
                osc.start(t0);
                osc.stop(t0 + dur + 0.05);
            });
        }, 1400);

    } catch (e) {
        console.warn("Audio no disponible:", e);
    }
}

btnCerrarModal.addEventListener("click", cerrarModal);

// Click fuera del modal para cerrar
modalFin.addEventListener("click", (e) => {
    if (e.target === modalFin) cerrarModal();
});

// Escape también cierra el modal
// =========================
// BOTÓN RESET
// =========================
btnReset.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que deseas reiniciar el temporizador y limpiar todos los datos?")) {
        // Limpiar inputs
        horaInicioInput.value = "";
        horaFinInput.value = "";
        horaInicioInput.removeAttribute("value");
        horaFinInput.removeAttribute("value");
        cursoInput.value = "";
        evaluacionInput.value = "";
        profesorInput.value = "";
        aulaInput.value = "";
        claveCursoInput.value = "";
        fechaInput.value = "";
        fechaTexto.value = "";
        
        // Reiniciar contador
        clearInterval(intervaloCuenta);
        contadorEl.textContent = "00:00:00";
        contadorSoloEl.textContent = "00:00:00";
        barraEl.style.width = "0%";
        barraContainer.setAttribute("aria-valuenow", "0");
        contadorEl.classList.remove("warning", "tiempo-critico");
        
        // Limpiar localStorage
        localStorage.removeItem("timepucp_data");
        
        alert("Datos reiniciados correctamente");
    }
});

// =========================
// GUARDAR Y CARGAR DATOS
// =========================
function guardarDatos() {
    const datos = {
        horaInicio: horaInicioInput.value,
        horaFin: horaFinInput.value,
        curso: cursoInput.value,
        evaluacion: evaluacionInput.value,
        profesor: profesorInput.value,
        aula: aulaInput.value,
        claveCurso: claveCursoInput.value,
        fecha: fechaInput.value,
        fechaTexto: fechaTexto.value
    };
    
    localStorage.setItem("timepucp_data", JSON.stringify(datos));
}

function cargarDatosGuardados() {
    // Cada vez que se abre la página, se borra todo y se empieza desde cero.
    localStorage.removeItem("timepucp_data");
}

// Guardar datos automáticamente al cambiar
[cursoInput, evaluacionInput, profesorInput, aulaInput, claveCursoInput].forEach(input => {
    input.addEventListener("change", guardarDatos);
    input.addEventListener("blur", guardarDatos);
});

// =========================
// EVENT LISTENERS
// =========================
horaInicioInput.addEventListener("change", () => {
    horaInicioInput.setAttribute("value", horaInicioInput.value);
    iniciarCuentaRegresiva();
});
horaFinInput.addEventListener("change", () => {
    horaFinInput.setAttribute("value", horaFinInput.value);
    iniciarCuentaRegresiva();
});

// =========================
// ATAJOS DE TECLADO
// =========================
document.addEventListener("keydown", (e) => {
    // F11 para pantalla completa
    if (e.key === "F11") {
        e.preventDefault();
        btnFullscreen.click();
    }
    
    // Ctrl/Cmd + D para modo oscuro
    if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        btnDarkMode.click();
    }
    
    // Ctrl/Cmd + R para reset (con confirmación)
    if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault();
        btnReset.click();
    }

    // Escape para salir del modo solo reloj o cerrar modal
    if (e.key === "Escape") {
        if (modalFin.classList.contains("visible")) cerrarModal();
        else if (document.body.classList.contains("solo-reloj")) salirSoloReloj();
    }
});

// =========================
// MEJORAR ACCESIBILIDAD
// =========================
// Anunciar cambios importantes al lector de pantalla
function anunciarCambio(mensaje) {
    const anuncio = document.createElement("div");
    anuncio.setAttribute("role", "status");
    anuncio.setAttribute("aria-live", "polite");
    anuncio.className = "sr-only";
    anuncio.textContent = mensaje;
    document.body.appendChild(anuncio);
    
    setTimeout(() => {
        document.body.removeChild(anuncio);
    }, 1000);
}

// =========================
// PREVENIR ERRORES COMUNES
// =========================
// Validar que la hora de fin sea posterior a la de inicio
function validarHoras() {
    if (!horaInicioInput.value || !horaFinInput.value) return true;
    
    const [hIni, mIni] = horaInicioInput.value.split(":").map(Number);
    const [hFin, mFin] = horaFinInput.value.split(":").map(Number);
    
    const minutosInicio = hIni * 60 + mIni;
    const minutosFin = hFin * 60 + mFin;
    
    // Permitir cruce de medianoche si la diferencia es razonable (< 12 horas hacia atrás)
    if (minutosFin < minutosInicio) {
        const diferencia = (1440 - minutosInicio) + minutosFin; // 1440 = minutos en un día
        if (diferencia > 720) { // Si son más de 12 horas, probablemente es un error
            return false;
        }
    }
    
    return true;
}

// Agregar validación al cambiar horas
horaFinInput.addEventListener("change", () => {
    if (!validarHoras()) {
        alert("Advertencia: Verifica que las horas sean correctas. La hora de fin parece estar muy lejos de la hora de inicio.");
    }
});

// =========================
// INFORMACIÓN DEL SISTEMA
// =========================
console.log("⏰ TIMEPUCP - Sistema de temporizador iniciado");
console.log("Atajos de teclado:");
console.log("  F11: Pantalla completa");
console.log("  Ctrl/Cmd + D: Modo oscuro");
console.log("  Ctrl/Cmd + R: Reiniciar");
