from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from models import RentabilidadJuego, ResultadoRentabilidadJuego

# =====================================================================
# 1. CONFIGURACIÓN FASTAPI, CORS Y ESTÁTICOS
# =====================================================================

app = FastAPI(
    title="Evaluación de Rentabilidad de Juegos",
    description="API para saber si el desarrollo de un juego será rentable.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# =====================================================================
# 2. ENDPOINTS DEL SERVICIO
# =====================================================================

# Ruta raíz
@app.get("/", response_class=FileResponse)
def inicio():
    return FileResponse("index.html")


# Ruta informativa
@app.get("/api/info")
def obtener_info():
    """
    Devuelve el estado y el servicio de la API.
    """
    return {
        "estado": "activo",
        "servicio": "Evaluación de Rentabilidad de Juegos",
        "version": "1.0.0"
    }


# Ruta para la probabilidad de rentabilidad
@app.post("/api/evaluar-rentabilidad", response_model=ResultadoRentabilidadJuego)
def evaluar_rentabilidad(datos: RentabilidadJuego):
    """
    Estima si el desarrollo del juego saldrá rentable o no.
    """
    probabilidad = 70.0

    # Si tiene multijugador suma probabilidad de éxito, si no resta probabilidad de éxito
    if datos.tiene_multijugador:
        probabilidad = probabilidad + 10.0
    else:
        probabilidad = probabilidad - 10.0

    # Si el tiempo de desarrollo es mayor a 36 meses y el presupuesto es menor a 40000, resta probabilidad de éxito
    if datos.meses_desarrollo > 36 and datos.presupuesto_desarrollo < 40000:
        probabilidad = probabilidad - 10.0


    # Acotamos la probabilidad entre 0 y 100
    probabilidad = max(0.0, min(100.0, round(probabilidad, 1)))


    # Aproximación de copias teniendo en cuenta la probabilidad de éxito, el presupuesto y el precio de venta
    factor_ventas = (probabilidad / 100.0) * 0.05


    # Estimacion de copias vendidas en el primer año
    copias_primer_ano = max(100, int((datos.presupuesto_desarrollo / max(datos.precio_venta_estimado, 1.0)) * factor_ventas * 18))
    

    # Ganancias al año y al mes quitando la parte que se lleva la tienda donde subes el juego (pongo de ejemplo un 15%)
    ingreso_neto_copia = datos.precio_venta_estimado * 0.85
    ingreso_neto_anual = copias_primer_ano * ingreso_neto_copia
    ingreso_neto_mensual = ingreso_neto_anual / 12.0


    # Cuánto tiempo tardarás en recuperar la inversión
    if ingreso_neto_mensual > 0:
        periodo_recuperacion = round(datos.presupuesto_desarrollo / ingreso_neto_mensual, 0)
    else:
        periodo_recuperacion = 999.0


    # Si el periodo de recuperación es menor a 6 meses y la probabilidad es mayor o igual a 60, el juego es rentable
    rentable = False
    if periodo_recuperacion <= 6.0 and probabilidad >= 60.0:
        rentable = True
        motivo = f"Bien: El juego será rentable. Se recuperará la inversión en {periodo_recuperacion} meses aprox."
    elif periodo_recuperacion > 6.0:
        motivo = f"Mal: Se recuperará la inversión en {periodo_recuperacion} meses aprox, más de lo esperado que serían 6 meses"
    else:
        motivo = f"Muy mal: La probabilidad de éxito es de {probabilidad}%, es muy baja y no asegura conseguir ganancias."
    return {
        "nombre_juego": datos.nombre_juego,
        "rentable": rentable,
        "probabilidad_rentabilidad": probabilidad,
        "periodo_recuperacion_estimado_meses": periodo_recuperacion,
        "copias_primer_ano_estimadas": copias_primer_ano,
        "motivo": motivo
    }
