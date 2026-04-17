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
const barraPorcentajeEl = document.getElementById("barraPorcentaje");

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
let toastTimeout = null;

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
        contadorEl.classList.remove("warning", "tiempo-critico", "en-espera");
        contadorSoloEl.classList.remove("warning", "tiempo-critico", "en-espera");
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
        const antesDeInicio = inicio - ahora;
        const restante = fin - ahora;

        // === FASE DE ESPERA: aún no ha llegado la hora de inicio ===
        if (antesDeInicio > 0) {
            // Mostrar la duración total de la evaluación (no cuenta regresiva)
            const durTotal = tiempoTotal;
            const hD = Math.floor(durTotal / 3600000);
            const mD = Math.floor((durTotal % 3600000) / 60000);
            const sD = Math.floor((durTotal % 60000) / 1000);
            const durStr = `${String(hD).padStart(2, "0")}:${String(mD).padStart(2, "0")}:${String(sD).padStart(2, "0")}`;

            contadorEl.textContent = durStr;
            contadorSoloEl.textContent = durStr;
            contadorEl.classList.add("en-espera");
            contadorSoloEl.classList.add("en-espera");
            contadorEl.classList.remove("warning", "tiempo-critico");
            contadorSoloEl.classList.remove("warning", "tiempo-critico");
            barraEl.style.width = "0%";
            barraContainer.setAttribute("aria-valuenow", "0");
            actualizarColorBarra(0);
            return;
        }

        // === FASE ACTIVA: ya pasó la hora de inicio ===
        contadorEl.classList.remove("en-espera");
        contadorSoloEl.classList.remove("en-espera");

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
            modalFin.classList.add("visible");
            reproducirAlerta();
            return;
        }

        // Calcular tiempo restante
        const horas = Math.floor(restante / 3600000);
        const minutos = Math.floor((restante % 3600000) / 60000);
        const segundos = Math.floor((restante % 60000) / 1000);

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
        const progresoRedondeado = Math.round(progreso);
        barraEl.style.width = `${progreso.toFixed(2)}%`;
        barraContainer.setAttribute("aria-valuenow", progresoRedondeado);
        barraContainer.setAttribute("aria-valuetext", `${progresoRedondeado}% completado`);
        barraPorcentajeEl.textContent = `${progresoRedondeado}%`;
        actualizarColorBarra(progreso);

        ultimoTiempoRestante = restante;
    }, 1000);

    // Guardar configuración
    guardarDatos();
}

// =========================
// COLOR DINÁMICO DE BARRA
// =========================
function actualizarColorBarra(progreso) {
    barraEl.classList.remove('fase-verde', 'fase-amarillo', 'fase-naranja', 'fase-rojo');
    if (progreso < 60) {
        barraEl.classList.add('fase-verde');
    } else if (progreso < 80) {
        barraEl.classList.add('fase-amarillo');
    } else if (progreso < 93) {
        barraEl.classList.add('fase-naranja');
    } else {
        barraEl.classList.add('fase-rojo');
    }
}

// =========================
// HORA ACTUAL
// =========================
function actualizarHoraActual() {
    const ahora = new Date();
    const horas = ahora.getHours();
    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");
    const ampm = horas >= 12 ? "PM" : "AM";
    const horas12 = String(horas % 12 || 12).padStart(2, "0");
    horaActualEl.textContent = `${horas12}:${minutos}:${segundos} ${ampm}`;
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

        // Piano Fin: tres acordes descendentes con timbre de piano
        const tocarAcorde = (frecuencias, tiempoInicio) => {
            frecuencias.forEach(freq => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                // Forma de onda tipo piano (armónicos naturales)
                const real = new Float32Array([0, 1, 0.5, 0.25, 0.1, 0.05]);
                const imag = new Float32Array(real.length);
                const wave = ctx.createPeriodicWave(real, imag);
                osc.setPeriodicWave(wave);
                osc.frequency.value = freq;

                const t0 = ctx.currentTime + tiempoInicio;
                gain.gain.setValueAtTime(0, t0);
                gain.gain.linearRampToValueAtTime(0.25, t0 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.2);

                osc.start(t0);
                osc.stop(t0 + 1.4);
            });
        };

        // Tres acordes descendentes (Do mayor → Si menor → La menor)
        tocarAcorde([523.25, 659.25, 783.99], 0.0);
        tocarAcorde([493.88, 622.25, 739.99], 0.55);
        tocarAcorde([440.00, 554.37, 659.25], 1.1);

        // Segunda repetición tras una pausa
        setTimeout(() => {
            try {
                tocarAcorde([523.25, 659.25, 783.99], 0.0);
                tocarAcorde([493.88, 622.25, 739.99], 0.55);
                tocarAcorde([440.00, 554.37, 659.25], 1.1);
            } catch (e) { }
        }, 2400);

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
    mostrarConfirm("¿Estás seguro de que deseas reiniciar el temporizador y limpiar todos los datos?", () => {
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
        barraPorcentajeEl.textContent = "0%";
        barraPorcentajeEl.style.color = '';
        barraPorcentajeEl.style.textShadow = '';
        contadorEl.classList.remove("warning", "tiempo-critico");

        // Limpiar localStorage
        localStorage.removeItem("timepucp_data");

        mostrarToast("Datos reiniciados correctamente", "success");
    });
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
    localStorage.removeItem("darkMode");
}

// Guardar datos automáticamente al cambiar
[cursoInput, evaluacionInput, profesorInput, aulaInput, claveCursoInput].forEach(input => {
    input.addEventListener("change", guardarDatos);
    input.addEventListener("blur", guardarDatos);
});

// =========================
// EVENT LISTENERS
// =========================

// Abrir el picker al hacer click en cualquier parte del input de hora
horaInicioInput.addEventListener("click", () => {
    horaInicioInput.showPicker?.();
});
horaFinInput.addEventListener("click", () => {
    horaFinInput.showPicker?.();
});

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
        mostrarToast("Advertencia: Verifica que las horas sean correctas. La hora de fin parece estar muy lejos de la hora de inicio.", "warning");
    }
});

// =========================
// SISTEMA DE TOASTS
// =========================
function mostrarToast(mensaje, tipo = "info") {
    // Eliminar toast existente
    const existente = document.querySelector(".toast-notification");
    if (existente) existente.remove();
    clearTimeout(toastTimeout);

    const toast = document.createElement("div");
    toast.className = `toast-notification toast-${tipo}`;

    const iconos = { success: "✓", warning: "⚠", info: "ℹ", error: "✕" };
    toast.innerHTML = `<span class="toast-icon">${iconos[tipo] || iconos.info}</span><span class="toast-msg">${mensaje}</span>`;

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add("toast-visible"));

    toastTimeout = setTimeout(() => {
        toast.classList.remove("toast-visible");
        toast.addEventListener("transitionend", () => toast.remove());
    }, 4000);
}

function mostrarConfirm(mensaje, onConfirm) {
    // Eliminar confirm existente
    const existente = document.querySelector(".confirm-overlay");
    if (existente) existente.remove();

    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
        <div class="confirm-box">
            <p class="confirm-msg">${mensaje}</p>
            <div class="confirm-actions">
                <button class="confirm-btn confirm-cancel">Cancelar</button>
                <button class="confirm-btn confirm-accept">Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("confirm-visible"));

    overlay.querySelector(".confirm-cancel").addEventListener("click", () => {
        overlay.classList.remove("confirm-visible");
        overlay.addEventListener("transitionend", () => overlay.remove());
    });

    overlay.querySelector(".confirm-accept").addEventListener("click", () => {
        overlay.classList.remove("confirm-visible");
        overlay.addEventListener("transitionend", () => overlay.remove());
        onConfirm();
    });

    // Click outside to cancel
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.remove("confirm-visible");
            overlay.addEventListener("transitionend", () => overlay.remove());
        }
    });
}

// =========================
// INFORMACIÓN DEL SISTEMA
// =========================
console.log("⏰ TIMEPUCP - Sistema de temporizador iniciado");
console.log("Atajos de teclado:");
console.log("  F11: Pantalla completa");
console.log("  Ctrl/Cmd + D: Modo oscuro");

// =========================
// PANEL DE APUNTES
// =========================
(function () {
    const panel = document.getElementById("panelApuntes");
    const header = document.getElementById("panelApuntesHeader");
    const textarea = document.getElementById("apuntesTexto");
    const btnAbrir = document.getElementById("btnApuntes");
    const btnCerrar = document.getElementById("btnCerrarApuntes");
    const btnFontUp = document.getElementById("btnApuntesFontUp");
    const btnFontDown = document.getElementById("btnApuntesFontDown");

    let fontSize = 28; // px — tamaño inicial grande para proyector
    const FONT_MIN = 16;
    const FONT_MAX = 56;
    const FONT_STEP = 4;

    // --- Abrir / Cerrar ---
    btnAbrir.addEventListener("click", () => {
        if (panel.classList.contains("visible")) {
            panel.classList.remove("visible");
        } else {
            // Centrar al abrir si no fue movido previamente
            if (!panel.dataset.moved) {
                panel.style.top = "50%";
                panel.style.left = "50%";
                panel.style.transform = "translate(-50%, -50%)";
            }
            panel.classList.add("visible");
            textarea.focus();
        }
    });

    btnCerrar.addEventListener("click", () => {
        panel.classList.remove("visible");
    });

    // --- Tamaño de fuente ---
    btnFontUp.addEventListener("click", (e) => {
        e.stopPropagation();
        if (fontSize < FONT_MAX) {
            fontSize += FONT_STEP;
            textarea.style.fontSize = fontSize + "px";
        }
    });

    btnFontDown.addEventListener("click", (e) => {
        e.stopPropagation();
        if (fontSize > FONT_MIN) {
            fontSize -= FONT_STEP;
            textarea.style.fontSize = fontSize + "px";
        }
    });

    // --- Arrastre (drag) ---
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    header.addEventListener("mousedown", startDrag);
    header.addEventListener("touchstart", startDrag, { passive: false });

    function startDrag(e) {
        // No arrastrar si se hizo click en un botón
        if (e.target.closest("button")) return;
        e.preventDefault();
        isDragging = true;

        // Quitar transform de centrado al primer drag
        if (!panel.dataset.moved) {
            const rect = panel.getBoundingClientRect();
            panel.style.top = rect.top + "px";
            panel.style.left = rect.left + "px";
            panel.style.transform = "none";
            panel.dataset.moved = "1";
        }

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragOffsetX = clientX - panel.getBoundingClientRect().left;
        dragOffsetY = clientY - panel.getBoundingClientRect().top;

        document.addEventListener("mousemove", onDrag);
        document.addEventListener("mouseup", stopDrag);
        document.addEventListener("touchmove", onDrag, { passive: false });
        document.addEventListener("touchend", stopDrag);
    }

    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let newLeft = clientX - dragOffsetX;
        let newTop = clientY - dragOffsetY;

        // Mantener dentro de la ventana
        const pw = panel.offsetWidth;
        const ph = panel.offsetHeight;
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - pw));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - ph));

        panel.style.left = newLeft + "px";
        panel.style.top = newTop + "px";
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener("mousemove", onDrag);
        document.removeEventListener("mouseup", stopDrag);
        document.removeEventListener("touchmove", onDrag);
        document.removeEventListener("touchend", stopDrag);
    }

    // --- Redimensionado desde bordes y esquinas ---
    let isResizing = false;
    let resizeDir = "";
    let resizeStartX = 0;
    let resizeStartY = 0;
    let resizeStartW = 0;
    let resizeStartH = 0;
    let resizeStartL = 0;
    let resizeStartT = 0;

    const MIN_W = 280;
    const MIN_H = 180;

    panel.querySelectorAll(".pa-edge").forEach(edge => {
        edge.addEventListener("mousedown", startResize);
        edge.addEventListener("touchstart", startResize, { passive: false });
    });

    function startResize(e) {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        resizeDir = e.currentTarget.dataset.dir;

        // Asegurar posición absoluta
        if (!panel.dataset.moved) {
            const rect = panel.getBoundingClientRect();
            panel.style.top = rect.top + "px";
            panel.style.left = rect.left + "px";
            panel.style.transform = "none";
            panel.dataset.moved = "1";
        }

        const rect = panel.getBoundingClientRect();
        resizeStartX = e.touches ? e.touches[0].clientX : e.clientX;
        resizeStartY = e.touches ? e.touches[0].clientY : e.clientY;
        resizeStartW = rect.width;
        resizeStartH = rect.height;
        resizeStartL = rect.left;
        resizeStartT = rect.top;

        document.addEventListener("mousemove", onResize);
        document.addEventListener("mouseup", stopResize);
        document.addEventListener("touchmove", onResize, { passive: false });
        document.addEventListener("touchend", stopResize);
    }

    function onResize(e) {
        if (!isResizing) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - resizeStartX;
        const dy = clientY - resizeStartY;

        let newW = resizeStartW;
        let newH = resizeStartH;
        let newL = resizeStartL;
        let newT = resizeStartT;

        const dir = resizeDir;

        // Horizontal
        if (dir.includes("e")) {
            newW = Math.max(MIN_W, resizeStartW + dx);
            newW = Math.min(newW, window.innerWidth - newL);
        }
        if (dir.includes("w")) {
            const maxDx = resizeStartW - MIN_W;
            const clampedDx = Math.min(dx, maxDx);
            newL = Math.max(0, resizeStartL + clampedDx);
            newW = resizeStartW - (newL - resizeStartL);
        }

        // Vertical
        if (dir.includes("s")) {
            newH = Math.max(MIN_H, resizeStartH + dy);
            newH = Math.min(newH, window.innerHeight - newT);
        }
        if (dir.includes("n")) {
            const maxDy = resizeStartH - MIN_H;
            const clampedDy = Math.min(dy, maxDy);
            newT = Math.max(0, resizeStartT + clampedDy);
            newH = resizeStartH - (newT - resizeStartT);
        }

        panel.style.width = newW + "px";
        panel.style.height = newH + "px";
        panel.style.left = newL + "px";
        panel.style.top = newT + "px";
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener("mousemove", onResize);
        document.removeEventListener("mouseup", stopResize);
        document.removeEventListener("touchmove", onResize);
        document.removeEventListener("touchend", stopResize);
    }

    // Prevenir que el textarea inicie un drag
    textarea.addEventListener("mousedown", (e) => e.stopPropagation());
    textarea.addEventListener("touchstart", (e) => e.stopPropagation());
})();
