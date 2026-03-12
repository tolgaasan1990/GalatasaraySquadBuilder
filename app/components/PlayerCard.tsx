import { useDraggable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { Player, useLineupStore } from '@/store/useLineupStore'
import { useRef } from 'react'

interface PlayerCardProps {
  player: Player
  isPlaced?: boolean
  isOverlay?: boolean
}

const positionColors: Record<string, string> = {
  GK: '#f59e0b',
  CB: '#3b82f6',
  RB: '#3b82f6',
  LB: '#3b82f6',
  CDM: '#10b981',
  CM: '#10b981',
  CAM: '#10b981',
  LW: '#ef4444',
  RW: '#ef4444',
  LM: '#ef4444',
  RM: '#ef4444',
  ST: '#ef4444',
}

function getInitials(name: string) {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function getPositionColor(position: string) {
  return positionColors[position] || '#6b7280'
}

export default function PlayerCard({ player, isPlaced, isOverlay }: PlayerCardProps) {
  const selectedPlayer = useLineupStore((s) => s.selectedPlayer)
  const selectPlayer = useLineupStore((s) => s.selectPlayer)

  // We assign a different ID to the hook if it's an overlay to avoid collision,
  // but we won't even use the ref/listeners if isOverlay is true.
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: isOverlay ? `${player.id}-overlay` : player.id,
    data: { player }
  })

  const mouseDownPos = useRef<{ x: number; y: number } | null>(null)

  const style: React.CSSProperties = {
    ...(transform && !isOverlay ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {}),
    touchAction: isOverlay ? 'none' : 'pan-y',
  }

  const posColor = getPositionColor(player.position)
  const isSelected = selectedPlayer?.id === player.id

  const handlePointerDown = (e: React.PointerEvent) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY }
    // Call dnd-kit's onPointerDown
    if (listeners?.onPointerDown) {
      (listeners.onPointerDown as any)(e)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPlaced || isOverlay) return
    if (mouseDownPos.current) {
      const dx = Math.abs(e.clientX - mouseDownPos.current.x)
      const dy = Math.abs(e.clientY - mouseDownPos.current.y)
      if (dx < 5 && dy < 5) {
        if (isSelected) selectPlayer(null)
        else selectPlayer(player)
      }
    }
    mouseDownPos.current = null
  }

  const mergedListeners = {
    ...listeners,
    onPointerDown: handlePointerDown,
  }

  // If this is the original card being dragged, we fade it out since DragOverlay takes over.
  const isOriginalBeingDragged = isDragging && !isOverlay

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      {...(isOverlay ? {} : mergedListeners)}
      {...(isOverlay ? {} : attributes)}
      onPointerUp={isOverlay ? undefined : handlePointerUp}
      className={`relative group select-none ${isOverlay ? 'cursor-grabbing z-[100] scale-[1.05] shadow-2xl opacity-100' : 'cursor-grab active:cursor-grabbing'}
        ${isOriginalBeingDragged ? 'opacity-40' : 'z-10'}
        ${isPlaced ? '' : `p-3 rounded-xl flex items-center mb-2 border ${
          (isDragging || isOverlay) ? 'transition-none' : 'transition-all duration-200'
        } ${
          isSelected 
            ? 'bg-[#a90432]/20 border-[#a90432] shadow-lg shadow-[#a90432]/20 ring-1 ring-[#a90432]/50' 
            : 'bg-zinc-900/80 border-zinc-700/40 hover:border-[#fdb913]/40 hover:bg-zinc-800/60'
        }`}
      `}
    >
      <div
        className={`${isPlaced ? 'flex flex-col items-center hover:scale-110' : 'flex items-center w-full hover:scale-[1.02]'} ${(isDragging || isOverlay) ? 'transition-none' : 'transition-transform duration-200 ease-out'} will-change-transform`}
      >
        {/* Avatar */}
        <div className={`
          relative overflow-hidden rounded-full flex items-center justify-center font-black
          ${isPlaced 
            ? 'w-14 h-14 text-sm border-[3px] shadow-[0_0_20px_rgba(253,185,19,0.5)]' 
            : 'w-10 h-10 text-xs border-2'
          }
        `}
        style={{
          backgroundColor: isSelected ? '#a90432' : isPlaced ? '#a90432' : `${posColor}20`,
          borderColor: isPlaced ? '#fdb913' : isSelected ? '#fdb913' : `${posColor}80`,
          color: isSelected || isPlaced ? '#fff' : posColor,
        }}
        >
          {player.photo ? (
            <img src={`/api/image-proxy?url=${encodeURIComponent(player.photo)}`} alt={player.name} className="object-cover object-top w-full h-full scale-125 pointer-events-none" />
          ) : (
            <span>{getInitials(player.name)}</span>
          )}
        </div>
        
        {isPlaced ? (
          <div className="mt-1 flex flex-col items-center bg-gradient-to-b from-black/80 to-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 shadow-xl pointer-events-none">
            <span className="text-[10px] font-bold text-white whitespace-nowrap leading-tight">{player.name}</span>
            <span className="text-[9px] font-black leading-none" style={{ color: '#fdb913' }}>{player.number}</span>
          </div>
        ) : (
          <div className="ml-3 flex flex-col flex-1 justify-center pointer-events-none">
             <div className="flex justify-between items-center w-full">
                <span className="font-bold text-sm text-zinc-100 leading-tight">{player.name}</span>
                <span className="text-xs font-black rounded-md px-1.5 py-0.5" style={{ color: isSelected ? '#fdb913' : posColor }}>{player.number}</span>
             </div>
             <div className="flex items-center mt-0.5">
               <span 
                 className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                 style={{ backgroundColor: `${posColor}15`, color: posColor }}
               >
                 {player.position}
               </span>
               {isSelected && (
                 <span className="ml-2 text-[9px] text-[#fdb913] font-bold animate-pulse">← Pozisyon seç</span>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
