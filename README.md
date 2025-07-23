# Anonimizador de Currículums

Esta aplicación React permite cargar un currículum (en formato TXT o PDF), identificar automáticamente entidades sensibles (como nombres, direcciones, números de teléfono) mediante un Servicio de Lenguaje (SLM), y posteriormente anonimizar el documento reemplazando esas entidades con marcadores como `anon_1`, `anon_2`, etc.

## Características

*   **Carga de Archivos:** Soporta archivos `.txt` y `.pdf`.
*   **Procesamiento Automático:** Envía el texto a un endpoint de un SLM (Servicio de Lenguaje) para detectar entidades sensibles. *(Nota: La integración completa con el SLM requiere implementar la función `procesarAnonimizacion`)*.
*   **Anonimización Rápida:** Permite finalizar el proceso de anonimización de forma automática basándose únicamente en las entidades detectadas por el SLM.
*   **Análisis Manual:** Permite revisar las entidades detectadas, activar/desactivar su anonimización, y añadir manualmente nuevas entidades seleccionando texto.
*   **Visualización de Resultados:** Muestra el texto anonimizado final y el JSON que mapea los marcadores (`anon_X`) a los valores originales.
*   **Copiado al Portapapeles:** Facilita copiar tanto el JSON como el texto anonimizado.

## Estructura del Proyecto

```text
.
├── public/                 # Archivos públicos (HTML, íconos)
├── src/
│   ├── components/         # Componentes React (UploadForm, ResultView, etc.)
│   ├── utils/              # Funciones de utilidad (procesar PDF, lógica de anonimización)
│   ├── App.jsx             # Componente principal de la aplicación
│   └── index.jsx           # Punto de entrada de la aplicación
├── package.json            # Dependencias y scripts del proyecto
└── README.md               # Este archivo