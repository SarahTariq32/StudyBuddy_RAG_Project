// import { useEffect, useRef, useState } from 'react'
// import { askQuestion } from '../api/chat.js'
// import { getSessionId } from '../utils/session.js'
// import Message from './Message.jsx'
// import InputBox from './InputBox.jsx'

// function ChatWindow() {
//   const [messages, setMessages] = useState([])
//   const [loading, setLoading] = useState(false)
//   const bottomRef = useRef(null)

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   async function handleSend(question) {
//     setMessages(prev => [...prev, { role: 'user', text: question }])
//     setLoading(true)

//     const data = await askQuestion(question, getSessionId())
//     const answer = data.answer ?? 'Something went wrong.'

//     setMessages(prev => [...prev, { role: 'assistant', text: answer }])
//     setLoading(false)
//   }

//   return (
//     <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f' }}>
//       <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
//         {messages.length === 0 && (
//           <p style={{ color: '#444', textAlign: 'center', marginTop: '3rem' }}>
//             Upload a PDF and ask anything about it.
//           </p>
//         )}
//         {messages.map((msg, i) => (
//           <Message key={i} role={msg.role} text={msg.text} />
//         ))}
//         {loading && (
//           <div style={{ color: '#555', fontSize: '0.9rem', paddingLeft: '0.5rem' }}>
//             Thinking...
//           </div>
//         )}
//         <div ref={bottomRef} />
//       </div>
//       <InputBox onSend={handleSend} disabled={loading} />
//     </div>
//   )
// }

// export default ChatWindow


import { useEffect, useRef, useState } from 'react'
import { askQuestion } from '../api/chat.js'
import { getSessionId } from '../utils/session.js'
import Message from './Message.jsx'
import InputBox from './InputBox.jsx'

function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(question) {
    setMessages(prev => [...prev, { role: 'user', text: question }])
    setLoading(true)

    const data = await askQuestion(question, getSessionId())
    const answer = data.answer ?? 'Something went wrong.'

    setMessages(prev => [...prev, { role: 'assistant', text: answer }])
    setLoading(false)
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: '#0f0f0f'
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {messages.length === 0 && (
          <p style={{ color: '#444', textAlign: 'center', marginTop: '3rem' }}>
            Upload a PDF and ask anything about it.
          </p>
        )}
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} text={msg.text} />
        ))}
        {loading && (
          <div style={{ color: '#555', fontSize: '0.9rem', paddingLeft: '0.5rem' }}>
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <InputBox onSend={handleSend} disabled={loading} />
    </div>
  )
}

export default ChatWindow