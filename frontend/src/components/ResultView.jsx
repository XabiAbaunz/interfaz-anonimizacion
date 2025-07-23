import './ResultView.css';
import React from 'react';

function ResultView({ entidades, textoOriginal, onFinalizar, onVolver }) {
  const [estadoEntidades, setEstadoEntidades] = React.useState(
    Object.keys(entidades).map((clave) => ({ clave, activa: true }))
  );

  const [entidadesInternas, setEntidadesInternas] = React.useState(
    Object.fromEntries(Object.entries(entidades).sort(([a], [b]) => a.localeCompare(b)))
  );

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

    // Obtener el texto completo del panel para verificar si la selección es válida
    const textPanel = document.querySelector('.text-panel');
    const panelText = textPanel ? textPanel.innerText : '';

    // Verificar si la selección está completamente dentro de una etiqueta existente (anon_X)
    const range = selection.getRangeAt(0);
    const rangeStart = range.startOffset;
    const rangeEnd = range.endOffset;
    
    // Encontrar todas las etiquetas en el texto del panel
    const tagRegex = /anon_\d+/g;
    let match;
    let isInsideTag = false;
    
    // Para una verificación más precisa, necesitamos comparar con el texto renderizado
    // Vamos a usar una aproximación: verificar si la selección coincide exactamente con un valor existente
    const seleccionCoincideConValorExistente = Object.values(entidadesInternas).some(
      (valor) => valor === seleccionNormalizada
    );
    
    if (seleccionCoincideConValorExistente) {
      selection.removeAllRanges();
      return;
    }

    // Verificación más robusta: comprobar si la selección está dentro de una etiqueta en el texto mostrado
    // Esta es una solución aproximada. Para una solución perfecta, habría que mapear las posiciones exactas.
    const selectedParentText = range.startContainer.textContent || '';
    const tagMatchesInParent = [...selectedParentText.matchAll(tagRegex)];
    
    for (const tagMatch of tagMatchesInParent) {
      const tagStart = tagMatch.index;
      const tagEnd = tagStart + tagMatch[0].length;
      // Comprobar si la selección está completamente dentro de esta etiqueta
      if (rangeStart >= tagStart && rangeEnd <= tagEnd && 
          selectedParentText.substring(tagStart, tagEnd) === tagMatch[0]) {
        isInsideTag = true;
        break;
      }
    }

    if (isInsideTag) {
      selection.removeAllRanges();
      return;
    }

    // Verificación adicional usando una estrategia de comparación de contexto
    // Esta es una solución más precisa que verifica contra el texto anonimizado
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
      
      // Actualizar entidades internas
      const nuevasEntidades = {
        ...entidadesInternas,
        [nuevaClave]: selectedText,
      };
      
      const nuevasEntidadesOrdenadas = Object.fromEntries(
        Object.entries(nuevasEntidades).sort(([a], [b]) => a.localeCompare(b))
      );
      
      setEntidadesInternas(nuevasEntidadesOrdenadas);
      
      // Actualizar estado de entidades
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

  // Función auxiliar para verificar si una selección está dentro de una etiqueta
  function isSelectionInTag(selection, textWithTags) {
    // Esta función busca patrones donde la selección pueda estar dentro de una etiqueta
    // Ejemplo: si seleccionan "anon" y hay "anon_1" en el texto
    const tagRegex = /anon_\d+/g;
    let match;
    
    while ((match = tagRegex.exec(textWithTags)) !== null) {
      if (selection === match[0]) {
        // La selección es exactamente una etiqueta
        return true;
      }
      // Podríamos hacer verificaciones más complejas aquí si fuera necesario
    }
    
    return false;
  }

  const handleSiguiente = () => {
    // Generar entidades finales solo con las activas
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

      <div className="button-row">
        <button onClick={onVolver} className="secondary-button">
          Volver
        </button>
        <button onClick={handleSiguiente} className="primary-button">
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default ResultView;