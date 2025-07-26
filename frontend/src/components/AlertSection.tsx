import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'urgent' | 'warning' | 'info';
  created_at?: string;
}

interface AlertSectionProps {
  className?: string;
}

const AlertSection: React.FC<AlertSectionProps> = ({ className = '' }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch alerts from Firebase
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

  // Auto-rotate alerts every 8 seconds
  useEffect(() => {
    if (alerts.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % alerts.length);
      }, 8000);
      
      return () => clearInterval(interval);
    }
  }, [alerts.length]);

  // Fetch alerts on component mount
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

  const getAlertColor = (type: string) => {
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
      <div className={`w-full ${className}`}>
        <Card className="border-2 border-dashed">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-muted-foreground">Loading alerts...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAlerts}
                className="text-red-600 border-red-200 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <Card className="border-2 border-dashed">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">No alerts available</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentAlert = alerts[currentIndex];

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">City Alerts</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} of {alerts.length}
          </span>
          {alerts.length > 1 && (
            <div className="flex space-x-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPrevious}
                className="h-6 w-6 p-0"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNext}
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Card className="transition-all duration-500 ease-in-out">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {getAlertIcon(currentAlert.type)}
              <Badge variant={getAlertColor(currentAlert.type) as any}>
                {currentAlert.type.toUpperCase()}
              </Badge>
            </div>
            {currentAlert.created_at && (
              <span className="text-xs text-muted-foreground">
                {new Date(currentAlert.created_at).toLocaleString()}
              </span>
            )}
          </div>
          <CardTitle className="text-base leading-tight">
            {currentAlert.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-sm leading-relaxed">
            {currentAlert.description}
          </CardDescription>
        </CardContent>
      </Card>
      
      {/* Progress indicator */}
      {alerts.length > 1 && (
        <div className="mt-2 flex space-x-1">
          {alerts.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-blue-600' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertSection;
