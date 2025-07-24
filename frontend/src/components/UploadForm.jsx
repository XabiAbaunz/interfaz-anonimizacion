import React from 'react';

import { pdfToText } from '../utils/pdfToText';

function UploadForm({ onComplete }) {
  const [endpoint, setEndpoint] = React.useState('');
  const [key, setKey] = React.useState('');
  const [file, setFile] = React.useState(null);
  const [modo, setModo] = React.useState('rapida');

  const handleContinuar = async () => {
    try {
      const textoOriginal = await leerTextoDesdeArchivo(file);
      
      const datosParaBackend = {
        cvContent: textoOriginal,
        ollamaEndpoint: endpoint,
        ollamaKey: key,
      };

      localStorage.setItem('ollamaEndpoint', endpoint);
      localStorage.setItem('ollamaKey', key);

      const backendUrl = 'api/anonymize';

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaBackend),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const entidades = data.entidades;

      if (!entidades || typeof entidades !== 'object') {
        throw new Error('La respuesta del backend no contiene un objeto de entidades válido.');
      }
      
      const esRapida = modo === 'rapida';

      onComplete({ entidades, textoOriginal }, esRapida); 
    } catch (error) {
      console.error('Error al procesar:', error);
      alert('Hubo un error al contactar con ollama.');
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

      <label>URL de Ollama: </label>
      <input type='text' value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />

      <br /><br />

      <label>Key: </label> 
      <input type='text' value={key} onChange={(e) => setKey(e.target.value)} />

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