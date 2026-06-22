const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function listPDFs() {
  const res = await fetch(`${BASE_URL}/documents`)
  return res.json()
}

export async function uploadPDF(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE_URL}/documents`, {
    method: 'POST',
    body: formData,
  })
  return res.json()
}

export async function deletePDF(id) {
  await fetch(`${BASE_URL}/documents/${id}`, { method: 'DELETE' })
}