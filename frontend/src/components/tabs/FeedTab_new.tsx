import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, AlertTriangle, MessageSquare, Newspaper, ExternalLink, RefreshCw, Pause, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
}

const FeedTab = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [visibleItems, setVisibleItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [currentStartIndex, setCurrentStartIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const VISIBLE_CARDS = 3; // Number of cards to show at once
  const ROTATION_INTERVAL = 5000; // 5 seconds

  // Fetch data from Firebase collections
  const fetchFeedData = async () => {
    try {
      const collections = [
        'btp_traffic_news',
        'reddit_reports', 
        'citizen_matters_articles'
      ];

      const allData: FeedItem[] = [];

      for (const collection of collections) {
        try {
          const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/${collection}.json`);
          if (response.ok) {
            const data = await response.json();
            if (data) {
              const items = Object.values(data) as FeedItem[];
              allData.push(...items);
            }
          }
        } catch (error) {
          console.error(`Error fetching ${collection}:`, error);
        }
      }

      // Sort by timestamp (most recent first)
      allData.sort((a, b) => {
        const timeA = new Date(a.scraped_at || a.timestamp || 0).getTime();
        const timeB = new Date(b.scraped_at || b.timestamp || 0).getTime();
        return timeB - timeA;
      });

      setFeedItems(allData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feed data:', error);
      setLoading(false);
    }
  };

  // Update visible items based on current start index
  useEffect(() => {
    if (feedItems.length > 0) {
      const newVisibleItems = [];
      for (let i = 0; i < VISIBLE_CARDS; i++) {
        const index = (currentStartIndex + i) % feedItems.length;
        newVisibleItems.push(feedItems[index]);
      }
      setVisibleItems(newVisibleItems);
    }
  }, [feedItems, currentStartIndex]);

  // Auto-rotation logic
  useEffect(() => {
    if (isAutoPlaying && feedItems.length > VISIBLE_CARDS) {
      intervalRef.current = setInterval(() => {
        setCurrentStartIndex((prev) => (prev + 1) % feedItems.length);
      }, ROTATION_INTERVAL);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, feedItems.length]);

  useEffect(() => {
    fetchFeedData();
    // Refresh data every 30 seconds
    const dataInterval = setInterval(fetchFeedData, 30000);
    return () => clearInterval(dataInterval);
  }, []);

  const getCardIcon = (item: FeedItem) => {
    if (item.source_script === 'reddit_reports') {
      return <MessageSquare className="h-3 w-3" />;
    } else if (item.source_script === 'citizen_matters_articles') {
      return <Newspaper className="h-3 w-3" />;
    } else {
      return <AlertTriangle className="h-3 w-3" />;
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
      return 'Traffic News';
    } else if (item.source_script === 'reddit_reports') {
      return item.type?.charAt(0).toUpperCase() + item.type?.slice(1) || 'Report';
    } else if (item.source_script === 'citizen_matters_articles') {
      return 'News Article';
    }
    return 'Update';
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleCardClick = (item: FeedItem) => {
    const link = item.article_link || item.link;
    if (link) {
      window.open(link, '_blank');
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-surface rounded-lg border border-border/30 p-4 shadow-soft animate-pulse"
          >
            <div className="h-4 bg-muted rounded w-20 mb-3"></div>
            <div className="h-3 bg-muted rounded w-full mb-2"></div>
            <div className="h-3 bg-muted rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (feedItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        <div className="bg-gradient-surface rounded-lg border border-border/30 p-4 shadow-soft text-center">
          <p className="text-sm text-muted-foreground">No feed data available</p>
          <p className="text-xs text-muted-foreground mt-1">Check back later for updates</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFeedData}
            className="mt-3 h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAutoPlay}
            className="h-6 px-2 text-xs"
          >
            {isAutoPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchFeedData}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          {feedItems.length} updates
        </div>
      </div>

      {/* Feed Cards */}
      <div className="space-y-3 max-h-[400px] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {visibleItems.map((item, index) => (
            <motion.div
              key={`${item.unique_id}-${currentStartIndex}`}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                transition: { 
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: "easeOut"
                }
              }}
              exit={{ 
                opacity: 0, 
                x: -100, 
                scale: 0.9,
                transition: { 
                  duration: 0.3,
                  ease: "easeIn"
                }
              }}
              layout
              className={`bg-gradient-surface rounded-lg border border-border/30 p-3 shadow-soft cursor-pointer hover:shadow-md transition-all duration-200 hover:border-accent/50 ${
                item.article_link || item.link ? 'hover:bg-accent/5' : ''
              }`}
              onClick={() => handleCardClick(item)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between mb-2">
                <Badge variant={getBadgeVariant(item)} className="text-xs flex items-center gap-1">
                  {getCardIcon(item)}
                  {getBadgeText(item)}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {getTimeAgo(item.scraped_at || item.timestamp || '')}
                </div>
              </div>
              
              <h3 className="text-sm font-medium text-foreground mb-2 leading-relaxed line-clamp-2">
                {item.title || 'Update'}
              </h3>
              
              {item.description && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                  {item.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                {item.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{item.location}</span>
                  </div>
                )}
                
                {(item.article_link || item.link) && (
                  <motion.div 
                    className="flex items-center gap-1 text-xs text-accent hover:text-accent-foreground"
                    whileHover={{ scale: 1.05 }}
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>View</span>
                  </motion.div>
                )}
              </div>

              {item.author && (
                <div className="mt-2 pt-2 border-t border-border/20">
                  <p className="text-xs text-muted-foreground">
                    By {item.author}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      {feedItems.length > VISIBLE_CARDS && (
        <div className="flex justify-center gap-1 mt-3">
          <div className="flex items-center gap-1">
            {[...Array(Math.min(feedItems.length, 10))].map((_, index) => {
              const isActive = index >= currentStartIndex && index < currentStartIndex + VISIBLE_CARDS;
              return (
                <motion.div
                  key={index}
                  className={`w-1 h-1 rounded-full transition-all duration-200 ${
                    isActive ? 'bg-accent w-3' : 'bg-muted-foreground/30'
                  }`}
                  animate={{ 
                    scale: isActive ? 1.2 : 1,
                    width: isActive ? 12 : 4
                  }}
                />
              );
            })}
            {feedItems.length > 10 && (
              <span className="text-xs text-muted-foreground ml-2">
                +{feedItems.length - 10}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Auto-play indicator */}
      {isAutoPlaying && feedItems.length > VISIBLE_CARDS && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-full px-2 py-1">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-2 h-2 border border-accent border-t-transparent rounded-full"
            />
            Auto-rotating
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FeedTab;
