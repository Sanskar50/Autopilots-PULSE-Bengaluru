import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, AlertTriangle, MessageSquare, Newspaper, ExternalLink, Car, Droplets, Zap, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Firebase configuration
const FIREBASE_CONFIG = {
  databaseURL: 'https://pulse-bengaluru-2933b-default-rtdb.firebaseio.com/'
};

interface FeedItem {
  unique_id: string;
  title?: string;
  description?: string;
  location?: string;
  type?: string;
  scraped_at: string;
  source_script: string;
  date?: string;
  timestamp?: string;
  article_link?: string;
  link?: string;
  author?: string;
  post_id?: string;
  source?: string;
  post_url?: string;
  comment_url?: string;
}

const FeedCard = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const AUTO_SCROLL_INTERVAL = 6000; // 6 seconds

  // Shuffle array function
  const shuffleArray = (array: FeedItem[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch data from Firebase collections
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const collections = ['btp_traffic_news', 'reddit_reports', 'citizen_matters_articles'];
      const allData: FeedItem[] = [];

      for (const collection of collections) {
        try {
          const response = await fetch(`${FIREBASE_CONFIG.databaseURL}${collection}.json`);
          if (response.ok) {
            const data = await response.json();
            if (data) {
              const items = Object.values(data) as FeedItem[];
              // Add source_script to each item if not present
              const itemsWithSource = items.map(item => ({
                ...item,
                source_script: item.source_script || collection
              }));
              allData.push(...itemsWithSource);
            }
          }
        } catch (error) {
          console.error(`Error fetching ${collection}:`, error);
        }
      }

      if (allData.length > 0) {
        const shuffledData = shuffleArray(allData);
        setFeedItems(shuffledData);
        setCurrentIndex(0);
      } else {
        setError('No data available');
      }
    } catch (error) {
      console.error('Error fetching feed data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-rotate feed items
  useEffect(() => {
    if (feedItems.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % feedItems.length);
      }, AUTO_SCROLL_INTERVAL);
      
      return () => clearInterval(interval);
    }
  }, [feedItems.length]);

  const getCardIcon = (item: FeedItem) => {
    if (item.source_script === 'reddit_reports') {
      switch (item.type) {
        case 'traffic': return <Car className="h-4 w-4" />;
        case 'flood': return <Droplets className="h-4 w-4" />;
        case 'outage': return <Zap className="h-4 w-4" />;
        default: return <MessageSquare className="h-4 w-4" />;
      }
    } else if (item.source_script === 'citizen_matters_articles') {
      return <Newspaper className="h-4 w-4" />;
    } else {
      return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (item: FeedItem) => {
    if (item.type === 'traffic' || item.source_script === 'btp_traffic_news') {
      return 'destructive';
    } else if (item.type === 'flood') {
      return 'secondary';
    } else if (item.type === 'outage') {
      return 'outline';
    } else {
      return 'default';
    }
  };

  const getBadgeText = (item: FeedItem) => {
    if (item.source_script === 'btp_traffic_news') {
      return 'Traffic Alert';
    } else if (item.source_script === 'reddit_reports') {
      return 'Reddit';
    } else if (item.source_script === 'citizen_matters_articles') {
      return 'News';
    }
    return 'Update';
  };

  const formatTimestamp = (item: FeedItem) => {
    const timestamp = item.scraped_at || item.timestamp || item.date;
    if (!timestamp) return 'Unknown time';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return 'Unknown time';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getItemTitle = (item: FeedItem) => {
    return item.title || truncateText(item.description || 'No title available', 50);
  };

  const getItemDescription = (item: FeedItem) => {
    if (item.title && item.description) {
      return truncateText(item.description, 100);
    } else if (item.description) {
      return truncateText(item.description, 100);
    }
    return 'No description available';
  };

  const getItemLink = (item: FeedItem) => {
    return item.article_link || item.link || item.post_url || item.comment_url;
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? feedItems.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % feedItems.length);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">City Feed</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
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
              <span className="text-xs text-muted-foreground">Loading feed...</span>
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
          <h3 className="text-sm font-medium text-foreground">City Feed</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
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

  if (feedItems.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">City Feed</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
        <Card className="border-2 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">No feed items available</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentItem = feedItems[currentIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">City Feed</h3>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-muted-foreground">
            {currentIndex + 1}/{feedItems.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.unique_id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Card className="w-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getCardIcon(currentItem)}
                    <Badge variant={getBadgeVariant(currentItem) as any} className="text-[10px] h-4 px-1.5">
                      {getBadgeText(currentItem)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimestamp(currentItem)}</span>
                  </div>
                </div>
                <CardTitle className="text-sm leading-tight">
                  {getItemTitle(currentItem)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {getItemDescription(currentItem)}
                </p>
                
                {currentItem.location && (
                  <div className="flex items-center space-x-1 text-[10px] text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />
                    <span>{currentItem.location}</span>
                  </div>
                )}
                
                {getItemLink(currentItem) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => window.open(getItemLink(currentItem), '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Source
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation buttons */}
        {feedItems.length > 1 && (
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
      {feedItems.length > 1 && (
        <div className="flex space-x-1">
          {feedItems.slice(0, Math.min(10, feedItems.length)).map((_, index) => (
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
          {feedItems.length > 10 && (
            <span className="text-[10px] text-muted-foreground self-center">
              +{feedItems.length - 10}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedCard;
