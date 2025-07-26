import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, Info, AlertCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'urgent' | 'warning' | 'info';
  created_at?: string;
}

const CityAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/alerts');
      const data = await response.json();
      
      if (data.success && data.alerts) {
        setAlerts(data.alerts);
        setCurrentIndex(0); // Reset to first alert
      } else {
        setError(data.message || 'Failed to fetch alerts');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate alerts every 5 seconds
  useEffect(() => {
    if (alerts.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % alerts.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [alerts.length]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? alerts.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % alerts.length);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">City Alerts</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAlerts}
            disabled={loading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3 animate-spin" />
          </Button>
        </div>
        <Card className="border-2 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-xs text-muted-foreground">Loading alerts...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">City Alerts</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAlerts}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-800 dark:text-red-200">{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {/* <h3 className="text-sm font-medium text-foreground">City Alerts</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAlerts}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button> */}
        </div>
        <Card className="border-2 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">No alerts available</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentAlert = alerts[currentIndex];

  return (
    <div className="space-y-4">
      {/* <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">City Alerts</h3>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-muted-foreground">
            {currentIndex + 1}/{alerts.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAlerts}
            disabled={loading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div> */}
      
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAlert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Card className="w-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getAlertIcon(currentAlert.type)}
                    <Badge variant={getSeverityColor(currentAlert.type) as any} className="text-[10px] h-4 px-1.5">
                      {currentAlert.type.toUpperCase()}
                    </Badge>
                  </div>
                  {currentAlert.created_at && (
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(currentAlert.created_at).toLocaleString()}
                    </span>
                  )}
                </div>
                <CardTitle className="text-sm leading-tight">
                  {currentAlert.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentAlert.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation buttons */}
        {alerts.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 h-6 w-6 p-0 bg-background/80 hover:bg-background"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 h-6 w-6 p-0 bg-background/80 hover:bg-background"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
      
      {/* Progress indicator */}
      {alerts.length > 1 && (
        <div className="flex space-x-1">
          {alerts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-blue-600' 
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CityAlerts;
