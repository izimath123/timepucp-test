const horaInicioInput = document.getElementById("horaInicio");
const horaFinInput = document.getElementById("horaFin");

let intervaloCuenta;
let tiempoTotal = 0;

const horaActualEl = document.getElementById("horaActual");
const contadorEl = document.getElementById("contador");
const barraEl = document.getElementById("barraProgreso");

// =======================
// CUENTA REGRESIVA (FIX TOTAL)
// =======================
function iniciarCuentaRegresiva() {
    clearInterval(intervaloCuenta);

    if (!horaInicioInput.value || !horaFinInput.value) {
        contadorEl.textContent = "00:00:00";
        barraEl.style.width = "0%";
        return;
    }

    const ahora = new Date();

    const hoy = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate()
    );

    const [hIni, mIni] = horaInicioInput.value.split(":");
    const [hFin, mFin] = horaFinInput.value.split(":");

    const inicio = new Date(hoy);
    inicio.setHours(hIni, mIni, 0, 0);

    const fin = new Date(hoy);
    fin.setHours(hFin, mFin, 0, 0);

    // ✅ SOPORTE MEDIANOCHE
    if (fin <= inicio) {
        fin.setDate(fin.getDate() + 1);
    }

    tiempoTotal = fin - inicio;

    intervaloCuenta = setInterval(() => {
        const ahora = new Date();
        const restante = fin - ahora;

        if (restante <= 0) {
            contadorEl.textContent = "00:00:00";
            barraEl.style.width = "100%";
            clearInterval(intervaloCuenta);
            return;
        }

        const horas = String(Math.floor(restante / 3600000)).padStart(2, "0");
        const minutos = String(Math.floor((restante % 3600000) / 60000)).padStart(2, "0");
        const segundos = String(Math.floor((restante % 60000) / 1000)).padStart(2, "0");

        contadorEl.textContent = `${horas}:${minutos}:${segundos}`;

        const progreso = ((tiempoTotal - restante) / tiempoTotal) * 100;
        barraEl.style.width = `${progreso}%`;
    }, 1000);
}

// =======================
// HORA ACTUAL
// =======================
function actualizarHoraActual() {
    const ahora = new Date();
    horaActualEl.textContent = ahora.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}

setInterval(actualizarHoraActual, 1000);
actualizarHoraActual();

horaInicioInput.addEventListener("change", iniciarCuentaRegresiva);
horaFinInput.addEventListener("change", iniciarCuentaRegresiva);

// =======================
// FECHA
// =======================
const fechaInput = document.getElementById("fecha");
const fechaTexto = document.getElementById("fechaTexto");

fechaTexto.addEventListener("click", () => {
    fechaInput.showPicker();
});

fechaInput.addEventListener("change", () => {
    if (!fechaInput.value) return;
    const [anio, mes, dia] = fechaInput.value.split("-");
    fechaTexto.value = `${dia}/${mes}/${anio}`;
});

// =======================
// FULLSCREEN
// =======================
const btnFullscreen = document.getElementById("btnFullscreen");

btnFullscreen.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        btnFullscreen.textContent = "⤫ Salir pantalla completa";
    } else {
        document.exitFullscreen();
        btnFullscreen.textContent = "⛶ Pantalla completa";
    }
});

document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
        btnFullscreen.textContent = "⛶ Pantalla completa";
    }
});

// =======================
// MODO OSCURO
// =======================
const btnDarkMode = document.getElementById("btnDarkMode");

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    btnDarkMode.textContent = "☀️ Modo claro";
}

btnDarkMode.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("darkMode", isDark);

    btnDarkMode.textContent = isDark
        ? "☀️ Modo claro"
        : "🌙 Modo oscuro";
});