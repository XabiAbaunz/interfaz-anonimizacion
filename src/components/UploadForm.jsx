import React from 'react';
import { procesarAnonimizacion } from '../utils/anonymize.js';

import { pdfToText } from '../utils/pdfToText';

function UploadForm({ onComplete }) {
  const [endpoint, setEndpoint] = React.useState('');
  const [file, setFile] = React.useState(null);
  const [modo, setModo] = React.useState('rapida');

  const handleContinuar = async () => {
    const textoOriginal = await leerTextoDesdeArchivo(file);
    const entidades = await procesarAnonimizacion(endpoint, textoOriginal);
    let esRapida = true
    if (modo === 'manual') {
      esRapida = false;
    }
    try { 
      onComplete({ entidades, textoOriginal }, esRapida); 
    } catch (error) {
      console.error('Error al procesar:', error);
      alert('Hubo un error al contactar con el endpoint.');
    }
  };

  async function leerTextoDesdeArchivo(file) {
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'txt') {
      return await file.text();
    } else if (extension === 'pdf') {
      try {
        const pdfText = await pdfToText(file);
        return pdfText;
      } catch (error) {
        console.error("Failed to extract text from pdf", error);
        return 'Error al procesar el PDF.'
      }
    }
  }

  return (
    <div>
      <h2>Sube tu currículum</h2>

      <label>URL del SLM: </label>
      <input type='text' value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />

      <br /><br />

      <label>Archivo: </label>
      <input type='file' accept='.txt, .pdf' onChange={(e) => setFile(e.target.files[0])} />

      <p>Modo de análisis:</p>
      <label>
        <input
          type="radio"
          value="rapida"
          checked={modo === 'rapida'}
          onChange={() => setModo('rapida')}
        />
        Anonimización rápida
      </label>

      <label>
        <input
          type="radio"
          value="manual"
          checked={modo === 'manual'}
          onChange={() => setModo('manual')}
        />
        Análisis manual
      </label>

      <br /><br />

      <button onClick={handleContinuar} disabled={!file}>
        Continuar
      </button>
    </div>
  );
}

export default UploadForm;