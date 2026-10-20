# Descripción de la aplicación

Es una web creada con FastAPI para ayudar a desarrolladores a saber si su juego va a ser rentable o no antes de lanzarse a crearlo.

Muchas veces se ponen a hacer un juego sin saber si van a perder dinero o cuánto tendrían que vender para cubrir gastos. La app te pide datos básicos y te calcula:

- Qué probabilidad de éxito tiene el proyecto.
- Cuántas copias calcula que vas a vender el primer año.
- En cuántos meses recuperarías el dinero invertido y si merece la pena el riesgo.

---

# Despliegue del proyecto en Render

El código no lo he tenido que tocar. Como FastAPI ya entrega el HTML y los estilos directamente, y el JavaScript hace las peticiones con rutas relativas (`/api/...`), funciona igual en local que en la nube.

Lo único que he tenido que indicar en Render para que funcione es:

- El archivo `requirements.txt` con `fastapi` y `uvicorn[standard]`.
- El comando de instalación: `pip install -r requirements.txt`.
- El comando de arranque: `uvicorn app:app --host 0.0.0.0 --port $PORT`.

---

# Url Render

Url:
