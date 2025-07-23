# backend/Dockerfile
# Usa una imagen base oficial de Python
FROM python:3.10-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia el archivo de requerimientos e instala las dependencias
# Hacer esto primero aprovecha mejor la caché de Docker
COPY requirements.txt .
# Instala las dependencias sin la caché de pip para reducir tamaño
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código fuente de la aplicación y los prompts
# Asegúrate de copiar todo lo necesario
COPY app/ ./app/
COPY prompts/ ./prompts/

# Expone el puerto que usará Uvicorn (por ejemplo, 8000)
# Este puerto debe coincidir con el comando CMD
EXPOSE 8000

# Comando para ejecutar la aplicación usando Uvicorn
# Asegúrate de que 'app.main:app' coincida con tu estructura de paquetes
# host=0.0.0.0 es crucial para que el contenedor acepte conexiones externas
# reload=False es importante para producción
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]