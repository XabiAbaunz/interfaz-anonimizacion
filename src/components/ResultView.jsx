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

    if (!seleccionNormalizada || seleccionNormalizada.length <= 1) return;

    // Bloquear selección si contiene parcial o totalmente una clave (anon_X)
    const contieneParteDeClave = Object.keys(entidadesInternas).some((clave) =>
      seleccionNormalizada.includes(clave) || clave.includes(seleccionNormalizada)
    );
    if (contieneParteDeClave) return;

    const partesSeleccion = seleccionNormalizada.split(/\s+/);

    const contieneFragmentoDeClave = Object.keys(entidadesInternas).some((clave) =>
      partesSeleccion.some(
        (parte) => clave.includes(parte) || parte.includes(clave)
      )
    );
    if (contieneFragmentoDeClave) return;

    // Bloquear selección si ya está anonimizada como valor (aunque esté desactivada)
    const contieneValorExistente = Object.values(entidadesInternas).some((valor) =>
      partesSeleccion.some(
        (parte) => valor.includes(parte) || parte.includes(valor)
      )
    );
    if (contieneValorExistente) return;

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