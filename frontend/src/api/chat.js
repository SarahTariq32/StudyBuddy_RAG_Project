const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function askQuestion(question, sessionId) {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, session_id: sessionId }),
  })
  return res.json()
}