// import Sidebar from '../components/Sidebar.jsx'
// import ChatWindow from '../components/ChatWindow.jsx'

// function ChatPage() {
//   return (
//     <div style={{ display: 'flex' }}>
//       <Sidebar />
//       <ChatWindow />
//     </div>
//   )
// }

// export default ChatPage

import Sidebar from '../components/Sidebar.jsx'
import ChatWindow from '../components/ChatWindow.jsx'

function ChatPage() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#0f0f0f'
    }}>
      <Sidebar />
      <ChatWindow />
    </div>
  )
}

export default ChatPage