import { uploadPDF } from '../api/documents.js'

function UploadButton({ onUpload, disabled }) {
  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    await uploadPDF(file)
    onUpload()
    e.target.value = ''
  }

  return (
    <div>
      <label style={{
        display: 'block',
        padding: '0.6rem 1rem',
        background: disabled ? '#444' : '#646cff',
        color: '#fff',
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'center',
        fontSize: '0.9rem'
      }}>
        {disabled ? 'Limit Reached' : '+ Upload PDF'}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  )
}

export default UploadButton