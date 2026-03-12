'use client'
import { motion } from 'framer-motion'

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#0a0a0a] overflow-hidden pointer-events-none">
      {/* Subtle Noise / Grid Pattern for a premium tech feel */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Subtle Glowing Orbs (Premium Glassmorphism Style) */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-[#a90432] blur-[150px] mix-blend-screen"
      />
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.08, 0.12, 0.08],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#fdb913] blur-[160px] mix-blend-screen"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.08, 0.05],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-zinc-700 blur-[200px] mix-blend-screen"
      />

      {/* Dark vignette gradient for focus */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#050505]/80" />
    </div>
  )
}
