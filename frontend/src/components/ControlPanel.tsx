import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FeedCard from './tabs/FeedCard';
import SubmitForm from './tabs/SubmitForm';
import AgentRunner from './tabs/AgentRunner';
import { Activity, Send, Zap } from 'lucide-react';

const ControlPanel = () => {
  const [activeTab, setActiveTab] = useState('feed');

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <Card className="w-80 bg-background/95 backdrop-blur-sm shadow-strong border border-border/50 overflow-hidden">
      <div className="p-4 border-b border-border/30">
        <h2 className="text-lg font-semibold text-foreground">
          Control Center
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Monitor and manage city updates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mx-4 mt-3 mb-0 bg-secondary/30 border border-border/20 w-[calc(100%-2rem)]">
          <TabsTrigger 
            value="feed" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-soft text-xs"
          >
            <Activity className="h-3 w-3" />
            Feed
          </TabsTrigger>
          <TabsTrigger 
            value="submit" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-soft text-xs"
          >
            <Send className="h-3 w-3" />
            Submit
          </TabsTrigger>
          <TabsTrigger 
            value="agent" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-soft text-xs"
          >
            <Zap className="h-3 w-3" />
            Agent
          </TabsTrigger>
        </TabsList>

        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <TabsContent value="feed" className="mt-0">
                <FeedCard />
              </TabsContent>
              <TabsContent value="submit" className="mt-0">
                <SubmitForm />
              </TabsContent>
              <TabsContent value="agent" className="mt-0">
                <AgentRunner />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </Card>
  );
};

export default ControlPanel;