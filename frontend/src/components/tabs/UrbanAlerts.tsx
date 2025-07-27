import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, Info, AlertCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface Forecast {
  id: string;
  area: string;
  expected_effects: string;
  time_window: string;
  signal_type: 'traffic' | 'crowd' | 'public_service' | 'quiet';
  confidence: 'Low' | 'Medium' | 'High';
  created_at?: string;
  source?: string;
}

const UrbanForecasts = () => {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/forecasts');
      const data = await response.json();
      console.log(data)
      
      if (data.success && data.forecasts) {
        setForecasts(data.forecasts);
        setCurrentIndex(0); // Reset to first forecast
      } else {
        setError(data.message || 'Failed to fetch forecasts');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching forecasts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate forecasts every 5 seconds
  useEffect(() => {
    if (forecasts.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % forecasts.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [forecasts.length]);

  useEffect(() => {
    fetchForecasts();
  }, []);

  const getSignalIcon = (signal_type: string) => {
    switch (signal_type) {
      case 'traffic':
        return <AlertTriangle className="h-4 w-4" />;
      case 'crowd':
        return <AlertCircle className="h-4 w-4" />;
      case 'public_service':
        return <Info className="h-4 w-4" />;
      case 'quiet':
        return <Clock className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getSignalTypeColor = (signal_type: string) => {
    switch (signal_type) {
      case 'traffic':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'crowd':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'public_service':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'quiet':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? forecasts.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % forecasts.length);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Urban Forecasts</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchForecasts}
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
              <span className="text-xs text-muted-foreground">Loading forecasts...</span>
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
          <h3 className="text-sm font-medium text-foreground">Urban Forecasts</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchForecasts}
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

  if (forecasts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {/* <h3 className="text-sm font-medium text-foreground">Urban Forecasts</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchForecasts}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button> */}
        </div>
        <Card className="border-2 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">No forecasts available</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentForecast = forecasts[currentIndex];

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
            key={currentForecast.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Card className="w-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getSignalIcon(currentForecast.signal_type)}
                    <Badge variant={getConfidenceColor(currentForecast.confidence) as any} className="text-[10px] h-4 px-1.5">
                      {currentForecast.confidence}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                      {currentForecast.signal_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  {currentForecast.created_at && (
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(currentForecast.created_at).toLocaleString()}
                    </span>
                  )}
                </div>
                <CardTitle className="text-sm leading-tight">
                  {currentForecast.area}
                </CardTitle>
                {currentForecast.time_window && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{currentForecast.time_window}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentForecast.expected_effects}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation buttons */}
        {forecasts.length > 1 && (
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
      {forecasts.length > 1 && (
        <div className="flex space-x-1">
          {forecasts.map((_, index) => (
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

export default UrbanForecasts;
