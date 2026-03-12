import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { useLineupStore, Player } from '@/store/useLineupStore'
import formationsData from '@/data/formations.json'
import PlayerCard from './PlayerCard'

// ─── 3D Pitch Surface (Canvas texture) ──────────────────────────
function PitchSurface() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 3072
    const ctx = canvas.getContext('2d')!

    // Rich grass gradient base
    const grassGradient = ctx.createLinearGradient(0, 0, 0, 3072)
    grassGradient.addColorStop(0, '#1a6b25')
    grassGradient.addColorStop(0.5, '#1e7d2e')
    grassGradient.addColorStop(1, '#1a6b25')
    ctx.fillStyle = grassGradient
    ctx.fillRect(0, 0, 2048, 3072)

    // Realistic grass stripes with subtle color variation
    for (let i = 0; i < 48; i++) {
      const isDark = i % 2 === 0
      ctx.fillStyle = isDark ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)'
      ctx.fillRect(0, i * 64, 2048, 64)
    }

    // Subtle grass texture noise
    for (let i = 0; i < 20000; i++) {
      const x = Math.random() * 2048
      const y = Math.random() * 3072
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'}, ${Math.random() * 0.03})`
      ctx.fillRect(x, y, 1, 1)
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'

    // Outer boundary
    const bx = 80, by = 80, bw = 2048 - 160, bh = 3072 - 160
    ctx.strokeRect(bx, by, bw, bh)

    // Center line
    ctx.beginPath()
    ctx.moveTo(bx, 1536)
    ctx.lineTo(bx + bw, 1536)
    ctx.stroke()

    // Center circle
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(1024, 1536, 240, 0, Math.PI * 2)
    ctx.stroke()

    // Center dot
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.beginPath()
    ctx.arc(1024, 1536, 10, 0, Math.PI * 2)
    ctx.fill()

    // Top penalty area
    ctx.lineWidth = 5
    ctx.strokeRect(524, by, 1000, 420)
    ctx.strokeRect(724, by, 600, 160)
    ctx.beginPath()
    ctx.arc(1024, 500, 190, 0.2 * Math.PI, 0.8 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(1024, 370, 8, 0, Math.PI * 2)
    ctx.fill()

    // Bottom penalty area
    ctx.strokeRect(524, 3072 - by - 420, 1000, 420)
    ctx.strokeRect(724, 3072 - by - 160, 600, 160)
    ctx.beginPath()
    ctx.arc(1024, 3072 - 500, 190, 1.2 * Math.PI, 1.8 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(1024, 3072 - 370, 8, 0, Math.PI * 2)
    ctx.fill()

    // Corner arcs
    const cr = 40
    ctx.lineWidth = 4
    ;[[bx,by,0,Math.PI/2],[bx+bw,by,Math.PI/2,Math.PI],[bx,by+bh,-Math.PI/2,0],[bx+bw,by+bh,Math.PI,1.5*Math.PI]].forEach(([x,y,s,e])=>{
      ctx.beginPath()
      ctx.arc(x as number,y as number,cr,s as number,e as number)
      ctx.stroke()
    })

    const tex = new THREE.CanvasTexture(canvas)
    tex.anisotropy = 16
    return tex
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[22, 33]} />
      <meshStandardMaterial map={texture} roughness={0.85} metalness={0.05} />
    </mesh>
  )
}

// ─── Goal Posts ──────────────────────────────────────────────────
function GoalPost({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const gw = 4, gh = 1.4, pr = 0.07
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[-gw/2, gh/2, 0]} castShadow>
        <cylinderGeometry args={[pr, pr, gh, 12]} />
        <meshStandardMaterial color="#fff" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[gw/2, gh/2, 0]} castShadow>
        <cylinderGeometry args={[pr, pr, gh, 12]} />
        <meshStandardMaterial color="#fff" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, gh, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[pr, pr, gw, 12]} />
        <meshStandardMaterial color="#fff" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Net back */}
      <mesh position={[0, gh / 2, -1]}>
        <planeGeometry args={[gw, gh]} />
        <meshStandardMaterial color="#ccc" transparent opacity={0.08} side={THREE.DoubleSide} wireframe />
      </mesh>
      {/* Net sides */}
      <mesh position={[-gw/2, gh/2, -0.5]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[1, gh]} />
        <meshStandardMaterial color="#ccc" transparent opacity={0.06} side={THREE.DoubleSide} wireframe />
      </mesh>
      <mesh position={[gw/2, gh/2, -0.5]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[1, gh]} />
        <meshStandardMaterial color="#ccc" transparent opacity={0.06} side={THREE.DoubleSide} wireframe />
      </mesh>
    </group>
  )
}

// ─── Stadium Lights ─────────────────────────────────────────────
function StadiumLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.08, 0.12, 10, 6]} />
        <meshStandardMaterial color="#222" metalness={0.95} roughness={0.2} />
      </mesh>
      <pointLight intensity={40} distance={50} color="#ffebd6" position={[0, 5, 0]} castShadow />
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[1.2, 0.3, 0.8]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={3} />
      </mesh>
    </group>
  )
}

// ─── Floating Particles ──────────────────────────────────────────
function FloatingParticles() {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(300 * 3)
    for (let i = 0; i < 300; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 50
      arr[i * 3 + 1] = Math.random() * 20 + 3
      arr[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return arr
  }, [])
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.015 })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#fdb913" transparent opacity={0.3} sizeAttenuation />
    </points>
  )
}

// ─── Position Overlay (HTML, works with dnd-kit) ─────────────────
function PositionSpot({ id, label, x, y }: { id: string; label: string; x: number; y: number }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const placements = useLineupStore((s) => s.placements)
  const removePlayer = useLineupStore((s) => s.removePlayer)
  const placePlayer = useLineupStore((s) => s.placePlayer)
  const selectedPlayer = useLineupStore((s) => s.selectedPlayer)
  const selectPlayer = useLineupStore((s) => s.selectPlayer)
  const player = placements[id]

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    // Use getState to get latest values (avoids closure issues)
    const state = useLineupStore.getState()
    const currentSelected = state.selectedPlayer
    const currentPlayer = state.placements[id]
    
    console.log('[PositionSpot] Click', id, { currentSelected: currentSelected?.name, currentPlayer: currentPlayer?.name })
    
    if (currentPlayer) {
      removePlayer(id)
      return
    }
    if (currentSelected) {
      console.log('[PositionSpot] Placing', currentSelected.name, 'at', id)
      placePlayer(id, currentSelected)
    }
  }

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer"
      style={{ left: `${x}%`, top: `${y}%`, width: '90px', height: '90px', zIndex: player ? 20 : 10 }}
    >
      {player ? (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="relative"
          onClick={(e) => { e.stopPropagation(); removePlayer(id) }}
        >
          <PlayerCard player={player} isPlaced={true} />
        </motion.div>
      ) : (
        <div
          className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-300 ${
            isOver
              ? 'border-[#fdb913] bg-[#fdb913]/30 scale-125 shadow-[0_0_25px_rgba(253,185,19,0.6)]'
              : selectedPlayer
                ? 'border-[#a90432] bg-[#a90432]/20 scale-110 animate-pulse shadow-[0_0_15px_rgba(169,4,50,0.4)]'
                : 'border-white/30 bg-black/40 hover:border-white/60 hover:bg-black/50 hover:scale-110'
          }`}
        >
          <span className="text-[10px] text-white/70 font-bold tracking-wider">{label}</span>
        </div>
      )}
    </div>
  )
}

// ─── Main 3D Pitch Component ─────────────────────────────────────
import FormationSelector from './FormationSelector'

export default function Pitch3D() {
  const selectedFormation = useLineupStore((s) => s.selectedFormation)
  const formation = formationsData.find((f) => f.id === selectedFormation) || formationsData[0]

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-700/30 shadow-2xl shadow-black/60 relative">
      {/* 3D Canvas — visual only, no pointer events */}
      <div style={{ pointerEvents: 'none' }} className="absolute inset-0">
        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true, alpha: true }}
          camera={{ position: [0, 28, 14], fov: 42 }}
          style={{ background: 'linear-gradient(180deg, #050510 0%, #0a0a1a 40%, #111122 100%)' }}
        >
          <ambientLight intensity={0.35} />
          <directionalLight position={[12, 25, 12]} intensity={1.8} castShadow shadow-mapSize={2048} color="#fff5e0" />
          <directionalLight position={[-10, 20, -8]} intensity={0.4} color="#a0c4ff" />
          <hemisphereLight args={['#1a1a3e', '#0a1a0a', 0.3]} />

          <StadiumLight position={[-14, 0, -14]} />
          <StadiumLight position={[14, 0, -14]} />
          <StadiumLight position={[-14, 0, 14]} />
          <StadiumLight position={[14, 0, 14]} />

          <PitchSurface />
          <GoalPost position={[0, 0, -16.5]} rotation={[0, 0, 0]} />
          <GoalPost position={[0, 0, 16.5]} rotation={[0, Math.PI, 0]} />

          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <planeGeometry args={[80, 80]} />
            <meshStandardMaterial color="#060d06" />
          </mesh>

          <fog attach="fog" args={['#050510', 35, 65]} />
          <FloatingParticles />
        </Canvas>
      </div>

      {/* HTML Position overlay — on top of canvas */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        {/* Formation dropdown placed in top right */}
        <FormationSelector />
        {formation.positions.map((pos) => (
          <PositionSpot key={pos.id} id={pos.id} label={pos.label} x={pos.x} y={pos.y} />
        ))}
      </div>

      {/* Edge gradients */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#050510]/90 to-transparent pointer-events-none" style={{ zIndex: 8 }} />
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#050510]/90 to-transparent pointer-events-none" style={{ zIndex: 8 }} />
      <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-[#050510]/60 to-transparent pointer-events-none" style={{ zIndex: 8 }} />
      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[#050510]/60 to-transparent pointer-events-none" style={{ zIndex: 8 }} />
    </div>
  )
}
