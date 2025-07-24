import './css/ResultView.css';
import React, { useState } from 'react';

function ResultView({ entidades, textoOriginal, onFinalizar, onVolver }) {
  const [estadoEntidades, setEstadoEntidades] = useState(
    Object.keys(entidades).map((clave) => ({ clave, activa: true }))
  );
  const [entidadesInternas, setEntidadesInternas] = useState(
    Object.fromEntries(Object.entries(entidades).sort(([a], [b]) => a.localeCompare(b)))
  );
  const [userInstruction, setUserInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const toggleEntidad = (clave) => {
    setEstadoEntidades((prev) =>
      prev.map((e) => (e.clave === clave ? { ...e, activa: !e.activa } : e))
    );
  };

  const generarTextoAnonimizado = () => {
    let texto = textoOriginal;
    Object.entries(entidadesInternas).forEach(([clave, valor]) => {
      const regex = new RegExp(valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      texto = texto.replace(regex, clave);
    });
    estadoEntidades.forEach(({ clave, activa }) => {
      const regex = new RegExp(clave, 'g');
      texto = texto.replace(regex, activa ? clave : entidadesInternas[clave]);
    });
    return texto;
  };

  const textoAnonimizado = generarTextoAnonimizado();

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    const seleccionNormalizada = selectedText.replace(/\s+/g, ' ').trim();

    if (!seleccionNormalizada || seleccionNormalizada.length <= 1) {
      selection.removeAllRanges();
      return;
    }

    const seleccionCoincideConValorExistente = Object.values(entidadesInternas).some(
      (valor) => valor === seleccionNormalizada
    );

    if (seleccionCoincideConValorExistente) {
      selection.removeAllRanges();
      return;
    }

    if (isSelectionInTag(seleccionNormalizada, textoAnonimizado)) {
      selection.removeAllRanges();
      return;
    }

    if (window.confirm(`¿Seguro que quieres anonimizar "${selectedText}"?`)) {
      const clavesExistentes = Object.keys(entidadesInternas)
        .map((clave) => parseInt(clave.replace('anon_', ''), 10))
        .filter((num) => !isNaN(num));
      const siguienteNumero = clavesExistentes.length > 0
        ? Math.max(...clavesExistentes) + 1
        : 1;
      const nuevaClave = `anon_${siguienteNumero}`;

      const nuevasEntidades = {
        ...entidadesInternas,
        [nuevaClave]: selectedText,
      };
      const nuevasEntidadesOrdenadas = Object.fromEntries(
        Object.entries(nuevasEntidades).sort(([a], [b]) => a.localeCompare(b))
      );
      setEntidadesInternas(nuevasEntidadesOrdenadas);

      const nuevasClaves = Object.keys(nuevasEntidadesOrdenadas).map((clave) => {
        const existente = estadoEntidades.find((e) => e.clave === clave);
        return {
          clave,
          activa: existente ? existente.activa : true,
        };
      });
      setEstadoEntidades(nuevasClaves);
    }
    selection.removeAllRanges();
  };

  function isSelectionInTag(selection, textWithTags) {
    const tagRegex = /anon_\d+/g;
    let match;
    while ((match = tagRegex.exec(textWithTags)) !== null) {
      if (selection === match[0]) {
        return true;
      }
    }
    return false;
  }

  const handleRefine = async () => {
    if (!userInstruction.trim()) {
      alert('Por favor, introduce una instrucción para refinar la anonimización.');
      return;
    }

    setIsRefining(true);

    try {
      const ollamaEndpoint = localStorage.getItem('ollamaEndpoint') || '';
      const ollamaKey = localStorage.getItem('ollamaKey') || '';

      if (!ollamaEndpoint) {
        throw new Error('No se encontró el endpoint de Ollama. Por favor, vuelve atrás e introdúcelo de nuevo.');
      }

      const datosParaRefinamiento = {
        cvContent: textoOriginal,
        currentMapping: entidadesInternas,
        userInstruction: userInstruction,
        ollamaEndpoint: ollamaEndpoint,
        ollamaKey: ollamaKey,
      };

      const backendUrl = '/api/refine_anonymization';
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaRefinamiento),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error del servidor durante el refinamiento: ${response.status} ${response.statusText}. Detalle: ${errorData.detail || 'Desconocido'}`);
      }

      const data = await response.json();
      const refinedEntidades = data.entidades;

      if (!refinedEntidades || typeof refinedEntidades !== 'object') {
        throw new Error('La respuesta del backend no contiene un objeto de entidades válido para el refinamiento.');
      }

      const refinedEntidadesOrdenadas = Object.fromEntries(
        Object.entries(refinedEntidades).sort(([a], [b]) => a.localeCompare(b))
      );
      setEntidadesInternas(refinedEntidadesOrdenadas);

      const nuevasClavesEstado = Object.keys(refinedEntidadesOrdenadas).map((clave) => {
        const existente = estadoEntidades.find((e) => e.clave === clave);
        return {
          clave,
          activa: existente ? existente.activa : true,
        };
      });
      setEstadoEntidades(nuevasClavesEstado);

      setUserInstruction('');
      alert('Anonimización refinada con éxito.');

    } catch (error) {
      console.error('Error al refinar la anonimización:', error);
      alert(`Hubo un error al refinar la anonimización: ${error.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  const handleSiguiente = () => {
    const entidadesFinales = {};
    estadoEntidades.forEach(({ clave, activa }) => {
      if (activa) {
        entidadesFinales[clave] = entidadesInternas[clave];
      }
    });
    onFinalizar(entidadesFinales);
  };

  return (
    <div className="result-view">
      {isRefining && (
        <div className="refinement-loading-overlay">
          <div className="refinement-loading-content">
            <h3>Refinando Anonimización...</h3>
            <p>Por favor, espera mientras el modelo procesa tu instrucción.</p>
          </div>
        </div>
      )}
      <div className="main-content">
        <div className="entities-panel">
          <h3>Checklist de Entidades</h3>
          {estadoEntidades.map(({ clave, activa }) => (
            <label key={clave} className="entity-checkbox">
              <input
                type="checkbox"
                checked={activa}
                onChange={() => toggleEntidad(clave)}
              />
              {clave} ({entidadesInternas[clave]})
            </label>
          ))}
        </div>
        <div
          onMouseUp={handleTextSelection}
          className="text-panel"
        >
          <h3>CV Anonimizado</h3>
          {textoAnonimizado}
        </div>
      </div>

      <div className="refinement-section">
        <h4>Refinar Anonimización</h4>
        <textarea
          value={userInstruction}
          onChange={(e) => setUserInstruction(e.target.value)}
          placeholder="Escribe tu instrucción aquí"
          rows="3"
          className="refinement-instruction-input"
          disabled={isRefining}
        />
        <div className="refinement-buttons">
          <button
            onClick={handleRefine}
            disabled={isRefining || !userInstruction.trim()}
            className="refine-button"
          >
            {isRefining ? 'Refinando...' : 'Refinar con IA'}
          </button>
          <button
            onClick={() => setUserInstruction('')}
            disabled={isRefining}
            className="clear-instruction-button"
          >
            Limpiar Instrucción
          </button>
        </div>
      </div>

      <div className="button-row">
        <button onClick={onVolver} className="secondary-button" disabled={isRefining}>
          Volver
        </button>
        <button onClick={handleSiguiente} className="primary-button" disabled={isRefining}>
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default ResultView;