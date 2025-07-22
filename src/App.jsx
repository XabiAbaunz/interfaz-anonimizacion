import './App.css';
import React from 'react';

import UploadForm from './components/UploadForm';
import LoadingScreen from './components/LoadingScreen';
import ResultView from './components/ResultView';
import FinalView from './components/FinalView';

function App() {
  const [fase, setFase] = React.useState('upload'); // 'upload', 'loading', 'result', 'final'
  const [resultado, setResultado] = React.useState(null);

  const handleUploadComplete = async (datosFormulario, esRapida = false) => {
    setFase('loading');
    
    // Pausa mínima de 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const { entidades, textoOriginal } = datosFormulario;
      setResultado({ entidades, textoOriginal });
      
      // Si es anonimización rápida, ir directamente a final
      if (esRapida) {
        setFase('final');
      } else {
        setFase('result');
      }
    } catch (error) {
      console.error('Error al procesar:', error);
      alert('Hubo un error al procesar el archivo.');
      setFase('upload');
    }
  };

  const handleFinalizarAnonimizacion = (entidadesFinales) => {
    // Actualizar las entidades con los cambios del usuario
    setResultado(prev => ({ ...prev, entidades: entidadesFinales }));
    setFase('final');
  };

  const handleVolver = () => {
    setFase('upload');
    setResultado(null);
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
          onFinalizar={handleFinalizarAnonimizacion}
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