import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle, Loader2 } from 'lucide-react';

interface AgentStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed';
}

const AgentRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [steps, setSteps] = useState<AgentStep[]>([
    { id: '1', name: 'Analyze', status: 'pending' },
    { id: '2', name: 'Retrieve', status: 'pending' },
    { id: '3', name: 'Predict', status: 'pending' },
    { id: '4', name: 'Complete', status: 'pending' }
  ]);

  const runAgent = async () => {
    setIsRunning(true);
    setCurrentStep(-1);
    
    // Reset all steps
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      // Set current step to running
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === i ? 'running' : index < i ? 'completed' : 'pending'
      })));
      
      // Wait for step duration
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mark step as completed
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index <= i ? 'completed' : 'pending'
      })));
    }
    
    setIsRunning(false);
    setCurrentStep(-1);
  };

  const getStepIcon = (step: AgentStep) => {
    switch (step.status) {
      case 'running':
        return <Loader2 className="h-3 w-3 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      default:
        return <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />;
    }
  };

  const progress = ((steps.filter(s => s.status === 'completed').length) / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">
            {isRunning ? `Running step ${currentStep + 1}` : 'Agent ready'}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        
        <Progress value={progress} className="h-1.5" />
      </div>

      <Button
        onClick={runAgent}
        disabled={isRunning}
        size="sm"
        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-xs h-8"
      >
        <Play className="h-3 w-3 mr-1" />
        {isRunning ? 'Running Agent...' : 'Start Agent'}
      </Button>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-2 rounded border transition-all text-xs ${
              step.status === 'running' 
                ? 'bg-primary/5 border-primary/20' 
                : step.status === 'completed'
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                : 'bg-background/30 border-border/20'
            }`}
          >
            <div className="flex items-center gap-2">
              {getStepIcon(step)}
              <span className="font-medium">{step.name}</span>
            </div>
            
            <Badge 
              variant={step.status === 'completed' ? 'default' : 'outline'} 
              className="text-[10px] h-4 px-1.5"
            >
              {step.status === 'running' ? 'Running' : 
               step.status === 'completed' ? 'Done' : 'Pending'}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AgentRunner;