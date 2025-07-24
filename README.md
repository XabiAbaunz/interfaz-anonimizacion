# Anonimizador de CVs

Esta aplicación web permite anonimizar currículums (CVs) de forma automática o manual utilizando modelos de lenguaje grandes (LLMs) como Gemma 3 a través de Ollama.

## Características

*   **Carga de Archivos:** Permite cargar CVs en formato TXT o PDF.
*   **Anonimización Rápida:** Envía el CV a un modelo LLM para una anonimización automática completa.
*   **Anonimización Manual:**
    *   Muestra una lista de entidades detectadas para revisión.
    *   Permite activar/desactivar la anonimización de cada entidad.
    *   Permite seleccionar texto adicional en el CV para anonimizarlo.
    *   **Refinamiento con IA:** Permite enviar instrucciones específicas al modelo LLM para corregir o mejorar la anonimización actual (por ejemplo, "Añade la ciudad" o "No anonimices el nombre de la empresa X").
*   **Visualización del Resultado:** Muestra el CV anonimizado final y el JSON con el mapeo de las entidades.
*   **Copiado al Portapapeles:** Permite copiar fácilmente el CV anonimizado o el JSON resultante.

## Tecnologías

*   **Frontend:** React
*   **Backend:** FastAPI (Python)
*   **IA:** Ollama (para ejecutar modelos LLM localmente, como Gemma 3)

## Requisitos Previos

1.  **Ollama:** Debes tener Ollama instalado y en ejecución en tu máquina.
    *   Instrucciones de instalación: [https://ollama.com/](https://ollama.com/)
2.  **Modelo LLM:** Necesitas tener descargado el modelo `gemma3:12b` (o el que estés utilizando) en Ollama.
    *   Comando: `ollama pull gemma3:12b`
3.  **Python:** Para ejecutar el backend.
4.  **Node.js y npm/yarn:** Para ejecutar el frontend.

## Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO> 
    cd <NOMBRE_DEL_DIRECTORIO>
    ```
2.  **Backend:**
    *   Navega al directorio del backend: `cd backend`
    *   (Recomendado) Crea un entorno virtual: `python -m venv venv` y actívalo (`source venv/bin/activate` en Linux/macOS, `venv\Scripts\activate` en Windows).
    *   Instala las dependencias: `pip install -r requirements.txt` (si no existe, crea uno con `fastapi`, `uvicorn`, `requests`, `pdfminer.six` o `pymupdf`).
3.  **Frontend:**
    *   Navega al directorio del frontend: `cd ../frontend`
    *   Instala las dependencias: `npm install` (o `yarn install`)

## Configuración de Prompts

Los prompts utilizados por el backend para comunicarse con el modelo LLM se encuentran en el directorio `backend/app/prompts/`. Puedes modificar `system_prompt.txt`, `user_prompt.txt`, `refine_system_prompt.txt` y `refine_user_prompt.txt` para ajustar el comportamiento de la anonimización y el refinamiento.

## Ejecución

1.  **Inicia el Backend:**
    *   Desde el directorio `backend`, ejecuta:
        ```bash
        uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
        ```
    *   El backend estará disponible en `http://127.0.0.1:8000`.
2.  **Inicia el Frontend:**
    *   Desde el directorio `frontend`, ejecuta:
        ```bash
        npm start
        ```
    *   El frontend se abrirá automáticamente en tu navegador predeterminado (normalmente `http://localhost:3000`).

## Uso

1.  Abre la aplicación en tu navegador (`http://localhost:3000`).
2.  Introduce la **URL del endpoint de Ollama** (por ejemplo, `http://localhost:11434/api/generate`) y la **API Key** (si es necesaria).
3.  Selecciona tu archivo CV (TXT o PDF).
4.  Elige el modo de análisis:
    *   **Anonimización rápida:** Procesa el CV automáticamente y muestra el resultado final.
    *   **Análisis manual:** Procesa el CV y permite revisar y modificar las entidades detectadas.
5.  Si elegiste **Análisis manual**:
    *   Revisa la lista de entidades detectadas y desmarca las que no quieras anonimizar.
    *   Selecciona texto adicional en el panel del CV si es necesario.
    *   Utiliza la sección **"Refinar Anonimización"** para dar instrucciones específicas al modelo y mejorar el resultado.
    *   Haz clic en **"Siguiente"** cuando termines.
6.  El **Resultado Final** se mostrará, permitiéndote copiar el CV anonimizado o el JSON del mapeo.