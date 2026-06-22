'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const AuroraBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen bg-[#0a0a14] overflow-hidden">
      {/* Animated Aurora Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 50, -50, 0],
            y: [0, 30, -30, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] mix-blend-screen"
        />
        <motion.div 
          animate={{ 
            x: [0, -60, 40, 0],
            y: [0, -40, 50, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div 
          animate={{ 
            x: [0, 30, -20, 0],
            y: [0, 60, -40, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[90px] mix-blend-screen -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Grid Pattern overlay for tech aesthetic */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};
