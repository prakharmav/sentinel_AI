"use client";

import React from 'react';
import { EmergencySOS, ScamScanner } from '@/components/citizen';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function CitizenHomePage() {
  return (
    <div className="p-4 sm:p-6 space-y-6 pt-6">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <EmergencySOS />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <ScamScanner />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-surface-container rounded-3xl p-6 border border-outline/10 shadow-sm"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Nearest Station
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">
              Central Precinct - 1.2 miles away
            </p>
          </div>
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <span className="font-bold text-sm">3 min</span>
          </div>
        </div>

        <div className="h-32 bg-surface rounded-xl overflow-hidden relative border border-outline/10 flex items-center justify-center group cursor-pointer">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity group-hover:opacity-60"
            style={{ backgroundImage: "url('/images/map-mockup.png')" }} 
          />
          <div className="z-10 bg-surface/80 backdrop-blur-sm p-3 rounded-full">
            <Navigation className="h-6 w-6 text-primary" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-on-surface-variant opacity-30">
            Map Placeholder
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button variant="outline" className="w-full">Call Desk</Button>
          <Button className="w-full">Directions</Button>
        </div>
      </motion.div>
      
    </div>
  );
}
