import React from 'react';
import { motion } from 'framer-motion';
import MapContainer from './MapContainer';
import ControlPanel from './ControlPanel';
import ThemeToggle from './ThemeToggle';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-secondary overflow-hidden">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-50 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              PULSE BENGALURU
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time city intelligence
            </p>
          </div>
          <ThemeToggle />
        </div>
      </motion.header>

      {/* Main Layout */}
      <div className="flex h-screen pt-20">
        {/* Map Section - 70% width, full height */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-[70%] h-full"
        >
          <MapContainer />
        </motion.div>

        {/* Floating Control Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-24 right-6 z-40"
        >
          <ControlPanel />
        </motion.div>
      </div>
    </div>
  );
};

export default AppLayout;