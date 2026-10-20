// =====================================================================
// Lógica de Interfaz y Conexión con FastAPI
// =====================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Referencias a los elementos del DOM
  const formulario = document.getElementById("formulario-rentabilidad");
  const panelResultado = document.getElementById("panel-resultado");
  const panelVacio = document.getElementById("panel-vacio");
  const resultadoCaja = document.getElementById("resultado-caja");
  const btnEnviar = document.getElementById("btn-enviar");
  const resultsColumn = document.getElementById("results-column");
  const serverBadge = document.getElementById("server-badge");
  const statusLabel = document.getElementById("status-label");

  // Campos de entrada del formulario
  const inputNombre = document.getElementById("nombre_juego");
  const inputMeses = document.getElementById("meses_desarrollo");
  const inputPresupuesto = document.getElementById("presupuesto_desarrollo");
  const inputPrecio = document.getElementById("precio_venta_estimado");
  const checkMulti = document.getElementById("tiene_multijugador");

  // Mapeo legible de campos para mensajes de validación
  const nombresCampos = {
    nombre_juego: "Título del Juego",
    meses_desarrollo: "Tiempo Desarrollo",
    presupuesto_desarrollo: "Presupuesto Invertido",
    precio_venta_estimado: "Precio Juego",
    tiene_multijugador: "Modo Multijugador"
  };

  // Iconos vectoriales SVG para estados de respuesta
  const svgIcons = {
    checkCircle: `
      <svg class="svg-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `,
    alertTriangle: `
      <svg class="svg-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    `,
    alertCircle: `
      <svg class="svg-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    `,
    xCircle: `
      <svg class="svg-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `,
    zap: `
      <svg class="svg-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    `
  };

  // Comprueba la conectividad con el backend (/api/info)
  async function verificarApi() {
    try {
      const res = await fetch("/api/info");
      if (res.ok) {
        const info = await res.json();
        if (statusLabel) statusLabel.textContent = `FastAPI Online (${info.estado || "ok"})`;
      }
    } catch (e) {
      if (statusLabel) {
        statusLabel.textContent = "Servidor Desconectado";
        serverBadge.style.color = "#f87171";
      }
    }
  }
  verificarApi();

  // Envío del formulario y llamada al endpoint /api/evaluar-rentabilidad
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nombre = inputNombre.value.trim();
    const meses = parseInt(inputMeses.value);
    const presupuesto = parseFloat(inputPresupuesto.value);
    const precio = parseFloat(inputPrecio.value);
    const multi = checkMulti.checked;

    if (!nombre) {
      inputNombre.focus();
      return;
    }

    const payload = {
      nombre_juego: nombre,
      meses_desarrollo: isNaN(meses) ? 1 : meses,
      presupuesto_desarrollo: isNaN(presupuesto) ? 1 : presupuesto,
      precio_venta_estimado: isNaN(precio) ? 1 : precio,
      tiene_multijugador: multi
    };

    // Bloqueo del botón mientras la API procesa la solicitud
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = `
      <span class="btn-inner">
        <span class="spinner"></span>
        <span class="btn-text">Consultando algoritmo...</span>
      </span>
    `;

    try {
      const respuesta = await fetch("/api/evaluar-rentabilidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!respuesta.ok) {
        if (panelVacio) panelVacio.classList.add("hidden");
        panelResultado.classList.remove("hidden");

        // Manejo específico de errores 422 (validación de Pydantic en FastAPI)
        if (respuesta.status === 422) {
          const errorData = await respuesta.json();
          renderErroresValidacion(errorData.detail);
          return;
        }

        renderErrorGenerico(`Error del servidor (${respuesta.status})`, "El backend no pudo procesar la solicitud.");
        return;
      }

      const resultado = await respuesta.json();
      if (panelVacio) panelVacio.classList.add("hidden");
      panelResultado.classList.remove("hidden");

      renderResultado(resultado);

      // Desplazamiento automático hacia el resultado en pantallas estrechas
      if (window.innerWidth < 1024 && resultsColumn) {
        resultsColumn.scrollIntoView({ behavior: "smooth", block: "start" });
      }

    } catch (err) {
      if (panelVacio) panelVacio.classList.add("hidden");
      panelResultado.classList.remove("hidden");
      renderErrorGenerico("Sin conexión con FastAPI", "No se pudo conectar a http://127.0.0.1:8000. Revisa que el backend esté ejecutándose.");
      console.error(err);
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = `
        <span class="btn-inner">
          ${svgIcons.zap}
          <span class="btn-text">Calcular Rentabilidad</span>
        </span>
      `;
    }
  });

  // Genera la tarjeta con el veredicto del algoritmo (Viable o Riesgo)
  function renderResultado(data) {
    const esRentable = Boolean(data.rentable);
    const cardClass = esRentable ? "card-success" : "card-danger";
    const statusIcon = esRentable ? svgIcons.checkCircle : svgIcons.alertTriangle;
    const statusTag = esRentable ? "Proyecto Viable" : "Riesgo Financiero";
    const prob = Number(data.probabilidad_rentabilidad).toFixed(1);
    const copias = Number(data.copias_primer_ano_estimadas).toLocaleString("es-ES");
    const periodo = Number(data.periodo_recuperacion_estimado_meses);
    const periodoTexto = periodo >= 999 ? "No recuperable" : `${periodo} meses`;

    resultadoCaja.innerHTML = `
      <div class="result-card ${cardClass}">
        <div class="result-stripe"></div>

        <div class="result-top">
          <div class="result-identity">
            <div class="result-status-icon">${statusIcon}</div>
            <div>
              <span class="result-tag">${statusTag}</span>
              <h3 class="result-title">${escapeHTML(data.nombre_juego)}</h3>
            </div>
          </div>
          <div class="score-badge">
            <span>${prob}%</span>
            <small style="font-size: 0.68rem; opacity: 0.85;">Éxito</small>
          </div>
        </div>

        <div class="probability-section">
          <div class="bar-header">
            <span>Índice de probabilidad</span>
            <span>${prob} / 100%</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${Math.min(100, Math.max(0, prob))}%"></div>
          </div>
        </div>

        <div class="metrics-output-grid">
          <div class="metric-output-card">
            <span class="output-label">Ventas Est. (1er Año)</span>
            <div class="output-val">
              ${copias} <span class="output-unit">copias</span>
            </div>
          </div>
          <div class="metric-output-card">
            <span class="output-label">Retorno Inversión</span>
            <div class="output-val">
              ${periodoTexto}
            </div>
          </div>
        </div>

        <div class="diagnosis-box">
          <strong>Diagnóstico:</strong> ${escapeHTML(data.motivo)}
        </div>
      </div>
    `;
  }

  // Desglosa en pantalla los campos que no superaron la validación del modelo
  function renderErroresValidacion(detalles) {
    const listHtml = detalles.map(err => {
      const campo = err.loc[err.loc.length - 1];
      const nombre = nombresCampos[campo] || campo;
      return `
        <div class="validation-item">
          <div class="validation-header">
            <span class="validation-field">${escapeHTML(nombre)}</span>
            <span class="validation-tag">Límite no válido</span>
          </div>
          <p class="validation-msg">${escapeHTML(err.msg)}</p>
        </div>
      `;
    }).join("");

    resultadoCaja.innerHTML = `
      <div class="result-card card-warning">
        <div class="result-stripe"></div>

        <div class="result-top">
          <div class="result-identity">
            <div class="result-status-icon">${svgIcons.alertCircle}</div>
            <div>
              <span class="result-tag">Error de Validación (422)</span>
              <h3 class="result-title">Revisa los parámetros</h3>
            </div>
          </div>
        </div>

        <div class="validation-list">
          ${listHtml}
        </div>

        <div class="diagnosis-box">
          Ajusta los valores para cumplir los rangos estipulados por el modelo de cálculo.
        </div>
      </div>
    `;
  }

  // Muestra mensajes de error de conectividad o excepciones generales
  function renderErrorGenerico(titulo, mensaje) {
    resultadoCaja.innerHTML = `
      <div class="result-card card-danger">
        <div class="result-stripe"></div>
        <div class="result-top">
          <div class="result-identity">
            <div class="result-status-icon">${svgIcons.xCircle}</div>
            <div>
              <span class="result-tag">Aviso</span>
              <h3 class="result-title">${escapeHTML(titulo)}</h3>
            </div>
          </div>
        </div>
        <div class="diagnosis-box">
          ${escapeHTML(mensaje)}
        </div>
      </div>
    `;
  }

  // Previene inyecciones de código en las cadenas mostradas en la interfaz
  function escapeHTML(str) {
    if (typeof str !== "string") return str;
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});
