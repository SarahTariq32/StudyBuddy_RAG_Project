import { useState } from 'react'

function InputBox({ onSend, disabled }) {
  const [text, setText] = useState('')

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
    <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderTop: '1px solid #2a2a2a' }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask something about your PDFs..."
        rows={2}
        style={{
          flex: 1,
          padding: '0.75rem',
          background: '#1e1e1e',
          color: '#fff',
          border: '1px solid #333',
          borderRadius: '8px',
          resize: 'none',
          fontSize: '0.95rem',
          fontFamily: 'sans-serif'
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled}
        style={{
          padding: '0 1.2rem',
          background: disabled ? '#444' : '#646cff',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '1.2rem'
        }}
      >
        ↑
      </button>
    </div>
  )
}

export default InputBox