import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import FeedCard from './tabs/FeedCard';
import SubmitForm from './tabs/SubmitForm';
import PulseSection from './tabs/PulseSection';
import ThemeToggle from './ThemeToggle';
import { Activity, Send, Zap } from 'lucide-react';

interface ControlPanelProps {
  onTabChange?: (tab: string) => void;
}

const ControlPanel = ({ onTabChange }: ControlPanelProps) => {
  const [activeTab, setActiveTab] = useState('feed');
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
  };

  const handleAgentSuccess = () => {
    // Stay on pulse tab when agent completes
    setActiveTab('pulse');
    
    // Show success toast
    toast({
      title: "✅ New alerts have been added!",
      description: "The agent has successfully generated new city alerts.",
      duration: 4000,
    });
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <Card className="w-80 bg-background/95 backdrop-blur-sm shadow-strong border border-border/50 overflow-hidden">
      <div className="p-4 border-b border-border/30 flex items-center justify-between relative z-10">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Control Center
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Monitor and manage city updates
          </p>
        </div>
        <div className="relative z-20">
          <ThemeToggle />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mx-4 mt-3 mb-0 bg-secondary/30 border border-border/20 w-[calc(100%-2rem)] grid grid-cols-3">
          <TabsTrigger 
            value="feed" 
            className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-soft text-xs"
          >
            <Activity className="h-3 w-3" />
            Feed
          </TabsTrigger>
          <TabsTrigger 
            value="submit" 
            className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-soft text-xs"
          >
            <Send className="h-3 w-3" />
            Submit
          </TabsTrigger>
          <TabsTrigger 
            value="pulse" 
            className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-soft text-xs"
          >
            <Zap className="h-3 w-3" />
            PULSE
          </TabsTrigger>
        </TabsList>

        <div className={`p-4 ${activeTab === 'submit' ? 'h-[500px] overflow-hidden' : activeTab === 'pulse' ? 'h-[600px] overflow-hidden' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={activeTab === 'submit' || activeTab === 'pulse' ? 'h-full' : ''}
            >
              <TabsContent value="feed" className="mt-0">
                <FeedCard />
              </TabsContent>
              <TabsContent value="submit" className="mt-0 h-full">
                <SubmitForm />
              </TabsContent>
              <TabsContent value="pulse" className="mt-0 h-full">
                <PulseSection onAgentSuccess={handleAgentSuccess} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </Card>
  );
};

export default ControlPanel;