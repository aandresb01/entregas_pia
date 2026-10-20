Aplicación web con **FastAPI** para evaluar la rentabilidad y viabilidad de videojuegos antes de su desarrollo.

---

## Descripción de la aplicación

- **¿Qué hace el servicio?** Analiza los datos de un proyecto de videojuego y calcula:
  - Probabilidad de éxito
  - Copias estimadas a vender en el primer año
  - Tiempo estimado para recuperar la inversión
  - Evaluación del nivel de riesgo
- **¿Qué problema resuelve?** Ayuda a estudios y desarrolladores a saber si su juego será rentable o si perderán dinero antes de empezar a desarrollarlo.

---

## URL pública

**[https://ut2-fastapi-alejandroandres.onrender.com/](https://ut2-fastapi-alejandroandres.onrender.com/)**

---

## Organización de archivos del proyecto

```text
├── app.py                # Servidor FastAPI y lógica de predicción
├── models.py             # Modelos de datos
├── index.html            # Interfaz de usuario
├── requirements.txt      # Dependencias del proyecto
├── datos_prueba.txt      # Ejemplos para probar la aplicación
├── README.md             # Documentación del proyecto
└── static/
    ├── app.js            # Lógica frontend y peticiones a la API
    └── style.css         # Estilos visuales de la aplicación
```

---

## Endpoints de la API

| Método | Endpoint                    | Descripción                                                                         |
| :----- | :-------------------------- | :---------------------------------------------------------------------------------- |
| `GET`  | `/`                         | Carga la interfaz web principal (`index.html`).                                     |
| `GET`  | `/api/info`                 | Devuelve el estado y la versión de la API.                                          |
| `POST` | `/api/evaluar-rentabilidad` | Recibe los datos del proyecto y calcula la rentabilidad, copias estimadas y riesgo. |
| `GET`  | `/docs`                     | Documentación Swagger UI.                                                           |

---

## Ejecución en local

1. **Instalar dependencias:**

   ```bash
   pip install -r requirements.txt
   ```

2. **Arrancar el servidor:**

   ```bash
   uvicorn app:app --reload
   ```

3. **Abrir en el navegador:**
   Accede a [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## Plataforma de despliegue

- **Plataforma:** [Render](https://render.com/)
- **Tipo de servicio:** Web Service (Python 3, Plan Free)

---

## Proceso de despliegue en Render

Para replicar el despliegue de esta aplicación:

1. **Subir el código a GitHub:**
   Asegúrate de tener en el repositorio el archivo `requirements.txt` con las dependencias:

   ```text
   fastapi
   uvicorn[standard]
   ```

2. **Crear Web Service en Render:**
   - Inicia sesión en [Render](https://dashboard.render.com/).
   - Ve a **New +** > **Web Service**.
   - Conecta tu cuenta de GitHub y selecciona el repositorio del proyecto.

3. **Configurar el servicio:**
   Rellena los siguientes campos:
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`

4. **Desplegar:**
   - Haz clic en **Deploy Web Service**.
   - Espera a que termine la compilación y ya puedes acceder desde la URL proporcionada por Render.

---

## Datos de prueba

En [datos_prueba.txt](datos_prueba.txt) se incluyen ejemplos con tres casos (proyecto rentable, rentable ajustado y no viable) para probar la app.
