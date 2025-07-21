import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const FeedCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="bg-gradient-surface rounded-lg border border-border/30 p-4 shadow-soft">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="destructive" className="text-xs">
            Traffic Alert
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            2m ago
          </div>
        </div>
        
        <h3 className="text-sm font-medium text-foreground mb-2">
          Heavy traffic on Outer Ring Road
        </h3>
        
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Significant congestion reported between Electronic City and Silk Board junction. 
          Expected delay: 15-20 minutes.
        </p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>Outer Ring Road, Electronic City</span>
        </div>
      </div>
    </motion.div>
  );
};

export default FeedCard;