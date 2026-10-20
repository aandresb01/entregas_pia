from pydantic import BaseModel, Field

class RentabilidadJuego(BaseModel):
    nombre_juego: str = Field(default="Proyecto Juego", min_length=1, max_length=100, description="Nombre del juego")
    meses_desarrollo: int = Field(ge=1, le=120, description="Meses de desarrollo")
    presupuesto_desarrollo: float = Field(gt=0, description="Presupuesto invertido en euros")
    precio_venta_estimado: float = Field(ge=0.5, le=120.0, description="Precio por copia en euros")
    tiene_multijugador: bool = Field(default=False, description="Indica si incluye modo multijugador")


class ResultadoRentabilidadJuego(BaseModel):
    nombre_juego: str
    rentable: bool
    probabilidad_rentabilidad: float
    periodo_recuperacion_estimado_meses: float
    copias_primer_ano_estimadas: int
    motivo: str
