// import { useEffect, useState } from 'react'
// import { listPDFs } from '../api/documents.js'
// import PDFList from './PDFList.jsx'
// import UploadButton from './UploadButton.jsx'

// const MAX_PDFS = 5

// function Sidebar() {
//   const [docs, setDocs] = useState([])

//   async function fetchDocs() {
//     const data = await listPDFs()
//     setDocs(data)
//   }

//   useEffect(() => {
//     fetchDocs()
//   }, [])

//   return (
//     <div style={{
//       width: '240px',
//       minHeight: '100vh',
//       background: '#141414',
//       padding: '1.5rem 1rem',
//       borderRight: '1px solid #2a2a2a',
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '1rem'
//     }}>
//       <h2 style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>Your PDFs</h2>
//       <UploadButton onUpload={fetchDocs} disabled={docs.length >= MAX_PDFS} />
//       <PDFList docs={docs} onDelete={fetchDocs} />
//     </div>
//   )
// }

// export default Sidebar

import { useEffect, useState } from 'react'
import { listPDFs } from '../api/documents.js'
import PDFList from './PDFList.jsx'
import UploadButton from './UploadButton.jsx'

const MAX_PDFS = 5

function Sidebar() {
  const [docs, setDocs] = useState([])

  async function fetchDocs() {
    const data = await listPDFs()
    setDocs(data)
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  return (
    <div style={{
      width: '240px',
      height: '100vh',
      background: '#141414',
      padding: '1.5rem 1rem',
      borderRight: '1px solid #2a2a2a',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      overflow: 'hidden'
    }}>
      <h2 style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>Your PDFs</h2>
      <UploadButton onUpload={fetchDocs} disabled={docs.length >= MAX_PDFS} />
      <PDFList docs={docs} onDelete={fetchDocs} />
    </div>
  )
}

export default Sidebar