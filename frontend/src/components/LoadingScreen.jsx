import './css/LoadingScreen.css';

function LoadingScreen() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Procesando tu currículum...</h2>
      <p>Por favor espera mientras analizamos el documento.</p>
      <div style={{ margin: '2rem 0' }}>
        <div className="spinner">⏳</div>
      </div>
    </div>
  );
}

export default LoadingScreen;