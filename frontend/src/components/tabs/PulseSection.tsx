import React from 'react';
import { motion } from 'framer-motion';
import AgentRunner from './AgentRunner';
import CityAlerts from './CityAlerts';

interface PulseSectionProps {
  onAgentSuccess?: () => void;
}

const PulseSection = ({ onAgentSuccess }: PulseSectionProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="h-full flex flex-col"
    >
      {/* Agent Runner Section */}
      <div className="flex-shrink-0 space-y-2 mb-4">
        <AgentRunner onSuccess={onAgentSuccess} />
      </div>

      {/* City Alerts Section */}
      <div className="flex-1 min-h-0 space-y-2">
        <div className="h-full overflow-y-auto">
          <CityAlerts />
        </div>
      </div>
    </motion.div>
  );
};

export default PulseSection;
