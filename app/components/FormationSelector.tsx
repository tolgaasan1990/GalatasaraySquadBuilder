import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLineupStore } from '@/store/useLineupStore'
import formationsData from '@/data/formations.json'
import { ChevronDown } from 'lucide-react'

export default function FormationSelector() {
  const selectedFormation = useLineupStore((state) => state.selectedFormation)
  const setFormation = useLineupStore((state) => state.setFormation)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const currentFormationName = formationsData.find(f => f.id === selectedFormation)?.name || selectedFormation

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="absolute top-4 right-4 z-50" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-[#0d0d18]/90 backdrop-blur-md border border-zinc-700/50 shadow-2xl rounded-full px-4 sm:px-5 py-2.5 flex items-center space-x-2 sm:space-x-3 text-white hover:bg-[#1a1a2e] hover:border-zinc-500/50 transition-all pointer-events-auto"
      >
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 hidden sm:block">Diziliş:</span>
        <span className="text-xs sm:text-sm font-black text-[#fdb913] tracking-wide">{currentFormationName}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-3 w-40 sm:w-48 bg-[#0d0d18]/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl p-2 flex flex-col space-y-1 pointer-events-auto"
          >
            {formationsData.map((formation) => (
              <button
                key={formation.id}
                onClick={() => { setFormation(formation.id); setIsOpen(false) }}
                className={`px-3 sm:px-4 py-2.5 rounded-xl text-left font-medium transition-all flex items-center space-x-3 ${
                  selectedFormation === formation.id
                    ? 'bg-gradient-to-r from-[#a90432] to-[#c21445] text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${selectedFormation === formation.id ? 'bg-[#fdb913]' : 'bg-transparent'}`} />
                <span className="text-xs sm:text-sm">{formation.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
