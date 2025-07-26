import React from 'react';
import { motion } from 'framer-motion';
import FeedCard from './FeedCard';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

const FeedTab = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Tab Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 pb-3 border-b border-border/20"
      >
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Live Activity Feed</h3>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          Live
        </Badge>
      </motion.div>

      {/* Feed Content - Full Height */}
      <div className="flex-1 min-h-0">
        <FeedCard />
      </div>
    </div>
  );
};

export default FeedTab;