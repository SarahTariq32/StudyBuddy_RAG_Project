import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

function LandingPage() {
  const navigate = useNavigate()
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

    // --- Circuit nodes ---
    const nodes = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2,
    }))

    // --- Data stream particles ---
    const streams = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 0.8 + 0.3,
      length: Math.floor(Math.random() * 8) + 4,
      opacity: Math.random() * 0.4 + 0.1,
      char: String.fromCharCode(0x30A0 + Math.random() * 96),
    }))

    // --- Floating orbs ---
    const orbs = [
      { x: 0.15, y: 0.3,  r: 60, color: '0,120,255',   speed: 0.0007 },
      { x: 0.85, y: 0.25, r: 45, color: '0,200,255',   speed: 0.001  },
      { x: 0.1,  y: 0.75, r: 35, color: '80,0,255',    speed: 0.0009 },
      { x: 0.9,  y: 0.7,  r: 50, color: '0,150,255',   speed: 0.0008 },
    ]

    let t = 0

    function drawCircuitLines() {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 200) {
            const alpha = (1 - d / 200) * 0.15
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0,150,255,${alpha})`
            ctx.lineWidth = 0.5

            // Draw circuit-style right-angle path (not straight line)
            const mx = (nodes[i].x + nodes[j].x) / 2
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(mx, nodes[i].y)
            ctx.lineTo(mx, nodes[j].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()

            // Draw junction dots
            ctx.beginPath()
            ctx.arc(mx, nodes[i].y, 1.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(0,200,255,${alpha * 2})`
            ctx.fill()
          }
        }
      }
    }

    function drawNodes() {
      nodes.forEach(n => {
        n.pulse += 0.03
        const glow = Math.sin(n.pulse) * 0.3 + 0.7

        // Outer ring
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0,180,255,${0.06 * glow})`
        ctx.lineWidth = 1
        ctx.stroke()

        // Core dot
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,220,255,${0.8 * glow})`
        ctx.fill()

        // Move
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
      })
    }

    function drawOrbs() {
      orbs.forEach(o => {
        const x = (o.x + Math.sin(t * o.speed * 1000) * 0.04) * canvas.width
        const y = (o.y + Math.cos(t * o.speed * 800) * 0.03) * canvas.height

        const grad = ctx.createRadialGradient(x, y, 0, x, y, o.r)
        grad.addColorStop(0,   `rgba(${o.color},0.18)`)
        grad.addColorStop(0.4, `rgba(${o.color},0.07)`)
        grad.addColorStop(1,   `rgba(${o.color},0)`)
        ctx.beginPath()
        ctx.arc(x, y, o.r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      })
    }

    function drawDataStreams() {
      ctx.font = '11px monospace'
      streams.forEach(s => {
        ctx.fillStyle = `rgba(0,180,255,${s.opacity})`
        s.char = String.fromCharCode(0x30A0 + Math.random() * 96)
        ctx.fillText(s.char, s.x, s.y)
        s.y += s.speed
        if (s.y > canvas.height) {
          s.y = 0
          s.x = Math.random() * canvas.width
        }
      })
    }

    function drawScanRings() {
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      for (let i = 0; i < 3; i++) {
        const r = 220 + i * 80 + Math.sin(t * 0.5 + i) * 15
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0,150,255,${0.04 - i * 0.01})`
        ctx.lineWidth = 1
        ctx.stroke()

        // Rotating dash on ring
        const angle = t * (0.3 + i * 0.1)
        const dx = Math.cos(angle) * r
        const dy = Math.sin(angle) * r
        ctx.beginPath()
        ctx.arc(cx + dx, cy + dy, 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,220,255,0.6)`
        ctx.fill()
      }
    }

    function draw() {
      ctx.fillStyle = 'rgba(0,2,15,0.25)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      drawOrbs()
      drawCircuitLines()
      drawNodes()
      drawDataStreams()
      drawScanRings()

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
      position: 'relative',
      height: '100vh', width: '100vw',
      background: 'radial-gradient(ellipse at 30% 50%, #000d1a 0%, #000208 60%, #000000 100%)',
      overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* Horizontal scan line sweep */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,100,255,0.015) 2px,rgba(0,100,255,0.015) 4px)',
      }} />

      {/* Left side — vertical tech label */}
      <div style={{
        position: 'absolute', left: '2rem', top: '50%',
        transform: 'translateY(-50%) rotate(-90deg)',
        color: 'rgba(0,150,255,0.25)',
        fontSize: '0.6rem', letterSpacing: '0.3em',
        textTransform: 'uppercase', zIndex: 2,
        animation: 'fadeIn 2s ease forwards', opacity: 0,
      }}>
        Neural Retrieval System v2.0
      </div>

      {/* Right side — vertical tech label */}
      <div style={{
        position: 'absolute', right: '2rem', top: '50%',
        transform: 'translateY(-50%) rotate(90deg)',
        color: 'rgba(0,150,255,0.25)',
        fontSize: '0.6rem', letterSpacing: '0.3em',
        textTransform: 'uppercase', zIndex: 2,
        animation: 'fadeIn 2s ease forwards', opacity: 0,
      }}>
        RAG · Embeddings · LLM
      </div>

      {/* Corner brackets */}
      {[
        { top: '1.5rem', left: '1.5rem',   borderTop: '1px solid', borderLeft: '1px solid'  },
        { top: '1.5rem', right: '1.5rem',  borderTop: '1px solid', borderRight: '1px solid' },
        { bottom: '1.5rem', left: '1.5rem',  borderBottom: '1px solid', borderLeft: '1px solid'  },
        { bottom: '1.5rem', right: '1.5rem', borderBottom: '1px solid', borderRight: '1px solid' },
      ].map((style, i) => (
        <div key={i} style={{
          position: 'absolute', width: '30px', height: '30px',
          borderColor: 'rgba(0,180,255,0.35)',
          zIndex: 2, ...style,
          animation: `fadeIn 1.5s ease ${i * 0.15}s forwards`, opacity: 0,
        }} />
      ))}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '2rem', maxWidth: '700px' }}>

        {/* System status badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '6px 18px',
          border: '1px solid rgba(0,180,255,0.3)',
          borderRadius: '3px',
          color: 'rgba(0,200,255,0.8)',
          fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase',
          background: 'rgba(0,100,255,0.06)',
          marginBottom: '2.2rem',
          animation: 'fadeUp 0.8s ease 0.2s forwards', opacity: 0,
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%', background: '#00c8ff',
            animation: 'blink 1.8s ease-in-out infinite',
          }} />
          System Online · AI Ready
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%', background: '#00c8ff',
            animation: 'blink 1.8s ease-in-out infinite 0.9s',
          }} />
        </div>

        {/* Main heading */}
        <h1 style={{
          fontSize: 'clamp(2.8rem, 6vw, 5rem)',
          fontWeight: 800, color: '#fff',
          lineHeight: 1.05, margin: '0 0 1.2rem',
          letterSpacing: '-0.02em',
          animation: 'fadeUp 0.8s ease 0.35s forwards', opacity: 0,
        }}>
          Intelligence
          <br />
          <span style={{
            background: 'linear-gradient(90deg, #0080ff, #00d4ff, #0050ff, #00d4ff)',
            backgroundSize: '300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 4s linear infinite',
          }}>
            Meets Your Docs
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          color: 'rgba(150,200,255,0.45)',
          fontSize: '1rem', maxWidth: '400px',
          margin: '0 auto 3rem', lineHeight: 1.8,
          animation: 'fadeUp 0.8s ease 0.5s forwards', opacity: 0,
        }}>
          Upload PDFs. Ask anything. Get precise answers from
          AI that actually understands your documents.
        </p>

        {/* CTA */}
        <div style={{ animation: 'fadeUp 0.8s ease 0.65s forwards', opacity: 0, marginBottom: '3.5rem' }}>
          {/* Outer glow ring */}
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: '-8px',
              borderRadius: '6px',
              background: 'rgba(0,150,255,0.08)',
              border: '1px solid rgba(0,180,255,0.2)',
              animation: 'ringPulse 2.5s ease-in-out infinite',
            }} />
            <button
              onClick={() => navigate('/chat')}
              style={{
                position: 'relative',
                padding: '0.9rem 3rem',
                fontSize: '0.95rem', fontWeight: 700,
                color: '#fff',
                background: 'linear-gradient(135deg, #0050cc, #0090ff)',
                border: '1px solid rgba(0,200,255,0.5)',
                borderRadius: '4px',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0060dd, #00aaff)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,150,255,0.5)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0050cc, #0090ff)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Initialize System →
            </button>
          </div>
        </div>

        {/* Stat strip */}
        <div style={{
          display: 'flex', gap: '0', justifyContent: 'center',
          border: '1px solid rgba(0,150,255,0.15)',
          borderRadius: '4px',
          overflow: 'hidden',
          animation: 'fadeUp 0.8s ease 0.8s forwards', opacity: 0,
          background: 'rgba(0,30,80,0.2)',
        }}>
          {[
            { val: 'RAG',  label: 'Retrieval Engine' },
            { val: '5',    label: 'PDF Capacity'     },
            { val: 'LLM',  label: 'AI Backend'       },
            { val: '∞',    label: 'Context Memory'   },
          ].map((s, i) => (
            <div key={s.label} style={{
              flex: 1, padding: '0.9rem 0.5rem', textAlign: 'center',
              borderRight: i < 3 ? '1px solid rgba(0,150,255,0.12)' : 'none',
            }}>
              <div style={{ color: '#00c8ff', fontSize: '1.2rem', fontWeight: 700 }}>{s.val}</div>
              <div style={{ color: 'rgba(100,170,255,0.4)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes blink {
          0%,100% { opacity: 1; box-shadow: 0 0 6px #00c8ff; }
          50%      { opacity: 0.2; box-shadow: none; }
        }
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 300% center; }
        }
        @keyframes ringPulse {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.03); }
        }
      `}</style>
    </div>
  )
}

export default LandingPage