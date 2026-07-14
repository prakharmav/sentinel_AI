"use client";

import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function EmergencySOS() {
  const [activated, setActivated] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  // Simplified hold-to-activate logic for UI demo
  let pressTimer: NodeJS.Timeout;

  const handlePointerDown = () => {
    setIsPressing(true);
    pressTimer = setTimeout(() => {
      setActivated(true);
    }, 1500); // Hold for 1.5s
  };

  const handlePointerUp = () => {
    setIsPressing(false);
    clearTimeout(pressTimer);
  };

  return (
    <div className="bg-surface-container rounded-3xl p-6 relative overflow-hidden flex flex-col items-center shadow-lg border border-outline/10">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <ShieldAlert className="h-24 w-24 text-error" />
      </div>

      <div className="z-10 text-center mb-6">
        <h2 className="font-headline-sm font-bold text-error uppercase tracking-widest flex items-center gap-2 justify-center">
          <AlertTriangle className="h-5 w-5" />
          Emergency SOS
        </h2>
        <p className="text-on-surface-variant text-sm mt-2">
          Hold for 2 seconds to alert nearest patrol unit.
        </p>
      </div>

      <AnimatePresence>
        {!activated ? (
          <motion.div 
            initial={{ scale: 1 }}
            animate={{ scale: isPressing ? 0.9 : 1 }}
            className="z-10 relative flex items-center justify-center cursor-pointer select-none touch-none"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Outer pulse */}
            <div className="absolute w-40 h-40 bg-error/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
            {/* Inner button */}
            <div className="w-32 h-32 rounded-full bg-error flex items-center justify-center shadow-[0_0_30px_rgba(var(--color-error-rgb),0.5)] z-10 transition-transform">
              <span className="text-4xl font-bold text-white font-headline-lg">SOS</span>
            </div>
            
            {/* Progress ring when holding */}
            {isPressing && (
              <svg className="absolute w-36 h-36 -rotate-90 pointer-events-none">
                <circle 
                  cx="72" cy="72" r="68" 
                  stroke="white" strokeWidth="4" fill="none" 
                  strokeDasharray="427" 
                  strokeDashoffset="427"
                  className="animate-[dash_1.5s_linear_forwards]"
                />
              </svg>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-10 flex flex-col items-center bg-error/10 border border-error/30 p-6 rounded-2xl w-full"
          >
            <div className="w-16 h-16 rounded-full bg-error flex items-center justify-center mb-4 animate-bounce">
              <ShieldAlert className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-headline-sm font-bold text-error mb-2">SOS Activated</h3>
            <p className="text-sm text-center text-on-surface mb-4">
              Your location has been sent. Unit Charlie-7 is en route. ETA: 3 minutes.
            </p>
            <button 
              onClick={() => setActivated(false)}
              className="text-xs text-on-surface-variant underline hover:text-on-surface"
            >
              Cancel Request
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
