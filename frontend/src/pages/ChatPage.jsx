
// import Sidebar from '../components/Sidebar.jsx'
// import ChatWindow from '../components/ChatWindow.jsx'

// function ChatPage() {
//   return (
//     <div style={{
//       display: 'flex',
//       height: '100vh',
//       width: '100vw',
//       overflow: 'hidden',
//       background: '#0f0f0f'
//     }}>
//       <Sidebar />
//       <ChatWindow />
//     </div>
//   )
// }

// export default ChatPage


// import Sidebar from '../components/Sidebar.jsx'
// import ChatWindow from '../components/ChatWindow.jsx'

// function ChatPage() {
//   return (
//     <div style={{
//       display: 'flex',
//       height: '100vh',
//       width: '100vw',
//       overflow: 'hidden',
//       background: 'radial-gradient(ellipse at 30% 50%, #000d1a 0%, #000208 60%, #000000 100%)',
//       fontFamily: "'Segoe UI', sans-serif",
//     }}>
//       {/* Horizontal scan line sweep overlay */}
//       <div style={{
//         position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
//         background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,100,255,0.015) 2px,rgba(0,100,255,0.015) 4px)',
//       }} />

//       {/* Main content */}
//       <div style={{ display: 'flex', flex: 1, position: 'relative', zIndex: 0 }}>
//         <Sidebar />
//         <ChatWindow />
//       </div>
//     </div>
//   )
// }

// export default ChatPage



import { useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import ChatWindow from '../components/ChatWindow.jsx'

function ChatPage() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Subtle animated background particles
    const particles = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      r: Math.random() * 1.5 + 0.5,
      pulse: Math.random() * Math.PI * 2,
    }))

    const orbs = [
      { x: 0.05, y: 0.15, r: 80, color: '0,120,255', speed: 0.0005 },
      { x: 0.95, y: 0.85, r: 60, color: '0,200,255', speed: 0.0006 },
    ]

    let t = 0

    function draw() {
      ctx.fillStyle = 'rgba(0,2,15,0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw orbs
      orbs.forEach(o => {
        const x = (o.x + Math.sin(t * o.speed * 1000) * 0.03) * canvas.width
        const y = (o.y + Math.cos(t * o.speed * 800) * 0.02) * canvas.height

        const grad = ctx.createRadialGradient(x, y, 0, x, y, o.r)
        grad.addColorStop(0, `rgba(${o.color},0.12)`)
        grad.addColorStop(0.4, `rgba(${o.color},0.04)`)
        grad.addColorStop(1, `rgba(${o.color},0)`)
        ctx.beginPath()
        ctx.arc(x, y, o.r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      })

      // Draw particles
      particles.forEach(p => {
        p.pulse += 0.02
        const glow = Math.sin(p.pulse) * 0.2 + 0.6

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,180,255,${0.4 * glow})`
        ctx.fill()

        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      })

      t += 0.016
      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 30% 50%, #000d1a 0%, #000208 60%, #000000 100%)',
      fontFamily: "'Segoe UI', sans-serif",
      position: 'relative',
    }}>
      {/* Animated background canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* Horizontal scan line sweep overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,100,255,0.015) 2px,rgba(0,100,255,0.015) 4px)',
      }} />

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', zIndex: 2 }}>
        <Sidebar />
        <ChatWindow />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default ChatPage