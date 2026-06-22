import PDFItem from './PDFItem.jsx'

function PDFList({ docs, onDelete }) {
  if (docs.length === 0) {
    return <p style={{ color: '#555', fontSize: '0.85rem' }}>No PDFs uploaded yet.</p>
  }

  return (
    <div>
      {docs.map(doc => (
        <PDFItem key={doc.id} doc={doc} onDelete={onDelete} />
      ))}
    </div>
  )
}

export default PDFList