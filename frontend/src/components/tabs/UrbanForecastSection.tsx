import React from 'react';
import { motion } from 'framer-motion';
import UrbanAgentRunner from './UrbanAgentRunner';
import UrbanAlerts from './UrbanAlerts'

interface UrbanForecastSectionProps {
  onForecastSuccess?: () => void;
}

const UrbanForecastSection = ({ onForecastSuccess }: UrbanForecastSectionProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="h-full flex flex-col"
    >
      {/* Urban Agent Runner Section */}
      <div className="flex-shrink-0 space-y-2 mb-4">
        <UrbanAgentRunner onSuccess={onForecastSuccess} />
      </div>

      {/* Urban Alerts Section */}
      <div className="flex-1 min-h-0 space-y-2">
        <div className="h-full overflow-y-auto">
          <UrbanAlerts />
        </div>
      </div>
    </motion.div>
  );
};

export default UrbanForecastSection;
