import Head from 'next/head'
import MatchCard from '@/app/components/MatchCard'
import fixturesData from '@/data/fixtures.json'
import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import dynamic from 'next/dynamic'

const AnimatedBackground = dynamic(() => import('@/app/components/AnimatedBackground'), { ssr: false })

const GS_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Galatasaray_Sports_Club_Logo.png/1200px-Galatasaray_Sports_Club_Logo.png"

export default function Home() {
  return (
    <div className="min-h-screen text-white selection:bg-[#a90432]/30 selection:text-white">
      <Head>
        <title>Galatasaray Lineup Builder</title>
        <meta name="description" content="Galatasaray'ın yaklaşan maçları için kadro tahmini oluştur" />
      </Head>

      {/* 3D Animated Background */}
      <AnimatedBackground />

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20 relative z-10">
        
        {/* Header */}
        <header className="mb-14 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center bg-zinc-900/80 border border-zinc-800 rounded-full p-4 mb-8 shadow-xl backdrop-blur-md"
          >
           <img src={GS_LOGO} alt="GS" className="w-12 h-12" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-5"
          >
            <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">Kadro Tahmini</span>
            <br/>
            <span className="text-[#a90432] drop-shadow-[0_0_20px_rgba(169,4,50,0.4)]">Galatasaray</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 text-base max-w-md mx-auto leading-relaxed"
          >
            Maç seç, formasyon belirle, oyuncuları sahaya yerleştir.
          </motion.p>
        </header>

        {/* Fixtures */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-3 mb-6 border-b border-zinc-800/60 pb-4"
          >
             <CalendarDays className="text-[#fdb913] w-5 h-5" />
             <h2 className="text-lg font-bold tracking-wide">Yaklaşan Maçlar</h2>
             <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-medium">{fixturesData.length}</span>
          </motion.div>
          
          <div className="flex flex-col space-y-4">
            {fixturesData.map((fixture, index) => (
               <motion.div
                 key={fixture.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.35 + index * 0.07 }}
               >
                 <MatchCard {...fixture} />
               </motion.div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
