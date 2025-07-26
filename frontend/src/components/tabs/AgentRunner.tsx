import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle, Loader2, Database, Zap, Upload } from 'lucide-react';

interface AgentStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  icon: React.ReactNode;
}

interface AgentRunnerProps {
  onAlertsGenerated?: () => void;
  onSuccess?: () => void;
}

const AgentRunner = ({ onAlertsGenerated, onSuccess }: AgentRunnerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<AgentStep[]>([
    { id: '1', name: 'Fetch Firebase Data', status: 'pending', icon: <Database className="h-4 w-4" /> },
    { id: '2', name: 'Generate with AI', status: 'pending', icon: <Zap className="h-4 w-4" /> },
    { id: '3', name: 'Store Alerts', status: 'pending', icon: <Upload className="h-4 w-4" /> },
    { id: '4', name: 'Complete', status: 'pending', icon: <CheckCircle className="h-4 w-4" /> }
  ]);

  const runAgent = async () => {
    setIsRunning(true);
    setCurrentStep(-1);
    setError(null);
    setResult(null);
    
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));

    try {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'running' : index < i ? 'completed' : 'pending'
        })));

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (i === 1) {
          try {
            const response = await fetch('http://localhost:5000/api/start-agent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
              throw new Error(data.message || 'Agent failed to run');
            }

            setResult(data);
            onAlertsGenerated?.(); // Notify parent
          } catch (apiError: any) {
            console.error('Agent API error:', apiError);
            setError(apiError.message || 'Failed to run agent');
            setSteps(prev => prev.map((step, index) => ({
              ...step,
              status: index >= i ? 'error' : 'completed'
            })));
            setIsRunning(false);
            return;
          }
        }
      }

      // Finalize all steps
      setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));
      
      // Trigger success callback after a brief delay to show completion
      setTimeout(() => {
        onSuccess?.();
      }, 500);
    } catch (err: any) {
      console.error('Agent execution error:', err);
      setError(err.message || 'Agent execution failed');
    } finally {
      setIsRunning(false);
      setCurrentStep(-1);
    }
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

  const progress = (steps.filter(s => s.status === 'completed').length / steps.length) * 100;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
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
        {isRunning ? 'Running Agent...' : 'Start PULSE'}
      </Button>

      {/* {progress === 100 && !isRunning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-center space-x-2 text-sm text-green-800 dark:text-green-200">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Agent completed successfully!</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-300 mt-1">
            {result?.alerts_generated || 0} alerts generated and stored.
          </p>
        </motion.div>
      )} */}

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="text-sm text-red-800 dark:text-red-200">
            <strong>Error:</strong> {error}
          </div>
        </motion.div>
      )}

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
              {step.status === 'running' ? 'Running' : step.status === 'completed' ? 'Done' : 'Pending'}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AgentRunner;
