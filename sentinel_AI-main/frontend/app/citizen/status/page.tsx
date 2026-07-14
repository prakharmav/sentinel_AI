"use client";

import React, { useState } from 'react';
import { StatusTracker } from '@/components/citizen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CitizenStatusPage() {
  const [trackingId, setTrackingId] = useState('RPT-8422');
  const [searchedId, setSearchedId] = useState('RPT-8422');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!trackingId.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setSearchedId(trackingId);
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="p-4 sm:p-6 pt-6 flex flex-col h-full max-w-md mx-auto">
      
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-headline-md font-bold text-on-surface mb-2">Complaint Status</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Track the progress of your filed reports using the tracking ID provided during submission.
        </p>

        <div className="flex gap-2 mb-6">
          <Input 
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            placeholder="Enter Tracking ID (e.g. RPT-1234)" 
            className="bg-surface border-outline/20 flex-1 uppercase"
          />
          <Button onClick={handleSearch} disabled={isSearching} className="px-4">
            {isSearching ? (
              <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>
        </div>
      </motion.div>

      <motion.div
        key={searchedId}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <StatusTracker trackingId={searchedId} />
      </motion.div>

    </div>
  );
}
