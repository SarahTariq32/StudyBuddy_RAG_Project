import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f0f0f',
      color: '#ffffff',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>PDF Chat</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Upload your PDFs and chat with them instantly.
      </p>
      <button
        onClick={() => navigate('/chat')}
        style={{
          padding: '0.8rem 2rem',
          fontSize: '1rem',
          background: '#646cff',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Let's Start
      </button>
    </div>
  )
}

export default LandingPage