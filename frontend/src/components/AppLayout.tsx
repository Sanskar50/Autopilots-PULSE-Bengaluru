import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, MapPin } from 'lucide-react';
import MapView from './MapContainer';
import ControlPanel from './ControlPanel';

const AppLayout = () => {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <div className="min-h-screen bg-gradient-secondary overflow-hidden">
      {/* Professional Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-12 z-40"
      >
        <Card className="bg-background/95 backdrop-blur-sm shadow-strong border border-border/50">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none">
                  PULSE BENGALURU
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-medium">
                    Real-time City Intelligence
                  </p>
                  <Badge variant="outline" className="text-xs bg-primary/5">
                    Live
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

       {/* Main Layout */}
      <div className="h-screen relative">
        {/* Map in background */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute inset-0 z-0"
        >
          <MapView />
        </motion.div>

        {/* Floating Control Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-6 right-6 z-50"
        >
          <ControlPanel onTabChange={setActiveTab} />
        </motion.div>
      </div>


    </div>
  );
};

export default AppLayout;