import { useState, useEffect } from 'react'
import './App.css'
import platano from './platano.png'

const GANADOR = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
]

function calcularGanador(board) {
  for (const [a,b,c] of GANADOR) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a]
    }
  }
  return null
}

function sonidoClick() {
  const ctx = new AudioContext()
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.connect(g)
  g.connect(ctx.destination)
  o.frequency.value = 600
  g.gain.setValueAtTime(0.3, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
  o.start()
  o.stop(ctx.currentTime + 0.1)
}

function sonidoGanador() {
  const ctx = new AudioContext()

  // Trompeta fanfarria
  const notas = [392, 523, 659, 784, 1047]
  notas.forEach((freq, i) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'square'
    o.connect(g)
    g.connect(ctx.destination)
    o.frequency.value = freq
    g.gain.setValueAtTime(0.4, ctx.currentTime + i * 0.2)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.3)
    o.start(ctx.currentTime + i * 0.2)
    o.stop(ctx.currentTime + i * 0.2 + 0.3)
  })

  // Aplausos x5 oleadas
  ;[1.0, 1.3, 1.6, 1.9, 2.2].forEach(tiempo => {
    const buffer = ctx.createBuffer(2, ctx.sampleRate * 0.5, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < data.length; i++) {
        const env = Math.sin((i / data.length) * Math.PI)
        data[i] = (Math.random() * 2 - 1) * env * 0.8
      }
    }
    const ruido = ctx.createBufferSource()
    const filtro = ctx.createBiquadFilter()
    const filtro2 = ctx.createBiquadFilter()
    const gAp = ctx.createGain()
    filtro.type = 'bandpass'
    filtro.frequency.value = 1800
    filtro.Q.value = 0.5
    filtro2.type = 'highpass'
    filtro2.frequency.value = 800
    ruido.buffer = buffer
    ruido.connect(filtro)
    filtro.connect(filtro2)
    filtro2.connect(gAp)
    gAp.connect(ctx.destination)
    gAp.gain.setValueAtTime(0.8, ctx.currentTime + tiempo)
    gAp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + tiempo + 0.5)
    ruido.start(ctx.currentTime + tiempo)
  })

 
}

function App() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turno, setTurno] = useState('X')
  const [scores, setScores] = useState(() => {
    const guardado = localStorage.getItem('scores')
    return guardado ? JSON.parse(guardado) : { X: 0, O: 0 }
  })

  useEffect(() => {
    localStorage.setItem('scores', JSON.stringify(scores))
  }, [scores])

  const ganador = calcularGanador(board)
  const empate = !ganador && board.every(c => c !== null)

  function handleClick(index) {
    if (board[index] || ganador) return
    sonidoClick()
    const newBoard = [...board]
    newBoard[index] = turno
    setBoard(newBoard)
    const ganadorActual = calcularGanador(newBoard)
    if (ganadorActual) {
      sonidoGanador()
      setScores(prev => ({ ...prev, [ganadorActual]: prev[ganadorActual] + 1 }))
    } else {
      setTurno(turno === 'X' ? 'O' : 'X')
    }
  }

  function reiniciar() {
    setBoard(Array(9).fill(null))
    setTurno('X')
  }

  return (
    <div className="juego">
      <img src={platano} style={{width:'80px', position:'absolute', top:'10px', left:'-10px', transform:'rotate(15deg)', mixBlendMode:'multiply'}} />
      <img src={platano} style={{width:'80px', position:'absolute', top:'10px', right:'-10px', transform:'rotate(-15deg) scaleX(-1)', mixBlendMode:'multiply'}} />
      <img src={platano} style={{width:'80px', position:'absolute', bottom:'10px', left:'-10px', transform:'rotate(-15deg)', mixBlendMode:'multiply'}} />
      <img src={platano} style={{width:'80px', position:'absolute', bottom:'10px', right:'-10px', transform:'rotate(15deg) scaleX(-1)', mixBlendMode:'multiply'}} />

      <h1>Tres en Raya <img src="https://flagcdn.com/w40/do.png" style={{width:'32px', verticalAlign:'middle', borderRadius:'4px'}} /></h1>

      <div className="marcador">
        <span>Taíno (X): {scores.X}</span>
        <span>Caribe (O): {scores.O}</span>
      </div>

      {ganador && <p className="mensaje">🏆 ¡Ganó {ganador}! ¡Quisqueya forever!</p>}
      {empate && <p className="mensaje">🤝 ¡Empate quisqueyano!</p>}
      {!ganador && !empate && <p className="turno">Turno de: {turno}</p>}

      <div className="tablero">
        {board.map((valor, index) => (
          <button key={index} className="celda" onClick={() => handleClick(index)}>
            {valor}
          </button>
        ))}
      </div>

      <button className="btn-reiniciar" onClick={reiniciar}>🔄 Nueva Partida</button>
      <p className="footer">🌴 ¡Dominicanisimo! 🌴</p>
    </div>
  )
}

export default App