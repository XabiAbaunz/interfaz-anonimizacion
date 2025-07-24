import React from 'react';
import './css/FinalView.css';

function FinalView({ entidades, textoOriginal, onVolver }) {
  const generarTextoAnonimizado = () => {
    let texto = textoOriginal;

    Object.entries(entidades).forEach(([clave, valor]) => {
      const regex = new RegExp(valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      texto = texto.replace(regex, clave);
    });

    return texto;
  };

  const textoAnonimizado = generarTextoAnonimizado();
  const jsonEntidades = JSON.stringify(entidades, null, 2);

  const copyToClipboard = (text, tipo) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${tipo} copiado al portapapeles`);
    }).catch(() => {
      alert('Error al copiar. Selecciona y copia manualmente.');
    });
  };

  return (
    <div className="final-view">
      <h2>Resultado Final</h2>
      
      <div className="section">
        <h3>JSON de Anonimización</h3>
        <div className="content-row">
          <textarea
            readOnly
            value={jsonEntidades}
            className="textarea json-textarea"
          />
          <button 
            onClick={() => copyToClipboard(jsonEntidades, 'JSON')}
            className="copy-button"
          >
            Copiar JSON
          </button>
        </div>
      </div>

      <div className="section">
        <h3>CV Anonimizado</h3>
        <div className="content-row">
          <textarea
            readOnly
            value={textoAnonimizado}
            className="textarea cv-textarea"
          />
          <button 
            onClick={() => copyToClipboard(textoAnonimizado, 'CV anonimizado')}
            className="copy-button"
          >
            Copiar CV
          </button>
        </div>
      </div>

      <button onClick={onVolver} className="back-button">
        Volver a Anonimizar
      </button>
    </div>
  );
}

export default FinalView;