// import { useState } from 'react'

// function InputBox({ onSend, disabled }) {
//   const [text, setText] = useState('')

//   function handleSend() {
//     if (!text.trim() || disabled) return
//     onSend(text.trim())
//     setText('')
//   }

//   function handleKeyDown(e) {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       handleSend()
//     }
//   }

//   return (
//     <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderTop: '1px solid #2a2a2a' }}>
//       <textarea
//         value={text}
//         onChange={e => setText(e.target.value)}
//         onKeyDown={handleKeyDown}
//         placeholder="Ask something about your PDFs..."
//         rows={2}
//         style={{
//           flex: 1,
//           padding: '0.75rem',
//           background: '#1e1e1e',
//           color: '#fff',
//           border: '1px solid #333',
//           borderRadius: '8px',
//           resize: 'none',
//           fontSize: '0.95rem',
//           fontFamily: 'sans-serif'
//         }}
//       />
//       <button
//         onClick={handleSend}
//         disabled={disabled}
//         style={{
//           padding: '0 1.2rem',
//           background: disabled ? '#444' : '#646cff',
//           color: '#fff',
//           border: 'none',
//           borderRadius: '8px',
//           cursor: disabled ? 'not-allowed' : 'pointer',
//           fontSize: '1.2rem'
//         }}
//       >
//         ↑
//       </button>
//     </div>
//   )
// }

// export default InputBox




import { useState } from 'react'

function InputBox({ onSend, disabled }) {
  const [text, setText] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  function handleSend() {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      display: 'flex',
      gap: '0.75rem',
      padding: '1.5rem',
      borderTop: `1px solid rgba(0,180,255,${isFocused ? '0.3' : '0.1'})`,
      background: 'rgba(0, 5, 20, 0.3)',
      backdropFilter: 'blur(1px)',
      position: 'relative',
      zIndex: 2,
    }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Ask something about your PDFs..."
        rows={2}
        style={{
          flex: 1,
          padding: '0.875rem 1rem',
          background: 'rgba(0, 20, 40, 0.6)',
          color: '#e0e8ff',
          border: `1.5px solid rgba(0,180,255,${isFocused ? '0.5' : '0.2'})`,
          borderRadius: '10px',
          resize: 'none',
          fontSize: '0.95rem',
          fontFamily: "'Segoe UI', sans-serif",
          outline: 'none',
          transition: 'all 0.3s ease',
          boxShadow: isFocused ? '0 0 20px rgba(0,180,255,0.15)' : 'none',
          caretColor: '#00c8ff',
          lineHeight: '1.5',
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled}
        style={{
          padding: '0.875rem 1rem',
          background: disabled
            ? 'rgba(100,150,255,0.1)'
            : 'linear-gradient(135deg, rgba(0,180,255,0.8) 0%, rgba(0,200,255,1) 100%)',
          color: disabled ? 'rgba(100,150,255,0.3)' : '#ffffff',
          border: `1.5px solid ${disabled ? 'rgba(0,180,255,0.1)' : 'rgba(0,200,255,0.5)'}`,
          borderRadius: '10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '1.1rem',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          boxShadow: disabled ? 'none' : '0 0 15px rgba(0,180,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '48px',
          minHeight: '48px',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.target.style.boxShadow = '0 0 25px rgba(0,200,255,0.5)'
            e.target.style.background = 'linear-gradient(135deg, rgba(0,200,255,0.9) 0%, rgba(0,220,255,1) 100%)'
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.target.style.boxShadow = '0 0 15px rgba(0,180,255,0.3)'
            e.target.style.background = 'linear-gradient(135deg, rgba(0,180,255,0.8) 0%, rgba(0,200,255,1) 100%)'
          }
        }}
      >
        ↑
      </button>

      <style>{`
        textarea::placeholder {
          color: rgba(100,150,255,0.3);
        }
        textarea::-webkit-scrollbar {
          width: 6px;
        }
        textarea::-webkit-scrollbar-track {
          background: rgba(0,180,255,0.05);
          borderRadius: 10px;
        }
        textarea::-webkit-scrollbar-thumb {
          background: rgba(0,180,255,0.3);
          borderRadius: 10px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(0,180,255,0.5);
        }
      `}</style>
    </div>
  )
}

export default InputBox