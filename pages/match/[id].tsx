import { useRouter } from 'next/router'
import Head from 'next/head'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, pointerWithin, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core'
import { ArrowLeft, Save, Share, Trash2 } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import PlayerCard from '@/app/components/PlayerCard'
import { useLineupStore, Player } from '@/store/useLineupStore'
import fixturesData from '@/data/fixtures.json'
import squadData from '@/data/squad.json'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as htmlToImage from 'html-to-image'

const Pitch3D = dynamic(() => import('@/app/components/Pitch3D'), { ssr: false })
const AnimatedBackground = dynamic(() => import('@/app/components/AnimatedBackground'), { ssr: false })

export default function MatchLineup() {
  const router = useRouter()
  const { id } = router.query
  const match = fixturesData.find((f) => f.id === id)

  const placements = useLineupStore((state) => state.placements)
  const placePlayer = useLineupStore((state) => state.placePlayer)
  const clearLineup = useLineupStore((state) => state.clearLineup)

  const [isClient, setIsClient] = useState(false)
  const [activePlayer, setActivePlayer] = useState<Player | null>(null)
  
  const pitchRef = useRef<HTMLDivElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showMatchInfo, setShowMatchInfo] = useState(false)

  const handleSave = async () => {
    if (!pitchRef.current || isProcessing) return
    setIsProcessing(true)
    try {
      // Adding a small delay to ensure canvas is fully rendered if needed
      await new Promise(res => setTimeout(res, 100))
      const dataUrl = await htmlToImage.toJpeg(pitchRef.current, { quality: 0.9, backgroundColor: '#0d0d18' })
      const link = document.createElement('a')
      link.download = `Galatasaray-Kadro-${match?.opponent || 'Mac'}.jpg`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Kaydetme hatası:', err)
      alert('Kadro kaydedilirken bir hata oluştu.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShare = async (platform?: 'whatsapp' | 'x') => {
    if (!pitchRef.current || isProcessing) return
    setIsProcessing(true)
    try {
      await new Promise(res => setTimeout(res, 100))
      
      const shareText = `İşte benim Galatasaray - ${match?.opponent} maç kadrosu tahminim! 🦁🟡🔴\n\nSen de kendi kadronu kur: https://lineup.galatasaray.org (Örnek Proje)`

      if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
        // Native Share on Mobile
        try {
          const blob = await htmlToImage.toBlob(pitchRef.current, { backgroundColor: '#0d0d18' })
          if (blob) {
            const file = new File([blob], 'kadro.jpg', { type: 'image/jpeg' })
            await navigator.share({
              title: 'Galatasaray Kadro',
              text: shareText,
              files: [file]
            })
            setIsProcessing(false)
            setShowShareMenu(false)
            return
          }
        } catch (e: any) {
          if (e.name !== 'AbortError') {
             console.log('Web Share API error:', e)
          } else {
             setIsProcessing(false)
             return
          }
        }
      }

      // Fallback for Desktop or if file share fails
      const dataUrl = await htmlToImage.toJpeg(pitchRef.current, { quality: 0.8, backgroundColor: '#0d0d18' })
      const encodedText = encodeURIComponent(shareText)
      
      if (platform === 'whatsapp') {
         window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank')
      } else if (platform === 'x') {
         window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank')
      } else {
         // Auto-download as last resort
         const link = document.createElement('a')
         link.download = `Galatasaray-Kadro-${match?.opponent || 'Mac'}.jpg`
         link.href = dataUrl
         link.click()
         alert('Kadro resmi indirildi! Şimdi istediğiniz platformda paylaşabilirsiniz.')
      }

    } catch (err) {
      console.error('Paylaşım hatası:', err)
      alert('Paylaşım sırasında bir hata oluştu.')
    } finally {
      setIsProcessing(false)
      setShowShareMenu(false)
    }
  }

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 8 },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  })
  const sensors = useSensors(mouseSensor, touchSensor)
  
  useEffect(() => {
    setIsClient(true)
    clearLineup()
    return () => clearLineup()
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const player = event.active.data.current?.player
    if (player) {
      setActivePlayer(player)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActivePlayer(null)
    const { active, over } = event
    
    if (over && over.id) {
      const positionId = String(over.id)
      const player = active.data.current?.player
      
      if (player) {
         placePlayer(positionId, player)
      }
    }
  }

  // Filter players that are already placed
  const placedPlayerIds = Object.values(placements).map(p => p?.id)
  const availablePlayers = squadData.filter(p => !placedPlayerIds.includes(p.id))

  if (!match) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold">Match not found</div>

  return (
    <div className="min-h-screen text-white selection:bg-[#a90432]/30 selection:text-white pb-32">
      <Head>
        <title>Galatasaray vs {match.opponent} Lineup</title>
      </Head>

      <AnimatedBackground />
      
      {/* Top Navbar */}
      <nav className="bg-[#111115]/80 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-800 shadow-xl">
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
           <Link href="/">
             <motion.button whileHover={{ x: -4 }} className="flex items-center space-x-1 sm:space-x-2 text-zinc-400 hover:text-white transition-colors group">
               <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1" />
               <span className="font-medium hidden sm:block">Geri</span>
             </motion.button>
           </Link>
           
           <div className="flex items-center space-x-2 sm:space-x-4 max-w-[50%] sm:max-w-none relative">
              <motion.button 
                onClick={() => setShowMatchInfo(!showMatchInfo)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-2 sm:space-x-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border transition-all ${showMatchInfo ? 'bg-zinc-800 border-[#fdb913]/30 shadow-lg' : 'border-transparent hover:bg-zinc-800/50'}`}
              >
                {match.home ? (
                  <>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Galatasaray_Sports_Club_Logo.png/1200px-Galatasaray_Sports_Club_Logo.png" alt="GS" className="w-6 h-6 sm:w-10 sm:h-10" />
                    <span className="text-[#a90432] font-black text-sm sm:text-lg truncate hidden md:block uppercase tracking-tighter">Galatasaray</span>
                    <span className="text-zinc-500 font-black px-1 sm:px-2 text-xs sm:text-sm italic">VS</span>
                    <span className="text-zinc-200 font-black text-sm sm:text-lg truncate hidden md:block uppercase tracking-tighter">{match.opponent}</span>
                    <img src={match.opponentLogo} alt={match.opponent} className="w-6 h-6 sm:w-10 sm:h-10 object-contain" />
                  </>
                ) : (
                  <>
                    <img src={match.opponentLogo} alt={match.opponent} className="w-6 h-6 sm:w-10 sm:h-10 object-contain" />
                    <span className="text-zinc-200 font-black text-sm sm:text-lg truncate hidden md:block uppercase tracking-tighter">{match.opponent}</span>
                    <span className="text-zinc-500 font-black px-1 sm:px-2 text-xs sm:text-sm italic">VS</span>
                    <span className="text-[#a90432] font-black text-sm sm:text-lg truncate hidden md:block uppercase tracking-tighter">Galatasaray</span>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Galatasaray_Sports_Club_Logo.png/1200px-Galatasaray_Sports_Club_Logo.png" alt="GS" className="w-6 h-6 sm:w-10 sm:h-10" />
                  </>
                )}
              </motion.button>

              <AnimatePresence>
                {showMatchInfo && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMatchInfo(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[280px] sm:w-[320px] bg-[#111115] border border-zinc-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 z-50 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#a90432] via-[#fdb913] to-[#a90432]" />
                      
                      <h4 className="text-[#fdb913] font-black text-xs tracking-[0.2em] uppercase mb-5">Maç Detayları</h4>
                      
                      {(match as any).note && (
                        <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                          <span className="text-amber-400 text-[10px] font-bold uppercase leading-none italic block mb-1">Önemli Not</span>
                          <span className="text-amber-200/80 text-[11px] font-medium leading-tight block">{(match as any).note}</span>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="border-l-2 border-zinc-800 pl-3">
                          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Turnuva</p>
                          <p className="font-black text-sm text-zinc-100">{match.competition}</p>
                          {(match as any).matchweek && (
                            <p className="text-zinc-500 text-xs font-semibold mt-0.5">{(match as any).matchweek}. Hafta</p>
                          )}
                          {(match as any).round && (
                            <p className="text-[#fdb913] text-[11px] font-black uppercase mt-1 tracking-wider">{(match as any).round}</p>
                          )}
                        </div>

                        <div className="border-l-2 border-zinc-800 pl-3">
                          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Tarih & Saat</p>
                          <div className="flex items-baseline space-x-2">
                            <p className="font-black text-sm text-zinc-100">{match.date}</p>
                            <p className="text-zinc-400 text-xs font-bold">{match.time}</p>
                          </div>
                        </div>

                        {(match as any).stadium && (
                          <div className="border-l-2 border-zinc-800 pl-3">
                            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Stadyum</p>
                            <p className="font-black text-sm text-zinc-100">{(match as any).stadium}</p>
                          </div>
                        )}

                        <div className="border-l-2 border-zinc-800 pl-3">
                           <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Yayıncı</p>
                           <p className="font-black text-sm text-zinc-100">{(match as any).broadcaster || 'beIN Sports'}</p>
                        </div>

                        {(match as any).firstLegResult && (
                          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-3 py-3 mt-2">
                            <p className="text-emerald-500/60 text-[10px] uppercase font-bold tracking-widest mb-1">İlk Maç Sonucu</p>
                            <p className="font-black text-lg text-emerald-400 tabular-nums">{((match as any).firstLegResult)}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
           </div>

           <div className="flex items-center space-x-2 sm:space-x-3 relative">
             <div className="relative">
               <motion.button 
                 onClick={() => setShowShareMenu(!showShareMenu)}
                 disabled={isProcessing}
                 whileHover={{ scale: 1.05 }} 
                 whileTap={{ scale: 0.95 }} 
                 className={`p-2 sm:p-2.5 rounded-full transition-colors border ${showShareMenu ? 'bg-zinc-700 text-[#fdb913] border-[#fdb913]/50' : 'bg-zinc-800 text-white hover:bg-zinc-700 hover:text-[#fdb913] border-zinc-700'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                  <Share className="w-4 h-4 sm:w-5 sm:h-5" />
               </motion.button>

               <AnimatePresence>
                 {showShareMenu && (
                   <>
                     <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.9, y: 10 }}
                       animate={{ opacity: 1, scale: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.9, y: 10 }}
                       className="absolute right-0 top-full mt-3 w-40 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-2 flex flex-col space-y-1 z-50 origin-top-right"
                     >
                        <button onClick={() => handleShare('whatsapp')} className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-left text-zinc-300 hover:text-white hover:bg-[#25D366]/20 rounded-lg transition-colors group">
                           <div className="w-6 h-6 rounded bg-[#25D366] flex items-center justify-center text-white"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></div>
                           <span>WhatsApp</span>
                        </button>
                        <button onClick={() => handleShare('x')} className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-left text-zinc-300 hover:text-white hover:bg-black/40 rounded-lg transition-colors group">
                           <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-white"><svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></div>
                           <span>X (Twitter)</span>
                        </button>
                     </motion.div>
                   </>
                 )}
               </AnimatePresence>
             </div>
             
             <motion.button 
                onClick={handleSave} 
                disabled={isProcessing}
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                className={`bg-gradient-to-r from-[#a90432] to-[#c21445] text-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full font-bold text-xs sm:text-base shadow-lg shadow-[#a90432]/30 flex items-center space-x-2 ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
             >
                {isProcessing ? (
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                   <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="hidden sm:block shadow-sm">
                  {isProcessing ? 'Kaydediliyor...' : 'Kaydet'}
                </span>
              </motion.button>
           </div>
         </div>
      </nav>

      {/* Main Content */}
      {isClient && (
        <DndContext 
          sensors={sensors} 
          collisionDetection={pointerWithin} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActivePlayer(null)}
        >
          <div className="max-w-[1400px] mx-auto px-2 sm:px-4 lg:px-6 pt-6 sm:pt-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
              
              {/* Left Panel: Player List */}
              <div className="lg:col-span-3 order-2 lg:order-1 pt-2 sm:pt-4" id="player-list-section">
                <div className="sm:sticky sm:top-28 bg-[#0d0d18] rounded-2xl border border-zinc-800/50 h-[50vh] sm:h-[75vh] min-h-[350px] overflow-y-auto overflow-x-hidden custom-scroll shadow-2xl overscroll-contain flex flex-col" style={{ WebkitOverflowScrolling: 'touch' }}>
                   
                   {/* Sticky Header Box */}
                   <div className="sticky top-0 bg-[#0d0d18] z-30 pt-4 sm:pt-5 px-4 sm:px-5 pb-4 border-b border-zinc-800/80 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] flex-shrink-0">
                     <div className="flex justify-between items-center mb-1">
                       <h3 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center">
                         Kadro
                       </h3>
                       <div className="flex items-center space-x-3">
                         <button onClick={() => {
                           window.scrollTo({ top: 0, behavior: 'smooth' })
                         }} className="text-[10px] text-[#fdb913] hover:text-white transition-colors font-bold uppercase tracking-wider block lg:hidden">
                           Sahaya Dön ↑
                         </button>
                         <button onClick={() => clearLineup()} className="text-[10px] text-zinc-500 hover:text-[#a90432] transition-colors font-bold uppercase tracking-wider">
                           Temizle
                         </button>
                       </div>
                     </div>
                   </div>
                   
                   {/* Scrollable Player Area */}
                   <div className="flex-1 px-4 sm:px-5 pt-3 pb-6 space-y-1 custom-scroll">
                      {availablePlayers.length === 0 ? (
                        <div className="text-center text-zinc-500 text-sm mt-10">Tüm oyuncular yerleştirildi.</div>
                      ) : (
                        availablePlayers.map((player) => (
                          <PlayerCard key={player.id} player={player} />
                        ))
                      )}
                   </div>
                </div>
              </div>

              {/* Center Panel: 3D Pitch */}
              <div className="lg:col-span-9 order-1 lg:order-2 flex justify-center w-full">
                <div 
                  ref={pitchRef} 
                  className="h-[60vh] sm:h-[75vh] min-h-[500px] sm:min-h-[650px] max-h-[85vh] rounded-2xl relative flex-shrink-0"
                  style={{ backgroundColor: '#0d0d18', aspectRatio: '2/3' }}
                >
                   <Pitch3D />
                </div>
              </div>

            </div>
          </div>
          
          <DragOverlay zIndex={99999} dropAnimation={null}>
            {activePlayer ? (
              <PlayerCard player={activePlayer} isOverlay={true} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

    </div>
  )
}
