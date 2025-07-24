import React from 'react';
import { pdfToText } from '../utils/pdfToText';

function UploadForm({ onComplete }) {
  const [endpoint, setEndpoint] = React.useState('');
  const [key, setKey] = React.useState('');
  const [file, setFile] = React.useState(null);
  const [modo, setModo] = React.useState('rapida');

  const handleContinuar = async () => {
    if (!file) {
        alert('Por favor, selecciona un archivo.');
        return;
    }
    try {
      const textoOriginal = await leerTextoDesdeArchivo(file);
      
      localStorage.setItem('ollamaEndpoint', endpoint);
      localStorage.setItem('ollamaKey', key);

      onComplete({ textoOriginal }, modo); 

    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      alert(`Hubo un error al leer el archivo: ${error.message}`);
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
        throw new Error('Error al procesar el PDF.');
      }
    } else {
        throw new Error('Formato de archivo no soportado. Usa .txt o .pdf.');
    }
  }

  return (
    <div>
      <h2>Sube tu currículum</h2>
      <label>URL de Ollama: </label>
      <input type='text' value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="http://..." />
      <br /><br />
      <label>Key (opcional): </label> 
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