import { deletePDF } from '../api/documents.js'

function PDFItem({ doc, onDelete }) {
  async function handleDelete() {
    await deletePDF(doc.id)
    onDelete()
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 0.75rem',
      background: '#1e1e1e',
      borderRadius: '6px',
      marginBottom: '0.5rem',
      fontSize: '0.85rem'
    }}>
      <span style={{ color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
        {doc.filename}
      </span>
      <button
        onClick={handleDelete}
        style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '1rem' }}
      >
        ✕
      </button>
    </div>
  )
}

export default PDFItem