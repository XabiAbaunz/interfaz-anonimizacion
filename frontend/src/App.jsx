import './App.css';
import React from 'react';
import UploadForm from './components/UploadForm';
import LoadingScreen from './components/LoadingScreen';
import ResultView from './components/ResultView';
import FinalView from './components/FinalView';

function App() {
  const [fase, setFase] = React.useState('upload');
  const [resultado, setResultado] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [datosFormulario, setDatosFormulario] = React.useState(null);
  const [modoSeleccionado, setModoSeleccionado] = React.useState('rapida');

  const handleUploadComplete = (datosFormulario, modo) => {
    setDatosFormulario(datosFormulario);
    setModoSeleccionado(modo);
    setFase('loading');
    setError(null);
    handleAnonymize(datosFormulario, modo);
  };

  const handleAnonymize = async (datos, modo) => {
    try {
      const { textoOriginal } = datos;
      const ollamaEndpoint = localStorage.getItem('ollamaEndpoint');
      const ollamaKey = localStorage.getItem('ollamaKey');

      if (!ollamaEndpoint) {
          throw new Error('No se encontró el endpoint de Ollama. Por favor, vuelve atrás e introdúcelo de nuevo.');
      }

      const datosParaBackend = {
        cvContent: textoOriginal,
        ollamaEndpoint: ollamaEndpoint,
        ollamaKey: ollamaKey,
      };

      const backendUrl = '/api/anonymize';
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaBackend),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}. Detalle: ${errorData.detail || 'Desconocido'}`);
      }

      const data = await response.json();
      const entidadesAnonimizadas = data.entidades;

      if (!entidadesAnonimizadas || typeof entidadesAnonimizadas !== 'object') {
        throw new Error('La respuesta del backend no contiene un objeto de entidades válido.');
      }

      setResultado({ textoOriginal, entidades: entidadesAnonimizadas });
      
      if (modo === 'rapida') {
        setFase('final');
      } else {
        setFase('result');
      }
    } catch (err) {
      console.error('Error en handleAnonymize:', err);
      setError(err.message);
      alert(`Error durante la anonimización: ${err.message}`);
      setFase('upload');
    }
  };

  const handleFinalizarEdicionManual = (entidadesFinales) => {
    setResultado(prev => ({ ...prev, entidades: entidadesFinales }));
    setFase('final');
  };

  const handleVolver = () => {
    setFase('upload');
    setResultado(null);
    setDatosFormulario(null);
    setModoSeleccionado('rapida');
    setError(null);
    localStorage.removeItem('ollamaEndpoint');
    localStorage.removeItem('ollamaKey');
  };

  return (
    <div className="App">
      {fase === 'upload' && (
        <UploadForm onComplete={handleUploadComplete} />
      )}
      {fase === 'loading' && (
        <LoadingScreen />
      )}
      {fase === 'result' && resultado && (
        <ResultView 
          entidades={resultado.entidades} 
          textoOriginal={resultado.textoOriginal}
          onFinalizar={handleFinalizarEdicionManual}
          onVolver={handleVolver}
        />
      )}
      {fase === 'final' && resultado && (
        <FinalView
          entidades={resultado.entidades}
          textoOriginal={resultado.textoOriginal}
          onVolver={handleVolver}
        />
      )}
    </div>
  );
}

export default App;