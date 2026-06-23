// function PDFItem({ doc, onDelete }) {
//   const isProcessing = doc.status === 'processing'

//   return (
//     <div
//       title={doc.filename}
//       style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         padding: '0.5rem 0.75rem',
//         background: '#1e1e1e',
//         borderRadius: '6px',
//         marginBottom: '0.5rem',
//         fontSize: '0.85rem',
//         opacity: isProcessing ? 0.6 : 1
//       }}
//     >
//       <div style={{ overflow: 'hidden' }}>
//         <span style={{
//           color: '#ccc',
//           overflow: 'hidden',
//           textOverflow: 'ellipsis',
//           whiteSpace: 'nowrap',
//           display: 'block',
//           maxWidth: '140px'
//         }}>
//           {doc.filename}
//         </span>
//         {isProcessing && (
//           <span style={{ color: '#888', fontSize: '0.75rem' }}>indexing...</span>
//         )}
//       </div>
//       <button
//         onClick={() => !isProcessing && onDelete(doc.id)}
//         style={{
//           background: 'none',
//           border: 'none',
//           color: isProcessing ? '#555' : '#ff6b6b',
//           cursor: isProcessing ? 'not-allowed' : 'pointer',
//           fontSize: '1rem',
//           flexShrink: 0
//         }}
//       >
//         ✕
//       </button>
//     </div>
//   )
// }

// export default PDFItem



import { useEffect, useState } from 'react'
import { deletePDF, renamePDF } from '../api/documents.js'

function PDFItem({ doc, onDocumentsChanged }) {
  const isProcessing = doc.status === 'processing'
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(doc.filename)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setDraftName(doc.filename)
  }, [doc.filename])

  async function handleDelete() {
    if (!isProcessing) {
      await deletePDF(doc.id)
      onDocumentsChanged()
    }
  }

  async function handleRename() {
    const trimmedName = draftName.trim()
    if (!trimmedName || trimmedName === doc.filename) {
      setIsEditing(false)
      setDraftName(doc.filename)
      return
    }

    setIsSaving(true)
    try {
      await renamePDF(doc.id, trimmedName)
      setIsEditing(false)
      onDocumentsChanged()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      title={doc.filename}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 0.875rem',
        background: 'rgba(0, 20, 40, 0.4)',
        border: `1.5px solid rgba(0,180,255,${isProcessing ? '0.15' : '0.2'})`,
        borderRadius: '8px',
        marginBottom: '0.625rem',
        fontSize: '0.85rem',
        opacity: isProcessing ? 0.7 : 1,
        transition: 'all 0.3s ease',
        boxShadow: '0 0 10px rgba(0,150,255,0.05)',
      }}
      onMouseEnter={(e) => {
        if (!isProcessing) {
          e.currentTarget.style.background = 'rgba(0, 25, 50, 0.5)'
          e.currentTarget.style.boxShadow = '0 0 15px rgba(0,180,255,0.1)'
          e.currentTarget.style.borderColor = 'rgba(0,180,255,0.3)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0, 20, 40, 0.4)'
        e.currentTarget.style.boxShadow = '0 0 10px rgba(0,150,255,0.05)'
        e.currentTarget.style.borderColor = `rgba(0,180,255,${isProcessing ? '0.15' : '0.2'})`
      }}
    >
      <div style={{ overflow: 'hidden', flex: 1 }}>
        {isEditing ? (
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') {
                setIsEditing(false)
                setDraftName(doc.filename)
              }
            }}
            disabled={isSaving}
            autoFocus
            style={{
              width: '100%',
              background: 'rgba(0, 20, 40, 0.7)',
              border: '1px solid rgba(0,180,255,0.35)',
              color: '#d9e8ff',
              borderRadius: '4px',
              padding: '0.2rem 0.35rem',
              fontSize: '0.78rem',
              outline: 'none',
            }}
          />
        ) : (
          <span style={{
            color: '#c0d0ff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
            maxWidth: '140px',
            fontWeight: '500',
          }}>
            {doc.filename}
          </span>
        )}
        {isProcessing && (
          <span style={{
            color: 'rgba(0,180,255,0.5)',
            fontSize: '0.7rem',
            letterSpacing: '0.05em',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            INDEXING...
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
        {isEditing ? (
          <>
            <button
              onClick={handleRename}
              disabled={isSaving}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(0, 220, 160, 0.9)',
                cursor: isSaving ? 'wait' : 'pointer',
                fontSize: '0.9rem',
                flexShrink: 0,
                padding: '0.2rem 0.35rem',
              }}
              title='Save name'
            >
              ✓
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setDraftName(doc.filename)
              }}
              disabled={isSaving}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 180, 100, 0.9)',
                cursor: isSaving ? 'wait' : 'pointer',
                fontSize: '0.9rem',
                flexShrink: 0,
                padding: '0.2rem 0.35rem',
              }}
              title='Cancel rename'
            >
              ↺
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            disabled={isProcessing}
            style={{
              background: 'none',
              border: 'none',
              color: isProcessing ? 'rgba(100,150,255,0.3)' : 'rgba(120, 220, 255, 0.8)',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              flexShrink: 0,
              padding: '0.2rem 0.35rem',
            }}
            title='Rename file'
          >
            ✎
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={isProcessing || isSaving}
          style={{
            background: 'none',
            border: 'none',
            color: isProcessing ? 'rgba(100,150,255,0.3)' : 'rgba(255, 100, 120, 0.7)',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontSize: '1.1rem',
            flexShrink: 0,
            padding: '0.25rem 0.35rem',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!isProcessing) {
              e.target.style.color = 'rgba(255, 80, 100, 1)'
              e.target.style.textShadow = '0 0 10px rgba(255, 100, 120, 0.4)'
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.color = 'rgba(255, 100, 120, 0.7)'
            e.target.style.textShadow = 'none'
          }}
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default PDFItem

