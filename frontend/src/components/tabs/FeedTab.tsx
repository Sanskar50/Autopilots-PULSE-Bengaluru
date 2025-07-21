import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'location' | 'user' | 'alert' | 'success';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

const FeedTab = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([
    {
      id: '1',
      type: 'location',
      title: 'New Location Data',
      description: 'GPS coordinates updated for Site Alpha',
      timestamp: '2 minutes ago',
      priority: 'medium'
    },
    {
      id: '2',
      type: 'alert',
      title: 'System Alert',
      description: 'Temperature threshold exceeded in Zone 3',
      timestamp: '5 minutes ago',
      priority: 'high'
    },
    {
      id: '3',
      type: 'success',
      title: 'Task Completed',
      description: 'Data synchronization finished successfully',
      timestamp: '8 minutes ago',
      priority: 'low'
    },
    {
      id: '4',
      type: 'user',
      title: 'User Activity',
      description: 'Agent Johnson logged into the system',
      timestamp: '12 minutes ago',
      priority: 'low'
    }
  ]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const newItem: FeedItem = {
        id: Date.now().toString(),
        type: ['location', 'user', 'alert', 'success'][Math.floor(Math.random() * 4)] as any,
        title: 'Real-time Update',
        description: 'Simulated live data feed entry',
        timestamp: 'Just now',
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any
      };

      setFeedItems(prev => [newItem, ...prev.slice(0, 9)]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Live Activity Feed</h3>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {feedItems.length} items
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {feedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-background border border-border/50 shadow-soft hover:shadow-medium transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm leading-tight">{item.title}</h4>
                    <Badge variant={getPriorityColor(item.priority) as any} className="text-xs shrink-0">
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.timestamp}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FeedTab;