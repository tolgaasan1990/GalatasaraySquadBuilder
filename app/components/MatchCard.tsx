import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, MapPin } from 'lucide-react'
import { useState } from 'react'

interface MatchCardProps {
  id: string
  opponent: string
  opponentLogo: string
  date: string
  time: string
  home: boolean
  competition: string
}

const GS_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Galatasaray_Sports_Club_Logo.png/1200px-Galatasaray_Sports_Club_Logo.png"

// Team colors for fallback badges
const teamColors: Record<string, string> = {
  'Başakşehir': '#f97316',
  'Liverpool': '#c8102e',
  'Göztepe': '#fbbf24',
  'Trabzonspor': '#6c1d45',
  'Kocaelispor': '#16a34a',
  'Gençlerbirliği': '#dc2626',
  'Fenerbahçe': '#1e3a5f',
  'Samsunspor': '#e31e24',
  'Antalyaspor': '#c8102e',
  'Kasımpaşa': '#1a237e',
}

function CompBadge({ competition }: { competition: string }) {
  const isChampionsLeague = competition.includes('Şampiyonlar') || competition.includes('Champions')
  const isCup = competition.includes('Kupa')
  
  let badgeStyle = 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50' // Süper Lig
  if (isChampionsLeague) badgeStyle = 'bg-blue-950/60 text-blue-300 border-blue-700/50'
  else if (isCup) badgeStyle = 'bg-amber-950/60 text-amber-300 border-amber-700/50'
  
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${badgeStyle}`}>
      {competition}
    </span>
  )
}

function TeamLogo({ src, name, className }: { src: string; name: string; className?: string }) {
  const [error, setError] = useState(false)
  const bgColor = teamColors[name] || '#6b7280'
  
  if (error || !src) {
    // Fallback: colored badge with team initials
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    return (
      <div 
        className={`flex items-center justify-center rounded-full font-black text-white text-lg shadow-lg ${className}`}
        style={{ backgroundColor: bgColor, width: 56, height: 56 }}
      >
        {initials}
      </div>
    )
  }
  
  return (
    <img 
      src={src} 
      alt={name} 
      onError={() => setError(true)}
      className={`object-contain drop-shadow-lg ${className}`}
    />
  )
}

export default function MatchCard({ id, opponent, opponentLogo, date, time, home, competition, ...rest }: MatchCardProps & Record<string, any>) {
  const note = rest.note as string | undefined
  const stadium = rest.stadium as string | undefined
  return (
    <Link href={`/match/${id}`} prefetch={true}>
      <div
        className="relative bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/60 rounded-2xl p-6 cursor-pointer overflow-hidden group shadow-xl hover:shadow-2xl hover:shadow-[#a90432]/10 hover:border-[#a90432]/40 hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 ease-out will-change-transform"
      >
        {/* Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#a90432]/0 via-[#a90432]/5 to-[#fdb913]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#a90432]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Competition Badge */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <CompBadge competition={competition} />
          <div className="flex items-center space-x-2 text-zinc-500 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-medium">{date}</span>
            <span className="text-zinc-600">•</span>
            <span className="font-medium">{time}</span>
            {note && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-amber-400 font-bold">⚠ {note}</span>
              </>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between relative z-10">
          {/* Home Team */}
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className="relative shrink-0 group-hover:scale-110 transition-transform duration-300">
              <TeamLogo 
                src={home ? GS_LOGO : opponentLogo} 
                name={home ? 'Galatasaray' : opponent} 
                className="w-10 h-10 sm:w-14 sm:h-14"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`font-bold text-sm sm:text-lg leading-tight truncate ${home ? 'text-white' : 'text-zinc-300'}`} title={home ? 'Galatasaray' : opponent}>
                {home ? 'Galatasaray' : opponent}
              </span>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5 flex items-center shrink-0">
                <MapPin className="w-2.5 h-2.5 mr-1" /> İç Saha
              </span>
            </div>
          </div>

          {/* VS */}
          <div className="mx-2 sm:mx-4 shrink-0 flex flex-col items-center">
            <div className="bg-zinc-800/80 w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center border border-zinc-700/50 shadow-inner group-hover:bg-[#a90432]/20 group-hover:border-[#a90432]/30 transition-all duration-300">
              <span className="text-zinc-400 font-black text-xs sm:text-sm group-hover:text-[#fdb913] transition-colors">VS</span>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 justify-end min-w-0">
            <div className="flex flex-col items-end min-w-0">
              <span className={`font-bold text-sm sm:text-lg leading-tight truncate w-full text-right ${!home ? 'text-white' : 'text-zinc-300'}`} title={home ? opponent : 'Galatasaray'}>
                {home ? opponent : 'Galatasaray'}
              </span>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5 flex items-center shrink-0">
                <MapPin className="w-2.5 h-2.5 mr-1" /> Deplasman
              </span>
            </div>
            <div className="relative shrink-0 group-hover:scale-110 transition-transform duration-300">
              <TeamLogo 
                src={home ? opponentLogo : GS_LOGO} 
                name={home ? opponent : 'Galatasaray'}
                className="w-10 h-10 sm:w-14 sm:h-14" 
              />
            </div>
          </div>
        </div>

        {/* Bottom Action Hint */}
        <div className="mt-5 flex items-center justify-between relative z-10">
          {stadium && (
            <span className="text-[10px] text-zinc-600 tracking-wide font-medium">🏟 {stadium}</span>
          )}
          <span className="text-[11px] text-zinc-600 group-hover:text-[#fdb913] tracking-wide transition-colors duration-300 font-medium ml-auto">
            Kadro tahmini yap →
          </span>
        </div>
      </div>
    </Link>
  )
}
