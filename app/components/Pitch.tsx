import { useDroppable } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { useLineupStore } from '@/store/useLineupStore'
import formationsData from '@/data/formations.json'
import PlayerCard from './PlayerCard'

interface PositionSpotProps {
  id: string
  label: string
  x: number
  y: number
}

function PositionSpot({ id, label, x, y }: PositionSpotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })
  
  const placements = useLineupStore((state) => state.placements)
  const removePlayer = useLineupStore((state) => state.removePlayer)
  const player = placements[id]

  return (
    <div
      ref={setNodeRef}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: '64px',
        height: '64px',
      }}
    >
      <div 
        className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center relative
         ${isOver ? 'border-white bg-white/20 scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'border-white/30 bg-black/40'}
         transition-all duration-300
        `}
      >
        <span className="text-[10px] text-white/60 font-medium tracking-widest">{label}</span>
      </div>

      <AnimatePresence>
        {player && (
           <motion.div
             initial={{ scale: 0, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 0, opacity: 0 }}
             transition={{ type: "spring", stiffness: 300, damping: 20 }}
             className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-20 cursor-move"
             onClick={(e) => {
               e.stopPropagation()
               removePlayer(id)
             }}
           >
              <PlayerCard player={player} isPlaced={true} />
              
              <div className="absolute -top-1 -right-1 bg-red-600 w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 hover:opacity-100 transition-opacity border-2 border-zinc-900 cursor-pointer text-white shadow-lg">
                &times;
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Pitch() {
  const selectedFormation = useLineupStore((state) => state.selectedFormation)
  const formation = formationsData.find((f) => f.id === selectedFormation) || formationsData[0]

  return (
    <div className="pitch-container w-full max-w-2xl mx-auto aspect-[3/4] relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-[#fff] border-opacity-30">
      <div className="pitch-lines"></div>
      <div className="penalty-area-top"></div>
      <div className="penalty-area-bottom"></div>

      {formation.positions.map((pos) => (
        <PositionSpot key={pos.id} id={pos.id} label={pos.label} x={pos.x} y={pos.y} />
      ))}
    </div>
  )
}
