import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FeedTab from './tabs/FeedTab';
import SubmitForm from './tabs/SubmitForm';
import AgentRunner from './tabs/AgentRunner';
import { Activity, Send, Zap } from 'lucide-react';

const SidePanel = () => {
  const [activeTab, setActiveTab] = useState('feed');

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <Card className="h-full bg-gradient-surface shadow-medium border-0 overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Control Center
        </h2>
        <p className="text-sm text-muted-foreground">
          Monitor, submit, and control your operations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="mx-6 mt-4 bg-secondary/50 border border-border/30">
          <TabsTrigger value="feed" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-soft">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Feed</span>
          </TabsTrigger>
          <TabsTrigger value="submit" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-soft">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Submit</span>
          </TabsTrigger>
          <TabsTrigger value="agent" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-soft">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Agent</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 px-6 pb-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full"
            >
              <TabsContent value="feed" className="h-full mt-4 data-[state=active]:h-full">
                <FeedTab />
              </TabsContent>
              <TabsContent value="submit" className="h-full mt-4 data-[state=active]:h-full">
                <SubmitForm />
              </TabsContent>
              <TabsContent value="agent" className="h-full mt-4 data-[state=active]:h-full">
                <AgentRunner />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </Card>
  );
};

export default SidePanel;