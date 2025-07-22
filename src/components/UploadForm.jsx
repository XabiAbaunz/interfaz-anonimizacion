import React from 'react';
import { procesarAnonimizacion } from '../scripts/anonymize.js';

function UploadForm({ onComplete }) {
  const [endpoint, setEndpoint] = React.useState('');
  const [file, setFile] = React.useState(null);
  const [modo, setModo] = React.useState('rapida');

  const handleContinuar = async () => {
    if (modo === 'manual') {
      try {
        const entidades = await procesarAnonimizacion(endpoint, file);
        const textoOriginal = `Me llamo Nombre Apellido , puedes contactarme en email@email.com. \n Mi número es 667 11 11 11. Vivo en Dirección y nací el 01/01/2000. `;
        
        // Pasar los datos al componente padre (análisis manual)
        onComplete({ entidades, textoOriginal }, false);
        
      } catch (error) {
        console.error('Error al procesar:', error);
        alert('Hubo un error al contactar con el endpoint.');
      }
    } else if (modo === 'rapida') {
      try {
        const entidades = await procesarAnonimizacion(endpoint, file);
        const textoOriginal = `Me llamo Nombre Apellido , puedes contactarme en email@email.com. \n Mi número es 667 11 11 11. Vivo en Dirección y nací el 01/01/2000. `;
        
        // Pasar los datos al componente padre (anonimización rápida)
        onComplete({ entidades, textoOriginal }, true);
        
      } catch (error) {
        console.error('Error al procesar:', error);
        alert('Hubo un error al contactar con el endpoint.');
      }
    }
  };

  return (
    <div>
      <h2>Sube tu currículum</h2>

      <label>URL del SLM: </label>
      <input type='text' value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />

      <br /><br />

      <label>Archivo: </label>
      <input type='file' accept='.txt' onChange={(e) => setFile(e.target.files[0])} />

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

      <button onClick={handleContinuar}>
        Continuar
      </button>
    </div>
  );
}

export default UploadForm;